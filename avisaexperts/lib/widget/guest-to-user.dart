import 'dart:convert';
import 'dart:io';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import 'package:mime/mime.dart';
import 'package:http_parser/http_parser.dart';

import '../config/app_config.dart';

class GuestConversionService {
  static String get upgradeEndpoint => AppConfig.guestUpgrade;

  // Flag to track if the dialog has been shown in the current app session.
  // This is reset every time the app starts.
  static bool _dialogShownThisSession = false;

  /// Track guest app opens and return true if the conversion dialog should be shown.
  static Future<bool> shouldShowConversionDialog() async {
    final prefs = await SharedPreferences.getInstance();
    final isGuest = prefs.getBool('is_guest') ?? false;

    // 1. If not a guest, never show
    if (!isGuest) return false;

    // 2. If already shown in the current app session, don't show again
    if (_dialogShownThisSession) {
      debugPrint('Dialog already shown this session. Skipping.');
      return false;
    }

    // Get current open count
    final openCount = prefs.getInt('guest_open_count') ?? 0;

    // Only increment open count on the very first check of a new session
    if (!_dialogShownThisSession) {
      final newCount = openCount + 1;
      await prefs.setInt('guest_open_count', newCount);
      debugPrint('📊 Guest app open count: $newCount');
    }

    final currentOpenCount = prefs.getInt('guest_open_count') ?? 0;

    // 3. Show dialog if opened at least twice
    if (currentOpenCount > 1) {
      // Mark as shown for this session to prevent re-appearing on the same app launch
      _dialogShownThisSession = true;
      debugPrint('✅ Condition met. Should show conversion dialog.');
      return true;
    }

    debugPrint(
        'Condition not met (Open count: $currentOpenCount). Not showing dialog.');
    return false;
  }

  /// Convert guest to full user by updating their details
  static Future<Map<String, dynamic>> convertGuestToUser({
    required String guestUserId,
    required String name,
    required String countryCode,
    required String phone,
    required String password,
    File? profileImage,
  }) async {
    try {
      var request = http.MultipartRequest(
        'POST',
        Uri.parse(upgradeEndpoint),
      );

      // Add form fields
      request.fields['user_id'] = guestUserId.toString();
      request.fields['user_name'] = name;
      request.fields['country_code'] = countryCode;
      request.fields['user_mobile'] = phone;
      request.fields['user_password'] = password;
      request.fields['specialization'] = 'basicM';
      request.fields['form_submitted'] = 'Yes';

      // Add profile image if selected with proper MIME type
      if (profileImage != null) {
        // Get the MIME type from the file
        final mimeType = lookupMimeType(profileImage.path) ?? 'image/jpeg';
        final mimeTypeParts = mimeType.split('/');

        request.files.add(
          await http.MultipartFile.fromPath(
            'user_profile',
            profileImage.path,
            contentType: MediaType(mimeTypeParts[0], mimeTypeParts[1]),
          ),
        );
      }

      // Send request
      var streamedResponse = await request.send();
      var response = await http.Response.fromStream(streamedResponse);

      debugPrint('📡 Guest conversion response: ${response.body}');

      if (response.statusCode != 200 && response.statusCode != 201) {
        return {
          'success': false,
          'message': 'Server error: HTTP ${response.statusCode}'
        };
      }

      final Map<String, dynamic> data = json.decode(response.body);

      // Check for success in response
      if (data['success'] == true ||
          data['status']?.toString().toLowerCase() == 'success' ||
          (data['message']?.toString().toLowerCase().contains('success') ??
              false)) {
        // Update SharedPreferences
        final prefs = await SharedPreferences.getInstance();

        await prefs.setBool('is_guest', false);
        await prefs.setBool('is_logged_in', true);

        // Update user details
        await prefs.setString('user_name', name.trim());
        await prefs.setString('userName', name.trim());
        await prefs.setString('user_mobile', phone.trim());
        await prefs.setString('userPhone', phone.trim());
        await prefs.setString('user_phone', phone.trim());

        await prefs.setString('specialization', 'basicM');
        await prefs.setString('form_submitted', 'Yes');

        if (data['token'] != null && data['token'].toString().isNotEmpty) {
          await prefs.setString('auth_token', data['token'].toString());
        }

        // Reset guest-related counters
        await prefs.remove('guest_open_count');

        debugPrint('✅ Guest converted to user: $name (ID: $guestUserId)');

        return {
          'success': true,
          'message': data['message'] ??
              'Account upgraded successfully! Welcome aboard! 🎉',
          'userId': guestUserId,
          'userData': data['user'] ?? data['data'],
        };
      } else {
        return {
          'success': false,
          'message': data['message'] ??
              data['error'] ??
              'Upgrade failed. Please try again.'
        };
      }
    } catch (e) {
      debugPrint('❌ Error converting guest: $e');
      if (e is SocketException) {
        return {
          'success': false,
          'message': 'Connection error. Please check your internet.'
        };
      }
      return {'success': false, 'message': 'An unexpected error occurred.'};
    }
  }
}
