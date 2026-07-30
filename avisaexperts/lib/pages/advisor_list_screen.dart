import 'dart:developer';

import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:http/http.dart' as http; // Import http for API calls
import 'dart:convert'; // Import for jsonDecode
import 'dart:async'; // For Future/async and TimeoutException
import 'package:shared_preferences/shared_preferences.dart';
// import 'package:carousel_slider/carousel_slider.dart';

import '../appbar/common_widgets.dart';
import '../config/app_config.dart';
// --- >>> ADDED: Import for ChatScreen <<< ---
import 'chat_screen.dart'; // Assuming chat_screen.dart is in the same directory
// --- <<< END ADDED >>> ---

// --- Data Model (from your paste-2.txt) ---
class Advisor {
  final String id;
  final String name;
  final String imageUrl;
  final String role;
  final String specialization;
  final List<String> languages;
  final String experience;
  final int totalClients;
  final bool isOnline;
  final double rating = 4.5; // Dummy rating

  Advisor({
    required this.id,
    required this.name,
    required this.imageUrl,
    required this.role,
    required this.specialization,
    required this.languages,
    required this.experience,
    required this.totalClients,
    required this.isOnline,
  });
  factory Advisor.fromJson(Map<String, dynamic> json, String baseUrl) {
    int clients = int.tryParse(json['total_order']?.toString() ?? '0') ?? 0;
    List<String> languageList = (json['language'] as String? ?? '')
        .split(',')
        .map((lang) => lang.trim())
        .where((lang) => lang.isNotEmpty)
        .toList();
    bool onlineStatus =
        (json['user_current_status'] as String? ?? '').toLowerCase() ==
            'active';
    String experienceYears = json['experience']?.toString() ?? '0';
    String profilePath = json['user_profile'] as String? ?? '';
    String fullImageUrl = '';
    if (profilePath.isNotEmpty) {
      profilePath = profilePath.replaceAll('\\', '/');
      if (baseUrl.endsWith('/') && profilePath.startsWith('/')) {
        fullImageUrl = baseUrl + profilePath.substring(1);
      } else if (!baseUrl.endsWith('/') && !profilePath.startsWith('/')) {
        fullImageUrl = '$baseUrl/$profilePath';
      } else {
        fullImageUrl = baseUrl + profilePath;
      }
    }
    return Advisor(
      id: json['id']?.toString() ?? '',
      name: json['user_name'] as String? ?? 'N/A',
      imageUrl: fullImageUrl,
      role: json['user_role'] as String? ?? 'Consultant',
      specialization: json['expertise'] as String? ?? '',
      languages: languageList,
      experience: experienceYears,
      totalClients: clients,
      isOnline: onlineStatus,
    );
  }
}
// --- End Data Model ---

// Base URL for images (from your paste-2.txt)
const String BASE_IMAGE_URL = AppConfig.staticAssetBase;

// --- Main Screen Widget (from your paste-2.txt) ---
class AdvisorListScreen extends StatefulWidget {
  const AdvisorListScreen({super.key});
  @override
  State<AdvisorListScreen> createState() => _AdvisorListScreenState();
}

// Removed WidgetsBindingObserver (as in your paste-2.txt)
class _AdvisorListScreenState extends State<AdvisorListScreen>
    with SingleTickerProviderStateMixin {
  List<Advisor> _advisors = [];
  bool _isLoading = true;
  String? _errorMessage;

  // User data variables (from your paste-2.txt)
  String _userName = 'User';
  String? _userImagePath;
  // String _currentUserId = 'user_123'; // This is no longer strictly needed here if ChatScreen fetches its own ID
  bool _userDataLoaded = false;

  // Animation for the banner icon
  late AnimationController _bannerIconAnimationController;
  late Animation<double> _bannerIconScaleAnimation;

  @override
  void initState() {
    super.initState();
    // Initialize banner icon animation
    _bannerIconAnimationController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 800),
    )..repeat(reverse: true);
    _bannerIconScaleAnimation = Tween<double>(begin: 0.9, end: 1.1).animate(
      CurvedAnimation(
        parent: _bannerIconAnimationController,
        curve: Curves.easeInOut,
      ),
    );

    // Load initial data
    _loadInitialData();
  }

  @override
  void dispose() {
    _bannerIconAnimationController.dispose(); // Dispose banner icon controller
    super.dispose();
  }

  Future<void> _loadInitialData() async {
    // ... (Your existing _loadInitialData method from paste-2.txt) ...
    if (!mounted) return;
    log("AdvisorListScreen: _loadInitialData called.");
    setState(() {
      _isLoading = true;
      _userDataLoaded = false;
      _errorMessage = null;
    });
    try {
      await Future.wait([
        _fetchAdvisors(),
        _loadUserData(),
      ]);
    } finally {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  Future<void> _loadUserData() async {
    // ... (Your existing _loadUserData method from paste-2.txt) ...
    // This method now primarily sets _userName and _userImagePath for the CustomAppBar
    // and ensures _userDataLoaded is true. _currentUserId is not strictly needed here
    // if ChatScreen is fetching its own.
    log("AdvisorListScreen: Starting _loadUserData...");
    try {
      final prefs = await SharedPreferences.getInstance();
      final String? rawUserNameFromPrefs = prefs.getString('userName');
      log(
          "AdvisorListScreen: Raw 'userName' from SharedPreferences: '$rawUserNameFromPrefs'");
      final String loadedName = rawUserNameFromPrefs ?? 'User';
      final String? loadedImagePath = prefs.getString('userProfile');
      // We can still load userId here for other potential uses or debugging, but ChatScreen will fetch its own.
      // final String loadedUserId = prefs.getString('userId') ?? 'user_${DateTime.now().millisecondsSinceEpoch}';

      if (mounted) {
        setState(() {
          _userName = loadedName;
          _userImagePath =
              (loadedImagePath != null && loadedImagePath.trim().isNotEmpty)
                  ? loadedImagePath.trim()
                  : null;
          // _currentUserId = loadedUserId; // Not strictly necessary to set in state if ChatScreen fetches it
          _userDataLoaded = true;
        });
        log(
            "AdvisorListScreen: User data loaded and state set. Name: $_userName, UserDataLoaded: $_userDataLoaded");
      }
    } catch (e) {
      log("Error loading user data in AdvisorListScreen: $e");
      if (mounted) {
        setState(() {
          _userName = 'User';
          _userImagePath = null;
          _userDataLoaded = true;
        });
      }
    }
  }

  Future<void> _fetchAdvisors() async {
    // ... (Your existing _fetchAdvisors method from paste-2.txt - unchanged) ...
    if (!mounted) return;
    final Uri url = Uri.parse(AppConfig.consultants);
    log("Fetching advisors from: $url");
    try {
      final response = await http.get(url).timeout(const Duration(seconds: 20));
      if (!mounted) return;
      log("API Response Status: ${response.statusCode}");
      if (response.statusCode == 200) {
        if (response.body.trim().isEmpty) {
          throw Exception("Empty response received.");
        }
        final decodedResponse = jsonDecode(response.body);
        if (decodedResponse is Map<String, dynamic> &&
            decodedResponse['success'] == true &&
            decodedResponse['data'] is List) {
          final List<dynamic> advisorDataList = decodedResponse['data'];
          final List<Advisor> fetchedAdvisors = [];
          for (var jsonItem in advisorDataList) {
            try {
              if (jsonItem is Map<String, dynamic>) {
                fetchedAdvisors.add(Advisor.fromJson(jsonItem, BASE_IMAGE_URL));
              } else {
                log("Skipping invalid item: $jsonItem");
              }
            } catch (e) {
              log("Error parsing advisor item: $jsonItem. Error: $e");
            }
          }
          if (mounted) {
            setState(() {
              _advisors = fetchedAdvisors;
              _errorMessage = null;
            });
          }
        } else {
          throw Exception(decodedResponse['message']?.toString() ??
              'Invalid format or success false.');
        }
      } else {
        throw Exception('Server error ${response.statusCode}');
      }
    } on TimeoutException catch (_) {
      log("Error: Request timed out.");
      if (mounted) {
        setState(() {
          _errorMessage = 'Request timed out.';
        });
      }
    } catch (e) {
      log("Error fetching/parsing advisors: $e");
      if (mounted) {
        setState(() {
          _errorMessage = 'Failed to load: ${e.toString()}';
        });
      }
    }
  }

  Future<void> _handleRefresh() async {
    // ... (Your existing _handleRefresh method from paste-2.txt - unchanged) ...
    log("Refreshing Advisor List and User Data...");
    if (mounted) {
      setState(() {
        _isLoading = true;
        _errorMessage = null;
      });
    }
    try {
      await Future.wait([
        _fetchAdvisors(),
        _loadUserData(),
      ]);
    } catch (e) {
      log("Error during refresh: $e");
    } finally {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
    log("Refresh complete.");
  }

  // --- >>> ADDED: Method to navigate to ChatScreen <<< ---
  // This version assumes ChatScreen fetches its own currentUserId
  void _navigateToChat(Advisor advisor) {
    if (!advisor.isOnline) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
              '${advisor.name} is currently offline. Chat may not be immediately available.'),
          backgroundColor: Colors.orangeAccent,
          duration: const Duration(seconds: 3),
        ),
      );
      // return; // Optionally block navigation if advisor is offline
    }

    log(
        "Navigating to chat with Advisor ID: ${advisor.id}, Advisor Name: ${advisor.name}");
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => ChatScreen(
          // userId parameter is removed, as ChatScreen will fetch it
          advisorId: advisor.id,
          advisorName: advisor.name,
          advisorImageUrl:
              advisor.imageUrl.isNotEmpty ? advisor.imageUrl : null,
        ),
      ),
    );
  }
  // --- <<< END ADDED >>> ---

  @override
  Widget build(BuildContext context) {
    // This log statement will show the progression
    log(
        "AdvisorListScreen build: _userName='$_userName', _userDataLoaded=$_userDataLoaded, _isLoading=$_isLoading");

    return Scaffold(
      backgroundColor: const Color.fromARGB(255, 255, 255, 255),
      // Your existing conditional AppBar logic from paste-2.txt
      appBar: _userDataLoaded
          ? PreferredSize(
              preferredSize: Size.fromHeight(kToolbarHeight),
              child: GlobalAppBar(
                userName: _userName,
                userImagePath: _userImagePath,
                // Assuming your CustomAppBar now handles potential null backgroundColor and elevation
                // and defaults them or you modify CustomAppBar to make them optional.
                // For transparency to work with a Lottie background (if you add one here),
                // these would be:
                // backgroundColor: Colors.transparent,
                // elevation: 0,
              ),
            )
          : AppBar(
              title: const Text('Advisors'),
              backgroundColor: Theme.of(context).primaryColor,
              automaticallyImplyLeading: true,
            ),
      body: _buildBody(),
    );
  }

  Widget _buildBody() {
    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 16.0),
          child: Container(
            width: double.infinity,
            height: 80,
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [
                  Color.fromARGB(255, 64, 74, 187), // Dark green
                  Color.fromARGB(255, 124, 200, 221), // Light green
                ],
                begin: Alignment.centerLeft,
                end: Alignment.centerRight,
              ),
              borderRadius: BorderRadius.circular(16.0),
            ),
            child: Stack(
              clipBehavior:
                  Clip.none, // Allow image to overflow container bounds
              children: [
                Row(
                  children: [
                    // Left side text content
                    Expanded(
                      flex: 4,
                      child: Padding(
                        padding: const EdgeInsets.only(
                            left: 20.0, top: 16.0, bottom: 16.0),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: const [
                            Text(
                              'Start Free Guidance With',
                              style: TextStyle(
                                color: Colors.white,
                                fontSize: 16,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            SizedBox(height: 2),
                            Text(
                              'Our Immigration Experts',
                              style: TextStyle(
                                color: Colors.white,
                                fontSize: 14,
                                fontWeight: FontWeight.w500,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                    const SizedBox(width: 80),
                  ],
                ),

                // Positioned overflowing image outside right edge
                Positioned(
                  right: 10, // overflow outside container
                  top: -10, // move image slightly up
                  child: ScaleTransition(
                    scale: _bannerIconScaleAnimation,
                    child: Container(
                      width: 100,
                      height: 100,
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(16),
                      ),
                      child: ClipRRect(
                        borderRadius: BorderRadius.circular(16),
                        child: Image.asset(
                          'assets/free_icon.png', // Your image path
                          fit: BoxFit.cover,
                          errorBuilder: (context, error, stackTrace) =>
                              Container(
                            color: Colors.white.withOpacity(0.1),
                            child: Icon(Icons.image,
                                color: Colors.white.withOpacity(0.5)),
                          ),
                        ),
                      ),
                    ),
                  ),
                ),

                // Arrow icon
                // Positioned(
                //   right: 4,
                //   bottom: 4,
                //   child: Container(
                //     width: 28,
                //     height: 28,
                //     decoration: BoxDecoration(
                //       color: Colors.white.withOpacity(0.8),
                //       shape: BoxShape.circle,
                //     ),
                //     child: const Icon(
                //       Icons.arrow_forward,
                //       color: Color.fromARGB(255, 0, 0, 0),
                //       size: 18,
                //     ),
                //   ),
                // ),
              ],
            ),
          ),
        ),
        // const SizedBox(height: 16),
        Expanded(
          child: _buildAdvisorList(),
        ),
      ],
    );
  }

  Widget _buildAdvisorList() {
    if (_isLoading) {
      return const Center(child: CircularProgressIndicator());
    }
    if (_errorMessage != null) {
      return Center(
          child: Padding(
        padding: const EdgeInsets.all(20.0),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.error_outline, color: Colors.red.shade400, size: 40),
            const SizedBox(height: 10),
            Text(
              _errorMessage!,
              textAlign: TextAlign.center,
              style: TextStyle(color: Colors.red.shade700, fontSize: 15),
            ),
            const SizedBox(height: 15),
            ElevatedButton.icon(
                icon: const Icon(Icons.refresh),
                label: const Text('Retry'),
                onPressed: _handleRefresh,
                style: ElevatedButton.styleFrom(
                  foregroundColor: Colors.white,
                  backgroundColor: Theme.of(context).primaryColor,
                ))
          ],
        ),
      ));
    }
    if (_advisors.isEmpty) {
      return Center(
          child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(
            'No advisors found.',
            style: TextStyle(fontSize: 16, color: Colors.grey.shade600),
          ),
          const SizedBox(height: 10),
          Text(
            '(Pull down to refresh)',
            style: TextStyle(fontSize: 12, color: Colors.grey.shade500),
          ),
        ],
      ));
    }

    return RefreshIndicator(
      onRefresh: _handleRefresh,
      child: ListView.builder(
        padding: const EdgeInsets.symmetric(vertical: 8.0, horizontal: 12.0),
        itemCount: _advisors.length,
        itemBuilder: (context, index) {
          final advisor = _advisors[index];
          return AdvisorCard(
            advisor: advisor,
            onChatTap: () => _navigateToChat(advisor),
          );
        },
      ),
    );
  }
}

// --- Advisor Card Widget (from your paste-2.txt) ---
// --- >>> MODIFIED: AdvisorCard to accept and use onChatTap <<< ---
class AdvisorCard extends StatelessWidget {
  final Advisor advisor;
  final VoidCallback onChatTap; // Added callback for chat tap

  const AdvisorCard({
    super.key,
    required this.advisor,
    required this.onChatTap, // Make it required
  });

  // ... (Your existing _buildStarRating, _buildStatRow, _buildActionButton methods from paste-2.txt - unchanged) ...
  Widget _buildStarRating(double rating) {
    List<Widget> stars = [];
    int fullStars = rating.floor();
    bool hasHalfStar = (rating - fullStars) >= 0.5;
    for (int i = 0; i < 5; i++) {
      IconData iconData = Icons.star_border_rounded;
      Color starColor = Colors.amber.shade700;
      if (i < fullStars) {
        iconData = Icons.star_rounded;
      } else if (i == fullStars && hasHalfStar) {
        iconData = Icons.star_half_rounded;
      }
      stars.add(Icon(iconData, color: starColor, size: 18));
    }
    stars.add(const SizedBox(width: 4));
    stars.add(Flexible(
      child: Text(
        rating.toStringAsFixed(1),
        style: TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.bold,
            color: Colors.grey.shade700),
        overflow: TextOverflow.ellipsis,
      ),
    ));
    return Row(mainAxisSize: MainAxisSize.min, children: stars);
  }

  Widget _buildStatRow(IconData icon, String text, {Color? iconColor}) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 6.0),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 15, color: iconColor ?? Colors.grey.shade600),
          const SizedBox(width: 5),
          Flexible(
            child: Text(
              text,
              style: TextStyle(
                  fontSize: 12,
                  color: Colors.grey.shade700,
                  fontWeight: FontWeight.w500),
              overflow: TextOverflow.ellipsis,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildActionButton(
      {required IconData icon,
      required String label,
      required Color color,
      required VoidCallback onTap}) {
    return OutlinedButton.icon(
      onPressed: onTap,
      icon: Icon(icon, size: 18, color: color),
      label: Text(label,
          style: TextStyle(
              fontSize: 13, color: color, fontWeight: FontWeight.w600)),
      style: OutlinedButton.styleFrom(
        foregroundColor: color,
        side: BorderSide(color: color.withOpacity(0.6), width: 1.5),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
        minimumSize: const Size(100, 38),
        tapTargetSize: MaterialTapTargetSize.shrinkWrap,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    // ... (Your existing AdvisorCard build method preamble from paste-2.txt - unchanged) ...
    final Color primaryActionColor = Colors.blue.shade800;
    final Color onlineColor = Colors.green.shade600;
    final Color nameColor = Colors.black87;
    final Color roleColor = Colors.grey.shade700;
    final Color langColor = Colors.grey.shade700;
    final Color offlineColor = const Color.fromARGB(255, 243, 216, 215);
    final Color offlineTextColor = Colors.grey.shade600;
    final Color statIconColor = Colors.grey.shade600;
    String formattedTotalClients = advisor.totalClients > 1000
        ? '${(advisor.totalClients / 1000).toStringAsFixed(1)}k+ Clients'
        : '${advisor.totalClients} Clients';
    String formattedExperience = 'N/A';
    if (advisor.experience.isNotEmpty && advisor.experience != '0') {
      formattedExperience = advisor.experience == '1'
          ? '1 yr Exp'
          : '${advisor.experience} yrs Exp';
    } else if (advisor.experience == '0') {
      formattedExperience = '< 1 yr Exp';
    }
    final BorderSide onlineBorderStyle = BorderSide(
      color: onlineColor.withOpacity(0.8),
      width: 1.5,
    );
    final BorderSide offlineBorderStyle = BorderSide(
      color: offlineColor.withOpacity(0.8),
      width: 1.5,
    );

    return Card(
      // ... (Your existing Card structure from paste-2.txt - unchanged) ...
      margin: const EdgeInsets.only(bottom: 16.0),
      elevation: 1.5,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: advisor.isOnline ? onlineBorderStyle : offlineBorderStyle,
      ),
      shadowColor: Colors.black.withOpacity(0.1),
      color: Colors.white,
      clipBehavior: Clip.antiAlias,
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Top Row (Avatar, Name, Stats) - Unchanged
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Stack(
                  children: [
                    CircleAvatar(
                      radius: 38,
                      backgroundColor: Colors.grey.shade200,
                      backgroundImage: advisor.imageUrl.isNotEmpty
                          ? CachedNetworkImageProvider(advisor.imageUrl)
                          : null,
                      child: advisor.imageUrl.isEmpty
                          ? Icon(Icons.person_rounded,
                              size: 38, color: Colors.grey.shade400)
                          : null,
                    ),
                    if (advisor.isOnline)
                      Positioned(
                        bottom: 3,
                        right: 3,
                        child: Container(
                          width: 14,
                          height: 14,
                          decoration: BoxDecoration(
                            color: onlineColor,
                            shape: BoxShape.circle,
                            border: Border.all(color: Colors.white, width: 2),
                          ),
                        ),
                      ),
                  ],
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        advisor.name,
                        style: TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                            color: nameColor),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        advisor.role,
                        style: TextStyle(fontSize: 14, color: roleColor),
                      ),
                      const SizedBox(height: 4),
                      if (advisor.specialization.isNotEmpty)
                        Text(
                          advisor.specialization,
                          style: TextStyle(fontSize: 13, color: roleColor),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      const SizedBox(height: 8),
                      _buildStarRating(advisor.rating),
                    ],
                  ),
                ),
                const SizedBox(width: 8),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  mainAxisAlignment: MainAxisAlignment.start,
                  children: [
                    _buildStatRow(
                        Icons.workspace_premium_outlined, formattedExperience,
                        iconColor: statIconColor),
                    const SizedBox(height: 4),
                    _buildStatRow(
                        Icons.people_alt_outlined, formattedTotalClients,
                        iconColor: statIconColor),
                  ],
                ),
              ],
            ),
            const SizedBox(height: 12),
            // Languages Row - Unchanged
            if (advisor.languages.isNotEmpty)
              Padding(
                padding: const EdgeInsets.only(left: 2.0, bottom: 12.0),
                child: Text(
                  advisor.languages.join(' • '),
                  style: TextStyle(fontSize: 13, color: langColor),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              )
            else
              const SizedBox(height: 12.0),
            Divider(color: Colors.grey.shade300, height: 1, thickness: 0.8),
            // Conditional Bottom Section
            Padding(
              padding: const EdgeInsets.only(top: 12.0),
              child: advisor.isOnline
                  ? Row(
                      mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                      children: [
                        _buildActionButton(
                          icon: Icons.chat_bubble_outline,
                          label: 'Chat Now',
                          color: primaryActionColor,
                          onTap: onChatTap,
                        ),
                        _buildActionButton(
                          icon: Icons.support_agent_rounded,
                          label: 'Contact',
                          color: (() {
                            final now = DateTime.now();
                            final isBusinessHours =
                                now.hour >= 11 && now.hour < 18;
                            return isBusinessHours
                                ? primaryActionColor
                                : Colors.grey;
                          })(),
                          onTap: () async {
                            final now = DateTime.now();
                            if (now.hour >= 11 && now.hour < 18) {
                              final Uri telUri = Uri.parse('tel:01204502750');
                              if (await canLaunchUrl(telUri)) {
                                await launchUrl(telUri);
                              } else {
                                if (context.mounted) {
                                  ScaffoldMessenger.of(context).showSnackBar(
                                    const SnackBar(
                                        content:
                                            Text('Could not launch dialer')),
                                  );
                                }
                              }
                            } else {
                              ScaffoldMessenger.of(context).showSnackBar(
                                const SnackBar(
                                  content: Text(
                                      'Our support team is available from 11 AM to 6 PM.'),
                                  backgroundColor: Colors.orangeAccent,
                                  duration: Duration(seconds: 3),
                                ),
                              );
                            }
                          },
                        ),
                      ],
                    )
                  : Center(
                      /* ... (Your existing offline message - unchanged) ... */ child:
                          Padding(
                        padding: const EdgeInsets.symmetric(vertical: 10.0),
                        child: Text(
                          'Please wait, they will be available soon',
                          style: TextStyle(
                              fontSize: 13,
                              fontStyle: FontStyle.italic,
                              color: offlineTextColor),
                        ),
                      ),
                    ),
            ),
          ],
        ),
      ),
    );
  }
}
// --- <<< END MODIFIED >>> ---
