import 'package:avatar_stack/positions.dart';
import 'package:flutter/material.dart';
import 'package:avatar_stack/avatar_stack.dart';
import 'package:pegasus/boxes.dart';

/// A helper class if you want a FloatingActionButton to be pinned in the FlexibleAppBar
class SliverFab extends StatefulWidget {
  ScrollController scrollController;

  bool scrollLocked = false;

  ///List of slivers placed in CustomScrollView
  final List<Widget> slivers;

  ///FloatingActionButton placed on the edge of FlexibleAppBar and rest of view
  final Widget floatingWidget;

  ///Expanded height of FlexibleAppBar
  final double expandedHeight;

  ///Number of pixels from top from which the [floatingWidget] should start shrinking.
  ///E.g. If your SliverAppBar is pinned, I would recommend this leaving as default 96.0
  ///     If you want [floatingActionButton] to shrink earlier, increase the value.
  final double topScalingEdge;

  ///Position of the widget.
  final FloatingPosition floatingPosition =
      FloatingPosition(top: -48, left: 16);

  SliverFab({
    required this.scrollController,
    required this.scrollLocked,
    required this.slivers,
    required this.floatingWidget,
    this.expandedHeight = 256.0,
    this.topScalingEdge = 96.0,
  }) {}

  @override
  State<StatefulWidget> createState() {
    return new SliverFabState();
  }
}

class SliverFabState extends State<SliverFab> {
  void refresh() {
    setState(() {});
  }

  @override
  void initState() {
    super.initState();
    widget.scrollController.addListener(refresh);
  }

  @override
  void dispose() {
    widget.scrollController.removeListener(refresh);
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: <Widget>[
        CustomScrollView(
          physics: widget.scrollLocked
          ? const NeverScrollableScrollPhysics()
          : const AlwaysScrollableScrollPhysics(),
          controller: widget.scrollController,
          slivers: widget.slivers,
        ),
        _buildFab(),
      ],
    );
  }

  Widget _buildFab() {
    final double defaultFabSize = 56.0;
    final double paddingTop = MediaQuery.of(context).padding.top;
    final double defaultTopMargin = widget.expandedHeight +
        paddingTop +
        (widget.floatingPosition.top ?? 0) -
        defaultFabSize / 2;

    final double scale0edge = widget.expandedHeight - kToolbarHeight;
    final double scale1edge = defaultTopMargin - widget.topScalingEdge;

    double top = defaultTopMargin;
    double scale = 1.0;
    if (widget.scrollController.hasClients) {
      double offset = widget.scrollController.offset;
      top -= offset > 0 ? offset : 0;
      if (offset < scale1edge) {
        scale = 1.0;
      } else if (offset > scale0edge) {
        scale = 0.0;
      } else {
        scale = (scale0edge - offset) / (scale0edge - scale1edge);
      }
    }

    return Positioned(
      top: top,
      left: widget.floatingPosition.left,
      child: new Transform(
        transform: new Matrix4.identity()..scale(scale, scale),
        alignment: Alignment.center,
        child: widget.floatingWidget,
      ),
    );
  }
}

///A class representing position of the widget.
///At least one value should be not null
class FloatingPosition {
  ///Can be negative. Represents how much should you change the default position.
  ///E.g. if your widget is bigger than normal [FloatingActionButton] by 20 pixels,
  ///you can set it to -10 to make it stick to the edge
  final double top;

  ///Margin from the left. Should be positive.
  ///The widget will stretch if both [right] and [left] are not nulls.
  final double left;

  const FloatingPosition({required this.top, required this.left});
}

class Board extends StatefulWidget {
  final Function() onWidgetSelect;

  const Board(
      {super.key, required this.onWidgetSelect});

  @override
  _BoardState createState() => _BoardState();
}

class _BoardState extends State<Board> {
  bool scrollLocked = false;
  late ScrollController scrollController;

  @override
  void initState() {
    super.initState();
    scrollController = ScrollController();
  }

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: <Widget>[
        SliverFab(
          scrollController: scrollController,
          scrollLocked: scrollLocked,
          floatingWidget: const Text(
            '😹',
            style: TextStyle(fontSize: 100),
          ),
          expandedHeight: 230.0,
          slivers: <Widget>[
            SliverAppBar(
              expandedHeight: 230.0,
              automaticallyImplyLeading: false,
              flexibleSpace: FlexibleSpaceBar(
                background: Image.network(
                    fit: BoxFit.cover,
                    'https://i.pinimg.com/564x/24/3c/da/243cda74c5280a2c442aebbc1e54028c.jpg'),
              ),
            ),
            SliverToBoxAdapter(
              child: Transform.translate(
                offset: Offset(MediaQuery.of(context).size.width - 128, 16),
                child: AvatarStack(
                  height: 40,
                  settings: RestrictedAmountPositions(minCoverage: 0.4),
                  avatars: [
                    for (var n = 0; n < 4; n++)
                      NetworkImage('https://i.pravatar.cc/150?img=$n',
                          scale: 0.5),
                  ],
                ),
              ),
            ),
            SliverToBoxAdapter(
              child: Transform.translate(
                offset: const Offset(24, 16),
                child: const Text(
                  'My Home',
                  style: TextStyle(fontSize: 25, fontWeight: FontWeight.bold),
                ),
              ),
            ),
            Boxes(
                changeScrollLock: (bool v) {
                  scrollLocked = v;
                  setState(() {});
                },
                onWidgetSelect: () {
                })
          ],
        ),
      ],
    );
  }
}
