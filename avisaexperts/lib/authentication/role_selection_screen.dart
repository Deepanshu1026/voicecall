import 'package:flutter/material.dart';

// Import your project's necessary screens
import 'auth_screen.dart'; // Make sure this path is correct
import 'guest.dart';
import '../navigation/main_navigation_screen.dart';

class RoleSelectionScreen extends StatefulWidget {
  const RoleSelectionScreen({super.key});

  @override
  State<RoleSelectionScreen> createState() => _RoleSelectionScreenState();
}

class _RoleSelectionScreenState extends State<RoleSelectionScreen> {
  bool _loadingGuest = false;

  // Navigate to the AuthScreen for a standard user login
  void _navigateToUserAuth(BuildContext context) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => const AuthScreen(role: 'User'),
      ),
    );
  }

  // Navigate to the AuthScreen for a consultant login
  void _navigateToConsultantAuth(BuildContext context) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => const AuthScreen(role: 'Consultant'),
      ),
    );
  }

  // Handle guest login flow
  Future<void> _continueAsGuest() async {
    setState(() => _loadingGuest = true);
    final result = await GuestService.createGuestUser();
    if (!mounted) return;
    setState(() => _loadingGuest = false);

    if (result['success'] == true) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Welcome ${result['userName'] ?? 'Guest'}')),
      );

      Navigator.pushReplacement(
        context,
        MaterialPageRoute(builder: (_) => const MainNavigationScreen()),
      );
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(result['message'] ?? 'Guest login failed'),
          backgroundColor: Colors.red,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final screenHeight = MediaQuery.of(context).size.height;
    final imageHeight = screenHeight * 0.45;

    const Color primaryBlue = Color(0xFF0D47A1);
    const Color lightGreyBackground = Color(0xFFF5F5F5);

    return Scaffold(
      backgroundColor: lightGreyBackground,
      body: Column(
        children: <Widget>[
          // --- Top Image Section ---
          SizedBox(
            height: imageHeight,
            width: double.infinity,
            child: Image.asset(
              'assets/via.webp', // Replace with your image asset
              fit: BoxFit.cover,
              errorBuilder: (context, error, stackTrace) {
                return Container(
                  color: Colors.grey.shade300,
                  child: const Center(
                    child: Icon(Icons.image_not_supported,
                        color: Colors.grey, size: 50),
                  ),
                );
              },
            ),
          ),

          // --- Content Section (with curved top) ---
          Expanded(
            child: Container(
              decoration: const BoxDecoration(
                color: lightGreyBackground,
                borderRadius: BorderRadius.only(
                  topLeft: Radius.circular(30.0),
                  topRight: Radius.circular(30.0),
                ),
              ),
              child: SingleChildScrollView(
                physics: const BouncingScrollPhysics(),
                child: Padding(
                  padding: const EdgeInsets.symmetric(
                      horizontal: 24.0, vertical: 32.0),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: <Widget>[
                      // --- Welcome Text ---
                      const Text(
                        'Welcome to\nA Visa Experts',
                        textAlign: TextAlign.center,
                        style: TextStyle(
                          fontSize: 26,
                          fontWeight: FontWeight.bold,
                          color: Colors.black87,
                          height: 1.3,
                        ),
                      ),
                      const SizedBox(height: 12),
                      Text(
                        'Your Trusted and Dedicated Partner in\nEvery Step of Your Immigration Journey',
                        textAlign: TextAlign.center,
                        style: TextStyle(
                          fontSize: 15,
                          color: Colors.grey.shade700,
                          height: 1.4,
                        ),
                      ),
                      const SizedBox(height: 40),

                      // --- Primary Login Button ---
                      ElevatedButton(
                        onPressed: () => _navigateToUserAuth(context),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: primaryBlue,
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(vertical: 16),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                          textStyle: const TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        child: const Text('Login / Register'),
                      ),
                      const SizedBox(height: 16),

                      // --- Guest Button ---
                      OutlinedButton.icon(
                        onPressed: _loadingGuest ? null : _continueAsGuest,
                        icon: _loadingGuest
                            ? const SizedBox(
                                width: 18,
                                height: 18,
                                child:
                                    CircularProgressIndicator(strokeWidth: 2))
                            : const Icon(Icons.person_outline),
                        label: const Text('Continue as Guest'),
                        style: OutlinedButton.styleFrom(
                          foregroundColor: Colors.grey.shade800,
                          padding: const EdgeInsets.symmetric(vertical: 14),
                          side: BorderSide(color: Colors.grey.shade300),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                        ),
                      ),
                      const SizedBox(height: 30),

                      // --- "OR" Divider for Consultant Login ---
                      Row(
                        children: [
                          Expanded(child: Divider(color: Colors.grey.shade300)),
                          Padding(
                            padding: const EdgeInsets.symmetric(horizontal: 16),
                            child: Text(
                              'OR',
                              style: TextStyle(
                                color: Colors.grey.shade600,
                                fontWeight: FontWeight.w500,
                              ),
                            ),
                          ),
                          Expanded(child: Divider(color: Colors.grey.shade300)),
                        ],
                      ),
                      const SizedBox(height: 24),

                      // --- Consultant Login (as a TextButton for secondary action) ---
                      Center(
                        child: TextButton(
                          onPressed: () => _navigateToConsultantAuth(context),
                          child: Text(
                            'Login as a Consultant',
                            style: TextStyle(
                              color: Colors.grey.shade700,
                              fontWeight: FontWeight.w600,
                              fontSize: 15,
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(height: 20),
                    ],
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
