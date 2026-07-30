import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:image_picker/image_picker.dart';
import 'dart:io';
import 'package:flutter_image_compress/flutter_image_compress.dart';
import 'package:path_provider/path_provider.dart';
import 'package:path/path.dart' as path;
import 'guest-to-user.dart';

class GuestConversionDialog extends StatefulWidget {
  const GuestConversionDialog({super.key});

  @override
  State<GuestConversionDialog> createState() => _GuestConversionDialogState();
}

class _GuestConversionDialogState extends State<GuestConversionDialog>
    with SingleTickerProviderStateMixin {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _phoneController = TextEditingController();
  final _passwordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();

  bool _isLoading = false;
  bool _obscurePassword = true;
  bool _obscureConfirmPassword = true;
  String _selectedCountryCode = '+91';

  File? _selectedImage;
  final ImagePicker _imagePicker = ImagePicker();

  late AnimationController _animationController;
  late Animation<double> _fadeAnimation;
  late Animation<Offset> _slideAnimation;

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
    _loadGuestData();

    _animationController = AnimationController(
      duration: const Duration(milliseconds: 500),
      vsync: this,
    );

    _fadeAnimation = CurvedAnimation(
      parent: _animationController,
      curve: Curves.easeIn,
    );

    _slideAnimation = Tween<Offset>(
      begin: const Offset(0, 0.08),
      end: Offset.zero,
    ).animate(CurvedAnimation(
      parent: _animationController,
      curve: Curves.easeOut,
    ));

    _animationController.forward();
  }

  @override
  void dispose() {
    _animationController.dispose();
    _nameController.dispose();
    _phoneController.dispose();
    _passwordController.dispose();
    _confirmPasswordController.dispose();
    super.dispose();
  }

  Future<void> _loadGuestData() async {
    final prefs = await SharedPreferences.getInstance();
    final guestName =
        prefs.getString('user_name') ?? prefs.getString('userName') ?? '';
    if (guestName.isNotEmpty && mounted) {
      setState(() {
        _nameController.text = guestName;
      });
    }
  }

  Future<void> _pickImage() async {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) => SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(vertical: 20),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Text(
                'Choose Profile Photo',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 16),
              ListTile(
                leading: const Icon(Icons.camera_alt, color: Color(0xFF212121)),
                title: const Text('Take Photo'),
                onTap: () async {
                  Navigator.pop(context);
                  await _getImage(ImageSource.camera);
                },
              ),
              ListTile(
                leading:
                    const Icon(Icons.photo_library, color: Color(0xFF212121)),
                title: const Text('Choose from Gallery'),
                onTap: () async {
                  Navigator.pop(context);
                  await _getImage(ImageSource.gallery);
                },
              ),
              if (_selectedImage != null)
                ListTile(
                  leading: const Icon(Icons.delete, color: Colors.red),
                  title: const Text('Remove Photo'),
                  onTap: () {
                    Navigator.pop(context);
                    setState(() => _selectedImage = null);
                  },
                ),
            ],
          ),
        ),
      ),
    );
  }

  Future<void> _getImage(ImageSource source) async {
    try {
      final XFile? pickedFile = await _imagePicker.pickImage(
        source: source,
        maxWidth: 1024,
        maxHeight: 1024,
        imageQuality: 85,
      );

      if (pickedFile != null) {
        // Compress and convert image to ensure it's a valid format
        final compressedFile = await _compressImage(File(pickedFile.path));

        if (compressedFile != null) {
          setState(() {
            _selectedImage = compressedFile;
          });
        } else {
          _showSnackBar('Failed to process image', isError: true);
        }
      }
    } catch (e) {
      _showSnackBar('Failed to pick image: $e', isError: true);
    }
  }

  Future<File?> _compressImage(File file) async {
    try {
      // Get temporary directory
      final dir = await getTemporaryDirectory();
      final targetPath = path.join(
        dir.path,
        'profile_${DateTime.now().millisecondsSinceEpoch}.jpg',
      );

      // Compress image as JPEG
      final result = await FlutterImageCompress.compressAndGetFile(
        file.absolute.path,
        targetPath,
        quality: 85,
        format: CompressFormat.jpeg,
      );

      return result != null ? File(result.path) : null;
    } catch (e) {
      print('Error compressing image: $e');
      return file; // Return original file if compression fails
    }
  }

  Future<void> _handleConversion() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isLoading = true);

    try {
      // Uncomment and modify the following to use your actual service
      final prefs = await SharedPreferences.getInstance();
      final dynamic userIdValue = prefs.get('user_id') ?? prefs.get('userId');
      final String? userId = userIdValue is String
          ? userIdValue
          : (userIdValue is int ? userIdValue.toString() : null);
      if (userId == null) {
        if (mounted) {
          _showSnackBar('Error: Could not find your guest profile.',
              isError: true);
        }
        setState(() => _isLoading = false);
        return;
      }

      final result = await GuestConversionService.convertGuestToUser(
        guestUserId: userId,
        name: _nameController.text.trim(),
        countryCode: _selectedCountryCode.replaceAll('+', ''),
        phone: _phoneController.text.trim(),
        password: _passwordController.text,
        profileImage: _selectedImage,
      );

      if (!mounted) return;

      setState(() => _isLoading = false);

      if (result['success'] == true) {
        // Update local storage with profile image path if available
        if (result['user_profile'] != null &&
            result['user_profile'].toString().isNotEmpty) {
          final prefs = await SharedPreferences.getInstance();
          await prefs.setString(
              'user_profile', result['user_profile'] as String);
        }

        Navigator.of(context).pop(true);
        _showSnackBar(result['message'] as String, isError: false);
      } else {
        _showSnackBar(result['message'] as String, isError: true);
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isLoading = false);
        _showSnackBar('An error occurred: $e', isError: true);
      }
    }
  }

  void _showSnackBar(String message, {required bool isError}) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(
          message,
          style: const TextStyle(
              color: Colors.white, fontWeight: FontWeight.w600, fontSize: 14),
        ),
        backgroundColor:
            isError ? const Color(0xFFD32F2F) : const Color(0xFF2E7D32),
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
        margin: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Dialog(
      backgroundColor: Colors.transparent,
      insetPadding: const EdgeInsets.all(20),
      child: FadeTransition(
        opacity: _fadeAnimation,
        child: SlideTransition(
          position: _slideAnimation,
          child: Stack(
            clipBehavior: Clip.none,
            alignment: Alignment.topCenter,
            children: [
              Container(
                margin: const EdgeInsets.only(top: 32), // Space for the icon
                padding: const EdgeInsets.fromLTRB(
                    24, 60, 24, 28), // Top padding to make space for icon
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(24),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.08),
                      blurRadius: 30,
                      offset: const Offset(0, 10),
                    )
                  ],
                ),
                child: SingleChildScrollView(
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      // Header Text
                      const Text(
                        "Create Your Account",
                        style: TextStyle(
                            fontSize: 22,
                            fontWeight: FontWeight.bold,
                            color: Color(0xFF212121)),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        "Unlock full access by creating a permanent account.",
                        textAlign: TextAlign.center,
                        style: TextStyle(
                            fontSize: 15,
                            color: Colors.grey.shade600,
                            height: 1.4),
                      ),
                      const SizedBox(height: 28),

                      // Form
                      Form(
                        key: _formKey,
                        child: Column(
                          children: [
                            _buildClassicTextField(
                              controller: _nameController,
                              label: "Full Name",
                              hint: "John Doe",
                              icon: Icons.person_outline_rounded,
                              validator: (v) => v == null || v.isEmpty
                                  ? "Please enter your name"
                                  : null,
                            ),
                            const SizedBox(height: 16),
                            Row(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                // Country Code Dropdown
                                Container(
                                  height: 56, // matches textbook general height
                                  padding: const EdgeInsets.symmetric(
                                      horizontal: 10),
                                  decoration: BoxDecoration(
                                    color: Colors.grey.shade50,
                                    borderRadius: BorderRadius.circular(14),
                                    border: Border.all(
                                        color: Colors.grey.shade300,
                                        width: 1.5),
                                  ),
                                  child: Center(
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
                                        items:
                                            _countryCodes.entries.map((entry) {
                                          return DropdownMenuItem<String>(
                                            value: entry.key,
                                            child: Text(
                                              entry.value,
                                              style: const TextStyle(
                                                fontSize: 14,
                                                color: Color(0xFF212121),
                                                fontWeight: FontWeight.w500,
                                              ),
                                            ),
                                          );
                                        }).toList(),
                                      ),
                                    ),
                                  ),
                                ),
                                const SizedBox(width: 12),
                                // Phone Number Field
                                Expanded(
                                  child: _buildClassicTextField(
                                    controller: _phoneController,
                                    label: "Phone Number",
                                    hint: "Mobile number",
                                    icon: Icons.phone_outlined,
                                    keyboardType: TextInputType.phone,
                                    validator: (v) {
                                      if (v == null || v.isEmpty) {
                                        return "Please enter your phone";
                                      }
                                      final phoneDigits =
                                          v.replaceAll(RegExp(r'\D'), '');
                                      if (phoneDigits.length < 7 ||
                                          phoneDigits.length > 15) {
                                        return "Enter a valid phone number";
                                      }
                                      return null;
                                    },
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 16),
                            _buildClassicTextField(
                              controller: _passwordController,
                              label: "Password",
                              hint: "Minimum 6 characters",
                              icon: Icons.lock_outline_rounded,
                              obscure: _obscurePassword,
                              suffix: _buildTogglePasswordVisibility(
                                () => setState(
                                    () => _obscurePassword = !_obscurePassword),
                                _obscurePassword,
                              ),
                              validator: (v) {
                                if (v == null || v.isEmpty) {
                                  return "Please set a password";
                                }
                                if (v.length < 6) {
                                  return "Password is too short";
                                }
                                return null;
                              },
                            ),
                            const SizedBox(height: 16),
                            _buildClassicTextField(
                              controller: _confirmPasswordController,
                              label: "Confirm Password",
                              hint: "Re-enter your password",
                              icon: Icons.lock_outline_rounded,
                              obscure: _obscureConfirmPassword,
                              suffix: _buildTogglePasswordVisibility(
                                () => setState(() => _obscureConfirmPassword =
                                    !_obscureConfirmPassword),
                                _obscureConfirmPassword,
                              ),
                              validator: (v) => v != _passwordController.text
                                  ? "Passwords do not match"
                                  : null,
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 32),

                      // Action Buttons
                      SizedBox(
                        width: double.infinity,
                        height: 52,
                        child: ElevatedButton(
                          onPressed: _isLoading ? null : _handleConversion,
                          style: ElevatedButton.styleFrom(
                            backgroundColor: const Color(0xFF212121),
                            foregroundColor: Colors.white,
                            shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(12)),
                            elevation: 0,
                          ),
                          child: _isLoading
                              ? const SizedBox(
                                  width: 22,
                                  height: 22,
                                  child: CircularProgressIndicator(
                                      strokeWidth: 2.5, color: Colors.white))
                              : const Text("Upgrade Account",
                                  style: TextStyle(
                                      fontSize: 16,
                                      fontWeight: FontWeight.bold)),
                        ),
                      ),
                      const SizedBox(height: 10),
                      TextButton(
                        onPressed: _isLoading
                            ? null
                            : () => Navigator.pop(context, false),
                        style: TextButton.styleFrom(
                          foregroundColor: Colors.grey.shade700,
                          shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(10)),
                        ),
                        child: const Text("Remind Me Later",
                            style: TextStyle(
                                fontSize: 14, fontWeight: FontWeight.w600)),
                      ),
                    ],
                  ),
                ),
              ),

              // Header Icon with Photo Picker
              Positioned(
                top: 0,
                child: GestureDetector(
                  onTap: _pickImage,
                  child: Stack(
                    children: [
                      Container(
                        width: 64,
                        height: 64,
                        decoration: BoxDecoration(
                          color: Colors.white,
                          shape: BoxShape.circle,
                          border:
                              Border.all(color: Colors.grey.shade200, width: 4),
                          image: _selectedImage != null
                              ? DecorationImage(
                                  image: FileImage(_selectedImage!),
                                  fit: BoxFit.cover,
                                )
                              : null,
                        ),
                        child: _selectedImage == null
                            ? Icon(Icons.person_add_outlined,
                                color: Colors.grey.shade600, size: 30)
                            : null,
                      ),
                      Positioned(
                        bottom: 0,
                        right: 0,
                        child: Container(
                          width: 24,
                          height: 24,
                          decoration: BoxDecoration(
                            color: const Color(0xFF212121),
                            shape: BoxShape.circle,
                            border: Border.all(color: Colors.white, width: 2),
                          ),
                          child: const Icon(
                            Icons.camera_alt,
                            color: Colors.white,
                            size: 12,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),

              // Close Button
              Positioned(
                top: 40,
                right: 8,
                child: IconButton(
                  icon:
                      Icon(Icons.close, color: Colors.grey.shade500, size: 22),
                  onPressed: () => Navigator.of(context).pop(),
                  tooltip: 'Close',
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildTogglePasswordVisibility(
      VoidCallback onPressed, bool isObscured) {
    return IconButton(
      icon: Icon(
          isObscured
              ? Icons.visibility_off_outlined
              : Icons.visibility_outlined,
          color: Colors.grey.shade500),
      onPressed: onPressed,
    );
  }

  Widget _buildClassicTextField({
    required TextEditingController controller,
    required String label,
    required String hint,
    required IconData icon,
    bool obscure = false,
    Widget? suffix,
    TextInputType? keyboardType,
    String? Function(String?)? validator,
  }) {
    return TextFormField(
      controller: controller,
      obscureText: obscure,
      validator: validator,
      keyboardType: keyboardType,
      style: const TextStyle(
          color: Color(0xFF212121), fontWeight: FontWeight.w500, fontSize: 15),
      decoration: InputDecoration(
        labelText: label,
        hintText: hint,
        prefixIcon: Icon(icon, color: Colors.grey.shade500, size: 22),
        suffixIcon: suffix,
        filled: true,
        fillColor: Colors.grey.shade50,
        contentPadding:
            const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
        border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(14),
            borderSide: BorderSide(color: Colors.grey.shade300)),
        enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(14),
            borderSide: BorderSide(color: Colors.grey.shade300, width: 1.5)),
        focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(14),
            borderSide: const BorderSide(color: Color(0xFF212121), width: 2.0)),
        errorBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(14),
            borderSide: BorderSide(color: Colors.red.shade400, width: 1.5)),
        labelStyle: TextStyle(
            color: Colors.grey.shade600,
            fontWeight: FontWeight.w500,
            fontSize: 15),
        hintStyle: TextStyle(color: Colors.grey.shade400),
        errorStyle: const TextStyle(fontSize: 12, fontWeight: FontWeight.w500),
      ),
    );
  }
}
