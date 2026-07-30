import 'package:shared_preferences/shared_preferences.dart';
import '../config/app_config.dart';

class ConsultantData {
  final String userId;
  final String name;
  final String email;
  final String role;
  final String profile;
  final String expertise;
  final String language;
  final int experience;
  final int totalOrder;
  final String sessionToken;
  final String? accessToken;

  ConsultantData({
    required this.userId,
    required this.name,
    required this.email,
    required this.role,
    required this.profile,
    required this.expertise,
    required this.language,
    required this.experience,
    required this.totalOrder,
    required this.sessionToken,
    this.accessToken,
  });

  factory ConsultantData.fromJson(Map<String, dynamic> json) {
    return ConsultantData(
      userId: (json['user_id'] ?? '').toString(),
      name: json['name'] ?? '',
      email: json['email'] ?? '',
      role: json['role'] ?? 'Agent',
      profile: json['profile'] ?? '',
      expertise: json['expertise'] ?? '',
      language: json['language'] ?? '',
      experience: json['experience'] ?? 0,
      totalOrder: json['total_order'] ?? 0,
      sessionToken: json['session_token'] ?? '',
      accessToken: json['accessToken']?.toString() ?? json['access_token']?.toString(),
    );
  }

  String? get fullProfileUrl {
    if (profile.isEmpty) return null;
    String imageUrl = profile.replaceAll('\\', '/');
    if (imageUrl.startsWith('http')) {
      return imageUrl;
    } else {
      return '${AppConfig.staticAssetBase}/$imageUrl';
    }
  }

  Future<void> saveToPrefs() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('userId', userId);
    await prefs.setString('userName', name);
    await prefs.setString('userEmail', email);
    await prefs.setString('userProfile', profile);
    await prefs.setString('userRole', 'consultant');
    await prefs.setString('consultantRole', role);
    await prefs.setString('consultantExpertise', expertise);
    await prefs.setString('consultantLanguage', language);
    await prefs.setInt('consultantExperience', experience);
    await prefs.setInt('consultantTotalOrders', totalOrder);
    await prefs.setString('consultantSessionToken', sessionToken);
    if (accessToken != null && accessToken!.isNotEmpty) {
      await prefs.setString('accessToken', accessToken!);
    }
  }

  static Future<ConsultantData?> loadFromPrefs() async {
    final prefs = await SharedPreferences.getInstance();
    final userId = prefs.getString('userId');
    if (userId == null || userId.isEmpty) return null;
    final userRole = prefs.getString('userRole');
    if (userRole != 'consultant') return null;

    return ConsultantData(
      userId: userId,
      name: prefs.getString('userName') ?? '',
      email: prefs.getString('userEmail') ?? '',
      role: prefs.getString('consultantRole') ?? 'Agent',
      profile: prefs.getString('userProfile') ?? '',
      expertise: prefs.getString('consultantExpertise') ?? '',
      language: prefs.getString('consultantLanguage') ?? '',
      experience: prefs.getInt('consultantExperience') ?? 0,
      totalOrder: prefs.getInt('consultantTotalOrders') ?? 0,
      sessionToken: prefs.getString('consultantSessionToken') ?? '',
      accessToken: prefs.getString('accessToken'),
    );
  }
}

class ConsultantUserItem {
  final String id;
  final String userName;
  final String userEmail;
  final String userMobile;
  final String userCurrentStatus;
  final String userRole;
  final String formSubmitted;
  final String userProfile;
  final int totalOrder;
  final int countStatus;
  final String lastMessageTime;

  ConsultantUserItem({
    required this.id,
    required this.userName,
    required this.userEmail,
    required this.userMobile,
    required this.userCurrentStatus,
    required this.userRole,
    required this.formSubmitted,
    required this.userProfile,
    required this.totalOrder,
    required this.countStatus,
    required this.lastMessageTime,
  });

  factory ConsultantUserItem.fromJson(Map<String, dynamic> json) {
    return ConsultantUserItem(
      id: (json['id'] ?? '').toString(),
      userName: json['user_name'] ?? 'User',
      userEmail: json['user_email'] ?? '',
      userMobile: json['user_mobile']?.toString() ?? '',
      userCurrentStatus: json['user_current_status'] ?? 'Unavailable',
      userRole: json['user_role'] ?? 'User',
      formSubmitted: json['form_submitted'] ?? 'No',
      userProfile: json['user_profile'] ?? '',
      totalOrder: json['total_order'] ?? 0,
      countStatus: json['count_status'] ?? 0,
      lastMessageTime: json['last_message_time'] ?? '',
    );
  }

  bool get isOnline => userCurrentStatus.toLowerCase() == 'active';
  bool get hasUnread => countStatus > 0;

  String? get fullProfileUrl {
    if (userProfile.isEmpty) return null;
    String imageUrl = userProfile.replaceAll('\\', '/');
    if (imageUrl.startsWith('http')) {
      return imageUrl;
    } else {
      return '${AppConfig.staticAssetBase}/$imageUrl';
    }
  }

  String get timeFormatted {
    try {
      final messageTime = DateTime.parse(lastMessageTime);
      final now = DateTime.now();
      final difference = now.difference(messageTime);

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
      return DateTime.parse(lastMessageTime);
    } catch (e) {
      return null;
    }
  }
}
