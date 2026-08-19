import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

import '../config/app_config.dart';
import '../services/fcm_service.dart';

class GuestService {
  static String get endpoint => AppConfig.guest;

  static Future<Map<String, dynamic>> createGuestUser() async {
    try {
      final uri = Uri.parse(endpoint);
      final resp =
          await http.post(uri, headers: {'Accept': 'application/json'});

      if (resp.statusCode != 200 && resp.statusCode != 201) {
        return {'success': false, 'message': 'HTTP ${resp.statusCode}'};
      }

      final Map<String, dynamic> data =
          json.decode(resp.body) as Map<String, dynamic>;
      final status = (data['status'] ?? '').toString().toLowerCase();

      if (status != 'success' && status != 'ok') {
        return {
          'success': false,
          'message': data['message'] ?? 'Guest API returned failure'
        };
      }

      final prefs = await SharedPreferences.getInstance();
      await prefs.setBool('is_guest', true);
      await prefs.setBool('is_logged_in', true);

      final rawId = data['user_id'];
      String? id;
      if (rawId is String) id = rawId;
      if (rawId is int) id = rawId.toString();
      if (id != null) {
        await prefs.setString('user_id', id);
        await prefs.setString('userId', id);
        await prefs.setString('USER_ID', id);
      }

      if (data['user_name'] != null) {
        final name = data['user_name'].toString().trim();
        await prefs.setString('user_name', name);
        await prefs.setString('userName', name);
      }

      if (data['user_email'] != null) {
        final email = data['user_email'].toString().trim();
        await prefs.setString('user_email', email);
        await prefs.setString('userEmail', email);
      }

      String? savedToken;

      if (data['token'] != null && data['token'].toString().trim().isNotEmpty) {
        savedToken = data['token'].toString().trim();
        await prefs.setString('auth_token', savedToken);
      }

      // Always register the FCM token for push notifications
      if (id != null) {
        await FCMService.sendTokenToServer(userId: id);
      }

      final dynamic savedIdValue = prefs.get('userId') ?? prefs.get('user_id');
      final String? savedId = savedIdValue is String
          ? savedIdValue
          : (savedIdValue is int ? savedIdValue.toString() : null);
      final savedName =
          prefs.getString('userName') ?? prefs.getString('user_name');
      final savedEmail =
          prefs.getString('userEmail') ?? prefs.getString('user_email');

      // ignore: avoid_print
      print(
          '✅ Guest saved: id=$savedId name=$savedName email=$savedEmail token=${savedToken != null ? "present" : "absent"}');

      return {
        'success': true,
        'userId': savedId,
        'userName': savedName,
        'userEmail': savedEmail,
        'token': savedToken,
      };
    } catch (e) {
      return {'success': false, 'message': e.toString()};
    }
  }

  static Future<bool> isGuestUser() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getBool('is_guest') ?? false;
  }

  static Future<String?> getUserId() async {
    final prefs = await SharedPreferences.getInstance();
    final value = prefs.get('user_id');
    if (value is String) return value;
    if (value is int) return value.toString();
    return null;
  }

  static Future<String?> getAuthToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('auth_token');
  }

  static Future<Map<String, dynamic>> getUserData() async {
    final prefs = await SharedPreferences.getInstance();
    final dynamic storedId = prefs.get('user_id');
    final String? userId = storedId is String
        ? storedId
        : (storedId is int ? storedId.toString() : null);
    return {
      'isGuest': prefs.getBool('is_guest') ?? false,
      'userId': userId,
      'userName': prefs.getString('user_name'),
      'userEmail': prefs.getString('user_email'),
    };
  }

  static Future<void> clearGuestSession() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('is_guest');
    await prefs.remove('is_logged_in');
    await prefs.remove('user_id');
    await prefs.remove('user_name');
    await prefs.remove('user_email');
    await prefs.remove('auth_token');
    await prefs.remove('fcm_token');
  }
}
