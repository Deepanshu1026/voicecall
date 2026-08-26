import 'package:flutter/material.dart';
import 'package:lottie/lottie.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:http/http.dart' as http;

import '../config/app_config.dart';
import '../authentication/role_selection_screen.dart';
import '../nested_screen/privacy_policy_page.dart';
import '../nested_screen/term_condition.dart';
import '../nested_screen/help_support_screen.dart';
import '../nested_screen/about.dart';
import '../config/app_config.dart';

class ConsultantProfileScreen extends StatefulWidget {
  const ConsultantProfileScreen({super.key});

  @override
  State<ConsultantProfileScreen> createState() => _ConsultantProfileScreenState();
}

class _ConsultantProfileScreenState extends State<ConsultantProfileScreen>
    with WidgetsBindingObserver {
  String _userName = 'Consultant';
  String _userEmail = '';
  String? _userImagePath;
  String _expertise = '';
  String _language = '';
  int _experience = 0;
  int _totalOrders = 0;
  String _role = 'Agent';
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    _loadConsultantData();
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    super.dispose();
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    super.didChangeAppLifecycleState(state);
    if (state == AppLifecycleState.resumed) {
      _loadConsultantData();
    }
  }

  Future<void> _loadConsultantData() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      if (!mounted) return;

      final loadedName = prefs.getString('userName') ?? 'Consultant';
      final loadedEmail = prefs.getString('userEmail') ?? '';
      final loadedImagePath = prefs.getString('userProfile');
      final loadedExpertise = prefs.getString('consultantExpertise') ?? '';
      final loadedLanguage = prefs.getString('consultantLanguage') ?? '';
      final loadedExperience = prefs.getInt('consultantExperience') ?? 0;
      final loadedTotalOrders = prefs.getInt('consultantTotalOrders') ?? 0;
      final loadedRole = prefs.getString('consultantRole') ?? 'Agent';

      if (mounted) {
        setState(() {
          _userName = loadedName;
          _userEmail = loadedEmail;
          _userImagePath = loadedImagePath;
          _expertise = loadedExpertise;
          _language = loadedLanguage;
          _experience = loadedExperience;
          _totalOrders = loadedTotalOrders;
          _role = loadedRole;
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  Future<void> _logout(BuildContext context) async {
    final bool? confirmLogout = await showDialog<bool>(
      context: context,
      builder: (BuildContext context) {
        return Dialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20.0)),
          backgroundColor: Colors.white,
          child: Padding(
            padding: const EdgeInsets.all(24.0),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                SizedBox(
                  width: 130,
                  height: 130,
                  child: Lottie.asset('assets/Exit.json'),
                ),
                const SizedBox(height: 8),
                const Text(
                  'Leaving so soon?',
                  style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: Colors.black87),
                ),
                const SizedBox(height: 12),
                Text(
                  'Are you sure you want to end your session?',
                  textAlign: TextAlign.center,
                  style: TextStyle(fontSize: 16, color: Colors.grey.shade600, height: 1.4),
                ),
                const SizedBox(height: 24),
                Row(
                  children: [
                    Expanded(
                      child: TextButton(
                        style: TextButton.styleFrom(
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        ),
                        child: const Text('CANCEL',
                            style: TextStyle(color: Colors.grey, fontWeight: FontWeight.bold)),
                        onPressed: () => Navigator.of(context).pop(false),
                      ),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: ElevatedButton(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFFD32F2F),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                          padding: const EdgeInsets.symmetric(vertical: 12),
                        ),
                        child: const Text('LOGOUT',
                            style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                        onPressed: () => Navigator.of(context).pop(true),
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

    if (confirmLogout == true) {
      try {
        final prefs = await SharedPreferences.getInstance();
        final sessionToken = prefs.getString('consultantSessionToken') ?? '';
        // Notify backend that agent is logging out
        try {
          await http.post(
            Uri.parse('${AppConfig.apiBaseUrl}/api/employees/logout'),
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer $sessionToken',
            },
          ).timeout(const Duration(seconds: 10));
        } catch (_) { /* best effort */ }
        await prefs.clear();
        if (context.mounted) {
          Navigator.of(context).pushAndRemoveUntil(
            MaterialPageRoute(builder: (ctx) => const RoleSelectionScreen()),
            (Route<dynamic> route) => false,
          );
        }
      } catch (e) {
        if (context.mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Logout failed. Please try again.'), backgroundColor: Colors.red),
          );
        }
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    bool hasValidImagePath = _userImagePath != null && _userImagePath!.trim().isNotEmpty;
    String? fullImageUrl;
    if (hasValidImagePath) {
      if (_userImagePath!.startsWith('http://') || _userImagePath!.startsWith('https://')) {
        fullImageUrl = _userImagePath;
      } else {
        const String baseImageUrl = AppConfig.staticAssetBase;
        if (baseImageUrl.endsWith('/') && _userImagePath!.startsWith('/')) {
          fullImageUrl = baseImageUrl + _userImagePath!.substring(1);
        } else if (!baseImageUrl.endsWith('/') && !_userImagePath!.startsWith('/')) {
          fullImageUrl = '$baseImageUrl/$_userImagePath';
        } else {
          fullImageUrl = baseImageUrl + _userImagePath!;
        }
      }
    }

    return Scaffold(
      backgroundColor: const Color(0xFF0D47A1),
      body: Stack(
        children: [
          Column(
            children: [
              const SizedBox(height: 60),
              Center(
                child: Column(
                  children: [
                    CircleAvatar(
                      radius: 50,
                      backgroundColor: Colors.white.withOpacity(0.2),
                      backgroundImage: hasValidImagePath && fullImageUrl != null
                          ? CachedNetworkImageProvider(fullImageUrl)
                          : null,
                      child: (!hasValidImagePath || fullImageUrl == null)
                          ? const Icon(Icons.person_rounded, size: 50, color: Colors.white70)
                          : null,
                    ),
                    const SizedBox(height: 10),
                    Text(
                      _isLoading ? "Loading..." : _userName,
                      style: const TextStyle(
                          color: Colors.white, fontSize: 20, fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(height: 4),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                      decoration: BoxDecoration(
                        color: Colors.white.withOpacity(0.2),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Text(
                        _role,
                        style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w600),
                      ),
                    ),
                    if (!_isLoading && _userEmail.isNotEmpty) ...[
                      const SizedBox(height: 4),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                        decoration: BoxDecoration(
                          color: Colors.white.withOpacity(0.15),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Text(_userEmail,
                            style: const TextStyle(color: Colors.white70, fontSize: 12)),
                      ),
                    ],
                  ],
                ),
              ),
              const SizedBox(height: 30),
              Expanded(
                child: Container(
                  width: double.infinity,
                  clipBehavior: Clip.antiAlias,
                  padding: const EdgeInsets.only(top: 20, left: 16, right: 16),
                  decoration: const BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.only(
                      topLeft: Radius.circular(35),
                      topRight: Radius.circular(35),
                    ),
                  ),
                  child: RefreshIndicator(
                    onRefresh: _loadConsultantData,
                    child: _isLoading
                        ? const Center(child: CircularProgressIndicator())
                        : MediaQuery.removePadding(
                            context: context,
                            removeTop: true,
                            child: ListView(
                              physics: const AlwaysScrollableScrollPhysics(
                                  parent: BouncingScrollPhysics()),
                              children: [
                                _buildInfoSection(),
                                const SizedBox(height: 16),
                                Divider(height: 1, color: Colors.grey.shade300),
                                _ProfileTile(
                                  icon: Icons.privacy_tip_outlined,
                                  title: 'Privacy Policy',
                                  color: const Color.fromARGB(255, 176, 39, 39),
                                  onTap: () {
                                    Navigator.push(context,
                                        MaterialPageRoute(builder: (context) => PrivacyPolicyPage()));
                                  },
                                ),
                                Divider(height: 1, color: Colors.grey.shade300),
                                _ProfileTile(
                                  icon: Icons.list_alt_outlined,
                                  title: 'Terms & Conditions',
                                  color: const Color.fromARGB(255, 105, 176, 39),
                                  onTap: () {
                                    Navigator.push(context,
                                        MaterialPageRoute(builder: (context) => TermsConditionsPage()));
                                  },
                                ),
                                Divider(height: 1, color: Colors.grey.shade300),
                                _ProfileTile(
                                  icon: Icons.help_outline_rounded,
                                  title: 'Help & Support',
                                  color: Colors.purple,
                                  onTap: () {
                                    Navigator.push(context,
                                        MaterialPageRoute(builder: (context) => HelpSupportScreen()));
                                  },
                                ),
                                Divider(height: 1, color: Colors.grey.shade300),
                                _ProfileTile(
                                  icon: Icons.info_outline,
                                  title: 'About Application',
                                  color: Colors.cyan,
                                  onTap: () {
                                    Navigator.push(context,
                                        MaterialPageRoute(builder: (context) => AboutPage()));
                                  },
                                ),
                                Divider(height: 1, color: Colors.grey.shade300),
                                _ProfileTile(
                                  icon: Icons.logout_rounded,
                                  title: 'Log out',
                                  color: Colors.redAccent.shade700,
                                  onTap: () => _logout(context),
                                ),
                                const SizedBox(height: 40),
                                const Center(
                                    child: Text("Version 2.0.2", style: TextStyle(color: Colors.grey))),
                                const SizedBox(height: 20),
                              ],
                            ),
                          ),
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildInfoSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        if (_expertise.isNotEmpty)
          _buildInfoCard(
            icon: Icons.work_outline,
            label: 'Expertise',
            value: _expertise,
            color: const Color(0xFF0D47A1),
          ),
        if (_language.isNotEmpty)
          _buildInfoCard(
            icon: Icons.language,
            label: 'Languages',
            value: _language,
            color: Colors.teal,
          ),
        _buildInfoCard(
          icon: Icons.star_outline,
          label: 'Experience',
          value: '$_experience year${_experience != 1 ? 's' : ''}',
          color: Colors.orange,
        ),
        _buildInfoCard(
          icon: Icons.receipt_long_outlined,
          label: 'Total Orders',
          value: _totalOrders.toString(),
          color: Colors.green,
        ),
      ],
    );
  }

  Widget _buildInfoCard({
    required IconData icon,
    required String label,
    required String value,
    required Color color,
  }) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: color.withOpacity(0.05),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: color.withOpacity(0.15)),
        ),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: color.withOpacity(0.1),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Icon(icon, color: color, size: 20),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(label,
                      style: TextStyle(fontSize: 12, color: Colors.grey.shade600, fontWeight: FontWeight.w500)),
                  const SizedBox(height: 2),
                  Text(value,
                      style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: Colors.black87)),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _ProfileTile extends StatelessWidget {
  final IconData icon;
  final String title;
  final Color color;
  final VoidCallback? onTap;

  const _ProfileTile({
    required this.icon,
    required this.title,
    required this.color,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return ListTile(
      contentPadding: const EdgeInsets.symmetric(vertical: 4.0, horizontal: 0),
      leading: Container(
        padding: const EdgeInsets.all(8),
        decoration: BoxDecoration(
            color: color.withOpacity(0.1), borderRadius: BorderRadius.circular(10)),
        child: Icon(icon, color: color, size: 22),
      ),
      title: Text(title,
          style: TextStyle(
              fontWeight: FontWeight.w500,
              color: title == 'Log out' ? Colors.red.shade700 : Colors.black87)),
      trailing: Icon(Icons.arrow_forward_ios, size: 16, color: Colors.grey.shade400),
      onTap: onTap,
    );
  }
}
