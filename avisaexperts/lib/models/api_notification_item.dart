// lib/models/api_notification_item.dart
import 'dart:developer';

import 'package:intl/intl.dart'; // For parsing date and time

import '../config/app_config.dart';

class ApiNotificationItem {
  final String title;
  final String message;
  final String? mediaPath; // Nullable, as it can be null
  final String dateStr;   // API "date" as "YYYY-MM-DD"
  final String timeStr;   // API "time" as "HH:MM:SS"

  ApiNotificationItem({
    required this.title,
    required this.message,
    this.mediaPath,
    required this.dateStr,
    required this.timeStr,
  });

  factory ApiNotificationItem.fromJson(Map<String, dynamic> json) {
    return ApiNotificationItem(
      title: json['title']?.toString() ?? 'No Title',
      message: json['message']?.toString() ?? 'No Message',
      mediaPath: json['media_path']?.toString(), // Will be null if API sends null
      dateStr: json['date']?.toString() ?? '',
      timeStr: json['time']?.toString() ?? '',
    );
  }

  // Helper to combine date and time strings into a DateTime object
  DateTime get timestamp {
    if (dateStr.isEmpty || timeStr.isEmpty) {
      // Return a default past date if date/time is missing, or handle error
      return DateTime.fromMillisecondsSinceEpoch(0);
    }
    try {
      // Combine date and time strings and parse
      final fullDateTimeStr = '$dateStr $timeStr';
      // Adjust format if API uses 'YYYY-MM-DD HH:MM:SS' for combined string
      return DateFormat('yyyy-MM-dd HH:mm:ss').parse(fullDateTimeStr);
    } catch (e) {
      log("Error parsing timestamp for notification '$title': $e. Date: $dateStr, Time: $timeStr");
      return DateTime.fromMillisecondsSinceEpoch(0); // Fallback
    }
  }

  // Helper to get the full image URL if media_path exists
  String? get fullImageUrl {
    if (mediaPath != null && mediaPath!.isNotEmpty) {
      // Prepend your base URL for images if media_path is relative
      // Example: If your images are at https://avisaexperts.com/uploads/images/...
      // and media_path is "uploads/images/1747132003_133844445190872191.jpg"
      // This needs to match your actual image hosting structure.
      // If media_path is already a full URL, you might not need to prepend.
      if (mediaPath!.startsWith('http://') || mediaPath!.startsWith('https://')) {
        return mediaPath;
      }
      // Assuming media_path from API is like "uploads/images/image.jpg"
      // and your base URL is AppConfig.staticAssetBase
      return "${AppConfig.staticAssetBase}/$mediaPath";
    }
    return null;
  }
}
