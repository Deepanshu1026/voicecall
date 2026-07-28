import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';

class CountdownNotificationService {
  static final FlutterLocalNotificationsPlugin _notifications = 
      FlutterLocalNotificationsPlugin();
  
  static Timer? _countdownTimer;
  static const int _countdownNotificationId = 3001;
  static bool _isInitialized = false;

  /// Initialize countdown notification service
  static Future<void> initialize() async {
    if (_isInitialized) return;

    const AndroidInitializationSettings androidSettings =
        AndroidInitializationSettings('@mipmap/ic_launcher');

    // ✅ FIX: Add iOS/Darwin initialization settings
    const DarwinInitializationSettings iosSettings = DarwinInitializationSettings(
      requestAlertPermission: false,
      requestBadgePermission: false,
      requestSoundPermission: false,
    );

    const InitializationSettings initSettings = InitializationSettings(
      android: androidSettings,
      iOS: iosSettings,
    );

    await _notifications.initialize(initSettings);
    _isInitialized = true;
    debugPrint('✅ Countdown service initialized');
  }

  /// Start countdown notification - SHOWS ONLY ONCE, THEN WHEN COMPLETE
  static Future<void> startCountdown({
    required DateTime startTime,
    String title = "⏰ Offer Starting Soon!",
    String dealTitle = "Flash Deal",
    String? dealId,
    String? discount,
  }) async {
    // Ensure initialization
    await initialize();
    
    // Cancel any existing countdown
    stopCountdown();

    debugPrint('🔔 Starting countdown notification:');
    debugPrint('   Title: $title');
    debugPrint('   Deal: $dealTitle');
    debugPrint('   Discount: $discount');
    debugPrint('   Start time: $startTime');
    debugPrint('   Time until start: ${startTime.difference(DateTime.now()).inMinutes} minutes');

    // SHOW INITIAL NOTIFICATION ONLY ONCE
    const androidDetails = AndroidNotificationDetails(
      'countdown_channel_id',
      'Countdown Notifications',
      channelDescription: 'Countdown for upcoming offers',
      importance: Importance.defaultImportance,
      priority: Priority.defaultPriority,
      ongoing: false, // User can remove it
      autoCancel: true, // Allows easy removal
      showWhen: true, // Show timestamp
      enableVibration: false,
      playSound: true, // Sound for initial notification
      icon: '@mipmap/ic_launcher',
      largeIcon: DrawableResourceAndroidBitmap('@mipmap/ic_launcher'),
    );

    const platformDetails = NotificationDetails(android: androidDetails);

    // Calculate initial time remaining
    final remaining = startTime.difference(DateTime.now());
    final timeString = _formatDuration(remaining);
    final bodyText = discount != null 
        ? "🎯 $dealTitle ($discount) starts in $timeString"
        : "🎯 $dealTitle starts in $timeString";

    // ✅ SHOW NOTIFICATION ONLY ONCE AT START
    await _notifications.show(
      _countdownNotificationId,
      title,
      bodyText,
      platformDetails,
    );

    debugPrint('✅ Initial countdown notification shown');

    // Start timer that runs silently until completion
    _countdownTimer = Timer.periodic(Duration(seconds: 1), (timer) async {
      final remaining = startTime.difference(DateTime.now());

      if (remaining.isNegative) {
        // ✅ OFFER HAS STARTED - SHOW COMPLETION NOTIFICATION
        debugPrint('🔥 Offer started: $dealTitle');
        await _notifications.show(
          _countdownNotificationId + 1, // Different ID so both can exist
          "🔥 Offer Started!",
          "$dealTitle is now live! ${discount != null ? 'Get $discount now!' : 'Check it out now!'}",
          const NotificationDetails(
            android: AndroidNotificationDetails(
              'offer_started_channel',
              'Offer Started',
              importance: Importance.high,
              priority: Priority.high,
              playSound: true,
              enableVibration: true,
              ongoing: false,
              autoCancel: true,
              showWhen: true,
            ),
          ),
        );
        
        timer.cancel();
        debugPrint('✅ Countdown completed - final notification shown');
      }
      
      // ✅ NO UPDATES DURING COUNTDOWN - RUNS SILENTLY
      // Just log progress every minute for debugging
      if (remaining.inSeconds % 60 == 0 && remaining.inMinutes > 0) {
        debugPrint('⏱️ Silent countdown: ${remaining.inMinutes} minutes remaining');
      }
    });

    debugPrint('✅ Silent countdown timer started');
  }

  /// Format duration to readable string
  static String _formatDuration(Duration duration) {
    if (duration.inDays > 0) {
      final days = duration.inDays;
      final hours = duration.inHours.remainder(24);
      return "${days}d ${hours}h";
    } else if (duration.inHours > 0) {
      final hours = duration.inHours;
      final minutes = duration.inMinutes.remainder(60);
      return "${hours}h ${minutes}m";
    } else if (duration.inMinutes > 0) {
      final minutes = duration.inMinutes;
      final seconds = duration.inSeconds.remainder(60);
      return "${minutes}m ${seconds}s";
    } else {
      return "${duration.inSeconds}s";
    }
  }

  /// Stop current countdown
  static void stopCountdown() {
    if (_countdownTimer != null) {
      _countdownTimer!.cancel();
      _countdownTimer = null;
      _notifications.cancel(_countdownNotificationId);
      _notifications.cancel(_countdownNotificationId + 1); // Cancel completion notification too
      debugPrint('🛑 Countdown notification stopped');
    }
  }

  /// Check if countdown is running
  static bool get isCountdownActive => _countdownTimer?.isActive ?? false;

  /// Get remaining time for current countdown
  static Duration? getRemainingTime(DateTime? startTime) {
    if (startTime == null || !isCountdownActive) return null;
    final remaining = startTime.difference(DateTime.now());
    return remaining.isNegative ? null : remaining;
  }

  /// Start multiple countdowns (for different deals)
  static Future<void> startMultipleCountdowns(List<CountdownData> deals) async {
    if (deals.isNotEmpty) {
      final deal = deals.first;
      await startCountdown(
        startTime: deal.startTime,
        title: deal.title,
        dealTitle: deal.dealTitle,
        dealId: deal.dealId,
        discount: deal.discount,
      );
    }
  }
}

/// Data class for countdown information
class CountdownData {
  final DateTime startTime;
  final String title;
  final String dealTitle;
  final String? dealId;
  final String? discount;

  CountdownData({
    required this.startTime,
    this.title = "⏰ Offer Starting Soon!",
    required this.dealTitle,
    this.dealId,
    this.discount,
  });

  factory CountdownData.fromFCMData(Map<String, dynamic> data) {
    try {
      debugPrint('🔍 Creating CountdownData from FCM:');
      debugPrint('   Raw data: $data');
      
      // Look for start_time first, fall back to end_time for backward compatibility
      final timeString = data['start_time'] ?? data['end_time'];
      if (timeString == null || timeString.isEmpty) {
        throw Exception('start_time or end_time is missing');
      }
      
      final result = CountdownData(
        startTime: DateTime.parse(timeString),
        title: data['title'] ?? "⏰ Offer Starting Soon!",
        dealTitle: data['deal_title'] ?? 'Flash Deal',
        dealId: data['deal_id'],
        discount: data['discount'],
      );
      
      debugPrint('✅ CountdownData created:');
      debugPrint('   Start Time: ${result.startTime}');
      debugPrint('   Deal Title: ${result.dealTitle}');
      debugPrint('   Discount: ${result.discount}');
      
      return result;
    } catch (e) {
      debugPrint('❌ Error creating CountdownData: $e');
      debugPrint('   Data received: $data');
      rethrow;
    }
  }
}
