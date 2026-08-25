import 'dart:math' as math;

import 'package:avisa_experts/pages/advisor_list_screen.dart';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'dart:async';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../models/message_model.dart';
import '../pages/chat_screen.dart';
import '../config/app_config.dart';

class InboxScreen extends StatefulWidget {
  const InboxScreen({super.key});

  @override
  State<InboxScreen> createState() => _InboxScreenState();
}

class _ConcentricRingsPainter extends CustomPainter {
  final Animation<double>? animation;

  _ConcentricRingsPainter({this.animation});

  @override
  void paint(Canvas canvas, Size size) {
    final Paint paint = Paint()
      ..color = Colors.grey.withOpacity(0.08)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1.0;

    final center = size.center(Offset.zero);

    // Draw subtle concentric dotted circles
    for (int i = 1; i <= 3; i++) {
      final radius = (size.width / 7) * i;
      _drawDottedCircle(canvas, center, radius, paint, i);
    }
  }

  void _drawDottedCircle(
      Canvas canvas, Offset center, double radius, Paint paint, int ringIndex) {
    const int dotCount = 36;
    const double dotRadius = 0.8;

    for (int i = 0; i < dotCount; i++) {
      final double baseAngle = (i * 2 * math.pi) / dotCount;
      final double animatedAngle = animation != null
          ? baseAngle + (animation!.value * 2 * math.pi * 0.05 * ringIndex)
          : baseAngle;
      final double x = center.dx + radius * math.cos(animatedAngle);
      final double y = center.dy + radius * math.sin(animatedAngle);

      canvas.drawCircle(Offset(x, y), dotRadius, paint);
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => animation != null;
}

class _InboxScreenState extends State<InboxScreen>
    with WidgetsBindingObserver, TickerProviderStateMixin {
  late Future<List<InboxEntry>> _inboxFuture;
  String? currentUserId;
  bool isLoading = true;

  // Search functionality
  final TextEditingController _searchController = TextEditingController();
  List<InboxEntry> _allEntries = [];
  List<InboxEntry> _filteredEntries = [];
  String _searchQuery = '';

  // Always-on polling
  Timer? _pollingTimer;
  bool _isAppInForeground = true;

  // ✅ Professional animation controller
  late AnimationController _continuousController;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    _loadCurrentUser();
    _searchController.addListener(_onSearchChanged);

    // ✅ Slow, continuous animation (60 seconds per rotation)
    _continuousController = AnimationController(
      duration: const Duration(seconds: 60),
      vsync: this,
    )..repeat();
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    _searchController.dispose();
    _pollingTimer?.cancel();
    _continuousController.dispose();
    super.dispose();
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    switch (state) {
      case AppLifecycleState.resumed:
        _isAppInForeground = true;
        _startAlwaysOnPolling();
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
      _filteredEntries = _allEntries.where((entry) {
        return entry.agentName
                .toLowerCase()
                .contains(_searchQuery.toLowerCase()) ||
            entry.messagePreview
                .toLowerCase()
                .contains(_searchQuery.toLowerCase());
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

    // Treat empty strings as invalid (same as null)
    if (loadedUserId != null && loadedUserId.isEmpty) {
      loadedUserId = null;
    }

    // Add logging for debugging
    print('Loaded userId: $loadedUserId');

    setState(() {
      currentUserId = loadedUserId;
      isLoading = false;
    });

    if (currentUserId != null) {
      _inboxFuture = fetchInbox();
      _startAlwaysOnPolling();
    }
  }

  void _startAlwaysOnPolling() {
    _pollingTimer?.cancel();

    _pollingTimer = Timer.periodic(const Duration(seconds: 5), (timer) {
      if (mounted &&
          _isAppInForeground &&
          currentUserId != null &&
          currentUserId!.isNotEmpty) {
        _refreshInboxSilently();
      } else if (!mounted || !_isAppInForeground) {
        timer.cancel();
      }
    });
  }

  void _refreshInboxSilently() {
    fetchInbox().then((entries) {
      if (mounted) {
        setState(() {
          _allEntries = entries;
          _filteredEntries = _searchQuery.isEmpty
              ? entries
              : entries.where((entry) {
                  return entry.agentName
                          .toLowerCase()
                          .contains(_searchQuery.toLowerCase()) ||
                      entry.messagePreview
                          .toLowerCase()
                          .contains(_searchQuery.toLowerCase());
                }).toList();
        });
      }
    }).catchError((error) {
      print('Silent refresh error: $error');
    });
  }

  Future<List<InboxEntry>> fetchInbox() async {
    if (currentUserId == null || currentUserId!.isEmpty) {
      throw Exception('User not logged in');
    }

    try {
      final response = await http.get(
        Uri.parse(
            '${AppConfig.inbox}?receiver_id=$currentUserId'),
        headers: {'Content-Type': 'application/json'},
      ).timeout(const Duration(seconds: 30));

      if (response.statusCode == 200) {
        final dynamic responseData = json.decode(response.body);

        if (responseData is Map && responseData['success'] == true) {
          final List<dynamic> inboxJson = responseData['inbox'] ?? [];

          if (inboxJson.isEmpty) {
            return [];
          }

          final List<InboxEntry> entries = inboxJson
              .map((entryJson) {
                try {
                  return InboxEntry.fromJson(entryJson);
                } catch (e) {
                  print('❌ Error parsing inbox entry: $e');
                  return null;
                }
              })
              .where((entry) => entry != null)
              .cast<InboxEntry>()
              .toList();

          entries.sort((a, b) {
            if (a.isOnline != b.isOnline) {
              return a.isOnline ? -1 : 1;
            }
            if (a.hasUnread != b.hasUnread) {
              return a.hasUnread ? -1 : 1;
            }
            if (a.messageDateTime != null && b.messageDateTime != null) {
              return b.messageDateTime!.compareTo(a.messageDateTime!);
            }
            return 0;
          });

          return entries;
        } else {
          throw Exception('Invalid response format');
        }
      } else {
        throw Exception('Failed to load inbox: ${response.statusCode}');
      }
    } catch (e) {
      print('❌ Error fetching inbox: $e');
      throw Exception('Failed to load inbox: $e');
    }
  }

  Future<void> _refreshInbox() async {
    if (currentUserId != null) {
      setState(() {
        _inboxFuture = fetchInbox();
      });
    }
  }

  // ✅ Professional subtle elements
  // List<Widget> _buildSubtleElements() {
  //   final colors = [
  //     Colors.grey.withOpacity(0.04),
  //     Colors.grey.withOpacity(0.06),
  //     Colors.grey.withOpacity(0.03),
  //     Colors.grey.withOpacity(0.05),
  //     Colors.grey.withOpacity(0.04),
  //   ];

  //   final positions = [
  //     const Offset(60, 100),
  //     const Offset(280, 80),
  //     const Offset(90, 280),
  //     const Offset(240, 140),
  //     const Offset(160, 220),
  //   ];

  //   final sizes = [50.0, 65.0, 45.0, 58.0, 52.0];

  //   return List.generate(colors.length, (index) {
  //     return Positioned(
  //       left: positions[index].dx,
  //       top: positions[index].dy,
  //       child: Container(
  //         width: sizes[index],
  //         height: sizes[index],
  //         decoration: BoxDecoration(
  //           color: colors[index],
  //           shape: BoxShape.circle,
  //         ),
  //       ),
  //     );
  //   });
  // }

  // ✅ Smooth orbiting avatars
  List<Widget> _buildOrbitingAvatars(double animationValue) {
    final avatarUrls = [
      '${AppConfig.staticAssetBase}/img/deepanshi%201.webp',
      '${AppConfig.staticAssetBase}/img/sandhya.webp',
      '${AppConfig.staticAssetBase}/img/khusi.webp',
      '${AppConfig.staticAssetBase}/img/sadhika.webp',
    ];

    final double radius = 100;
    List<Widget> widgets = [];

    for (int i = 0; i < avatarUrls.length; i++) {
      final double angle = (animationValue * 2 * math.pi * 0.1) +
          (i * 2 * math.pi / avatarUrls.length);
      final double x = 150 + radius * math.cos(angle) - 20;
      final double y = 150 + radius * math.sin(angle) - 20;

      widgets.add(
        Positioned(
          left: x,
          top: y,
          child: Container(
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.06),
                  blurRadius: 6,
                  offset: const Offset(0, 2),
                ),
              ],
            ),
            child: CircleAvatar(
              radius: 20,
              backgroundImage: NetworkImage(avatarUrls[i]),
              backgroundColor: Colors.grey[100],
            ),
          ),
        ),
      );
    }
    return widgets;
  }

  // ✅ Clean sign-in button
  // Widget _buildSignInButton({
  //   IconData? icon,
  //   Widget? child,
  //   required Color backgroundColor,
  //   Color? iconColor,
  //   required VoidCallback onPressed,
  //   bool hasBorder = false,
  // }) {
  //   return Container(
  //     decoration: BoxDecoration(
  //       shape: BoxShape.circle,
  //       border:
  //           hasBorder ? Border.all(color: Colors.grey[300]!, width: 1) : null,
  //       boxShadow: [
  //         BoxShadow(
  //           color: Colors.black.withOpacity(0.06),
  //           blurRadius: 8,
  //           offset: const Offset(0, 2),
  //         ),
  //       ],
  //     ),
  //     child: ElevatedButton(
  //       onPressed: onPressed,
  //       style: ElevatedButton.styleFrom(
  //         backgroundColor: backgroundColor,
  //         shape: const CircleBorder(),
  //         padding: const EdgeInsets.all(16),
  //         elevation: 0,
  //       ),
  //       child: child ??
  //           Icon(
  //             icon,
  //             size: 26,
  //             color: iconColor,
  //           ),
  //     ),
  //   );
  // }

  @override
  Widget build(BuildContext context) {
    if (isLoading || currentUserId == null) {
      return Scaffold(
        backgroundColor: Colors.white,
        appBar: AppBar(
          backgroundColor: Colors.white,
          elevation: 0.5,
          title: const Text(
            'Chats',
            style: TextStyle(
              color: Colors.black,
              fontWeight: FontWeight.bold,
              fontSize: 20,
            ),
          ),
          actions: [
            IconButton(
              icon: const Icon(Icons.more_vert, color: Colors.black),
              onPressed: () {},
            ),
          ],
        ),
        body: const Center(child: CircularProgressIndicator()),
      );
    }

    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0.5,
        title: const Text(
          'Inbox',
          style: TextStyle(
            color: Colors.black,
            fontWeight: FontWeight.bold,
            fontSize: 20,
          ),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.more_vert, color: Colors.black),
            onPressed: () {
              _showMoreOptions();
            },
          ),
        ],
      ),
      body: FutureBuilder<List<InboxEntry>>(
        future: _inboxFuture,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return Column(
              children: [
                _buildSearchBar(),
                const Expanded(
                  child: Center(
                    child: CircularProgressIndicator(color: Color(0xFFFF9500)),
                  ),
                ),
              ],
            );
          }

          if (snapshot.hasError) {
            return Column(
              children: [
                _buildSearchBar(),
                Expanded(
                  child: Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Icon(Icons.error_outline,
                            size: 64, color: Colors.red),
                        const SizedBox(height: 16),
                        Text(
                          'Error loading conversations',
                          style: TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                            color: Colors.grey[800],
                          ),
                        ),
                        const SizedBox(height: 8),
                        Text(
                          '${snapshot.error}',
                          style: TextStyle(color: Colors.grey[600]),
                          textAlign: TextAlign.center,
                        ),
                        const SizedBox(height: 16),
                        ElevatedButton(
                          onPressed: _refreshInbox,
                          style: ElevatedButton.styleFrom(
                            backgroundColor: const Color(0xFFFF9500),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(8),
                            ),
                          ),
                          child: const Text(
                            'Retry',
                            style: TextStyle(color: Colors.white),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            );
          }

          // ✅ UPDATED: Professional welcome screen
          if (!snapshot.hasData || snapshot.data!.isEmpty) {
            return GestureDetector(
              onTap: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (context) => AdvisorListScreen(),
                  ),
                );
              },
              child: Column(
                children: [
                  _buildSearchBar(),
                  Expanded(
                    child: Container(
                      color: Colors.white,
                      child: Stack(
                        children: [
                          // ✅ Subtle background elements
                          // ..._buildSubtleElements(),

                          // ✅ Gentle rotating rings
                          Center(
                            child: CustomPaint(
                              size: const Size(280, 280),
                              painter: _ConcentricRingsPainter(
                                  animation: _continuousController),
                            ),
                          ),

                          // ✅ Smooth orbiting avatars
                          Padding(
                            padding: const EdgeInsets.all(35.0),
                            child: SizedBox(
                              width: 300,
                              height: 300,
                              child: AnimatedBuilder(
                                animation: _continuousController,
                                builder: (context, child) {
                                  return Stack(
                                    children: _buildOrbitingAvatars(
                                        _continuousController.value),
                                  );
                                },
                              ),
                            ),
                          ),

                          // ✅ Clean content layout
                          Padding(
                            padding: const EdgeInsets.symmetric(
                                horizontal: 60, vertical: 60),
                            child: Column(
                              children: [
                                const SizedBox(height: 250),
                                const SizedBox(height: 24),
                                const Text(
                                  'Welcome',
                                  style: TextStyle(
                                    fontSize: 28,
                                    fontWeight: FontWeight.w700,
                                    color: Colors.black87,
                                    letterSpacing: -0.5,
                                  ),
                                ),
                                const SizedBox(height: 14),
                                Text(
                                  'Step into conversations with your favorite agents—anytime, anywhere',
                                  textAlign: TextAlign.center,
                                  style: TextStyle(
                                    fontSize: 16,
                                    color: Colors.grey[600],
                                    height: 1.4,
                                    fontWeight: FontWeight.w400,
                                  ),
                                ),
                                const SizedBox(height: 18),
                                // Removed button, tap anywhere instead
                                const SizedBox(height: 18),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            );
          }

          if (_allEntries.isEmpty) {
            _allEntries = snapshot.data!;
            _filteredEntries = _searchQuery.isEmpty
                ? _allEntries
                : _allEntries.where((entry) {
                    return entry.agentName
                            .toLowerCase()
                            .contains(_searchQuery.toLowerCase()) ||
                        entry.messagePreview
                            .toLowerCase()
                            .contains(_searchQuery.toLowerCase());
                  }).toList();
          }

          final displayEntries = _filteredEntries;
          final totalUnread = displayEntries
              .where((e) => e.hasUnread)
              .fold(0, (sum, e) => sum + e.unreadCount);

          return Column(
            children: [
              _buildSearchBar(),
              if (totalUnread > 0)
                Container(
                  width: double.infinity,
                  padding:
                      const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                  color: Colors.blue[50],
                  child: Text(
                    '$totalUnread unread message${totalUnread > 1 ? 's' : ''} from ${displayEntries.where((e) => e.hasUnread).length} agent${displayEntries.where((e) => e.hasUnread).length > 1 ? 's' : ''}',
                    style: TextStyle(
                      color: Colors.blue[700],
                      fontWeight: FontWeight.w500,
                      fontSize: 12,
                    ),
                  ),
                ),
              Expanded(
                child: RefreshIndicator(
                  onRefresh: _refreshInbox,
                  child: ListView.separated(
                    padding: const EdgeInsets.symmetric(horizontal: 4),
                    itemCount: displayEntries.length,
                    separatorBuilder: (context, index) {
                      return Divider(
                        color: Colors.grey.withOpacity(0.2),
                        height: 1,
                        indent: 16,
                        endIndent: 16,
                      );
                    },
                    itemBuilder: (context, index) {
                      final entry = displayEntries[index];
                      return _buildModernChatTile(entry, index);
                    },
                  ),
                ),
              ),
            ],
          );
        },
      ),
    );
  }

  Widget _buildSearchBar() {
    return Container(
      padding: const EdgeInsets.all(12),
      child: TextField(
        controller: _searchController,
        decoration: InputDecoration(
          prefixIcon: const Icon(
            Icons.search,
            color: Colors.black54,
            size: 20,
          ),
          hintText: 'Search for Clients',
          hintStyle: const TextStyle(
            color: Colors.black54,
            fontSize: 14,
          ),
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

  Widget _buildModernChatTile(InboxEntry entry, int index) {
    final isOffline = !entry.isOnline;

    return Container(
      decoration: BoxDecoration(
        color: Colors.transparent,
        borderRadius: BorderRadius.circular(12),
      ),
      child: ListTile(
        contentPadding: const EdgeInsets.symmetric(horizontal: 8, vertical: 8),
        leading: Stack(
          children: [
            Opacity(
              opacity: isOffline ? 0.5 : 1.0,
              child: CircleAvatar(
                radius: 26,
                backgroundColor: const Color(0xFFFF9500),
                backgroundImage: entry.fullProfileUrl != null
                    ? CachedNetworkImageProvider(entry.fullProfileUrl!)
                    : null,
                child: entry.fullProfileUrl == null
                    ? Text(
                        entry.agentName.length >= 2
                            ? entry.agentName.substring(0, 2).toUpperCase()
                            : entry.agentName.toUpperCase(),
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
                  color: entry.isOnline ? Colors.green : Colors.grey,
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
                entry.agentName,
                style: TextStyle(
                  fontWeight:
                      entry.hasUnread ? FontWeight.bold : FontWeight.w600,
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
          entry.messagePreview,
          maxLines: 2,
          overflow: TextOverflow.ellipsis,
          style: TextStyle(
            color: isOffline
                ? Colors.grey[400]
                : (entry.hasUnread ? Colors.black54 : Colors.grey[600]),
            fontWeight: entry.hasUnread ? FontWeight.w400 : FontWeight.normal,
            fontSize: 13,
            height: 1.3,
          ),
        ),
        trailing: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          crossAxisAlignment: CrossAxisAlignment.end,
          children: [
            Text(
              entry.timeFormatted,
              style: TextStyle(
                color: isOffline
                    ? Colors.grey[400]
                    : (entry.hasUnread
                        ? const Color(0xFFFF9500)
                        : Colors.grey[500]),
                fontSize: 11,
                fontWeight:
                    entry.hasUnread ? FontWeight.w600 : FontWeight.normal,
              ),
            ),
            const SizedBox(height: 6),
            if (entry.hasUnread)
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                decoration: BoxDecoration(
                  color: _getUnreadBadgeColor(entry.unreadCount),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Text(
                  entry.unreadCount.toString(),
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 11,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
          ],
        ),
        onTap: () => _openChat(entry),
      ),
    );
  }

  Color _getUnreadBadgeColor(int count) {
    if (count >= 5) return Colors.red;
    if (count >= 3) return Colors.orange;
    return Colors.blue;
  }

  void _showOfflineDialog() {
    showDialog(
      context: context,
      builder: (context) => Dialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        elevation: 10,
        child: Container(
          padding: const EdgeInsets.all(24),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(16),
            color: Colors.white,
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(
                Icons.offline_bolt,
                color: Colors.orange[600],
                size: 48,
              ),
              const SizedBox(height: 16),
              Text(
                'Agent Offline',
                style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                  color: Colors.grey[800],
                ),
              ),
              const SizedBox(height: 8),
              Text(
                'This agent is currently offline and unavailable for chat.',
                style: TextStyle(
                  fontSize: 16,
                  color: Colors.grey[600],
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 16),
              Row(
                mainAxisAlignment: MainAxisAlignment.end,
                children: [
                  TextButton(
                    onPressed: () => Navigator.pop(context),
                    child: Text(
                      'OK',
                      style: TextStyle(
                        color: Colors.orange[600],
                        fontWeight: FontWeight.w600,
                        fontSize: 16,
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
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
              leading: const Icon(Icons.archive_outlined),
              title: const Text('Archived Chats'),
              onTap: () {
                Navigator.pop(context);
              },
            ),
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

  void _openChat(InboxEntry entry) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => ChatScreen(
          advisorId: entry.agentId.toString(),
          advisorName: entry.agentName,
          advisorImageUrl: entry.fullProfileUrl,
          contactOnline: entry.isOnline,
        ),
      ),
    ).then((_) {
      _refreshInbox();
    });
  }
}
