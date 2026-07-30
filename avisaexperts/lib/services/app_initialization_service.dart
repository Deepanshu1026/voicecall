import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/app_notifiers.dart';
import '../services/chat_socket_service.dart';

class AppInitializationService {
  static Future<AppInitData> initialize() async {
    debugPrint('🚀 Initializing app services...');

    final prefs = await SharedPreferences.getInstance();
    final String? userId = prefs.getString(USER_ID_PREFS_KEY);
    final String? userRole = prefs.getString('userRole');
    final bool isLoggedIn = userId != null && userId.isNotEmpty;

    debugPrint('👤 User login status: $isLoggedIn (ID: $userId, Role: $userRole)');

    int initialTicketCount = 0;

    if (isLoggedIn && userRole != 'consultant') {
      fetchTicketCountFromApi(userId).then((count) {
        ticketCountNotifier.value = count;
        debugPrint('🎫 Ticket count asynchronously updated: $count');
      }).catchError((e) {
        debugPrint('❌ Failed to fetch ticket count: $e');
      });
    }

    if (isLoggedIn && userRole != 'consultant') {
      UnreadMessageService.startPolling().then((_) {
        debugPrint('📨 Unread message service started');
      }).catchError((e) {
        debugPrint('❌ Failed to start message service: $e');
      });
      // Connect to Socket.IO for real-time chat (React website parity)
      ChatSocketService().connect(userId: userId).catchError((e) {
        debugPrint('❌ Failed to start chat socket: $e');
      });
    } else if (isLoggedIn && userRole == 'consultant') {
      ChatSocketService().connect(userId: userId).catchError((e) {
        debugPrint('❌ Failed to start consultant chat socket: $e');
      });
    }

    final appData = AppInitData(
      isLoggedIn: isLoggedIn,
      userId: userId,
      ticketCount: initialTicketCount,
      userRole: userRole,
    );

    debugPrint('✅ App initialization complete: $appData');
    return appData;
  }

  /// Clear all app data (for logout)
  static Future<void> clearAppData() async {
    debugPrint('🔄 Clearing app data...');

    final prefs = await SharedPreferences.getInstance();
    await prefs.clear();

    // Reset notifiers
    ticketCountNotifier.value = 0;

    // Stop services
    UnreadMessageService.stopPolling();

    debugPrint('✅ App data cleared');
  }

  /// Save user data
  static Future<void> saveUserData({
    required String userId,
    String? userName,
    String? userEmail,
  }) async {
    debugPrint('💾 Saving user data: ID=$userId, Name=$userName');

    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(USER_ID_PREFS_KEY, userId);

    if (userName != null) {
      await prefs.setString('user_name', userName);
    }

    if (userEmail != null) {
      await prefs.setString('user_email', userEmail);
    }

    debugPrint('✅ User data saved');
  }

  /// Get saved user data
  static Future<Map<String, dynamic>?> getUserData() async {
    final prefs = await SharedPreferences.getInstance();
    final userId = prefs.getString(USER_ID_PREFS_KEY);

    if (userId == null || userId.isEmpty) return null;

    return {
      'userId': userId,
      'userName': prefs.getString('user_name'),
      'userEmail': prefs.getString('user_email'),
    };
  }
}

/// Data class for app initialization
class AppInitData {
  final bool isLoggedIn;
  final String? userId;
  final int ticketCount;
  final String? userRole;

  AppInitData({
    required this.isLoggedIn,
    this.userId,
    required this.ticketCount,
    this.userRole,
  });

  @override
  String toString() {
    return 'AppInitData(isLoggedIn: $isLoggedIn, userId: $userId, ticketCount: $ticketCount, userRole: $userRole)';
  }
}
