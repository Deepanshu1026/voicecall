import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

class UserDetailsPage extends StatefulWidget {
  const UserDetailsPage({super.key});

  @override
  State<UserDetailsPage> createState() => _UserDetailsPageState();
}

class _UserDetailsPageState extends State<UserDetailsPage> {
  bool _isLoading = true;

  // Variables to hold your stored data
  String? _userId;
  String? _userName;
  String? _userEmail;
  String? _userPhone;
  String? _userProfilePath;

  @override
  void initState() {
    super.initState();
    _loadUserData();
  }

  /// This function reads all the data from SharedPreferences
  Future<void> _loadUserData() async {
    setState(() => _isLoading = true);
    final prefs = await SharedPreferences.getInstance();

    // Fetch the data using the EXACT keys from your AuthScreen
    final dynamic userIdValue = prefs.get('userId');
    if (userIdValue is String) {
      _userId = userIdValue;
    } else if (userIdValue is int) {
      _userId = userIdValue.toString();
    }
    _userName = prefs.getString('userName');
    _userEmail = prefs.getString('userEmail');
    _userPhone = prefs.getString('userPhone');
    _userProfilePath = prefs.getString('userProfile');

    // This will help you debug in the console
    print('--- User Details Page: Data Fetched ---');
    print('User ID: $_userId');
    print('Name: $_userName');
    print('------------------------------------');

    setState(() => _isLoading = false);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('My Profile'),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : ListView(
              padding: const EdgeInsets.all(20.0),
              children: [
                Card(
                  elevation: 4,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(15)),
                  child: Padding(
                    padding: const EdgeInsets.all(20.0),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          "Account Information",
                          style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold),
                        ),
                        const Divider(height: 30),
                        _buildDetailRow(Icons.person, "User ID", _userId?.toString() ?? 'Not Found'),
                        _buildDetailRow(Icons.badge, "Name", _userName ?? 'Not Found'),
                        _buildDetailRow(Icons.email, "Email", _userEmail ?? 'Not Found'),
                        _buildDetailRow(Icons.phone, "Phone", _userPhone ?? 'Not Found'),
                        _buildDetailRow(Icons.image, "Profile Path", _userProfilePath ?? 'Not Found'),
                      ],
                    ),
                  ),
                ),
              ],
            ),
      floatingActionButton: FloatingActionButton(
        onPressed: _loadUserData,
        tooltip: 'Refresh',
        child: const Icon(Icons.refresh),
      ),
    );
  }

  // Helper widget to make the rows look nice
  Widget _buildDetailRow(IconData icon, String title, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8.0),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, color: Colors.grey.shade600),
          const SizedBox(width: 15),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                title,
                style: TextStyle(color: Colors.grey.shade700, fontSize: 14),
              ),
              const SizedBox(height: 2),
              Text(
                value,
                style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w500),
              ),
            ],
          ),
        ],
      ),
    );
  }
}