import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';

import '../widget/chatbox.dart'; // Import FloatingChatBox

class TermsConditionsPage extends StatelessWidget {
  const TermsConditionsPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Color(0xFFF8F9FA),
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        leading: IconButton(
          icon: Icon(Icons.arrow_back_ios, color: Colors.black, size: 20),
          onPressed: () => Navigator.pop(context),
        ),
        title: Text(
          'Terms & Conditions',
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
          SingleChildScrollView(
            padding: EdgeInsets.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Header Section with Gavel Icon
                Center(
                  child: Container(
                    width: 120,
                    height: 120,
                    decoration: BoxDecoration(
                      color: Color(0xFFE8E8E8),
                      shape: BoxShape.circle,
                    ),
                    child: Center(
                      child: Container(
                        width: 60,
                        height: 60,
                        decoration: BoxDecoration(
                          color: Color(0xFF8B4513),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Icon(
                          Icons.gavel,
                          color: Colors.white,
                          size: 30,
                        ),
                      ),
                    ),
                  ),
                ),
                SizedBox(height: 24),

                // Title Section
                Center(
                  child: Column(
                    children: [
                      Text(
                        'Terms & Conditions',
                        style: TextStyle(
                          fontSize: 24,
                          fontWeight: FontWeight.bold,
                          color: Colors.black,
                        ),
                      ),
                      SizedBox(height: 8),
                      Text(
                        'Last updated: July 15, 2025',
                        style: TextStyle(
                          fontSize: 14,
                          color: Colors.grey[600],
                        ),
                      ),
                    ],
                  ),
                ),
                SizedBox(height: 32),

                // Terms Sections
                _buildTermsSection(
                  number: '1',
                  icon: Icons.check_circle,
                  iconColor: Color(0xFF007AFF),
                  title: 'Acceptance of Terms',
                  content:
                      'By accessing and using this application, you accept and agree to be bound by the terms and provision of this agreement.',
                ),

                _buildTermsSection(
                  number: '2',
                  icon: Icons.person,
                  iconColor: Color(0xFF007AFF),
                  title: 'User Account',
                  content:
                      'You are responsible for maintaining the confidentiality of your account and password information.',
                ),

                _buildTermsSection(
                  number: '3',
                  icon: Icons.security,
                  iconColor: Color(0xFF007AFF),
                  title: 'Privacy Policy',
                  content:
                      'Your privacy is important to us. Please review our Privacy Policy to understand how we collect and use your information.',
                ),

                _buildTermsSection(
                  number: '4',
                  icon: Icons.description,
                  iconColor: Color(0xFF007AFF),
                  title: 'Content Guidelines',
                  content:
                      'Users must not post any unlawful, harmful, threatening, abusive content or engage in activities that violate these terms.',
                ),

                _buildTermsSection(
                  number: '5',
                  icon: Icons.copyright,
                  iconColor: Color(0xFF007AFF),
                  title: 'Intellectual Property',
                  content:
                      'All content, features, and functionality are owned by us and protected by international copyright laws.',
                ),

                _buildTermsSection(
                  number: '6',
                  icon: Icons.cancel,
                  iconColor: Color(0xFF007AFF),
                  title: 'Termination',
                  content:
                      'We reserve the right to terminate or suspend your account and access to services without prior notice.',
                ),

                SizedBox(height: 32),

                // Contact Section
                Container(
                  padding: EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    color: Color(0xFFF0F8FF),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: Color(0xFFE0E0E0)),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Icon(
                            Icons.mail_outline,
                            color: Color(0xFF007AFF),
                            size: 20,
                          ),
                          SizedBox(width: 8),
                          Text(
                            'Questions about Terms?',
                            style: TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.w600,
                              color: Colors.black,
                            ),
                          ),
                        ],
                      ),
                      SizedBox(height: 12),
                      Text(
                        'Contact us at support@avisaexperts.com',
                        style: TextStyle(
                          fontSize: 14,
                          color: Colors.grey[700],
                        ),
                      ),
                      SizedBox(height: 16),
                      SizedBox(
                        width: double.infinity,
                        child: ElevatedButton(
                          onPressed: () {
                            _launchURL('mailto:support@avisaexperts.com');
                          },
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Color(0xFF007AFF),
                            foregroundColor: Colors.white,
                            padding: EdgeInsets.symmetric(vertical: 12),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(8),
                            ),
                          ),
                          child: Text(
                            'Send Email',
                            style: TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
                SizedBox(height: 20),
              ],
            ),
          ),
          const FloatingChatBox(),
        ],
      ),
    );
  }

  void _launchURL(String url) async {
    if (!await launchUrl(Uri.parse(url))) {
      throw Exception('Could not launch $url');
    }
  }

  Widget _buildTermsSection({
    required String number,
    required IconData icon,
    required Color iconColor,
    required String title,
    required String content,
  }) {
    return Padding(
      padding: EdgeInsets.only(bottom: 24),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Number and Icon
          Container(
            width: 40,
            height: 40,
            decoration: BoxDecoration(
              color: iconColor.withOpacity(0.1),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Stack(
              children: [
                Center(
                  child: Icon(
                    icon,
                    color: iconColor,
                    size: 20,
                  ),
                ),
                Positioned(
                  top: 2,
                  left: 2,
                  child: Container(
                    width: 16,
                    height: 16,
                    decoration: BoxDecoration(
                      color: iconColor,
                      shape: BoxShape.circle,
                    ),
                    child: Center(
                      child: Text(
                        number,
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 10,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
          SizedBox(width: 16),
          // Content
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.w600,
                    color: Colors.black,
                  ),
                ),
                SizedBox(height: 8),
                Text(
                  content,
                  style: TextStyle(
                    fontSize: 15,
                    color: Colors.grey[600],
                    height: 1.4,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
