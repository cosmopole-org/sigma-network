import 'package:flutter/material.dart';
import 'package:pegasus/board.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(
    const MyApp(),
  );
}

class MyApp extends StatelessWidget {
  const MyApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Sigma',
      theme: ThemeData(
        cardTheme: CardTheme(
          elevation: 0,
          color: Colors.lightBlue[50],
        ),
        useMaterial3: true,
        colorScheme: ColorScheme.fromSeed(
          seedColor: Colors.lightBlue,
          brightness: Brightness.light,
        ),
        pageTransitionsTheme: const PageTransitionsTheme(
          builders: {
            TargetPlatform.android: CupertinoPageTransitionsBuilder(),
            TargetPlatform.iOS: CupertinoPageTransitionsBuilder(),
          },
        ),
      ),
      darkTheme: ThemeData(
          useMaterial3: true,
          brightness: Brightness.dark,
          pageTransitionsTheme: const PageTransitionsTheme(
            builders: {
              TargetPlatform.android: CupertinoPageTransitionsBuilder(),
              TargetPlatform.iOS: CupertinoPageTransitionsBuilder(),
            },
          )
          /* dark theme settings */
          ),
      themeMode: ThemeMode.dark,
      home: const HomePage(title: "Sigma"),
    );
  }
}

class HomePage extends StatefulWidget {
  const HomePage({Key? key, required this.title}) : super(key: key);

  final String title;

  @override
  State<HomePage> createState() => HomePageState();
}

class HomePageState extends State<HomePage> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      resizeToAvoidBottomInset: false,
      appBar: AppBar(
        title: const Text('Home'),
      ),
      body: Center(
        child: Stack(
          children: [
            ElevatedButton(
              onPressed: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(
                      builder: (context) => const TopicPage(title: "")),
                );
              },
              child: const Text("open topic !"),
            ),
          ]
        ),
      ),
    );
  }
}

class TopicPage extends StatefulWidget {
  const TopicPage({Key? key, required this.title}) : super(key: key);

  final String title;

  @override
  State<TopicPage> createState() => TopicPageState();
}

class TopicPageState extends State<TopicPage> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      resizeToAvoidBottomInset: false,
      appBar: AppBar(
        title: const Text('My Home'),
        actions: [
          IconButton(onPressed: () {}, icon: const Icon(Icons.settings)),
        ],
      ),
      body: Center(
        child: Board(
            onWidgetSelect: () {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (context) => const SecondRoute()),
              );
            },
            changeScrollLock: (p0) {}),
      ),
    );
  }
}

class SecondRoute extends StatelessWidget {
  const SecondRoute({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Second Route'),
      ),
      body: Center(
        child: ElevatedButton(
          onPressed: () {
            Navigator.pop(context);
          },
          child: const Text('Go back!'),
        ),
      ),
    );
  }
}
