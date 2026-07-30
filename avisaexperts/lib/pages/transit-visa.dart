import 'package:flutter/material.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import 'package:flutter/services.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:carousel_slider/carousel_slider.dart';
import '../appbar/common_widgets.dart';
import '../widget/chatbox.dart';
// Import FloatingChatBox

class TransitVisaScreen extends StatefulWidget {
  const TransitVisaScreen({super.key});

  @override
  State<TransitVisaScreen> createState() => _TransitVisaScreenState();
}

class _TransitVisaScreenState extends State<TransitVisaScreen> {
  String _userName = 'Transit Traveler';
  String? _userImagePath;
  final ScrollController _scrollController = ScrollController();
  double _scrollOffset = 0.0;
  final CarouselSliderController _carouselController =
      CarouselSliderController();
  int _currentCarouselIndex = 0;

  final List<FamousPlace> famousPlaces = [
    FamousPlace(
      name: 'Canada Transit Hub',
      imageUrl:
          'https://images.unsplash.com/photo-1517935706615-2717063c2225?w=800&q=80', // Canada scenery
      isBookmarked: false,
    ),
    FamousPlace(
      name: 'USA Transit Hub',
      imageUrl:
          'https://images.unsplash.com/photo-1485738422979-f5c462d49f74?w=800&q=80', // USA airport
      isBookmarked: false,
    ),
    FamousPlace(
      name: 'UK Transit Hub',
      imageUrl:
          'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&q=80', // London
      isBookmarked: false,
    ),
    FamousPlace(
      name: 'Australia Transit Hub',
      imageUrl:
          'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80', // Australia
      isBookmarked: false,
    ),
    FamousPlace(
      name: 'Japan Transit Hub',
      imageUrl:
          'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&q=80', // Japan
      isBookmarked: false,
    ),
    FamousPlace(
      name: 'Europe Schengen Hub',
      imageUrl:
          'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=800&q=80', // Europe
      isBookmarked: false,
    ),
  ];

  // Change FAQ expansion state tracking to single index
  int? _expandedFaqIndex;

  // FAQ data
  final List<FAQ> faqs = [
    FAQ(
        question: "What is a transit visa?",
        answer:
            "A transit visa is a temporary permit that allows travelers to pass through a country while traveling to their final destination. It's required when you have a layover and need to leave the airport's international transit area."),
    FAQ(
        question: "Do I need a transit visa for every layover?",
        answer:
            "Not always. Many countries offer visa-free transit for certain durations (usually 24-72 hours) if you stay within the airport's international area. However, if you plan to leave the airport or your layover exceeds the allowed time, you'll need a transit visa."),
    FAQ(
        question: "How long is a transit visa valid?",
        answer:
            "Transit visas are typically valid for short periods, ranging from 24 hours to 15 days, depending on the country's policies. They're designed for brief stopovers and cannot be extended."),
    FAQ(
        question: "What documents do I need for a transit visa?",
        answer:
            "Common requirements include a valid passport, confirmed onward ticket to your final destination, visa for your final destination (if required), proof of sufficient funds, and sometimes a completed application form."),
    FAQ(
        question: "Can I leave the airport with a transit visa?",
        answer:
            "Yes, a transit visa typically allows you to leave the airport and explore the city during your layover. However, you must return for your connecting flight within the visa's validity period."),
    FAQ(
        question:
            "What's the difference between transit visa and airport transit visa?",
        answer:
            "An airport transit visa restricts you to the international transit area of the airport, while a regular transit visa allows you to enter the country and leave the airport during your layover."),
  ];

  @override
  void initState() {
    super.initState();
    _loadUserData();
    _scrollController.addListener(_onScroll);
  }

  @override
  void dispose() {
    _scrollController.removeListener(_onScroll);
    _scrollController.dispose();
    super.dispose();
  }

  Future<void> _loadUserData() async {
    final prefs = await SharedPreferences.getInstance();
    setState(() {
      _userName = prefs.getString('userName') ?? 'Tourist Explorer';
      _userImagePath = prefs.getString('userProfile');
    });
  }

  void _onScroll() {
    setState(() {
      _scrollOffset = _scrollController.offset;
    });
  }

  @override
  Widget build(BuildContext context) {
    // Calculate transform values based on scroll
    double containerHeight = MediaQuery.of(context).size.height * 0.4;
    double minContainerHeight = 120.0; // Minimum height when scrolled

    // Keep your existing height calculation
    double dynamicHeight = (containerHeight - _scrollOffset * 0.3)
        .clamp(minContainerHeight, containerHeight);

    // Add sliding effect - container slides up behind app bar
    double slideUpTransform = _scrollOffset > 100 ? _scrollOffset - 100 : 0;
    double backgroundTransform = (_scrollOffset * 0.5) + slideUpTransform;

    return Scaffold(
      appBar: GlobalAppBar(
        userName: _userName,
        userImagePath: _userImagePath,
        showBackButton: true,
      ),
      body: Stack(
        children: [
          // Background Image with Airport Transit - with sliding animation
          AnimatedContainer(
            duration: const Duration(milliseconds: 50),
            transform: Matrix4.translationValues(0, -backgroundTransform, 0),
            height: dynamicHeight,
            width: double.infinity,
            decoration: const BoxDecoration(
              image: DecorationImage(
                image: NetworkImage(
                    'https://images.unsplash.com/photo-1485738422979-f5c462d49f74?w=1200&q=80'), // Airport background
                fit: BoxFit.cover,
              ),
            ),
            child: Container(
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                  colors: [
                    Colors.black.withOpacity(0.3),
                    Colors.black.withOpacity(0.6),
                  ],
                ),
              ),
            ),
          ),

          // TRANSIT Text Overlay - with sliding animation
          AnimatedPositioned(
            duration: const Duration(milliseconds: 50),
            top: (MediaQuery.of(context).size.height * 0.15 -
                    _scrollOffset * 0.2)
                .clamp(
                    -50.0,
                    MediaQuery.of(context).size.height *
                        0.4), // Allow negative to slide up
            left: 0,
            right: 0,
            child: AnimatedOpacity(
              duration: const Duration(milliseconds: 50),
              opacity:
                  (1.0 - _scrollOffset / 150).clamp(0.0, 1.0), // Faster fade
              child: const Center(
                child: Text(
                  'TRANSIT',
                  style: TextStyle(
                    fontSize: 48,
                    fontWeight: FontWeight.w900,
                    color: Colors.white,
                    letterSpacing: 8,
                    shadows: [
                      Shadow(
                        offset: Offset(2, 2),
                        blurRadius: 4,
                        color: Colors.black54,
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),

          // Main Content with scroll controller
          SingleChildScrollView(
            controller: _scrollController,
            child: Column(
              children: [
                // Keep your existing spacer
                SizedBox(height: MediaQuery.of(context).size.height * 0.3),

                // Bottom Content Area - enhanced with more content
                Container(
                  width: double.infinity,
                  constraints: BoxConstraints(
                    minHeight: MediaQuery.of(context).size.height *
                        1.2, // Increased for more scrollable content
                  ),
                  decoration: const BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.only(
                      topLeft: Radius.circular(30),
                      topRight: Radius.circular(30),
                    ),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black12,
                        blurRadius: 10,
                        offset: Offset(0, -5),
                      ),
                    ],
                  ),
                  child: Padding(
                    padding: const EdgeInsets.all(20),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // Major Transit Hubs Header
                        const Row(
                          children: [
                            Text(
                              'Major Transit Hubs',
                              style: TextStyle(
                                fontSize: 24,
                                fontWeight: FontWeight.bold,
                                color: Colors.black87,
                              ),
                            ),
                          ],
                        ),

                        const SizedBox(height: 20),
                        // Transit Hubs Carousel
                        CarouselSlider.builder(
                          carouselController: _carouselController,
                          itemCount: famousPlaces.length,
                          itemBuilder: (context, index, realIndex) {
                            return Container(
                              margin: const EdgeInsets.symmetric(horizontal: 8),
                              child:
                                  _buildPlaceCard(famousPlaces[index], index),
                            );
                          },
                          options: CarouselOptions(
                            height: 280,
                            autoPlay: true,
                            autoPlayInterval: const Duration(seconds: 4),
                            enlargeCenterPage: true,
                            enlargeFactor: 0.3,
                            viewportFraction: 0.8,
                            aspectRatio: 16 / 9,
                            onPageChanged: (index, reason) {
                              setState(() {
                                _currentCarouselIndex = index;
                              });
                            },
                          ),
                        ),

                        const SizedBox(height: 16),
                        // Carousel Indicators
                        Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: famousPlaces.asMap().entries.map((entry) {
                            int index = entry.key;
                            return GestureDetector(
                              onTap: () =>
                                  _carouselController.animateToPage(index),
                              child: Container(
                                width:
                                    _currentCarouselIndex == index ? 12.0 : 8.0,
                                height:
                                    _currentCarouselIndex == index ? 12.0 : 8.0,
                                margin:
                                    const EdgeInsets.symmetric(horizontal: 4.0),
                                decoration: BoxDecoration(
                                  shape: BoxShape.circle,
                                  color: _currentCarouselIndex == index
                                      ? Colors.blue.shade700
                                      : Colors.grey.shade400,
                                ),
                              ),
                            );
                          }).toList(),
                        ),

                        // Add more content sections
                        const SizedBox(height: 20),

                        const Text(
                          'About Transit Visa',
                          style: TextStyle(
                            fontSize: 20,
                            fontWeight: FontWeight.bold,
                            color: Colors.black87,
                          ),
                        ),
                        const SizedBox(height: 16),
                        Container(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              // Description Text
                              const Text(
                                'A transit visa is a special type of visa that allows travelers to pass through a country while en route to their final destination. It\'s typically required when you have a layover that involves leaving the airport\'s international transit area or when your layover exceeds the permitted visa-free transit time.',
                                style: TextStyle(
                                  fontSize: 16,
                                  color: Colors.black87,
                                  height: 1.5,
                                ),
                              ),

                              const SizedBox(height: 12),

                              const Text(
                                'Transit visas are generally valid for short periods, ranging from a few hours to several days, depending on the country\'s immigration policies. They allow you to explore the transit city during longer layovers, making your journey more enjoyable and productive.',
                                style: TextStyle(
                                  fontSize: 16,
                                  color: Colors.black87,
                                  height: 1.5,
                                ),
                              ),

                              const SizedBox(height: 16),

                              // Key Features
                              const Text(
                                'Key Benefits:',
                                style: TextStyle(
                                  fontSize: 18,
                                  fontWeight: FontWeight.w600,
                                  color: Colors.black87,
                                ),
                              ),

                              const SizedBox(height: 16),

                              // Feature List
                              GridView.builder(
                                shrinkWrap: true,
                                physics: const NeverScrollableScrollPhysics(),
                                gridDelegate:
                                    const SliverGridDelegateWithFixedCrossAxisCount(
                                  crossAxisCount: 2,
                                  mainAxisSpacing: 16.0,
                                  crossAxisSpacing: 16.0,
                                  childAspectRatio: 3,
                                ),
                                itemCount: 6,
                                itemBuilder: (context, index) {
                                  final features = [
                                    {
                                      'icon': Icons.flight_takeoff,
                                      'label': 'Quick Processing'
                                    },
                                    {
                                      'icon': Icons.access_time,
                                      'label': 'Short Duration'
                                    },
                                    {
                                      'icon': Icons.location_city,
                                      'label': 'City Exploration'
                                    },
                                    {
                                      'icon': Icons.connecting_airports,
                                      'label': 'Easy Transit'
                                    },
                                    {
                                      'icon': Icons.schedule,
                                      'label': 'Flexible Timing'
                                    },
                                    {
                                      'icon': Icons.verified_user,
                                      'label': 'Secure Travel'
                                    },
                                  ];

                                  return Container(
                                    decoration: BoxDecoration(
                                      color: Colors.white,
                                      borderRadius: BorderRadius.circular(16),
                                      boxShadow: [
                                        BoxShadow(
                                          color: Colors.black.withOpacity(0.1),
                                          blurRadius: 10,
                                          offset: const Offset(0, 5),
                                        ),
                                      ],
                                    ),
                                    child: Padding(
                                      padding: const EdgeInsets.all(16.0),
                                      child: Row(
                                        children: [
                                          Icon(
                                            features[index]['icon'] as IconData,
                                            color: Colors.blue.shade700,
                                            size: 20,
                                          ),
                                          const SizedBox(width: 12),
                                          Expanded(
                                            child: Text(
                                              features[index]['label']
                                                  as String,
                                              style: const TextStyle(
                                                fontSize: 16,
                                                color: Colors.black87,
                                              ),
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                                  );
                                },
                              )
                            ],
                          ),
                        ),

                        const SizedBox(height: 20),

                        const Text(
                          'FAQs',
                          style: TextStyle(
                            fontSize: 20,
                            fontWeight: FontWeight.bold,
                            color: Colors.black87,
                          ),
                        ),
                        const SizedBox(height: 16),
                        // Replace the FAQs container with this:
                        Column(
                          children: faqs.asMap().entries.map((entry) {
                            int index = entry.key;
                            FAQ faq = entry.value;
                            bool isExpanded = _expandedFaqIndex == index;

                            return Container(
                              margin: const EdgeInsets.only(bottom: 12),
                              decoration: BoxDecoration(
                                color: Colors.white,
                                borderRadius: BorderRadius.circular(12),
                                border: Border.all(
                                  color: isExpanded
                                      ? Colors.blue.shade200
                                      : Colors.grey.shade200,
                                  width: 1,
                                ),
                                boxShadow: [
                                  BoxShadow(
                                    color: Colors.black.withOpacity(0.05),
                                    blurRadius: 8,
                                    offset: const Offset(0, 2),
                                  ),
                                ],
                              ),
                              child: Column(
                                children: [
                                  // Question (clickable header)
                                  InkWell(
                                    onTap: () {
                                      setState(() {
                                        // If this FAQ is already expanded, collapse it
                                        // Otherwise, expand this one and collapse others
                                        if (_expandedFaqIndex == index) {
                                          _expandedFaqIndex = null;
                                        } else {
                                          _expandedFaqIndex = index;
                                        }
                                      });
                                      HapticFeedback.lightImpact();
                                    },
                                    borderRadius: BorderRadius.circular(12),
                                    child: Container(
                                      padding: const EdgeInsets.all(16),
                                      child: Row(
                                        children: [
                                          Expanded(
                                            child: Text(
                                              faq.question,
                                              style: TextStyle(
                                                fontSize: 16,
                                                fontWeight: FontWeight.w600,
                                                color:
                                                    _expandedFaqIndex == index
                                                        ? Colors.blue.shade700
                                                        : Colors.black87,
                                              ),
                                            ),
                                          ),
                                          AnimatedRotation(
                                            turns: _expandedFaqIndex == index
                                                ? 0.5
                                                : 0.0,
                                            duration: const Duration(
                                                milliseconds: 300),
                                            child: Icon(
                                              Icons.keyboard_arrow_down,
                                              color: _expandedFaqIndex == index
                                                  ? Colors.blue.shade700
                                                  : Colors.grey.shade600,
                                              size: 24,
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                                  ),

                                  // Animated answer expansion
                                  AnimatedContainer(
                                    duration: const Duration(milliseconds: 300),
                                    curve: Curves.easeInOut,
                                    height:
                                        _expandedFaqIndex == index ? null : 0,
                                    child: AnimatedOpacity(
                                      duration:
                                          const Duration(milliseconds: 200),
                                      opacity: _expandedFaqIndex == index
                                          ? 1.0
                                          : 0.0,
                                      child: Container(
                                        width: double.infinity,
                                        padding: const EdgeInsets.fromLTRB(
                                            16, 0, 16, 16),
                                        decoration: BoxDecoration(
                                          border: Border(
                                            top: BorderSide(
                                              color: Colors.grey.shade200,
                                              width: 1,
                                            ),
                                          ),
                                        ),
                                        child: Column(
                                          crossAxisAlignment:
                                              CrossAxisAlignment.start,
                                          children: [
                                            const SizedBox(height: 12),
                                            Text(
                                              faq.answer,
                                              style: TextStyle(
                                                fontSize: 14,
                                                color: Colors.grey.shade700,
                                                height: 1.5,
                                              ),
                                            ),
                                          ],
                                        ),
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            );
                          }).toList(),
                        ),

                        const SizedBox(height: 16),

                        Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Icon(
                                  FontAwesomeIcons.instagram,
                                  color: Colors.pink,
                                  size: 20,
                                ),
                                const SizedBox(width: 16),
                                Icon(
                                  FontAwesomeIcons.facebook,
                                  color: Colors.blue,
                                  size: 20,
                                ),
                                const SizedBox(width: 16),
                                Icon(
                                  FontAwesomeIcons.twitter,
                                  color: Colors.lightBlue,
                                  size: 20,
                                ),
                                const SizedBox(width: 16),
                                Icon(
                                  FontAwesomeIcons.linkedin,
                                  color: Colors.blueAccent,
                                  size: 20,
                                ),
                              ],
                            ),
                          ],
                        ),

                        const SizedBox(height: 16),

                        const Center(
                          child: Text(
                            'copyright © 2025 A visa Experts | All rights reserved. | terms of service | privacy policy',
                            textAlign: TextAlign.center,
                            style: TextStyle(
                              fontSize: 12,
                              color: Colors.black,
                              height: 1.5,
                            ),
                          ),
                        ),

                        const SizedBox(height: 16),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),

          // Add FloatingChatBox at the end of Stack children
          const FloatingChatBox(),
        ],
      ),
    );
  }

  Widget _buildPlaceCard(FamousPlace place, int index) {
    return GestureDetector(
      onTap: () {
        HapticFeedback.lightImpact();
        // Handle place tap
      },
      child: Container(
        width: double.infinity,
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(20),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.15),
              blurRadius: 15,
              offset: const Offset(0, 8),
            ),
          ],
        ),
        child: ClipRRect(
          borderRadius: BorderRadius.circular(20),
          child: Stack(
            children: [
              // Background Image - using network image from Unsplash
              SizedBox(
                width: double.infinity,
                height: double.infinity,
                child: Image.network(
                  place.imageUrl,
                  fit: BoxFit.cover,
                  loadingBuilder: (context, child, loadingProgress) {
                    if (loadingProgress == null) return child;
                    return Container(
                      color: Colors.grey.shade300,
                      child: const Center(
                        child: CircularProgressIndicator(),
                      ),
                    );
                  },
                  errorBuilder: (context, error, stackTrace) {
                    return Container(
                      color: Colors.grey.shade300,
                      child: const Center(
                        child:
                            Icon(Icons.image_not_supported, color: Colors.grey),
                      ),
                    );
                  },
                ),
              ),
              // Gradient overlay
              Container(
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    begin: Alignment.topCenter,
                    end: Alignment.bottomCenter,
                    colors: [
                      Colors.transparent,
                      Colors.black.withOpacity(0.8),
                    ],
                  ),
                ),
              ),

              // Bookmark Icon
              Positioned(
                top: 16,
                right: 16,
                child: GestureDetector(
                  onTap: () {
                    setState(() {
                      place.isBookmarked = !place.isBookmarked;
                    });
                    HapticFeedback.selectionClick();
                  },
                  child: Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: Colors.black.withOpacity(0.6),
                      borderRadius: BorderRadius.circular(15),
                    ),
                    child: Icon(
                      place.isBookmarked
                          ? Icons.bookmark
                          : Icons.bookmark_border,
                      color: Colors.white,
                      size: 24,
                    ),
                  ),
                ),
              ),

              // Place Name and Details
              Positioned(
                bottom: 0,
                left: 0,
                right: 0,
                child: Container(
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      begin: Alignment.topCenter,
                      end: Alignment.bottomCenter,
                      colors: [
                        Colors.transparent,
                        Colors.black.withOpacity(0.9),
                      ],
                    ),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(
                        place.name,
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 20,
                          fontWeight: FontWeight.bold,
                          shadows: [
                            Shadow(
                              offset: Offset(1, 1),
                              blurRadius: 3,
                              color: Colors.black54,
                            ),
                          ],
                        ),
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                      ),
                      const SizedBox(height: 8),
                      Row(
                        children: [
                          Icon(
                            Icons.connecting_airports,
                            color: Colors.white.withOpacity(0.9),
                            size: 16,
                          ),
                          const SizedBox(width: 4),
                          Text(
                            'Transit Hub',
                            style: TextStyle(
                              color: Colors.white.withOpacity(0.9),
                              fontSize: 14,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class FamousPlace {
  final String name;
  final String imageUrl;
  bool isBookmarked;

  FamousPlace({
    required this.name,
    required this.imageUrl,
    required this.isBookmarked,
  });
}

// Add FAQ data model
class FAQ {
  final String question;
  final String answer;

  FAQ({
    required this.question,
    required this.answer,
  });
}
