import 'package:flutter/material.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import 'package:url_launcher/url_launcher.dart';

import '../widget/chatbox.dart';

class Feature {
  final String description;
  final String imageUrl;
  final bool imageOnLeft;

  Feature({
    required this.description,
    required this.imageUrl,
    required this.imageOnLeft,
  });
}

Future<void> _launchSocialUrl(String urlString) async {
  final Uri url = Uri.parse(urlString);
  if (!await launchUrl(url)) {
    // You can show an error message here if you want
    print('Could not launch $urlString');
  }
}

class AboutPage extends StatelessWidget {
  final List<Feature> _features = [
    Feature(
      description:
          'Japan is a captivating blend of ancient traditions and cutting-edge modernity, known for neon-lit skyscrapers and tech culture.',
      imageUrl: 'assets/First01.png',
      imageOnLeft: false,
    ),
    Feature(
      description:
          'Our expert team provides comprehensive assistance for work, tourist, and transit visas, ensuring a hassle-free experience.',
      imageUrl: 'assets/First02.png',
      imageOnLeft: true,
    ),
  ];

  AboutPage({super.key});

  @override
  Widget build(BuildContext context) {
    const Color primaryColor = Color(0xFF0D47A1);
    const Color accentColor = Color(0xFF1976D2);
    const Color backgroundColor = Color(0xFFF8F9FA);
    const Color textColor = Color(0xFF333333);
    const Color subtextColor = Color(0xFF555555);

    return Scaffold(
      backgroundColor: backgroundColor,
      appBar: AppBar(
        backgroundColor: Colors.white,
        surfaceTintColor: Colors.white,
        elevation: 1,
        shadowColor: Colors.grey.withOpacity(0.1),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios, color: textColor, size: 20),
          onPressed: () => Navigator.pop(context),
        ),
        title: const Text(
          'About Us',
          style: TextStyle(
            color: textColor,
            fontSize: 20,
            fontWeight: FontWeight.bold,
          ),
        ),
        centerTitle: true,
      ),
      body: Stack(
        children: [
          SingleChildScrollView(
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _buildSectionTitle('Our Story'),
                  Card(
                    elevation: 2,
                    color: Colors.white,
                    margin: const EdgeInsets.symmetric(vertical: 8),
                    shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12)),
                    shadowColor: Colors.black.withOpacity(0.05),
                    child: const Padding(
                      padding: EdgeInsets.all(20.0),
                      child: Text(
                        'Welcome to A Visa Experts, your trusted partner for seamless visa and passport services. Founded by Kaveesh Kapoor, we specialize in helping individuals achieve their dreams of working, traveling, or transiting abroad. Our expert team provides comprehensive assistance for work visas, tourist visas, and transit visas, ensuring a hassle-free experience from application to approval.',
                        textAlign: TextAlign.justify,
                        style: TextStyle(
                          fontSize: 15,
                          color: subtextColor,
                          height: 1.6,
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: 30),
                  _buildSectionTitle('What We Offer'),
                  ..._features.map((feature) => _buildFeatureItem(
                        context: context,
                        feature: feature,
                        accentColor: accentColor,
                      )),
                  const SizedBox(height: 30),
                  _buildSectionTitle('Book a Meeting'),
                  _buildMeetingCard(primaryColor),
                  const SizedBox(height: 30),
                  _buildFooter(),
                ],
              ),
            ),
          ),
          const FloatingChatBox(),
        ],
      ),
    );
  }

  Widget _buildSectionTitle(String title) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12.0),
      child: Text(
        title,
        style: const TextStyle(
          fontSize: 22,
          fontWeight: FontWeight.bold,
          color: Color(0xFF333333),
        ),
      ),
    );
  }

  Widget _buildFeatureItem({
    required BuildContext context,
    required Feature feature,
    required Color accentColor,
  }) {
    final double imageWidth = MediaQuery.of(context).size.width * 0.35;

    Widget textWidget = Expanded(
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              feature.description,
              style: const TextStyle(
                fontSize: 15,
                color: Color(0xFF555555),
                height: 1.5,
              ),
            ),
            const SizedBox(height: 12),
            Icon(Icons.arrow_forward, color: accentColor, size: 20),
          ],
        ),
      ),
    );

    Widget imageWidget = ClipRRect(
      borderRadius: feature.imageOnLeft
          ? const BorderRadius.only(
              topLeft: Radius.circular(12), bottomLeft: Radius.circular(12))
          : const BorderRadius.only(
              topRight: Radius.circular(12), bottomRight: Radius.circular(12)),
      child: Image.asset(
        feature.imageUrl,
        width: imageWidth,
        // height: double.infinity, // <-- THIS LINE WAS REMOVED
        fit: BoxFit.cover,
        errorBuilder: (context, error, stackTrace) =>
            const Icon(Icons.broken_image, size: 40, color: Colors.grey),
      ),
    );

    return Card(
      elevation: 2,
      color: Colors.white,
      margin: const EdgeInsets.symmetric(vertical: 10),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      clipBehavior: Clip.antiAlias,
      shadowColor: Colors.black.withOpacity(0.05),
      child: IntrinsicHeight(
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: feature.imageOnLeft
              ? [imageWidget, textWidget]
              : [textWidget, imageWidget],
        ),
      ),
    );
  }

  Widget _buildMeetingCard(Color primaryColor) {
    return Card(
      elevation: 2,
      color: Colors.white,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      shadowColor: Colors.black.withOpacity(0.05),
      child: Padding(
        padding: const EdgeInsets.all(20.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Schedule Your Consultation',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: primaryColor,
              ),
            ),
            const SizedBox(height: 8),
            const Text(
              'Choose your preferred method to connect with our experts. Initial consultations are free!',
              style: TextStyle(fontSize: 14, color: Color(0xFF555555)),
            ),
            const SizedBox(height: 20),
            Row(
              children: [
                Expanded(
                  child: _buildMeetingOption(
                    icon: Icons.video_call,
                    label: 'Online',
                    color: Colors.orange,
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: _buildMeetingOption(
                    icon: Icons.location_on,
                    label: 'In-Person',
                    color: Colors.green,
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildMeetingOption(
      {required IconData icon, required String label, required Color color}) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 16),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: color.withOpacity(0.3)),
      ),
      child: Column(
        children: [
          Icon(icon, color: color, size: 30),
          const SizedBox(height: 8),
          Text(label,
              style: TextStyle(fontWeight: FontWeight.bold, color: color)),
        ],
      ),
    );
  }

  Widget _buildFooter() {
    return Container(
      padding: const EdgeInsets.only(top: 24.0),
      margin: const EdgeInsets.only(top: 24.0),
      decoration: BoxDecoration(
        border: Border(top: BorderSide(color: Colors.grey[300]!)),
      ),
      child: Column(
        children: [
          const Text(
            'Connect With Us',
            style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w600,
                color: Color(0xFF333333)),
          ),
          const SizedBox(height: 16),
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              // Instagram
              IconButton(
                icon: const Icon(FontAwesomeIcons.instagram,
                    color: Colors.pink, size: 20),
                onPressed: () =>
                    _launchSocialUrl('https://www.instagram.com/avisaexpert/'),
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
                onPressed: () =>
                    _launchSocialUrl('https://www.youtube.com/@AvisaExperts'),
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
          const SizedBox(height: 24),
          const Text(
            '© 2025 A Visa Experts. All rights reserved.',
            style: TextStyle(fontSize: 12, color: Colors.grey),
          ),
        ],
      ),
    );
  }
}
