import 'package:flutter/material.dart';
import 'package:logger/logger.dart'; // Import logger
import 'package:lottie/lottie.dart';
import '../nested_screen/edit-profile.dart'; // Import EditProfileScreen
import 'package:shared_preferences/shared_preferences.dart'; // For user data
import '../authentication/role_selection_screen.dart'; // For logout navigation
import 'package:cached_network_image/cached_network_image.dart'; // For network images
import '../nested_screen/help_support_screen.dart'; // <-- IMPORT HelpSupportScreen
import '../nested_screen/privacy_policy_page.dart'; // <-- IMPORT HelpSupportScreen
import '../nested_screen/term_condition.dart'; // <-- IMPORT HelpSupportScreen
import '../nested_screen/about.dart'; // <-- IMPORT HelpSupportScreen
import '../widget/chatbox.dart';
import 'my_tickets_screen.dart'; // <-- IMPORT HelpSupportScreen
// import 'main_navigation_screen.dart'; // MainNavigationScreen.navigateToTab is not used by this WillPopScope
// Required if using ImageFilter (not used in Hero version, but safe to keep)
import 'dart:async'; // Only needed if using Future.delayed, not strictly for Hero or basic Futures

// Base URL for constructing image URLs (ensure this is correct)
const String baseImageUrl = '/';

// Initialize logger
final logger = Logger();

class ProfileScreen extends StatefulWidget {
  // Use const constructor for stateless/stateful widgets
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

// Add WidgetsBindingObserver to refresh data on resume if needed from edits
class _ProfileScreenState extends State<ProfileScreen>
    with WidgetsBindingObserver {
  // State variables for user data
  String _userName = 'User';
  String _userPhone = '';
  String? _userImagePath; // Nullable for network image path
  String? _fullImageUrl; // Store the constructed full URL
  bool _isLoading = true; // Loading state

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this); // Listen for lifecycle changes
    _loadUserData(); // Load data when the screen initializes
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this); // Clean up observer
    super.dispose();
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    super.didChangeAppLifecycleState(state);
    // If app resumes (e.g., returning from EditProfileScreen)
    if (state == AppLifecycleState.resumed) {
      logger.d(
          "ProfileScreen resumed - Reloading user data from SharedPreferences.");
      _loadUserData(); // Reload data to reflect potential changes
    }
  }

  // --- Load User Data from SharedPreferences ---
  Future<void> _loadUserData() async {
    // Ensure loading state is true if called for refresh
    if (!mounted) return;
    // Use conditional setState to avoid calling it unnecessarily
    if (!_isLoading) {
      setState(() => _isLoading = true);
    } else if (!mounted && !_isLoading) {
      // Check mount status again before potentially setting state
      _isLoading = true; // Handle potential race condition during initstate
    }

    try {
      final prefs = await SharedPreferences.getInstance();
      if (!mounted) return;

      // Load data
      final loadedName = prefs.getString('userName') ?? 'User';
      final loadedPhone = prefs.getString('userPhone') ?? '';
      final loadedImagePath = prefs.getString('userProfile'); // Can be null

      String? constructedFullUrl;
      bool hasValidPath =
          loadedImagePath != null && loadedImagePath.trim().isNotEmpty;
      if (hasValidPath) {
        // ✅ Check if it's already a complete URL (starts with http:// or https://)
        if (loadedImagePath.startsWith('http://') ||
            loadedImagePath.startsWith('https://')) {
          constructedFullUrl = loadedImagePath;
        } else {
          // It's a relative path, prepend base URL
          if (baseImageUrl.endsWith('/') && loadedImagePath.startsWith('/')) {
            constructedFullUrl = baseImageUrl + loadedImagePath.substring(1);
          } else if (!baseImageUrl.endsWith('/') &&
              !loadedImagePath.startsWith('/')) {
            constructedFullUrl = '$baseImageUrl/$loadedImagePath';
          } else {
            constructedFullUrl = baseImageUrl + loadedImagePath;
          }
        }
      }

      // Update state only if data actually changed or initially loading
      if (_userName != loadedName ||
          _userPhone != loadedPhone ||
          _fullImageUrl != constructedFullUrl ||
          _isLoading) {
        setState(() {
          _userName = loadedName;
          _userPhone = loadedPhone;
          _userImagePath =
              loadedImagePath; // Store relative path if needed elsewhere
          _fullImageUrl = constructedFullUrl; // Store the full URL for display
          _isLoading = false; // Data loaded, stop loading
          logger.i(
              "ProfileScreen Data Loaded/Refreshed: Name=$_userName, Phone=$_userPhone, ImagePath=$_userImagePath, FullURL=$_fullImageUrl");
        });
      } else {
        // If data hasn't changed, still ensure loading is false if it was true
        if (_isLoading) {
          setState(() {
            _isLoading = false;
          });
        }
        logger.i("ProfileScreen Data Loaded/Refreshed: No changes detected.");
      }
    } catch (e, s) {
      logger.e("Error loading user data in ProfileScreen",
          error: e, stackTrace: s);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
              content: Text('Failed to load profile data: $e'),
              backgroundColor: Colors.red),
        );
        setState(() {
          _isLoading = false;
        }); // Stop loading even on error
      }
    }
  }
  // --- End Load User Data ---

  // --- Navigate to Edit Profile and Handle Refresh ---
  void _navigateToEditProfile() async {
    logger.d("Navigating to Edit Profile...");
    // Navigate and WAIT for a result (true if saved successfully)
    final result = await Navigator.push<bool>(
      // Specify type <bool>
      context,
      MaterialPageRoute(builder: (context) => const EditProfileScreen()),
    );

    logger.d("Returned from Edit Profile with result: $result");

    // If the result is true (meaning save was successful in EditProfileScreen)
    if (result == true && mounted) {
      // Check result and mounted status
      logger.i(
          "Edit successful, reloading profile data from SharedPreferences...");
      // Reload the data from SharedPreferences to update THIS screen's display
      await _loadUserData();
    }
  }
  // --- End Navigation Logic ---

  // --- Logout Function ---
  Future<void> _logout(BuildContext context) async {
    // Show confirmation dialog
    final bool? confirmLogout = await showDialog<bool>(
      context: context,
      builder: (BuildContext context) {
        // Replace the old AlertDialog with this new custom Dialog
        return Dialog(
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(20.0),
          ),
          backgroundColor: Colors.white,
          child: Padding(
            padding: const EdgeInsets.all(24.0),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                // The Lottie Animation
                SizedBox(
                  width: 130,
                  height: 130,
                  child: Lottie.asset('assets/Exit.json'),
                ),
                const SizedBox(height: 8),

                // Title Text
                const Text(
                  'Leaving so soon?',
                  style: TextStyle(
                    fontSize: 22,
                    fontWeight: FontWeight.bold,
                    color: Colors.black87,
                  ),
                ),
                const SizedBox(height: 12),

                // Content Text
                Text(
                  'Are you sure you want to end your session?',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontSize: 16,
                    color: Colors.grey.shade600,
                    height: 1.4,
                  ),
                ),
                const SizedBox(height: 24),

                // Action Buttons
                Row(
                  children: [
                    // Cancel Button
                    Expanded(
                      child: TextButton(
                        style: TextButton.styleFrom(
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                        ),
                        child: const Text(
                          'CANCEL',
                          style: TextStyle(
                              color: Colors.grey, fontWeight: FontWeight.bold),
                        ),
                        onPressed: () => Navigator.of(context)
                            .pop(false), // Return false on cancel
                      ),
                    ),
                    const SizedBox(width: 16),
                    // Logout Button
                    Expanded(
                      child: ElevatedButton(
                        style: ElevatedButton.styleFrom(
                          backgroundColor:
                              const Color(0xFFD32F2F), // Red for danger
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                          padding: const EdgeInsets.symmetric(vertical: 12),
                        ),
                        child: const Text(
                          'LOGOUT',
                          style: TextStyle(
                              color: Colors.white, fontWeight: FontWeight.bold),
                        ),
                        onPressed: () => Navigator.of(context)
                            .pop(true), // Return true on confirm
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        );
      },
    );
    // Proceed only if confirmed
    if (confirmLogout == true) {
      try {
        final prefs = await SharedPreferences.getInstance();
        await prefs.clear(); // Clear all preferences on logout
        logger.i("User logged out, preferences cleared.");
        // Use context.mounted check
        if (context.mounted) {
          Navigator.of(context).pushAndRemoveUntil(
              MaterialPageRoute(
                  builder: (ctx) =>
                      const RoleSelectionScreen()), // Go back to start
              (Route<dynamic> route) => false); // Clear navigation stack
        }
      } catch (e, s) {
        logger.e("Error during logout", error: e, stackTrace: s);
        // Use context.mounted check
        if (context.mounted) {
          ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
              content: Text('Logout failed. Please try again.'),
              backgroundColor: Colors.red));
        }
      }
    }
  }
  // --- End Logout Function ---

  // --- Function to show zoomed image dialog with Hero animation ---
  void _showZoomedImage(String imageUrl) {
    logger.d("Showing zoomed image for URL: $imageUrl");
    showDialog(
      context: context,
      barrierColor: Colors.black
          .withOpacity(0.7), // Use a semi-transparent background
      builder: (BuildContext context) {
        return Dialog(
          backgroundColor:
              Colors.transparent, // Make dialog background transparent
          elevation: 0, // No shadow for the dialog itself
          insetPadding:
              const EdgeInsets.all(10), // Padding around the dialog content
          child: GestureDetector(
            // Tap anywhere outside the image to close
            onTap: () => Navigator.of(context).pop(),
            child: InteractiveViewer(
              // Enable pinch-to-zoom and panning
              panEnabled: true,
              minScale: 0.5, // Allow zooming out
              maxScale: 4.0, // Allow zooming in
              child: Center(
                // --- Destination Hero Widget ---
                child: Hero(
                  tag: 'profileImageZoom', // *** SAME TAG AS SOURCE ***
                  // Optional: Placeholder during animation flight
                  placeholderBuilder: (context, heroSize, child) {
                    return SizedBox(
                        width: heroSize.width,
                        height: heroSize.height,
                        child: child);
                  },
                  child: GestureDetector(
                    // Optional: Prevent taps on image closing dialog if needed
                    onTap: () {}, // Consume tap on image itself
                    child: ClipRRect(
                      // Clip if using rounded corners on zoomed image
                      borderRadius:
                          BorderRadius.circular(10), // Example rounding
                      child: CachedNetworkImage(
                        imageUrl: imageUrl,
                        fit: BoxFit
                            .contain, // Show the whole image within bounds
                        placeholder: (context, url) => const Center(
                            child: CircularProgressIndicator(
                                color: Colors.white70)),
                        errorWidget: (context, url, error) => const Center(
                            child: Icon(Icons.broken_image,
                                size: 50, color: Colors.white70)),
                      ),
                    ),
                  ),
                ),
                // --- End Destination Hero ---
              ),
            ),
          ),
        );
      },
    );
  }
  // --- End Zoom Function ---

  @override
  Widget build(BuildContext context) {
    // ✅ Reconstruct the full image URL with same logic
    String? fullImageUrl;
    bool hasValidImagePath =
        _userImagePath != null && _userImagePath!.trim().isNotEmpty;
    if (hasValidImagePath) {
      // ✅ Check if it's already a complete URL
      if (_userImagePath!.startsWith('http://') ||
          _userImagePath!.startsWith('https://')) {
        // Already complete URL, use as-is
        fullImageUrl = _userImagePath;
      } else {
        // Relative path, prepend base URL
        if (baseImageUrl.endsWith('/') && _userImagePath!.startsWith('/')) {
          fullImageUrl = baseImageUrl + _userImagePath!.substring(1);
        } else if (!baseImageUrl.endsWith('/') &&
            !_userImagePath!.startsWith('/')) {
          fullImageUrl = '$baseImageUrl/$_userImagePath';
        } else {
          fullImageUrl = baseImageUrl + _userImagePath!;
        }
      }
    }

    return PopScope(
      canPop: true,
      onPopInvokedWithResult: (didPop, result) async {
        // This PopScope is for ProfileScreen (display mode)
        if (!didPop) {
          if (Navigator.canPop(context)) {
            // If ProfileScreen itself can be popped from its current navigator
            logger.d(
                "ProfileScreen: PopScope - Navigator.canPop is true, popping ProfileScreen.");
            Navigator.pop(context); // Pop it
          } else {
            // If ProfileScreen cannot be popped (e.g., it's the root of the tab's navigator),
            // let MainNavigationScreen's PopScope handle it (which should go to Home).
            logger.d(
                "ProfileScreen: PopScope - Navigator.canPop is false, allowing pop to bubble up.");
          }
        }
      },
      child: Scaffold(
        backgroundColor: const Color(0xFF3A3BE0), // Dark blue background
        body: Stack(
          children: [
            Column(
              children: [
                const SizedBox(height: 60), // Top padding
                // --- Profile Header ---
                Center(
                  child: Column(
                    children: [
                      // --- Wrap CircleAvatar with GestureDetector & Hero ---
                      GestureDetector(
                        // Allow tap only if not loading and image URL exists
                        onTap: !_isLoading &&
                                hasValidImagePath &&
                                fullImageUrl != null
                            ? () => _showZoomedImage(fullImageUrl!)
                            : null,
                        // --- Source Hero Widget ---
                        child: Hero(
                          tag:
                              'profileImageZoom', // *** SAME TAG AS DESTINATION ***
                          child: CircleAvatar(
                            radius: 50,
                            backgroundColor:
                                Colors.white.withOpacity(0.2),
                            // Use CachedNetworkImageProvider
                            backgroundImage:
                                hasValidImagePath && fullImageUrl != null
                                    ? CachedNetworkImageProvider(fullImageUrl)
                                    : null,
                            // Fallback Icon
                            child: (!hasValidImagePath || fullImageUrl == null)
                                ? const Icon(Icons.person_rounded,
                                    size: 50, color: Colors.white70)
                                : null,
                          ),
                        ),
                        // --- End Source Hero ---
                      ),
                      // --- End GestureDetector ---
                      const SizedBox(height: 10),
                      Text(
                          _isLoading
                              ? "Loading..."
                              : _userName, // Show loading or name
                          style: const TextStyle(
                              color: Colors.white,
                              fontSize: 20,
                              fontWeight: FontWeight.bold)),
                      const SizedBox(height: 4),
                      if (!_isLoading &&
                          _userPhone
                              .isNotEmpty) // Show phone if loaded and exists
                        Container(
                            padding: const EdgeInsets.symmetric(
                                horizontal: 12, vertical: 6),
                            decoration: BoxDecoration(
                                color: Colors.white.withOpacity(0.2),
                                borderRadius: BorderRadius.circular(12)),
                            child: Text(_userPhone,
                                style: const TextStyle(color: Colors.white))),
                    ],
                  ),
                ),
                const SizedBox(height: 30),

                // --- White Content Area ---
                Expanded(
                  child: Container(
                    width: double.infinity,
                    clipBehavior: Clip.antiAlias,
                    padding:
                        const EdgeInsets.only(top: 20, left: 16, right: 16),
                    decoration: const BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.only(
                            topLeft: Radius.circular(35),
                            topRight: Radius.circular(35))),
                    child: RefreshIndicator(
                      // Wrap content with RefreshIndicator
                      onRefresh: _loadUserData, // Reload data on pull
                      child: _isLoading
                          ? const Center(
                              child:
                                  CircularProgressIndicator()) // Show loader inside white area
                          : MediaQuery.removePadding(
                              context: context,
                              removeTop:
                                  true, // Remove potential padding from parent
                              child: ListView(
                                // Ensure ListView is scrollable for RefreshIndicator
                                physics: const AlwaysScrollableScrollPhysics(
                                    parent: BouncingScrollPhysics()),
                                children: [
                                  // Profile Tiles
                                  _ProfileTile(
                                      icon: Icons.edit_outlined,
                                      title: 'Edit profile',
                                      color: Colors.grey.shade700,
                                      onTap: _navigateToEditProfile),
                                  Divider(
                                      height: 1,
                                      indent: 1,
                                      endIndent: 1,
                                      color: Colors.grey
                                          .shade300), // Use consistent indent
                                  _ProfileTile(
                                    // Removed const
                                    icon: Icons.lock_outline_rounded,
                                    title: 'Privacy Policy',
                                    color:
                                        const Color.fromARGB(255, 176, 39, 39),
                                    onTap: () {
                                      // Added onTap callback
                                      Navigator.push(
                                        context,
                                        MaterialPageRoute(
                                            builder: (context) =>
                                                PrivacyPolicyPage()), // Navigate to privacypolicy
                                      );
                                      // logger.d(
                                      //     "Navigating to Help & Support Screen...");
                                    },
                                  ),
                                  Divider(
                                      height: 1,
                                      indent: 1,
                                      endIndent: 1,
                                      color: Colors.grey.shade300),
                                  _ProfileTile(
                                    // Removed const
                                    icon: Icons.list_alt_outlined,
                                    title: 'Terms & Conditions',
                                    color:
                                        const Color.fromARGB(255, 105, 176, 39),
                                    onTap: () {
                                      // Added onTap callback
                                      Navigator.push(
                                        context,
                                        MaterialPageRoute(
                                            builder: (context) =>
                                                TermsConditionsPage()), // Navigate to HelpSupportScreen
                                      );
                                      // logger.d(
                                      //     "Navigating to Help & Support Screen...");
                                    },
                                  ),
                                  Divider(
                                      height: 1,
                                      indent: 1,
                                      endIndent: 1,
                                      color: Colors.grey.shade300),
                                  _ProfileTile(
                                    icon: Icons.history_outlined,
                                    title: 'Order History',
                                    color: Colors.blue,
                                    onTap: () {
                                      Navigator.push(
                                        context,
                                        MaterialPageRoute(
                                            builder: (context) =>
                                                const MyTicketsScreen()), // Navigate to MyTicketScreen
                                      );
                                    },
                                  ),
                                  Divider(
                                      height: 1,
                                      indent: 1,
                                      endIndent: 1,
                                      color: Colors.grey.shade300),
                                  _ProfileTile(
                                    icon: Icons.history_outlined,
                                    title: 'About Application',
                                    color: Colors.cyan,
                                    onTap: () {
                                      Navigator.push(
                                        context,
                                        MaterialPageRoute(
                                            builder: (context) =>
                                                AboutPage()), // Navigate to MyTicketScreen
                                      );
                                    },
                                  ),
                                  Divider(
                                      height: 1,
                                      indent: 1,
                                      endIndent: 1,
                                      color: Colors.grey.shade300),

                                  // --- *** UPDATED HELP & SUPPORT TILE *** ---
                                  _ProfileTile(
                                    // Removed const
                                    icon: Icons.help_outline_rounded,
                                    title: 'Help & Support',
                                    color: Colors.purple,
                                    onTap: () {
                                      // Added onTap callback
                                      Navigator.push(
                                        context,
                                        MaterialPageRoute(
                                            builder: (context) =>
                                                HelpSupportScreen()), // Navigate to HelpSupportScreen
                                      );
                                      logger.d(
                                          "Navigating to Help & Support Screen...");
                                    },
                                  ),
                                  // --- *** END UPDATED TILE *** ---

                                  Divider(
                                      height: 1,
                                      indent: 1,
                                      endIndent: 1,
                                      color: Colors.grey.shade300),
                                  const _ProfileTile(
                                      icon: Icons.language_outlined,
                                      title: 'Language',
                                      color: Colors.teal),
                                  Divider(
                                      height: 1,
                                      indent: 1,
                                      endIndent: 1,
                                      color: Colors.grey.shade300),
                                  _ProfileTile(
                                      icon: Icons.logout_rounded,
                                      title: 'Log out',
                                      color: Colors.redAccent.shade700,
                                      onTap: () =>
                                          _logout(context)), // Logout Tile
                                  const SizedBox(
                                      height: 40), // Space before version
                                  const Center(
                                      child: Text("Version 2.0.2",
                                          style:
                                              TextStyle(color: Colors.grey))),
                                  const SizedBox(height: 20), // Bottom padding
                                ],
                              ),
                            ),
                    ),
                  ),
                ),
              ],
            ),

            // --- REMOVE THE Positioned Back Button ---
            // Positioned(
            //   top: MediaQuery.of(context).padding.top +
            //       8, // Adjust based on status bar
            //   left: 16,
            //   child: Material(
            //       // For splash effect
            //       color: Colors.transparent,
            //       shape: const CircleBorder(),
            //       clipBehavior: Clip.antiAlias,
            //       child: IconButton(
            //           icon: const Icon(Icons.arrow_back_ios_new_rounded,
            //               color: Colors.white, size: 22),
            //           onPressed: () {
            //             MainNavigationScreen.navigateToTab(context, 0);
            //           },
            //           tooltip: 'Back to Home')), // Updated tooltip
            // ),
            const FloatingChatBox(),
          ],
        ),
      ),
    );
  }
}

// --- _ProfileTile Widget (No changes needed from your provided code) ---
class _ProfileTile extends StatelessWidget {
  final IconData icon;
  final String title;
  final Color color;
  final VoidCallback? onTap;

  // Added key parameter for best practice
  const _ProfileTile(
      {required this.icon,
      required this.title,
      required this.color,
      this.onTap // Added key
      });

  @override
  Widget build(BuildContext context) {
    return ListTile(
      contentPadding: const EdgeInsets.symmetric(vertical: 4.0, horizontal: 0),
      leading: Container(
          padding: const EdgeInsets.all(8),
          decoration: BoxDecoration(
              color: color.withOpacity(0.1),
              borderRadius: BorderRadius.circular(10)),
          child: Icon(icon, color: color, size: 22)),
      title: Text(title,
          style: TextStyle(
              fontWeight: FontWeight.w500,
              color:
                  title == 'Log out' ? Colors.red.shade700 : Colors.black87)),
      trailing:
          Icon(Icons.arrow_forward_ios, size: 16, color: Colors.grey.shade400),
      onTap: onTap,
    );
  }
}
// --- End _ProfileTile Widget ---
