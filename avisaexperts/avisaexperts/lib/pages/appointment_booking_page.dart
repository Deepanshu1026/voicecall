import 'package:flutter/material.dart';
import 'package:intl/intl.dart'; // For DateFormat
import 'package:http/http.dart' as http; // For API calls
import 'dart:convert'; // For jsonDecode
import 'dart:async'; // For Future, TimeoutException
import 'package:email_validator/email_validator.dart'; // For email validation
import 'package:shared_preferences/shared_preferences.dart'; // For loading user data
import 'dart:math'; // For generating reference number
import 'package:qr_flutter/qr_flutter.dart';
import 'package:flutter/services.dart'; // For Clipboard
import 'package:flutter_svg/flutter_svg.dart'; // For SVG support
import 'package:url_launcher/url_launcher.dart';
import 'package:lottie/lottie.dart'; // For Lottie animations

// Import your custom AppBar and Notifier (ensure paths are correct)
import '../appbar/common_widgets.dart';
import '../models/app_notifiers.dart'; // <-- Import the notifier and fetchTicketCountFromApi
import '../widget/chatbox.dart'; // Import FloatingChatBox

// --- TimeSlotData Model ---
class TimeSlotData {
  final String time; // e.g., "16:30:00"
  final int available;
  final int total;
  final int booked;
  final int remaining;

  TimeSlotData({
    required this.time,
    required this.available,
    required this.total,
    required this.booked,
    required this.remaining,
  });
  factory TimeSlotData.fromJson(Map<String, dynamic> json) {
    return TimeSlotData(
      time: json['time'] ?? '',
      available: json['available'] ?? 0,
      total: json['total'] ?? 0,
      booked: json['booked'] ?? 0,
      remaining: json['remaining'] ?? 0,
    );
  }
  String get formattedTime {
    try {
      final parsedTime = DateFormat("HH:mm:ss").parse(time);
      return DateFormat("hh:mm a").format(parsedTime);
    } catch (e) {
      print("Error formatting time $time: $e");
      return time;
    }
  }

  bool get isBookable => remaining > 0;
}
// --- End TimeSlotData Model ---

// Enums for Consultation and Meeting Types
enum ConsultationType { basic, Advance, premium }

enum MeetingType { online, inPerson }

// --- Main Appointment Booking Screen Widget ---
class AppointmentBookingScreen extends StatefulWidget {
  final VoidCallback? onBookingSuccess; // Callback for successful booking

  const AppointmentBookingScreen({super.key, this.onBookingSuccess});
  @override
  State<AppointmentBookingScreen> createState() =>
      _AppointmentBookingScreenState();
}

class _AppointmentBookingScreenState extends State<AppointmentBookingScreen> {
  final _formKey = GlobalKey<FormState>();

  // State variables for selections
  ConsultationType? _selectedConsultation =
      ConsultationType.Advance; // Default is Advance
  MeetingType? _selectedMeetingType = MeetingType.online;
  int? _selectedAddressIndex;
  String? _selectedTimeSlot; // Stores raw "HH:mm:ss"
  DateTime? _selectedDate; // Initialized in initState

  // State variables for time slot fetching
  List<TimeSlotData> _availableTimeSlots = [];
  bool _isLoadingTimeSlots = false;
  String? _timeSlotsError;

  // API payment values (defaults kept for safety)
  Map<String, String> _paymentValues = {
    "advance": '₹ 999',
    "premium": '₹ 1499',
  };

  // State Variables for fetching unavailable Premium dates
  Set<String> _unavailablePremiumDates = {};
  bool _isFetchingUnavailableDates = false;
  String? _fetchUnavailableDatesError;

  bool _isSubmitting = false; // State for submission loading

  // State variable for userId
  int? _userId;

  // Controllers
  final _nameController = TextEditingController();
  final _emailController = TextEditingController();
  final _mobileController = TextEditingController();
  final _dateController = TextEditingController();
  final _notesController = TextEditingController();

  // Address List
  final List<String> _officeAddresses = [
    'Sector 2, Noida, Uttar Pradesh 201301',
    'Valmik Complex, Shanti Sadan\nSociety, Ahmedabad, Gujarat 380006',
  ];

  // User Data (for AppBar)
  String _userName = 'User';
  String? _userImagePath;

  // State variable for payment
  // final bool _isPaymentRequired = false;
  String? _referenceNumber;

  // --- NEW: Meeting mode state variables ---
  bool _isOnlineEnabled = true;
  bool _isOfflineEnabled = true;

  // Add cache variables for images to prevent unnecessary refetching
  String? _cachedOfferImageUrl;
  String? _cachedServiceImageUrl;
  bool _imagesLoaded = false;

  // --- Premium Color Palette ---
  static const Color _primaryNavy = Color(0xFF1A365D);
  static const Color _secondaryTeal = Color(0xFF0D9488);
  static const Color _accentGold = Color(0xFFD4AF37);
  static const Color _successEmerald = Color(0xFF059669);
  static const Color _errorRose = Color(0xFFE11D48);
  static const Color _warningAmber = Color(0xFFD97706);
  static const Color _bgLight = Color(0xFFF8FAFC);
  static const Color _textPrimary = Color(0xFF1E293B);
  static const Color _textSecondary = Color(0xFF64748B);
  static const Color _textMuted = Color(0xFF94A3B8);
  static const Color _cardBorder = Color(0xFFE2E8F0);
  static const Color _chipBg = Color(0xFFF1F5F9);

  @override
  void initState() {
    super.initState();
    final today = DateTime.now();
    _selectedDate = DateTime(today.year, today.month, today.day);
    _dateController.text = DateFormat('MM/dd/yyyy').format(_selectedDate!);

    // 🔧 Don't set default meeting type here - let API response handle it
    _selectedMeetingType = null; // Will be set after API call

    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (mounted) {
        _loadUserDataAndInitialFetch();
      }
    });

    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (mounted) {
        _loadUserDataAndInitialFetch();
        _fetchPaymentValues(); // 👈 load payment values from API
        _fetchMeetingModes(); // 👈 load meeting mode status
        _loadImages(); // 👈 load images separately
      }
    });
  }

  // 🔧 New method to load images separately
  Future<void> _loadImages() async {
    if (!_imagesLoaded) {
      _cachedOfferImageUrl = await _fetchOfferImage();
      _cachedServiceImageUrl = await _fetchServiceImage();
      if (mounted) {
        setState(() {
          _imagesLoaded = true;
        });
      }
    }
  }

  @override
  void dispose() {
    _nameController.dispose();
    _emailController.dispose();
    _mobileController.dispose();
    _dateController.dispose();
    _notesController.dispose();
    super.dispose();
  }

  Future<void> _loadUserDataAndInitialFetch() async {
    if (mounted) {
      setState(() {
        _isLoadingTimeSlots = true;
      });
    } else {
      return;
    }
    final prefs = await SharedPreferences.getInstance();
    final String loadedName = prefs.getString('userName') ?? 'User';
    final String? loadedImagePath = prefs.getString('userProfile');
    final int? loadedUserId =
        prefs.getInt(USER_ID_PREFS_KEY); // Use constant from app_notifiers
    if (!mounted) return;
    setState(() {
      _userName = loadedName;
      _userImagePath =
          (loadedImagePath != null && loadedImagePath.trim().isNotEmpty)
              ? loadedImagePath.trim()
              : null;
      _userId = loadedUserId;
      print(
          "AppointmentBookingScreen: User Data Loaded: Name=$_userName, ImagePath=$_userImagePath, UserID=$_userId");
    });
    if (_userId == null) {
      print(
          "Error: User ID not found in SharedPreferences. Cannot fetch appointment data.");
      if (mounted) {
        setState(() {
          _isLoadingTimeSlots = false;
          _timeSlotsError = "User session error. Please log in again.";
          _availableTimeSlots = [];
        });
      }
      return;
    }
    await _fetchTimeSlots();
    if (mounted && _isLoadingTimeSlots) {
      setState(() {
        _isLoadingTimeSlots = false;
      });
    }
  }

  Future<void> _fetchPaymentValues() async {
    try {
      final response = await http.get(
        Uri.parse(
            "/pricing"), // replace with your domain
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        setState(() {
          _paymentValues = {
            "advance": data["advance"].toString(), // could be number or "Free"
            "premium": data["premium"].toString(),
          };
        });
        print("Payment values loaded: $_paymentValues");
      } else {
        print("Failed to load payment values: ${response.statusCode}");
      }
    } catch (e) {
      print("Error fetching payment values: $e");
    }
  }

  // 🔧 Step 2: Fetch meeting status from API
  Future<void> _fetchMeetingModes() async {
    try {
      final response = await http.get(
        Uri.parse("/meetings/status"),
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        if (mounted) {
          setState(() {
            final meetings = data["meetings"];
            _isOnlineEnabled = meetings["online"]["status"] == "enabled";
            _isOfflineEnabled = meetings["offline"]["status"] == "enabled";

            // 🔧 Handle automatic selection when current mode becomes disabled
            _handleMeetingModeSelection();
          });
        }
        print(
            "Meeting modes: online=$_isOnlineEnabled, offline=$_isOfflineEnabled");
      } else {
        print("Failed to fetch meeting modes: ${response.statusCode}");
      }
    } catch (e) {
      print("Error fetching meeting modes: $e");
    }
  }

  // 🔧 New method to handle automatic meeting mode selection
  void _handleMeetingModeSelection() {
    // Check if current selection is disabled
    bool currentModeDisabled = false;

    if (_selectedMeetingType == MeetingType.online && !_isOnlineEnabled) {
      currentModeDisabled = true;
    } else if (_selectedMeetingType == MeetingType.inPerson &&
        !_isOfflineEnabled) {
      currentModeDisabled = true;
    }

    // If current mode is disabled, switch to an enabled one
    if (currentModeDisabled) {
      if (_isOnlineEnabled) {
        _selectedMeetingType = MeetingType.online;
        _selectedAddressIndex =
            null; // Clear address selection when switching to online
        print("Switched to online meeting mode (was disabled)");
      } else if (_isOfflineEnabled) {
        _selectedMeetingType = MeetingType.inPerson;
        print("Switched to in-person meeting mode (was disabled)");
      } else {
        // Both are disabled - this shouldn't happen in normal cases
        print("Warning: Both meeting modes are disabled!");
      }
    }

    // Handle initial selection if no mode is selected yet
    if (_selectedMeetingType == null) {
      if (_isOnlineEnabled) {
        _selectedMeetingType = MeetingType.online;
        print("Initial selection: online meeting mode");
      } else if (_isOfflineEnabled) {
        _selectedMeetingType = MeetingType.inPerson;
        print("Initial selection: in-person meeting mode");
      }
    }
  }

  Future<void> _fetchTimeSlots() async {
    if (_selectedConsultation == null || _selectedDate == null) {
      if (mounted) {
        setState(() {
          _availableTimeSlots = [];
          _selectedTimeSlot = null;
          _isLoadingTimeSlots = false;
          _timeSlotsError = null;
        });
      }
      return;
    }
    if (mounted && !_isLoadingTimeSlots) {
      setState(() {
        _isLoadingTimeSlots = true;
        _availableTimeSlots = [];
        _selectedTimeSlot = null;
        _timeSlotsError = null;
      });
    } else if (!mounted) {
      return;
    }
    String planString;
    switch (_selectedConsultation!) {
      case ConsultationType.basic:
        planString = 'Basic';
        break;
      case ConsultationType.Advance:
        planString = 'Advance';
        break;
      case ConsultationType.premium:
        planString = 'Premium';
        break;
    }
    final dateString = DateFormat('yyyy-MM-dd').format(_selectedDate!);
    final url = Uri.parse('/time-slots')
        .replace(queryParameters: {'plan': planString, 'date': dateString});
    print("Fetching time slots from: $url");
    try {
      final response = await http.get(url).timeout(const Duration(seconds: 15));
      if (!mounted) return;
      print("Time Slots API Status: ${response.statusCode}");
      if (response.statusCode == 200) {
        if (response.body.trim().isEmpty) {
          throw Exception("Empty response from time slot API.");
        }
        final decodedResponse =
            jsonDecode(response.body) as Map<String, dynamic>;
        if (decodedResponse['status'] == 'success' &&
            decodedResponse['data'] is List) {
          final List<dynamic> dataList = decodedResponse['data'];
          final List<TimeSlotData> slots = dataList
              .map((jsonItem) =>
                  TimeSlotData.fromJson(jsonItem as Map<String, dynamic>))
              .toList();
          setState(() {
            _availableTimeSlots = slots;
            _isLoadingTimeSlots = false;
          });
        } else {
          throw Exception(decodedResponse['message'] ??
              'API returned failure or invalid data.');
        }
      } else {
        throw Exception(
            'Failed to load time slots (Code: ${response.statusCode})');
      }
    } catch (e) {
      if (!mounted) return;
      String errorMessage = "An error occurred: ${e.toString()}";
      if (e is TimeoutException) {
        errorMessage = "Request timed out.";
      } else if (e is http.ClientException) {
        errorMessage = "Network error.";
      } else if (e is FormatException) {
        errorMessage = "Error reading data.";
      }
      print("Error fetching time slots: $e");
      setState(() {
        _timeSlotsError = errorMessage;
        _isLoadingTimeSlots = false;
      });
    }
  }

  Future<void> _fetchUnavailableDates() async {
    if (!mounted) return;
    setState(() {
      _isFetchingUnavailableDates = true;
      _fetchUnavailableDatesError = null;
    });
    final url = Uri.parse('/cancelled-dates');
    print("Fetching unavailable premium dates from: $url");
    try {
      final response = await http.get(url).timeout(const Duration(seconds: 15));
      if (!mounted) return;
      print("getDates API Response Status: ${response.statusCode}");
      if (response.statusCode == 200) {
        if (response.body.trim().isEmpty) {
          throw Exception("Empty response from getDates API.");
        }
        final decodedResponse = jsonDecode(response.body);
        if (decodedResponse is Map<String, dynamic> &&
            decodedResponse['success'] == true &&
            decodedResponse['dates'] is List) {
          final List<dynamic> datesList = decodedResponse['dates'];
          final Set<String> unavailable =
              Set<String>.from(datesList.map((date) => date.toString()));
          setState(() {
            _unavailablePremiumDates = unavailable;
            _isFetchingUnavailableDates = false;
            print("Unavailable premium dates set: $_unavailablePremiumDates");
          });
        } else {
          throw Exception(decodedResponse['message'] ??
              'Invalid data format from getDates API.');
        }
      } else {
        throw Exception(
            'Failed to load unavailable dates (Code: ${response.statusCode})');
      }
    } catch (e) {
      print("Error fetching unavailable premium dates: $e");
      if (mounted) {
        setState(() {
          _fetchUnavailableDatesError = 'Could not check premium availability.';
          _isFetchingUnavailableDates = false;
          _unavailablePremiumDates = {};
        });
      }
    }
  }

  Future<void> _selectDate(BuildContext context) async {
    final now = DateTime.now();
    final today = DateTime(now.year, now.month, now.day);
    final initialDatePickerDate = _selectedDate ?? today;
    final lastSelectableDate = today.add(const Duration(days: 7));
    final DateTime? picked = await showDatePicker(
      context: context,
      initialDate: initialDatePickerDate,
      firstDate: today,
      lastDate: lastSelectableDate,
      selectableDayPredicate: (DateTime day) {
        // if (day.weekday == DateTime.sunday) return false; // Allow Sunday selection
        if (_selectedConsultation == ConsultationType.premium &&
            DateUtils.isSameDay(day, today)) {
          return false;
        }
        return true;
      },
      builder: (context, child) {
        return Theme(
          data: Theme.of(context).copyWith(
              colorScheme: const ColorScheme.light(
                  primary: _secondaryTeal,
                  onPrimary: Colors.white,
                  onSurface: _textPrimary),
              textButtonTheme: TextButtonThemeData(
                  style: TextButton.styleFrom(
                      foregroundColor: _secondaryTeal))),
          child: child!,
        );
      },
    );
    if (picked != null) {
      if (_selectedDate == null ||
          !DateUtils.isSameDay(picked, _selectedDate)) {
        if (mounted) {
          setState(() {
            _selectedDate = picked;
            _dateController.text = DateFormat('MM/dd/yyyy').format(picked);
            _selectedTimeSlot = null;
            _timeSlotsError = null;
            _fetchUnavailableDatesError = null;
          });
          _fetchTimeSlots();
          _fetchUnavailableDates();
        }
      }
      if (_selectedConsultation == ConsultationType.premium &&
          DateUtils.isSameDay(picked, today)) {
        _showShiftedDateSnackBar(
            message:
                'Premium plan cannot be booked for today. Please select a future date.');
      }
    }
  }

  void _showShiftedDateSnackBar(
      {String message =
          'Premium plan cannot be booked for today. Date shifted to tomorrow.'}) {
    ScaffoldMessenger.of(context).removeCurrentSnackBar();
      ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: _warningAmber,
        duration: const Duration(seconds: 4),
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12.0)),
      ),
    );
  }

  String _formatTimeSlot(String rawTimeSlot) {
    try {
      // Assuming rawTimeSlot is in "HH:mm:ss" format
      final timeParts = rawTimeSlot.split(':');
      if (timeParts.length >= 2) {
        final hour = int.parse(timeParts[0]);
        final minute = int.parse(timeParts[1]);
        // Create a DateTime object with a dummy date to use DateFormat
        final dateTime = DateTime(2000, 1, 1, hour, minute);
        return DateFormat('h:mm a').format(dateTime); // e.g., "4:30 PM"
      }
    } catch (e) {
      print("Error formatting time slot '$rawTimeSlot': $e");
      // Fallback to raw time if formatting fails
      return rawTimeSlot;
    }
    // Fallback if parsing is not as expected
    return rawTimeSlot;
  }

  void _handleAddressSelection(int index) {
    setState(() {
      _selectedMeetingType = MeetingType.inPerson;
      _selectedAddressIndex = index;
    });
  }

  // Generate reference number for payment
  String _generateReferenceNumber() {
    // final now = DateTime.now();
    final random = Random();
    final randomNumber =
        '${String.fromCharCode(random.nextInt(26) + 65)}${random.nextInt(1000).toString().padLeft(3, '0')}';

    return 'AVE_$randomNumber';
  }

  // Get payment amount based on consultation type
  int _getPaymentAmount() {
    switch (_selectedConsultation) {
      case ConsultationType.Advance:
        final val = _paymentValues["advance"];
        return int.tryParse(val ?? "") ?? 0; // if "Free" → 0
      case ConsultationType.premium:
        final val = _paymentValues["premium"];
        return int.tryParse(val ?? "") ?? 0;
      case ConsultationType.basic:
      default:
        return 0;
    }
  }

  // Show payment popup
  void _showPaymentPopup() {
    if (_selectedConsultation == ConsultationType.basic) {
      _submitAppointment();
      return;
    }

    // Generate reference number BEFORE showing the modal
    _referenceNumber = _generateReferenceNumber();
    print('Generated reference number: $_referenceNumber'); // Debug print

    final amount = _getPaymentAmount();
    final planName = _selectedConsultation == ConsultationType.Advance
        ? 'Advance'
        : 'Premium';

    if (amount == 0) {
      // 👉 Free offer bottom sheet only
      showModalBottomSheet(
        context: context,
        isScrollControlled: true,
        backgroundColor: Colors.transparent,
        builder: (context) => _buildFreeOfferBottomSheet(planName),
      );
    } else {
      // 👉 Paid bottom sheet only
      showModalBottomSheet(
        context: context,
        isScrollControlled: true,
        backgroundColor: Colors.transparent,
        builder: (context) => _buildPaymentBottomSheet(amount, planName),
      );
    }
  }

  Widget _buildPaymentBottomSheet(int amount, String planName) {
    const String upiId = 'vyapar.167726728627@hdfcbank';

    // Ensure reference number is available
    final String refNumber =
        _referenceNumber ?? 'AVE${DateTime.now().millisecondsSinceEpoch}';
    // print('Using reference number in payment sheet: $refNumber'); // Debug print

    return Container(
        height: MediaQuery.of(context).size.height * 0.8,
        decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.only(
            topLeft: Radius.circular(20),
            topRight: Radius.circular(20),
          ),
        ),
        child: Column(
          children: [
            // Header with back button
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.grey.shade100,
                borderRadius: const BorderRadius.only(
                  topLeft: Radius.circular(20),
                  topRight: Radius.circular(20),
                ),
              ),
              child: Row(
                children: [
                  IconButton(
                    icon: const Icon(Icons.arrow_back),
                    onPressed: () => Navigator.pop(context),
                  ),
                  const Expanded(
                    child: Text(
                      'Payment Methods',
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.w600,
                      ),
                      textAlign: TextAlign.center,
                    ),
                  ),
                  const SizedBox(width: 48),
                ],
              ),
            ),

            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Plan details
                    Text(
                      planName,
                      style: const TextStyle(
                        fontSize: 24,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 8),
                    if (_selectedDate != null && _selectedTimeSlot != null)
                      Text(
                        'Slot ${DateFormat('dd MMM').format(_selectedDate!)} - ${_formatTimeSlot(_selectedTimeSlot!)}',
                        style: TextStyle(
                          fontSize: 14,
                          color: Colors.grey.shade600,
                        ),
                      ),

                    const SizedBox(height: 24),

                    // Total amount
                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.all(20),
                      decoration: BoxDecoration(
                        color: Colors.blue.shade700,
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Column(
                        children: [
                          const Text(
                            'Total Amount',
                            style: TextStyle(
                              color: Colors.white,
                              fontSize: 16,
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                          const SizedBox(height: 8),
                          Text(
                            '₹$amount',
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 32,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ],
                      ),
                    ),

                    const SizedBox(height: 32),

                    // QR Code and UPI Apps Row
                    Row(
                      children: [
                        // QR Code on the left
                        Expanded(
                          flex: 3,
                          child: Container(
                            padding: const EdgeInsets.all(16),
                            decoration: BoxDecoration(
                              color: Colors.white,
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: Column(
                              children: [
                                QrImageView(
                                  data:
                                      'upi://pay?pa=$upiId&pn=Avisa Experts&cu=INR&tn=Payment for consultation - Ref: $refNumber&am=$amount',
                                  version: QrVersions.auto,
                                  size: 170.0,
                                  backgroundColor: Colors.white,
                                ),
                                const SizedBox(height: 8),
                                const Text(
                                  'Scan QR Code',
                                  style: TextStyle(
                                    fontSize: 12,
                                    fontWeight: FontWeight.w500,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),

                        const SizedBox(width: 1),

                        // UPI Apps on the right
                        Expanded(
                          flex: 2,
                          child: Column(
                            children: [
                              _buildUPIOption(
                                'Google Pay',
                                'assets/icons/gpay.svg',
                                const Color.fromARGB(255, 255, 255, 255),
                                () => _openPaytm(upiId, refNumber, amount),
                              ),
                              const SizedBox(height: 12),
                              _buildUPIOption(
                                'PhonePe',
                                'assets/icons/phonepe.svg',
                                const Color.fromARGB(255, 255, 255, 255),
                                () => _openPaytm(upiId, refNumber, amount),
                              ),
                              const SizedBox(height: 12),
                              _buildUPIOption(
                                'Paytm',
                                'assets/icons/paytm.svg',
                                const Color.fromARGB(255, 255, 255, 255),
                                () => _openPaytm(upiId, refNumber, amount),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),

                    const SizedBox(height: 20),

                    // UPI ID Display
                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: Colors.grey.shade50,
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Row(
                        children: [
                          Expanded(
                            child: SelectableText(
                              // Changed to SelectableText for easier manual copy
                              upiId,
                              style: const TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.w400,
                                color: Color.fromARGB(221, 92, 92, 92),
                                letterSpacing: 1.2,
                              ),
                            ),
                          ),
                          InkWell(
                            onTap: () async {
                              await Clipboard.setData(
                                  ClipboardData(text: upiId));
                              if (mounted) {
                                ScaffoldMessenger.of(context).showSnackBar(
                                  const SnackBar(
                                    content: Text('UPI ID copied to clipboard'),
                                    duration: Duration(seconds: 2),
                                  ),
                                );
                              }
                            },
                            child: Container(
                              padding: const EdgeInsets.all(8),
                              decoration: BoxDecoration(
                                // color: Colors.white,
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: const Icon(
                                Icons.copy,
                                size: 20,
                                color: Colors.grey,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ));
  }

  // 🔧 New widget to handle service image display with caching
  Widget _buildServiceImageWidget() {
    if (!_imagesLoaded) {
      return Container(
        color: _chipBg,
        child: const Center(
          child: SizedBox(
            width: 28,
            height: 28,
            child: CircularProgressIndicator(
              strokeWidth: 2.5,
              valueColor: AlwaysStoppedAnimation<Color>(_secondaryTeal),
            ),
          ),
        ),
      );
    }

    if (_cachedServiceImageUrl != null && _cachedServiceImageUrl!.isNotEmpty) {
      return Image.network(
        _cachedServiceImageUrl!,
        fit: BoxFit.cover,
        width: double.infinity,
        height: 90,
        errorBuilder: (context, error, stackTrace) {
          return Container(
            decoration: const BoxDecoration(
              image: DecorationImage(
                image: AssetImage('assets/service.jpg'),
                fit: BoxFit.cover,
              ),
            ),
          );
        },
        loadingBuilder: (context, child, loadingProgress) {
          if (loadingProgress == null) return child;
          return Container(
            color: Colors.grey.shade200,
            child: const Center(
              child: CircularProgressIndicator(),
            ),
          );
        },
      );
    }

    // Fallback to asset image
    return Container(
      decoration: const BoxDecoration(
        image: DecorationImage(
          image: AssetImage('assets/service.jpg'),
          fit: BoxFit.cover,
        ),
      ),
    );
  }

  Widget _buildFreeOfferBottomSheet(String planName) {
    return Container(
      height: MediaQuery.of(context).size.height * 0.55,
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.only(
          topLeft: Radius.circular(20),
          topRight: Radius.circular(20),
        ),
      ),
      child: Column(
        children: [
          // 🔹 Full Image Header with cached image
          SizedBox(
            height: 180,
            width: double.infinity,
            child: ClipRRect(
              borderRadius: const BorderRadius.only(
                topLeft: Radius.circular(20),
                topRight: Radius.circular(20),
              ),
              child: _buildOfferImageWidget(),
            ),
          ),

          const SizedBox(height: 20),

          // 🔹 Content Section
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 24),
            child: Column(
              children: [
                Text(
                  "You unlocked $planName Consultation for FREE 🎁",
                  style: const TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                    color: Colors.black87,
                  ),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 12),
                const Text(
                  "Enjoy this limited-time offer. Start your free consultation now and make the most of your opportunity!",
                  style: TextStyle(
                    fontSize: 16,
                    color: Colors.black54,
                  ),
                  textAlign: TextAlign.center,
                ),
              ],
            ),
          ),

          const Spacer(),

          // 🔹 Confirm Button
        ],
      ),
    );
  }

  // 🔧 New widget to handle offer image display with caching
  Widget _buildOfferImageWidget() {
    if (!_imagesLoaded) {
      return const Center(
        child: CircularProgressIndicator(color: Colors.white),
      );
    }

    if (_cachedOfferImageUrl != null && _cachedOfferImageUrl!.isNotEmpty) {
      return Image.network(
        _cachedOfferImageUrl!,
        fit: BoxFit.cover,
        errorBuilder: (context, error, stackTrace) {
          return Lottie.asset(
            'assets/background.json',
            fit: BoxFit.cover,
            repeat: true,
            animate: true,
          );
        },
        loadingBuilder: (context, child, loadingProgress) {
          if (loadingProgress == null) return child;
          return const Center(
            child: CircularProgressIndicator(color: Colors.white),
          );
        },
      );
    }

    // Fallback to Lottie animation
    return Lottie.asset(
      'assets/background.json',
      fit: BoxFit.cover,
      repeat: true,
      animate: true,
    );
  }

  // --- UPDATED Submit Appointment Function ---
  Future<void> _submitAppointment() async {
    if (!(_formKey.currentState?.validate() ?? false)) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
          content: Text('Please fix the errors in the form.'),
          backgroundColor: _errorRose,
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.all(Radius.circular(12.0)))));
      return;
    }
    if (_selectedConsultation == null ||
        _selectedDate == null ||
        _selectedTimeSlot == null) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
          content: Text('Please select plan, date, and time slot.'),
          backgroundColor: _warningAmber,
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.all(Radius.circular(12.0)))));
      return;
    }
    if (_selectedMeetingType == MeetingType.inPerson &&
        _selectedAddressIndex == null) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
          content:
              Text('Please select an office location for In-Person meeting.'),
          backgroundColor: _warningAmber,
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.all(Radius.circular(12.0)))));
      return;
    }
    if (_userId == null) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
          content: Text(
              'User session error. Please restart the app or log in again.'),
          backgroundColor: _errorRose,
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.all(Radius.circular(12.0)))));
      return;
    }

    // Check if payment is required for Advance/Premium plans
    // If so, show the payment popup. The _referenceNumber will be generated inside _showPaymentPopup().
    // The function will then proceed to submit the appointment to the backend.
    if ((_selectedConsultation == ConsultationType.Advance ||
            _selectedConsultation == ConsultationType.premium) &&
        _referenceNumber == null) {
      _showPaymentPopup(); // This will generate _referenceNumber and display the payment sheet.
      // The 'return;' statement is intentionally removed: user pays later via ticket page.
    }

    final bool isPremium = _selectedConsultation == ConsultationType.premium;
    final formattedSelectedDate =
        DateFormat('yyyy-MM-dd').format(_selectedDate!);
    final today =
        DateTime(DateTime.now().year, DateTime.now().month, DateTime.now().day);
    if (isPremium && DateUtils.isSameDay(_selectedDate, today)) {
      _showShiftedDateSnackBar(
          message: 'Premium plan cannot be booked for today.');
      return;
    }
    if (isPremium && _unavailablePremiumDates.contains(formattedSelectedDate)) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
          content: Text(
              'Sorry, the selected date is unavailable for the Premium plan.'),
          backgroundColor: Colors.orangeAccent));
      return;
    }
    if (_isLoadingTimeSlots || _isFetchingUnavailableDates) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
          content:
              Text('Please wait while availability information is loading.'),
          backgroundColor: Colors.orangeAccent));
      return;
    }

    if (mounted) {
      setState(() {
        _isSubmitting = true;
      });
    } else {
      return;
    }

    String planString;
    switch (_selectedConsultation!) {
      case ConsultationType.basic:
        planString = 'Basic';
        break;
      case ConsultationType.Advance:
        planString = 'Advance';
        break;
      case ConsultationType.premium:
        planString = 'Premium';
        break;
    }
    String modeString =
        _selectedMeetingType == MeetingType.online ? 'online' : 'offline';
    String addressString = (_selectedMeetingType == MeetingType.inPerson &&
            _selectedAddressIndex != null)
        ? _officeAddresses[_selectedAddressIndex!]
        : '';
    String dateString = DateFormat('yyyy-MM-dd').format(_selectedDate!);
    // String currentDateTimeString =
    //     DateFormat('yyyy-MM-dd HH:mm:ss').format(DateTime.now()); // OLD LOGIC

    // --- >>> MODIFIED: Construct datetime from selected date and time slot <<< ---
    String appointmentDateTimeString;
    if (_selectedDate != null && _selectedTimeSlot != null) {
      try {
        // Parse the time slot (e.g., "16:30:00")
        final timeParts = _selectedTimeSlot!.split(':');
        final hour = int.parse(timeParts[0]);
        final minute = int.parse(timeParts[1]);
        final second = int.parse(timeParts[2]);

        // Combine with _selectedDate
        final DateTime finalDateTime = DateTime(
          _selectedDate!.year,
          _selectedDate!.month,
          _selectedDate!.day,
          hour,
          minute,
          second,
        );
        appointmentDateTimeString =
            DateFormat('yyyy-MM-dd HH:mm:ss').format(finalDateTime);
      } catch (e) {
        print(
            "Error constructing appointmentDateTimeString: $e. Falling back to current time.");
        // Fallback to current date and time if parsing fails, though this should be rare
        appointmentDateTimeString =
            DateFormat('yyyy-MM-dd HH:mm:ss').format(DateTime.now());
      }
    } else {
      // Fallback if date or time slot is somehow null (should be caught by earlier checks)
      print(
          "Warning: _selectedDate or _selectedTimeSlot is null during submission. Falling back to current time for 'datetime'.");
      appointmentDateTimeString =
          DateFormat('yyyy-MM-dd HH:mm:ss').format(DateTime.now());
    }
    // --- <<< END MODIFIED >>> ---

    final Map<String, String> requestBody = {
      'user_id': _userId!.toString(),
      'name': _nameController.text.trim(),
      'selected_plan': planString,
      'email': _emailController.text.trim(),
      'contact': _mobileController.text.trim(),
      'date': dateString,
      'mode': modeString,
      'address': addressString,
      'time_slot': _selectedTimeSlot!,
      'querry': _notesController.text.trim(),

      // 'querry': _referenceNumber != null
      //     ? _notesController.text.trim()
      //     : 'VISA',
      'datetime': appointmentDateTimeString,
      'reference_number':
          _referenceNumber ?? '', // Use generated reference number
    };
    print("Submitting booking data: $requestBody");

    final url = Uri.parse('/appointments');
    String? successMessage;
    String? errorMessage;
    try {
      final response = await http
          .post(
            url,
            body: requestBody,
          )
          .timeout(const Duration(seconds: 20));
      if (!mounted) return;
      print("Booking API Status Code: ${response.statusCode}");
      print("Booking API Response Body Raw: >>${response.body}<<");
      if (response.statusCode == 200) {
        if (response.body.trim().isEmpty) {
          errorMessage = 'Booking failed: Empty server response.';
        } else {
          try {
            final decodedResponse =
                jsonDecode(response.body) as Map<String, dynamic>;
            if (decodedResponse['status'] == 'success') {
              successMessage = decodedResponse['message'] ??
                  'Appointment booked successfully!';
              // --- >>> MODIFIED: Fetch new total count from API <<< ---
              if (_userId != null) {
                print(
                    "Appointment success, fetching new total ticket count from API.");
                // Use the fetchTicketCountFromApi function from app_notifiers.dart
                final newTotalCount = await fetchTicketCountFromApi(_userId!);
                ticketCountNotifier.value =
                    newTotalCount; // Update the global notifier
                print(
                    "Updated ticketCountNotifier to: $newTotalCount from API after booking.");
                // No SharedPreferences saving for count here.
              } else {
                print(
                    "Error: _userId is null after booking, cannot fetch new count. Incrementing locally as fallback.");
                // Fallback: increment locally if API fetch isn't possible (though _userId should always be present here)
                ticketCountNotifier.value++;
              }
              // --- <<< END MODIFIED >>> ---

              // Call the callback if booking was successful
              if (widget.onBookingSuccess != null) {
                widget.onBookingSuccess!();
              }
            } else {
              errorMessage =
                  'Booking failed: ${decodedResponse['message'] ?? 'Unknown API error'}';
            }
          } catch (jsonError) {
            errorMessage = 'Booking failed: Invalid server response format.';
            print("JSON decode error on booking response: $jsonError");
          }
        }
      } else {
        errorMessage =
            'Booking failed: Server error (Code ${response.statusCode})';
      }
    } catch (e) {
      if (!mounted) return;
      print("Error submitting appointment: $e");
      if (e is TimeoutException) {
        errorMessage = "Request timed out. Please try again.";
      } else if (e is http.ClientException) {
        errorMessage = "Network error. Could not submit.";
      } else {
        errorMessage = "An unexpected error occurred: ${e.toString()}";
      }
    } finally {
      if (mounted) {
        if (successMessage != null) {
          ScaffoldMessenger.of(context).showSnackBar(SnackBar(
              content: Text(successMessage),
              backgroundColor: _successEmerald,
              behavior: SnackBarBehavior.floating,
              shape: const RoundedRectangleBorder(borderRadius: BorderRadius.all(Radius.circular(12.0)))));
          _clearForm();
        } else {
          errorMessage ??= 'An unknown error occurred during submission.';
          ScaffoldMessenger.of(context).showSnackBar(SnackBar(
              content: Text(errorMessage),
              backgroundColor: _errorRose,
              behavior: SnackBarBehavior.floating,
              shape: const RoundedRectangleBorder(borderRadius: BorderRadius.all(Radius.circular(12.0)))));
        }
        setState(() {
          _isSubmitting = false;
        });
      }
    }
  }

  void _clearForm() {
    _formKey.currentState?.reset();
    _nameController.clear();
    _emailController.clear();
    _mobileController.clear();
    _notesController.clear();
    if (mounted) {
      setState(() {
        _selectedConsultation = ConsultationType.Advance;

        // 🔧 Use smart meeting mode selection instead of hardcoded online
        _selectedMeetingType = null; // Reset to null first
        _selectedAddressIndex = null;

        // Apply the same logic as _handleMeetingModeSelection()
        if (_isOnlineEnabled) {
          _selectedMeetingType = MeetingType.online;
          print("Form cleared: Selected online meeting mode");
        } else if (_isOfflineEnabled) {
          _selectedMeetingType = MeetingType.inPerson;
          print("Form cleared: Selected in-person meeting mode");
        } else {
          print("Warning: Both meeting modes are disabled during form clear!");
        }

        _selectedTimeSlot = null;
        _selectedDate = DateTime.now();
        _dateController.text = DateFormat('MM/dd/yyyy').format(_selectedDate!);
        _availableTimeSlots = [];
        _timeSlotsError = null;
        _isLoadingTimeSlots = false;
        _unavailablePremiumDates = {};
        _fetchUnavailableDatesError = null;
        _isFetchingUnavailableDates = false;
        _referenceNumber = null; // Reset reference number
      });
      _fetchTimeSlots();
    }
  }

  void _handleConsultationSelection(ConsultationType selectedValue) {
    if (_isLoadingTimeSlots || _isSubmitting || _isFetchingUnavailableDates) {
      return;
    }
    bool planChanged = _selectedConsultation != selectedValue;
    bool wasPremium = _selectedConsultation == ConsultationType.premium;
    bool isNowPremium = selectedValue == ConsultationType.premium;
    bool shouldShiftToTomorrow = false;
    bool shouldShiftToToday = false;
    DateTime? dateToCheck = _selectedDate;
    final today =
        DateTime(DateTime.now().year, DateTime.now().month, DateTime.now().day);
    if (planChanged &&
        isNowPremium &&
        dateToCheck != null &&
        DateUtils.isSameDay(dateToCheck, today)) {
      shouldShiftToTomorrow = true;
      print(
          "Plan selection: Switching TO Premium on today's date. Will shift date.");
    }
    if (planChanged &&
        wasPremium &&
        !isNowPremium &&
        dateToCheck != null &&
        !DateUtils.isSameDay(dateToCheck, today)) {
      shouldShiftToToday = true;
      print(
          "Plan selection: Switching FROM Premium when date was not today. Will shift date back to today.");
    }
    if (mounted) {
      setState(() {
        _selectedConsultation = selectedValue;
        _selectedTimeSlot = null;
        if (shouldShiftToTomorrow) {
          final tomorrow = today.add(const Duration(days: 1));
          _selectedDate = tomorrow;
          _dateController.text = DateFormat('MM/dd/yyyy').format(tomorrow);
        } else if (shouldShiftToToday) {
          _selectedDate = today;
          _dateController.text = DateFormat('MM/dd/yyyy').format(today);
        }
        if (planChanged || shouldShiftToTomorrow || shouldShiftToToday) {
          _timeSlotsError = null;
          _fetchUnavailableDatesError = null;
        }
      });
    }
    if (planChanged || shouldShiftToTomorrow || shouldShiftToToday) {
      if (_selectedDate != null) {
        _fetchTimeSlots();
        if (isNowPremium) {
          _fetchUnavailableDates();
        } else if (wasPremium) {
          if (mounted) {
            setState(() {
              _unavailablePremiumDates = {};
              _fetchUnavailableDatesError = null;
              _isFetchingUnavailableDates = false;
            });
          }
        }
      }
    }
    if (shouldShiftToTomorrow && mounted) {
      _showShiftedDateSnackBar();
    }
  }

  Future<String?> _fetchOfferImage() async {
    try {
      final response = await http
          .get(
            Uri.parse(
                "https://avisaexperts.com/Dev_Acess/offer_image.php"), // replace with your actual API endpoint
          )
          .timeout(const Duration(seconds: 10));

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        if (data['success'] == true && data['image_url'] != null) {
          return data['image_url'].toString();
        }
      }
      return null;
    } catch (e) {
      print("Error fetching offer image: $e");
      return null;
    }
  }

  Future<String?> _fetchServiceImage() async {
    try {
      final response = await http.get(
        Uri.parse(
            "https://avisaexperts.com/Dev_Acess/offer_image.php"), // replace with your actual API endpoint
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        if (data['success'] == true && data['image_url'] != null) {
          return data['image_url'].toString();
        }
      }
      return null;
    } catch (e) {
      print("Error fetching service image: $e");
      return null;
    }
  }

  @override
  Widget build(BuildContext context) {
    final bool isPremium = _selectedConsultation == ConsultationType.premium;
    if (isPremium && _selectedDate != null) {
      DateFormat('yyyy-MM-dd').format(_selectedDate!);
    }
    return Scaffold(
        appBar: GlobalAppBar(
          userName: _userName,
          userImagePath: _userImagePath,
          showBackButton: true,
          onNotificationTap: null,
        ),
        backgroundColor: _bgLight,
        body: Stack(
          children: [
            RefreshIndicator(
              onRefresh: () async {
                await _fetchTimeSlots();
                await _fetchUnavailableDates();
                await _fetchPaymentValues();
                await _fetchMeetingModes(); // 👈 refresh meeting modes
                // 🔧 Only refresh images if user explicitly pulls to refresh
                await _loadImages();
              },
              child: SingleChildScrollView(
                child: Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Form(
                    key: _formKey,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Container(
                          height: 90,
                          decoration: BoxDecoration(
                            borderRadius: const BorderRadius.vertical(
                                top: Radius.circular(16.0),
                                bottom: Radius.circular(16.0)),
                          ),
                          child: ClipRRect(
                            borderRadius: const BorderRadius.vertical(
                                top: Radius.circular(16.0),
                                bottom: Radius.circular(16.0)),
                            child: _buildServiceImageWidget(),
                          ),
                        ),
                        const SizedBox(height: 16),
                        _buildConsultationCard(
                            title: 'Basic Consultation',
                            priceTag: 'Free',
                            value: ConsultationType.basic,
                            onTap: () => _handleConsultationSelection(
                                ConsultationType.basic),
                            details: const [
                              '10 minutes consultation',
                              'Basic visa information',
                              'General Guidance'
                            ]),
                        const SizedBox(height: 12),
                        _buildConsultationCard(
                          title: 'Advance Consultation',
                          priceTag:
                              '₹ ${_paymentValues["advance"] ?? 1000}', // 👈 dynamic from API
                          value: ConsultationType.Advance,
                          onTap: () => _handleConsultationSelection(
                              ConsultationType.Advance),
                          details: const [
                            '15 minutes detailed consultation',
                            'Document review',
                            'Application assistance'
                          ],
                        ),
                        const SizedBox(height: 12),
                        _buildConsultationCard(
                          title: 'Premium Consultation',
                          priceTag:
                              '₹ ${_paymentValues["premium"] ?? 1500}', // 👈 dynamic from API
                          value: ConsultationType.premium,
                          onTap: () => _handleConsultationSelection(
                              ConsultationType.premium),
                          details: const [
                            '30 minutes comprehensive consultation',
                            'Priority document review',
                            'Complete application support',
                            'Follow-up session'
                          ],
                        ),
                        const SizedBox(height: 24),
                        _buildSectionHeader(
                          icon: Icons.person_outline,
                          title: 'Personal Information',
                          subtitle: 'Fill in your details for the consultation',
                        ),
                        const SizedBox(height: 16),
                        _buildTextField(
                            controller: _nameController,
                            label: 'Full Name',
                            hint: 'Enter your full name',
                            icon: Icons.person_outline,
                            validator: (v) {
                              if (v == null || v.trim().isEmpty) {
                                return 'Name required';
                              }
                              if (v.trim().length < 2) {
                                return 'Enter a valid name';
                              }
                              return null;
                            }),
                        const SizedBox(height: 12),
                        _buildTextField(
                            controller: _emailController,
                            label: 'Email Address',
                            hint: 'Enter your email',
                            icon: Icons.email_outlined,
                            keyboardType: TextInputType.emailAddress,
                            validator: (v) {
                              if (v == null || v.trim().isEmpty) {
                                return 'Email required';
                              }
                              if (!EmailValidator.validate(v.trim())) {
                                return 'Enter a valid email address';
                              }
                              return null;
                            }),
                        const SizedBox(height: 12),
                        _buildTextField(
                            controller: _mobileController,
                            label: 'Mobile Number',
                            hint: 'Enter your mobile number',
                            icon: Icons.phone_outlined,
                            keyboardType: TextInputType.phone,
                            validator: (v) {
                              if (v == null || v.trim().isEmpty) {
                                return 'Phone number required';
                              }
                              final phoneDigits =
                                  v.replaceAll(RegExp(r'\D'), '');
                              if (phoneDigits.length != 10) {
                                return 'Enter a valid 10-digit phone number';
                              }
                              return null;
                            }),
                        const SizedBox(height: 12),
                        _buildDateField(
                            controller: _dateController,
                            label: 'Preferred Date',
                            hint: 'MM/DD/YYYY',
                            context: context),
                        const SizedBox(height: 24),
                        _buildSectionHeader(
                          icon: Icons.meeting_room_outlined,
                          title: 'Select Mode of Meeting',
                          subtitle: 'Choose your preferred way to connect with our experts',
                        ),
                        const SizedBox(height: 16),
                        _buildMeetingModeCard(
                            title: 'Online Meeting',
                            subtitle: 'Connect with our expert from anywhere',
                            icon: Icons.language,
                            value: MeetingType.online,
                            isRecommended: true,
                            features: [
                              'HD Video Quality',
                              'Screen Sharing',
                              'No Travel Required',
                              'Instant Meeting Links'
                            ]),
                        _buildMeetingModeCard(
                            title: 'Office Visit Meeting',
                            subtitle:
                                'Visit our office for an In-person consultation',
                            icon: Icons.location_city_outlined,
                            value: MeetingType.inPerson,
                            addresses: _officeAddresses),
                        const SizedBox(height: 24),
                        _buildSectionHeader(
                          icon: Icons.schedule_outlined,
                          title: 'Available Time Slots',
                          subtitle: 'Pick a convenient time for your consultation',
                        ),
                        _buildTimeSlotSection(),
                        const SizedBox(height: 24),
                        _buildSectionHeader(
                          icon: Icons.edit_note_outlined,
                          title: 'Additional Notes',
                          subtitle: 'Any specific requirements or questions?',
                        ),
                        TextFormField(
                            controller: _notesController,
                            enabled: !_isSubmitting,
                            style: const TextStyle(
                              fontSize: 14,
                              color: _textPrimary,
                              fontWeight: FontWeight.w400,
                            ),
                            decoration: InputDecoration(
                                hintText:
                                    'Describe your visa requirements, questions, or anything we should know...',
                                hintStyle: const TextStyle(
                                  color: _textMuted,
                                  fontSize: 14,
                                  fontWeight: FontWeight.w400,
                                ),
                                border: OutlineInputBorder(
                                    borderRadius: BorderRadius.circular(14.0),
                                    borderSide: const BorderSide(
                                        color: _cardBorder, width: 1.2)),
                                enabledBorder: OutlineInputBorder(
                                    borderRadius: BorderRadius.circular(14.0),
                                    borderSide: const BorderSide(
                                        color: _cardBorder, width: 1.2)),
                                focusedBorder: OutlineInputBorder(
                                    borderRadius: BorderRadius.circular(14.0),
                                    borderSide: const BorderSide(
                                        color: _secondaryTeal,
                                        width: 2.0)),
                                filled: true,
                                fillColor: _isSubmitting ? _chipBg : Colors.white,
                                contentPadding: const EdgeInsets.symmetric(
                                    horizontal: 16, vertical: 14)),
                            maxLines: 4),
                        const SizedBox(height: 32),
                        Container(
                          width: double.infinity,
                          decoration: BoxDecoration(
                            borderRadius: BorderRadius.circular(16.0),
                            gradient: (_isSubmitting ||
                                    _isLoadingTimeSlots ||
                                    _isFetchingUnavailableDates)
                                ? null
                                : const LinearGradient(
                                    colors: [_primaryNavy, _secondaryTeal],
                                    begin: Alignment.centerLeft,
                                    end: Alignment.centerRight,
                                  ),
                          ),
                          child: ElevatedButton(
                            style: ElevatedButton.styleFrom(
                              backgroundColor: Colors.transparent,
                              foregroundColor: Colors.white,
                              shadowColor: Colors.transparent,
                              padding:
                                  const EdgeInsets.symmetric(vertical: 18.0),
                              shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(16.0)),
                              textStyle: const TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.w700,
                                letterSpacing: 0.5,
                              ),
                              disabledBackgroundColor: _textMuted.withOpacity(0.3),
                            ),
                            onPressed: (_isSubmitting ||
                                    _isLoadingTimeSlots ||
                                    _isFetchingUnavailableDates)
                                ? null
                                : () {
                                    _submitAppointment();
                                  },
                            child: (_isSubmitting ||
                                    _isLoadingTimeSlots ||
                                    _isFetchingUnavailableDates)
                                ? const SizedBox(
                                    height: 22,
                                    width: 22,
                                    child: CircularProgressIndicator(
                                        strokeWidth: 2.5,
                                        color: Colors.white))
                                : const Row(
                                    mainAxisAlignment: MainAxisAlignment.center,
                                    children: [
                                      Icon(Icons.calendar_month_outlined,
                                          size: 20, color: Colors.white),
                                      SizedBox(width: 10),
                                      Text('Schedule Appointment',
                                          style: TextStyle(color: Colors.white)),
                                    ],
                                  ),
                          ),
                        ),
                        const SizedBox(height: 16),
                        const Center(
                            child: Text(
                                'By scheduling, you agree to our Terms of Service and Privacy Policy',
                                textAlign: TextAlign.center,
                                style: TextStyle(
                                    color: _textMuted,
                                    fontSize: 12,
                                    fontWeight: FontWeight.w400,
                                    height: 1.5,
                                ))),
                        const SizedBox(height: 20),
                    ],
                  ),
                ),
              ),
            ),
          ),
            const FloatingChatBox(),
          ],
        ));
  }

  Widget _buildConsultationCard(
      {required String title,
      required String priceTag,
      required List<String> details,
      required ConsultationType value,
      required VoidCallback onTap}) {
    bool isSelected = _selectedConsultation == value;

    // Icon mapping for each consultation type
    IconData cardIcon;
    switch (value) {
      case ConsultationType.basic:
        cardIcon = Icons.chat_bubble_outline;
        break;
      case ConsultationType.Advance:
        cardIcon = Icons.video_call_outlined;
        break;
      case ConsultationType.premium:
        cardIcon = Icons.workspace_premium_outlined;
        break;
    }

    return AnimatedContainer(
      duration: const Duration(milliseconds: 300),
      curve: Curves.easeInOut,
      margin: const EdgeInsets.only(bottom: 12),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(16.0),
          child: Container(
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(16.0),
              gradient: isSelected
                  ? const LinearGradient(
                      colors: [_primaryNavy, _secondaryTeal],
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    )
                  : null,
              color: isSelected ? null : Colors.white,
              border: Border.all(
                color: isSelected ? _secondaryTeal : _cardBorder,
                width: isSelected ? 2.0 : 1.0,
              ),
              boxShadow: isSelected
                  ? [
                      BoxShadow(
                        color: _secondaryTeal.withOpacity(0.25),
                        blurRadius: 16,
                        offset: const Offset(0, 6),
                      ),
                    ]
                  : [
                      BoxShadow(
                        color: Colors.black.withOpacity(0.04),
                        blurRadius: 8,
                        offset: const Offset(0, 2),
                      ),
                    ],
            ),
            child: Padding(
              padding: const EdgeInsets.all(18.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.all(8.0),
                            decoration: BoxDecoration(
                              color: isSelected
                                  ? _accentGold.withOpacity(0.2)
                                  : _secondaryTeal.withOpacity(0.1),
                              borderRadius: BorderRadius.circular(10.0),
                            ),
                            child: Icon(
                              cardIcon,
                              size: 20,
                              color: isSelected ? _accentGold : _secondaryTeal,
                            ),
                          ),
                          const SizedBox(width: 10),
                          Container(
                            padding: const EdgeInsets.symmetric(
                                horizontal: 10.0, vertical: 5.0),
                            decoration: BoxDecoration(
                              color: isSelected
                                  ? _accentGold.withOpacity(0.15)
                                  : _chipBg,
                              borderRadius: BorderRadius.circular(8.0),
                              border: isSelected
                                  ? Border.all(
                                      color: _accentGold.withOpacity(0.3))
                                  : null,
                            ),
                            child: Text(
                              priceTag,
                              style: TextStyle(
                                fontSize: 12,
                                color: isSelected ? _accentGold : _primaryNavy,
                                fontWeight: FontWeight.w700,
                              ),
                            ),
                          ),
                        ],
                      ),
                      AnimatedContainer(
                        duration: const Duration(milliseconds: 250),
                        width: 24,
                        height: 24,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          color: isSelected ? _accentGold : Colors.transparent,
                          border: Border.all(
                            color: isSelected ? _accentGold : _textMuted,
                            width: 2.0,
                          ),
                        ),
                        child: isSelected
                            ? const Icon(
                                Icons.check,
                                size: 16,
                                color: _primaryNavy,
                              )
                            : null,
                      ),
                    ],
                  ),
                  const SizedBox(height: 14),
                  Text(
                    title,
                    style: TextStyle(
                      fontSize: 17,
                      fontWeight: FontWeight.w700,
                      color: isSelected ? Colors.white : _textPrimary,
                    ),
                  ),
                  const SizedBox(height: 12),
                  ...details.map((detail) => Padding(
                        padding: const EdgeInsets.only(bottom: 8.0),
                        child: Row(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Padding(
                              padding: const EdgeInsets.only(top: 2.0),
                              child: Icon(
                                Icons.check_circle,
                                size: 16,
                                color: isSelected
                                    ? Colors.white.withOpacity(0.9)
                                    : _secondaryTeal,
                              ),
                            ),
                            const SizedBox(width: 10),
                            Expanded(
                              child: Text(
                                detail,
                                style: TextStyle(
                                  fontSize: 13.5,
                                  color: isSelected
                                      ? Colors.white.withOpacity(0.92)
                                      : _textSecondary,
                                  height: 1.4,
                                  fontWeight: FontWeight.w400,
                                ),
                              ),
                            ),
                          ],
                        ),
                      )),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildTextField(
      {required TextEditingController controller,
      required String label,
      required String hint,
      required IconData icon,
      TextInputType keyboardType = TextInputType.text,
      String? Function(String?)? validator,
      bool obscureText = false}) {
    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Text(label,
          style: const TextStyle(
              fontSize: 13,
              fontWeight: FontWeight.w600,
              color: _textPrimary,
              letterSpacing: 0.3)),
      const SizedBox(height: 8),
      TextFormField(
          controller: controller,
          keyboardType: keyboardType,
          obscureText: obscureText,
          enabled: !_isSubmitting,
          style: const TextStyle(
            fontSize: 14,
            color: _textPrimary,
            fontWeight: FontWeight.w500,
          ),
          decoration: InputDecoration(
            prefixIcon: Container(
              margin: const EdgeInsets.only(left: 12, right: 8),
              child: Icon(icon, color: _secondaryTeal, size: 20),
            ),
            hintText: hint,
            hintStyle: const TextStyle(
              color: _textMuted,
              fontSize: 14,
              fontWeight: FontWeight.w400,
            ),
            filled: true,
            fillColor: _isSubmitting ? _chipBg : Colors.white,
            contentPadding:
                const EdgeInsets.symmetric(vertical: 16, horizontal: 12),
            border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(14),
                borderSide: const BorderSide(color: _cardBorder, width: 1.2)),
            enabledBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(14),
                borderSide: const BorderSide(color: _cardBorder, width: 1.2)),
            focusedBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(14),
                borderSide: const BorderSide(color: _secondaryTeal, width: 2.0)),
            errorBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(14),
                borderSide: const BorderSide(color: _errorRose, width: 1.5)),
            focusedErrorBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(14),
                borderSide: const BorderSide(color: _errorRose, width: 2.0)),
            disabledBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(14),
                borderSide: const BorderSide(color: _cardBorder, width: 1.2)),
          ),
          validator: validator)
    ]);
  }

  Widget _buildDateField(
      {required TextEditingController controller,
      required String label,
      required String hint,
      required BuildContext context}) {
    VoidCallback? datePickerOnTap =
        _isSubmitting ? null : () => _selectDate(context);
    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Text(label,
          style: const TextStyle(
              fontSize: 13,
              fontWeight: FontWeight.w600,
              color: _textPrimary,
              letterSpacing: 0.3)),
      const SizedBox(height: 8),
      TextFormField(
          controller: controller,
          readOnly: true,
          onTap: datePickerOnTap,
          style: const TextStyle(
            fontSize: 14,
            color: _textPrimary,
            fontWeight: FontWeight.w500,
          ),
          decoration: InputDecoration(
              hintText: hint,
              hintStyle: const TextStyle(
                color: _textMuted,
                fontSize: 14,
                fontWeight: FontWeight.w400,
              ),
              prefixIcon: Container(
                margin: const EdgeInsets.only(left: 12, right: 8),
                child: const Icon(
                  Icons.calendar_today_outlined,
                  color: _secondaryTeal,
                  size: 20,
                ),
              ),
              border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(14.0),
                  borderSide: const BorderSide(color: _cardBorder, width: 1.2)),
              enabledBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(14.0),
                  borderSide: const BorderSide(color: _cardBorder, width: 1.2)),
              focusedBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(14.0),
                  borderSide: const BorderSide(color: _secondaryTeal, width: 2.0)),
              errorBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(14.0),
                  borderSide: const BorderSide(color: _errorRose, width: 1.5)),
              focusedErrorBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(14.0),
                  borderSide: const BorderSide(color: _errorRose, width: 2.0)),
              disabledBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(14.0),
                  borderSide: const BorderSide(color: _cardBorder, width: 1.2)),
              filled: true,
              fillColor: _isSubmitting ? _chipBg : Colors.white,
              contentPadding:
                  const EdgeInsets.symmetric(vertical: 16.0, horizontal: 12.0)),
          validator: (value) {
            if (value == null || value.isEmpty) return 'Please select a date';
            return null;
          })
    ]);
  }

  Widget _buildSectionHeader({
    required IconData icon,
    required String title,
    required String subtitle,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Container(
              padding: const EdgeInsets.all(8.0),
              decoration: BoxDecoration(
                color: _secondaryTeal.withOpacity(0.1),
                borderRadius: BorderRadius.circular(10.0),
              ),
              child: Icon(
                icon,
                size: 20,
                color: _secondaryTeal,
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: const TextStyle(
                      fontSize: 17,
                      fontWeight: FontWeight.w700,
                      color: _textPrimary,
                      letterSpacing: 0.2,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    subtitle,
                    style: const TextStyle(
                      fontSize: 13,
                      color: _textSecondary,
                      fontWeight: FontWeight.w400,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
        const SizedBox(height: 12),
        Container(
          height: 1.5,
          decoration: BoxDecoration(
            gradient: LinearGradient(
              colors: [
                _secondaryTeal.withOpacity(0.4),
                _secondaryTeal.withOpacity(0.05),
              ],
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildMeetingModeCard(
      {required String title,
      required String subtitle,
      required IconData icon,
      required MeetingType value,
      List<String>? features,
      List<String>? addresses,
      bool isRecommended = false}) {
    bool isCardSelected = _selectedMeetingType == value;

    bool isEnabled = true;
    if (value == MeetingType.online) isEnabled = _isOnlineEnabled;
    if (value == MeetingType.inPerson) isEnabled = _isOfflineEnabled;

    VoidCallback? cardOnTap = (_isSubmitting || !isEnabled)
        ? null
        : () {
            setState(() {
              _selectedMeetingType = value;
              if (value == MeetingType.online) {
                _selectedAddressIndex = null;
              }
            });
          };

    return AnimatedContainer(
      duration: const Duration(milliseconds: 300),
      curve: Curves.easeInOut,
      margin: const EdgeInsets.only(bottom: 14.0),
      child: Opacity(
        opacity: isEnabled ? 1.0 : 0.45,
        child: Material(
          color: Colors.transparent,
          child: InkWell(
            onTap: cardOnTap,
            borderRadius: BorderRadius.circular(16.0),
            child: Container(
              decoration: BoxDecoration(
                color: isCardSelected ? Colors.white : _chipBg,
                borderRadius: BorderRadius.circular(16.0),
                border: Border.all(
                  color: isCardSelected ? _secondaryTeal : _cardBorder,
                  width: isCardSelected ? 2.0 : 1.2,
                ),
                boxShadow: isCardSelected
                    ? [
                        BoxShadow(
                          color: _secondaryTeal.withOpacity(0.15),
                          blurRadius: 16,
                          offset: const Offset(0, 6),
                        ),
                      ]
                    : [
                        BoxShadow(
                          color: Colors.black.withOpacity(0.03),
                          blurRadius: 6,
                          offset: const Offset(0, 2),
                        ),
                      ],
              ),
              child: Padding(
                padding: const EdgeInsets.all(18.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Container(
                          padding: const EdgeInsets.all(10.0),
                          decoration: BoxDecoration(
                            color: isCardSelected
                                ? _secondaryTeal.withOpacity(0.12)
                                : _primaryNavy.withOpacity(0.06),
                            borderRadius: BorderRadius.circular(12.0),
                          ),
                          child: Icon(
                            icon,
                            color: isEnabled
                                ? (isCardSelected ? _secondaryTeal : _primaryNavy)
                                : _textMuted,
                            size: 26,
                          ),
                        ),
                        const SizedBox(width: 14),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                children: [
                                  Expanded(
                                    child: Text(
                                      title,
                                      style: TextStyle(
                                        fontSize: 16,
                                        fontWeight: FontWeight.w700,
                                        color: isEnabled
                                            ? _textPrimary
                                            : _textMuted,
                                      ),
                                    ),
                                  ),
                                  if (isRecommended && isEnabled)
                                    Container(
                                      padding: const EdgeInsets.symmetric(
                                          horizontal: 10.0, vertical: 4.0),
                                      decoration: BoxDecoration(
                                        color: _successEmerald.withOpacity(0.12),
                                        borderRadius: BorderRadius.circular(20.0),
                                      ),
                                      child: Row(
                                        mainAxisSize: MainAxisSize.min,
                                        children: [
                                          Icon(Icons.star,
                                              size: 12,
                                              color: _successEmerald),
                                          const SizedBox(width: 4),
                                          Text(
                                            'Recommended',
                                            style: TextStyle(
                                              fontSize: 10,
                                              color: _successEmerald,
                                              fontWeight: FontWeight.w700,
                                            ),
                                          ),
                                        ],
                                      ),
                                    )
                                  else if (!isEnabled)
                                    Container(
                                      padding: const EdgeInsets.symmetric(
                                          horizontal: 10.0, vertical: 4.0),
                                      decoration: BoxDecoration(
                                        color: _errorRose.withOpacity(0.1),
                                        borderRadius: BorderRadius.circular(20.0),
                                      ),
                                      child: Text(
                                        'Unavailable',
                                        style: TextStyle(
                                          fontSize: 10,
                                          color: _errorRose,
                                          fontWeight: FontWeight.w700,
                                        ),
                                      ),
                                    ),
                                ],
                              ),
                              const SizedBox(height: 6),
                              Text(
                                subtitle,
                                style: TextStyle(
                                  fontSize: 13,
                                  color: isEnabled ? _textSecondary : _textMuted,
                                  height: 1.4,
                                  fontWeight: FontWeight.w400,
                                ),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(width: 8),
                        AnimatedContainer(
                          duration: const Duration(milliseconds: 250),
                          width: 22,
                          height: 22,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            color: isCardSelected
                                ? _secondaryTeal
                                : Colors.transparent,
                            border: Border.all(
                              color: isCardSelected ? _secondaryTeal : _textMuted,
                              width: 2.0,
                            ),
                          ),
                          child: isCardSelected
                              ? const Icon(
                                  Icons.check,
                                  size: 14,
                                  color: Colors.white,
                                )
                              : null,
                        ),
                      ],
                    ),
                    if ((features != null ||
                            (addresses != null && addresses.isNotEmpty)) &&
                        isEnabled)
                      Padding(
                        padding: const EdgeInsets.only(top: 14.0, bottom: 4.0),
                        child: Divider(
                          height: 1,
                          color: isCardSelected
                              ? _secondaryTeal.withOpacity(0.15)
                              : _cardBorder,
                        ),
                      ),
                    if (features != null &&
                        value == MeetingType.online &&
                        isEnabled)
                      Column(
                        children: features
                            .map((feature) => Padding(
                                  padding: const EdgeInsets.only(bottom: 10.0),
                                  child: Row(
                                    children: [
                                      Icon(
                                        Icons.check_circle,
                                        size: 18,
                                        color: _successEmerald,
                                      ),
                                      const SizedBox(width: 10),
                                      Expanded(
                                        child: Text(
                                          feature,
                                          style: const TextStyle(
                                            fontSize: 13.5,
                                            color: _textSecondary,
                                            fontWeight: FontWeight.w400,
                                            height: 1.4,
                                          ),
                                        ),
                                      ),
                                    ],
                                  ),
                                ))
                            .toList(),
                      ),
                    if (addresses != null &&
                        value == MeetingType.inPerson &&
                        isEnabled)
                      AnimatedOpacity(
                        duration: const Duration(milliseconds: 300),
                        opacity: isCardSelected ? 1.0 : 0.5,
                        child: IgnorePointer(
                          ignoring:
                              !isCardSelected || _isSubmitting || !isEnabled,
                          child: Column(
                            children: addresses.asMap().entries.map((entry) {
                              int index = entry.key;
                              String address = entry.value;
                              bool isAddressSelected =
                                  _selectedAddressIndex == index;
                              return Material(
                                color: Colors.transparent,
                                child: InkWell(
                                  onTap: (_isSubmitting || !isEnabled)
                                      ? null
                                      : () => _handleAddressSelection(index),
                                  borderRadius: BorderRadius.circular(10.0),
                                  child: Container(
                                    margin: const EdgeInsets.only(bottom: 8.0),
                                    padding: const EdgeInsets.all(12.0),
                                    decoration: BoxDecoration(
                                      color: isAddressSelected
                                          ? _secondaryTeal.withOpacity(0.06)
                                          : Colors.transparent,
                                      borderRadius: BorderRadius.circular(10.0),
                                      border: Border.all(
                                        color: isAddressSelected
                                            ? _secondaryTeal.withOpacity(0.3)
                                            : _cardBorder,
                                        width: 1.2,
                                      ),
                                    ),
                                    child: Row(
                                      crossAxisAlignment:
                                          CrossAxisAlignment.start,
                                      children: [
                                        AnimatedContainer(
                                          duration: const Duration(
                                              milliseconds: 200),
                                          width: 20,
                                          height: 20,
                                          decoration: BoxDecoration(
                                            shape: BoxShape.circle,
                                            color: isAddressSelected
                                                ? _secondaryTeal
                                                : Colors.transparent,
                                            border: Border.all(
                                              color: isAddressSelected
                                                  ? _secondaryTeal
                                                  : _textMuted,
                                              width: 2.0,
                                            ),
                                          ),
                                          child: isAddressSelected
                                              ? const Icon(
                                                  Icons.check,
                                                  size: 12,
                                                  color: Colors.white,
                                                )
                                              : null,
                                        ),
                                        const SizedBox(width: 12),
                                        Expanded(
                                          child: Text(
                                            address,
                                            style: TextStyle(
                                              fontSize: 13.5,
                                              color: isAddressSelected
                                                  ? _textPrimary
                                                  : _textSecondary,
                                              height: 1.5,
                                              fontWeight: isAddressSelected
                                                  ? FontWeight.w600
                                                  : FontWeight.w400,
                                            ),
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                ),
                              );
                            }).toList(),
                          ),
                        ),
                      ),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildTimeSlotSection() {
    if (_selectedDate?.weekday == DateTime.sunday) {
      return Container(
        padding: const EdgeInsets.symmetric(vertical: 20.0, horizontal: 16.0),
        decoration: BoxDecoration(
            color: _warningAmber.withOpacity(0.08),
            borderRadius: BorderRadius.circular(14.0),
            border: Border.all(color: _warningAmber.withOpacity(0.25))),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.info_outline, color: _warningAmber, size: 20),
            const SizedBox(width: 10),
            Expanded(
              child: Text(
                'Avisa Experts is closed on Sundays. Please select another date.',
                textAlign: TextAlign.center,
                style: TextStyle(
                  color: _warningAmber,
                  fontSize: 14,
                  fontWeight: FontWeight.w500,
                ),
              ),
            ),
          ],
        ),
      );
    }
    if (_selectedDate == null || _selectedConsultation == null) {
      return Container(
        padding: const EdgeInsets.symmetric(vertical: 24.0, horizontal: 16.0),
        decoration: BoxDecoration(
          color: _chipBg,
          borderRadius: BorderRadius.circular(14.0),
        ),
        child: const Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.event_note_outlined, color: _textMuted, size: 20),
            SizedBox(width: 10),
            Text(
              'Select a consultation plan and date to view time slots',
              textAlign: TextAlign.center,
              style: TextStyle(
                color: _textSecondary,
                fontSize: 14,
                fontWeight: FontWeight.w500,
              ),
            ),
          ],
        ),
      );
    }
    final bool isPremium = _selectedConsultation == ConsultationType.premium;
    final today =
        DateTime(DateTime.now().year, DateTime.now().month, DateTime.now().day);
    if (isPremium && DateUtils.isSameDay(_selectedDate, today)) {
      return Container(
        width: double.infinity,
        padding: const EdgeInsets.symmetric(vertical: 20, horizontal: 16),
        alignment: Alignment.center,
        decoration: BoxDecoration(
            color: _warningAmber.withOpacity(0.08),
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: _warningAmber.withOpacity(0.25))),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.info_outline, color: _warningAmber, size: 20),
            const SizedBox(width: 10),
            Text(
              "Premium plan cannot be booked for today.",
              style: TextStyle(
                color: _warningAmber,
                fontWeight: FontWeight.w600,
              ),
            ),
          ],
        ),
      );
    }
    if (isPremium) {
      if (_isFetchingUnavailableDates) {
      return Container(
        padding: const EdgeInsets.symmetric(vertical: 24.0),
        child: const Center(
          child: SizedBox(
            width: 28,
            height: 28,
            child: CircularProgressIndicator(
              strokeWidth: 2.5,
              valueColor: AlwaysStoppedAnimation<Color>(_secondaryTeal),
            ),
          ),
        ),
      );
      }
      if (_fetchUnavailableDatesError != null) {
      return Container(
        padding: const EdgeInsets.symmetric(vertical: 20.0, horizontal: 16.0),
        decoration: BoxDecoration(
          color: _errorRose.withOpacity(0.06),
          borderRadius: BorderRadius.circular(14.0),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.error_outline, color: _errorRose, size: 20),
            const SizedBox(width: 10),
            Expanded(
              child: Text(
                _fetchUnavailableDatesError!,
                textAlign: TextAlign.center,
                style: const TextStyle(
                  color: _errorRose,
                  fontWeight: FontWeight.w500,
                ),
              ),
            ),
          ],
        ),
      );
      }
      final formattedSelectedDate =
          DateFormat('yyyy-MM-dd').format(_selectedDate!);
      final bool isPremiumDateUnavailable =
          _unavailablePremiumDates.contains(formattedSelectedDate);
      if (isPremiumDateUnavailable) {
      return Container(
        width: double.infinity,
        padding: const EdgeInsets.symmetric(vertical: 20, horizontal: 16),
        alignment: Alignment.center,
        decoration: BoxDecoration(
            color: _warningAmber.withOpacity(0.08),
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: _warningAmber.withOpacity(0.25))),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.event_busy_outlined, color: _warningAmber, size: 20),
            const SizedBox(width: 10),
            Text(
              "No premium meetings available on this day.",
              style: TextStyle(
                color: _warningAmber,
                fontWeight: FontWeight.w600,
              ),
            ),
          ],
        ),
      );
      }
    }
    if (_isLoadingTimeSlots) {
      return Container(
        padding: const EdgeInsets.symmetric(vertical: 24.0),
        child: const Center(
          child: SizedBox(
            width: 28,
            height: 28,
            child: CircularProgressIndicator(
              strokeWidth: 2.5,
              valueColor: AlwaysStoppedAnimation<Color>(_secondaryTeal),
            ),
          ),
        ),
      );
    }
    if (_timeSlotsError != null) {
      return Container(
        padding: const EdgeInsets.symmetric(vertical: 24.0, horizontal: 16.0),
        decoration: BoxDecoration(
          color: _errorRose.withOpacity(0.06),
          borderRadius: BorderRadius.circular(14.0),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.error_outline, color: _errorRose.withOpacity(0.7), size: 32),
            const SizedBox(height: 10),
            Text(
              _timeSlotsError!,
              textAlign: TextAlign.center,
              style: const TextStyle(
                color: _errorRose,
                fontWeight: FontWeight.w600,
                fontSize: 14,
              ),
            ),
            const SizedBox(height: 14),
            ElevatedButton.icon(
              icon: const Icon(Icons.refresh, size: 18),
              label: const Text('Retry'),
              style: ElevatedButton.styleFrom(
                backgroundColor: _errorRose,
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(10.0),
                ),
                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
              ),
              onPressed: _isLoadingTimeSlots ? null : _fetchTimeSlots,
            ),
          ],
        ),
      );
    }
    if (_availableTimeSlots.isEmpty) {
      return Container(
        padding: const EdgeInsets.symmetric(vertical: 24.0, horizontal: 16.0),
        decoration: BoxDecoration(
          color: _chipBg,
          borderRadius: BorderRadius.circular(14.0),
        ),
        child: const Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.schedule_outlined, color: _textMuted, size: 20),
            SizedBox(width: 10),
            Expanded(
              child: Text(
                'No time slots available for the selected date and plan.',
                textAlign: TextAlign.center,
                style: TextStyle(
                  color: _textSecondary,
                  fontWeight: FontWeight.w500,
                  fontSize: 14,
                ),
              ),
            ),
          ],
        ),
      );
    }
    return Wrap(
        spacing: 10.0,
        runSpacing: 10.0,
        children: _availableTimeSlots
            .map((slotData) => _buildTimeSlotChip(slotData))
            .toList());
  }

  Widget _buildTimeSlotChip(TimeSlotData slotData) {
    final String rawTimeValue = slotData.time;
    bool isSelected = _selectedTimeSlot == rawTimeValue;
    bool isBookable = slotData.isBookable;
    final String displayTime = slotData.formattedTime;
    final String labelText = isBookable
        ? '$displayTime  ·  ${slotData.remaining} left'
        : '$displayTime  ·  Full';
    final bool chipEnabled = isBookable &&
        !_isSubmitting &&
        !_isLoadingTimeSlots &&
        !_isFetchingUnavailableDates;

    // Color coding based on availability
    Color chipBgColor;
    Color chipBorderColor;
    Color chipTextColor;
    if (!chipEnabled) {
      chipBgColor = _chipBg;
      chipBorderColor = _cardBorder;
      chipTextColor = _textMuted;
    } else if (isSelected) {
      chipBgColor = _secondaryTeal.withOpacity(0.1);
      chipBorderColor = _secondaryTeal;
      chipTextColor = _secondaryTeal;
    } else if (slotData.remaining <= 2) {
      // Low availability warning
      chipBgColor = _warningAmber.withOpacity(0.08);
      chipBorderColor = _warningAmber.withOpacity(0.4);
      chipTextColor = _warningAmber;
    } else {
      chipBgColor = Colors.white;
      chipBorderColor = _cardBorder;
      chipTextColor = _textPrimary;
    }

    return AnimatedContainer(
      duration: const Duration(milliseconds: 250),
      child: ChoiceChip(
        label: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            if (isSelected)
              const Padding(
                padding: EdgeInsets.only(right: 6.0),
                child: Icon(Icons.check_circle, size: 16, color: _secondaryTeal),
              ),
            Text(labelText),
          ],
        ),
        labelPadding: const EdgeInsets.symmetric(horizontal: 10.0, vertical: 8.0),
        selected: isSelected,
        disabledColor: _chipBg,
        labelStyle: TextStyle(
          color: chipTextColor,
          fontSize: 13,
          fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
          decoration: !isBookable ? TextDecoration.lineThrough : null,
          decorationColor: _textMuted,
        ),
        selectedColor: _secondaryTeal.withOpacity(0.1),
        backgroundColor: chipBgColor,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(10.0),
          side: BorderSide(
            color: chipBorderColor,
            width: isSelected ? 2.0 : 1.2,
          ),
        ),
        onSelected: chipEnabled
            ? (bool selected) {
                if (selected) {
                  setState(() {
                    _selectedTimeSlot = rawTimeValue;
                  });
                }
              }
            : null,
        padding: const EdgeInsets.symmetric(horizontal: 12.0, vertical: 12.0),
        showCheckmark: false,
        elevation: isSelected ? 3.0 : 0.5,
        pressElevation: 4.0,
        shadowColor: isSelected ? _secondaryTeal.withOpacity(0.2) : Colors.black.withOpacity(0.05),
      ),
    );
  }

  // Add the missing _buildUPIOption method
  Widget _buildUPIOption(
    String title,
    String assetPath,
    Color bgColor,
    VoidCallback onTap,
  ) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(10),
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 8),
        decoration: BoxDecoration(
          color: bgColor,
          borderRadius: BorderRadius.circular(10),
          border: Border.all(color: Colors.grey.shade200),
        ),
        child: Row(
          children: [
            SvgPicture.asset(
              assetPath,
              width: 28,
              height: 28,
            ),
            const SizedBox(width: 10),
            Expanded(
              child: Text(
                title,
                style: const TextStyle(
                  fontSize: 15,
                  fontWeight: FontWeight.w500,
                ),
              ),
            ),
            const Icon(Icons.arrow_forward_ios, size: 16, color: Colors.grey),
          ],
        ),
      ),
    );
  }

  // Add the missing _openPaytm method to launch UPI intent
  Future<void> _openPaytm(String upiId, String refNumber, int amount) async {
    final uri =
        'upi://pay?pa=$upiId&pn=Avisa Experts&cu=INR&tn=Payment for consultation - Ref: $refNumber&am=$amount';
    if (await canLaunchUrl(Uri.parse(uri))) {
      await launchUrl(Uri.parse(uri), mode: LaunchMode.externalApplication);
    } else {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Could not launch UPI app.'),
            duration: Duration(seconds: 2),
          ),
        );
      }
    }
  }
}
