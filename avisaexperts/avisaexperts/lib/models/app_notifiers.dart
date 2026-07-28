// lib/app_notifiers.dart
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'dart:async';
import 'dart:developer';

import 'package:shared_preferences/shared_preferences.dart';

// Global notifier to hold the current count of tickets. Initialize to 0.
final ValueNotifier<int> ticketCountNotifier = ValueNotifier(0);

// Global notifier to hold the current count of unread messages. Initialize to 0.
final ValueNotifier<int> unreadMessageCountNotifier = ValueNotifier(0);

// Key for User ID (if you use it elsewhere, otherwise can be defined where needed)
const String USER_ID_PREFS_KEY = 'userId';

// Helper function to fetch ticket count directly from API
Future<int> fetchTicketCountFromApi(int userId) async {
  final url = Uri.parse(
      'https://avisaexperts.com/getMyTickets.php'); // Your API endpoint
  log("fetchTicketCountFromApi: Fetching for User ID: $userId from $url");

  try {
    final response = await http.post(
      url,
      body: {'user_id': userId.toString()},
    ).timeout(const Duration(seconds: 10)); // Reasonable timeout

    if (response.statusCode == 200) {
      if (response.body.trim().isEmpty) {
        log("fetchTicketCountFromApi: Empty response body.");
        return 0;
      }
      final decodedResponse = jsonDecode(response.body);
      if (decodedResponse is Map<String, dynamic> &&
          decodedResponse['count'] is int) {
        final count = decodedResponse['count'] as int;
        log(
            "fetchTicketCountFromApi: Successfully fetched count from API 'count' key: $count");
        return count;
      } else {
        log(
            "fetchTicketCountFromApi: 'count' key missing or not an int in response. Response: $decodedResponse");
        // Fallback: If 'count' is missing but 'data' array exists, count the array
        if (decodedResponse is Map<String, dynamic> &&
            decodedResponse['data'] is List) {
          final dataListCount = (decodedResponse['data'] as List).length;
          log(
              "fetchTicketCountFromApi: Fallback - counted 'data' array length: $dataListCount");
          return dataListCount;
        }
        return 0;
      }
    } else {
      log(
          "fetchTicketCountFromApi: Server error (Code: ${response.statusCode})");
      return 0;
    }
  } catch (e) {
    log("fetchTicketCountFromApi: Error fetching count: $e");
    return 0; // Return 0 on any error
  }
}

// ✅ NEW: Helper function to fetch unread message count from API
Future<int> fetchUnreadMessageCountFromApi(String userId) async {
  if (userId.trim().isEmpty) {
    log("fetchUnreadMessageCountFromApi: Empty userId passed, returning 0");
    return 0;
  }

  final url =
      Uri.parse('https://avisaexperts.com/allMessages.php?receiver_id=$userId');
  log(
      "fetchUnreadMessageCountFromApi: Fetching for User ID: $userId from $url");

  try {
    final response = await http.get(
      url,
      headers: {'Content-Type': 'application/json'},
    ).timeout(const Duration(seconds: 15));

    if (response.statusCode == 200) {
      if (response.body.trim().isEmpty) {
        log("fetchUnreadMessageCountFromApi: Empty response body.");
        return 0;
      }

      final decodedResponse = jsonDecode(response.body);

      if (decodedResponse is Map<String, dynamic> &&
          decodedResponse['success'] == true) {
        // ✅ Get total_unread_count from API response
        final count = decodedResponse['total_unread_count'] ?? 0;
        log(
            "fetchUnreadMessageCountFromApi: Successfully fetched unread count: $count");
        return count is int ? count : 0;
      } else {
        log(
            "fetchUnreadMessageCountFromApi: Invalid response format. Response: $decodedResponse");
        return 0;
      }
    } else {
      log(
          "fetchUnreadMessageCountFromApi: Server error (Code: ${response.statusCode})");
      return 0;
    }
  } catch (e) {
    log("fetchUnreadMessageCountFromApi: Error fetching count: $e");
    return 0;
  }
}

// ✅ NEW: Global service to start unread message polling
class UnreadMessageService {
  static Timer? _pollingTimer;
  static bool _isPolling = false;
  static String? _currentUserId;

  // Start polling for unread messages
  static Future<void> startPolling({Duration interval = const Duration(seconds: 10)}) async {
    if (_isPolling) return;

    // Get user ID from SharedPreferences (try common variants)
    final prefs = await SharedPreferences.getInstance();
    dynamic userIdValue = prefs.get(USER_ID_PREFS_KEY) ??
        prefs.get('user_id') ??
        prefs.get('userId');

    if (userIdValue == null) {
      log("UnreadMessageService: No user ID found in prefs, will not start polling");
      return;
    }

    // normalize to string
    if (userIdValue is int) {
      _currentUserId = userIdValue.toString();
    } else if (userIdValue is String) {
      _currentUserId = userIdValue;
    } else {
      _currentUserId = userIdValue.toString();
    }

    // Validate user id string
    if (_currentUserId == null || _currentUserId!.trim().isEmpty || _currentUserId == '0') {
      log("UnreadMessageService: Invalid/empty user id ($_currentUserId), will not start polling");
      return;
    }

    _isPolling = true;
    log(
        "🔔 UnreadMessageService: Starting polling every ${interval.inSeconds} seconds for user $_currentUserId");

    // Initial fetch
    await _fetchAndUpdateCount();

    // Start periodic polling
    _pollingTimer = Timer.periodic(interval, (timer) {
      _fetchAndUpdateCount();
    });
  }

  // Stop polling
  static void stopPolling() {
    _pollingTimer?.cancel();
    _pollingTimer = null;
    _isPolling = false;
    log("⏹️ UnreadMessageService: Stopped polling");
  }

  // Fetch count and update notifier
  static Future<void> _fetchAndUpdateCount() async {
    if (_currentUserId == null || _currentUserId!.trim().isEmpty) {
      log("UnreadMessageService: _currentUserId empty, skipping fetch");
      return;
    }

    try {
      final count = await fetchUnreadMessageCountFromApi(_currentUserId!);
      if (unreadMessageCountNotifier.value != count) {
        unreadMessageCountNotifier.value = count;
        log("🔔 UnreadMessageService: Updated count to $count");
      }
    } catch (e) {
      log("❌ UnreadMessageService: Error updating count: $e");
    }
  }

  // Manual refresh
  static Future<void> refreshCount() async {
    await _fetchAndUpdateCount();
  }

  // Check if polling is active
  static bool get isPolling => _isPolling;
}