import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:email_validator/email_validator.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:firebase_messaging/firebase_messaging.dart'; // <-- Added for FCM
import 'dart:convert';
import 'dart:async';

import '../appbar/common_widgets.dart';
import '../forget_password/otp_request.dart';
import '../navigation/main_navigation_screen.dart';
import '../consultant/consultant_model.dart';
import '../consultant/consultant_navigation_screen.dart';
import '../config/app_config.dart';
import '../services/chat_socket_service.dart';
import 'guest.dart';

class AuthScreen extends StatefulWidget {
  final String role; // 'User' or 'Consultant'
  const AuthScreen({super.key, required this.role});

  @override
  State<AuthScreen> createState() => _AuthScreenState();
}

class _AuthScreenState extends State<AuthScreen> {
  final _formKey = GlobalKey<FormState>();
  late bool _isLogin;
  bool _isLoading = false;
  bool _rememberMe = false;
  bool _isPasswordVisible = false;
  bool _isConfirmPasswordVisible = false;
  String _selectedCountryCode = '+91'; // Default to India
  bool _isEmailLogin = true; // Added for login toggle

  final _nameController = TextEditingController();
  final _identifierController = TextEditingController();
  final _registerPhoneController = TextEditingController();
  final _passwordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();

  static const Duration switchAnimationDuration = Duration(milliseconds: 200);
  static const Curve switchAnimationCurve = Curves.easeOut;

  // Country codes map
  final Map<String, String> _countryCodes = {
    '+1': '🇺🇸 +1',
    '+44': '🇬🇧 +44',
    '+91': '🇮🇳 +91',
    '+61': '🇦🇺 +61',
    '+971': '🇦🇪 +971',
    '+974': '🇶🇦 +974',
    '+966': '🇸🇦 +966',
    '+965': '🇰🇼 +965',
    '+968': '🇴🇲 +968',
    '+973': '🇧🇭 +973',
    '+92': '🇵🇰 +92',
    '+880': '🇧🇩 +880',
    '+94': '🇱🇰 +94',
    '+977': '🇳🇵 +977',
    '+86': '🇨🇳 +86',
    '+81': '🇯🇵 +81',
    '+82': '🇰🇷 +82',
    '+65': '🇸🇬 +65',
    '+60': '🇲🇾 +60',
    '+62': '🇮🇩 +62',
    '+63': '🇵🇭 +63',
    '+66': '🇹🇭 +66',
    '+84': '🇻🇳 +84',
    '+358': '🇫🇮 +358',
  };

  @override
  void initState() {
    super.initState();
    _isLogin = widget.role == 'Consultant' ? true : true;
    _identifierController.addListener(_onIdentifierChanged);
  }

  void _onIdentifierChanged() {
    final text = _identifierController.text;
    if (text.isNotEmpty) {
      final isNowPhone = RegExp(r'^[0-9+]').hasMatch(text);
      if (_isEmailLogin == isNowPhone) {
        setState(() {
          _isEmailLogin = !isNowPhone;
        });
      }
    } else {
      if (!_isEmailLogin) {
        setState(() {
          _isEmailLogin = true;
        });
      }
    }
  }

  @override
  void dispose() {
    _identifierController.removeListener(_onIdentifierChanged);
    _nameController.dispose();
    _identifierController.dispose();
    _registerPhoneController.dispose();
    _passwordController.dispose();
    _confirmPasswordController.dispose();
    super.dispose();
  }

  void _switchAuthMode() {
    if (_isLoading || widget.role == 'Consultant') return;
    setState(() {
      _isLogin = !_isLogin;
      _formKey.currentState?.reset();
      _nameController.clear();
      _identifierController.clear();
      _registerPhoneController.clear();
      _passwordController.clear();
      _confirmPasswordController.clear();
      _isPasswordVisible = false;
      _isConfirmPasswordVisible = false;
      _rememberMe = false;
      _isEmailLogin = true;
    });
    FocusScope.of(context).unfocus();
  }

  void _togglePasswordVisibility() {
    setState(() {
      _isPasswordVisible = !_isPasswordVisible;
    });
  }

  void _toggleConfirmPasswordVisibility() {
    setState(() {
      _isConfirmPasswordVisible = !_isConfirmPasswordVisible;
    });
  }

  Future<void> _submit() async {
    FocusScope.of(context).unfocus();
    if (!_formKey.currentState!.validate()) return;
    _formKey.currentState!.save();
    setState(() {
      _isLoading = true;
    });
    try {
      if (_isLogin) {
        if (widget.role == 'Consultant') {
          await _performConsultantLogin();
        } else {
          await _performLogin();
        }
      } else {
        await _performRegister();
      }
    } catch (error) {
      if (mounted) {
        showErrorDialog(
            context, 'An unexpected error occurred: ${error.toString()}');
      }
    } finally {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  Future<void> _performLogin() async {
    final url = Uri.parse(AppConfig.login);
    final identifier = _identifierController.text.trim();
    final countryCode =
        _isEmailLogin ? '' : _selectedCountryCode.replaceAll('+', '');
    debugPrint(
        'Attempting Login: login_input=$identifier, country_code=$countryCode');
    try {
      final response = await http.post(url, body: {
        'login_input': identifier,
        'country_code': countryCode,
        'password': _passwordController.text,
      }).timeout(const Duration(seconds: 15));

      if (!mounted) return;
      _handleApiResponse(response, isLogin: true);
    } on TimeoutException catch (_) {
      if (mounted) showErrorDialog(context, 'Request timed out.');
    } catch (error) {
      if (mounted) {
        showErrorDialog(
            context, 'An error occurred during login: ${error.toString()}');
      }
    }
  }

  Future<void> _performConsultantLogin() async {
    final email = _identifierController.text.trim();
    final password = _passwordController.text;
    debugPrint('Attempting Consultant Login: email=$email');
    try {
      final url = Uri.parse(
          '${AppConfig.agentLogin}?useremail=${Uri.encodeComponent(email)}&password=${Uri.encodeComponent(password)}');
      final response = await http.get(url).timeout(const Duration(seconds: 15));

      if (!mounted) return;
      _handleConsultantApiResponse(response);
    } on TimeoutException catch (_) {
      if (mounted) showErrorDialog(context, 'Request timed out.');
    } catch (error) {
      if (mounted) {
        showErrorDialog(
            context, 'An error occurred during login: ${error.toString()}');
      }
    }
  }

  void _handleConsultantApiResponse(http.Response response) async {
    debugPrint("Consultant Login Response Status: ${response.statusCode}");
    debugPrint("Consultant Login Response Body Raw: >>${response.body}<<");

    if (!mounted) return;

    if (response.statusCode == 200) {
      if (response.body.trim().isEmpty) {
        showErrorDialog(context, 'Login failed: Empty response from server.');
      } else {
        try {
          final responseData = jsonDecode(response.body);
          if (responseData['status'] == 'success') {
            final consultantData =
                ConsultantData.fromJson(responseData['data']);

            await consultantData.saveToPrefs();
            await handleLoginSuccessFCM(consultantData.userId);
            await ChatSocketService().connect(
              userId: consultantData.userId,
              token: consultantData.accessToken,
            );

            debugPrint(
                "Consultant Login Successful! User ID: ${consultantData.userId}, Name: ${consultantData.name}");

            if (!mounted) return;
            Navigator.of(context).pushAndRemoveUntil(
              MaterialPageRoute(
                  builder: (ctx) => const ConsultantNavigationScreen()),
              (Route<dynamic> route) => false,
            );
          } else {
            if (mounted) {
              showErrorDialog(
                  context, responseData['message'] ?? 'Login failed.');
            }
          }
        } catch (e) {
          debugPrint("Consultant Login JSON Decode Error: $e");
          if (mounted) {
            showErrorDialog(
                context, 'Login failed: Invalid response format from server.');
          }
        }
      }
    } else {
      showErrorDialog(context,
          'Server error occurred during login (Code: ${response.statusCode}).');
    }
  }

  Future<void> _performRegister() async {
    final url = Uri.parse(AppConfig.register);
    final phoneNumber = _registerPhoneController.text.trim();
    final countryCode = _selectedCountryCode.replaceAll('+', '');
    debugPrint(
        'Attempting Register: Name=${_nameController.text.trim()}, Email=${_identifierController.text.trim()}, CountryCode=$countryCode, Phone=$phoneNumber');
    try {
      final response = await http.post(url, body: {
        'register': '1',
        'username': _nameController.text.trim(),
        'email': _identifierController.text.trim(),
        'country_code': countryCode,
        'phone': phoneNumber,
        'password': _passwordController.text
      }).timeout(const Duration(seconds: 15));
      if (!mounted) return;
      _handleApiResponse(response, isLogin: false);
    } on TimeoutException catch (_) {
      if (mounted) showErrorDialog(context, 'Request timed out.');
    } catch (error) {
      if (mounted) {
        showErrorDialog(context,
            'An error occurred during registration: ${error.toString()}');
      }
    }
  }

  // --- FCM TOKEN SAVE FUNCTION ---
  Future<void> handleLoginSuccessFCM(String userId) async {
    SharedPreferences prefs = await SharedPreferences.getInstance();
    await prefs.setString('userId', userId);

    // Get FCM Token
    String? fcmToken = await FirebaseMessaging.instance.getToken();
    debugPrint("✅ FCM Token after login: $fcmToken");

    final response = await http.post(
      Uri.parse(AppConfig.fcmToken),
      body: {
        'token': fcmToken,
        'device': 'android',
        'user_id': userId,
      },
    );
    debugPrint("📡 Token sent to server: ${response.body}");
  }
  // --- END FCM TOKEN SAVE FUNCTION ---

  // --- UPDATED Common API Response Handler ---
  void _handleApiResponse(http.Response response,
      {required bool isLogin}) async {
    final operation = isLogin ? 'Login' : 'Registration';
    debugPrint("$operation Response Status: ${response.statusCode}");
    debugPrint("$operation Response Body Raw: >>${response.body}<<");

    if (!mounted) return;

    if (response.statusCode == 200 ||
        (!isLogin && response.statusCode == 201)) {
      if (response.body.trim().isEmpty) {
        showErrorDialog(
            context, '$operation failed: Empty response from server.');
      } else {
        try {
          final responseData = jsonDecode(response.body);
          if (responseData['status'] == 'success') {
            if (isLogin) {
              final userData = responseData['data'];
                // --- SAVE USER DATA ON LOGIN SUCCESS ---
              if (userData != null && userData['user_id'] != null) {
                final prefs = await SharedPreferences.getInstance();
                final userId = userData['user_id'].toString();
                await prefs.setString('userId', userId);
                await prefs.setString('userName', userData['name'] ?? '');
                await prefs.setString('userEmail', userData['email'] ?? '');
                await prefs.setString(
                    'userPhone', (userData['phone'] ?? '').toString());
                await prefs.setString(
                    'userProfile', userData['user_profile'] ?? '');
                await prefs.setString(
                    'accessToken', userData['accessToken']?.toString() ?? '');
                // This is a real login, so clear any leftover guest session
                await prefs.setBool('is_guest', false);
                await GuestService.clearGuestSession();

                debugPrint(
                    "Login Successful! User ID: $userId saved. Profile Path: ${userData['user_profile']}");

                // --- CALL FCM TOKEN SAVE FUNCTION HERE ---
                if (mounted) await handleLoginSuccessFCM(userId);
                // --- END FCM TOKEN LOGIC ---

                // Connect real-time chat socket (React website parity)
                await ChatSocketService().connect(userId: userId, token: userData['accessToken']?.toString());

                if (!mounted) return;
                Navigator.of(context).pushAndRemoveUntil(
                  MaterialPageRoute(
                      builder: (ctx) => const MainNavigationScreen()),
                  (Route<dynamic> route) => false,
                );
              } else {
                debugPrint(
                    "Login success but user data/ID missing in response.");
                if (mounted) {
                  showErrorDialog(
                      context, 'Login failed: Invalid user data received.');
                }
              }
              // --- END SAVE USER DATA ---
            } else {
              // Registration Success
              final prefs = await SharedPreferences.getInstance();
              await prefs.setBool('is_guest', false);
              await GuestService.clearGuestSession();
              debugPrint(
                  "Registration Successful! User ID: ${responseData['user_id']}");
              if (mounted) {
                ScaffoldMessenger.of(context).showSnackBar(SnackBar(
                    content: Text(responseData['message'] ??
                        'Registration successful! Please log in.'),
                    backgroundColor: Colors.green));
              }
              setState(() {
                _isLogin = true;
                _formKey.currentState?.reset();
                _nameController.clear();
                _identifierController.clear();
                _registerPhoneController.clear();
                _passwordController.clear();
                _confirmPasswordController.clear();
                _isPasswordVisible = false;
                _isConfirmPasswordVisible = false;
                _rememberMe = false;
              });
              FocusScope.of(context).unfocus();
            }
          } else if (isLogin && responseData['status'] == 'update_required') {
            if (mounted) {
              final userData = responseData['data'] ?? {};
              _showUpdateCountryCodeDialog(userData);
            }
          } else {
            if (mounted) {
              showErrorDialog(
                  context, responseData['message'] ?? '$operation failed.');
            }
          }
        } catch (e) {
          debugPrint("$operation JSON Decode Error: $e");
          if (mounted) {
            showErrorDialog(context,
                '$operation failed: Invalid response format from server.');
          }
        }
      }
    } else {
      showErrorDialog(context,
          'Server error occurred during $operation (Code: ${response.statusCode}).');
    }
  }

  Future<void> _showUpdateCountryCodeDialog(
      Map<String, dynamic> userData) async {
    String selectedCode = '+91';
    bool isUpdating = false;

    await showDialog(
      context: context,
      barrierDismissible: false,
      builder: (BuildContext dialogContext) {
        return StatefulBuilder(
          builder: (context, setDialogState) {
            return AlertDialog(
              shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12)),
              title: const Text('Action Required',
                  style: TextStyle(fontWeight: FontWeight.bold)),
              content: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                      'Please update your country code to proceed with login:',
                      style: TextStyle(fontSize: 14)),
                  const SizedBox(height: 16),
                  Container(
                    height: 56,
                    padding: const EdgeInsets.symmetric(horizontal: 12),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: Colors.grey.shade300),
                    ),
                    child: DropdownButtonHideUnderline(
                      child: DropdownButton<String>(
                        value: selectedCode,
                        isExpanded: true,
                        icon: Icon(Icons.arrow_drop_down,
                            color: Colors.grey.shade600),
                        onChanged: isUpdating
                            ? null
                            : (String? newValue) {
                                if (newValue != null) {
                                  setDialogState(() {
                                    selectedCode = newValue;
                                  });
                                }
                              },
                        items: _countryCodes.entries.map((entry) {
                          return DropdownMenuItem<String>(
                            value: entry.key,
                            child: Text(
                              entry.value,
                              style: const TextStyle(fontSize: 14),
                            ),
                          );
                        }).toList(),
                      ),
                    ),
                  ),
                ],
              ),
              actions: [
                TextButton(
                  onPressed: isUpdating
                      ? null
                      : () => Navigator.of(dialogContext).pop(),
                  child: const Text('Cancel',
                      style: TextStyle(color: Colors.grey)),
                ),
                ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF0D47A1),
                    shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(8)),
                  ),
                  onPressed: isUpdating
                      ? null
                      : () async {
                          setDialogState(() {
                            isUpdating = true;
                          });

                          try {
                            final userId = userData['user_id'].toString();
                            final countryCode =
                                selectedCode.replaceAll('+', '');

                            final url = Uri.parse(
                                '${AppConfig.updateCountryCode}?user_id=$userId&country_code=$countryCode');
                            final response = await http
                                .get(url)
                                .timeout(const Duration(seconds: 15));

                            if (response.statusCode == 200) {
                              debugPrint(
                                  "Update Country Code Response: ${response.body}");

                              if (dialogContext.mounted) {
                                Navigator.of(dialogContext).pop();
                              }

                              if (mounted) {
                                ScaffoldMessenger.of(this.context).showSnackBar(
                                    const SnackBar(
                                        content: Text(
                                            'Country code updated! Logging you in...'),
                                        backgroundColor: Colors.green));
                                // Automatically retry login
                                _performLogin();
                              }
                            } else {
                              if (dialogContext.mounted) {
                                showErrorDialog(dialogContext,
                                    'Server error. Code: ${response.statusCode}');
                              }
                            }
                          } catch (e) {
                            if (dialogContext.mounted) {
                              showErrorDialog(
                                  dialogContext, 'An error occurred: $e');
                            }
                          } finally {
                            if (dialogContext.mounted) {
                              setDialogState(() {
                                isUpdating = false;
                              });
                            }
                          }
                        },
                  child: isUpdating
                      ? const SizedBox(
                          width: 16,
                          height: 16,
                          child: CircularProgressIndicator(
                              strokeWidth: 2, color: Colors.white))
                      : const Text('Update & Login',
                          style: TextStyle(color: Colors.white)),
                ),
              ],
            );
          },
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    const String logoPath = 'assets/ic_launcher.png';
    const double toggleHeight = 50.0;
    final bool canRegister = widget.role == 'User';

    const Color primaryColor = Color(0xFF0D47A1);
    const Color scaffoldBgColor = Color(0xFFF8F9FA);
    const Color toggleBackgroundColor = Color(0xFFE3F2FD);
    const Color inactiveTextColor = Color(0xFF0D47A1);

    return Scaffold(
      backgroundColor: scaffoldBgColor,
      appBar: buildAuthAppBar(context, logoPath),
      body: SingleChildScrollView(
        physics: const BouncingScrollPhysics(),
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 16.0),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: <Widget>[
                const SizedBox(height: 20),
                Text(
                  _isLogin
                      ? 'Welcome back!\nPlease login'
                      : 'Go ahead and set up\nyour account',
                  textAlign: TextAlign.center,
                  style: const TextStyle(
                      fontSize: 22,
                      fontWeight: FontWeight.bold,
                      color: Colors.black87,
                      height: 1.3),
                ),
                const SizedBox(height: 30),
                // --- Toggle Button or Static Text ---
                if (canRegister)
                  Container(
                    height: toggleHeight,
                    decoration: BoxDecoration(
                        color: toggleBackgroundColor,
                        borderRadius: BorderRadius.circular(toggleHeight / 2)),
                    child: LayoutBuilder(
                      builder: (context, constraints) {
                        final double sliderWidth = constraints.maxWidth / 2;
                        return Stack(
                          children: [
                            AnimatedPositioned(
                                duration: switchAnimationDuration,
                                curve: switchAnimationCurve,
                                left: _isLogin ? 4 : sliderWidth,
                                right: _isLogin ? sliderWidth : 4,
                                top: 4,
                                bottom: 4,
                                child: Container(
                                    decoration: BoxDecoration(
                                        color: primaryColor,
                                        borderRadius: BorderRadius.circular(
                                            toggleHeight / 2)))),
                            Row(
                              children: [
                                Expanded(
                                  child: GestureDetector(
                                    onTap: _isLogin ? null : _switchAuthMode,
                                    behavior: HitTestBehavior.opaque,
                                    child: Container(
                                        alignment: Alignment.center,
                                        child: Text('Login',
                                            style: TextStyle(
                                                color: _isLogin
                                                    ? Colors.white
                                                    : inactiveTextColor,
                                                fontWeight: FontWeight.bold,
                                                fontSize: 15))),
                                  ),
                                ),
                                Expanded(
                                  child: GestureDetector(
                                    onTap: !_isLogin
                                        ? null
                                        : () {
                                            // Slide to Register when tapped
                                            if (_isLogin) _switchAuthMode();
                                          },
                                    behavior: HitTestBehavior.opaque,
                                    child: Container(
                                        alignment: Alignment.center,
                                        child: Text('Register',
                                            style: TextStyle(
                                                color: !_isLogin
                                                    ? Colors.white
                                                    : inactiveTextColor,
                                                fontWeight: FontWeight.bold,
                                                fontSize: 15))),
                                  ),
                                ),
                              ],
                            ),
                          ],
                        );
                      },
                    ),
                  )
                else
                  Container(
                      height: toggleHeight,
                      alignment: Alignment.center,
                      decoration: BoxDecoration(
                          color: toggleBackgroundColor,
                          borderRadius:
                              BorderRadius.circular(toggleHeight / 2)),
                      child: const Text("Consultant Login",
                          style: TextStyle(
                              color: primaryColor,
                              fontWeight: FontWeight.bold,
                              fontSize: 16))),

                // --- NEW: Account Information Card ---

                const SizedBox(height: 16),

                // --- Form Fields ---
                AnimatedSwitcher(
                    duration: switchAnimationDuration,
                    transitionBuilder: (child, animation) => SizeTransition(
                        sizeFactor: animation,
                        child:
                            FadeTransition(opacity: animation, child: child)),
                    child: !_isLogin
                        ? Padding(
                            key: const ValueKey('nameField'),
                            padding: const EdgeInsets.only(bottom: 20.0),
                            child: buildTextField(
                              controller: _nameController,
                              label: 'Full Name',
                              hint: 'Enter your full name',
                              icon: Icons.person_outline,
                              keyboardType: TextInputType.name,
                              enabled: !_isLoading,
                              validator: (v) {
                                if (v == null || v.trim().isEmpty) {
                                  return 'Please enter your full name';
                                }
                                if (v.trim().length < 2) {
                                  return 'Name seems too short';
                                }
                                return null;
                              },
                            ),
                          )
                        : const SizedBox.shrink(key: ValueKey('nameSizedBox'))),
                AnimatedSwitcher(
                    duration: switchAnimationDuration,
                    transitionBuilder: (child, animation) => SizeTransition(
                        sizeFactor: animation,
                        child:
                            FadeTransition(opacity: animation, child: child)),
                    child: _isLogin
                        ? Padding(
                            key: const ValueKey('loginPhoneFieldRow'),
                            padding: const EdgeInsets.only(bottom: 20.0),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.stretch,
                              children: [
                                // OPTION 2: AUTO-DETECT INPUT
                                AnimatedSize(
                                  duration: switchAnimationDuration,
                                  curve: Curves.easeOut,
                                  child: Row(
                                    crossAxisAlignment:
                                        CrossAxisAlignment.start,
                                    children: [
                                      // Country Code Dropdown (only visible if it's a phone input)
                                      if (!_isEmailLogin)
                                        Padding(
                                          padding:
                                              const EdgeInsets.only(right: 12),
                                          child: Column(
                                            crossAxisAlignment:
                                                CrossAxisAlignment.start,
                                            children: [
                                              Padding(
                                                padding: const EdgeInsets.only(
                                                    left: 4, bottom: 8),
                                                child: Text(
                                                  'Code',
                                                  style: TextStyle(
                                                    fontSize: 14,
                                                    fontWeight: FontWeight.w500,
                                                    color: Colors.grey.shade700,
                                                  ),
                                                ),
                                              ),
                                              Container(
                                                height: 56,
                                                padding:
                                                    const EdgeInsets.symmetric(
                                                        horizontal: 12),
                                                decoration: BoxDecoration(
                                                  color: Colors.white,
                                                  borderRadius:
                                                      BorderRadius.circular(12),
                                                  border: Border.all(
                                                      color:
                                                          Colors.grey.shade300),
                                                ),
                                                child:
                                                    DropdownButtonHideUnderline(
                                                  child: DropdownButton<String>(
                                                    value: _selectedCountryCode,
                                                    icon: Icon(
                                                        Icons.arrow_drop_down,
                                                        color: Colors
                                                            .grey.shade600),
                                                    isDense: true,
                                                    onChanged: _isLoading
                                                        ? null
                                                        : (String? newValue) {
                                                            if (newValue !=
                                                                null) {
                                                              setState(() {
                                                                _selectedCountryCode =
                                                                    newValue;
                                                              });
                                                            }
                                                          },
                                                    items: _countryCodes.entries
                                                        .map((entry) {
                                                      return DropdownMenuItem<
                                                          String>(
                                                        value: entry.key,
                                                        child: Text(
                                                          entry.value,
                                                          style:
                                                              const TextStyle(
                                                                  fontSize: 14),
                                                        ),
                                                      );
                                                    }).toList(),
                                                  ),
                                                ),
                                              ),
                                            ],
                                          ),
                                        ),
                                      // Universal Input Field
                                      Expanded(
                                        child: buildTextField(
                                          controller: _identifierController,
                                          label: _isEmailLogin
                                              ? 'Email or Phone'
                                              : 'Phone Number',
                                          hint: 'Enter your email or phone',
                                          icon: _isEmailLogin
                                              ? Icons.person_outline
                                              : Icons.phone_outlined,
                                          keyboardType:
                                              TextInputType.emailAddress,
                                          enabled: !_isLoading,
                                          validator: (value) {
                                            if (value == null ||
                                                value.trim().isEmpty) {
                                              return 'Please enter your email or phone';
                                            }
                                            if (!_isEmailLogin) {
                                              final phoneDigits =
                                                  value.replaceAll(
                                                      RegExp(r'\D'), '');
                                              if (phoneDigits.length < 7 ||
                                                  phoneDigits.length > 15) {
                                                return 'Enter a valid phone number';
                                              }
                                            } else {
                                              if (!EmailValidator.validate(
                                                  value.trim())) {
                                                return 'Please enter a valid email address';
                                              }
                                            }
                                            return null;
                                          },
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ],
                            ),
                          )
                        : Padding(
                            key: const ValueKey('registerEmailField'),
                            padding: const EdgeInsets.only(bottom: 20.0),
                            child: buildTextField(
                              controller: _identifierController,
                              label: 'Email Address',
                              hint: 'Enter your email address',
                              icon: Icons.mail_outline,
                              keyboardType: TextInputType.emailAddress,
                              enabled: !_isLoading,
                              validator: (value) {
                                if (value == null || value.trim().isEmpty) {
                                  return 'Please enter your email';
                                }
                                if (!EmailValidator.validate(value.trim())) {
                                  return 'Please enter a valid email address';
                                }
                                return null;
                              },
                            ),
                          )),
                // const SizedBox(height: 1),
                AnimatedSwitcher(
                    duration: switchAnimationDuration,
                    transitionBuilder: (child, animation) => SizeTransition(
                        sizeFactor: animation,
                        child:
                            FadeTransition(opacity: animation, child: child)),
                    child: !_isLogin
                        ? Padding(
                            key: const ValueKey('phoneField'),
                            padding: const EdgeInsets.only(bottom: 20.0),
                            child: Row(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                // Country Code Dropdown
                                Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Padding(
                                      padding: const EdgeInsets.only(
                                          left: 4, bottom: 8),
                                      child: Text(
                                        'Code',
                                        style: TextStyle(
                                          fontSize: 14,
                                          fontWeight: FontWeight.w500,
                                          color: Colors.grey.shade700,
                                        ),
                                      ),
                                    ),
                                    Container(
                                      height: 56,
                                      padding: const EdgeInsets.symmetric(
                                          horizontal: 12),
                                      decoration: BoxDecoration(
                                        color: Colors.white,
                                        borderRadius: BorderRadius.circular(12),
                                        border: Border.all(
                                            color: Colors.grey.shade300),
                                      ),
                                      child: DropdownButtonHideUnderline(
                                        child: DropdownButton<String>(
                                          value: _selectedCountryCode,
                                          icon: Icon(Icons.arrow_drop_down,
                                              color: Colors.grey.shade600),
                                          isDense: true,
                                          onChanged: _isLoading
                                              ? null
                                              : (String? newValue) {
                                                  if (newValue != null) {
                                                    setState(() {
                                                      _selectedCountryCode =
                                                          newValue;
                                                    });
                                                  }
                                                },
                                          items: _countryCodes.entries
                                              .map((entry) {
                                            return DropdownMenuItem<String>(
                                              value: entry.key,
                                              child: Text(
                                                entry.value,
                                                style: const TextStyle(
                                                    fontSize: 14),
                                              ),
                                            );
                                          }).toList(),
                                        ),
                                      ),
                                    ),
                                  ],
                                ),
                                const SizedBox(width: 12),
                                // Phone Number Field
                                Expanded(
                                  child: buildTextField(
                                    controller: _registerPhoneController,
                                    label: 'Phone Number',
                                    hint: 'Enter phone number',
                                    icon: Icons.phone_outlined,
                                    keyboardType: TextInputType.phone,
                                    enabled: !_isLoading,
                                    validator: (v) {
                                      if (v == null || v.trim().isEmpty) {
                                        return 'Please enter your phone number';
                                      }
                                      final phoneDigits =
                                          v.replaceAll(RegExp(r'\D'), '');
                                      if (phoneDigits.length < 7 ||
                                          phoneDigits.length > 15) {
                                        return 'Enter a valid phone number';
                                      }
                                      return null;
                                    },
                                  ),
                                ),
                              ],
                            ),
                          )
                        : const SizedBox.shrink(
                            key: ValueKey('phoneSizedBox'))),
                buildTextField(
                  controller: _passwordController,
                  label: 'Password',
                  hint: _isLogin
                      ? 'Enter your password'
                      : 'Create a password (min. 6 chars)',
                  icon: Icons.lock_outline,
                  obscureText: !_isPasswordVisible,
                  enabled: !_isLoading,
                  suffixIcon: IconButton(
                      icon: Icon(
                          _isPasswordVisible
                              ? Icons.visibility_off_outlined
                              : Icons.visibility_outlined,
                          color: Colors.grey.shade600),
                      onPressed: _isLoading ? null : _togglePasswordVisibility),
                  validator: (v) {
                    if (v == null || v.isEmpty) {
                      return 'Please enter a password';
                    }
                    if (!_isLogin && v.length < 6) {
                      return 'Password must be at least 6 characters';
                    }
                    return null;
                  },
                ),
                SizedBox(height: !_isLogin ? 20 : 15),
                AnimatedSwitcher(
                    duration: switchAnimationDuration,
                    transitionBuilder: (child, animation) => SizeTransition(
                        sizeFactor: animation,
                        child:
                            FadeTransition(opacity: animation, child: child)),
                    child: !_isLogin
                        ? Padding(
                            key: const ValueKey('confirmPassField'),
                            padding: const EdgeInsets.only(bottom: 15.0),
                            child: buildTextField(
                              controller: _confirmPasswordController,
                              label: 'Confirm Password',
                              hint: 'Re-enter your password',
                              icon: Icons.lock_outline,
                              obscureText: !_isConfirmPasswordVisible,
                              enabled: !_isLoading,
                              suffixIcon: IconButton(
                                  icon: Icon(
                                      _isConfirmPasswordVisible
                                          ? Icons.visibility_off_outlined
                                          : Icons.visibility_outlined,
                                      color: Colors.grey.shade600),
                                  onPressed: _isLoading
                                      ? null
                                      : _toggleConfirmPasswordVisibility),
                              validator: (v) {
                                if (v == null || v.isEmpty) {
                                  return 'Please confirm your password';
                                }
                                if (v != _passwordController.text) {
                                  return 'Passwords do not match';
                                }
                                return null;
                              },
                            ),
                          )
                        : const SizedBox.shrink(
                            key: ValueKey('confirmPassSizedBox'))),
                AnimatedSwitcher(
                    duration: switchAnimationDuration,
                    transitionBuilder: (child, animation) =>
                        FadeTransition(opacity: animation, child: child),
                    child: _isLogin
                        ? Row(
                            key: const ValueKey('rememberForgotRow'),
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: <Widget>[
                                InkWell(
                                    onTap: _isLoading
                                        ? null
                                        : () => setState(
                                            () => _rememberMe = !_rememberMe),
                                    child: Row(
                                      mainAxisSize: MainAxisSize.min,
                                      children: <Widget>[
                                        SizedBox(
                                            height: 24.0,
                                            width: 24.0,
                                            child: Checkbox(
                                                value: _rememberMe,
                                                onChanged: _isLoading
                                                    ? null
                                                    : (v) {
                                                        if (v != null) {
                                                          setState(() =>
                                                              _rememberMe = v);
                                                        }
                                                      },
                                                activeColor: primaryColor,
                                                materialTapTargetSize:
                                                    MaterialTapTargetSize
                                                        .shrinkWrap,
                                                visualDensity:
                                                    VisualDensity.compact,
                                                side: BorderSide(
                                                    color:
                                                        Colors.grey.shade400))),
                                        const SizedBox(width: 4),
                                        Text('Remember me',
                                            style: TextStyle(
                                                color: Colors.grey.shade700,
                                                fontSize: 14))
                                      ],
                                    )),
                                TextButton(
                                    onPressed: () {
                                      Navigator.of(context).push(
                                        MaterialPageRoute(
                                          builder: (context) => EmailScreen(),
                                        ),
                                      );
                                    },
                                    style: TextButton.styleFrom(
                                        padding: EdgeInsets.zero,
                                        minimumSize: const Size(50, 30),
                                        tapTargetSize:
                                            MaterialTapTargetSize.shrinkWrap),
                                    child: const Text('Forgot password?',
                                        style: TextStyle(
                                            color: primaryColor,
                                            fontSize: 14,
                                            fontWeight: FontWeight.w500))),
                              ])
                        : const SizedBox(
                            height: 44,
                            key: ValueKey('rememberForgotSizedBox'))),
                const SizedBox(height: 0),
                ElevatedButton(
                  style: ElevatedButton.styleFrom(
                      backgroundColor: primaryColor,
                      padding: const EdgeInsets.symmetric(vertical: 15),
                      shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12.0)),
                      minimumSize: const Size(double.infinity, 50),
                      disabledBackgroundColor: primaryColor.withOpacity(0.5)),
                  onPressed: _isLoading ? null : _submit,
                  child: _isLoading
                      ? const SizedBox(
                          height: 20,
                          width: 20,
                          child: CircularProgressIndicator(
                              strokeWidth: 2.5, color: Colors.white))
                      : Text(_isLogin ? 'Login' : 'Register',
                          style: const TextStyle(
                              fontSize: 16,
                              color: Colors.white,
                              fontWeight: FontWeight.bold)),
                ),
                const SizedBox(height: 20),
                if (_isLogin && widget.role == 'User')
                  Padding(
                    padding: const EdgeInsets.only(bottom: 12.0),
                    child: GestureDetector(
                      onTap: _isLoading ? null : _switchAuthMode,
                      child: Text(
                        "Don't have an account? Register yourself now!",
                        textAlign: TextAlign.center,
                        style: const TextStyle(
                          color: Color.fromARGB(221, 0, 46, 253),
                          fontSize: 15,
                          fontWeight: FontWeight.w500,
                          // decoration: TextDecoration.underline,
                        ),
                      ),
                    ),
                  ),
                // --- Info Card ---
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: Colors.blue.shade50,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: Colors.blue.shade100, width: 1),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Icon(
                            Icons.info_outline,
                            color: Colors.blue.shade600,
                            size: 20,
                          ),
                          const SizedBox(width: 8),
                          Text(
                            _isLogin ? 'Account Access' : 'Account Options',
                            style: TextStyle(
                              fontSize: 14,
                              fontWeight: FontWeight.w600,
                              color: Colors.blue.shade700,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 8),
                      if (_isLogin) ...[
                        Text(
                          '• You can use your email or phone number from your existing AvisaExperts website account',
                          style: TextStyle(
                            fontSize: 13,
                            color: Colors.blue.shade700,
                            height: 1.4,
                          ),
                        ),
                      ] else ...[
                        Text(
                          '• Create a new mobile app account',
                          style: TextStyle(
                            fontSize: 13,
                            color: Colors.blue.shade700,
                            height: 1.4,
                          ),
                        ),
                      ],
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
