import '../config/app_config.dart';

class InboxEntry {
  final String agentId;
  final String agentName;
  final String agentProfile;
  final String lastMessage;
  final String createdAt;
  final String isRead;
  final int unreadCount;
  final String userCurrentStatus;

  InboxEntry({
    required this.agentId,
    required this.agentName,
    required this.agentProfile,
    required this.lastMessage,
    required this.createdAt,
    required this.isRead,
    required this.unreadCount,
    required this.userCurrentStatus,
  });

  factory InboxEntry.fromJson(Map<String, dynamic> json) {
    return InboxEntry(
      agentId: (json['agent_id'] ?? '').toString(),
      agentName: json['agent_name'] ?? 'Agent',
      agentProfile: json['agent_profile'] ?? '',
      lastMessage: json['last_message'] ?? '',
      createdAt: json['created_at'] ?? '',
      isRead: json['is_read'] ?? 'Yes',
      unreadCount: json['unread_count'] ?? 0,
      userCurrentStatus: json['user_current_status'] ?? 'Unavailable',
    );
  }

  bool get hasUnread => unreadCount > 0;
  bool get isOnline => userCurrentStatus.toLowerCase() == 'active';

  String? get fullProfileUrl {
    if (agentProfile.isEmpty) return null;
    String imageUrl = agentProfile.replaceAll('\\', '/');
      if (imageUrl.startsWith('http')) {
        return imageUrl;
      } else {
        return '${AppConfig.staticAssetBase}/$imageUrl';
      }
  }

  String get messagePreview {
    if (lastMessage.isEmpty || lastMessage.trim().isEmpty) {
      return 'No messages yet';
    }
    return lastMessage.length > 50
        ? '${lastMessage.substring(0, 50)}...'
        : lastMessage;
  }

  // ✅ NEW: Time ago format for unread messages
  String get timeFormatted {
    try {
      final messageTime = DateTime.parse(createdAt);
      final now = DateTime.now();
      final difference = now.difference(messageTime);

      // ✅ Show "ago" format for unread messages
      if (hasUnread) {
        if (difference.inMinutes < 1) {
          return 'now';
        } else if (difference.inMinutes < 60) {
          return '${difference.inMinutes} min ago';
        } else if (difference.inHours < 24) {
          return '${difference.inHours} hr ago';
        } else if (difference.inDays < 7) {
          return '${difference.inDays} day${difference.inDays > 1 ? 's' : ''} ago';
        } else {
          return '${(difference.inDays / 7).floor()} week${(difference.inDays / 7).floor() > 1 ? 's' : ''} ago';
        }
      } else {
        // ✅ Regular time format for read messages
        if (difference.inDays == 0) {
          return '${messageTime.hour.toString().padLeft(2, '0')}:${messageTime.minute.toString().padLeft(2, '0')}';
        } else if (difference.inDays == 1) {
          return 'Yesterday';
        } else if (difference.inDays < 7) {
          const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
          return weekDays[messageTime.weekday - 1];
        } else {
          return '${messageTime.day}/${messageTime.month}/${messageTime.year}';
        }
      }
    } catch (e) {
      return 'Recently';
    }
  }

  DateTime? get messageDateTime {
    try {
      return DateTime.parse(createdAt);
    } catch (e) {
      return null;
    }
  }
}
