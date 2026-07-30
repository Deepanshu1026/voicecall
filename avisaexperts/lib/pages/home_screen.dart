import 'package:avisa_experts/pages/transit-visa.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart'; // For HapticFeedback
import 'package:shared_preferences/shared_preferences.dart';
import 'package:logger/logger.dart';
import 'package:carousel_slider/carousel_slider.dart';
import 'package:lottie/lottie.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'dart:convert';
import 'package:http/http.dart' as http;
import 'dart:async'; // Import for Timer
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import 'package:url_launcher/url_launcher.dart';

import '../widget/guest-to-user.dart';
import '../widget/guest_upgrade_dialog.dart';
import '../appbar/common_widgets.dart';
import '../navigation/main_navigation_screen.dart';
import '../widget/chatbox.dart';
import '../widget/promotion_video.dart';
// import 'appointment_booking_page.dart';
import 'advisor_list_screen.dart';
import '../config/app_config.dart';
import 'tourist.dart'; // Assuming CarouselScreen is in tourist.dart
import 'work-visa.dart'; // Assuming CarouselScreen is in work-visa.dart
// import '../authentication/check.dart'; // Assuming CarouselScreen is in check.dart
// Assuming CarouselScreen is in tourist.dart
// import 'coming-soon.dart'; // Assuming CarouselScreen is in coming-soon.dart
// Assuming CarouselScreen is in tourist.dart
// import 'inbox_screen.dart';

final logger = Logger(
  printer: PrettyPrinter(
      methodCount: 1,
      errorMethodCount: 3,
      lineLength: 90,
      colors: true,
      printEmojis: true,
      printTime: false),
);

// --- Data Models ---
class Consultant {
  final String name;
  final String specialty;
  final String imageUrl;
  // final IconData? actionIcon; // Not used in this specific design from image
  final String userStatus;
  // final String pricePerMin;

  Consultant({
    required this.name,
    required this.specialty,
    required this.imageUrl,
    // this.actionIcon,
    required this.userStatus,
    // required this.pricePerMin,
  });
}

class SuccessStory {
  final String userName;
  final String visaType;
  final double rating;
  final String storySnippet;
  final String userImageUrl;

  SuccessStory({
    required this.userName,
    required this.visaType,
    required this.rating,
    required this.storySnippet,
    required this.userImageUrl,
  });
}

class NewsArticle {
  final String title;
  final String content;
  final String imageUrl;
  final String views;
  bool isBookmarked;

  NewsArticle({
    required this.title,
    required this.content,
    required this.imageUrl,
    required this.views,
    this.isBookmarked = false,
  });

  factory NewsArticle.fromJson(Map<String, dynamic> json) {
    // Ensure image URL is not null and is a valid URL, otherwise use a placeholder or empty string
    String imageUrl = json['image'] as String? ?? '';
    if (imageUrl.isNotEmpty && !imageUrl.startsWith('http')) {
      // Assuming if it's not a full URL, it might be a relative path that needs a base URL
      // For now, if it's not a full URL, we'll treat it as potentially invalid or handle as needed.
      // If you have a base URL for these images, prepend it here.
      // For now, let's log if it's not a full http/https URL and not empty.
      if (!imageUrl.startsWith('assets/')) {
        // Allow local assets if specified
        logger.w("News image URL might be relative or invalid: $imageUrl");
      }
    }

    return NewsArticle(
      title: json['title'] as String? ?? 'No Title',
      content: json['content'] as String? ?? 'No Content',
      imageUrl: imageUrl,
      views: '${json['Views'] ?? 0} views', // API provides 'Views' as int
      isBookmarked:
          false, // Default to false, can be loaded from prefs if needed
    );
  }

  String get truncatedContent {
    List<String> words =
        content.split(RegExp(r'\s+')); // Split by any whitespace
    if (words.length > 30) {
      return '${words.sublist(0, 30).join(' ')}...';
    }
    return content;
  }
}
// --- End Data Models ---

class PulsingBookNowButton extends StatefulWidget {
  const PulsingBookNowButton({super.key});

  @override
  State<PulsingBookNowButton> createState() => _PulsingBookNowButtonState();
}

class _PulsingBookNowButtonState extends State<PulsingBookNowButton>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _scaleAnimation;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _checkAndShowConversionDialog();
    });
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 1),
    )..repeat(reverse: true);
    _scaleAnimation = Tween<double>(begin: 1.0, end: 1.07).animate(
      CurvedAnimation(parent: _controller, curve: Curves.easeInOut),
    );
  }

  Future<void> _checkAndShowConversionDialog() async {
    final shouldShow =
        await GuestConversionService.shouldShowConversionDialog();

    if (shouldShow && mounted) {
      final result = await showDialog<bool>(
        context: context,
        barrierDismissible: false, // User must interact with dialog
        builder: (context) => const GuestConversionDialog(),
      );

      if (result == true && mounted) {
        // User successfully converted - show success and refresh
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('🎉 Welcome! Your account has been upgraded!'),
            backgroundColor: Colors.green,
            duration: Duration(seconds: 3),
          ),
        );

        // Refresh the screen to show updated user status
        setState(() {});
      }
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return ScaleTransition(
      scale: _scaleAnimation,
      child: ElevatedButton(
        onPressed: () {
          MainNavigationScreen.navigateToTab(context, 1);
        },
        style: ElevatedButton.styleFrom(
          backgroundColor: Colors.white,
          foregroundColor: Colors.blue.shade700,
          shadowColor: Colors.blue.withOpacity(0.6),
          elevation: 10,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(20),
          ),
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
        ),
        child: const Text(
          "Book Now",
          style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
        ),
      ),
    );
  }
}

Future<void> _launchSocialUrl(String urlString) async {
  final Uri url = Uri.parse(urlString);
  if (!await launchUrl(url)) {
    // You can show an error message here if you want
    print('Could not launch $urlString');
  }
}

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen>
    with WidgetsBindingObserver, SingleTickerProviderStateMixin {
  String _userName = 'User';
  String? _userImagePath;
  int _currentCarouselIndex = 0;
  final CarouselSliderController _carouselController =
      CarouselSliderController();
  bool _isFabMenuOpen = false;

  // Animation for the banner icon
  late AnimationController _bannerIconAnimationController;
  late Animation<double> _bannerIconScaleAnimation;

  // Scroll controller and timer for Success Stories marquee
  late ScrollController _successStoriesScrollController;
  Timer? _successStoriesScrollTimer;
  final double _successStoriesScrollSpeed =
      2; // Adjust speed as needed (lower is slower)
  final Duration _successStoriesScrollInterval =
      const Duration(milliseconds: 40); // Adjust interval

  bool _isLoadingConsultants = true;
  List<Consultant> _consultants = [];

  // Add loading state for success stories
  bool _isLoadingSuccessStories = true;
  List<SuccessStory> _successStories = [];

  List<String> _carouselImagePaths = [];

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    _loadUserDataFromPrefs();
    _fetchConsultants();
    _fetchSuccessStories(); // Add this line
    _loadBannersFromCache();
    _successStoriesScrollController = ScrollController();
    _startSuccessStoriesAutoScroll();

    // Initialize banner icon animation
    _bannerIconAnimationController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 800),
    )..repeat(reverse: true);
    _bannerIconScaleAnimation = Tween<double>(begin: 0.9, end: 1.1).animate(
      CurvedAnimation(
          parent: _bannerIconAnimationController, curve: Curves.easeInOut),
    );
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    _bannerIconAnimationController.dispose(); // Dispose banner icon controller
    _successStoriesScrollTimer?.cancel();
    _successStoriesScrollController.dispose();
    super.dispose();
  }

  void _startSuccessStoriesAutoScroll() {
    if (_successStories.isEmpty || !mounted) return;

    _successStoriesScrollTimer?.cancel();

    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (mounted &&
          _successStoriesScrollController.hasClients &&
          _successStoriesScrollController.position.haveDimensions) {
        _successStoriesScrollTimer =
            Timer.periodic(_successStoriesScrollInterval, (timer) {
          if (!mounted ||
              !_successStoriesScrollController.hasClients ||
              !_successStoriesScrollController.position.haveDimensions) {
            timer.cancel();
            return;
          }

          double maxScroll =
              _successStoriesScrollController.position.maxScrollExtent;
          double currentScroll = _successStoriesScrollController.offset;
          double newScrollPosition = currentScroll + _successStoriesScrollSpeed;

          if (maxScroll == 0) return;

          if (newScrollPosition >= maxScroll) {
            // Jump to a position that makes it look like it's looping from the start
            _successStoriesScrollController.jumpTo(newScrollPosition -
                maxScroll +
                _successStoriesScrollController.position.minScrollExtent);
          } else {
            _successStoriesScrollController.jumpTo(newScrollPosition);
          }
        });
      } else if (mounted) {
        // Retry if not ready, e.g. after a short delay
        Future.delayed(const Duration(milliseconds: 100), () {
          if (mounted) _startSuccessStoriesAutoScroll();
        });
      }
    });
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    super.didChangeAppLifecycleState(state);
    if (state == AppLifecycleState.resumed) {
      logger.d("HomeScreen: App resumed, reloading data from prefs...");
      _loadUserDataFromPrefs();
    }
  }

  Future<void> _loadUserDataFromPrefs() async {
    logger.d("HomeScreen: Loading user data from SharedPreferences...");
    try {
      final prefs = await SharedPreferences.getInstance();
      if (!mounted) return;
      final String loadedName = prefs.getString('userName') ?? 'User';
      final String? loadedImagePath = prefs.getString('userProfile');
      if (mounted &&
          (_userName != loadedName || _userImagePath != loadedImagePath)) {
        setState(() {
          _userName = loadedName;
          _userImagePath =
              (loadedImagePath != null && loadedImagePath.trim().isNotEmpty)
                  ? loadedImagePath.trim()
                  : null;
        });
      }
    } catch (e, s) {
      logger.e("Error loading user data in HomeScreen",
          error: e, stackTrace: s);
    }
  }

  Future<void> _fetchConsultants() async {
    logger.d("HomeScreen: Fetching consultants from API...");
    if (!mounted) return;
    setState(() {
      _isLoadingConsultants = true;
    });
    final String baseUrl = AppConfig.staticAssetBase;

    try {
      final response = await http
          .get(Uri.parse(AppConfig.consultants));
      if (!mounted) return;

      if (response.statusCode == 200) {
        final Map<String, dynamic> decodedResponse = json.decode(response.body);

        if (decodedResponse['success'] == true &&
            decodedResponse['data'] is List) {
          final List<dynamic> consultantListJson = decodedResponse['data'];

          final activeConsultantsJson = consultantListJson.where((jsonItem) {
            if (jsonItem is Map<String, dynamic>) {
              final status = jsonItem['user_current_status']
                      ?.toString()
                      .trim()
                      .toLowerCase() ??
                  'offline';
              return status == 'active';
            }
            return false;
          }).toList();

          setState(() {
            _consultants = activeConsultantsJson.map((jsonItem) {
              if (jsonItem is Map<String, dynamic>) {
                String profilePath =
                    jsonItem['user_profile']?.toString().trim() ?? '';
                String finalImageUrl;

                if (profilePath.isEmpty) {
                  finalImageUrl = '';
                } else if (profilePath.startsWith('http')) {
                  finalImageUrl = profilePath;
                } else if (profilePath.startsWith('assets/')) {
                  finalImageUrl = profilePath;
                } else {
                  finalImageUrl = '$baseUrl/${profilePath.replaceAll(r'\\', '/')}';
                }

                String status =
                    jsonItem['user_current_status']?.toString().trim() ??
                        'Offline';
                // String price =
                //     jsonItem['price_per_minute']?.toString().trim() ??
                //         '₹ --/- per Min.'; // ADJUST API KEY IF NEEDED

                return Consultant(
                  name: jsonItem['user_name'] ?? 'N/A',
                  specialty: jsonItem['expertise'] ?? 'N/A',
                  imageUrl: finalImageUrl,
                  userStatus: status,
                  // pricePerMin: price,
                );
              } else {
                logger.w(
                    "Encountered non-map item in consultant data list: $jsonItem");
                return Consultant(
                    name: 'Invalid Data',
                    specialty: 'N/A',
                    imageUrl: '',
                    userStatus: 'Offline');
              }
            }).toList();
            _isLoadingConsultants = false;
          });
        } else {
          logger.e(
              "Consultant API response format error or success is false. Message: ${decodedResponse['message']}");
          if (mounted) {
            setState(() {
              _consultants = [];
              _isLoadingConsultants = false;
            });
          }
        }
      } else {
        logger.e(
            "Failed to fetch consultants. Status code: ${response.statusCode}");
        if (mounted) {
          setState(() {
            _consultants = [];
            _isLoadingConsultants = false;
          });
        }
      }
    } catch (e, s) {
      logger.e("Error fetching consultants", error: e, stackTrace: s);
      if (mounted) {
        setState(() {
          _consultants = [];
          _isLoadingConsultants = false;
        });
      }
    }
  }

  // Add a method to load cached banners
  Future<void> _loadBannersFromCache() async {
    final prefs = await SharedPreferences.getInstance();
    final List<String>? cachedBanners = prefs.getStringList('cached_banners');
    if (cachedBanners != null && cachedBanners.isNotEmpty && mounted) {
      setState(() {
        _carouselImagePaths = cachedBanners;
      });
    } else {
      _fetchBanners(); // If no banners in cache, fetch them
    }
  }

  Future<void> _fetchBanners() async {
    if (!mounted) return;
    setState(() {});

    try {
      final response = await http.get(Uri.parse(AppConfig.banners));
      if (!mounted) return;

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        if (data['success'] == true && data['banners'] is List) {
          final fetchedBanners = data['banners'] as List;
          final List<String> fetchedUrls = [];

          for (var banner in fetchedBanners) {
            if (banner is Map<String, dynamic> &&
                banner['file_path'] is String) {
              fetchedUrls.add(banner['file_path']);
            }
          }
          setState(() {
            _carouselImagePaths = fetchedUrls;
          });
          // Step 2: Store in cache
          final prefs = await SharedPreferences.getInstance();
          await prefs.setStringList('cached_banners', fetchedUrls);
        } else {
          throw Exception("Failed to parse banner data from API.");
        }
      } else {
        throw Exception("Server returned status ${response.statusCode}");
      }
    } catch (e) {
      setState(() {});
    }
  }

  List<Widget> _buildCarouselItems() {
    return _carouselImagePaths.map((imagePath) {
      return Builder(
        builder: (BuildContext context) {
          return Container(
            width: MediaQuery.of(context).size.width,
            margin: const EdgeInsets.symmetric(horizontal: 0),
            decoration: BoxDecoration(
              color: Colors.grey.shade200,
            ),
            child: ClipRRect(
              child: Image.network(
                imagePath,
                fit: BoxFit.cover,
                errorBuilder: (context, error, stackTrace) => const Center(
                  child: Icon(
                    Icons.image_not_supported_outlined,
                    color: Colors.grey,
                    size: 50,
                  ),
                ),
              ),
            ),
          );
        },
      );
    }).toList();
  }

  Widget _buildFabMenuPill() {
    const itemAnimationDuration = Duration(milliseconds: 200);
    return Material(
      elevation: 6.0,
      borderRadius: BorderRadius.circular(50),
      color: const Color.fromARGB(255, 250, 250, 250),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 20.0, vertical: 16.0),
        decoration: BoxDecoration(
            color: const Color.fromARGB(255, 255, 255, 255),
            borderRadius: BorderRadius.circular(50),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.50),
                blurRadius: 8,
                offset: const Offset(0, 4),
              )
            ]),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          mainAxisAlignment: MainAxisAlignment.spaceAround,
          children: <Widget>[
            AnimatedOpacity(
              opacity: _isFabMenuOpen ? 1.0 : 0.0,
              duration: itemAnimationDuration,
              curve: Curves.easeIn,
              child: _buildFabMenuItem(
                  Icons.chat_bubble_outline_rounded, "Chat", () {
                logger.d("Chat from pill menu tapped");
                setState(() {
                  _isFabMenuOpen = false;
                });
                Navigator.push(
                    context,
                    MaterialPageRoute(
                        builder: (_) => const AdvisorListScreen()));
              }),
            ),
            const SizedBox(width: 30),
            AnimatedOpacity(
              opacity: _isFabMenuOpen ? 1.0 : 0.0,
              duration: itemAnimationDuration,
              curve: Curves.easeIn,
              child: _buildFabMenuItem(Icons.videocam_outlined, "Video", () {
                logger.d("Video Call from pill menu tapped");
                setState(() {
                  _isFabMenuOpen = false;
                });
                Navigator.push(
                    context,
                    MaterialPageRoute(
                        builder: (_) => const AdvisorListScreen()));
              }),
            ),
            const SizedBox(width: 30),
            AnimatedOpacity(
              opacity: _isFabMenuOpen ? 1.0 : 0.0,
              duration: itemAnimationDuration,
              curve: Curves.easeIn,
              child: _buildFabMenuItem(Icons.call_outlined, "Call", () {
                logger.d("Call from pill menu tapped");
                setState(() {
                  _isFabMenuOpen = false;
                });
                Navigator.push(
                    context,
                    MaterialPageRoute(
                        builder: (_) => const AdvisorListScreen()));
              }),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildFabMenuItem(
      IconData icon, String label, VoidCallback onPressed) {
    return InkWell(
      onTap: onPressed,
      borderRadius: BorderRadius.circular(20),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, color: Colors.grey.shade700, size: 26),
        ],
      ),
    );
  }

  Widget _buildSectionHeader(String title, VoidCallback onSeeAllTap,
      {EdgeInsetsGeometry? padding}) {
    return Padding(
      padding: padding ??
          const EdgeInsets.only(
              left: 16.0, right: 8.0, top: 24.0, bottom: 12.0),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          Text(
            title,
            style: const TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.bold,
                color: Color.fromARGB(221, 30, 30, 30)),
          ),
          TextButton(
            onPressed: onSeeAllTap,
            style: TextButton.styleFrom(
              padding: const EdgeInsets.symmetric(horizontal: 8.0),
              minimumSize: const Size(0, 0),
              tapTargetSize: MaterialTapTargetSize.shrinkWrap,
            ),
            child: Text(
              'See all',
              style: TextStyle(
                  fontSize: 14.5,
                  color: Theme.of(context).primaryColorDark,
                  fontWeight: FontWeight.w600),
            ),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    logger.d("HomeScreen: Build method called. User Name: $_userName");
    final theme = Theme.of(context);

    Widget scrollableMainContent = RefreshIndicator(
      onRefresh: () async {
        await _loadUserDataFromPrefs();
        await _fetchConsultants();
        await _fetchSuccessStories(); // Add this line
        await _fetchBanners();
      },
      child: SingleChildScrollView(
        // physics: const AlwaysScrollableScrollPhysics(
        //     parent: BouncingScrollPhysics()),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Carousel Section
            if (_carouselImagePaths.isNotEmpty)
              Stack(
                alignment: Alignment.bottomCenter,
                children: [
                  CarouselSlider(
                    items: _buildCarouselItems(),
                    carouselController: _carouselController,
                    options: CarouselOptions(
                      height: 180.0,
                      autoPlay: true,
                      autoPlayInterval: const Duration(seconds: 5),
                      enlargeCenterPage: false,
                      aspectRatio: 16 / 9,
                      viewportFraction: 1.0,
                      onPageChanged: (index, reason) {
                        setState(() {
                          _currentCarouselIndex = index;
                        });
                      },
                    ),
                  ),
                  if (_carouselImagePaths.isNotEmpty)
                    Positioned(
                      bottom: 10.0,
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 6.0, vertical: 3.0),
                        decoration: BoxDecoration(
                          color: Colors.black.withOpacity(0.6),
                          borderRadius: BorderRadius.circular(20.0),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children:
                              _carouselImagePaths.asMap().entries.map((entry) {
                            int index = entry.key;
                            return GestureDetector(
                              onTap: () =>
                                  _carouselController.animateToPage(index),
                              child: Container(
                                width:
                                    _currentCarouselIndex == index ? 8.0 : 5.0,
                                height:
                                    _currentCarouselIndex == index ? 8.0 : 5.0,
                                margin:
                                    const EdgeInsets.symmetric(horizontal: 4.0),
                                decoration: BoxDecoration(
                                  shape: BoxShape.circle,
                                  color: Colors.white.withOpacity(
                                      _currentCarouselIndex == index
                                          ? 0.9
                                          : 0.4),
                                ),
                              ),
                            );
                          }).toList(),
                        ),
                      ),
                    ),
                ],
              )
            else
              Container(
                  height: 180,
                  width: double.infinity,
                  color: Colors.grey.shade200,
                  child: const Center(child: Text("Banners Loading..."))),

            Padding(
              padding: const EdgeInsets.only(bottom: 10.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Padding(
                    padding: const EdgeInsets.fromLTRB(16.0, 24.0, 16.0, 0.0),
                    child: const Text("Categories",
                        style: TextStyle(
                            fontSize: 20,
                            fontWeight: FontWeight.bold,
                            color: Color.fromARGB(221, 30, 30, 30))),
                  ),
                  const SizedBox(height: 16),
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 16.0),
                    child: Row(
                      children: [
                        Expanded(
                          child: SizedBox(
                            height: 130,
                            child: Container(
                              padding: const EdgeInsets.all(12),
                              decoration: BoxDecoration(
                                color: const Color.fromARGB(255, 228, 240, 250),
                                borderRadius: BorderRadius.circular(12),
                                border: Border.all(
                                  color:
                                      const Color.fromARGB(139, 49, 144, 240),
                                ),
                              ),
                              child: Column(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  GestureDetector(
                                    onTap: () {
                                      Navigator.push(
                                        context,
                                        MaterialPageRoute(
                                          builder: (context) => TouristScreen(),
                                        ),
                                      );
                                    },
                                    child: SizedBox(
                                      height: 75,
                                      width: 75,
                                      child: Lottie.asset(
                                        'assets/touristvisa.json',
                                        fit: BoxFit.contain,
                                        repeat: true,
                                        animate: true,
                                      ),
                                    ),
                                  ),
                                  const SizedBox(height: 10),
                                  const Text("Tourist Visa",
                                      style: TextStyle(
                                          fontSize: 12,
                                          fontWeight: FontWeight.bold,
                                          color: Color.fromARGB(221, 0, 0, 0))),
                                ],
                              ),
                            ),
                          ),
                        ),
                        const SizedBox(width: 10),
                        Expanded(
                          child: SizedBox(
                            height: 130,
                            child: Container(
                              padding: const EdgeInsets.all(12),
                              decoration: BoxDecoration(
                                color: const Color.fromARGB(255, 249, 239, 225),
                                borderRadius: BorderRadius.circular(12),
                                border: Border.all(
                                  color:
                                      const Color.fromARGB(139, 240, 205, 65),
                                ),
                              ),
                              child: Column(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  GestureDetector(
                                    onTap: () {
                                      Navigator.push(
                                        context,
                                        MaterialPageRoute(
                                          builder: (context) =>
                                              WorkVisaScreen(),
                                        ),
                                      );
                                    },
                                    child: SizedBox(
                                      height: 75,
                                      width: 90,
                                      child: Lottie.asset(
                                        'assets/workvisa.json',
                                        fit: BoxFit.contain,
                                        repeat: true,
                                        animate: true,
                                      ),
                                    ),
                                  ),
                                  const SizedBox(height: 10),
                                  const Text("Work Visa",
                                      style: TextStyle(
                                          fontSize: 12,
                                          fontWeight: FontWeight.bold,
                                          color: Color.fromARGB(221, 0, 0, 0))),
                                ],
                              ),
                            ),
                          ),
                        ),
                        const SizedBox(width: 10),
                        Expanded(
                          child: SizedBox(
                            height: 130,
                            child: Container(
                              padding: const EdgeInsets.all(12),
                              decoration: BoxDecoration(
                                color: const Color.fromARGB(255, 249, 239, 225),
                                borderRadius: BorderRadius.circular(12),
                                border: Border.all(
                                  color:
                                      const Color.fromARGB(139, 240, 205, 65),
                                ),
                              ),
                              child: Column(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  GestureDetector(
                                    onTap: () {
                                      Navigator.push(
                                        context,
                                        MaterialPageRoute(
                                          builder: (context) =>
                                              TransitVisaScreen(),
                                        ),
                                      );
                                    },
                                    child: SizedBox(
                                      height: 75,
                                      width: 90,
                                      child: Lottie.asset(
                                        'assets/transitvisa.json',
                                        fit: BoxFit.contain,
                                        repeat: true,
                                        animate: true,
                                      ),
                                    ),
                                  ),
                                  const SizedBox(height: 10),
                                  const Text("Transit Visa",
                                      style: TextStyle(
                                          fontSize: 12,
                                          fontWeight: FontWeight.bold,
                                          color: Color.fromARGB(221, 0, 0, 0))),
                                ],
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                  Padding(
                    padding: const EdgeInsets.fromLTRB(16.0, 24.0, 16.0, 0.0),
                    child: const Text("Book Your Meeting",
                        style: TextStyle(
                            fontSize: 20,
                            fontWeight: FontWeight.bold,
                            color: Color.fromARGB(221, 30, 30, 30))),
                  ),
                  const SizedBox(height: 16),
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 16.0),
                    child: Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        image: const DecorationImage(
                            image: AssetImage('assets/tourist.webp'),
                            fit: BoxFit.cover,
                            opacity: 0.3),
                        borderRadius: BorderRadius.circular(12),
                        gradient: LinearGradient(
                            colors: [
                              const Color.fromARGB(255, 50, 50, 95)
                                  .withOpacity(0.8),
                              const Color.fromARGB(255, 44, 90, 227)
                                  .withOpacity(0.9)
                            ],
                            begin: Alignment.topLeft,
                            end: Alignment.bottomRight),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text("Book Your Visa Appointment Now",
                              style: TextStyle(
                                  color: Colors.white,
                                  fontSize: 18,
                                  fontWeight: FontWeight.bold)),
                          const SizedBox(height: 8),
                          const Text(
                              "Schedule your appointment and let our professionals handle the rest. Available 24/7.",
                              style: TextStyle(
                                  color: Colors.white70, fontSize: 14)),
                          const SizedBox(height: 16),
                          TweenAnimationBuilder<double>(
                            tween: Tween(begin: 0.8, end: 1.0),
                            duration: const Duration(milliseconds: 800),
                            curve: Curves.elasticOut,
                            builder: (context, scale, child) {
                              return Transform.scale(
                                  scale: scale,
                                  child: const PulsingBookNowButton());
                            },
                          ),
                        ],
                      ),
                    ),
                  ),
                  _buildSectionHeader("Our Immigration Experts", () {
                    logger.d("See all Top Immigration Experts tapped");
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                          builder: (context) => const AdvisorListScreen()),
                    );
                  }),
                  const SizedBox(height: 0),

// Banner container with overflowing image
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 16.0),
                    child: GestureDetector(
                      onTap: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                              builder: (context) => const AdvisorListScreen()),
                        );
                      },
                      child: Container(
                        width: double.infinity,
                        height: 80,
                        // margin: const EdgeInsets.only(bottom: 1.0),
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
                          // boxShadow: [
                          //   BoxShadow(
                          //     color: Colors.black.withOpacity(0.1),
                          //     spreadRadius: 0,
                          //     blurRadius: 8,
                          //     offset: const Offset(0, 4),
                          //   ),
                          // ],
                        ),
                        child: Stack(
                          clipBehavior: Clip
                              .none, // Allow image to overflow container bounds
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
                                      crossAxisAlignment:
                                          CrossAxisAlignment.start,
                                      mainAxisAlignment:
                                          MainAxisAlignment.center,
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
                                // Spacer instead of image container
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
                                      errorBuilder:
                                          (context, error, stackTrace) =>
                                              Container(
                                        color: Colors.white.withOpacity(0.1),
                                        child: Icon(Icons.image,
                                            color:
                                                Colors.white.withOpacity(0.5)),
                                      ),
                                    ),
                                  ),
                                ),
                              ),
                            ),

                            // Arrow icon
                            Positioned(
                              right: 4,
                              bottom: 4,
                              child: Container(
                                width: 28,
                                height: 28,
                                decoration: BoxDecoration(
                                  color: Colors.white.withOpacity(0.8),
                                  shape: BoxShape.circle,
                                ),
                                child: const Icon(
                                  Icons.arrow_forward,
                                  color: Color.fromARGB(255, 0, 0, 0),
                                  size: 18,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),

// Consultants List Section
                  Container(
                    height: 210, // Adjusted to fit the new card design
                    padding: const EdgeInsets.only(top: 8, bottom: 8),
                    child: _isLoadingConsultants
                        ? const Center(child: CircularProgressIndicator())
                        : _consultants.isEmpty
                            ? Center(
                                child: Text("No consultants found.",
                                    style:
                                        TextStyle(color: Colors.grey.shade700)),
                              )
                            : ListView.builder(
                                scrollDirection: Axis.horizontal,
                                padding: const EdgeInsets.symmetric(
                                    horizontal: 16.0),
                                itemCount: _consultants.length > 90
                                    ? 90
                                    : _consultants.length,
                                itemBuilder: (context, index) =>
                                    _buildConsultantCard(
                                        _consultants[index], theme),
                              ),
                  ),
                  _buildSectionHeader("Success Stories", () {
                    logger.d("See all Success Stories tapped");
                    // Navigator.push(
                    //   context,
                    //   MaterialPageRoute(
                    //       builder: (context) => const InboxScreen()),
                    // );
                  }),
                  SizedBox(
                    height: 200,
                    child: _isLoadingSuccessStories
                        ? const Center(child: CircularProgressIndicator())
                        : _successStories.isEmpty
                            ? const Center(
                                child: Text("No success stories yet."))
                            : ListView.builder(
                                controller: _successStoriesScrollController,
                                scrollDirection: Axis.horizontal,
                                padding: const EdgeInsets.symmetric(
                                    horizontal: 16.0),
                                itemCount: _successStories.length *
                                    50, // Large number for "infinite" scroll
                                itemBuilder: (context, index) {
                                  final storyIndex =
                                      index % _successStories.length;
                                  return _buildSuccessStoryCard(
                                      _successStories[storyIndex], theme);
                                },
                              ),
                  ),

                  // _buildSectionHeader("Immigration Blogs", () {
                  //   logger.d("See all Immigration News tapped");
                  //   // Potentially navigate to a dedicated news screen
                  // }),
                  // _buildImmigrationNewsSection(
                  //     theme), // Updated to use a new method
                  const SizedBox(height: 24),

                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      // Instagram
                      IconButton(
                        icon: const Icon(FontAwesomeIcons.instagram,
                            color: Colors.pink, size: 20),
                        onPressed: () => _launchSocialUrl(
                            'https://www.instagram.com/avisaexpert/'),
                      ),
                      const SizedBox(width: 16),

                      // Facebook
                      IconButton(
                        icon: const Icon(FontAwesomeIcons.facebook,
                            color: Colors.blue, size: 20),
                        onPressed: () => _launchSocialUrl(
                            'https://www.facebook.com/share/1B24TCrE1a/?mibextid=wwXIfr'),
                      ),
                      const SizedBox(width: 16),

                      // YouTube (Corrected URL)
                      IconButton(
                        icon: const Icon(FontAwesomeIcons.youtube,
                            color: Color.fromARGB(255, 255, 0, 0), size: 20),
                        onPressed: () => _launchSocialUrl(
                            'https://www.youtube.com/@AvisaExperts'),
                      ),
                      const SizedBox(width: 16),

                      // LinkedIn (Corrected URL)
                      IconButton(
                        icon: const Icon(FontAwesomeIcons.linkedin,
                            color: Colors.blueAccent, size: 20),
                        onPressed: () => _launchSocialUrl(
                            'https://www.linkedin.com/in/avisaexperts'),
                      ),
                    ],
                  ),

                  const SizedBox(height: 16),

                  const Padding(
                    padding: EdgeInsets.all(8.0),
                    child: Center(
                      child: Text(
                        'copyright © 2025 A visa Experts | All rights reserved. | terms of service | privacy policy',
                        textAlign: TextAlign.center,
                        style: TextStyle(
                          fontSize: 12,
                          color: Colors.black,
                          height: 1.5,
                          // Removed invalid parameter
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),
                ],
              ),
            ),
          ],
        ),
      ),
    );

    return Scaffold(
      backgroundColor: Colors.transparent,
      appBar: GlobalAppBar(
        userName: _userName,
        userImagePath: _userImagePath,
      ),
      body: Stack(
        children: <Widget>[
          Positioned.fill(
            child: Lottie.asset(
              'assets/background.json',
              fit: BoxFit.cover,
              repeat: true,
              animate: true,
              errorBuilder: (context, error, stackTrace) {
                logger.e("Lottie Background Error:",
                    error: error, stackTrace: stackTrace);
                return Container(color: Colors.grey.shade200);
              },
            ),
          ),
          Positioned.fill(child: scrollableMainContent),
          if (_isFabMenuOpen)
            Positioned(
              bottom: 20.0,
              left: 0,
              right: 0,
              child: Center(
                child: AnimatedScale(
                  scale: _isFabMenuOpen ? 1.0 : 0.0,
                  duration: const Duration(milliseconds: 300),
                  curve: Curves.elasticOut,
                  child: AnimatedOpacity(
                    opacity: _isFabMenuOpen ? 1.0 : 0.0,
                    duration: const Duration(milliseconds: 250),
                    curve: Curves.easeOut,
                    child: _buildFabMenuPill(),
                  ),
                ),
              ),
            ),
          const FloatingChatBox(),
          const FloatingPromotionVideo() // Placed as the last child
        ],
      ),
    );
  }

  // Add method to fetch success stories from API
  Future<void> _fetchSuccessStories() async {
    logger.d("HomeScreen: Fetching success stories from API...");
    if (!mounted) return;
    setState(() {
      _isLoadingSuccessStories = true;
    });

    try {
      // Please provide the API endpoint URL
      final response = await http.get(
        Uri.parse(AppConfig.reviews),
      );

      if (!mounted) return;

      if (response.statusCode == 200) {
        final Map<String, dynamic> decodedResponse = json.decode(response.body);

        // Adjust this based on your API response structure
        if (decodedResponse['success'] == true &&
            decodedResponse['data'] is List) {
          final List<dynamic> successStoriesJson = decodedResponse['data'];

          setState(() {
            _successStories = successStoriesJson.map((jsonItem) {
              if (jsonItem is Map<String, dynamic>) {
                return SuccessStory(
                  userName: jsonItem['user_name'] ?? 'Anonymous',
                  visaType: jsonItem['visa_type'] ?? 'Visa',
                  rating: double.tryParse(
                          jsonItem['rating']?.toString() ?? '5.0') ??
                      5.0,
                  storySnippet: jsonItem['story'] ?? 'Success story',
                  userImageUrl: jsonItem['user_image'] ??
                      '${AppConfig.staticAssetBase}/img/default_user.webp',
                );
              } else {
                logger.w(
                    "Encountered non-map item in success stories: $jsonItem");
                return SuccessStory(
                  userName: 'Invalid Data',
                  visaType: 'N/A',
                  rating: 5.0,
                  storySnippet: 'Data error',
                  userImageUrl: '',
                );
              }
            }).toList();
            _isLoadingSuccessStories = false;
          });

          // Restart auto scroll after data is loaded
          _startSuccessStoriesAutoScroll();
        } else {
          logger.e(
              "Success stories API response format error or success is false");
          if (mounted) {
            setState(() {
              _successStories = [];
              _isLoadingSuccessStories = false;
            });
          }
        }
      } else {
        logger.e(
            "Failed to fetch success stories. Status code: ${response.statusCode}");
        if (mounted) {
          setState(() {
            _successStories = [];
            _isLoadingSuccessStories = false;
          });
        }
      }
    } catch (e, s) {
      logger.e("Error fetching success stories", error: e, stackTrace: s);
      if (mounted) {
        setState(() {
          _successStories = [];
          _isLoadingSuccessStories = false;
        });
      }
    }
  }

  // --- UPDATED _buildConsultantCard METHOD TO MATCH THE IMAGE ---
  Widget _buildConsultantCard(Consultant consultant, ThemeData theme) {
    bool isNetworkImage = consultant.imageUrl.isNotEmpty &&
        (consultant.imageUrl.startsWith('http://') ||
            consultant.imageUrl.startsWith('https://'));
    bool isLocalAsset = consultant.imageUrl.isNotEmpty &&
        consultant.imageUrl.startsWith('assets/');

    Widget profileImageWidget;

    // Default icon widget
    Widget defaultIconWidget = Container(
      width: 70, // Diameter of the CircleAvatar
      height: 70,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        color: Colors.grey.shade200, // Placeholder background
      ),
      child: Icon(
        Icons.person_outline_rounded,
        size: 35,
        color: Colors.grey.shade400,
      ),
    );

    if (consultant.imageUrl.isEmpty) {
      profileImageWidget = defaultIconWidget;
    } else if (isNetworkImage) {
      profileImageWidget = CachedNetworkImage(
        imageUrl: consultant.imageUrl,
        fit: BoxFit.cover,
        width: 70,
        height: 70,
        placeholder: (context, url) => defaultIconWidget,
        errorWidget: (context, url, error) {
          logger
              .e("Error loading network image ${consultant.imageUrl}: $error");
          return defaultIconWidget;
        },
      );
    } else if (isLocalAsset) {
      profileImageWidget = Image.asset(
        consultant.imageUrl,
        fit: BoxFit.cover,
        width: 70,
        height: 70,
        errorBuilder: (context, error, stackTrace) {
          logger.e("Error loading local asset ${consultant.imageUrl}: $error");
          return defaultIconWidget;
        },
      );
    } else {
      profileImageWidget = defaultIconWidget;
    }

    return Container(
      width: 170, // Card width
      margin: const EdgeInsets.only(right: 12.0),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16.0),
        // boxShadow: [
        //   BoxShadow(
        //     color: Colors.grey.withOpacity(0.15), // Softer shadow
        //     spreadRadius: 1,
        //     blurRadius: 8,
        //     offset: const Offset(0, 4),
        //   ),
        // ],
      ),
      child: Material(
        color: Colors.transparent,
        borderRadius: BorderRadius.circular(16.0),
        child: InkWell(
          onTap: () {
            logger.d("Tapped consultant: ${consultant.name}");
            HapticFeedback.lightImpact();
            Navigator.push(
              context,
              MaterialPageRoute(
                builder: (context) => AdvisorListScreen(),
              ),
            );
          },
          borderRadius: BorderRadius.circular(16.0),
          child: Padding(
            padding: const EdgeInsets.fromLTRB(12.0, 12.0, 12.0, 12.0),
            // Removed invalid textAlign parameter
            child: Stack(
              clipBehavior: Clip.none,
              alignment: Alignment.center,
              children: [
                Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  crossAxisAlignment: CrossAxisAlignment.center,
                  children: [
                    const SizedBox(height: 10),
                    CircleAvatar(
                      radius: 35,
                      backgroundColor: Colors.grey.shade100,
                      child: ClipOval(child: profileImageWidget),
                    ),
                    const SizedBox(height: 12),
                    Text(
                      consultant.name,
                      style: const TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        color: Colors.black87,
                      ),
                      textAlign: TextAlign.center, // <<< ADDED THIS
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 4),
                    Text(
                      consultant.specialty,
                      style: TextStyle(
                        fontSize: 12,
                        color: Colors.grey.shade600,
                      ),
                      textAlign: TextAlign.center, // Moved here

                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 8),
                    // Text(
                    //   consultant.pricePerMin,
                    //   style: TextStyle(
                    //     fontSize: 13,
                    //     fontWeight: FontWeight.w500,
                    //     color: Colors.blue.shade700,
                    //   ),
                    //   textAlign: TextAlign.center, // <<< ADDED THIS
                    // ),
                  ],
                ),
                Positioned(
                  top: -8,
                  right: -8,
                  child: Container(
                    width: 36,
                    height: 36,
                    decoration: BoxDecoration(
                      color: const Color(0xFF0D47A1), // Dark blue
                      shape: BoxShape.circle,
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withOpacity(0.25),
                          blurRadius: 4,
                          offset: const Offset(1, 2),
                        )
                      ],
                    ),
                    child: Material(
                      color: Colors.transparent,
                      shape: const CircleBorder(),
                      child: InkWell(
                        onTap: () {
                          logger.d("Action for ${consultant.name}");
                          HapticFeedback.lightImpact();
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (context) => const AdvisorListScreen(),
                            ),
                          );
                        },
                        borderRadius: BorderRadius.circular(18),
                        child: const Icon(
                          Icons.north_east_rounded,
                          color: Colors.white,
                          size: 18,
                        ),
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  // --- END UPDATED METHOD ---

  Widget _buildSuccessStoryCard(SuccessStory story, ThemeData theme) {
    bool isNetworkImage = story.userImageUrl.startsWith('http://') ||
        story.userImageUrl.startsWith('https://');
    return Container(
      width: MediaQuery.of(context).size.width * 0.8,
      margin: const EdgeInsets.only(right: 16.0, top: 4, bottom: 8),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12.0),
        boxShadow: [
          BoxShadow(
              color: Colors.grey.withOpacity(0.25),
              spreadRadius: 1,
              blurRadius: 5,
              offset: const Offset(0, 2))
        ],
      ),
      child: Material(
        color: Colors.transparent,
        borderRadius: BorderRadius.circular(12.0),
        child: InkWell(
          onTap: () {
            logger.d("Tapped success story: ${story.userName}");
          },
          borderRadius: BorderRadius.circular(12.0),
          child: Padding(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    CircleAvatar(
                      radius: 24,
                      backgroundColor: Colors.grey.shade200,
                      backgroundImage: isNetworkImage
                          ? CachedNetworkImageProvider(story.userImageUrl)
                          : AssetImage(story.userImageUrl) as ImageProvider,
                      onBackgroundImageError: isNetworkImage
                          ? (e, s) => logger.e(
                              "Err story user img: ${story.userImageUrl}",
                              error: e,
                              stackTrace: s)
                          : null,
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(story.userName,
                              style: const TextStyle(
                                  fontWeight: FontWeight.bold,
                                  fontSize: 15,
                                  color: Colors.black87)),
                          Text(story.visaType,
                              style: TextStyle(
                                  fontSize: 12, color: Colors.grey.shade700)),
                        ],
                      ),
                    ),
                    Row(
                      mainAxisSize: MainAxisSize.min,
                      children: List.generate(5, (index) {
                        return Icon(
                          index < story.rating.floor()
                              ? Icons.star_rounded
                              : (index < story.rating
                                  ? Icons.star_half_rounded
                                  : Icons.star_border_rounded),
                          color: Colors.amber.shade600,
                          size: 18,
                        );
                      }),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                Expanded(
                  child: Text(
                    story.storySnippet,
                    style: TextStyle(
                        fontSize: 13,
                        color: Colors.grey.shade700,
                        height: 1.45),
                    maxLines: 4,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
