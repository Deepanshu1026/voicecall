// lib/models/api_notification_item.dart
import 'dart:developer';

import 'package:intl/intl.dart';

import '../config/app_config.dart';

class ApiNotificationItem {
  final String id;
  final String title;
  final String message;
  final String? mediaPath;
  final String dateStr;
  final String timeStr;
  final String type;
  final bool isRead;
  final String link;

  ApiNotificationItem({
    required this.id,
    required this.title,
    required this.message,
    this.mediaPath,
    required this.dateStr,
    required this.timeStr,
    this.type = 'general',
    this.isRead = false,
    this.link = '',
  });

  factory ApiNotificationItem.fromJson(Map<String, dynamic> json) {
    return ApiNotificationItem(
      id: json['id']?.toString() ?? '',
      title: json['title']?.toString() ?? 'No Title',
      message: json['message']?.toString() ?? 'No Message',
      mediaPath: json['media_path']?.toString(),
      dateStr: json['date']?.toString() ?? '',
      timeStr: json['time']?.toString() ?? '',
      type: json['type']?.toString() ?? 'general',
      isRead: json['is_read'] == true || json['is_read']?.toString() == 'Yes',
      link: json['link']?.toString() ?? '',
    );
  }

  DateTime get timestamp {
    if (dateStr.isEmpty || timeStr.isEmpty) {
      return DateTime.fromMillisecondsSinceEpoch(0);
    }
    try {
      final fullDateTimeStr = '$dateStr $timeStr';
      return DateFormat('yyyy-MM-dd HH:mm:ss').parse(fullDateTimeStr);
    } catch (e) {
      log("Error parsing timestamp for notification '$title': $e");
      return DateTime.fromMillisecondsSinceEpoch(0);
    }
  }

  String? get fullImageUrl {
    if (mediaPath != null && mediaPath!.isNotEmpty) {
      if (mediaPath!.startsWith('http://') || mediaPath!.startsWith('https://')) {
        return mediaPath;
      }
      return "${AppConfig.staticAssetBase}/$mediaPath";
    }
    return null;
  }
}
