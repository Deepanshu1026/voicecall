import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import '../config/app_config.dart';

class ConsultantAdminSettingsScreen extends StatefulWidget {
  const ConsultantAdminSettingsScreen({super.key});

  @override
  State<ConsultantAdminSettingsScreen> createState() =>
      _ConsultantAdminSettingsScreenState();
}

class _ConsultantAdminSettingsScreenState
    extends State<ConsultantAdminSettingsScreen> {
  bool _unlimitedFreeChat = false;
  int _freeChatDurationSeconds = 600;
  int _chatPaymentAmount = 100;
  bool _loading = true;
  bool _saving = false;
  String? _message;
  String? _error;

  @override
  void initState() {
    super.initState();
    _loadSettings();
  }

  Future<void> _loadSettings() async {
    setState(() => _loading = true);
    try {
      final response = await http.get(
        Uri.parse(AppConfig.adminSettings),
        headers: {'Content-Type': 'application/json'},
      ).timeout(const Duration(seconds: 15));

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        final settings =
            data['data']?['settings'] as Map<String, dynamic>? ?? {};
        if (mounted) {
          setState(() {
            _unlimitedFreeChat = settings['unlimitedFreeChat'] == true;
            _freeChatDurationSeconds =
                settings['freeChatDurationSeconds'] ?? 600;
            _chatPaymentAmount = settings['chatPaymentAmount'] ?? 100;
            _loading = false;
          });
        }
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _loading = false;
          _error = 'Failed to load settings';
        });
      }
    }
  }

  Future<void> _saveSettings() async {
    if (_saving) return;
    setState(() {
      _saving = true;
      _message = null;
      _error = null;
    });

    try {
      final prefs = await SharedPreferences.getInstance();
      final sessionToken = prefs.getString('consultantSessionToken') ?? '';

      final response = await http.put(
        Uri.parse(AppConfig.adminSettings),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $sessionToken',
        },
        body: json.encode({
          'unlimitedFreeChat': _unlimitedFreeChat,
          'freeChatDurationSeconds': _freeChatDurationSeconds,
          'chatPaymentAmount': _chatPaymentAmount,
        }),
      ).timeout(const Duration(seconds: 30));

      if (response.statusCode == 200) {
        if (mounted) {
          setState(() {
            _saving = false;
            _message = 'Settings saved successfully';
          });
        }
      } else {
        final data = json.decode(response.body);
        final msg = data['message'] ?? data['error'] ?? 'Failed to save';
        throw Exception(msg);
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _saving = false;
          _error = e.toString().replaceFirst('Exception: ', '');
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) {
      return Scaffold(
        backgroundColor: Colors.white,
        appBar: _buildAppBar(),
        body: const Center(child: CircularProgressIndicator()),
      );
    }

    return Scaffold(
      backgroundColor: Colors.white,
      appBar: _buildAppBar(),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Chat Settings',
              style: TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.bold,
                color: Color(0xFF1a202c),
              ),
            ),
            const SizedBox(height: 6),
            const Text(
              'Control the free chat experience for users and agents.',
              style: TextStyle(fontSize: 14, color: Color(0xFF718096)),
            ),
            const SizedBox(height: 24),

            // Toggle: Unlimited Free Chat
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'Unlimited Free Chat',
                        style: TextStyle(
                          fontSize: 15,
                          fontWeight: FontWeight.w600,
                          color: Color(0xFF334155),
                        ),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        _unlimitedFreeChat
                            ? 'All chats are free without time limit.'
                            : 'Free trial has a time limit.',
                        style: const TextStyle(
                          fontSize: 12,
                          color: Color(0xFF94a3b8),
                        ),
                      ),
                    ],
                  ),
                ),
                Switch(
                  value: _unlimitedFreeChat,
                  onChanged: (val) =>
                      setState(() => _unlimitedFreeChat = val),
                  activeTrackColor: const Color(0xFF0D47A1),
                ),
              ],
            ),
            const SizedBox(height: 20),

            // Duration input
            _buildLabel('Free Chat Duration (seconds)'),
            const SizedBox(height: 6),
            TextField(
              keyboardType: TextInputType.number,
              enabled: !_unlimitedFreeChat,
              decoration: InputDecoration(
                hintText: '600 (10 minutes)',
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(10),
                  borderSide: const BorderSide(color: Color(0xFFcbd5e1)),
                ),
                contentPadding:
                    const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                filled: true,
                fillColor:
                    _unlimitedFreeChat ? Colors.grey[100] : Colors.white,
              ),
              controller: TextEditingController(
                text: _freeChatDurationSeconds.toString(),
              ),
              onChanged: (val) {
                final parsed = int.tryParse(val);
                if (parsed != null) {
                  _freeChatDurationSeconds = parsed;
                }
              },
            ),
            const SizedBox(height: 20),

            // Payment amount input
            _buildLabel('Chat Payment Amount (INR)'),
            const SizedBox(height: 6),
            TextField(
              keyboardType: TextInputType.number,
              enabled: !_unlimitedFreeChat,
              decoration: InputDecoration(
                hintText: '100',
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(10),
                  borderSide: const BorderSide(color: Color(0xFFcbd5e1)),
                ),
                contentPadding:
                    const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                filled: true,
                fillColor:
                    _unlimitedFreeChat ? Colors.grey[100] : Colors.white,
              ),
              controller: TextEditingController(
                text: _chatPaymentAmount.toString(),
              ),
              onChanged: (val) {
                final parsed = int.tryParse(val);
                if (parsed != null) {
                  _chatPaymentAmount = parsed;
                }
              },
            ),
            const SizedBox(height: 28),

            // Messages
            if (_message != null)
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(12),
                margin: const EdgeInsets.only(bottom: 16),
                decoration: BoxDecoration(
                  color: const Color(0xFFd4edda),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(
                  _message!,
                  style: const TextStyle(
                    color: Color(0xFF155724),
                    fontSize: 13,
                  ),
                ),
              ),
            if (_error != null)
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(12),
                margin: const EdgeInsets.only(bottom: 16),
                decoration: BoxDecoration(
                  color: const Color(0xFFf8d7da),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(
                  _error!,
                  style: const TextStyle(
                    color: Color(0xFF721c24),
                    fontSize: 13,
                  ),
                ),
              ),

            // Save button
            SizedBox(
              width: double.infinity,
              height: 48,
              child: ElevatedButton(
                onPressed: _saving ? null : _saveSettings,
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF0D47A1),
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(10),
                  ),
                  elevation: 0,
                ),
                child: _saving
                    ? const SizedBox(
                        width: 20,
                        height: 20,
                        child: CircularProgressIndicator(
                          strokeWidth: 2,
                          valueColor:
                              AlwaysStoppedAnimation<Color>(Colors.white),
                        ),
                      )
                    : const Text(
                        'Save Settings',
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
    );
  }

  Widget _buildLabel(String text) {
    return Text(
      text,
      style: const TextStyle(
        fontSize: 15,
        fontWeight: FontWeight.w600,
        color: Color(0xFF334155),
      ),
    );
  }

  PreferredSizeWidget _buildAppBar() {
    return AppBar(
      backgroundColor: Colors.white,
      elevation: 0.5,
      title: const Text(
        'Admin Settings',
        style: TextStyle(
          color: Colors.black,
          fontWeight: FontWeight.bold,
          fontSize: 20,
        ),
      ),
    );
  }
}
