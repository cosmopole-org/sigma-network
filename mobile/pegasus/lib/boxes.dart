import 'package:flutter/material.dart';
import 'package:animated_analog_clock/animated_analog_clock.dart';

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
      h: 300,
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
      h: 300,
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

class Boxes extends StatefulWidget {
  final Function(bool) changeScrollLock;
  final Function() onWidgetSelect;

  const Boxes(
      {Key? key, required this.changeScrollLock, required this.onWidgetSelect})
      : super(key: key);

  @override
  _BoxesState createState() => _BoxesState();
}

class _BoxesState extends State<Boxes> {
  double wid = 0;
  double hid = 0;
  double blockWidth = 0;
  double initialPosX = 0, initialPosY = 0, relPosX = -1, relPosY = -1;
  bool loaded = false; // Assuming loaded is a state variable

  @override
  void initState() {
    super.initState();
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
          box.h = 300;
          box.x = 4;
        }
      });
      measureFinal();
    }
    return SliverToBoxAdapter(
      child: Stack(
        children: <Widget>[
          Transform.translate(
            offset: const Offset(0, 16),
            child: SizedBox(
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
                        icon: AnimatedAnalogClock(
                          size: (box.key != 'post1' && box.key != 'post2')
                              ? 146
                              : 292,
                          location: 'Asia/Tehran',
                          backgroundColor: Color(0xff1E1E26),
                          hourHandColor: Colors.lightBlueAccent,
                          minuteHandColor: Colors.lightBlueAccent,
                          secondHandColor: Colors.amber,
                          centerDotColor: Colors.amber,
                          hourDashColor: Colors.lightBlue,
                          minuteDashColor: Colors.blueAccent,
                        ),
                      ),
                    ),
                  );
                  return box.el!;
                }).toList(),
              ),
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
                Rect cord = boxes[dragging]!.globalKey!.globalPaintBounds!;
                initialPosX = cord.left - 16;
                initialPosY = cord.top - 500;
                widget.changeScrollLock(true);
              },
              onLongPressEnd: (details) {
                widget.changeScrollLock(false);
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
    );
  }
}
