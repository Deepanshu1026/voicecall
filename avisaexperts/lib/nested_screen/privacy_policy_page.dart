import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';

import '../widget/chatbox.dart'; // Import FloatingChatBox

class PrivacyPolicyPage extends StatelessWidget {
  const PrivacyPolicyPage({super.key});

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
          'Privacy Policy',
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
                // Header Section with Blue Icon
                Container(
                  padding: EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(12),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withOpacity(0.05),
                        blurRadius: 10,
                        offset: Offset(0, 2),
                      ),
                    ],
                  ),
                  child: Row(
                    children: [
                      Container(
                        width: 50,
                        height: 50,
                        decoration: BoxDecoration(
                          color: Color(0xFF007AFF),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Icon(
                          Icons.security,
                          color: Colors.white,
                          size: 24,
                        ),
                      ),
                      SizedBox(width: 16),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Privacy Policy',
                              style: TextStyle(
                                fontSize: 20,
                                fontWeight: FontWeight.bold,
                                color: Colors.black,
                              ),
                            ),
                            SizedBox(height: 4),
                            Text(
                              'Last Updated: July 15, 2025',
                              style: TextStyle(
                                fontSize: 14,
                                color: Colors.grey[600],
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
                SizedBox(height: 24),

                // Introduction Text
                Text(
                  'We are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, and safeguard your data.',
                  style: TextStyle(
                    fontSize: 16,
                    color: Colors.grey[700],
                    height: 1.5,
                  ),
                ),
                SizedBox(height: 32),

                // Information We Collect Section
                _buildSection(
                  icon: Icons.person_outline,
                  iconColor: Color(0xFF007AFF),
                  title: 'Information We Collect',
                  content:
                      'We collect information that you provide directly to us, including personal information such as your name, email address, and usage data.',
                ),

                // How We Use Your Information Section
                _buildSection(
                  icon: Icons.storage_outlined,
                  iconColor: Color(0xFF007AFF),
                  title: 'How We Use Your Information',
                  content:
                      'Your information helps us provide and improve our services, communicate with you, and ensure security.',
                ),

                // Information Sharing Section
                _buildSection(
                  icon: Icons.share_outlined,
                  iconColor: Color(0xFF007AFF),
                  title: 'Information Sharing',
                  content:
                      'We do not sell your personal information. We share your information only as described in this policy.',
                ),

                // Data Security Section
                _buildSection(
                  icon: Icons.lock_outline,
                  iconColor: Color(0xFF007AFF),
                  title: 'Data Security',
                  content:
                      'We implement appropriate technical and organizational measures to protect your personal information.',
                ),

                // Your Rights Section
                _buildSection(
                  icon: Icons.verified_user_outlined,
                  iconColor: Color(0xFF007AFF),
                  title: 'Your Rights',
                  content: 'You have the right to access, corre...',
                ),

                // Changes to This Policy Section
                _buildSection(
                  icon: Icons.info_outline,
                  iconColor: Color(0xFF007AFF),
                  title: 'Changes to This Policy',
                  content:
                      'We may update this policy from time to time. We will notify you of any changes by posting the new policy on this page.',
                ),

                SizedBox(height: 32),

                // Contact Us Section
                Text(
                  'Contact Us',
                  style: TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                    color: Colors.black,
                  ),
                ),
                SizedBox(height: 16),

                // Email Contact
                InkWell(
                  onTap: () {
                    void launchURL(String url) async {
                      if (!await launchUrl(Uri.parse(url))) {
                        throw Exception('Could not launch $url');
                      }
                    }

                    launchURL('mailto:support@avisaexperts.com');
                  },
                  child: Row(
                    children: [
                      Icon(Icons.email_outlined,
                          color: Color(0xFF007AFF), size: 20),
                      SizedBox(width: 12),
                      Text(
                        'support@avisaexperts.com',
                        style: TextStyle(
                          fontSize: 16,
                          color: Color(0xFF007AFF),
                        ),
                      ),
                    ],
                  ),
                ),
                SizedBox(height: 12),

                // Phone Contact
                InkWell(
                  onTap: () {
                    void launchURL(String url) async {
                      if (!await launchUrl(Uri.parse(url))) {
                        throw Exception('Could not launch $url');
                      }
                    }

                    launchURL('tel:+91 120-4502750');
                  },
                  child: Row(
                    children: [
                      Icon(Icons.phone_outlined,
                          color: Color(0xFF007AFF), size: 20),
                      SizedBox(width: 12),
                      Text(
                        '+91 120-4502750',
                        style: TextStyle(
                          fontSize: 16,
                          color: Color(0xFF007AFF),
                        ),
                      ),
                    ],
                  ),
                ),
                SizedBox(height: 32),

                // Footer
                Center(
                  child: Text(
                    '© 2024 Company Name. All rights reserved.',
                    style: TextStyle(
                      fontSize: 12,
                      color: Colors.grey[500],
                    ),
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

  Widget _buildSection({
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
          Container(
            width: 40,
            height: 40,
            decoration: BoxDecoration(
              color: iconColor.withOpacity(0.1),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Icon(
              icon,
              color: iconColor,
              size: 20,
            ),
          ),
          SizedBox(width: 16),
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
