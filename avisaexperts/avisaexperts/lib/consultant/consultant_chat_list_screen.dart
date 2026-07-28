import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'dart:async';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:cached_network_image/cached_network_image.dart';

import 'consultant_model.dart';
import '../pages/chat_screen.dart';

class ConsultantChatListScreen extends StatefulWidget {
  const ConsultantChatListScreen({super.key});

  @override
  State<ConsultantChatListScreen> createState() =>
      _ConsultantChatListScreenState();
}

class _ConsultantChatListScreenState extends State<ConsultantChatListScreen>
    with WidgetsBindingObserver {
  String? _currentUserId;
  bool _isLoading = true;
  List<ConsultantUserItem> _allUsers = [];
  List<ConsultantUserItem> _filteredUsers = [];
  String _searchQuery = '';
  final TextEditingController _searchController = TextEditingController();
  Timer? _pollingTimer;
  bool _isAppInForeground = true;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    _loadCurrentUser();
    _searchController.addListener(_onSearchChanged);
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    _searchController.dispose();
    _pollingTimer?.cancel();
    super.dispose();
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    switch (state) {
      case AppLifecycleState.resumed:
        _isAppInForeground = true;
        _startPolling();
        break;
      case AppLifecycleState.paused:
      case AppLifecycleState.inactive:
      case AppLifecycleState.detached:
      case AppLifecycleState.hidden:
        _isAppInForeground = false;
        _pollingTimer?.cancel();
        break;
    }
  }

  void _onSearchChanged() {
    setState(() {
      _searchQuery = _searchController.text;
      _filteredUsers = _allUsers.where((user) {
        return user.userName
                .toLowerCase()
                .contains(_searchQuery.toLowerCase()) ||
            user.userEmail.toLowerCase().contains(_searchQuery.toLowerCase()) ||
            user.userMobile.contains(_searchQuery);
      }).toList();
    });
  }

  Future<void> _loadCurrentUser() async {
    final prefs = await SharedPreferences.getInstance();
    dynamic userIdValue = prefs.get('userId');
    String? loadedUserId;
    if (userIdValue is int) {
      loadedUserId = userIdValue.toString();
    } else if (userIdValue is String) {
      loadedUserId = userIdValue;
    }

    if (mounted) {
      setState(() {
        _currentUserId = loadedUserId;
        _isLoading = false;
      });
    }

    if (_currentUserId != null) {
      await _fetchUsers();
      _startPolling();
    }
  }

  void _startPolling() {
    _pollingTimer?.cancel();
    _pollingTimer = Timer.periodic(const Duration(seconds: 5), (timer) {
      if (mounted && _isAppInForeground && _currentUserId != null) {
        _fetchUsersSilently();
      } else if (!mounted || !_isAppInForeground) {
        timer.cancel();
      }
    });
  }

  Future<void> _fetchUsersSilently() async {
    try {
      final users = await _fetchUsersFromApi();
      if (mounted) {
        setState(() {
          _allUsers = users;
          _filteredUsers = _searchQuery.isEmpty
              ? users
              : users.where((user) {
                  return user.userName
                          .toLowerCase()
                          .contains(_searchQuery.toLowerCase()) ||
                      user.userEmail
                          .toLowerCase()
                          .contains(_searchQuery.toLowerCase()) ||
                      user.userMobile.contains(_searchQuery);
                }).toList();
        });
      }
    } catch (e) {
      debugPrint('Silent refresh error: $e');
    }
  }

  Future<List<ConsultantUserItem>> _fetchUsersFromApi() async {
    final String url = _currentUserId != null
        ? '/users-all-data?id=$_currentUserId'
        : '/users-all-data';
    final response = await http.get(
      Uri.parse(url),
      headers: {'Content-Type': 'application/json'},
    ).timeout(const Duration(seconds: 30));

    if (response.statusCode == 200) {
      final dynamic responseData = json.decode(response.body);

      if (responseData is List) {
        final List<ConsultantUserItem> users = responseData
            .map((jsonItem) {
              try {
                return ConsultantUserItem.fromJson(
                    jsonItem as Map<String, dynamic>);
              } catch (e) {
                debugPrint('Error parsing user item: $e');
                return null;
              }
            })
            .where((item) => item != null)
            .cast<ConsultantUserItem>()
            .toList();

        users.sort((a, b) {
          if (a.hasUnread != b.hasUnread) {
            return a.hasUnread ? -1 : 1;
          }
          if (a.isOnline != b.isOnline) {
            return a.isOnline ? -1 : 1;
          }
          if (a.messageDateTime != null && b.messageDateTime != null) {
            return b.messageDateTime!.compareTo(a.messageDateTime!);
          }
          return 0;
        });

        return users;
      } else if (responseData is Map && responseData['success'] == true) {
        final List<dynamic> usersJson = responseData['data'] ?? [];
        final List<ConsultantUserItem> users = usersJson
            .map((jsonItem) {
              try {
                return ConsultantUserItem.fromJson(
                    jsonItem as Map<String, dynamic>);
              } catch (e) {
                return null;
              }
            })
            .where((item) => item != null)
            .cast<ConsultantUserItem>()
            .toList();

        users.sort((a, b) {
          if (a.hasUnread != b.hasUnread) {
            return a.hasUnread ? -1 : 1;
          }
          if (a.isOnline != b.isOnline) {
            return a.isOnline ? -1 : 1;
          }
          if (a.messageDateTime != null && b.messageDateTime != null) {
            return b.messageDateTime!.compareTo(a.messageDateTime!);
          }
          return 0;
        });

        return users;
      } else {
        throw Exception('Invalid response format');
      }
    } else {
      throw Exception('Failed to load users: ${response.statusCode}');
    }
  }

  Future<void> _fetchUsers() async {
    try {
      final users = await _fetchUsersFromApi();
      if (mounted) {
        setState(() {
          _allUsers = users;
          _filteredUsers = _searchQuery.isEmpty
              ? users
              : users.where((user) {
                  return user.userName
                          .toLowerCase()
                          .contains(_searchQuery.toLowerCase()) ||
                      user.userEmail
                          .toLowerCase()
                          .contains(_searchQuery.toLowerCase()) ||
                      user.userMobile.contains(_searchQuery);
                }).toList();
        });
      }
    } catch (e) {
      debugPrint('Error fetching users: $e');
    }
  }

  void _openChat(ConsultantUserItem user) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => ChatScreen(
          advisorId: user.id.toString(),
          advisorName: user.userName,
          advisorImageUrl: user.fullProfileUrl,
          contactEmail: user.userEmail,
          contactPhone: user.userMobile,
          contactStatus: user.userCurrentStatus,
          contactRole: user.userRole,
          contactTotalOrders: user.totalOrder,
        ),
      ),
    ).then((_) {
      _fetchUsers();
    });
  }

  Widget _buildSearchBar() {
    return Container(
      padding: const EdgeInsets.all(12),
      child: TextField(
        controller: _searchController,
        decoration: InputDecoration(
          prefixIcon: const Icon(Icons.search, color: Colors.black54, size: 20),
          hintText: 'Search for Users',
          hintStyle: const TextStyle(color: Colors.black54, fontSize: 14),
          filled: true,
          fillColor: Colors.grey[100],
          contentPadding:
              const EdgeInsets.symmetric(vertical: 12, horizontal: 16),
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(25),
            borderSide: BorderSide.none,
          ),
          focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(25),
            borderSide: BorderSide(color: Colors.grey[300]!),
          ),
        ),
        style: const TextStyle(fontSize: 14),
      ),
    );
  }

  Widget _buildUserTile(ConsultantUserItem user) {
    final isOffline = !user.isOnline;

    return ListTile(
      contentPadding: const EdgeInsets.symmetric(horizontal: 8, vertical: 8),
      leading: Stack(
        children: [
          Opacity(
            opacity: isOffline ? 0.5 : 1.0,
            child: CircleAvatar(
              radius: 26,
              backgroundColor: const Color(0xFF0D47A1),
              backgroundImage: user.fullProfileUrl != null
                  ? CachedNetworkImageProvider(user.fullProfileUrl!)
                  : null,
              child: user.fullProfileUrl == null
                  ? Text(
                      user.userName.length >= 2
                          ? user.userName.substring(0, 2).toUpperCase()
                          : user.userName.toUpperCase(),
                      style: const TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.bold,
                        fontSize: 14,
                      ),
                    )
                  : null,
            ),
          ),
          Positioned(
            bottom: 2,
            right: 2,
            child: Container(
              width: 12,
              height: 12,
              decoration: BoxDecoration(
                color: user.isOnline ? Colors.green : Colors.grey,
                shape: BoxShape.circle,
                border: Border.all(color: Colors.white, width: 2),
              ),
            ),
          ),
        ],
      ),
      title: Row(
        children: [
          Expanded(
            child: Text(
              user.userName,
              style: TextStyle(
                fontWeight: user.hasUnread ? FontWeight.bold : FontWeight.w600,
                fontSize: 16,
                color: isOffline ? Colors.grey : Colors.black87,
              ),
            ),
          ),
          if (isOffline)
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
              decoration: BoxDecoration(
                color: Colors.grey[200],
                borderRadius: BorderRadius.circular(8),
              ),
              child: Text(
                'Offline',
                style: TextStyle(
                  color: Colors.grey[600],
                  fontSize: 10,
                  fontWeight: FontWeight.w500,
                ),
              ),
            ),
        ],
      ),
      subtitle: Text(
        user.hasUnread
            ? '${user.countStatus} new message${user.countStatus > 1 ? 's' : ''}'
            : user.userEmail,
        maxLines: 1,
        overflow: TextOverflow.ellipsis,
        style: TextStyle(
          color: user.hasUnread
              ? const Color(0xFF0D47A1)
              : (isOffline ? Colors.grey[400] : Colors.grey[600]),
          fontWeight: user.hasUnread ? FontWeight.w600 : FontWeight.normal,
          fontSize: 13,
        ),
      ),
      trailing: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        crossAxisAlignment: CrossAxisAlignment.end,
        children: [
          Text(
            user.timeFormatted,
            style: TextStyle(
              color: isOffline
                  ? Colors.grey[400]
                  : (user.hasUnread
                      ? const Color(0xFF0D47A1)
                      : Colors.grey[500]),
              fontSize: 11,
              fontWeight: user.hasUnread ? FontWeight.w600 : FontWeight.normal,
            ),
          ),
          const SizedBox(height: 6),
          if (user.hasUnread)
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
              decoration: BoxDecoration(
                color: _getUnreadBadgeColor(user.countStatus),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Text(
                user.countStatus.toString(),
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 11,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
        ],
      ),
      onTap: () => _openChat(user),
    );
  }

  Color _getUnreadBadgeColor(int count) {
    if (count >= 5) return Colors.red;
    if (count >= 3) return Colors.orange;
    return const Color(0xFF0D47A1);
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.chat_bubble_outline, size: 80, color: Colors.grey[300]),
          const SizedBox(height: 16),
          Text(
            'No Conversations Yet',
            style: TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.bold,
              color: Colors.grey[700],
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'Users will appear here once they\nstart a conversation with you.',
            textAlign: TextAlign.center,
            style: TextStyle(
              fontSize: 14,
              color: Colors.grey[500],
              height: 1.5,
            ),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading || _currentUserId == null) {
      return Scaffold(
        backgroundColor: Colors.white,
        appBar: AppBar(
          backgroundColor: Colors.white,
          elevation: 0.5,
          title: const Text(
            'Chats',
            style: TextStyle(
                color: Colors.black, fontWeight: FontWeight.bold, fontSize: 20),
          ),
        ),
        body: const Center(child: CircularProgressIndicator()),
      );
    }

    final totalUnread = _filteredUsers
        .where((u) => u.hasUnread)
        .fold(0, (sum, u) => sum + u.countStatus);

    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0.5,
        title: const Text(
          'Chats',
          style: TextStyle(
              color: Colors.black, fontWeight: FontWeight.bold, fontSize: 20),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.more_vert, color: Colors.black),
            onPressed: () => _showMoreOptions(),
          ),
        ],
      ),
      body: Column(
        children: [
          _buildSearchBar(),
          if (totalUnread > 0)
            Container(
              width: double.infinity,
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              color: Colors.blue[50],
              child: Text(
                '$totalUnread unread message${totalUnread > 1 ? 's' : ''} from ${_filteredUsers.where((u) => u.hasUnread).length} user${_filteredUsers.where((u) => u.hasUnread).length > 1 ? 's' : ''}',
                style: TextStyle(
                  color: Colors.blue[700],
                  fontWeight: FontWeight.w500,
                  fontSize: 12,
                ),
              ),
            ),
          Expanded(
            child: _filteredUsers.isEmpty
                ? RefreshIndicator(
                    onRefresh: _fetchUsers,
                    child: _buildEmptyState(),
                  )
                : RefreshIndicator(
                    onRefresh: _fetchUsers,
                    child: ListView.separated(
                      padding: const EdgeInsets.symmetric(horizontal: 4),
                      itemCount: _filteredUsers.length,
                      separatorBuilder: (context, index) {
                        return Divider(
                          color: Colors.grey.withOpacity(0.2),
                          height: 1,
                          indent: 16,
                          endIndent: 16,
                        );
                      },
                      itemBuilder: (context, index) {
                        return _buildUserTile(_filteredUsers[index]);
                      },
                    ),
                  ),
          ),
        ],
      ),
    );
  }

  void _showMoreOptions() {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
      ),
      builder: (context) => Container(
        padding: const EdgeInsets.all(20),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            ListTile(
              leading: const Icon(Icons.mark_chat_read),
              title: const Text('Mark All as Read'),
              onTap: () {
                Navigator.pop(context);
              },
            ),
            ListTile(
              leading: const Icon(Icons.settings),
              title: const Text('Chat Settings'),
              onTap: () {
                Navigator.pop(context);
              },
            ),
          ],
        ),
      ),
    );
  }
}
