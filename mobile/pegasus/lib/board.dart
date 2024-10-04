import 'dart:math';
import 'package:flutter/material.dart';

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

class Box {
  Widget? el;
  String key;
  double x;
  double y;
  double w;
  double h;
  Color color;
  double oldY;
  Offset offset;
  GlobalKey<State<StatefulWidget>>? globalKey;

  Box(
      {this.el,
      required this.key,
      required this.x,
      required this.y,
      required this.w,
      required this.h,
      required this.color,
      required this.oldY,
      required this.offset,
      this.globalKey});
}

Map<String, Box> boxes = {
  'red': Box(
      key: 'red',
      x: 0,
      y: 0,
      w: 150,
      h: 150,
      color: Color(0xFF334048AA),
      oldY: 0,
      offset: const Offset(0, 0)),
  'green': Box(
      key: 'green',
      x: 150,
      y: 0,
      w: 150,
      h: 150,
      color: Color(0xFF334048AA),
      oldY: 150,
      offset: const Offset(0, 150)),
  'post1': Box(
      key: 'post1',
      x: 0,
      y: 150,
      w: 300,
      h: 150,
      color: Color(0xFF334048AA),
      oldY: 300,
      offset: const Offset(0, 300)),
  'blue': Box(
      key: 'blue',
      x: 0,
      y: 300,
      w: 150,
      h: 150,
      color: Color(0xFF334048AA),
      oldY: 450,
      offset: const Offset(0, 450)),
  'red2': Box(
      key: 'red2',
      x: 150,
      y: 300,
      w: 150,
      h: 150,
      color: Color(0xFF334048AA),
      oldY: 600,
      offset: const Offset(0, 600)),
  'post2': Box(
      key: 'post2',
      x: 0,
      y: 450,
      w: 300,
      h: 150,
      color: Color(0xFF334048AA),
      oldY: 750,
      offset: const Offset(0, 750)),
  'green2': Box(
      key: 'green2',
      x: 0,
      y: 600,
      w: 150,
      h: 150,
      color: Color(0xFF334048AA),
      oldY: 900,
      offset: const Offset(0, 900)),
  'blue2': Box(
      key: 'blue2',
      x: 150,
      y: 600,
      w: 150,
      h: 150,
      color: Color(0xFF334048AA),
      oldY: 1050,
      offset: const Offset(0, 1050)),
};

String? dragging;
double mdX = 0, mdY = 0;
double x = 0, y = 0;

bool xColided(Box b1, Box b2) {
  return ((b1.x <= b2.x && b2.x < (b1.x + b1.w)) ||
      (b2.x <= b1.x && b1.x < (b2.x + b2.w)));
}

void measureFinal() {
  List<String> bs = boxes.keys.toList()
    ..sort((key1, key2) => (boxes[key1]!.y.compareTo(boxes[key2]!.y)));
  for (String k in bs) {
    Box box = boxes[k]!;
    double newY = 0;
    for (String k2 in bs) {
      if (k2 != k) {
        Box temp = boxes[k2]!;
        if (xColided(box, temp)) {
          if (temp.y <= box.y) {
            if (newY < (temp.y + temp.h)) {
              newY = (temp.y + temp.h);
            }
          }
        }
      }
    }
    box.y = newY >= 8 ? newY : 8;
  }
}

class Board extends StatefulWidget {
  final Function(bool) changeScrollLock;
  final Function() onWidgetSelect;

  const Board(
      {Key? key, required this.changeScrollLock, required this.onWidgetSelect})
      : super(key: key);

  @override
  _BoardState createState() => _BoardState();
}

extension GlobalKeyExtension on GlobalKey {
  Rect? get globalPaintBounds {
    final renderObject = currentContext?.findRenderObject();
    final translation = renderObject?.getTransformTo(null).getTranslation();
    if (translation != null && renderObject?.paintBounds != null) {
      final offset = Offset(translation.x, translation.y);
      return renderObject!.paintBounds.shift(offset);
    } else {
      return null;
    }
  }
}

class _BoardState extends State<Board> {
  double wid = 0;
  double hid = 0;
  double blockWidth = 0;
  double initialPosX = 0, initialPosY = 0, relPosX = -1, relPosY = -1;
  bool loaded = false; // Assuming loaded is a state variable
  bool scrollLocked = false;
  late ScrollController scrollController;

  @override
  void initState() {
    super.initState();
    scrollController = ScrollController();
  }

  @override
  Widget build(BuildContext context) {
    wid = MediaQuery.of(context).size.width;
    hid = MediaQuery.of(context).size.height;
    blockWidth = (wid - 8) / 2;
    if (!loaded) {
      loaded = true;
      boxes.forEach((k, box) {
        if (k != 'post1' && k != 'post2') {
          box.w = blockWidth;
          box.h = blockWidth;
          box.x =
              (boxes.keys.toList().indexOf(k) % 2 == 0) ? 4 : blockWidth + 4;
        } else {
          box.w = blockWidth * 2;
          box.h = blockWidth;
          box.x = 4;
        }
      });
      measureFinal();
    }

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
              child: SizedBox(
                width: wid,
                height: 56,
              ),
            ),
            SliverToBoxAdapter(
              child: Transform.translate(
                offset: const Offset(24, 0),
                child: const Text(
                  'My Home',
                  style: TextStyle(fontSize: 25, fontWeight: FontWeight.bold),
                ),
              ),
            ),
            SliverToBoxAdapter(
              child: Stack(
                children: <Widget>[
                  SizedBox(
                    width: wid,
                    height: 1500,
                    child: Stack(
                      children: boxes.entries.map((entry) {
                        Box box = entry.value;
                        final containerKey = GlobalKey();
                        box.globalKey = containerKey;
                        box.el = Positioned(
                          key: containerKey,
                          width: box.w,
                          height: box.h,
                          left: box.x,
                          top: box.y,
                          child: Card(
                            margin: const EdgeInsets.all(4),
                            child: IconButton(
                              onPressed: () {
                                widget.onWidgetSelect();
                              },
                              icon: const Icon(Icons.image),
                            ),
                          ),
                        );
                        return box.el!;
                      }).toList(),
                    ),
                  ),
                  Positioned(
                    left: 0,
                    top: 0,
                    width: wid,
                    height: 1500,
                    child: GestureDetector(
                      onLongPressStart: (details) {
                        mdX = details.localPosition.dx - 16;
                        mdY = details.localPosition.dy;
                        var keyOfBox = "";
                        for (var box in boxes.entries) {
                          if (((box.value.x + box.value.w) >= mdX) &&
                              (mdX >= box.value.x)) {
                            if (((box.value.y + box.value.h) >= mdY) &&
                                (mdY >= box.value.y)) {
                              keyOfBox = box.key;
                              break;
                            }
                          }
                        }
                        dragging = keyOfBox;
                        Rect cord =
                            boxes[dragging]!.globalKey!.globalPaintBounds!;
                        initialPosX = cord.left - 16;
                        initialPosY = cord.top - 380;
                        scrollLocked = true;
                      },
                      onLongPressEnd: (details) {
                        scrollLocked = false;
                        relPosX = -1;
                        relPosY = -1;
                        boxes.forEach((k, box) {
                          box.oldY = box.y;
                        });
                        setState(() {});
                      },
                      onLongPressMoveUpdate: (details) {
                        if (dragging != null) {
                          Box b = boxes[dragging!]!;
                          b.x = details.localPosition.dx - mdX + initialPosX;
                          b.y = details.localPosition.dy + initialPosY;
                          measureFinal();
                          setState(() {});
                        }
                      },
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ],
    );
  }
}
