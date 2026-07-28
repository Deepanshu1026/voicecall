import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

class SimpleChatPage extends StatefulWidget {
  final String advisorId;

  const SimpleChatPage({super.key, required this.advisorId});

  @override
  State<SimpleChatPage> createState() => _SimpleChatPageState();
}

class _SimpleChatPageState extends State<SimpleChatPage> {
  String? userId;
  bool isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadUserId();
  }

  Future<void> _loadUserId() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final storedUserId = prefs.getString('userId') ?? 
                          prefs.getInt('userId')?.toString() ?? 
                          'No User ID Found';
      
      setState(() {
        userId = storedUserId;
        isLoading = false;
      });
      
      print('📱 SimpleChatPage loaded:');
      print('   - AdvisorId: ${widget.advisorId}');
      print('   - UserId from SharedPrefs: $userId');
    } catch (e) {
      print('❌ Error loading userId: $e');
      setState(() {
        userId = 'Error loading user ID';
        isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Test Chat Page'),
        backgroundColor: const Color(0xFFFF9500),
        foregroundColor: Colors.white,
      ),
      body: Center(
        child: isLoading 
            ? const CircularProgressIndicator() 
            : Padding(
                padding: const EdgeInsets.all(20.0),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Icon(
                      Icons.chat_bubble_outline,
                      size: 80,
                      color: Color(0xFFFF9500),
                    ),
                    const SizedBox(height: 20),
                    Text(
                      'Chat Test Page',
                      style: TextStyle(
                        fontSize: 24,
                        fontWeight: FontWeight.bold,
                        color: Colors.grey[800],
                      ),
                    ),
                    const SizedBox(height: 30),
                    Card(
                      child: Padding(
                        padding: const EdgeInsets.all(16.0),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Advisor ID:',
                              style: TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.bold,
                                color: Colors.grey[600],
                              ),
                            ),
                            const SizedBox(height: 5),
                            Text(
                              widget.advisorId,
                              style: const TextStyle(
                                fontSize: 18,
                                color: Colors.black87,
                              ),
                            ),
                            const SizedBox(height: 15),
                            Text(
                              'User ID (from SharedPreferences):',
                              style: TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.bold,
                                color: Colors.grey[600],
                              ),
                            ),
                            const SizedBox(height: 5),
                            Text(
                              userId ?? 'Loading...',
                              style: const TextStyle(
                                fontSize: 18,
                                color: Colors.black87,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                    const SizedBox(height: 30),
                    ElevatedButton(
                      onPressed: () {
                        print('✅ Test successful! AdvisorId: ${widget.advisorId}, UserId: $userId');
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(
                            content: Text('Navigation test successful!'),
                            backgroundColor: Colors.green,
                          ),
                        );
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFFFF9500),
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(horizontal: 30, vertical: 12),
                      ),
                      child: const Text('Test Complete'),
                    ),
                  ],
                ),
              ),
      ),
    );
  }
}
