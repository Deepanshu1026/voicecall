import 'package:flutter/material.dart';
import 'package:lottie/lottie.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
// Make sure this import is correct
import 'package:shared_preferences/shared_preferences.dart';
import '../config/app_config.dart';

class ComingSoonPage extends StatefulWidget {
  const ComingSoonPage({super.key});

  @override
  State<ComingSoonPage> createState() => _ComingSoonPageState();
}

class _ComingSoonPageState extends State<ComingSoonPage>
    with TickerProviderStateMixin {
  late final AnimationController _lottieController;
  late final AnimationController _uiController;
  late final AnimationController _buttonPulseController;

  // State variables to hold user data
  String? _userName;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadUserData();

    // Animation controllers (unchanged)
    _uiController = AnimationController(
      duration: const Duration(milliseconds: 1200),
      vsync: this,
    );
    _lottieController =
        AnimationController(vsync: this, duration: const Duration(seconds: 3));
    _buttonPulseController = AnimationController(
      duration: const Duration(milliseconds: 1500),
      vsync: this,
    )..repeat(reverse: true);
    _uiController.forward();
    _lottieController.repeat(reverse: true);
  }

  @override
  void dispose() {
    _lottieController.dispose();
    _uiController.dispose();
    _buttonPulseController.dispose();
    super.dispose();
  }

  // This function still fetches the user's name to display
  Future<void> _loadUserData() async {
    final prefs = await SharedPreferences.getInstance();
    setState(() {
      _userName = prefs.getString('userName');
      _isLoading = false;
    });
    print("✅ ComingSoonPage: User name '$_userName' loaded.");
  }

  // --- NEW: A simple function to launch the main website ---
  Future<void> _launchWebsite() async {
    final url = Uri.parse('${AppConfig.staticAssetBase}/consultant.php');
    if (!await launchUrl(url)) {
      print('Could not launch $url');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Coming Soon'),
        centerTitle: true,
      ),
      backgroundColor: Colors.grey.shade100,
      body: Column(
        children: [
          Expanded(
            child: FadeTransition(
              opacity: _uiController,
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Lottie.asset(
                    'assets/Welcome.json',
                    controller: _lottieController,
                    height: 200,
                  ),
                  const SizedBox(height: 32),
                  if (_isLoading)
                    const CircularProgressIndicator()
                  else
                    Text(
                      _userName != null && _userName!.isNotEmpty
                          ? 'Welcome, $_userName!'
                          : 'Coming Soon!',
                      style: const TextStyle(
                        fontSize: 28,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  const SizedBox(height: 16),
                  const Text(
                    'We are working hard to bring you this feature.\nStay tuned for updates!',
                    textAlign: TextAlign.center,
                    style: TextStyle(fontSize: 16, color: Colors.black54),
                  ),
                  const SizedBox(height: 32),

                  // --- MODIFIED BUTTON ---
                  ScaleTransition(
                    scale: Tween<double>(begin: 1.0, end: 1.05)
                        .animate(CurvedAnimation(
                      parent: _buttonPulseController,
                      curve: Curves.easeInOut,
                    )),
                    child: ElevatedButton.icon(
                      // This button now calls the simple website launcher
                      onPressed: _launchWebsite,
                      icon: const Icon(Icons.public),
                      label: const Text('Visit Our Website'),
                      style: ElevatedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 24, vertical: 12),
                        textStyle: const TextStyle(fontSize: 16),
                        backgroundColor: Colors.blueAccent,
                        foregroundColor: Colors.white,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(30),
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
          const Padding(
            padding: EdgeInsets.all(16.0),
            child: Column(
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(FontAwesomeIcons.instagram,
                        color: Colors.pink, size: 20),
                    SizedBox(width: 16),
                    Icon(FontAwesomeIcons.facebook,
                        color: Colors.blue, size: 20),
                    SizedBox(width: 16),
                    Icon(FontAwesomeIcons.twitter,
                        color: Colors.lightBlue, size: 20),
                    SizedBox(width: 16),
                    Icon(FontAwesomeIcons.linkedin,
                        color: Colors.blueAccent, size: 20),
                  ],
                ),
                SizedBox(height: 16),
                Center(
                  child: Text(
                    'copyright © 2025 A visa Experts | All rights reserved. | terms of service | privacy policy',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                        fontSize: 12, color: Colors.black, height: 1.5),
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
