import 'dart:io';
import 'dart:convert';
import 'package:crypto/crypto.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/material.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:http/http.dart' as http;
import 'package:path_provider/path_provider.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:url_launcher/url_launcher.dart';
import 'countdown_notification_service.dart';
import 'dart:async';
import '../config/app_routes.dart';
import '../config/app_config.dart';
import '../pages/chat_screen.dart';

class FCMService {
  static final FlutterLocalNotificationsPlugin _notifications =
      FlutterLocalNotificationsPlugin();

  static final GlobalKey<NavigatorState> navigatorKey =
      GlobalKey<NavigatorState>();

  // ✅ CRITICAL: Track if listeners are already initialized
  static bool _listenersInitialized = false;

  // ✅ CRITICAL: Store subscriptions so they can be cancelled
  static StreamSubscription<RemoteMessage>? _onMessageSubscription;
  static StreamSubscription<RemoteMessage>? _onMessageOpenedAppSubscription;
  static StreamSubscription<String>? _onTokenRefreshSubscription;

  // ✅ CRITICAL: Track handled notification IDs to prevent duplicates
  static final Set<String> _handledMessageIds = <String>{};
  static const int _maxCachedIds = 50;
  static const String _prefsKeyHandledIds = 'fcm_handled_ids';
  static const String _prefsKeyLastToken = 'fcm_last_token';

  // Stores the notification that launched the app from terminated state.
  // It is processed after the first frame so the navigator is available.
  static RemoteMessage? _pendingInitialMessage;

  /// ✅ PUBLIC: Entry point for the top-level background handler in main.dart
  static Future<void> handleBackgroundMessage(RemoteMessage message) async {
    // Ensure Firebase is initialized in the background isolate
    try {
      if (Firebase.apps.isEmpty) {
        await Firebase.initializeApp();
      }
    } catch (e) {
      debugPrint('❌ [BG] Firebase init in background failed (may already be initialized): $e');
    }

    await CountdownNotificationService.initialize();

    debugPrint('📨 [BG] Background message received');
    debugPrint('   Message ID: ${message.messageId}');
    debugPrint('   Data: ${message.data}');

    // Load persisted handled IDs in background isolate
    await _loadHandledIds();

    // ✅ ONLY handle countdown notifications in background
    // Regular notifications are automatically shown by system
    if (message.data['type'] == 'countdown') {
      debugPrint('🎯 [BG] Background countdown message detected');
      await _handleCountdownNotification(message);
    } else {
      debugPrint('📱 [BG] Background regular message - system will handle display');
    }
  }

  /// ✅ PUBLIC: Process the notification that launched the app from terminated state.
  /// Call this after the first frame is rendered so the navigator is available.
  static Future<void> processPendingNotifications() async {
    final message = _pendingInitialMessage;
    _pendingInitialMessage = null;
    if (message != null) {
      debugPrint('📱 Processing deferred initial notification');
      await _handleMessage(message, source: 'getInitialMessage');
    }
  }

  /// Initialize FCM and local notifications
  static Future<void> initialize() async {
    debugPrint('✅ FCM Service initializing...');

    // Initialize local notifications
    await _initLocalNotifications();

    // Initialize countdown service
    await CountdownNotificationService.initialize();

    // Load persisted handled IDs
    await _loadHandledIds();

    // Request permissions
    try {
      await FirebaseMessaging.instance.requestPermission(
        alert: true,
        badge: true,
        sound: true,
        provisional: false,
      );
      debugPrint('✅ FCM permissions granted');
    } catch (e) {
      debugPrint('❌ FCM permission error: $e');
    }

    // Get and print token to debug console, then register token refresh listener
    try {
      String? token = await getToken();
      debugPrint('FCM Token Generated on Init: $token');
      if (token != null) {
        await _saveToken(token);
      }
      // Sync token on startup in case it was refreshed while the app was closed
      await sendTokenToServer();
      _listenToTokenRefresh();
    } catch (e) {
      debugPrint('❌ FCM token error: $e');
    }

    // ✅ Setup listeners ONCE during initialization
    if (!_listenersInitialized) {
      await _setupListenersOnce();
      _listenersInitialized = true;
      debugPrint('✅ FCM listeners initialized (one-time setup)');
    }
  }

  /// ✅ PRIVATE: Setup message listeners ONLY ONCE
  static Future<void> _setupListenersOnce() async {
    debugPrint('🔧 Setting up FCM message listeners (ONE TIME)');

    // 1. Store the notification that launched the app from terminated state.
    // We defer handling until after the first frame so the navigator is ready.
    _pendingInitialMessage =
        await FirebaseMessaging.instance.getInitialMessage();
    if (_pendingInitialMessage != null) {
      debugPrint('📱 App launched from terminated state via notification (deferred)');
    }

    // 2. Handle foreground messages
    _onMessageSubscription =
        FirebaseMessaging.onMessage.listen((RemoteMessage message) async {
      debugPrint('📨 Foreground message received');
      if (message.data['type'] == 'chat') {
        final prefs = await SharedPreferences.getInstance();
        final currentChatReceiverId = prefs.getString('current_chat_receiver_id');
        final senderId = message.data['sender_id'] ?? '';
        if (currentChatReceiverId == senderId && currentChatReceiverId != null) {
          debugPrint('📱 Chat message from current chat partner - skipping notification');
          return;
        }
      }
      await _showLocalNotification(message);
    });

    // 3. Handle background to foreground messages (notification tap)
    _onMessageOpenedAppSubscription =
        FirebaseMessaging.onMessageOpenedApp.listen((RemoteMessage message) {
      debugPrint('📱 App opened from background via notification');
      _handleMessage(message, source: 'onMessageOpenedApp');
    });
  }

  /// ✅ PUBLIC: No-op method for backward compatibility
  static void setupMessageListeners() {
    debugPrint(
        '⚠️ setupMessageListeners() called - IGNORED (already initialized in initialize())');
    // Do nothing - listeners are set up once in initialize()
  }

  /// ✅ Dispose/cleanup listeners when needed
  static Future<void> dispose() async {
    debugPrint('🗑️ Disposing FCM listeners');
    await _onMessageSubscription?.cancel();
    await _onMessageOpenedAppSubscription?.cancel();
    await _onTokenRefreshSubscription?.cancel();
    _listenersInitialized = false;
    _handledMessageIds.clear();
  }

  /// Initialize local notifications with dismissal handling
  static Future<void> _initLocalNotifications() async {
    // ✅ CRITICAL FIX: Create Android notification channel before using it.
    const AndroidNotificationChannel channel = AndroidNotificationChannel(
      'avisa_experts_channel_id',
      'Avisa Experts Notifications',
      description: 'Channel for Avisa Experts app notifications',
      importance: Importance.high,
    );
    await _notifications
        .resolvePlatformSpecificImplementation<
            AndroidFlutterLocalNotificationsPlugin>()
        ?.createNotificationChannel(channel);

    // ✅ CRITICAL FIX: Also create the countdown channel
    const AndroidNotificationChannel countdownChannel = AndroidNotificationChannel(
      'countdown_channel_id',
      'Countdown Notifications',
      description: 'Countdown for upcoming offers',
      importance: Importance.defaultImportance,
    );
    await _notifications
        .resolvePlatformSpecificImplementation<
            AndroidFlutterLocalNotificationsPlugin>()
        ?.createNotificationChannel(countdownChannel);

    const AndroidInitializationSettings androidSettings =
        AndroidInitializationSettings('@mipmap/ic_launcher');

    // ✅ CRITICAL FIX: Add iOS/Darwin initialization settings
    const DarwinInitializationSettings iosSettings = DarwinInitializationSettings(
      requestAlertPermission: false,
      requestBadgePermission: false,
      requestSoundPermission: false,
    );

    const InitializationSettings initSettings = InitializationSettings(
      android: androidSettings,
      iOS: iosSettings,
    );

    await _notifications.initialize(
      initSettings,
      onDidReceiveNotificationResponse: (NotificationResponse response) async {
        final payload = response.payload;
        debugPrint('👆 Local notification tapped, payload: $payload');

        // Handle countdown notification resume
        if (CountdownNotificationService.isCountdownActive) {
          // Resume countdown notifications if active
        }

        if (payload == null || payload.isEmpty) return;

        // Try to parse the payload as the full FCM data payload.
        try {
          final decoded = jsonDecode(payload);
          if (decoded is Map<String, dynamic>) {
            if (decoded['type'] == 'chat') {
              _handleChatNotification(decoded);
              return;
            }
            if (decoded['route']?.isNotEmpty == true) {
              _navigateFromPayload(Uri.decodeComponent(decoded['route']!));
              return;
            }
            if (decoded['url']?.isNotEmpty == true) {
              _navigateFromPayload(decoded['url']!);
              return;
            }
          }
        } catch (_) {
          // Not JSON: fall back to legacy route/url handling.
        }

        _navigateFromPayload(payload);
      },
    );
    debugPrint('✅ Local notifications initialized');
  }

  /// Handle countdown notification from FCM
  static Future<void> _handleCountdownNotification(
      RemoteMessage message) async {
    try {
      debugPrint('🔔 Handling countdown notification...');
      debugPrint('   Raw message data: ${message.data}');

      // Validate required countdown data
      final hasStartTime = message.data.containsKey('start_time');
      final hasEndTime =
          message.data.containsKey('end_time'); // For backward compatibility

      if (!hasStartTime && !hasEndTime) {
        throw Exception(
            'Missing start_time or end_time in countdown notification');
      }

      final countdownData = CountdownData.fromFCMData(message.data);

      debugPrint('📱 Starting countdown timer...');
      debugPrint('   Deal: ${countdownData.dealTitle}');
      debugPrint('   Start Time: ${countdownData.startTime}');
      debugPrint(
          '   Duration: ${countdownData.startTime.difference(DateTime.now()).inMinutes} minutes');

      await CountdownNotificationService.startCountdown(
        startTime: countdownData.startTime,
        title: countdownData.title,
        dealTitle: countdownData.dealTitle,
        dealId: countdownData.dealId,
        discount: countdownData.discount,
      );

      debugPrint('✅ Countdown notification handled successfully');
    } catch (e) {
      debugPrint('❌ Error handling countdown notification: $e');
      debugPrint('   Falling back to regular notification...');

      // Fallback: show as regular notification
      await _showLocalNotification(message);
    }
  }

  /// ✅ Show local notification with duplicate prevention
  static Future<void> _showLocalNotification(RemoteMessage message) async {
    // ✅ CRITICAL FIX: Use deterministic message ID based on content hash
    // so duplicate prevention works even when messageId is null.
    final messageId = _computeDeterministicId(message);

    if (_handledMessageIds.contains(messageId)) {
      debugPrint('⚠️ Duplicate notification ignored: $messageId');
      return;
    }
    _handledMessageIds.add(messageId);
    if (_handledMessageIds.length > _maxCachedIds) {
      final excess = _handledMessageIds.length - _maxCachedIds;
      // ✅ CRITICAL FIX: Convert to list before removing to avoid lazy iterable bug.
      final toRemove = _handledMessageIds.take(excess).toList();
      _handledMessageIds.removeAll(toRemove);
    }
    // Persist the updated set
    await _persistHandledIds();

    final String? title = message.notification?.title ?? message.data['title'];
    final String? body = message.notification?.body ?? message.data['body'];

    debugPrint('🔔 Processing notification:');
    debugPrint('   Title: $title');
    debugPrint('   Body: $body');
    debugPrint('   Data: ${message.data}');
    debugPrint('   Type: ${message.data['type']}');

    // ✅ Handle countdown notifications
    if (message.data['type'] == 'countdown') {
      debugPrint('🎯 Countdown notification detected - processing...');
      await _handleCountdownNotification(message);
      return; // Don't show regular notification
    }

    debugPrint('📱 Regular notification detected - processing...');

    // ✅ Regular notification logic - ALSO REMOVABLE
    // Encode the full data payload so local notification taps can be handled
    // consistently with background/terminated notifications.
    final String? payload = jsonEncode(message.data);

    final String? imageUrl =
        message.notification?.android?.imageUrl ?? message.data['image'];

    AndroidNotificationDetails androidDetails;
    String? localImagePath;

    if (imageUrl != null && imageUrl.isNotEmpty) {
      localImagePath = await _downloadImage(imageUrl);
    }

    if (localImagePath != null) {
      androidDetails = AndroidNotificationDetails(
        'avisa_experts_channel_id',
        'Avisa Experts Notifications',
        channelDescription: 'Channel for Avisa Experts app notifications',
        importance: Importance.high,
        priority: Priority.high,
        showWhen: true,
        ongoing: false, // Removable
        autoCancel: true, // Easy to remove
        styleInformation: BigPictureStyleInformation(
          FilePathAndroidBitmap(localImagePath),
          largeIcon: const DrawableResourceAndroidBitmap('@mipmap/ic_launcher'),
        ),
      );
    } else {
      androidDetails = const AndroidNotificationDetails(
        'avisa_experts_channel_id',
        'Avisa Experts Notifications',
        channelDescription: 'Channel for Avisa Experts app notifications',
        importance: Importance.high,
        priority: Priority.high,
        showWhen: true,
        ongoing: false, // Removable
        autoCancel: true, // Easy to remove
        largeIcon: DrawableResourceAndroidBitmap('@mipmap/ic_launcher'),
      );
    }

    final NotificationDetails platformDetails =
        NotificationDetails(android: androidDetails);

    // ✅ CRITICAL FIX: Use deterministic notification ID instead of hashCode
    // to prevent collisions where different messages overwrite each other.
    final int notificationId = _computeNotificationId(message);

    await _notifications.show(
      notificationId,
      title ?? 'New Notification',
      body ?? 'You have a new message.',
      platformDetails,
      payload: payload,
    );

    debugPrint('✅ Regular notification shown (id=$notificationId)');
  }

  /// Download image helper
  static Future<String?> _downloadImage(String url) async {
    try {
      // ✅ CRITICAL FIX: Add timeout to prevent hanging on slow URLs.
      final response = await http
          .get(Uri.parse(url))
          .timeout(const Duration(seconds: 10));
      if (response.statusCode == 200) {
        final directory = await getTemporaryDirectory();
        // ✅ CRITICAL FIX: Strip query parameters from filename to avoid invalid paths.
        final uri = Uri.parse(url);
        final fileName = uri.pathSegments.isNotEmpty
            ? uri.pathSegments.last.split('?').first
            : 'image';
        final filePath = '${directory.path}/$fileName';
        final file = File(filePath);
        await file.writeAsBytes(response.bodyBytes);
        return filePath;
      }
    } catch (e) {
      debugPrint('❌ Image download failed: $e');
    }
    return null;
  }

  /// ✅ Handle navigation from payload with delay
  static Future<void> _navigateFromPayload(String payload) async {
    final decoded = Uri.decodeComponent(payload);
    debugPrint('🧭 Navigating to: $decoded');

    await Future.delayed(const Duration(milliseconds: 300));

    if (decoded.startsWith('http://') || decoded.startsWith('https://')) {
      await launchUrl(Uri.parse(decoded), mode: LaunchMode.externalApplication);
    } else {
      final routes = AppRoutes.getRoutes();
      if (routes.containsKey(decoded)) {
        navigatorKey.currentState?.pushNamed(decoded);
      } else {
        debugPrint('❌ Unknown route from payload: $decoded');
      }
    }
  }

  static void _handleChatNotification(Map<String, dynamic> data) async {
    final senderId = data['sender_id'] ?? '';
    final senderName = data['sender_name'] ?? 'User';
    if (senderId.isEmpty) {
      debugPrint('❌ Chat notification missing sender_id');
      return;
    }

    final nav = navigatorKey.currentState;
    if (nav == null) {
      debugPrint('❌ No navigator state for chat notification');
      return;
    }

    final senderProfile = data['sender_profile'] ?? '';
    String? senderImageUrl;
    if (senderProfile is String && senderProfile.isNotEmpty) {
      String normalized = senderProfile.replaceAll('\\', '/');
      if (normalized.startsWith('http')) {
        senderImageUrl = normalized;
      } else {
        final base = AppConfig.staticAssetBase;
        senderImageUrl = normalized.startsWith('/')
            ? '$base$normalized'
            : '$base/$normalized';
      }
    }

    nav.push(
      MaterialPageRoute(
        builder: (_) => ChatScreen(
          advisorId: senderId,
          advisorName: senderName,
          advisorImageUrl: senderImageUrl,
        ),
      ),
    );
  }

  /// ✅ Handle FCM message navigation with duplicate prevention
  static void _handleMessage(RemoteMessage message, {required String source}) {
    final messageId = _computeDeterministicId(message);

    if (_handledMessageIds.contains(messageId)) {
      debugPrint(
          '⚠️ Duplicate message navigation ignored from $source: $messageId');
      return;
    }

    _handledMessageIds.add(messageId);
    if (_handledMessageIds.length > _maxCachedIds) {
      final excess = _handledMessageIds.length - _maxCachedIds;
      final toRemove = _handledMessageIds.take(excess).toList();
      _handledMessageIds.removeAll(toRemove);
    }
    _persistHandledIds();

    final String? route = message.data['route'];
    final String? url = message.data['url'];

    debugPrint('🧭 Handling message navigation from $source:');
    debugPrint('   Message ID: $messageId');
    debugPrint('   Route: $route');
    debugPrint('   URL: $url');
    debugPrint('   Type: ${message.data['type']}');

    if (message.data['type'] == 'chat') {
      _handleChatNotification(message.data);
      return;
    }

    if (route != null && route.isNotEmpty) {
      final decodedRoute = Uri.decodeComponent(route);
      _navigateFromPayload(decodedRoute);
    } else if (url != null && url.isNotEmpty) {
      _navigateFromPayload(url);
    }
  }

  /// Get FCM token for this device
  static Future<String?> getToken() async {
    try {
      final token = await FirebaseMessaging.instance.getToken();
      debugPrint('📱 FCM Token: $token');
      return token;
    } catch (e) {
      debugPrint('❌ Error getting FCM token: $e');
      return null;
    }
  }

  /// ✅ CRITICAL FIX: Listen to token refresh and persist new tokens
  static void _listenToTokenRefresh() {
    _onTokenRefreshSubscription?.cancel();
    _onTokenRefreshSubscription =
        FirebaseMessaging.instance.onTokenRefresh.listen((newToken) async {
      debugPrint('🔄 FCM token refreshed: $newToken');
      await _saveToken(newToken);
      // Sync the refreshed token to the backend automatically
      await sendTokenToServer();
    }, onError: (e) {
      debugPrint('❌ Token refresh stream error: $e');
    });
  }

  /// ✅ CRITICAL FIX: Persist the last known token
  static Future<void> _saveToken(String token) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString(_prefsKeyLastToken, token);
    } catch (e) {
      debugPrint('❌ Failed to persist FCM token: $e');
    }
  }

  /// ✅ PUBLIC: Send the current FCM token to the backend.
  /// Called on login, guest creation, app startup, and token refresh.
  static Future<bool> sendTokenToServer({String? userId}) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final effectiveUserId = userId ??
          prefs.getString('user_id') ??
          prefs.getString('userId') ??
          prefs.getString('USER_ID');

      if (effectiveUserId == null || effectiveUserId.isEmpty) {
        debugPrint('⚠️ No user_id available, skipping FCM token sync');
        return false;
      }

      final token = await getToken();
      if (token == null || token.isEmpty) {
        debugPrint('⚠️ FCM token is null/empty, skipping server sync');
        return false;
      }

      // Avoid duplicate calls if the same token is already synced for the same user
      final lastToken = prefs.getString(_prefsKeyLastToken);
      final lastUserId = prefs.getString('fcm_last_user_id');
      if (lastToken == token && lastUserId == effectiveUserId) {
        debugPrint('📡 FCM token already synced for user $effectiveUserId, skipping');
        return true;
      }

      final resp = await http.post(
        Uri.parse(AppConfig.fcmToken),
        body: {
          'token': token,
          'device': Platform.isAndroid ? 'android' : 'ios',
          'user_id': effectiveUserId,
        },
      ).timeout(const Duration(seconds: 15));

      if (resp.statusCode == 200) {
        await _saveToken(token);
        await prefs.setString('fcm_last_user_id', effectiveUserId);
        await prefs.setString('fcm_token', token);
        debugPrint('📡 FCM token synced to server: ${resp.body}');
        return true;
      } else {
        debugPrint('❌ Failed to sync FCM token: HTTP ${resp.statusCode}');
        return false;
      }
    } catch (e) {
      debugPrint('❌ Error syncing FCM token: $e');
      return false;
    }
  }

  /// ✅ CRITICAL FIX: Retrieve the last known token (useful on startup)
  static Future<String?> getLastKnownToken() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      return prefs.getString(_prefsKeyLastToken);
    } catch (e) {
      return null;
    }
  }

  /// ✅ CRITICAL FIX: Persist handled message IDs so duplicates are
  /// prevented across app restarts.
  static Future<void> _persistHandledIds() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final list = _handledMessageIds.toList();
      await prefs.setStringList(_prefsKeyHandledIds, list);
    } catch (e) {
      debugPrint('❌ Failed to persist handled IDs: $e');
    }
  }

  /// ✅ CRITICAL FIX: Load persisted handled message IDs
  static Future<void> _loadHandledIds() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final list = prefs.getStringList(_prefsKeyHandledIds);
      if (list != null) {
        _handledMessageIds.clear();
        _handledMessageIds.addAll(list.take(_maxCachedIds));
      }
    } catch (e) {
      debugPrint('❌ Failed to load handled IDs: $e');
    }
  }

  /// ✅ CRITICAL FIX: Compute a deterministic message ID based on content.
  /// This ensures the same message gets the same ID even when messageId is null.
  static String _computeDeterministicId(RemoteMessage message) {
    final id = message.messageId;
    if (id != null && id.isNotEmpty) return id;

    final content =
        '${message.senderId ?? ''}:${message.notification?.title ?? ''}:${message.notification?.body ?? ''}:${message.sentTime?.millisecondsSinceEpoch ?? 0}';
    final bytes = utf8.encode(content);
    final digest = md5.convert(bytes);
    return digest.toString();
  }

  /// ✅ CRITICAL FIX: Compute a stable int notification ID from message content
  /// to prevent hashCode collisions.
  static int _computeNotificationId(RemoteMessage message) {
    final id = message.messageId;
    if (id != null && id.isNotEmpty) {
      // Use a simple hash of the string ID
      return id.hashCode.abs() % 0x7FFFFFFF;
    }
    // Fallback: hash of the deterministic string ID
    return _computeDeterministicId(message).hashCode.abs() % 0x7FFFFFFF;
  }

  /// ✅ Clear notification cache (call on logout)
  static Future<void> clearCache() async {
    _handledMessageIds.clear();
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.remove(_prefsKeyHandledIds);
    } catch (e) {
      debugPrint('❌ Failed to clear handled IDs: $e');
    }
    debugPrint('🗑️ FCM notification cache cleared');
  }
}
