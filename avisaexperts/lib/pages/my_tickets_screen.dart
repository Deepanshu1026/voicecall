import 'package:flutter/material.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import 'package:flutter/services.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'dart:async';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:intl/intl.dart';
import 'package:image_picker/image_picker.dart';
import 'package:qr_flutter/qr_flutter.dart';
import 'package:path/path.dart' as path;
import 'package:url_launcher/url_launcher.dart';
import '../models/app_notifiers.dart';
import '../widget/chatbox.dart';
import '../config/app_config.dart';

class AppointmentTicket {
  final String referenceId;
  final String plan;
  final String name;
  final String datetime;
  final String time;
  final String mode;
  final String? endTime;
  final String address;
  final String status;
  final DateTime? submissionTime;
  final String? uploadedScreenshotUrl;

  AppointmentTicket({
    required this.referenceId,
    required this.plan,
    required this.name,
    required this.datetime,
    required this.time,
    required this.mode,
    this.endTime,
    required this.address,
    required this.status,
    this.submissionTime,
    this.uploadedScreenshotUrl,
  });

  factory AppointmentTicket.fromJson(Map<String, dynamic> json) {
    DateTime? parsedSubmissionTime;
    if (json['submission_time'] is String) {
      try {
        parsedSubmissionTime =
            DateFormat('yyyy-MM-dd HH:mm:ss').parse(json['submission_time']);
      } catch (e) {
        // Silent error handling
      }
    }

    String? screenshotUrl;
    if (json['screenshot'] != null &&
        json['screenshot'].toString().isNotEmpty) {
      String rawUrl = json['screenshot'].toString();
      if (rawUrl.startsWith('http://') || rawUrl.startsWith('https://')) {
        screenshotUrl = rawUrl;
      } else {
        screenshotUrl = '${AppConfig.staticAssetBase}/$rawUrl';
      }
    }

    return AppointmentTicket(
      referenceId: json['reference_id']?.toString() ?? 'N/A',
      plan: json['selected_plan']?.toString() ?? 'Unknown Plan',
      name: json['name']?.toString() ?? 'N/A',
      datetime: json['date']?.toString() ?? '',
      time: json['time_slot']?.toString() ?? '',
      mode: json['mode']?.toString() ?? 'unknown',
      endTime: json['end_time']?.toString(),
      address: json['address']?.toString() ?? '',
      status: json['meeting_confirm']?.toString() ?? 'unknown',
      submissionTime: parsedSubmissionTime,
      uploadedScreenshotUrl: screenshotUrl,
    );
  }

  AppointmentTicket copyWith({
    String? referenceId,
    String? plan,
    String? name,
    String? datetime,
    String? time,
    String? mode,
    String? endTime,
    String? address,
    String? status,
    DateTime? submissionTime,
    String? uploadedScreenshotUrl,
  }) {
    return AppointmentTicket(
      referenceId: referenceId ?? this.referenceId,
      plan: plan ?? this.plan,
      name: name ?? this.name,
      datetime: datetime ?? this.datetime,
      time: time ?? this.time,
      mode: mode ?? this.mode,
      endTime: endTime ?? this.endTime,
      address: address ?? this.address,
      status: status ?? this.status,
      submissionTime: submissionTime ?? this.submissionTime,
      uploadedScreenshotUrl:
          uploadedScreenshotUrl ?? this.uploadedScreenshotUrl,
    );
  }

  String get formattedDate {
    if (datetime.isEmpty) return 'N/A';
    try {
      final date = DateFormat('yyyy-MM-dd').parse(datetime);
      return DateFormat('MMMM dd, yyyy').format(date);
    } on FormatException {
      return datetime;
    } catch (e) {
      return datetime;
    }
  }

  String get formattedTime {
    if (time.isEmpty) return 'N/A';
    return time;
  }

  Map<String, dynamic> get statusDisplay {
    String text = status.toLowerCase();
    Color color = Colors.grey.shade600;
    IconData icon = Icons.help_outline;
    switch (text) {
      case 'confirmed':
        color = Colors.green.shade700;
        icon = Icons.check_circle_outline_rounded;
        text = 'Confirmed';
        break;
      case 'pending':
        color = Colors.orange.shade700;
        icon = Icons.pending_actions_rounded;
        text = 'Pending';
        break;
      case 'completed':
        color = Colors.blue.shade700;
        icon = Icons.task_alt_rounded;
        text = 'Completed';
        break;
      case 'cancelled':
      case 'canceled':
        color = Colors.red.shade700;
        icon = Icons.cancel_outlined;
        text = 'Cancelled';
        break;
      default:
        text = status.isNotEmpty
            ? status[0].toUpperCase() + status.substring(1)
            : 'Unknown';
    }
    return {'text': text, 'color': color, 'icon': icon};
  }
}

class MyTicketsScreen extends StatefulWidget {
  const MyTicketsScreen({super.key});

  @override
  State<MyTicketsScreen> createState() => MyTicketsScreenState();
}

class MyTicketsScreenState extends State<MyTicketsScreen> {
  List<AppointmentTicket> _tickets = [];
  bool _isLoading = true;
  String? _errorMessage;
  String? _userId;

  @override
  void initState() {
    super.initState();
    _loadUserIdAndFetchTickets();
  }

  Future<void> _loadUserIdAndFetchTickets() async {
    if (!mounted) return;
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });
    try {
      final prefs = await SharedPreferences.getInstance();
      final dynamic storedUserIdValue = prefs.get(USER_ID_PREFS_KEY);
      String? storedUserId;
      if (storedUserIdValue is int) {
        storedUserId = storedUserIdValue.toString();
      } else if (storedUserIdValue is String) {
        storedUserId = storedUserIdValue;
      }

      if (storedUserId == null || storedUserId.isEmpty) {
        if (mounted) {
          setState(() {
            _errorMessage = "User ID not found. Please log in again.";
            _isLoading = false;
            _tickets = [];
            if (ticketCountNotifier.value != 0) ticketCountNotifier.value = 0;
          });
        }
        return;
      }
      _userId = storedUserId;
      await _fetchMyTickets();
    } catch (e) {
      if (mounted) {
        setState(() {
          _errorMessage = "Failed to load user data. Please try again.";
          _isLoading = false;
          _tickets = [];
          if (ticketCountNotifier.value != 0) ticketCountNotifier.value = 0;
        });
      }
    }
  }

  Future<void> _fetchMyTickets() async {
    if (_userId == null) {
      if (mounted) {
        setState(() {
          _errorMessage = "User ID missing.";
          _isLoading = false;
          if (ticketCountNotifier.value != 0) ticketCountNotifier.value = 0;
        });
      }
      return;
    }
    if (!mounted) return;
    if (!_isLoading) {
      setState(() {
        _isLoading = true;
        _errorMessage = null;
      });
    }

    final url = Uri.parse(AppConfig.tickets);

    try {
      final response = await http.post(
        url,
        body: {'user_id': _userId},
      ).timeout(const Duration(seconds: 20));
      if (!mounted) return;

      if (response.statusCode != 200) {
        throw Exception('Server error (${response.statusCode})');
      }
      if (response.body.trim().isEmpty) {
        if (mounted) {
          setState(() {
            _tickets = [];
            _isLoading = false;
            _errorMessage = null;
            if (ticketCountNotifier.value != 0) ticketCountNotifier.value = 0;
          });
        }
        return;
      }

      final decodedResponse = jsonDecode(response.body);

      if (decodedResponse is Map<String, dynamic>) {
        int serverReportedCount = 0;
        bool countKeyExistsAndValid = decodedResponse.containsKey('count') &&
            decodedResponse['count'] is int;

        if (countKeyExistsAndValid) {
          serverReportedCount = decodedResponse['count'] as int;
        }

        List<AppointmentTicket> fetchedTickets = [];
        if (decodedResponse['data'] is List) {
          final List<dynamic> ticketDataList = decodedResponse['data'];
          int parseErrors = 0;
          for (var jsonItem in ticketDataList) {
            try {
              if (jsonItem is Map<String, dynamic>) {
                fetchedTickets.add(AppointmentTicket.fromJson(jsonItem));
              } else {
                parseErrors++;
              }
            } catch (e) {
              parseErrors++;
            }
          }
          fetchedTickets.sort((a, b) {
            if (a.submissionTime == null && b.submissionTime == null) return 0;
            if (a.submissionTime == null) return 1;
            if (b.submissionTime == null) return -1;
            return b.submissionTime!.compareTo(a.submissionTime!);
          });
          if (parseErrors > 0) {
            _errorMessage = 'Some ticket data might be invalid.';
          } else {
            _errorMessage = null;
          }
        } else if (!countKeyExistsAndValid && decodedResponse['data'] == null) {
          _errorMessage = null;
        } else if (decodedResponse['data'] != null &&
            decodedResponse['data'] is! List) {
          throw Exception("Invalid data structure: 'data' is not a list.");
        }

        final int countToUseForNotifier = serverReportedCount;
        if (ticketCountNotifier.value != countToUseForNotifier) {
          ticketCountNotifier.value = countToUseForNotifier;
        }

        setState(() {
          _tickets = fetchedTickets;
          _isLoading = false;
        });
      } else {
        throw Exception("Invalid response format: Expected a JSON object.");
      }
    } catch (e) {
      if (mounted) {
        String errorMsg = "Could not load tickets.";
        if (e is TimeoutException) {
          errorMsg =
              "Request timed out. Please check your internet connection.";
        } else if (e is http.ClientException) {
          errorMsg = "Network error. Please try again.";
        } else {
          errorMsg = e.toString().length > 100
              ? "An unexpected error occurred."
              : e.toString();
        }
        setState(() {
          _errorMessage = errorMsg;
          _isLoading = false;
          _tickets = [];
        });
        if (ticketCountNotifier.value != 0) {
          ticketCountNotifier.value = 0;
        }
      }
    }
  }

  Future<void> _launchSocialUrl(String urlString) async {
    final Uri url = Uri.parse(urlString);
    if (!await launchUrl(url)) {
      print('Could not launch $urlString');
    }
  }

  void refreshTickets() {
    _loadUserIdAndFetchTickets();
  }

  void updateTicketAfterUpload(String ticketId, String screenshotUrl) {
    setState(() {
      final index =
          _tickets.indexWhere((ticket) => ticket.referenceId == ticketId);
      if (index != -1) {
        _tickets[index] =
            _tickets[index].copyWith(uploadedScreenshotUrl: screenshotUrl);
      }
    });
  }

  Widget _buildBody() {
    if (_isLoading) {
      return const Center(child: CircularProgressIndicator());
    }
    if (_errorMessage != null) {
      return Center(
          child: Container(
        margin: const EdgeInsets.all(20),
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 30),
        decoration: BoxDecoration(
            color: Colors.red.shade50,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: Colors.red.shade200, width: 1.5)),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.warning_amber_rounded,
                color: Colors.red.shade600, size: 45),
            const SizedBox(height: 16),
            Text('Oops!',
                style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: Colors.red.shade800)),
            const SizedBox(height: 8),
            Text(
              _errorMessage!,
              textAlign: TextAlign.center,
              style: TextStyle(color: Colors.red.shade700, fontSize: 15),
            ),
            const SizedBox(height: 20),
            ElevatedButton.icon(
                icon: const Icon(Icons.refresh, size: 18),
                label: const Text('Try Again'),
                onPressed: _isLoading ? null : _loadUserIdAndFetchTickets,
                style: ElevatedButton.styleFrom(
                    foregroundColor: Colors.white,
                    backgroundColor: Colors.red.shade600,
                    padding: const EdgeInsets.symmetric(
                        horizontal: 20, vertical: 10)))
          ],
        ),
      ));
    }
    if (_tickets.isEmpty) {
      return Center(
          child: Opacity(
        opacity: 0.7,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.confirmation_number_outlined,
                size: 70, color: Colors.grey.shade400),
            const SizedBox(height: 20),
            Text(
              'No Appointments Yet',
              style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.w600,
                  color: Colors.grey.shade700),
            ),
            const SizedBox(height: 8),
            Text(
              'Your booked appointments will appear here.',
              style: TextStyle(fontSize: 14, color: Colors.grey.shade600),
            ),
            const SizedBox(height: 20),
            Text(
              '(Pull down to refresh)',
              style: TextStyle(fontSize: 12, color: Colors.grey.shade500),
            ),
          ],
        ),
      ));
    }
    return RefreshIndicator(
      onRefresh: _loadUserIdAndFetchTickets,
      child: ListView.builder(
        padding: const EdgeInsets.symmetric(vertical: 12.0, horizontal: 16.0),
        itemCount: _tickets.length,
        itemBuilder: (context, index) {
          return _TicketCard(
            ticket: _tickets[index],
            onScreenshotUploaded: updateTicketAfterUpload,
          );
        },
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        backgroundColor: const Color.fromARGB(255, 255, 255, 255),
        leading: IconButton(
          icon: Icon(Icons.arrow_back_ios, color: Colors.black, size: 20),
          onPressed: () => Navigator.pop(context),
        ),
        title: Text(
          'My Appointments',
          style: TextStyle(
            color: Colors.black,
            fontSize: 18,
            fontWeight: FontWeight.w600,
          ),
        ),
        centerTitle: true,
      ),
      backgroundColor: Colors.grey.shade100,
      body: Stack(
        children: [
          Column(
            children: [
              Expanded(
                child: _buildBody(),
              ),
              Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        IconButton(
                          icon: const Icon(FontAwesomeIcons.instagram,
                              color: Colors.pink, size: 20),
                          onPressed: () => _launchSocialUrl(
                              'https://www.instagram.com/avisaexpert/'),
                        ),
                        const SizedBox(width: 16),
                        IconButton(
                          icon: const Icon(FontAwesomeIcons.facebook,
                              color: Colors.blue, size: 20),
                          onPressed: () => _launchSocialUrl(
                              'https://www.facebook.com/share/1B24TCrE1a/?mibextid=wwXIfr'),
                        ),
                        const SizedBox(width: 16),
                        IconButton(
                          icon: const Icon(FontAwesomeIcons.youtube,
                              color: Color.fromARGB(255, 255, 0, 0), size: 20),
                          onPressed: () => _launchSocialUrl(
                              'https://www.youtube.com/@AvisaExperts'),
                        ),
                        const SizedBox(width: 16),
                        IconButton(
                          icon: const Icon(FontAwesomeIcons.linkedin,
                              color: Colors.blueAccent, size: 20),
                          onPressed: () => _launchSocialUrl(
                              'https://www.linkedin.com/in/avisaexperts'),
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),
                    const Center(
                      child: Text(
                        'copyright © 2025 A visa Experts | All rights reserved. | terms of service | privacy policy',
                        textAlign: TextAlign.center,
                        style: TextStyle(
                          fontSize: 12,
                          color: Colors.black,
                          height: 1.5,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const FloatingChatBox(),
        ],
      ),
    );
  }
}

class _TicketCard extends StatefulWidget {
  final AppointmentTicket ticket;
  final Function(String ticketId, String screenshotUrl) onScreenshotUploaded;

  const _TicketCard({
    required this.ticket,
    required this.onScreenshotUploaded,
  });

  @override
  State<_TicketCard> createState() => _TicketCardState();
}

class _TicketCardState extends State<_TicketCard> {
  bool _isUploading = false;
  final ImagePicker _picker = ImagePicker();

  // Dynamic pricing variables
  bool _isPriceLoading = true;
  int _advancePrice = 999; // fallback values
  int _premiumPrice = 1499;
  String? _priceError;

  @override
  void initState() {
    super.initState();
    _fetchPricesFromAPI();
  }

  // Updated fetch prices method to handle string responses like "Free"
  Future<void> _fetchPricesFromAPI() async {
    try {
      setState(() {
        _isPriceLoading = true;
        _priceError = null;
      });

      final response = await http
          .get(Uri.parse(AppConfig.pricing))
          .timeout(const Duration(seconds: 10));

      if (response.statusCode == 200) {
        final data = json.decode(response.body);

        setState(() {
          // Handle advance (Advance price) - could be "Free" or numeric
          if (data['advance'] is String) {
            String advanceStr =
                (data['advance'] as String).toLowerCase().trim();
            if (advanceStr == 'free' || advanceStr == '0') {
              _advancePrice = 0;
            } else {
              // Try to parse string as number
              _advancePrice = int.tryParse(data['advance'].toString()) ?? 999;
            }
          } else {
            _advancePrice = (data['advance'] as num?)?.toInt() ?? 999;
          }

          // Handle premium (Premium price) - could be "Free" or numeric
          if (data['premium'] is String) {
            String premiumStr =
                (data['premium'] as String).toLowerCase().trim();
            if (premiumStr == 'free' || premiumStr == '0') {
              _premiumPrice = 0;
            } else {
              // Try to parse string as number
              _premiumPrice = int.tryParse(data['premium'].toString()) ?? 1499;
            }
          } else {
            _premiumPrice = (data['premium'] as num?)?.toInt() ?? 1499;
          }

          _isPriceLoading = false;

          // Debug print to see what values were set
          print(
              'Loaded prices - Advance: $_advancePrice, Premium: $_premiumPrice');
        });
      } else {
        throw Exception('Failed to load prices: ${response.statusCode}');
      }
    } catch (e) {
      setState(() {
        _priceError = 'Failed to load current prices';
        _isPriceLoading = false;
      });

      print('Price API Error: $e');
    }
  }

  // Retry price fetch
  void _retryPriceFetch() {
    _fetchPricesFromAPI();
  }

  // Updated amount method to handle free plans properly
  int _getAmountForPlan() {
    switch (widget.ticket.plan.toLowerCase()) {
      case 'advance':
        return _advancePrice;
      case 'premium':
        return _premiumPrice;
      case 'basic':
      default:
        return 0;
    }
  }

  // Add a helper method to get display text for pricing
  String _getPriceDisplayText() {
    final amount = _getAmountForPlan();
    if (amount == 0) {
      return 'Free';
    } else {
      return '₹$amount';
    }
  }

  Future<void> _uploadPaymentScreenshot() async {
    try {
      final XFile? image = await _picker.pickImage(
        source: ImageSource.gallery,
        maxWidth: 1920,
        maxHeight: 1080,
        imageQuality: 85,
      );

      if (image == null) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('No image selected.')),
        );
        return;
      }

      setState(() {
        _isUploading = true;
      });

      String extractedId =
          widget.ticket.referenceId.replaceAll(RegExp(r'[^0-9]'), '');
      if (extractedId.isEmpty) {
        extractedId = widget.ticket.referenceId;
      }

      final uri = Uri.parse(AppConfig.screenshot);
      var request = http.MultipartRequest('POST', uri);
      request.fields['id'] = extractedId;

      final timestamp = DateTime.now().millisecondsSinceEpoch;
      final fileExtension = path.extension(image.path).toLowerCase();
      final fileName =
          'payment_screenshot_$timestamp${fileExtension.isEmpty ? '.jpg' : fileExtension}';

      request.files.add(
        await http.MultipartFile.fromPath(
          'screenshot',
          image.path,
          filename: fileName,
        ),
      );

      var response = await request.send().timeout(const Duration(seconds: 30));
      var responseBody = await response.stream.bytesToString();

      if (!mounted) return;

      if (response.statusCode == 200) {
        String successMessage = "Screenshot uploaded successfully!";
        String? screenshotUrl;

        try {
          final decoded = json.decode(responseBody);
          if (decoded is Map<String, dynamic>) {
            if (decoded['status'] == 'success') {
              successMessage = decoded['message'] ?? successMessage;
              screenshotUrl = decoded['screenshot'] ??
                  '${AppConfig.staticAssetBase}/uploads1/payment_screenshot/$fileName';
              widget.onScreenshotUploaded(
                  widget.ticket.referenceId, screenshotUrl!);
            } else {
              throw Exception(decoded['message'] ?? 'Upload failed');
            }
          }
        } catch (e) {
          if (responseBody.toLowerCase().contains("success")) {
            screenshotUrl =
                '${AppConfig.staticAssetBase}/uploads1/payment_screenshot/$fileName';
            widget.onScreenshotUploaded(
                widget.ticket.referenceId, screenshotUrl!);
          } else {
            throw Exception('Server response: $responseBody');
          }
        }

        setState(() {
          _isUploading = false;
        });

        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
              content: Text(successMessage), backgroundColor: Colors.green),
        );

        Future.delayed(const Duration(seconds: 1), () {
          if (mounted) {
            final myTicketsState =
                context.findAncestorStateOfType<MyTicketsScreenState>();
            if (myTicketsState != null) {
              myTicketsState.refreshTickets();
            }
          }
        });
      } else {
        throw Exception(
            'Upload failed with status: ${response.statusCode}. Server said: $responseBody');
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _isUploading = false;
        });
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
              content: Text(
                  'Upload failed: ${e.toString().split(':').first.trim()}'),
              backgroundColor: Colors.red),
        );
      }
    }
  }

  void _showPaymentQRDialog() {
    const String upiId = 'vyapar.167726728627@hdfcbank';
    final int amount = _getAmountForPlan();

    showDialog(
      context: context,
      barrierDismissible: true,
      builder: (context) => Dialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        backgroundColor: Colors.transparent,
        insetPadding: const EdgeInsets.all(16),
        child: Container(
          width: double.infinity,
          constraints: const BoxConstraints(maxWidth: 380),
          decoration: BoxDecoration(
            gradient: LinearGradient(
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
              colors: [
                Colors.white,
                Colors.grey.shade50,
              ],
            ),
            borderRadius: BorderRadius.circular(20),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.1),
                blurRadius: 20,
                offset: const Offset(0, 8),
              ),
            ],
          ),
          child: ClipRRect(
            borderRadius: BorderRadius.circular(20),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Container(
                  padding: const EdgeInsets.fromLTRB(20, 16, 12, 12),
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      colors: [
                        const Color(0xFF667eea),
                        const Color(0xFF764ba2),
                      ],
                    ),
                  ),
                  child: Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(6),
                        decoration: BoxDecoration(
                          color: Colors.white.withOpacity(0.2),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: const Icon(
                          Icons.qr_code_2_rounded,
                          color: Colors.white,
                          size: 20,
                        ),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text(
                              'Payment QR Code',
                              style: TextStyle(
                                color: Colors.white,
                                fontSize: 18,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            Text(
                              'Meeting ${widget.ticket.referenceId}',
                              style: TextStyle(
                                color: Colors.white.withOpacity(0.9),
                                fontSize: 13,
                                fontWeight: FontWeight.w500,
                              ),
                            ),
                          ],
                        ),
                      ),
                      Container(
                        decoration: BoxDecoration(
                          color: Colors.white.withOpacity(0.2),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: IconButton(
                          icon: const Icon(Icons.close_rounded,
                              color: Colors.white, size: 20),
                          onPressed: () => Navigator.pop(context),
                          padding: const EdgeInsets.all(6),
                          constraints: const BoxConstraints(),
                        ),
                      ),
                    ],
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Price loading/error handling
                      if (_isPriceLoading)
                        Container(
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(
                            color: Colors.blue.shade50,
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Row(
                            children: [
                              const SizedBox(
                                width: 20,
                                height: 20,
                                child:
                                    CircularProgressIndicator(strokeWidth: 2),
                              ),
                              const SizedBox(width: 12),
                              const Text('Loading current prices...'),
                            ],
                          ),
                        )
                      else if (_priceError != null)
                        Container(
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(
                            color: Colors.orange.shade50,
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Row(
                            children: [
                              Icon(Icons.warning,
                                  color: Colors.orange.shade600),
                              const SizedBox(width: 8),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      '$_priceError. Using fallback prices.',
                                      style: TextStyle(
                                          color: Colors.orange.shade700),
                                    ),
                                    const SizedBox(height: 8),
                                    GestureDetector(
                                      onTap: _retryPriceFetch,
                                      child: Text(
                                        'Tap to retry',
                                        style: TextStyle(
                                          color: Colors.orange.shade700,
                                          decoration: TextDecoration.underline,
                                          fontWeight: FontWeight.bold,
                                        ),
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                        ),

                      if (_isPriceLoading || _priceError != null)
                        const SizedBox(height: 16),

                      // Meeting details
                      Container(
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: Colors.grey.shade50,
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: Colors.grey.shade200),
                        ),
                        child: Column(
                          children: [
                            _buildCompactDetailRow(
                              Icons.event_note_rounded,
                              'Plan',
                              widget.ticket.plan,
                              const Color(0xFF667eea),
                            ),
                            const SizedBox(height: 10),
                            _buildCompactDetailRow(
                              Icons.calendar_today_rounded,
                              'Date',
                              widget.ticket.formattedDate,
                              const Color(0xFF4CAF50),
                            ),
                            const SizedBox(height: 10),
                            _buildCompactDetailRow(
                              Icons.access_time_rounded,
                              'Time',
                              widget.ticket.formattedTime,
                              const Color(0xFFFF9800),
                            ),
                            const SizedBox(height: 10),
                            _buildCompactDetailRow(
                              Icons.video_call_rounded,
                              'Mode',
                              widget.ticket.mode == 'online'
                                  ? 'Virtual Meeting'
                                  : 'In-Person',
                              const Color(0xFFE91E63),
                            ),
                          ],
                        ),
                      ),

                      const SizedBox(height: 16),

                      // Current price display with Free handling
                      if (!_isPriceLoading && _priceError == null)
                        Container(
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            color: _getAmountForPlan() == 0
                                ? Colors.green.shade50
                                : Colors.blue.shade50,
                            borderRadius: BorderRadius.circular(8),
                            border: Border.all(
                                color: _getAmountForPlan() == 0
                                    ? Colors.green.shade200
                                    : Colors.blue.shade200),
                          ),
                          child: Row(
                            children: [
                              Icon(
                                  _getAmountForPlan() == 0
                                      ? Icons.free_breakfast
                                      : Icons.currency_rupee,
                                  color: _getAmountForPlan() == 0
                                      ? Colors.green.shade700
                                      : Colors.blue.shade700,
                                  size: 18),
                              const SizedBox(width: 8),
                              Text(
                                'Current Price: ${_getPriceDisplayText()}',
                                style: TextStyle(
                                  fontWeight: FontWeight.bold,
                                  color: _getAmountForPlan() == 0
                                      ? Colors.green.shade700
                                      : Colors.blue.shade700,
                                  fontSize: 16,
                                ),
                              ),
                            ],
                          ),
                        ),

                      if (!_isPriceLoading && _priceError == null)
                        const SizedBox(height: 16),

                      // Only show QR and payment section if amount > 0
                      if (_getAmountForPlan() > 0) ...[
                        // QR Code and payment section
                        Row(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Container(
                              padding: const EdgeInsets.all(12),
                              decoration: BoxDecoration(
                                color: Colors.white,
                                borderRadius: BorderRadius.circular(12),
                                boxShadow: [
                                  BoxShadow(
                                    color: Colors.grey.withOpacity(0.1),
                                    blurRadius: 8,
                                    offset: const Offset(0, 4),
                                  ),
                                ],
                                border: Border.all(color: Colors.grey.shade200),
                              ),
                              child: QrImageView(
                                data:
                                    'upi://pay?pa=$upiId&pn=A visa Experts&cu=INR&tn=Payment for ${widget.ticket.referenceId}&am=$amount',
                                version: QrVersions.auto,
                                size: 100.0,
                                gapless: false,
                                foregroundColor: const Color(0xFF2C3E50),
                              ),
                            ),
                            const SizedBox(width: 16),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  const Text(
                                    'Scan to Pay',
                                    style: TextStyle(
                                      fontSize: 16,
                                      color: Color(0xFF2C3E50),
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                  const SizedBox(height: 4),
                                  Text(
                                    'Use any UPI app to scan and pay',
                                    style: TextStyle(
                                      fontSize: 12,
                                      color: Colors.grey.shade600,
                                    ),
                                  ),
                                  const SizedBox(height: 12),
                                  Container(
                                    width: double.infinity,
                                    decoration: BoxDecoration(
                                      gradient: LinearGradient(
                                        colors: [
                                          const Color(0xFF00BAF2),
                                          const Color(0xFF0082C8),
                                        ],
                                      ),
                                      borderRadius: BorderRadius.circular(8),
                                      boxShadow: [
                                        BoxShadow(
                                          color: const Color(0xFF00BAF2)
                                              .withOpacity(0.3),
                                          blurRadius: 6,
                                          offset: const Offset(0, 3),
                                        ),
                                      ],
                                    ),
                                    child: Material(
                                      color: Colors.transparent,
                                      child: InkWell(
                                        borderRadius: BorderRadius.circular(8),
                                        onTap: () => _openPaytm(upiId),
                                        child: Padding(
                                          padding: const EdgeInsets.symmetric(
                                              horizontal: 12, vertical: 10),
                                          child: Row(
                                            mainAxisSize: MainAxisSize.min,
                                            mainAxisAlignment:
                                                MainAxisAlignment.center,
                                            children: [
                                              Container(
                                                width: 20,
                                                height: 20,
                                                decoration: BoxDecoration(
                                                  color: Colors.white,
                                                  borderRadius:
                                                      BorderRadius.circular(4),
                                                ),
                                                child: Center(
                                                  child: Text(
                                                    'P',
                                                    style: TextStyle(
                                                      fontSize: 12,
                                                      fontWeight:
                                                          FontWeight.bold,
                                                      color: const Color(
                                                          0xFF00BAF2),
                                                    ),
                                                  ),
                                                ),
                                              ),
                                              const SizedBox(width: 8),
                                              const Text(
                                                'Pay with UPI',
                                                style: TextStyle(
                                                  fontSize: 12,
                                                  color: Colors.white,
                                                  fontWeight: FontWeight.bold,
                                                ),
                                              ),
                                            ],
                                          ),
                                        ),
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),

                        const SizedBox(height: 16),

                        // UPI ID section
                        Container(
                          padding: const EdgeInsets.all(14),
                          decoration: BoxDecoration(
                            gradient: LinearGradient(
                              colors: [
                                Colors.blue.shade50,
                                Colors.indigo.shade50,
                              ],
                            ),
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(color: Colors.blue.shade200),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                children: [
                                  Container(
                                    padding: const EdgeInsets.all(6),
                                    decoration: BoxDecoration(
                                      color: const Color(0xFF667eea),
                                      borderRadius: BorderRadius.circular(8),
                                    ),
                                    child: const Icon(
                                      Icons.account_balance_wallet_rounded,
                                      color: Colors.white,
                                      size: 16,
                                    ),
                                  ),
                                  const SizedBox(width: 10),
                                  const Text(
                                    'UPI ID',
                                    style: TextStyle(
                                      fontSize: 14,
                                      fontWeight: FontWeight.bold,
                                      color: Color(0xFF2C3E50),
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 10),
                              Container(
                                padding: const EdgeInsets.all(12),
                                decoration: BoxDecoration(
                                  color: Colors.white,
                                  borderRadius: BorderRadius.circular(8),
                                  border:
                                      Border.all(color: Colors.grey.shade300),
                                ),
                                child: Row(
                                  children: [
                                    Expanded(
                                      child: Text(
                                        upiId,
                                        style: const TextStyle(
                                          fontSize: 13,
                                          color: Color(0xFF2C3E50),
                                          fontWeight: FontWeight.w600,
                                          fontFamily: 'monospace',
                                        ),
                                      ),
                                    ),
                                    const SizedBox(width: 8),
                                    GestureDetector(
                                      onTap: () {
                                        Clipboard.setData(
                                            ClipboardData(text: upiId));
                                        ScaffoldMessenger.of(context)
                                            .showSnackBar(
                                          SnackBar(
                                            content: const Row(
                                              mainAxisSize: MainAxisSize.min,
                                              children: [
                                                Icon(Icons.check_circle_rounded,
                                                    color: Colors.white,
                                                    size: 18),
                                                SizedBox(width: 8),
                                                Text('UPI ID copied!'),
                                              ],
                                            ),
                                            backgroundColor:
                                                const Color(0xFF4CAF50),
                                            behavior: SnackBarBehavior.floating,
                                            shape: RoundedRectangleBorder(
                                              borderRadius:
                                                  BorderRadius.circular(8),
                                            ),
                                          ),
                                        );
                                      },
                                      child: Container(
                                        padding: const EdgeInsets.all(8),
                                        decoration: BoxDecoration(
                                          color: const Color(0xFF667eea),
                                          borderRadius:
                                              BorderRadius.circular(6),
                                        ),
                                        child: const Icon(
                                          Icons.copy_rounded,
                                          size: 16,
                                          color: Colors.white,
                                        ),
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                        ),

                        const SizedBox(height: 16),

                        // Upload button (only show if amount > 0)
                        Container(
                          width: double.infinity,
                          height: 48,
                          decoration: BoxDecoration(
                            gradient: LinearGradient(
                              colors: [
                                const Color(0xFF667eea),
                                const Color(0xFF764ba2),
                              ],
                            ),
                            borderRadius: BorderRadius.circular(12),
                            boxShadow: [
                              BoxShadow(
                                color: const Color(0xFF667eea).withOpacity(0.3),
                                blurRadius: 8,
                                offset: const Offset(0, 4),
                              ),
                            ],
                          ),
                          child: ElevatedButton.icon(
                            onPressed: (_isUploading || _isPriceLoading)
                                ? null
                                : () {
                                    Navigator.pop(context);
                                    _uploadPaymentScreenshot();
                                  },
                            icon: _isUploading
                                ? const SizedBox(
                                    width: 18,
                                    height: 18,
                                    child: CircularProgressIndicator(
                                      strokeWidth: 2,
                                      color: Colors.white,
                                    ),
                                  )
                                : const Icon(
                                    Icons.cloud_upload_rounded,
                                    color: Colors.white,
                                    size: 20,
                                  ),
                            label: Text(
                              _isUploading
                                  ? 'Uploading...'
                                  : _isPriceLoading
                                      ? 'Loading...'
                                      : 'Upload Screenshot',
                              style: const TextStyle(
                                fontSize: 14,
                                fontWeight: FontWeight.bold,
                                color: Colors.white,
                                letterSpacing: 0.3,
                              ),
                            ),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: Colors.transparent,
                              shadowColor: Colors.transparent,
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(12),
                              ),
                            ),
                          ),
                        ),
                      ] else ...[
                        // Free plan message
                        Container(
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(
                            color: Colors.green.shade50,
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(color: Colors.green.shade200),
                          ),
                          child: Column(
                            children: [
                              Row(
                                children: [
                                  Icon(Icons.free_breakfast,
                                      color: Colors.green.shade700, size: 24),
                                  const SizedBox(width: 12),
                                  Expanded(
                                    child: Text(
                                      'This plan is currently free!',
                                      style: TextStyle(
                                        fontWeight: FontWeight.bold,
                                        color: Colors.green.shade800,
                                        fontSize: 16,
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 8),
                              Text(
                                'No payment required for your "${widget.ticket.plan}" plan appointment.',
                                style: TextStyle(
                                  fontSize: 14,
                                  color: Colors.green.shade700,
                                ),
                                textAlign: TextAlign.center,
                              ),
                            ],
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

  void _openPaytm(String upiId) async {
    try {
      final int amount = _getAmountForPlan();
      if (amount <= 0) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: const Text('No payment required for this plan.'),
            backgroundColor: Colors.green,
            behavior: SnackBarBehavior.floating,
          ),
        );
        return;
      }

      final String upiUrl =
          'upi://pay?pa=$upiId&pn=A visa Experts&cu=INR&tn=Payment for ${widget.ticket.referenceId}&am=$amount';

      final String paytmUrl =
          'paytmmp://upi/pay?pa=$upiId&pn=A visa Experts&cu=INR&tn=Payment for ${widget.ticket.referenceId}&am=$amount';

      if (await canLaunchUrl(Uri.parse(paytmUrl))) {
        await launchUrl(Uri.parse(paytmUrl),
            mode: LaunchMode.externalApplication);
      } else if (await canLaunchUrl(Uri.parse(upiUrl))) {
        await launchUrl(Uri.parse(upiUrl),
            mode: LaunchMode.externalApplication);
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: const Row(
              children: [
                Icon(Icons.error_rounded, color: Colors.white, size: 18),
                SizedBox(width: 8),
                Text('No UPI app found. Please install Paytm or any UPI app.'),
              ],
            ),
            backgroundColor: Colors.red,
            behavior: SnackBarBehavior.floating,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(8),
            ),
          ),
        );
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Row(
            children: [
              Icon(Icons.error_rounded, color: Colors.white, size: 18),
              SizedBox(width: 8),
              Text('Failed to open payment app: ${e.toString()}'),
            ],
          ),
          backgroundColor: Colors.red,
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(8),
          ),
        ),
      );
    }
  }

  Widget _buildCompactDetailRow(
      IconData icon, String label, String value, Color iconColor) {
    return Row(
      children: [
        Container(
          padding: const EdgeInsets.all(6),
          decoration: BoxDecoration(
            color: iconColor.withOpacity(0.1),
            borderRadius: BorderRadius.circular(6),
          ),
          child: Icon(
            icon,
            size: 16,
            color: iconColor,
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                label,
                style: TextStyle(
                  fontSize: 11,
                  color: Colors.grey.shade600,
                  fontWeight: FontWeight.w500,
                ),
              ),
              const SizedBox(height: 1),
              Text(
                value,
                style: const TextStyle(
                  fontSize: 13,
                  color: Color(0xFF2C3E50),
                  fontWeight: FontWeight.w600,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    final bool isOnline = widget.ticket.mode.toLowerCase() == 'online';
    final bool isTicketConfirmedByStatus =
        widget.ticket.status.toLowerCase() == 'confirmed';
    final bool isPaidPlan = widget.ticket.plan.toLowerCase() != 'basic';
    final bool hasUploadedScreenshot =
        widget.ticket.uploadedScreenshotUrl != null &&
            widget.ticket.uploadedScreenshotUrl!.isNotEmpty;

    // Updated logic: Show payment section only if plan requires payment and not confirmed
    final bool showPaymentSection = isPaidPlan &&
        !isTicketConfirmedByStatus &&
        !hasUploadedScreenshot &&
        !_isPriceLoading &&
        _getAmountForPlan() > 0; // Only show if amount > 0

    // Show free plan message if plan is paid but amount is 0
    final bool showFreePlanMessage = isPaidPlan &&
        !isTicketConfirmedByStatus &&
        !_isPriceLoading &&
        _getAmountForPlan() == 0;

    return Card(
      margin: const EdgeInsets.only(bottom: 16.0),
      elevation: 2.0,
      shadowColor: Colors.black.withOpacity(0.08),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12.0),
      ),
      color: Colors.white,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding:
                const EdgeInsets.symmetric(horizontal: 16.0, vertical: 12.0),
            decoration: BoxDecoration(
                color: Colors.grey.shade100,
                borderRadius: const BorderRadius.only(
                  topLeft: Radius.circular(12.0),
                  topRight: Radius.circular(12.0),
                ),
                border:
                    Border(bottom: BorderSide(color: Colors.grey.shade200))),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                  child: Text(
                    'Meeting ID: ${widget.ticket.referenceId}',
                    style: const TextStyle(
                      fontWeight: FontWeight.bold,
                      fontSize: 15,
                      color: Colors.black87,
                    ),
                  ),
                ),
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                  decoration: BoxDecoration(
                    color: (widget.ticket.statusDisplay['color'] as Color)
                        .withOpacity(0.15),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(widget.ticket.statusDisplay['icon'] as IconData,
                          size: 15,
                          color: widget.ticket.statusDisplay['color'] as Color),
                      const SizedBox(width: 5),
                      Text(
                        widget.ticket.statusDisplay['text'] as String,
                        style: TextStyle(
                          color: widget.ticket.statusDisplay['color'] as Color,
                          fontWeight: FontWeight.bold,
                          fontSize: 11,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),

          Padding(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              children: [
                _buildDetailRowContent('Plan', widget.ticket.plan),
                _buildDetailRowContent(
                    'Plan Date', widget.ticket.formattedDate),
                _buildDetailRowContent('Time', widget.ticket.formattedTime),
                _buildDetailRowContent(
                    'Mode', isOnline ? 'Virtual Meeting' : 'In-Person'),
                if (!isOnline && widget.ticket.address.isNotEmpty)
                  _buildDetailRowContent('Location', widget.ticket.address,
                      isMultiLine: true),
              ],
            ),
          ),

          // Updated Payment Section with price loading states
          if (showPaymentSection) ...[
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16.0),
              child: Column(
                children: [
                  Divider(color: Colors.grey.shade200),
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      Icon(Icons.payment_outlined,
                          color: Colors.orange.shade700, size: 20),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          'Action Required: Complete Payment',
                          style: TextStyle(
                            fontWeight: FontWeight.bold,
                            color: Colors.orange.shade800,
                            fontSize: 15,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),

                  // Current price display with Free handling
                  if (!_isPriceLoading && _priceError == null)
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: _getAmountForPlan() == 0
                            ? Colors.green.shade50
                            : Colors.blue.shade50,
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(
                            color: _getAmountForPlan() == 0
                                ? Colors.green.shade200
                                : Colors.blue.shade200),
                      ),
                      child: Row(
                        children: [
                          Icon(
                              _getAmountForPlan() == 0
                                  ? Icons.free_breakfast
                                  : Icons.currency_rupee,
                              color: _getAmountForPlan() == 0
                                  ? Colors.green.shade700
                                  : Colors.blue.shade700,
                              size: 18),
                          const SizedBox(width: 8),
                          Text(
                            'Current Price: ${_getPriceDisplayText()}',
                            style: TextStyle(
                              fontWeight: FontWeight.bold,
                              color: _getAmountForPlan() == 0
                                  ? Colors.green.shade700
                                  : Colors.blue.shade700,
                              fontSize: 14,
                            ),
                          ),
                        ],
                      ),
                    ),

                  if (!_isPriceLoading && _priceError == null)
                    const SizedBox(height: 12),

                  Text(
                    'To confirm your "${widget.ticket.plan}" plan appointment, please complete the payment and upload the screenshot.',
                    style: TextStyle(fontSize: 13, color: Colors.grey.shade700),
                  ),
                  const SizedBox(height: 16),
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton.icon(
                      onPressed: _isPriceLoading ? null : _showPaymentQRDialog,
                      icon: _isPriceLoading
                          ? const SizedBox(
                              width: 18,
                              height: 18,
                              child: CircularProgressIndicator(strokeWidth: 2),
                            )
                          : const Icon(Icons.qr_code_scanner_rounded, size: 18),
                      label: Text(_isPriceLoading
                          ? 'Loading Prices...'
                          : 'Pay & Upload Screenshot'),
                      style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.blue.shade700,
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(vertical: 12),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(8),
                          ),
                          textStyle:
                              const TextStyle(fontWeight: FontWeight.w600)),
                    ),
                  ),
                ],
              ),
            ),
          ],

          // Free plan message section
          if (showFreePlanMessage) ...[
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16.0),
              child: Column(
                children: [
                  Divider(color: Colors.grey.shade200),
                  const SizedBox(height: 12),
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: Colors.green.shade50,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: Colors.green.shade200),
                    ),
                    child: Row(
                      children: [
                        Icon(Icons.free_breakfast,
                            color: Colors.green.shade700, size: 24),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'Free Plan Active!',
                                style: TextStyle(
                                  fontWeight: FontWeight.bold,
                                  color: Colors.green.shade800,
                                  fontSize: 16,
                                ),
                              ),
                              const SizedBox(height: 4),
                              Text(
                                'Your "${widget.ticket.plan}" plan is currently free. No payment required.',
                                style: TextStyle(
                                  fontSize: 13,
                                  color: Colors.green.shade700,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ],

          // Screenshot Display Section
          if (hasUploadedScreenshot) ...[
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16.0),
              child: Column(
                children: [
                  Divider(color: Colors.grey.shade200),
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      Icon(Icons.check_circle,
                          color: Colors.green.shade700, size: 20),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          'Payment Screenshot Uploaded',
                          style: TextStyle(
                            fontWeight: FontWeight.bold,
                            color: Colors.green.shade800,
                            fontSize: 15,
                          ),
                        ),
                      ),
                      GestureDetector(
                        onTap: () => _showFullScreenImage(
                            widget.ticket.uploadedScreenshotUrl!),
                        child: Icon(Icons.fullscreen,
                            color: Colors.blue.shade600, size: 20),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  GestureDetector(
                    onTap: () => _showFullScreenImage(
                        widget.ticket.uploadedScreenshotUrl!),
                    child: Container(
                      width: double.infinity,
                      height: 200,
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(color: Colors.grey.shade300),
                      ),
                      child: ClipRRect(
                        borderRadius: BorderRadius.circular(8),
                        child: Image.network(
                          widget.ticket.uploadedScreenshotUrl!,
                          fit: BoxFit.cover,
                          loadingBuilder: (context, child, loadingProgress) {
                            if (loadingProgress == null) return child;
                            return Center(
                              child: Column(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  CircularProgressIndicator(
                                    value: loadingProgress.expectedTotalBytes !=
                                            null
                                        ? loadingProgress
                                                .cumulativeBytesLoaded /
                                            loadingProgress.expectedTotalBytes!
                                        : null,
                                  ),
                                  const SizedBox(height: 8),
                                  Text(
                                    'Loading screenshot...',
                                    style: TextStyle(
                                        color: Colors.grey.shade600,
                                        fontSize: 12),
                                  ),
                                ],
                              ),
                            );
                          },
                          errorBuilder: (context, error, stackTrace) {
                            return GestureDetector(
                              onTap: () {
                                final myTicketsState =
                                    context.findAncestorStateOfType<
                                        MyTicketsScreenState>();
                                if (myTicketsState != null) {
                                  myTicketsState.refreshTickets();
                                }
                              },
                              child: Container(
                                color: Colors.grey.shade100,
                                child: Column(
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  children: [
                                    Icon(Icons.refresh,
                                        color: Colors.blue.shade600, size: 50),
                                    const SizedBox(height: 8),
                                    Text(
                                      'Tap to refresh',
                                      style: TextStyle(
                                          color: Colors.blue.shade600,
                                          fontSize: 12,
                                          fontWeight: FontWeight.w500),
                                    ),
                                  ],
                                ),
                              ),
                            );
                          },
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Your payment screenshot has been uploaded and is being reviewed. Tap to view full size.',
                    style: TextStyle(fontSize: 12, color: Colors.grey.shade600),
                    textAlign: TextAlign.center,
                  ),
                ],
              ),
            ),
          ],

          const SizedBox(height: 16),
        ],
      ),
    );
  }

  Widget _buildDetailRowContent(String label, String value,
      {bool isMultiLine = false}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 5.0),
      child: Row(
        crossAxisAlignment:
            isMultiLine ? CrossAxisAlignment.start : CrossAxisAlignment.center,
        children: [
          SizedBox(
            width: 80,
            child: Text(
              label,
              style: TextStyle(
                color: Colors.grey.shade600,
                fontSize: 13,
              ),
            ),
          ),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              value,
              style: const TextStyle(
                fontWeight: FontWeight.w500,
                fontSize: 14,
                color: Colors.black87,
              ),
              softWrap: isMultiLine,
            ),
          ),
        ],
      ),
    );
  }

  void _showFullScreenImage(String imageUrl) {
    showDialog(
      context: context,
      barrierDismissible: true,
      builder: (context) => Dialog(
        backgroundColor: Colors.black,
        insetPadding: const EdgeInsets.all(20),
        child: Stack(
          children: [
            Center(
              child: InteractiveViewer(
                child: Image.network(
                  imageUrl,
                  fit: BoxFit.contain,
                  loadingBuilder: (context, child, loadingProgress) {
                    if (loadingProgress == null) return child;
                    return Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          CircularProgressIndicator(
                            value: loadingProgress.expectedTotalBytes != null
                                ? loadingProgress.cumulativeBytesLoaded /
                                    loadingProgress.expectedTotalBytes!
                                : null,
                            color: Colors.white,
                          ),
                          const SizedBox(height: 16),
                          const Text(
                            'Loading full size image...',
                            style: TextStyle(color: Colors.white),
                          ),
                        ],
                      ),
                    );
                  },
                  errorBuilder: (context, error, stackTrace) {
                    return const Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(Icons.error_outline,
                              color: Colors.white, size: 50),
                          SizedBox(height: 16),
                          Text(
                            'Failed to load image',
                            style: TextStyle(color: Colors.white, fontSize: 16),
                          ),
                        ],
                      ),
                    );
                  },
                ),
              ),
            ),
            Positioned(
              top: 40,
              right: 20,
              child: IconButton(
                onPressed: () => Navigator.pop(context),
                icon: const Icon(Icons.close, color: Colors.white, size: 30),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
