// lib/screens/notifications_screen.dart (adjust path if needed)
import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:intl/intl.dart';
import 'package:http/http.dart' as http; // For API calls
import 'dart:convert'; // For jsonDecode
import 'dart:async'; // For Future, async

// Import the new data model
import '../models/api_notification_item.dart'; // Adjust path if needed
import '../widget/chatbox.dart'; // Import FloatingChatBox

class NotificationsScreen extends StatefulWidget {
  const NotificationsScreen({super.key});

  @override
  State<NotificationsScreen> createState() => _NotificationsScreenState();
}

class _NotificationsScreenState extends State<NotificationsScreen> {
  List<ApiNotificationItem> _notifications = []; // Use the new model
  bool _isLoading = true;
  String? _errorMessage;

  @override
  void initState() {
    super.initState();
    _fetchNotifications(); // Fetch notifications when the screen initializes
  }

  // --- Function to fetch notifications from the API ---
  Future<void> _fetchNotifications() async {
    if (!mounted) return;
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    // Your API endpoint for fetching notifications
    final url = Uri.parse('https://avisaexperts.com/getNotification.php');
    print("NotificationsScreen: Fetching notifications from $url");

    try {
      final response = await http.get(url).timeout(const Duration(seconds: 15));
      if (!mounted) return;

      print("NotificationsScreen: API Response Status: ${response.statusCode}");

      if (response.statusCode == 200) {
        if (response.body.trim().isEmpty) {
          // If body is empty after a 200, treat as no notifications.
          print(
              "NotificationsScreen: API returned 200 with empty body. Displaying empty list.");
          if (mounted) {
            setState(() {
              _notifications = [];
              _isLoading = false;
              // Ensure _errorMessage is null if it was previously set by another error
              _errorMessage = null;
            });
          }
          return; // Successfully handled empty response
        }
        final decodedResponse = jsonDecode(response.body);

        if (decodedResponse is Map<String, dynamic>) {
          if (decodedResponse['success'] == true) {
            // Check if 'notifications' key exists and is a list
            if (decodedResponse.containsKey('notifications') &&
                decodedResponse['notifications'] is List) {
              final List<dynamic> notificationsData =
                  decodedResponse['notifications'];
              final List<ApiNotificationItem> fetchedItems = notificationsData
                  .map((jsonItem) => ApiNotificationItem.fromJson(
                      jsonItem as Map<String, dynamic>))
                  .toList();

              fetchedItems.sort((a, b) => b.timestamp.compareTo(a.timestamp));

              if (mounted) {
                setState(() {
                  _notifications = fetchedItems;
                  _isLoading = false;
                });
              }
            } else {
              // Success is true, but 'notifications' key is missing or not a list.
              // Treat this as a successful fetch of zero notifications.
              print(
                  "NotificationsScreen: 'notifications' key missing/invalid, but success is true. Displaying empty list.");
              if (mounted) {
                setState(() {
                  _notifications = [];
                  _isLoading = false;
                });
              }
            }
          } else if (decodedResponse['success'] == false) {
            // API explicitly states failure
            throw Exception(decodedResponse['message']?.toString() ??
                "API request failed but provided no message.");
          } else {
            // 'success' key is missing or not a boolean
            throw Exception(
                "Invalid API response structure: 'success' flag is missing or invalid.");
          }
        } else {
          // The entire response is not a JSON object as expected
          throw Exception(
              "Invalid API response structure: Expected a JSON object.");
        }
      } else {
        throw Exception(
            'Failed to load notifications. Server error: ${response.statusCode}');
      }
    } catch (e) {
      print("NotificationsScreen: Error fetching notifications: $e");
      if (mounted) {
        String errorMsg;
        if (e is TimeoutException) {
          errorMsg = "The request timed out. Please check your connection.";
        } else if (e is http.ClientException) {
          errorMsg = "A network error occurred. Please check your connection.";
        } else if (e is FormatException) {
          errorMsg = "Error reading data from the server. Please try again.";
        } else {
          // Check for common network-related messages within generic exceptions
          String eStr = e.toString().toLowerCase();
          if (eStr.contains("socketexception") ||
              eStr.contains("handshakeexception") ||
              eStr.contains("network is unreachable")) {
            errorMsg =
                "Could not connect to the server. Please check your internet connection.";
          } else {
            errorMsg = "An unexpected error occurred. Please try again.";
          }
        }
        setState(() {
          _errorMessage = errorMsg;
          _isLoading = false;
          _notifications = []; // Clear any old notifications on error
        });
      }
    }
  }

  // Function to group notifications by date (using ApiNotificationItem)
  Map<String, List<ApiNotificationItem>> _groupNotificationsByDate(
      List<ApiNotificationItem> notifications) {
    final Map<String, List<ApiNotificationItem>> grouped = {};
    final now = DateTime.now();
    final today = DateTime(now.year, now.month, now.day);
    final yesterday = today.subtract(const Duration(days: 1));

    for (var notification in notifications) {
      final notificationTimestamp =
          notification.timestamp; // Use the parsed DateTime
      final notificationDate = DateTime(notificationTimestamp.year,
          notificationTimestamp.month, notificationTimestamp.day);
      String dateKey;

      if (notificationDate == today) {
        dateKey = 'Today';
      } else if (notificationDate == yesterday) {
        dateKey = 'Yesterday';
      } else {
        // Format for older dates, e.g., "Monday, May 12" or "May 12, 2024"
        dateKey = DateFormat('MMMM d, yyyy').format(notificationTimestamp);
      }

      grouped.putIfAbsent(dateKey, () => []).add(notification);
    }

    // Sort keys: Today, Yesterday, then chronologically descending for other dates
    final sortedKeys = grouped.keys.toList()
      ..sort((a, b) {
        if (a == 'Today') return -1;
        if (b == 'Today') return 1;
        if (a == 'Yesterday') return -1;
        if (b == 'Yesterday') return 1;
        try {
          // For "Month Day, Year" format
          final dateA = DateFormat('MMMM d, yyyy').parse(a);
          final dateB = DateFormat('MMMM d, yyyy').parse(b);
          return dateB.compareTo(dateA); // Sort descending (newest first)
        } catch (e) {
          // Fallback for any unexpected key format
          return a.compareTo(b);
        }
      });

    return {for (var key in sortedKeys) key: grouped[key]!};
  }

  // Bottom Sheet Function for Notification Details
  void _showNotificationBottomSheet(ApiNotificationItem notification) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true, // This allows full height control
      backgroundColor: Colors.transparent,
      barrierColor: Colors.black.withOpacity(0.5),
      builder: (context) => DraggableScrollableSheet(
        initialChildSize: 0.9, // Start at 90% of screen height
        minChildSize: 0.5, // Minimum 50% height
        maxChildSize: 0.95, // Maximum 95% height
        builder: (context, scrollController) {
          final String? imageUrl = notification.fullImageUrl;

          return Container(
            decoration: const BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.only(
                topLeft: Radius.circular(20),
                topRight: Radius.circular(20),
              ),
            ),
            child: Column(
              children: [
                // Handle bar
                Container(
                  margin: const EdgeInsets.only(top: 8, bottom: 4),
                  width: 40,
                  height: 4,
                  decoration: BoxDecoration(
                    color: Colors.grey.shade300,
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),

                // Header with close button
                Padding(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text(
                        'Notification',
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.w600,
                          color: Colors.black87,
                        ),
                      ),
                      IconButton(
                        onPressed: () => Navigator.of(context).pop(),
                        icon: Icon(Icons.close, color: Colors.grey.shade600),
                        splashRadius: 20,
                      ),
                    ],
                  ),
                ),

                const Divider(height: 1),

                // Scrollable content
                Expanded(
                  child: SingleChildScrollView(
                    controller: scrollController,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // Dynamic Image Section
                        if (imageUrl != null && imageUrl.isNotEmpty)
                          Container(
                            width: double.infinity,
                            constraints: BoxConstraints(
                              minHeight: 200,
                              maxHeight:
                                  MediaQuery.of(context).size.height * 0.4,
                            ),
                            child: CachedNetworkImage(
                              imageUrl: imageUrl,
                              width: double.infinity,
                              fit: BoxFit.cover,
                              placeholder: (context, url) => Container(
                                height: 200,
                                color: Colors.grey.shade100,
                                child: const Center(
                                  child:
                                      CircularProgressIndicator(strokeWidth: 2),
                                ),
                              ),
                              errorWidget: (context, url, error) => Container(
                                height: 200,
                                color: Colors.grey.shade100,
                                child: Column(
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  children: [
                                    Icon(
                                      Icons.image_not_supported_outlined,
                                      size: 48,
                                      color: Colors.grey.shade400,
                                    ),
                                    const SizedBox(height: 8),
                                    Text(
                                      'Image not available',
                                      style: TextStyle(
                                        color: Colors.grey.shade600,
                                        fontSize: 14,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ),
                          ),

                        // Content Section
                        Padding(
                          padding: const EdgeInsets.all(20),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              // Title
                              Text(
                                notification.title,
                                style: const TextStyle(
                                  fontSize: 20,
                                  fontWeight: FontWeight.w700,
                                  color: Colors.black87,
                                  height: 1.3,
                                ),
                              ),

                              const SizedBox(height: 16),

                              // Timestamp
                              Container(
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 12,
                                  vertical: 8,
                                ),
                                decoration: BoxDecoration(
                                  color: Colors.blue.shade50,
                                  borderRadius: BorderRadius.circular(20),
                                  border: Border.all(
                                    color: Colors.blue.shade100,
                                    width: 1,
                                  ),
                                ),
                                child: Row(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    Icon(
                                      Icons.schedule_rounded,
                                      size: 16,
                                      color: Colors.blue.shade700,
                                    ),
                                    const SizedBox(width: 6),
                                    Text(
                                      DateFormat('MMM dd, yyyy • h:mm a')
                                          .format(notification.timestamp),
                                      style: TextStyle(
                                        fontSize: 13,
                                        color: Colors.blue.shade700,
                                        fontWeight: FontWeight.w500,
                                      ),
                                    ),
                                  ],
                                ),
                              ),

                              const SizedBox(height: 20),

                              // Message
                              Container(
                                width: double.infinity,
                                padding: const EdgeInsets.all(16),
                                decoration: BoxDecoration(
                                  color: Colors.grey.shade50,
                                  borderRadius: BorderRadius.circular(12),
                                  border: Border.all(
                                    color: Colors.grey.shade200,
                                    width: 1,
                                  ),
                                ),
                                child: Text(
                                  notification.message,
                                  style: const TextStyle(
                                    fontSize: 15,
                                    height: 1.6,
                                    color: Colors.black87,
                                  ),
                                ),
                              ),

                              const SizedBox(height: 32),

                              // Action Buttons
                              Row(
                                children: [
                                  Expanded(
                                    child: OutlinedButton(
                                      onPressed: () =>
                                          Navigator.of(context).pop(),
                                      style: OutlinedButton.styleFrom(
                                        padding: const EdgeInsets.symmetric(
                                            vertical: 14),
                                        side: BorderSide(
                                            color: Colors.grey.shade300),
                                        shape: RoundedRectangleBorder(
                                          borderRadius:
                                              BorderRadius.circular(10),
                                        ),
                                      ),
                                      child: const Text(
                                        'Close',
                                        style: TextStyle(
                                          fontSize: 15,
                                          fontWeight: FontWeight.w600,
                                          color: Colors.black87,
                                        ),
                                      ),
                                    ),
                                  ),
                                  const SizedBox(width: 12),
                                  Expanded(
                                    child: ElevatedButton(
                                      onPressed: () {
                                        Navigator.of(context).pop();
                                        ScaffoldMessenger.of(context)
                                            .showSnackBar(
                                          SnackBar(
                                            content: const Text(
                                                'Notification marked as read'),
                                            behavior: SnackBarBehavior.floating,
                                            shape: RoundedRectangleBorder(
                                              borderRadius:
                                                  BorderRadius.circular(10),
                                            ),
                                            margin: const EdgeInsets.all(16),
                                          ),
                                        );
                                      },
                                      style: ElevatedButton.styleFrom(
                                        backgroundColor: Colors.blue.shade600,
                                        foregroundColor: Colors.white,
                                        elevation: 0,
                                        padding: const EdgeInsets.symmetric(
                                            vertical: 14),
                                        shape: RoundedRectangleBorder(
                                          borderRadius:
                                              BorderRadius.circular(10),
                                        ),
                                      ),
                                      child: const Text(
                                        'Mark as Read',
                                        style: TextStyle(
                                          fontSize: 15,
                                          fontWeight: FontWeight.w600,
                                        ),
                                      ),
                                    ),
                                  ),
                                ],
                              ),

                              // Bottom padding for safe area
                              SizedBox(
                                  height:
                                      MediaQuery.of(context).padding.bottom +
                                          20),
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
        },
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final groupedNotifications = _groupNotificationsByDate(_notifications);
    final dateKeys = groupedNotifications.keys.toList();

    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        elevation: 0.5,
        backgroundColor: Colors.white,
        surfaceTintColor: Colors.white,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded,
              color: Colors.black87, size: 22),
          onPressed: () => Navigator.of(context).pop(),
          tooltip: 'Back',
        ),
        title: const Text(
          'Notifications',
          style: TextStyle(
            color: Colors.black,
            fontSize: 18,
            fontWeight: FontWeight.w600,
          ),
        ),
        centerTitle: true,
      ),
      body: Stack(
        children: [
          _isLoading
              ? const Center(child: CircularProgressIndicator())
              : _errorMessage != null
                  ? Center(
                      child: Padding(
                        padding: const EdgeInsets.all(20.0),
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(Icons.cloud_off_rounded,
                                color: Colors.grey.shade400, size: 60),
                            const SizedBox(height: 16),
                            Text(_errorMessage!,
                                textAlign: TextAlign.center,
                                style: TextStyle(
                                    fontSize: 16, color: Colors.grey.shade700)),
                            const SizedBox(height: 20),
                            ElevatedButton.icon(
                              icon: const Icon(Icons.refresh_rounded),
                              label: const Text('Retry Fetch'),
                              onPressed: _fetchNotifications,
                            )
                          ],
                        ),
                      ),
                    )
                  : _notifications.isEmpty
                      ? Center(
                          child: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Icon(Icons.notifications_off_outlined,
                                  size: 80, color: Colors.grey.shade300),
                              const SizedBox(height: 16),
                              const Text('No Notifications Yet',
                                  style: TextStyle(
                                      fontSize: 18,
                                      fontWeight: FontWeight.w500,
                                      color: Colors.grey)),
                              const Text('Check back later for updates.',
                                  style: TextStyle(
                                      fontSize: 14, color: Colors.grey)),
                              const SizedBox(height: 20),
                              ElevatedButton.icon(
                                icon: const Icon(Icons.refresh_rounded),
                                label: const Text('Check for Notifications'),
                                onPressed: _fetchNotifications,
                              )
                            ],
                          ),
                        )
                      : RefreshIndicator(
                          onRefresh: _fetchNotifications,
                          child: ListView.builder(
                            padding: const EdgeInsets.symmetric(vertical: 8.0),
                            itemCount: dateKeys.length,
                            itemBuilder: (context, index) {
                              final dateKey = dateKeys[index];
                              final notificationsForDate =
                                  groupedNotifications[dateKey]!;

                              return Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Padding(
                                    padding: const EdgeInsets.only(
                                        left: 16.0,
                                        right: 16.0,
                                        top: 16.0,
                                        bottom: 8.0),
                                    child: Text(
                                      dateKey,
                                      style: TextStyle(
                                          fontSize: 14,
                                          fontWeight: FontWeight.w600,
                                          color: Colors.grey.shade700),
                                    ),
                                  ),
                                  ListView.separated(
                                    shrinkWrap: true,
                                    physics:
                                        const NeverScrollableScrollPhysics(),
                                    itemCount: notificationsForDate.length,
                                    itemBuilder: (context, itemIndex) {
                                      final notification =
                                          notificationsForDate[itemIndex];
                                      return _buildNotificationTile(
                                          notification);
                                    },
                                    separatorBuilder: (context, itemIndex) =>
                                        Divider(
                                      height: 1,
                                      thickness: 1,
                                      indent: 72,
                                      endIndent: 16,
                                      color: Colors.grey.shade200,
                                    ),
                                  ),
                                ],
                              );
                            },
                          ),
                        ),
          const FloatingChatBox(),
        ],
      ),
    );
  }

  // --- Helper Widget for Individual Notification Tile (uses ApiNotificationItem) ---
  Widget _buildNotificationTile(ApiNotificationItem notification) {
    final String? imageUrl = notification.fullImageUrl;

    return ListTile(
      contentPadding:
          const EdgeInsets.symmetric(horizontal: 16.0, vertical: 6.0),
      leading: CircleAvatar(
        radius: 26,
        backgroundColor: Colors.grey.shade200,
        backgroundImage: (imageUrl != null && imageUrl.isNotEmpty)
            ? CachedNetworkImageProvider(imageUrl)
            : null,
        onBackgroundImageError: (imageUrl != null && imageUrl.isNotEmpty)
            ? (exception, stackTrace) {
                print(
                    "Error loading notification image: $imageUrl, Exception: $exception");
              }
            : null,
        child: (imageUrl == null || imageUrl.isEmpty)
            ? Icon(Icons.campaign_rounded,
                size: 26, color: Colors.grey.shade500)
            : null,
      ),
      title: Text(
        notification.title,
        style: const TextStyle(
            fontWeight: FontWeight.bold, fontSize: 15, color: Colors.black87),
      ),
      subtitle: Padding(
        padding: const EdgeInsets.only(top: 4.0),
        child: Text(
          notification.message,
          style: TextStyle(
              fontSize: 14, color: Colors.grey.shade600, height: 1.35),
          maxLines: 3,
          overflow: TextOverflow.ellipsis,
        ),
      ),
      trailing: Padding(
        padding: const EdgeInsets.only(top: 4.0),
        child: Text(
          DateFormat('h:mm a').format(notification.timestamp),
          style: TextStyle(fontSize: 12, color: Colors.grey.shade500),
        ),
      ),
      onTap: () {
        print("Tapped notification: ${notification.title}");
        _showNotificationBottomSheet(notification);
      },
    );
  }
}
