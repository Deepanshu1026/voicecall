import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart'; // Import url_launcher
import 'dart:async'; // For Future

import '../widget/chatbox.dart'; // Import FloatingChatBox

// Data structure for FAQ items
class FaqItem {
  final IconData icon;
  final String title;
  final String? content;
  final Widget? contentWidget;
  final bool initiallyExpanded;

  FaqItem({
    required this.icon,
    required this.title,
    this.content,
    this.contentWidget,
    this.initiallyExpanded = false,
  });
}

class HelpSupportScreen extends StatefulWidget {
  const HelpSupportScreen({super.key});

  @override
  State<HelpSupportScreen> createState() => _HelpSupportScreenState();
}

class _HelpSupportScreenState extends State<HelpSupportScreen> {
  // Controller for the search bar
  final TextEditingController _searchController = TextEditingController();
  String _searchQuery = '';

  // --- FAQ Data ---
  // Store FAQs in a list for easier filtering
  final List<FaqItem> _allFaqs = [
    FaqItem(
      icon: Icons.assessment_outlined,
      title: 'Application Status',
      content:
          'You can check the status of your application directly within the app under the "My Applications" section. Statuses include Pending, In Review, Approved, or Rejected.',
    ),
    FaqItem(
      icon: Icons.description_outlined,
      title: 'Document Requirements',
      content:
          'Required documents typically include passport copies, proof of funds, invitation letters (if applicable), and specific forms depending on the visa type. Please check the detailed requirements for your chosen visa.',
    ),
    FaqItem(
      icon: Icons.hourglass_bottom_outlined,
      title: 'Processing Times',
      content:
          'Processing times vary depending on the visa type and the country\'s embassy workload. Standard processing usually takes X-Y weeks, while expedited options may be available.',
    ),
    FaqItem(
      icon: Icons.credit_card_outlined,
      title: 'Fee Information',
      content:
          'Visa application fees and our service charges are listed on the specific visa service page. Payments can be made via credit/debit card or bank transfer.',
    ),
    FaqItem(
      icon: Icons.calendar_today_outlined,
      title: 'Schedule Appointment',
      initiallyExpanded: true, // Match image: this one starts expanded
      contentWidget: Container(
        // Custom widget for styled content
        padding: const EdgeInsets.all(16.0),
        margin: const EdgeInsets.only(
            top: 8.0, bottom: 10.0), // Margin around the blue box
        decoration: BoxDecoration(
          color: const Color(0xFFE3F2FD), // Light blue background
          borderRadius: BorderRadius.circular(10.0),
        ),
        child: const Text(
          "If you're facing any issues while scheduling your appointment, please don't worry. Our consultation team is here to assist you. Feel free to reach out, and we'll guide you step-by-step to complete your booking smoothly.",
          style: TextStyle(
              color: Colors.black87,
              height: 1.4), // Slightly increased line height
        ),
      ),
    ),
  ];

  // Filtered list based on search query
  List<FaqItem> _filteredFaqs = [];

  @override
  void initState() {
    super.initState();
    _filteredFaqs = _allFaqs; // Initially show all FAQs
    _searchController.addListener(_onSearchChanged);
  }

  void _onSearchChanged() {
    setState(() {
      _searchQuery = _searchController.text.toLowerCase();
      _filteredFaqs = _allFaqs.where((faq) {
        final titleMatch = faq.title.toLowerCase().contains(_searchQuery);
        final contentMatch =
            faq.content?.toLowerCase().contains(_searchQuery) ?? false;
        // Basic check if contentWidget is Text (can be expanded)
        final contentWidgetMatch = (faq.contentWidget is Container &&
                (faq.contentWidget as Container).child is Text)
            ? ((faq.contentWidget as Container).child as Text)
                    .data
                    ?.toLowerCase()
                    .contains(_searchQuery) ??
                false
            : false;
        return titleMatch || contentMatch || contentWidgetMatch;
      }).toList();
    });
  }

  // Helper function to launch URLs (mailto:, tel:)
  Future<void> _launchURL(String urlString) async {
    final Uri url = Uri.parse(urlString);
    if (!await launchUrl(url, mode: LaunchMode.externalApplication)) {
      // Log error or show snackbar if launching fails
      print('Could not launch $urlString');
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
              content: Text('Could not open $urlString'),
              backgroundColor: Colors.red),
        );
      }
    }
  }

  @override
  void dispose() {
    _searchController.removeListener(_onSearchChanged);
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    // Define colors for consistency
    const Color primaryBlue = Color(0xFF0D47A1); // Example blue
    const Color lightBlueBackground =
        Color(0xFFE3F2FD); // Background for expanded text
    const Color iconColor = primaryBlue; // Color for leading icons
    const Color textColor = Colors.black87;
    const Color secondaryTextColor = Colors.black54;

    return Scaffold(
      backgroundColor: Colors.grey[100], // Light grey background
      appBar: AppBar(
        elevation: 0.5, // Subtle shadow
        backgroundColor: Colors.white, // White AppBar background
        surfaceTintColor: Colors.white, // Prevents color change on scroll (M3)
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios, color: Colors.black, size: 20),
          onPressed: () => Navigator.of(context).pop(),
        ),
        title: Text(
          'Help & Support',
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
          ListView(
            padding: const EdgeInsets.all(16.0),
            children: [
              // --- Search Bar ---
              Padding(
                padding: const EdgeInsets.only(bottom: 20.0),
                child: TextField(
                  controller: _searchController,
                  decoration: InputDecoration(
                    hintText: 'Search FAQs...',
                    prefixIcon: const Icon(Icons.search, color: Colors.grey),
                    filled: true,
                    fillColor: Colors.white,
                    contentPadding: const EdgeInsets.symmetric(
                        vertical: 10.0, horizontal: 15.0),
                    border: OutlineInputBorder(
                      borderRadius:
                          BorderRadius.circular(30.0), // Rounded border
                      borderSide: BorderSide(color: Colors.grey.shade300),
                    ),
                    enabledBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(30.0),
                      borderSide: BorderSide(color: Colors.grey.shade300),
                    ),
                    focusedBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(30.0),
                      borderSide: BorderSide(
                          color: primaryBlue
                              .withOpacity(0.8)), // Highlight on focus
                    ),
                  ),
                ),
              ),

              // --- Common FAQs Section ---
              Padding(
                padding: const EdgeInsets.only(bottom: 10.0),
                child: Text(
                  _searchQuery.isEmpty
                      ? 'Common FAQs'
                      : 'Search Results (${_filteredFaqs.length})',
                  style: const TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      color: textColor),
                ),
              ),
              // Display filtered FAQs or a message if no results
              _filteredFaqs.isEmpty
                  ? Padding(
                      padding: const EdgeInsets.symmetric(vertical: 20.0),
                      child: Center(
                        child: Text(
                          'No FAQs found matching "$_searchQuery"',
                          style: const TextStyle(
                              color: secondaryTextColor, fontSize: 16),
                          textAlign: TextAlign.center,
                        ),
                      ),
                    )
                  : Column(
                      children: _filteredFaqs
                          .map((faq) => _buildFaqItem(
                                icon: faq.icon,
                                title: faq.title,
                                iconColor: iconColor,
                                content: faq.content,
                                contentWidget: faq.contentWidget,
                                initiallyExpanded: faq.initiallyExpanded &&
                                    _searchQuery
                                        .isEmpty, // Only expand initially if not searching
                                backgroundColor: lightBlueBackground,
                              ))
                          .toList(),
                    ),

              const SizedBox(height: 15), // Space before divider
              const Divider(height: 30, thickness: 1), // Visual separator
              const SizedBox(height: 10), // Space after divider

              // --- Technical Support Section ---
              const Padding(
                padding:
                    EdgeInsets.only(bottom: 15.0), // Increased bottom padding
                child: Text(
                  'Technical Support',
                  style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      color: textColor),
                ),
              ),
              _buildContactItem(
                icon: Icons.email_outlined,
                iconColor: iconColor,
                label: 'Email Support',
                value: 'support@avisaexperts.com',
                onTap: () => _launchURL('mailto:support@avisaexperts.com'),
              ),
              const SizedBox(
                  height: 12), // Adjusted space between contact items
              _buildContactItem(
                icon: Icons.phone_outlined,
                iconColor: iconColor,
                label: 'Phone Support',
                value: '+91 120-4502750',
                onTap: () => _launchURL('tel:+91 120-4502750'),
              ),
              const SizedBox(height: 20), // Bottom padding
            ],
          ),
          const FloatingChatBox(),
        ],
      ),
    );
  }

  // Helper Widget for FAQ Items using ExpansionTile
  Widget _buildFaqItem({
    required IconData icon,
    required String title,
    required Color iconColor,
    String? content, // Optional simple text content
    Widget? contentWidget, // Optional custom widget content
    bool initiallyExpanded = false,
    Color backgroundColor = Colors.white, // Background for simple content
  }) {
    return Card(
      // Wrap in Card for subtle elevation and separation
      elevation: 0.5,
      margin: const EdgeInsets.only(bottom: 10.0),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10.0)),
      clipBehavior: Clip.antiAlias, // Ensures content respects rounded corners
      child: ExpansionTile(
        key: PageStorageKey(title), // Helps maintain expansion state on scroll
        initiallyExpanded: initiallyExpanded,
        leading: Icon(icon, color: iconColor),
        title: Text(title, style: const TextStyle(fontWeight: FontWeight.w500)),
        backgroundColor: Colors.white, // Background when collapsed
        collapsedBackgroundColor: Colors.white,
        iconColor: Colors.grey.shade600, // Arrow color
        collapsedIconColor: Colors.grey.shade600,
        tilePadding:
            const EdgeInsets.symmetric(horizontal: 16.0, vertical: 4.0),
        childrenPadding: const EdgeInsets.symmetric(horizontal: 16.0)
            .copyWith(bottom: 16.0), // Padding for content
        children: <Widget>[
          if (contentWidget != null)
            contentWidget // Use custom widget if provided
          else if (content != null)
            // Default styling for simple text content
            Container(
              alignment: Alignment.centerLeft,
              padding: const EdgeInsets.all(16.0),
              decoration: BoxDecoration(
                  color: backgroundColor,
                  borderRadius: BorderRadius.circular(8.0)),
              child: Text(
                content,
                style: const TextStyle(color: Colors.black87, height: 1.4),
              ),
            )
          else
            const SizedBox.shrink(), // Empty if no content
        ],
      ),
    );
  }

  // Helper Widget for Contact Items
  Widget _buildContactItem({
    required IconData icon,
    required Color iconColor,
    required String label,
    required String value,
    required VoidCallback onTap,
  }) {
    return Material(
      // Provides ink splash effect
      color: Colors.white,
      borderRadius: BorderRadius.circular(10.0),
      child: InkWell(
        onTap: onTap,
        borderRadius:
            BorderRadius.circular(10.0), // Match container's border radius
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 16.0),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(10.0),
            border: Border.all(
                color: Colors.grey.shade300, width: 1.0), // Subtle border
          ),
          child: Row(
            children: [
              Icon(icon, color: iconColor, size: 24),
              const SizedBox(width: 16.0),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      label,
                      style: const TextStyle(
                          fontSize: 14,
                          color: Colors.black54,
                          fontWeight: FontWeight.w500),
                    ),
                    const SizedBox(height: 4.0),
                    Text(
                      value,
                      style: const TextStyle(
                          fontSize: 16,
                          color: Colors.black87,
                          fontWeight: FontWeight.w500),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
