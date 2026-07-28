import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/material.dart';
import './services/fcm_service.dart';
import './services/app_initialization_service.dart';
import './services/update_service.dart';
import './services/countdown_notification_service.dart';
import './config/app_routes.dart';
import './authentication/role_selection_screen.dart';
import './navigation/main_navigation_screen.dart';
import './consultant/consultant_navigation_screen.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:in_app_review/in_app_review.dart';
import 'firebase_options.dart';

/// ✅ CRITICAL FIX: Top-level background handler as required by Firebase docs.
/// This MUST be a top-level function, not inside any class or method.
@pragma('vm:entry-point')
Future<void> _firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  debugPrint('📨 [BG] Background message received: ${message.messageId}');
  // Delegate to FCMService's internal handler
  await FCMService.handleBackgroundMessage(message);
}

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  try {
    debugPrint('🚀 Starting Avisa Experts app...');

    // ✅ STEP 1: Initialize Firebase FIRST before any Firebase services
    await Firebase.initializeApp(
      options: DefaultFirebaseOptions.currentPlatform,
    );
    debugPrint('✅ Firebase initialized');

    // ✅ CRITICAL FIX: Register top-level background handler immediately after Firebase init.
    // This must be called at the top level, not inside any class or method.
    FirebaseMessaging.onBackgroundMessage(_firebaseMessagingBackgroundHandler);
    debugPrint('✅ Background message handler registered');

    // ✅ STEP 2: Initialize FCM service (includes countdown service initialization)
    // Note: FCMService.initialize() already calls CountdownNotificationService.initialize()
    await FCMService.initialize();
    debugPrint('✅ FCM Service initialized (with listeners set up once)');

    // ✅ REMOVED: Don't initialize countdown service again - already done in FCMService
    // await CountdownNotificationService.initialize();

    // ✅ STEP 3: Initialize app data
    final appData = await AppInitializationService.initialize();
    debugPrint('✅ App initialized: $appData');

    runApp(MyApp(appData: appData));
  } catch (e, stackTrace) {
    debugPrint('❌ App initialization failed: $e\n$stackTrace');

    runApp(MyApp(
      appData: AppInitData(
        isLoggedIn: false,
        userId: null,
        ticketCount: 0,
        userRole: null,
      ),
    ));
  }
}

final InAppReview inAppReview = InAppReview.instance;

Future<void> checkAppUsageForReview() async {
  try {
    final prefs = await SharedPreferences.getInstance();

    int launchCount = prefs.getInt('launchCount') ?? 0;
    launchCount++;
    await prefs.setInt('launchCount', launchCount);

    debugPrint('📊 App opened $launchCount times');

    // Show review after specific launch counts
    if (launchCount == 2 || launchCount == 10 || launchCount == 20) {
      if (await inAppReview.isAvailable()) {
        await inAppReview.requestReview();
        debugPrint('⭐ In-App Review dialog shown');
      } else {
        await inAppReview.openStoreListing(
          appStoreId: '1234567890', // Get this from App Store Connect
        );
        debugPrint('📦 Opened Play Store fallback');
      }
    }
  } catch (e) {
    debugPrint('⚠️ Error in review logic: $e');
  }
}

class MyApp extends StatefulWidget {
  final AppInitData appData;
  const MyApp({super.key, required this.appData});

  @override
  State<MyApp> createState() => _MyAppState();
}

class _MyAppState extends State<MyApp> with WidgetsBindingObserver {
  @override
  void initState() {
    super.initState();

    debugPrint('📱 MyApp initState');

    // Add lifecycle observer
    WidgetsBinding.instance.addObserver(this);

    // ✅ CRITICAL FIX: REMOVED FCMService.setupMessageListeners()
    // FCM listeners are now set up ONCE in FCMService.initialize() in main()
    // Calling it here was causing 3-4x app opening bug

    // Check for updates
    UpdateService.checkForUpdate();

    // Trigger review logic
    checkAppUsageForReview();
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    super.dispose();
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    debugPrint('📱 App lifecycle state changed: $state');

    switch (state) {
      case AppLifecycleState.resumed:
        debugPrint('▶️ App resumed');
        break;
      case AppLifecycleState.paused:
        debugPrint('⏸️ App paused');
        break;
      case AppLifecycleState.detached:
        debugPrint('🛑 App detached - stopping countdown');
        CountdownNotificationService.stopCountdown();
        break;
      default:
        break;
    }
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Avisa Experts',
      navigatorKey: FCMService.navigatorKey,
      theme: ThemeData(
        primarySwatch: Colors.blue,
        scaffoldBackgroundColor: Colors.grey[100],
        appBarTheme: const AppBarTheme(
          backgroundColor: Colors.blue,
          foregroundColor: Colors.white,
          elevation: 2,
        ),
        elevatedButtonTheme: ElevatedButtonThemeData(
          style: ElevatedButton.styleFrom(
            backgroundColor: Colors.blue,
            foregroundColor: Colors.white,
            elevation: 2,
          ),
        ),
      ),
      debugShowCheckedModeBanner: false,
      home: widget.appData.isLoggedIn
          ? (widget.appData.userRole == 'consultant'
              ? const ConsultantNavigationScreen()
              : const MainNavigationScreen())
          : const RoleSelectionScreen(),
      routes: AppRoutes.getRoutes(),
      onUnknownRoute: (settings) {
        debugPrint('❌ Unknown route: ${settings.name}');
        return MaterialPageRoute(
          builder: (context) => const MainNavigationScreen(),
        );
      },
    );
  }
}

/// Test screen for countdown functionality
class TestCountdownScreen extends StatelessWidget {
  const TestCountdownScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Test Countdown - Offer Starting'),
        backgroundColor: Colors.blue,
        foregroundColor: Colors.white,
      ),
      body: Padding(
        padding: const EdgeInsets.all(20.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const Text(
              '🎯 Test Countdown (Offer Starting)',
              style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 20),
            const Text(
              'These notifications show countdown until offer STARTS\nand are completely removable by user',
              style: TextStyle(fontSize: 14, color: Colors.grey),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 40),

            ElevatedButton(
              onPressed: () {
                final startTime =
                    DateTime.now().add(const Duration(seconds: 30));
                CountdownNotificationService.startCountdown(
                  startTime: startTime,
                  title: "🎯 Deal Starting Soon!",
                  dealTitle: "Tourist Visa Special",
                  discount: "50% OFF",
                );

                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(
                    content: Text('✅ Offer starting in 30 seconds!'),
                    backgroundColor: Colors.green,
                  ),
                );

                debugPrint(
                    '🔔 Manual 30s countdown started - offer starts in 30s');
              },
              child: const Text('🕐 Offer Starting in 30s'),
            ),

            const SizedBox(height: 20),

            ElevatedButton(
              onPressed: () {
                final startTime =
                    DateTime.now().add(const Duration(minutes: 2));
                CountdownNotificationService.startCountdown(
                  startTime: startTime,
                  title: "⏰ Flash Deal Alert!",
                  dealTitle: "Work Visa Processing",
                  discount: "30% OFF",
                );

                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(
                    content: Text('✅ Offer starting in 2 minutes!'),
                    backgroundColor: Colors.green,
                  ),
                );

                debugPrint(
                    '🔔 Manual 2min countdown started - offer starts in 2min');
              },
              child: const Text('⏰ Offer Starting in 2min'),
            ),

            const SizedBox(height: 20),

            ElevatedButton(
              onPressed: () {
                final startTime =
                    DateTime.now().add(const Duration(seconds: 5));
                CountdownNotificationService.startCountdown(
                  startTime: startTime,
                  title: "🔥 Instant Deal!",
                  dealTitle: "Transit Visa Express",
                  discount: "25% OFF",
                );

                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(
                    content: Text('✅ Offer starting in 5 seconds!'),
                    backgroundColor: Colors.orange,
                  ),
                );

                debugPrint('🔔 Manual 5s countdown started');
              },
              style: ElevatedButton.styleFrom(backgroundColor: Colors.orange),
              child: const Text('⚡ Offer Starting in 5s'),
            ),

            const SizedBox(height: 20),

            ElevatedButton(
              onPressed: () {
                CountdownNotificationService.stopCountdown();
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(
                    content: Text('🛑 Countdown stopped!'),
                    backgroundColor: Colors.red,
                  ),
                );

                debugPrint('🛑 Manual countdown stop');
              },
              style: ElevatedButton.styleFrom(backgroundColor: Colors.red),
              child: const Text('🛑 Stop Countdown'),
            ),

            const SizedBox(height: 40),

            Container(
              padding: const EdgeInsets.all(15),
              decoration: BoxDecoration(
                color: Colors.blue.shade50,
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: Colors.blue.shade200),
              ),
              child: Column(
                children: [
                  Text(
                    'Countdown Status',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                      color: Colors.blue.shade700,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Active: ${CountdownNotificationService.isCountdownActive}',
                    style: const TextStyle(fontSize: 14),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 20),

            // ✅ Changed to pushReplacement to avoid infinite navigation stack
            TextButton(
              onPressed: () {
                Navigator.pushReplacement(
                  context,
                  MaterialPageRoute(
                    builder: (context) => const TestCountdownScreen(),
                  ),
                );
              },
              child: const Text('🔄 Reload Test Screen'),
            ),
          ],
        ),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () async {
          final token = await FCMService.getToken();
          if (token != null) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Text('FCM Token: ${token.substring(0, 50)}...'),
                duration: const Duration(seconds: 5),
                action: SnackBarAction(
                  label: 'View Full',
                  onPressed: () {
                    showDialog(
                      context: context,
                      builder: (context) => AlertDialog(
                        title: const Text('FCM Token'),
                        content: SelectableText(token),
                        actions: [
                          TextButton(
                            onPressed: () => Navigator.of(context).pop(),
                            child: const Text('Close'),
                          ),
                        ],
                      ),
                    );
                  },
                ),
              ),
            );
            debugPrint('📱 FCM Token: $token');
          }
        },
        tooltip: 'Get FCM Token',
        child: const Icon(Icons.token),
      ),
    );
  }
}
