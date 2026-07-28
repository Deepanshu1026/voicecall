import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'dart:async';
import 'package:image_picker/image_picker.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'dart:io';
import 'package:logger/logger.dart';
// import '../appbar/custom_app_bar.dart';

// Initialize logger
final logger = Logger();

class EditProfileScreen extends StatefulWidget {
  const EditProfileScreen({super.key});

  @override
  _EditProfileScreenState createState() => _EditProfileScreenState();
}

class _EditProfileScreenState extends State<EditProfileScreen> {
  final _formKey = GlobalKey<FormState>();
  late final TextEditingController _nameController = TextEditingController();
  late final TextEditingController _emailController = TextEditingController();
  late final TextEditingController _phoneController = TextEditingController();
  String _initials = "?";
  bool _isLoading = true;
  String? _userId;
  File? _selectedImageFile;
  String? _existingProfileImagePath;
  final ImagePicker _picker = ImagePicker();

  @override
  void initState() {
    super.initState();
    _nameController.addListener(_updateInitials);
    _loadUserData();
  }

  Future<void> _loadUserData() async {
    if (!mounted) return;
    if (!_isLoading) {
      setState(() => _isLoading = true);
    }

    try {
      final prefs = await SharedPreferences.getInstance();
      if (!mounted) return;

      final loadedUserId = prefs.getInt('userId')?.toString();
      final loadedName = prefs.getString('userName') ?? '';
      final loadedEmail = prefs.getString('userEmail') ?? '';
      final loadedPhone = prefs.getString('userPhone') ?? '';
      final loadedImagePath = prefs.getString('userProfile');

      _nameController.text = loadedName;
      _emailController.text = loadedEmail;
      _phoneController.text = loadedPhone;
      _userId = loadedUserId;
      _existingProfileImagePath = loadedImagePath;

      logger.d(
          "EditProfile: Loaded user data - Name: $loadedName, Email: $loadedEmail, Phone: $loadedPhone, ImagePath: $loadedImagePath");

      _updateInitials();

      setState(() {
        _isLoading = false;
      });
    } catch (e, s) {
      logger.e("Error loading user data in EditProfile",
          error: e, stackTrace: s);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
              content: Text('Failed to load profile data: $e'),
              backgroundColor: Colors.red),
        );
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  void _updateInitials() {
    final name = _nameController.text.trim();
    String calculatedInitials = "";
    if (name.isNotEmpty) {
      final nameParts =
          name.split(' ').where((part) => part.isNotEmpty).toList();
      if (nameParts.isNotEmpty) {
        calculatedInitials = nameParts[0][0];
        if (nameParts.length > 1) {
          calculatedInitials += nameParts.last[0];
        }
      }
    }
    final newInitials = calculatedInitials.toUpperCase().isEmpty
        ? "?"
        : calculatedInitials.toUpperCase();
    if (_initials != newInitials) {
      if (mounted) {
        setState(() {
          _initials = newInitials;
        });
      }
    }
  }

  Future<void> _showImageSourceDialog() async {
    if (_isLoading) return;

    showModalBottomSheet(
      context: context,
      builder: (BuildContext context) {
        return SafeArea(
          child: Wrap(
            children: <Widget>[
              ListTile(
                  leading: const Icon(Icons.photo_library),
                  title: const Text('Photo Library'),
                  onTap: () {
                    _pickImage(ImageSource.gallery);
                    Navigator.of(context).pop();
                  }),
              ListTile(
                leading: const Icon(Icons.photo_camera),
                title: const Text('Camera'),
                onTap: () {
                  _pickImage(ImageSource.camera);
                  Navigator.of(context).pop();
                },
              ),
            ],
          ),
        );
      },
    );
  }

  /// ✅ Updated function (Google Play compliant)
  Future<void> _pickImage(ImageSource source) async {
    try {
      if (source == ImageSource.camera) {
        final status = await Permission.camera.request();
        if (!status.isGranted) {
          _showPermissionDeniedDialog('Camera');
          return;
        }
      }
      // 🚫 Gallery ke liye koi permission mat maango (system photo picker used)
      final XFile? pickedFile = await _picker.pickImage(
        source: source,
        imageQuality: 80,
        maxWidth: 1000,
      );

      if (pickedFile != null && mounted) {
        setState(() {
          _selectedImageFile = File(pickedFile.path);
          logger.i("Image selected: ${pickedFile.path}");
        });
      } else {
        logger.d("No image selected.");
      }
    } catch (e, s) {
      logger.e("Error picking image", error: e, stackTrace: s);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
              content: Text('Error picking image: $e'),
              backgroundColor: Colors.red),
        );
      }
    }
  }

  void _showPermissionDeniedDialog(String permissionName) {
    showDialog(
      context: context,
      builder: (BuildContext context) => AlertDialog(
        title: Text('$permissionName Permission Required'),
        content: Text(
            'To select an image, please grant $permissionName access in your device settings.'),
        actions: <Widget>[
          TextButton(
            child: const Text('Cancel'),
            onPressed: () => Navigator.of(context).pop(),
          ),
          TextButton(
            child: const Text('Open Settings'),
            onPressed: () {
              openAppSettings();
              Navigator.of(context).pop();
            },
          ),
        ],
      ),
    );
  }

  Future<void> _submitProfile() async {
    if (!_formKey.currentState!.validate()) {
      logger.w("Form validation failed.");
      return;
    }
    setState(() => _isLoading = true);

    String? errorMessage;
    http.Response? response;

    try {
      if (_userId == null) {
        throw Exception("User ID is missing. Cannot update profile.");
      }

      if (_selectedImageFile != null) {
        var request = http.MultipartRequest(
            'POST', Uri.parse('https://avisaexperts.com/appEditProfile.php'));
        request.fields['userid'] = _userId!;
        request.fields['name'] = _nameController.text.trim();
        request.fields['contact'] = _phoneController.text.trim();
        request.fields['email'] = _emailController.text.trim();

        request.files.add(await http.MultipartFile.fromPath(
            'profile', _selectedImageFile!.path));

        logger.d(
            "Submitting Profile Update (Multipart POST)... Fields: ${request.fields}");
        var streamedResponse =
            await request.send().timeout(const Duration(seconds: 30));
        response = await http.Response.fromStream(streamedResponse);
      } else {
        final url =
            Uri.parse('https://avisaexperts.com/appEditProfile.php').replace(
          queryParameters: {
            'userid': _userId,
            'name': _nameController.text.trim(),
            'contact': _phoneController.text.trim(),
            'email': _emailController.text.trim(),
          },
        );
        logger.d("Submitting Profile Update (GET) to: $url");
        response = await http.get(url).timeout(const Duration(seconds: 15));
      }

      if (!mounted) return;

      logger.d("Edit Profile API Response Status: ${response.statusCode}");
      logger.d("Edit Profile API Response Body: >>${response.body}<<");

      if (response.statusCode == 200) {
        if (response.body.trim().isEmpty) {
          errorMessage = "Empty response from server.";
          throw Exception(errorMessage);
        }
        final responseData = jsonDecode(response.body);

        if (responseData['success'] == true) {
          final prefs = await SharedPreferences.getInstance();
          await prefs.setString('userName', _nameController.text.trim());
          await prefs.setString('userEmail', _emailController.text.trim());
          // ✅ Save updated phone number
          await prefs.setString('userPhone', _phoneController.text.trim());
          await prefs.setString('phoneNumber', _phoneController.text.trim());

          String? updatedProfilePath;
          if (responseData['data'] != null &&
              responseData['data']['profile_url'] != null) {
            updatedProfilePath = responseData['data']['profile_url'];
            if (updatedProfilePath != null && updatedProfilePath.isNotEmpty) {
              await prefs.setString('userProfile', updatedProfilePath);
              logger.i(
                  "Updated userProfile in prefs (from profile_url): $updatedProfilePath");
            } else {
              await prefs.remove('userProfile');
              logger.w(
                  "Removed userProfile from prefs as API returned null/empty profile_url.");
            }
          } else if (responseData['data'] != null &&
              responseData['data']['profile'] != null) {
            updatedProfilePath = responseData['data']['profile'];
            if (updatedProfilePath != null && updatedProfilePath.isNotEmpty) {
              await prefs.setString('userProfile', updatedProfilePath);
              logger.i(
                  "Updated userProfile in prefs (from profile key): $updatedProfilePath");
            } else {
              await prefs.remove('userProfile');
              logger.w(
                  "Removed userProfile from prefs as API returned null/empty profile key.");
            }
          } else {
            logger.d("No profile image key found in API response data.");
          }

          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
                content: Text(
                    responseData['message'] ?? 'Profile updated successfully!'),
                backgroundColor: Colors.green),
          );
          if (mounted) {
            Navigator.pop(context, true);
          }
        } else {
          errorMessage =
              responseData['message'] ?? 'Update failed (API Error).';
          throw Exception(errorMessage);
        }
      } else {
        errorMessage =
            'Server error (${response.statusCode}). Could not update profile.';
        throw Exception(errorMessage);
      }
    } on TimeoutException catch (e, s) {
      errorMessage = "Request timed out. Please check your connection.";
      logger.e("Error submitting profile update: Timeout",
          error: e, stackTrace: s);
    } catch (e, s) {
      errorMessage = errorMessage ?? 'An error occurred: ${e.toString()}';
      logger.e("Error submitting profile update", error: e, stackTrace: s);
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
        if (errorMessage != null) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text(errorMessage), backgroundColor: Colors.red),
          );
        }
      }
    }
  }

  @override
  void dispose() {
    _nameController.removeListener(_updateInitials);
    _nameController.dispose();
    _emailController.dispose();
    _phoneController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return WillPopScope(
      onWillPop: () async {
        Navigator.pop(context, false);
        return false;
      },
      child: Builder(builder: (context) {
        if (_isLoading && _userId == null) {
          return Scaffold(
            appBar: AppBar(
              title: const Text('Edit Profile'),
              backgroundColor: Colors.white,
              surfaceTintColor: Colors.white,
              leading: IconButton(
                icon: const Icon(Icons.arrow_back, color: Colors.black),
                onPressed: () {
                  Navigator.pop(context, false);
                },
              ),
            ),
            body: const Center(child: CircularProgressIndicator()),
          );
        }

        // ✅ UPDATED: Handle complete URLs (Google profile URLs)
        String? fullExistingImageUrl;
        bool hasValidExistingPath = _existingProfileImagePath != null &&
            _existingProfileImagePath!.trim().isNotEmpty;
        if (hasValidExistingPath) {
          // ✅ Check if it's already a complete URL (starts with http:// or https://)
          if (_existingProfileImagePath!.startsWith('http://') ||
              _existingProfileImagePath!.startsWith('https://')) {
            // It's already a complete URL (e.g., Google profile), use as-is
            fullExistingImageUrl = _existingProfileImagePath;
          } else {
            // It's a relative path, prepend base URL
            if (BASE_IMAGE_URL.endsWith('/') &&
                _existingProfileImagePath!.startsWith('/')) {
              fullExistingImageUrl =
                  BASE_IMAGE_URL + _existingProfileImagePath!.substring(1);
            } else if (!BASE_IMAGE_URL.endsWith('/') &&
                !_existingProfileImagePath!.startsWith('/')) {
              fullExistingImageUrl =
                  '$BASE_IMAGE_URL/$_existingProfileImagePath';
            } else {
              fullExistingImageUrl =
                  BASE_IMAGE_URL + _existingProfileImagePath!;
            }
          }
        }

        return Scaffold(
          backgroundColor: const Color(0xFFF9F9F9),
          appBar: AppBar(
            backgroundColor: Colors.white,
            surfaceTintColor: Colors.white,
            elevation: 0.5,
            leading: IconButton(
              icon: const Icon(Icons.arrow_back_ios,
                  color: Colors.black, size: 20),
              onPressed: () {
                Navigator.pop(context, false);
              },
            ),
            title: const Text(
              'Edit Profile',
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
                padding:
                    const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
                child: Form(
                  key: _formKey,
                  child: Column(
                    children: [
                      const SizedBox(height: 20),
                      Stack(
                        alignment: Alignment.bottomRight,
                        children: [
                          CircleAvatar(
                            radius: 55,
                            backgroundColor: Colors.blue.shade700,
                            backgroundImage: _selectedImageFile != null
                                ? FileImage(_selectedImageFile!)
                                : (hasValidExistingPath &&
                                        fullExistingImageUrl != null
                                    ? CachedNetworkImageProvider(
                                        fullExistingImageUrl)
                                    : null) as ImageProvider?,
                            child: (_selectedImageFile == null &&
                                    (!hasValidExistingPath ||
                                        fullExistingImageUrl == null))
                                ? Text(_initials,
                                    style: const TextStyle(
                                        color: Colors.white,
                                        fontSize: 30,
                                        fontWeight: FontWeight.bold))
                                : null,
                          ),
                          GestureDetector(
                            onTap: _isLoading ? null : _showImageSourceDialog,
                            child: CircleAvatar(
                              radius: 16,
                              backgroundColor: Colors.blue.shade900,
                              child: const Icon(Icons.edit,
                                  color: Colors.white, size: 16),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 30),
                      _buildTextField(
                        controller: _nameController,
                        label: 'Full Name',
                        hint: 'Enter your full name',
                        icon: Icons.person_outline,
                        validator: (value) {
                          if (value == null || value.trim().isEmpty) {
                            return 'Please enter your full name';
                          }
                          if (value.trim().length < 2) {
                            return 'Name must be at least 2 characters';
                          }
                          return null;
                        },
                      ),
                      const SizedBox(height: 20),
                      _buildTextField(
                        controller: _emailController,
                        label: 'Email',
                        hint: 'Enter your email address',
                        icon: Icons.mail_outline,
                        keyboardType: TextInputType.emailAddress,
                        validator: (value) {
                          if (value == null || value.trim().isEmpty) {
                            return 'Please enter your email address';
                          }
                          if (!RegExp(
                                  r'^.+@[a-zA-Z]+\.{1}[a-zA-Z]+(\.{0,1}[a-zA-Z]+)$')
                              .hasMatch(value)) {
                            return 'Invalid email format';
                          }
                          return null;
                        },
                      ),
                      const SizedBox(height: 20),
                      _buildTextField(
                        controller: _phoneController,
                        label: 'Phone Number',
                        hint: 'Enter your phone number',
                        icon: Icons.phone_outlined,
                        keyboardType: TextInputType.phone,
                        readOnly:
                            false, // ✅ Changed from true to false - allow editing
                        validator: (value) {
                          if (value == null || value.trim().isEmpty) {
                            return 'Please enter your phone number';
                          }
                          if (value.replaceAll(RegExp(r'\D'), '').length < 10) {
                            return 'Invalid phone number format';
                          }
                          return null;
                        },
                      ),
                      const SizedBox(height: 40),
                      SizedBox(
                        width: double.infinity,
                        height: 50,
                        child: ElevatedButton(
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Colors.blue.shade900,
                            shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(12)),
                            disabledBackgroundColor: Colors.blue.shade200,
                          ),
                          onPressed: _isLoading ? null : _submitProfile,
                          child: const Text('Save Changes',
                              style:
                                  TextStyle(fontSize: 16, color: Colors.white)),
                        ),
                      ),
                      const SizedBox(height: 20),
                    ],
                  ),
                ),
              ),
              if (_isLoading && _userId != null)
                Container(
                  color: Colors.black.withOpacity(0.5),
                  child: const Center(
                      child: CircularProgressIndicator(color: Colors.white)),
                ),
            ],
          ),
        );
      }),
    );
  }

  Widget _buildTextField({
    required TextEditingController controller,
    required String label,
    required String hint,
    required IconData icon,
    TextInputType keyboardType = TextInputType.text,
    String? Function(String?)? validator,
    bool obscureText = false,
    bool readOnly = false,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label,
            style: const TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w600,
                color: Colors.black87)),
        const SizedBox(height: 8),
        TextFormField(
          controller: controller,
          keyboardType: keyboardType,
          obscureText: obscureText,
          readOnly: readOnly,
          decoration: InputDecoration(
            prefixIcon: Icon(icon, color: Colors.grey.shade600),
            hintText: hint,
            hintStyle: TextStyle(color: Colors.grey.shade500),
            filled: true,
            fillColor: Colors.white,
            contentPadding:
                const EdgeInsets.symmetric(vertical: 16, horizontal: 12),
            border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: BorderSide.none),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: BorderSide(color: Colors.grey.shade300, width: 1),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: BorderSide(color: Colors.blue.shade900, width: 1.5),
            ),
          ),
          validator: validator,
        ),
      ],
    );
  }
}

const String BASE_IMAGE_URL = "https://avisaexperts.com/";
