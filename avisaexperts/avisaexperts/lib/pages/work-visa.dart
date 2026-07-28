import 'package:flutter/material.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import 'package:flutter/services.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:carousel_slider/carousel_slider.dart';
import '../appbar/common_widgets.dart';
import '../widget/chatbox.dart';

class WorkVisaScreen extends StatefulWidget {
  const WorkVisaScreen({super.key});

  @override
  State<WorkVisaScreen> createState() => _WorkVisaScreenState();
}

class _WorkVisaScreenState extends State<WorkVisaScreen> {
  String _userName = 'Work Visa Explorer';
  String? _userImagePath;
  final ScrollController _scrollController = ScrollController();
  double _scrollOffset = 0.0;
  final CarouselSliderController _carouselController =
      CarouselSliderController();
  int _currentCarouselIndex = 0;

  // Updated with working network URLs
  final List<FamousPlace> famousPlaces = [
    FamousPlace(
      name: 'Shibuya Crossing, Japan',
      imageUrl:
          'https://ik.imagekit.io/kaveeshkapoor/app-things/Tokyo.jpg?updatedAt=1754136184245',
      isBookmarked: false,
    ),
    FamousPlace(
      name: 'Sydney Opera House, Australia',
      imageUrl:
          'https://ik.imagekit.io/kaveeshkapoor/app-things/australia.jpg?updatedAt=1754136185079',
      isBookmarked: false,
    ),
    FamousPlace(
      name: 'CN Tower, Toronto, Canada',
      imageUrl:
          'https://ik.imagekit.io/kaveeshkapoor/app-things/Canada.jpg?updatedAt=1754136185941',
      isBookmarked: false,
    ),
    FamousPlace(
      name: 'Times Square, New York, USA',
      imageUrl:
          'https://ik.imagekit.io/kaveeshkapoor/app-things/usa.webp?updatedAt=1754136181211',
      isBookmarked: false,
    ),
    FamousPlace(
      name: 'Big Ben, London, UK',
      imageUrl:
          'https://ik.imagekit.io/kaveeshkapoor/app-things/london.webp?updatedAt=1754136182417',
      isBookmarked: false,
    ),
    FamousPlace(
      name: 'Eiffel Tower, Paris, France',
      imageUrl:
          'https://ik.imagekit.io/kaveeshkapoor/app-things/paris.webp?updatedAt=1754136180308',
      isBookmarked: false,
    ),
  ];

  // Change FAQ expansion state tracking to single index
  int? _expandedFaqIndex;

  // FAQ data
  final List<FAQ> faqs = [
    FAQ(
        question: "What is a work visa?",
        answer:
            "A work visa is an official document that allows you to enter and work in a foreign country for a specified period. It is typically tied to a specific employer or job offer."),
    FAQ(
        question: "How long does it take to process a work visa?",
        answer:
            "Processing time varies by country and visa type. It can range from a few weeks to several months, depending on the employer, country, and your qualifications."),
    FAQ(
        question: "What documents are required for a work visa?",
        answer:
            "Common requirements include a valid passport, job offer letter, completed application form, passport-sized photos, proof of qualifications, and sometimes a labor market test or sponsorship documents."),
    FAQ(
        question: "Can I bring my family on a work visa?",
        answer:
            "Many countries allow work visa holders to bring their spouse and children as dependents, but requirements and rights vary. Check the specific country's immigration policies."),
    FAQ(
        question: "Can I change employers on a work visa?",
        answer:
            "Changing employers may require a new visa application or amendment, depending on the country's regulations. Always consult the local immigration authority before changing jobs."),
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
      _userName = prefs.getString('userName') ?? 'Work Researcher';
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
          // Background Image with London - with sliding animation
          AnimatedContainer(
            duration: const Duration(milliseconds: 50),
            transform: Matrix4.translationValues(0, -backgroundTransform, 0),
            height: dynamicHeight,
            width: double.infinity,
            decoration: const BoxDecoration(
              image: DecorationImage(
                image: AssetImage('assets/service.jpg'),
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

          // LONDON Text Overlay - with sliding animation
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
                  'LONDON',
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
                        // Famous Places Header
                        const Row(
                          children: [
                            Text(
                              'Popular Work Destinations',
                              style: TextStyle(
                                fontSize: 24,
                                fontWeight: FontWeight.bold,
                                color: Colors.black87,
                              ),
                            ),
                          ],
                        ),

                        const SizedBox(height: 20),
                        // Famous Places Carousel
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
                          'About Work Visa',
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
                              const Text(
                                'A work visa is a legal authorization that allows foreign nationals to work in a country for a specific employer and duration. Work visas are essential for those seeking employment opportunities abroad and are usually granted based on a job offer or employment contract.',
                                style: TextStyle(
                                  fontSize: 16,
                                  color: Colors.black87,
                                  height: 1.5,
                                ),
                              ),
                              const SizedBox(height: 12),
                              const Text(
                                'The validity and conditions of a work visa depend on the country and the type of employment. Some work visas can be extended or converted to permanent residency, depending on local laws.',
                                style: TextStyle(
                                  fontSize: 16,
                                  color: Colors.black87,
                                  height: 1.5,
                                ),
                              ),
                              const SizedBox(height: 16),
                              const Text(
                                'Key Features:',
                                style: TextStyle(
                                  fontSize: 18,
                                  fontWeight: FontWeight.w600,
                                  color: Colors.black87,
                                ),
                              ),
                              const SizedBox(height: 16),
                              const Text(
                                'Work visas provide legal permission to work, access to employee benefits, and sometimes a pathway to permanent residency. Requirements and benefits vary by country.',
                                style: TextStyle(
                                  fontSize: 16,
                                  color: Colors.black87,
                                  height: 1.5,
                                ),
                              ),
                              const SizedBox(height: 16),
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
                                      'icon': Icons.work_outline,
                                      'label': 'Job Placement'
                                    },
                                    {
                                      'icon': Icons.verified_user,
                                      'label': 'Legal Compliance'
                                    },
                                    {
                                      'icon': Icons.school,
                                      'label': 'Skill Assessment'
                                    },
                                    {
                                      'icon': Icons.assignment_turned_in,
                                      'label': 'Document Assistance'
                                    },
                                    {
                                      'icon': Icons.family_restroom,
                                      'label': 'Dependent Visas'
                                    },
                                    {
                                      'icon': Icons.public,
                                      'label': 'Global Mobility'
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
                          'Work Visa FAQs',
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
          const FloatingChatBox(),
        ],
      ),
    );
  }

  // Updated _buildPlaceCard method with network image support
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
              // Background Image - Network image with loading and error handling
              SizedBox(
                width: double.infinity,
                height: double.infinity,
                child: Image.network(
                  place.imageUrl,
                  fit: BoxFit.cover,
                  loadingBuilder: (context, child, loadingProgress) {
                    if (loadingProgress == null) {
                      return child;
                    }
                    return Container(
                      color: Colors.grey.shade300,
                      child: Center(
                        child: CircularProgressIndicator(
                          value: loadingProgress.expectedTotalBytes != null
                              ? loadingProgress.cumulativeBytesLoaded /
                                  loadingProgress.expectedTotalBytes!
                              : null,
                          strokeWidth: 2,
                          valueColor: AlwaysStoppedAnimation<Color>(
                            Colors.blue.shade700,
                          ),
                        ),
                      ),
                    );
                  },
                  errorBuilder: (context, error, stackTrace) {
                    return Container(
                      color: Colors.grey.shade300,
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(
                            Icons.image_not_supported,
                            color: Colors.grey.shade600,
                            size: 48,
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
                            Icons.location_on_outlined,
                            color: Colors.white.withOpacity(0.9),
                            size: 16,
                          ),
                          const SizedBox(width: 4),
                          Text(
                            'Work Visa Destination',
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
