import 'package:flutter/material.dart';
import 'dart:typed_data';
import 'package:logger/logger.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:image_picker/image_picker.dart';
import 'package:file_picker/file_picker.dart';
import 'dart:io';
import 'dart:math' as math;
import 'package:dio/dio.dart';
import 'dart:convert';
import 'dart:async';
import 'package:flutter/services.dart';
import 'package:intl/intl.dart';
import 'package:pdfx/pdfx.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:audioplayers/audioplayers.dart';

import '../config/app_config.dart';
import '../consultant/consultant_template_picker.dart';
import '../services/chat_socket_service.dart';
import '../services/webrtc_call_service.dart';
import '../models/app_notifiers.dart';
import '../utils/image_url_resolver.dart';

final logger = Logger(
  printer: PrettyPrinter(
    methodCount: 1,
    errorMethodCount: 3,
    lineLength: 90,
    colors: true,
    printEmojis: true,
    printTime: false,
  ),
);

String fixImageUrl(String? url) {
  if (url == null || url.isEmpty) {
    return '';
  }

  // If already an absolute URL, return as-is
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }

  // Convert relative path to absolute URL
  final String baseUrl = AppConfig.staticAssetBase;

  // Handle both '/img/swati.webp' and 'img/swati.webp' formats
  if (url.startsWith('/')) {
    return '$baseUrl$url';
  } else {
    return '$baseUrl/$url';
  }
}

// FIXED Sound Service Class
class SoundService {
  static final SoundService _instance = SoundService._internal();
  factory SoundService() => _instance;
  SoundService._internal();

  AudioPlayer? _sendPlayer;
  AudioPlayer? _receivePlayer;

  // Play sound when message is sent
  Future<void> playSendSound() async {
    try {
      // Create fresh player for each sound to avoid "Bad state" errors
      await _sendPlayer?.dispose();
      _sendPlayer = AudioPlayer();
      await _sendPlayer!.play(AssetSource('sounds/send_message.mp3'));
    } catch (e) {
      print('Error playing send sound: $e');
    }
  }

  /// Helper function to fix relative image URLs

  // Play sound when message is received
  Future<void> playReceiveSound() async {
    try {
      // Create fresh player for each sound to avoid "Bad state" errors
      await _receivePlayer?.dispose();
      _receivePlayer = AudioPlayer();
      await _receivePlayer!.play(AssetSource('sounds/receive_message.mp3'));
    } catch (e) {
      print('Error playing receive sound: $e');
    }
  }

  Future<void> dispose() async {
    try {
      await _sendPlayer?.dispose();
      await _receivePlayer?.dispose();
      _sendPlayer = null;
      _receivePlayer = null;
    } catch (e) {
      print('Error disposing sound service: $e');
    }
  }
}

// Enhanced Message model
class ChatMessage {
  final String id;
  final String senderId;
  final String senderName;
  final String message;
  final DateTime timestamp;
  final bool isFromCurrentUser;
  final MessageType type;
  final String? imageUrl;
  final String? fileName;
  final String? fileSize;
  final String? filePath;
  final bool isDelivered;
  final bool isRead;
  // Reply metadata
  final String? replyToId;
  final String? replyToContent;
  final String? replyToSenderName;
  final String? replyToImageUrl;
  final String? replyToFileName;
  final MessageType? replyToType;

  ChatMessage({
    required this.id,
    required this.senderId,
    required this.senderName,
    required this.message,
    required this.timestamp,
    required this.isFromCurrentUser,
    this.type = MessageType.text,
    this.imageUrl,
    this.fileName,
    this.fileSize,
    this.filePath,
    this.isDelivered = true,
    this.isRead = false,
    this.replyToId,
    this.replyToContent,
    this.replyToSenderName,
    this.replyToImageUrl,
    this.replyToFileName,
    this.replyToType,
  });

  ChatMessage copyWith({
    String? id,
    String? senderId,
    String? senderName,
    String? message,
    DateTime? timestamp,
    bool? isFromCurrentUser,
    MessageType? type,
    String? imageUrl,
    String? fileName,
    String? fileSize,
    String? filePath,
    bool? isDelivered,
    bool? isRead,
    String? replyToId,
    String? replyToContent,
    String? replyToSenderName,
    String? replyToImageUrl,
    String? replyToFileName,
    MessageType? replyToType,
    bool? clearReplyTo,
  }) {
    return ChatMessage(
      id: id ?? this.id,
      senderId: senderId ?? this.senderId,
      senderName: senderName ?? this.senderName,
      message: message ?? this.message,
      timestamp: timestamp ?? this.timestamp,
      isFromCurrentUser: isFromCurrentUser ?? this.isFromCurrentUser,
      type: type ?? this.type,
      imageUrl: imageUrl ?? this.imageUrl,
      fileName: fileName ?? this.fileName,
      fileSize: fileSize ?? this.fileSize,
      filePath: filePath ?? this.filePath,
      isDelivered: isDelivered ?? this.isDelivered,
      isRead: isRead ?? this.isRead,
      replyToId: (clearReplyTo == true) ? null : (replyToId ?? this.replyToId),
      replyToContent: (clearReplyTo == true) ? null : (replyToContent ?? this.replyToContent),
      replyToSenderName: (clearReplyTo == true) ? null : (replyToSenderName ?? this.replyToSenderName),
      replyToImageUrl: (clearReplyTo == true) ? null : (replyToImageUrl ?? this.replyToImageUrl),
      replyToFileName: (clearReplyTo == true) ? null : (replyToFileName ?? this.replyToFileName),
      replyToType: (clearReplyTo == true) ? null : (replyToType ?? this.replyToType),
    );
  }
}

enum MessageType { text, image, file, audio }

// PDF Preview Screen (updated to use pdfx)
class PDFPreviewScreen extends StatefulWidget {
  final String pdfUrl;
  final String fileName;

  const PDFPreviewScreen({
    super.key,
    required this.pdfUrl,
    required this.fileName,
  });

  @override
  State<PDFPreviewScreen> createState() => _PDFPreviewScreenState();
}

class _PDFPreviewScreenState extends State<PDFPreviewScreen> {
  PdfControllerPinch? _pdfController;
  bool _isLoading = true;
  String? _error;
  int? _progress; // 0-100

  @override
  void initState() {
    super.initState();
    _loadPdf();
  }

  Future<void> _loadPdf() async {
    try {
      final dio = Dio();
      final response = await dio.get<List<int>>(
        widget.pdfUrl,
        options: Options(responseType: ResponseType.bytes),
        onReceiveProgress: (received, total) {
          if (total > 0) {
            final p = ((received / total) * 100).floor();
            if (mounted) setState(() => _progress = p);
          }
        },
      );
      final bytes = Uint8List.fromList(response.data ?? []);
      final document = await PdfDocument.openData(bytes);

      if (!mounted) return;
      setState(() {
        _pdfController = PdfControllerPinch(document: Future.value(document));
        _isLoading = false;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _error = e.toString();
        _isLoading = false;
      });
    }
  }

  @override
  void dispose() {
    _pdfController?.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: const Color.fromARGB(255, 255, 149, 0),
        elevation: 1,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.white),
          onPressed: () => Navigator.pop(context),
        ),
        title: Text(
          widget.fileName,
          style: const TextStyle(
            color: Colors.white,
            fontSize: 16,
            fontWeight: FontWeight.w600,
          ),
        ),
      ),
      body: _isLoading
          ? Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const CircularProgressIndicator(color: Color(0xFFFF9500)),
                  const SizedBox(height: 16),
                  Text(
                    _progress == null
                        ? 'Loading PDF...'
                        : 'Loading PDF... $_progress%',
                    style: const TextStyle(fontSize: 16),
                  ),
                ],
              ),
            )
          : (_error != null
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Icon(Icons.error_outline,
                          size: 64, color: Colors.red),
                      const SizedBox(height: 16),
                      const Text(
                        'Error loading PDF',
                        style: TextStyle(
                            fontSize: 18, fontWeight: FontWeight.bold),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        _error!,
                        style: const TextStyle(color: Colors.grey),
                        textAlign: TextAlign.center,
                      ),
                      const SizedBox(height: 16),
                      ElevatedButton(
                        onPressed: () {
                          setState(() {
                            _error = null;
                            _isLoading = true;
                            _progress = null;
                          });
                          _loadPdf();
                        },
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFFFF9500),
                        ),
                        child: const Text('Retry',
                            style: TextStyle(color: Colors.white)),
                      ),
                    ],
                  ),
                )
              : PdfViewPinch(
                  controller: _pdfController!,
                  onDocumentError: (error) {
                    if (mounted) {
                      setState(() => _error = error.toString());
                    }
                  },
                )),
    );
  }
}

// Image Preview Screen
class ImagePreviewScreen extends StatelessWidget {
  final String? imageUrl;
  final String? imagePath;
  final String? caption;
  final VoidCallback? onSend;
  final TextEditingController? captionController;

  const ImagePreviewScreen({
    super.key,
    this.imageUrl,
    this.imagePath,
    this.caption,
    this.onSend,
    this.captionController,
  });

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        backgroundColor: Colors.black,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.close, color: Colors.white),
          onPressed: () => Navigator.pop(context),
        ),
        // actions: [
        //   IconButton(
        //     icon: const Icon(Icons.crop_rotate, color: Colors.white),
        //     onPressed: () {
        //       // Implement image editing
        //     },
        //   ),
        //   IconButton(
        //     icon:
        //         const Icon(Icons.emoji_emotions_outlined, color: Colors.white),
        //     onPressed: () {
        //       // Add stickers/text to image
        //     },
        //   ),
        // ],
      ),
      body: Column(
        children: [
          Expanded(
            child: Center(
              child: InteractiveViewer(
                minScale: 0.5,
                maxScale: 3.0,
                child: imageUrl != null
                    ? CachedNetworkImage(
                        imageUrl: imageUrl!,
                        fit: BoxFit.contain,
                        placeholder: (context, url) =>
                            const CircularProgressIndicator(
                                color: Colors.white),
                        errorWidget: (context, url, error) =>
                            const Icon(Icons.error, color: Colors.white),
                      )
                    : imagePath != null
                        ? Image.file(File(imagePath!), fit: BoxFit.contain)
                        : const Icon(Icons.error, color: Colors.white),
              ),
            ),
          ),
          if (onSend != null)
            Container(
              color: const Color(0xFF2D2D2D),
              padding: const EdgeInsets.all(16),
              child: Row(
                children: [
                  Expanded(
                    child: Container(
                      decoration: BoxDecoration(
                        color: const Color(0xFF3D3D3D),
                        borderRadius: BorderRadius.circular(25),
                      ),
                      child: TextField(
                        controller: captionController,
                        style: const TextStyle(color: Colors.white),
                        decoration: const InputDecoration(
                          hintText: 'Add a caption...',
                          hintStyle: TextStyle(color: Colors.white60),
                          border: InputBorder.none,
                          contentPadding: EdgeInsets.symmetric(
                              horizontal: 16, vertical: 10),
                        ),
                        maxLines: 3,
                        minLines: 1,
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  GestureDetector(
                    onTap: onSend,
                    child: Container(
                      padding: const EdgeInsets.all(12),
                      decoration: const BoxDecoration(
                        color: Color(0xFFFF9500),
                        shape: BoxShape.circle,
                      ),
                      child:
                          const Icon(Icons.send, color: Colors.white, size: 20),
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

class ChatScreen extends StatefulWidget {
  final String advisorId;
  final String advisorName;
  final String? advisorImageUrl;
  final String? contactEmail;
  final String? contactPhone;
  final String? contactStatus;
  final String? contactRole;
  final int? contactTotalOrders;

  const ChatScreen({
    super.key,
    required this.advisorId,
    required this.advisorName,
    this.advisorImageUrl,
    this.contactEmail,
    this.contactPhone,
    this.contactStatus,
    this.contactRole,
    this.contactTotalOrders,
  });

  @override
  State<ChatScreen> createState() => _ChatScreenState();
}

class _ChatScreenState extends State<ChatScreen>
    with TickerProviderStateMixin, WidgetsBindingObserver {
  final TextEditingController _messageController = TextEditingController();
  final ScrollController _scrollController = ScrollController();
  final FocusNode _messageFocusNode = FocusNode();
  final ImagePicker _imagePicker = ImagePicker();
  final SoundService _soundService = SoundService();

  List<ChatMessage> _messages = [];
  bool _isTyping = false;
  ChatMessage? _replyingToMessage;
  final bool _isOnline = true;
  String _currentUserId = '';
  String _accessToken = '';
  bool _isLoadingUserId = true;
  bool _isCurrentUserConsultant = false;

  // Consultation / wallet state (React chat parity)
  String _conversationId = '';
  DateTime? _freeUntil;
  bool _isPaid = false;
  int _paymentAmount = 0;
  bool _isLoadingConversation = true;
  double _walletBalance = 0;
  bool _isLoadingWallet = false;
  bool _isPaying = false;
  bool _isAddingMoney = false;
  Timer? _freeChatTimer;
  String _freeChatRemaining = '';
  bool _showPaymentUI = false;

  // Scroll behavior tracking
  bool _isUserScrolledUp = false;
  bool _isLoadingNewMessages = false;
  bool _isRefreshingMessages = false;
  bool _greetingRequested = false;

  // Animation controllers
  late AnimationController _typingAnimationController;

  Timer? _messageRefreshTimer;
  Timer? _typingTimer;

  void Function()? _removeSocketListener;

  // Colors
  final Color _primaryOrange = const Color(0xFFFF9500);
  final Color _chatBackground = const Color(0xFFF5F5F5);
  final Color _senderBubble = const Color.fromARGB(255, 64, 162, 243);
  final Color _receiverBubble = Colors.white;
  final Color _inputBackground = Colors.white;
  final Color _appBarColor = const Color.fromARGB(255, 31, 31, 31);

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    _typingAnimationController = AnimationController(
      duration: const Duration(milliseconds: 1500),
      vsync: this,
    )..repeat();

    _scrollController.addListener(_onScrollChanged);
    _loadCurrentUserIdAndInitializeChat();
    _messageController.addListener(_onTextChanged);
  }

  void _onScrollChanged() {
    if (_scrollController.hasClients) {
      const threshold = 100.0;
      final isNearBottom = _scrollController.position.pixels >=
          (_scrollController.position.maxScrollExtent - threshold);

      setState(() {
        _isUserScrolledUp = !isNearBottom;
      });

      if (isNearBottom) {
        setState(() {
          _isUserScrolledUp = false;
        });
      }
    }
  }

  void _onTextChanged() {
    _typingTimer?.cancel();
    if (!_isTyping && _messageController.text.trim().isNotEmpty) {
      setState(() => _isTyping = true);
    }

    _typingTimer = Timer(const Duration(seconds: 2), () {
      if (mounted && _isTyping) {
        setState(() => _isTyping = false);
      }
    });
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    _messageController.dispose();
    _scrollController.dispose();
    _messageFocusNode.dispose();
    _typingAnimationController.dispose();
    _messageRefreshTimer?.cancel();
    _typingTimer?.cancel();
    _removeSocketListener?.call();
    clearCurrentChatReceiver();
    super.dispose();
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    switch (state) {
      case AppLifecycleState.resumed:
        _messageRefreshTimer?.cancel();
        _startMessageRefreshTimer();
        _setupSocketListeners();
        break;
      case AppLifecycleState.paused:
      case AppLifecycleState.inactive:
      case AppLifecycleState.detached:
      case AppLifecycleState.hidden:
        _messageRefreshTimer?.cancel();
        break;
    }
  }

  Future<void> _loadCurrentUserIdAndInitializeChat() async {
    setState(() => _isLoadingUserId = true);

    try {
      final prefs = await SharedPreferences.getInstance();
      dynamic userIdValue = prefs.get('userId');
      String? loadedUserId;

      if (userIdValue is String) {
        loadedUserId = userIdValue;
      } else if (userIdValue is int) {
        loadedUserId = userIdValue.toString();
      }

      final loadedRole = prefs.getString('userRole') ?? 'user';
      final loadedToken = prefs.getString('accessToken') ?? '';

      if (mounted) {
        setState(() {
          _currentUserId = loadedUserId?.isNotEmpty == true
              ? loadedUserId!
              : 'guest_${DateTime.now().millisecondsSinceEpoch}';
          _accessToken = loadedToken;
          _isCurrentUserConsultant = loadedRole == 'consultant';
        });
      }
      _initializeChatConnectionDependentLogic();
    } catch (e) {
      if (mounted) {
        setState(() {
          _currentUserId =
              'error_user_${DateTime.now().millisecondsSinceEpoch}';
        });
      }
      _initializeChatConnectionDependentLogic();
    } finally {
      if (mounted) {
        setState(() => _isLoadingUserId = false);
      }
    }
  }

  void _initializeChatConnectionDependentLogic() {
    _markCurrentChatReceiver();
    _loadWallet();
    _startMessageRefreshTimer();
    _setupSocketListeners();
    _ensureConversationAndGreeting();
  }

  Future<void> _ensureConversationAndGreeting() async {
    // Ensure conversation exists before loading messages and greeting,
    // otherwise the greet endpoint may fail with "Conversation not found".
    await _loadConversation();
    await _loadMessagesFromAPI();
    await _sendGreetingIfNeeded();
  }

  Future<void> _markCurrentChatReceiver() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('current_chat_receiver_id', widget.advisorId);
    } catch (_) {}
  }

  static Future<void> clearCurrentChatReceiver() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.remove('current_chat_receiver_id');
    } catch (_) {}
  }

  Future<void> _loadConversation() async {
    if (_currentUserId.isEmpty || widget.advisorId.isEmpty) return;
    setState(() => _isLoadingConversation = true);
    try {
      final dio = Dio();
      final response = await dio
          .post(
            AppConfig.chatConversation,
            data: {
              'sender_id': _currentUserId,
              'receiver_id': widget.advisorId,
            },
            options: Options(
              contentType: 'application/x-www-form-urlencoded',
              responseType: ResponseType.json,
            ),
          )
          .timeout(const Duration(seconds: 15));

      if (response.statusCode == 200 && response.data is Map<String, dynamic>) {
        final data = response.data as Map<String, dynamic>;
        final conv = data['conversation'] as Map<String, dynamic>?;
        if (conv != null) {
          _applyConversationData(conv);
        }
      }
    } catch (e) {
      logger.e("Error loading conversation: $e");
    } finally {
      if (mounted) setState(() => _isLoadingConversation = false);
    }
  }

  void _applyConversationData(Map<String, dynamic> conv) {
    final freeUntilStr = conv['freeUntil']?.toString();
    setState(() {
      _conversationId = conv['id']?.toString() ?? '';
      _freeUntil = freeUntilStr != null && freeUntilStr.isNotEmpty
          ? DateTime.tryParse(freeUntilStr)
          : null;
      _isPaid = conv['isPaid'] == true;
      _paymentAmount = (conv['paymentAmount'] ?? 100) as int;
      _showPaymentUI = _shouldShowPaymentUI();
    });
    _startFreeChatTimer();
  }

  bool _shouldShowPaymentUI() {
    if (_isPaid) return false;
    if (_freeUntil == null) return true;
    return DateTime.now().isAfter(_freeUntil!);
  }

  void _startFreeChatTimer() {
    _freeChatTimer?.cancel();
    if (_isPaid || _freeUntil == null) {
      setState(() => _freeChatRemaining = '');
      return;
    }
    _updateFreeChatRemaining();
    _freeChatTimer = Timer.periodic(const Duration(seconds: 1), (_) {
      _updateFreeChatRemaining();
    });
  }

  void _updateFreeChatRemaining() {
    if (_freeUntil == null || _isPaid) return;
    final now = DateTime.now();
    if (now.isAfter(_freeUntil!)) {
      _freeChatTimer?.cancel();
      setState(() {
        _freeChatRemaining = '';
        _showPaymentUI = true;
      });
      return;
    }
    final diff = _freeUntil!.difference(now);
    final minutes = diff.inMinutes.remainder(60).toString().padLeft(2, '0');
    final seconds = diff.inSeconds.remainder(60).toString().padLeft(2, '0');
    setState(() => _freeChatRemaining = '$minutes:$seconds');
  }

  Future<void> _loadWallet() async {
    if (_currentUserId.isEmpty || _isLoadingWallet) return;
    setState(() => _isLoadingWallet = true);
    try {
      final dio = Dio();
      final response = await dio
          .get(
            '${AppConfig.wallet}?user_id=$_currentUserId',
            options: Options(responseType: ResponseType.json),
          )
          .timeout(const Duration(seconds: 15));

      if (response.statusCode == 200 && response.data is Map<String, dynamic>) {
        final data = response.data as Map<String, dynamic>;
        final balance = (data['balance'] ?? 0).toDouble();
        setState(() => _walletBalance = balance);
        walletBalanceNotifier.value = balance;
      }
    } catch (e) {
      logger.e("Error loading wallet: $e");
    } finally {
      if (mounted) setState(() => _isLoadingWallet = false);
    }
  }

  Future<void> _payForChat() async {
    if (_currentUserId.isEmpty || widget.advisorId.isEmpty || _isPaying) return;
    setState(() => _isPaying = true);
    try {
      final dio = Dio();
      final response = await dio
          .post(
            AppConfig.chatPay,
            data: {
              'sender_id': _currentUserId,
              'receiver_id': widget.advisorId,
            },
            options: Options(
              contentType: 'application/x-www-form-urlencoded',
              responseType: ResponseType.json,
            ),
          )
          .timeout(const Duration(seconds: 30));

      if (response.statusCode == 200 && response.data is Map<String, dynamic>) {
        final data = response.data as Map<String, dynamic>;
        final conv = data['conversation'] as Map<String, dynamic>?;
        if (conv != null) _applyConversationData(conv);
        final balance = (data['walletBalance'] ?? _walletBalance).toDouble();
        setState(() => _walletBalance = balance);
        walletBalanceNotifier.value = balance;
        _showSuccessSnackBar(data['message']?.toString() ?? 'Payment successful');
      } else if (response.statusCode == 402) {
        _showAddMoneyDialog();
      }
    } on DioException catch (e) {
      if (e.response?.statusCode == 402) {
        _showAddMoneyDialog();
      } else {
        _showErrorSnackBar("Payment failed: ${e.message}");
      }
    } catch (e) {
      _showErrorSnackBar("Payment failed: $e");
    } finally {
      if (mounted) setState(() => _isPaying = false);
    }
  }

  void _showAddMoneyDialog() {
    final amountController = TextEditingController();
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Add Money to Wallet'),
        content: TextField(
          controller: amountController,
          keyboardType: TextInputType.number,
          decoration: const InputDecoration(hintText: 'Amount in INR'),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () async {
              final amount = double.tryParse(amountController.text.trim()) ?? 0;
              if (amount > 0) {
                Navigator.of(ctx).pop();
                await _addMoney(amount);
              }
            },
            child: const Text('Add'),
          ),
        ],
      ),
    );
  }

  Future<void> _addMoney(double amount) async {
    if (_currentUserId.isEmpty || _isAddingMoney) return;
    setState(() => _isAddingMoney = true);
    try {
      final dio = Dio();
      final response = await dio
          .post(
            AppConfig.walletAddMoney,
            data: {
              'user_id': _currentUserId,
              'amount': amount.toString(),
            },
            options: Options(
              contentType: 'application/x-www-form-urlencoded',
              responseType: ResponseType.json,
            ),
          )
          .timeout(const Duration(seconds: 30));

      if (response.statusCode == 200 && response.data is Map<String, dynamic>) {
        final data = response.data as Map<String, dynamic>;
        final balance = (data['balance'] ?? _walletBalance).toDouble();
        setState(() => _walletBalance = balance);
        walletBalanceNotifier.value = balance;
        _showSuccessSnackBar(data['message']?.toString() ?? 'Money added');
      }
    } catch (e) {
      _showErrorSnackBar("Failed to add money: $e");
    } finally {
      if (mounted) setState(() => _isAddingMoney = false);
    }
  }

  void _showSuccessSnackBar(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(message), backgroundColor: Colors.green),
    );
  }

  Future<void> _loadMessagesFromAPI({bool silent = false}) async {
    if (_currentUserId.isEmpty || _isLoadingNewMessages || _isRefreshingMessages) return;

    if (silent) {
      _isRefreshingMessages = true;
    } else {
      setState(() => _isLoadingNewMessages = true);
    }

    try {
      final dio = Dio();
      final response = await dio
          .get(
            '${AppConfig.chatMessages}?sender_id=$_currentUserId&receiver_id=${widget.advisorId}',
            options: Options(headers: {'Content-Type': 'application/json'}),
          )
          .timeout(const Duration(seconds: 60));

      if (!mounted) return;

      if (response.statusCode == 200) {
        dynamic decodedData = response.data;
        if (decodedData is String) {
          try {
            decodedData = json.decode(decodedData);
          } catch (e) {
            logger.e("Invalid JSON format: $e");
            return;
          }
        }

        if (decodedData is Map<String, dynamic>) {
          final conv = decodedData['conversation'] as Map<String, dynamic>?;
          if (conv != null && _conversationId.isEmpty) {
            _applyConversationData(conv);
          }

          if (decodedData['success'] == true &&
              decodedData['messages'] is List) {
            final List<dynamic> messagesJson = decodedData['messages'];
            final int previousMessageCount = _messages.length;

            final newMessages = messagesJson.map((messageData) {
              final isFromCurrentUser =
                  messageData['sender_id'].toString() == _currentUserId;

              String? rawFilePath = messageData['file_path']?.toString();
              if (rawFilePath != null && rawFilePath.isNotEmpty) {
                rawFilePath = rawFilePath.replaceAll('\\', '/');
              }
              final String? imageUrl =
                  (rawFilePath != null && rawFilePath.isNotEmpty)
                      ? resolveImageUrl(rawFilePath)
                      : null;

              MessageType messageType =
                  _getMessageTypeFromAPI(messageData['file_type']);

              return ChatMessage(
                id: messageData['id'].toString(),
                senderId: messageData['sender_id'].toString(),
                senderName: isFromCurrentUser ? 'You' : widget.advisorName,
                message: messageData['message'] ?? '',
                timestamp: DateTime.tryParse(messageData['created_at'] ?? '') ??
                    DateTime.now(),
                isFromCurrentUser: isFromCurrentUser,
                type: messageType,
                imageUrl: messageType == MessageType.image ? imageUrl : null,
                fileName: messageData['file_name'] ??
                    _extractFileNameFromPath(rawFilePath) ??
                    'File',
                fileSize: null,
                filePath: rawFilePath,
                isDelivered: true,
                isRead: messageData['is_read'] == 'Yes' ||
                    messageData['status'] == 'Read',
                replyToId: messageData['reply_to_id']?.toString(),
              );
            }).toList();

            // Resolve reply-to sender/content for each message
            final resolvedNewMessages = newMessages
                .map((m) => _populateReplyTo(m, newMessages))
                .toList();

            // Merge with existing temp messages to prevent flicker
            final existingTempMessages = _messages.where((m) => m.id.startsWith('temp_')).toList();
            final keptTempMessages = existingTempMessages.where((temp) {
              return !resolvedNewMessages.any((apiMsg) =>
                  apiMsg.senderId == temp.senderId &&
                  apiMsg.message == temp.message);
            }).toList();
            // Also resolve replies against temp messages in case we replied
            // to a message still pending on the server.
            final resolvedTempMessages = keptTempMessages
                .map((m) => _populateReplyTo(m, [...resolvedNewMessages, ...keptTempMessages]))
                .toList();

            final mergedMessages = [...resolvedNewMessages, ...resolvedTempMessages];
            mergedMessages.sort((a, b) => a.timestamp.compareTo(b.timestamp));

            setState(() {
              _messages = mergedMessages;
            });

            // Play sound when new messages arrive from other person
            final hasNewMessages = _messages.length > previousMessageCount;
            if (hasNewMessages && previousMessageCount > 0) {
              final lastMessage = _messages.last;
              if (!lastMessage.isFromCurrentUser) {
                _soundService.playReceiveSound();
              }
            }

            if (hasNewMessages && !_isUserScrolledUp) {
              _scrollToBottomSmooth();
            }
          }
        }
      }

      // Retry greeting if the chat is still empty (e.g., first attempt raced
      // before the conversation was created). The _greetingRequested flag
      // prevents infinite calls once the server confirms it was sent.
      if (!mounted) return;
      if (_messages.isEmpty && !_isCurrentUserConsultant) {
        await _sendGreetingIfNeeded();
      }
    } catch (e) {
      logger.e("Error fetching messages: $e");
    } finally {
      if (silent) {
        _isRefreshingMessages = false;
      } else {
        if (mounted) {
          setState(() => _isLoadingNewMessages = false);
        } else {
          _isLoadingNewMessages = false;
        }
      }
    }
  }

  ChatMessage _populateReplyTo(
      ChatMessage message, List<ChatMessage> candidates) {
    if (message.replyToId == null || message.replyToId!.isEmpty) return message;
    if (message.replyToContent != null && message.replyToContent!.isNotEmpty) {
      return message;
    }

    final original = candidates.firstWhere(
      (m) => m.id == message.replyToId,
      orElse: () => ChatMessage(
        id: '',
        senderId: '',
        senderName: '',
        message: '',
        timestamp: DateTime.now(),
        isFromCurrentUser: false,
      ),
    );
    if (original.id.isEmpty) return message;

    final isOriginalFromCurrentUser = original.senderId == _currentUserId;
    final replyToSenderName =
        isOriginalFromCurrentUser ? 'You' : widget.advisorName;
    final isImage = original.type == MessageType.image;
    final isFile = original.type == MessageType.file;
    final replyToContent = isImage
        ? (original.fileName ?? '📷 Photo')
        : isFile
            ? (original.fileName ?? '📎 File')
            : original.message;

    return message.copyWith(
      replyToContent: replyToContent,
      replyToSenderName: replyToSenderName,
      replyToImageUrl: isImage ? original.imageUrl : null,
      replyToFileName: isFile ? original.fileName : null,
      replyToType: original.type,
    );
  }

  Future<void> _sendGreetingIfNeeded() async {
    if (_greetingRequested) return;
    if (_isCurrentUserConsultant) return;
    if (_messages.isNotEmpty) return;
    if (_currentUserId.isEmpty || widget.advisorId.isEmpty) return;
    if (_conversationId.isEmpty) return;

    _greetingRequested = true;
    try {
      final dio = Dio();
      final response = await dio
          .post(
            AppConfig.chatGreet,
            data: {
              'sender_id': _currentUserId,
              'receiver_id': widget.advisorId,
            },
            options: Options(
              contentType: 'application/x-www-form-urlencoded',
              responseType: ResponseType.json,
            ),
          )
          .timeout(const Duration(seconds: 15));

      if (response.statusCode == 200 && response.data is Map<String, dynamic>) {
        final data = response.data as Map<String, dynamic>;
        final greetingData = data['greeting'] as Map<String, dynamic>?;
        if (greetingData != null) {
          final newMessage = ChatMessage(
            id: greetingData['id']?.toString() ?? 'greeting_${DateTime.now().millisecondsSinceEpoch}',
            senderId: greetingData['sender_id']?.toString() ?? widget.advisorId,
            senderName: widget.advisorName,
            message: greetingData['message']?.toString() ?? '',
            timestamp: DateTime.tryParse(greetingData['created_at']?.toString() ?? '') ?? DateTime.now(),
            isFromCurrentUser: false,
            type: MessageType.text,
            imageUrl: null,
            fileName: 'File',
            fileSize: null,
            filePath: null,
            isDelivered: true,
            isRead: false,
          );

          setState(() {
            final exists = _messages.any((m) => m.id == newMessage.id);
            if (!exists) {
              _messages.add(newMessage);
              _messages.sort((a, b) => a.timestamp.compareTo(b.timestamp));
            }
          });

          if (!_isUserScrolledUp) {
            _scrollToBottomSmooth();
          }
        } else {
          // Greeting was already sent or not returned; refresh messages so the
          // existing greeting appears if it exists on the server.
          await _loadMessagesFromAPI();
        }
      }
    } catch (e) {
      logger.e("Error sending greeting: $e");
      // Allow retry on next refresh if the call failed.
      _greetingRequested = false;
    }
  }

  MessageType _getMessageTypeFromAPI(dynamic fileType) {
    if (fileType == null || fileType.toString().isEmpty) {
      return MessageType.text;
    }

    final typeString = fileType.toString().toLowerCase();

    if (typeString.contains('image/') ||
        typeString == 'image' ||
        typeString.contains('jpg') ||
        typeString.contains('jpeg') ||
        typeString.contains('png') ||
        typeString.contains('gif') ||
        typeString.contains('webp')) {
      return MessageType.image;
    }

    if (typeString.contains('application/pdf') ||
        typeString.contains('pdf') ||
        typeString.contains('application/msword') ||
        typeString.contains('application/vnd.openxmlformats-officedocument') ||
        typeString.contains('text/') ||
        typeString == 'application/pdf' ||
        typeString == 'file') {
      return MessageType.file;
    }

    if (typeString.contains('audio/') ||
        typeString.contains('mp3') ||
        typeString.contains('wav') ||
        typeString.contains('m4a')) {
      return MessageType.audio;
    }

    return MessageType.text;
  }

  String? _extractFileNameFromPath(String? filePath) {
    if (filePath == null || filePath.isEmpty) return null;

    final parts = filePath.split('/');
    if (parts.isNotEmpty) {
      return parts.last;
    }
    return filePath;
  }

  void _startMessageRefreshTimer() {
    _messageRefreshTimer?.cancel();
    _messageRefreshTimer = Timer.periodic(const Duration(seconds: 3), (timer) {
      if (mounted) {
        _loadMessagesFromAPI(silent: true);
      } else {
        timer.cancel();
      }
    });
  }

  void _setupSocketListeners() {
    if (_currentUserId.isEmpty) return;

    ChatSocketService().connect(userId: _currentUserId, token: _accessToken);

    _removeSocketListener?.call();
    _removeSocketListener = ChatSocketService().onNewMessage((data) {
      _handleSocketMessage(data);
    });
  }

  void _handleSocketMessage(Map<String, dynamic> data) {
    if (!mounted) return;

    String senderId = '';
    if (data['sender'] is Map<String, dynamic>) {
      senderId = data['sender']['_id']?.toString() ?? '';
    } else if (data['sender_id'] != null) {
      senderId = data['sender_id'].toString();
    }
    String recipientId = data['recipient']?.toString() ?? data['receiver_id']?.toString() ?? '';
    if (senderId.isEmpty || recipientId.isEmpty) return;

    // Only handle messages between current user and this advisor
    final otherId = senderId == _currentUserId ? recipientId : senderId;
    if (otherId != widget.advisorId) return;

    final isFromCurrentUser = senderId == _currentUserId;
    String? rawFileUrl = data['fileUrl']?.toString() ?? data['file_path']?.toString();
    if (rawFileUrl != null && rawFileUrl.isNotEmpty) {
      rawFileUrl = rawFileUrl.replaceAll('\\', '/');
    }
    final String? mimeType = data['mimeType']?.toString() ?? data['file_type']?.toString();
    final MessageType messageType = _getMessageTypeFromAPI(mimeType);
    final String? resolvedImageUrl = rawFileUrl != null && rawFileUrl.isNotEmpty
        ? resolveImageUrl(rawFileUrl)
        : null;

    String? replyToId;
    if (data['replyTo'] is Map<String, dynamic>) {
      replyToId = data['replyTo']['_id']?.toString() ??
          data['replyTo']['id']?.toString();
    } else if (data['replyTo'] != null) {
      replyToId = data['replyTo'].toString();
    }
    replyToId ??= data['reply_to_id']?.toString();

    final newMessage = ChatMessage(
      id: data['_id']?.toString() ?? data['id']?.toString() ?? 'socket_${DateTime.now().millisecondsSinceEpoch}',
      senderId: senderId,
      senderName: isFromCurrentUser ? 'You' : widget.advisorName,
      message: data['content']?.toString() ?? data['message']?.toString() ?? '',
      timestamp: DateTime.tryParse(data['createdAt']?.toString() ?? data['created_at']?.toString() ?? '') ?? DateTime.now(),
      isFromCurrentUser: isFromCurrentUser,
      type: messageType,
      imageUrl: messageType == MessageType.image ? resolvedImageUrl : null,
      fileName: data['fileName']?.toString() ?? data['file_name']?.toString() ?? _extractFileNameFromPath(rawFileUrl) ?? 'File',
      fileSize: null,
      filePath: rawFileUrl,
      isDelivered: true,
      isRead: data['status']?.toString() == 'seen' || data['is_read']?.toString() == 'Yes',
      replyToId: replyToId,
    );

    // Try to fill the quoted message preview from the messages we already have.
    final resolvedNewMessage = _populateReplyTo(newMessage, _messages);

    setState(() {
      final existingIndex = _messages.indexWhere((m) => m.id == resolvedNewMessage.id);
      if (existingIndex != -1) {
        // Message already exists (e.g., temp promoted by send response). Update
        // its delivery/read status, and if the server now has a real file URL,
        // replace the local temp path so images/files load after upload.
        final bool hasServerFile =
            resolvedNewMessage.filePath != null && resolvedNewMessage.filePath!.isNotEmpty;
        _messages[existingIndex] = _messages[existingIndex].copyWith(
          isDelivered: true,
          isRead: resolvedNewMessage.isRead || _messages[existingIndex].isRead,
          imageUrl: hasServerFile ? resolvedNewMessage.imageUrl : _messages[existingIndex].imageUrl,
          filePath: hasServerFile ? resolvedNewMessage.filePath : _messages[existingIndex].filePath,
          fileName: hasServerFile ? resolvedNewMessage.fileName : _messages[existingIndex].fileName,
          replyToId: resolvedNewMessage.replyToId ?? _messages[existingIndex].replyToId,
        );
        return;
      }

      // If the server echoes our own message back before the HTTP response,
      // find the matching pending temp bubble and upgrade it instead of adding
      // a second bubble.
      if (isFromCurrentUser) {
        final pendingIndex = _messages.indexWhere((m) =>
            m.id.startsWith('temp_') &&
            m.senderId == _currentUserId &&
            m.message == resolvedNewMessage.message);
        if (pendingIndex != -1) {
          _messages[pendingIndex] = _messages[pendingIndex].copyWith(
            id: resolvedNewMessage.id,
            imageUrl: resolvedNewMessage.imageUrl,
            filePath: resolvedNewMessage.filePath,
            fileName: resolvedNewMessage.fileName,
            isDelivered: true,
            isRead: resolvedNewMessage.isRead,
            timestamp: resolvedNewMessage.timestamp,
            replyToId: resolvedNewMessage.replyToId ?? _messages[pendingIndex].replyToId,
          );
          _messages.sort((a, b) => a.timestamp.compareTo(b.timestamp));
          return;
        }
      }

      _messages.add(resolvedNewMessage);
      _messages.sort((a, b) => a.timestamp.compareTo(b.timestamp));
      if (!isFromCurrentUser) {
        _soundService.playReceiveSound();
      }
    });

    if (!_isUserScrolledUp) {
      _scrollToBottomSmooth();
    }
  }

  // NEW: Check if there are unread messages from advisor
  bool get _hasUnreadMessagesFromAdvisor {
    if (_messages.isEmpty) return false;

    // Check if there are any unread messages from the advisor (not from current user)
    return _messages
        .any((message) => !message.isFromCurrentUser && !message.isRead);
  }

  // NEW: Show unread message dialog
  Future<bool> _showUnreadMessagesDialog() async {
    final result = await showDialog<bool>(
      context: context,
      barrierDismissible: false, // Force user to choose
      builder: (context) {
        return AlertDialog(
          shape:
              RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          title: Row(
            children: [
              Icon(Icons.message_outlined, color: _primaryOrange, size: 28),
              const SizedBox(width: 12),
              const Text(
                'Unread Messages',
                style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
              ),
            ],
          ),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'You have unread messages from your advisor.',
                style: TextStyle(fontSize: 16),
              ),
              const SizedBox(height: 12),
              Text(
                'Please acknowledge them before leaving the chat.',
                style: TextStyle(
                  fontSize: 14,
                  color: Colors.grey[600],
                  fontStyle: FontStyle.italic,
                ),
              ),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(context).pop(false), // Stay in chat
              style: TextButton.styleFrom(
                padding:
                    const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
              ),
              child: Text(
                'Stay & Reply',
                style: TextStyle(
                  color: _primaryOrange,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ),
            TextButton(
              onPressed: () => Navigator.of(context).pop(true), // Leave anyway
              style: TextButton.styleFrom(
                backgroundColor: Colors.grey[100],
                padding:
                    const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(8)),
              ),
              child: Text(
                'Leave Anyway',
                style: TextStyle(
                  color: Colors.grey[700],
                  fontWeight: FontWeight.w500,
                ),
              ),
            ),
          ],
        );
      },
    );

    return result ?? false; // Default to staying if dialog is dismissed
  }

  // NEW: Handle back navigation with unread message check
  Future<bool> _onWillPop() async {
    // Check if there are unread messages from advisor
    if (_hasUnreadMessagesFromAdvisor) {
      // Show warning dialog
      final shouldLeave = await _showUnreadMessagesDialog();
      return shouldLeave;
    } else {
      // No unread messages, allow normal navigation
      return true;
    }
  }

  // File preview methods
  void _previewFile(ChatMessage message) {
    if (message.filePath == null) return;

    final String rawPath = message.filePath!;
    final bool isLocalFile = !rawPath.startsWith('http://') &&
        !rawPath.startsWith('https://') &&
        File(rawPath).existsSync();
    final String fileUrl = isLocalFile ? rawPath : resolveImageUrl(rawPath);
    final String fileName = message.fileName ?? 'Document';
    final String extension = fileName.split('.').last.toLowerCase();

    switch (extension) {
      case 'pdf':
        _previewPDF(fileUrl, fileName);
        break;
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
      case 'webp':
        _viewImageFullscreen(fileUrl, isLocalFile ? rawPath : null);
        break;
      case 'doc':
      case 'docx':
      case 'xls':
      case 'xlsx':
      case 'ppt':
      case 'pptx':
        _openInExternalApp(fileUrl, fileName);
        break;
      case 'txt':
        _showTextPreviewOptions(fileUrl, fileName);
        break;
      default:
        _showUnsupportedFileDialog(fileName, fileUrl);
    }
  }

  void _previewPDF(String pdfUrl, String fileName) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => PDFPreviewScreen(
          pdfUrl: pdfUrl,
          fileName: fileName,
        ),
      ),
    );
  }

  void _viewImageFullscreen(String? imageUrl, String? imagePath) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => ImagePreviewScreen(
          imageUrl: imageUrl,
          imagePath: imagePath,
        ),
      ),
    );
  }

  void _openInExternalApp(String fileUrl, String fileName) async {
    try {
      final Uri url = Uri.parse(fileUrl);
      if (await canLaunchUrl(url)) {
        await launchUrl(url, mode: LaunchMode.externalApplication);
      } else {
        _showErrorDialog('Cannot open $fileName');
      }
    } catch (e) {
      _showErrorDialog('Error opening file: $e');
    }
  }

  void _showTextPreviewOptions(String fileUrl, String fileName) {
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          title: const Text('Text File'),
          content: Text('Would you like to open $fileName in an external app?'),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(context).pop(),
              child: const Text('Cancel'),
            ),
            TextButton(
              onPressed: () {
                Navigator.of(context).pop();
                _openInExternalApp(fileUrl, fileName);
              },
              child: const Text('Open'),
            ),
          ],
        );
      },
    );
  }

  void _showUnsupportedFileDialog(String fileName, String fileUrl) {
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          title: const Text('File Preview'),
          content: Text(
              'Preview not supported for $fileName.\nWould you like to open it externally?'),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(context).pop(),
              child: const Text('Cancel'),
            ),
            TextButton(
              onPressed: () {
                Navigator.of(context).pop();
                _openInExternalApp(fileUrl, fileName);
              },
              child: const Text('Open'),
            ),
          ],
        );
      },
    );
  }

  void _showErrorDialog(String message) {
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          title: const Text('Error'),
          content: Text(message),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(context).pop(),
              child: const Text('OK'),
            ),
          ],
        );
      },
    );
  }

  Future<void> _sendMessage({
    MessageType type = MessageType.text,
    String? filePath,
    String? fileName,
    String? fileSize,
    String? caption,
    String? replyToId,
  }) async {
    final messageText = caption?.trim() ?? _messageController.text.trim();
    if (type == MessageType.text && messageText.isEmpty) return;
    if (_currentUserId.isEmpty) return;

    final tempMessage = ChatMessage(
      id: 'temp_${DateTime.now().millisecondsSinceEpoch}',
      senderId: _currentUserId,
      senderName: 'You',
      message: type == MessageType.text
          ? messageText
          : (caption ?? fileName ?? 'Media'),
      timestamp: DateTime.now(),
      isFromCurrentUser: true,
      type: type,
      imageUrl: type == MessageType.image ? filePath : null,
      fileName: fileName,
      fileSize: fileSize,
      filePath: filePath,
      isDelivered: false,
      isRead: false,
      replyToId: replyToId,
      replyToContent: _replyingToMessage?.message,
      replyToSenderName: _replyingToMessage?.senderName,
      replyToImageUrl: _replyingToMessage?.imageUrl,
      replyToFileName: _replyingToMessage?.fileName,
      replyToType: _replyingToMessage?.type,
    );

    setState(() {
      _messages.add(tempMessage);
      if (type == MessageType.text) _messageController.clear();
      _isTyping = false;
      _replyingToMessage = null;
    });

    _scrollToBottomSmooth();

    try {
      final dio = Dio();
      String messageToSend = type == MessageType.text
          ? messageText
          : (caption ?? fileName ?? 'Media file');
      final String url = AppConfig.chatSend;

      Response response;

      if (type == MessageType.text) {
        final textPayload = {
          'sender_id': _currentUserId,
          'receiver_id': widget.advisorId,
          'message': messageToSend,
          'message_type': type.name,
          if (replyToId != null && replyToId.isNotEmpty)
            'reply_to_id': replyToId,
        };

        response = await dio
            .post(
              url,
              data: textPayload,
              options: Options(
                contentType: 'application/x-www-form-urlencoded',
                responseType: ResponseType.json,
              ),
            )
            .timeout(const Duration(seconds: 30));
      } else {
        final formMap = {
          'sender_id': _currentUserId,
          'receiver_id': widget.advisorId,
          'message': messageToSend,
          'message_type': type.name,
          'file_type': type.name,
          'file_name': fileName,
          'file_size': fileSize,
          'file':
              filePath != null ? await MultipartFile.fromFile(filePath) : null,
          if (replyToId != null && replyToId.isNotEmpty)
            'reply_to_id': replyToId,
        };

        FormData formData = FormData.fromMap(formMap);

        response = await dio
            .post(
              url,
              data: formData,
              options: Options(contentType: 'multipart/form-data'),
            )
            .timeout(const Duration(seconds: 60));
      }

      if (response.statusCode == 200 && response.data['success'] == true) {
        _soundService.playSendSound();
        final conv = response.data['conversation'] as Map<String, dynamic>?;
        if (conv != null) _applyConversationData(conv);

        // Promote the temp message to the real server message so we don't get
        // two bubbles (the temp and the server echo) when the socket/API refresh
        // arrives a moment later.
        final realId = response.data['message_id']?.toString();
        final createdAtStr = response.data['created_at']?.toString();
        if (realId != null && realId.isNotEmpty && mounted) {
          setState(() {
            final index = _messages.indexWhere((m) => m.id == tempMessage.id);
            if (index != -1) {
              String? resolvedImageUrl;
              String? serverFilePath;
              final String? serverFileUrl =
                  response.data['fileUrl']?.toString();
              if (serverFileUrl != null && serverFileUrl.isNotEmpty) {
                serverFilePath = serverFileUrl;
                if (type == MessageType.image) {
                  resolvedImageUrl = resolveImageUrl(serverFileUrl);
                }
              }
              _messages[index] = _messages[index].copyWith(
                id: realId,
                imageUrl: resolvedImageUrl,
                filePath: serverFilePath,
                isDelivered: true,
                timestamp: (createdAtStr != null ? DateTime.tryParse(createdAtStr) : null) ?? _messages[index].timestamp,
              );
            }
          });
        }
      } else if (response.statusCode == 402 ||
          (response.data is Map<String, dynamic> &&
              response.data['paymentRequired'] == true)) {
        setState(() => _showPaymentUI = true);
        _showAddMoneyDialog();
      } else {
        throw Exception('Server error: ${response.statusCode}');
      }
    } on DioException catch (e) {
      if (mounted) {
        setState(() {
          _messages.removeWhere((m) => m.id == tempMessage.id);
        });
        if (e.response?.statusCode == 402) {
          setState(() => _showPaymentUI = true);
          _showAddMoneyDialog();
        } else {
          _showErrorSnackBar("Failed to send message: ${e.message}");
        }
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _messages.removeWhere((m) => m.id == tempMessage.id);
        });
        _showErrorSnackBar("Failed to send message");
      }
    }
  }

  void _showErrorSnackBar(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: Colors.red,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
      ),
    );
  }

  void _scrollToBottomSmooth() {
    if (!_isUserScrolledUp) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (_scrollController.hasClients) {
          _scrollController.animateTo(
            _scrollController.position.maxScrollExtent,
            duration: const Duration(milliseconds: 300),
            curve: Curves.easeOut,
          );
        }
      });
    }
  }

  void _forceScrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scrollController.hasClients) {
        setState(() => _isUserScrolledUp = false);
        _scrollController.animateTo(
          _scrollController.position.maxScrollExtent,
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeOut,
        );
      }
    });
  }

  String _formatMessageTime(DateTime dateTime) {
    final localTime = dateTime.isUtc
        ? dateTime.add(DateTime.now().timeZoneOffset)
        : dateTime;
    return DateFormat('hh:mm a').format(localTime);
  }

  // Media handling methods
  Future<void> _pickImage() async {
    try {
      final XFile? image = await _imagePicker.pickImage(
        source: ImageSource.gallery,
        maxWidth: 1920,
        maxHeight: 1080,
        imageQuality: 85,
      );
      if (image != null) {
        final captionController = TextEditingController();

        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (context) => ImagePreviewScreen(
              imagePath: image.path,
              captionController: captionController,
              onSend: () async {
                Navigator.pop(context);
                final file = File(image.path);
                final fileSizeBytes = await file.length();
                _sendMessage(
                  type: MessageType.image,
                  filePath: image.path,
                  fileName: image.name,
                  fileSize: _formatFileSize(fileSizeBytes),
                  caption: captionController.text,
                  replyToId: _replyingToMessage?.id,
                );
              },
            ),
          ),
        );
      }
    } catch (e) {
      _showErrorSnackBar("Failed to pick image");
    }
  }

  Future<void> _takePhoto() async {
    try {
      final XFile? image = await _imagePicker.pickImage(
        source: ImageSource.camera,
        maxWidth: 1920,
        maxHeight: 1080,
        imageQuality: 85,
      );
      if (image != null) {
        final captionController = TextEditingController();

        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (context) => ImagePreviewScreen(
              imagePath: image.path,
              captionController: captionController,
              onSend: () async {
                Navigator.pop(context);
                final file = File(image.path);
                final fileSizeBytes = await file.length();
                _sendMessage(
                  type: MessageType.image,
                  filePath: image.path,
                  fileName: image.name,
                  fileSize: _formatFileSize(fileSizeBytes),
                  caption: captionController.text,
                  replyToId: _replyingToMessage?.id,
                );
              },
            ),
          ),
        );
      }
    } catch (e) {
      _showErrorSnackBar("Failed to take photo");
    }
  }

  Future<void> _pickDocument() async {
    try {
      FilePickerResult? result = await FilePicker.platform.pickFiles(
        type: FileType.custom,
        allowedExtensions: [
          'pdf',
          'doc',
          'docx',
          'xls',
          'xlsx',
          'ppt',
          'pptx',
          'txt'
        ],
        allowMultiple: false,
      );
      if (result != null && result.files.single.path != null) {
        final file = result.files.single;
        _sendMessage(
          type: MessageType.file,
          filePath: file.path,
          fileName: file.name,
          fileSize: _formatFileSize(file.size),
          replyToId: _replyingToMessage?.id,
        );
      }
    } catch (e) {
      _showErrorSnackBar("Failed to pick document");
    }
  }

  String _formatFileSize(int bytes) {
    if (bytes < 1024) return '$bytes B';
    if (bytes < 1024 * 1024) return '${(bytes / 1024).toStringAsFixed(1)} KB';
    if (bytes < 1024 * 1024 * 1024) {
      return '${(bytes / (1024 * 1024)).toStringAsFixed(1)} MB';
    }
    return '${(bytes / (1024 * 1024 * 1024)).toStringAsFixed(1)} GB';
  }

  void _showAttachmentOptions() {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      builder: (context) => Container(
        decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
        ),
        padding: const EdgeInsets.all(20),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 40,
              height: 4,
              decoration: BoxDecoration(
                color: Colors.grey[300],
                borderRadius: BorderRadius.circular(2),
              ),
            ),
            const SizedBox(height: 20),
            Text(
              'Share',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.w600,
                color: Colors.grey[800],
              ),
            ),
            const SizedBox(height: 30),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: [
                _buildAttachmentOption(
                  icon: Icons.camera_alt,
                  label: 'Camera',
                  color: const Color(0xFFEF5350),
                  onTap: () {
                    Navigator.pop(context);
                    _takePhoto();
                  },
                ),
                _buildAttachmentOption(
                  icon: Icons.photo_library,
                  label: 'Gallery',
                  color: const Color(0xFF9C27B0),
                  onTap: () {
                    Navigator.pop(context);
                    _pickImage();
                  },
                ),
                _buildAttachmentOption(
                  icon: Icons.insert_drive_file,
                  label: 'Document',
                  color: const Color(0xFF66BB6A),
                  onTap: () {
                    Navigator.pop(context);
                    _pickDocument();
                  },
                ),
              ],
            ),
            const SizedBox(height: 20),
          ],
        ),
      ),
    );
  }

  Widget _buildAttachmentOption({
    required IconData icon,
    required String label,
    required Color color,
    required VoidCallback onTap,
  }) {
    return Column(
      children: [
        GestureDetector(
          onTap: onTap,
          child: Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: color,
              shape: BoxShape.circle,
              boxShadow: [
                BoxShadow(
                  color: color.withOpacity(0.3),
                  blurRadius: 8,
                  offset: const Offset(0, 4),
                ),
              ],
            ),
            child: Icon(icon, color: Colors.white, size: 28),
          ),
        ),
        const SizedBox(height: 8),
        Text(
          label,
          style: TextStyle(
            fontSize: 12,
            fontWeight: FontWeight.w500,
            color: Colors.grey[600],
          ),
        ),
      ],
    );
  }

  void _showUserDetailsSheet() {
    if (!_isCurrentUserConsultant) return;

    final String status = widget.contactStatus?.toLowerCase() == 'active' ? 'Active' : 'Inactive';
    final Color statusColor = widget.contactStatus?.toLowerCase() == 'active' ? Colors.green : Colors.grey;

    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) {
        return Container(
          padding: const EdgeInsets.all(20),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Center(
                child: Container(
                  width: 40,
                  height: 4,
                  decoration: BoxDecoration(
                    color: Colors.grey[300],
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              ),
              const SizedBox(height: 20),
              Row(
                children: [
                  CircleAvatar(
                    radius: 35,
                    backgroundColor: _primaryOrange,
                    backgroundImage: widget.advisorImageUrl != null
                        ? CachedNetworkImageProvider(fixImageUrl(widget.advisorImageUrl!))
                        : null,
                    child: widget.advisorImageUrl == null
                        ? Text(
                            widget.advisorName.isNotEmpty
                                ? widget.advisorName[0].toUpperCase()
                                : 'U',
                            style: const TextStyle(
                              color: Colors.white,
                              fontWeight: FontWeight.bold,
                              fontSize: 24,
                            ),
                          )
                        : null,
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          widget.advisorName,
                          style: const TextStyle(
                            fontSize: 20,
                            fontWeight: FontWeight.bold,
                            color: Colors.black87,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                          decoration: BoxDecoration(
                            color: statusColor.withOpacity(0.1),
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(color: statusColor.withOpacity(0.3)),
                          ),
                          child: Text(
                            status,
                            style: TextStyle(
                              color: statusColor,
                              fontSize: 12,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 24),
              _buildDetailRow(Icons.email_outlined, 'Email', widget.contactEmail),
              _buildDetailRow(Icons.phone_outlined, 'Phone', widget.contactPhone),
              _buildDetailRow(Icons.person_outline, 'Role', widget.contactRole),
              if (widget.contactTotalOrders != null)
                _buildDetailRow(Icons.receipt_long_outlined, 'Total Orders', widget.contactTotalOrders.toString()),
              const SizedBox(height: 20),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton.icon(
                  onPressed: () => Navigator.pop(context),
                  icon: const Icon(Icons.close),
                  label: const Text('Close'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: _appBarColor,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 12),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildDetailRow(IconData icon, String label, String? value) {
    if (value == null || value.isEmpty) return const SizedBox.shrink();
    return Padding(
      padding: const EdgeInsets.only(bottom: 14),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: _primaryOrange.withOpacity(0.1),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Icon(icon, color: _primaryOrange, size: 20),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  label,
                  style: TextStyle(fontSize: 12, color: Colors.grey[600], fontWeight: FontWeight.w500),
                ),
                const SizedBox(height: 2),
                Text(
                  value,
                  style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w600, color: Colors.black87),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoadingUserId) {
      return Scaffold(
        backgroundColor: _chatBackground,
        body: Center(
          child: CircularProgressIndicator(color: _primaryOrange),
        ),
      );
    }

    // ✅ FIX: Scaffold is now the root widget so Flutter's keyboard inset
    // handling (resizeToAvoidBottomInset) works natively. Background image
    // moved into a Stack inside the body. Input wrapped in SafeArea so
    // system virtual navigation buttons don't cover the text field.
    return PopScope(
      canPop: false,
      onPopInvokedWithResult: (didPop, result) async {
        if (didPop) return;
        final shouldPop = await _onWillPop();
        if (shouldPop && context.mounted) {
          Navigator.of(context).pop();
        }
      },
      child: Scaffold(
        backgroundColor: _chatBackground,
        appBar: _buildAppBar(),
        resizeToAvoidBottomInset: true,
        body: Stack(
          children: [
            // Background image layer
            Positioned.fill(
              child: Opacity(
                opacity: 0.5,
                child: Image.network(
                  '${AppConfig.staticAssetBase}/img/blackbg%201.webp',
                  fit: BoxFit.cover,
                  errorBuilder: (context, error, stackTrace) =>
                      Container(color: _chatBackground),
                ),
              ),
            ),
            // Chat content layer
            Column(
              children: [
                Expanded(
                  child: ListView.builder(
                    controller: _scrollController,
                    padding: const EdgeInsets.symmetric(
                        horizontal: 8, vertical: 8),
                    itemCount: _messages.length + (_isTyping ? 1 : 0),
                    itemBuilder: (context, index) {
                      if (index == _messages.length && _isTyping) {
                        return _buildTypingIndicator();
                      }

                      final message = _messages[index];
                      final previousMessage =
                          index > 0 ? _messages[index - 1] : null;
                      final nextMessage = index < _messages.length - 1
                          ? _messages[index + 1]
                          : null;

                      final showDateHeader = previousMessage == null ||
                          !_isSameDay(
                              message.timestamp, previousMessage.timestamp);

                      return Column(
                        children: [
                          if (showDateHeader)
                            _buildDateHeader(message.timestamp),
                          _buildMessageBubble(message, nextMessage),
                        ],
                      );
                    },
                  ),
                ),
                if (_isUserScrolledUp)
                  Container(
                    padding: const EdgeInsets.all(8),
                    child: FloatingActionButton.small(
                      backgroundColor: _primaryOrange,
                      foregroundColor: Colors.white,
                      onPressed: () {
                        setState(() => _isUserScrolledUp = false);
                        _forceScrollToBottom();
                      },
                    ),
                  ),
                _buildConsultationBanner(),
                // ✅ FIX: SafeArea prevents system virtual buttons from covering input
                SafeArea(
                  top: false,
                  bottom: true,
                  minimum: const EdgeInsets.only(bottom: 4),
                  child: _buildMessageInput(),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  PreferredSizeWidget _buildAppBar() {
    return AppBar(
      backgroundColor: _appBarColor,
      elevation: 1,
      shadowColor: Colors.black26,
      leading: IconButton(
        icon: const Icon(Icons.arrow_back, color: Colors.white),
        onPressed: () async {
          // NEW: Handle back button press manually to trigger WillPopScope
          final shouldPop = await _onWillPop();
          if (shouldPop) {
            Navigator.of(context).pop();
          }
        },
      ),
      titleSpacing: 0,
      title: InkWell(
        onTap: () {
          if (_isCurrentUserConsultant) {
            _showUserDetailsSheet();
          }
        },
        child: Row(
          children: [
            CircleAvatar(
              radius: 20,
              backgroundColor: Colors.white.withOpacity(0.2),
              backgroundImage: widget.advisorImageUrl != null
                  ? CachedNetworkImageProvider(
                      fixImageUrl(widget.advisorImageUrl!)) // ✅
                  : null,
              child: widget.advisorImageUrl == null
                  ? Text(
                      widget.advisorName[0].toUpperCase(),
                      style: const TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.bold,
                      ),
                    )
                  : null,
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    widget.advisorName,
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 16,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  Text(
                    _isOnline ? 'Online' : 'Last seen recently',
                    style: const TextStyle(
                      color: Colors.white70,
                      fontSize: 13,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
      actions: [
        if (_isCurrentUserConsultant)
          IconButton(
            icon: const Icon(Icons.info_outline, color: Colors.white),
            tooltip: 'User Details',
            onPressed: _showUserDetailsSheet,
          ),
        IconButton(
          icon: const Icon(Icons.call, color: Colors.white),
          tooltip: 'Voice call',
          onPressed: () async {
            await WebRTCCallService().startCall(
              widget.advisorId,
              receiver: {
                '_id': widget.advisorId,
                'displayName': widget.advisorName,
                'avatar': widget.advisorImageUrl,
              },
              type: 'audio',
            );
          },
        ),
        PopupMenuButton<String>(
          icon: const Icon(Icons.more_vert, color: Colors.white),
          color: Colors.white,
          onSelected: (value) {
            if (value == 'view_contact') {
              _showUserDetailsSheet();
            }
          },
          itemBuilder: (context) => [
            const PopupMenuItem(
              value: 'view_contact',
              child: Text('View contact'),
            ),
            const PopupMenuItem(
              value: 'media',
              child: Text('Media, links, and docs'),
            ),
            const PopupMenuItem(
              value: 'wallpaper',
              child: Text('Wallpaper'),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildDateHeader(DateTime date) {
    return Container(
      margin: const EdgeInsets.symmetric(vertical: 16),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
        decoration: BoxDecoration(
          color: Colors.grey[300],
          borderRadius: BorderRadius.circular(12),
        ),
        child: Text(
          _getDateHeaderText(date),
          style: TextStyle(
            color: Colors.grey[700],
            fontSize: 12,
            fontWeight: FontWeight.w500,
          ),
        ),
      ),
    );
  }

  String _getDateHeaderText(DateTime date) {
    final localDate = date.isUtc ? date.add(DateTime.now().timeZoneOffset) : date;
    final now = DateTime.now();
    final difference = DateTime(now.year, now.month, now.day)
        .difference(DateTime(localDate.year, localDate.month, localDate.day))
        .inDays;

    if (difference == 0) {
      return 'Today';
    } else if (difference == 1) {
      return 'Yesterday';
    } else if (difference < 7) {
      return DateFormat('EEEE').format(localDate);
    } else {
      return DateFormat('dd/MM/yy').format(localDate);
    }
  }

  bool _isSameDay(DateTime date1, DateTime date2) {
    final d1 = date1.isUtc ? date1.add(DateTime.now().timeZoneOffset) : date1;
    final d2 = date2.isUtc ? date2.add(DateTime.now().timeZoneOffset) : date2;
    return d1.year == d2.year && d1.month == d2.month && d1.day == d2.day;
  }

  Widget _buildTypingIndicator() {
    return Align(
      alignment: Alignment.centerLeft,
      child: Container(
        margin: const EdgeInsets.only(left: 8, right: 60, top: 4, bottom: 4),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        decoration: BoxDecoration(
          color: _receiverBubble,
          borderRadius: const BorderRadius.only(
            topLeft: Radius.circular(20),
            topRight: Radius.circular(20),
            bottomRight: Radius.circular(20),
            bottomLeft: Radius.circular(4),
          ),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.1),
              blurRadius: 4,
              offset: const Offset(0, 1),
            ),
          ],
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            AnimatedBuilder(
              animation: _typingAnimationController,
              builder: (context, child) {
                return Row(
                  children: List.generate(3, (index) {
                    final delay = index * 0.2;
                    final animationValue =
                        (_typingAnimationController.value - delay)
                            .clamp(0.0, 1.0);
                    final opacity =
                        (math.sin(animationValue * math.pi) * 0.7) + 0.3;

                    return Container(
                      margin: const EdgeInsets.only(right: 2),
                      child: Opacity(
                        opacity: opacity,
                        child: Container(
                          width: 6,
                          height: 6,
                          decoration: BoxDecoration(
                            color: Colors.grey[600],
                            shape: BoxShape.circle,
                          ),
                        ),
                      ),
                    );
                  }),
                );
              },
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildMessageBubble(ChatMessage message, ChatMessage? nextMessage) {
    final isMe = message.isFromCurrentUser;
    final showTail = nextMessage == null ||
        nextMessage.isFromCurrentUser != isMe ||
        nextMessage.timestamp.difference(message.timestamp).inMinutes > 5;

    return GestureDetector(
      onLongPress: () => _showMessageOptions(message),
      child: Container(
        margin: const EdgeInsets.only(bottom: 2),
        child: Row(
          mainAxisAlignment:
              isMe ? MainAxisAlignment.end : MainAxisAlignment.start,
          crossAxisAlignment: CrossAxisAlignment.end,
          children: [
            if (!isMe) const SizedBox(width: 8),
            Container(
              constraints: BoxConstraints(
                maxWidth: MediaQuery.of(context).size.width * 0.50,
              ),
              margin: EdgeInsets.only(
                left: isMe ? 60 : 8,
                right: isMe ? 8 : 60,
                top: 2,
                bottom: 2,
              ),
              decoration: BoxDecoration(
                color: isMe ? _senderBubble : _receiverBubble,
                borderRadius: BorderRadius.only(
                  topLeft: const Radius.circular(20),
                  topRight: const Radius.circular(20),
                  bottomLeft: Radius.circular(isMe || !showTail ? 20 : 4),
                  bottomRight: Radius.circular(!isMe || !showTail ? 20 : 4),
                ),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.1),
                    blurRadius: 4,
                    offset: const Offset(0, 1),
                  ),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  if (message.replyToId != null &&
                      message.replyToId!.isNotEmpty)
                    _buildMessageReplyPreview(message),
                  _buildMessageContent(message),
                  _buildMessageFooter(message),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildMessageContent(ChatMessage message) {
    switch (message.type) {
      case MessageType.image:
        return _buildImageMessage(message);
      case MessageType.file:
        return _buildFileMessage(message);
      case MessageType.audio:
        return _buildAudioMessage(message);
      case MessageType.text:
        return _buildTextMessage(message);
    }
  }

  Widget _buildMessageReplyPreview(ChatMessage message) {
    final String senderName = message.replyToSenderName ?? 'Original message';
    final bool isImage = message.replyToType == MessageType.image;
    final bool isFile = message.replyToType == MessageType.file;
    final String previewText = message.replyToContent ??
        (isImage ? '📷 Photo' : isFile ? '📎 File' : 'Original message');

    return Container(
      margin: const EdgeInsets.fromLTRB(8, 6, 8, 4),
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: message.isFromCurrentUser
            ? Colors.white.withOpacity(0.15)
            : Colors.grey[200],
        borderRadius: BorderRadius.circular(8),
        border: Border(
          left: BorderSide(
            color: message.isFromCurrentUser ? Colors.white70 : _primaryOrange,
            width: 3,
          ),
        ),
      ),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  senderName,
                  style: TextStyle(
                    color: message.isFromCurrentUser
                        ? Colors.white.withOpacity(0.85)
                        : _primaryOrange,
                    fontWeight: FontWeight.w600,
                    fontSize: 11,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  previewText,
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                  style: TextStyle(
                    color: message.isFromCurrentUser
                        ? Colors.white.withOpacity(0.7)
                        : Colors.grey[700],
                    fontSize: 12,
                  ),
                ),
              ],
            ),
          ),
          if (isImage && message.replyToImageUrl != null)
            ClipRRect(
              borderRadius: BorderRadius.circular(4),
              child: SizedBox(
                width: 32,
                height: 32,
                child: CachedNetworkImage(
                  imageUrl: message.replyToImageUrl!,
                  fit: BoxFit.cover,
                  placeholder: (context, url) =>
                      Container(color: Colors.grey[300]),
                  errorWidget: (context, url, error) =>
                      Icon(Icons.broken_image,
                          color: Colors.grey[600], size: 18),
                ),
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildTextMessage(ChatMessage message) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(12, 8, 12, 4),
      child: Text(
        message.message,
        style: TextStyle(
          fontSize: 16,
          color: message.isFromCurrentUser ? Colors.white : Colors.black87,
          height: 1.3,
        ),
      ),
    );
  }

  Widget _buildImageMessage(ChatMessage message) {
    return GestureDetector(
      onTap: () => _viewImageFullscreen(message.imageUrl, message.filePath),
      child: Container(
        constraints: const BoxConstraints(
          maxHeight: 210,
          minHeight: 150,
        ),
        child: ClipRRect(
          borderRadius: BorderRadius.circular(12),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              SizedBox(
                width: double.infinity,
                height: 200,
                child: _buildImageWidget(message),
              ),
              if (message.message.isNotEmpty &&
                  message.message != message.fileName &&
                  message.message != 'Media' &&
                  message.message != 'Media file')
                Padding(
                  padding: const EdgeInsets.all(12),
                  child: Text(
                    message.message,
                    style: TextStyle(
                      fontSize: 14,
                      color: message.isFromCurrentUser
                          ? Colors.white
                          : Colors.black87,
                    ),
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildImageWidget(ChatMessage message) {
    if (message.id.startsWith('temp_') && message.filePath != null) {
      final file = File(message.filePath!);
      if (file.existsSync()) {
        return Image.file(
          file,
          width: double.infinity,
          height: double.infinity,
          fit: BoxFit.cover,
        );
      }
    }

    if (message.imageUrl != null && message.imageUrl!.isNotEmpty) {
      return CachedNetworkImage(
        imageUrl: message.imageUrl!,
        width: double.infinity,
        height: double.infinity,
        fit: BoxFit.cover,
        placeholder: (context, url) => Container(
          color: Colors.grey[300],
          child: Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                CircularProgressIndicator(color: _primaryOrange),
                const SizedBox(height: 8),
                const Text('Loading...',
                    style: TextStyle(color: Colors.grey, fontSize: 12)),
              ],
            ),
          ),
        ),
        errorWidget: (context, url, error) {
          return Container(
            color: Colors.grey[300],
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(Icons.broken_image, color: Colors.grey[600], size: 32),
                const SizedBox(height: 8),
                Text(
                  'Cannot load image',
                  style: TextStyle(color: Colors.grey[600], fontSize: 12),
                ),
              ],
            ),
          );
        },
      );
    }

    return Container(
      color: Colors.grey[300],
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.image_not_supported, color: Colors.grey[600], size: 32),
          const SizedBox(height: 8),
          const Text('No image data',
              style: TextStyle(color: Colors.grey, fontSize: 12)),
        ],
      ),
    );
  }

  Widget _buildFileMessage(ChatMessage message) {
    return GestureDetector(
      onTap: () => _previewFile(message),
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: message.isFromCurrentUser
                    ? Colors.white24
                    : Colors.grey[200],
                shape: BoxShape.circle,
              ),
              child: Icon(
                _getFileIcon(message.fileName ?? ''),
                color:
                    message.isFromCurrentUser ? Colors.white : _primaryOrange,
                size: 24,
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    message.fileName ?? 'Document',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w500,
                      color: message.isFromCurrentUser
                          ? Colors.white
                          : Colors.black87,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  if (message.fileSize != null)
                    Text(
                      message.fileSize!,
                      style: TextStyle(
                        fontSize: 13,
                        color: message.isFromCurrentUser
                            ? Colors.white70
                            : Colors.grey[600],
                      ),
                    ),
                  Text(
                    _getFileTypeDisplay(message.fileName ?? ''),
                    style: TextStyle(
                      fontSize: 12,
                      color: message.isFromCurrentUser
                          ? Colors.white60
                          : Colors.grey[500],
                      fontStyle: FontStyle.italic,
                    ),
                  ),
                  Text(
                    'Tap to preview',
                    style: TextStyle(
                      fontSize: 11,
                      color: message.isFromCurrentUser
                          ? Colors.white70
                          : _primaryOrange,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ],
              ),
            ),
            Icon(
              Icons.open_in_new,
              color:
                  message.isFromCurrentUser ? Colors.white70 : _primaryOrange,
              size: 18,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildAudioMessage(ChatMessage message) {
    return Padding(
      padding: const EdgeInsets.all(12),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color:
                  message.isFromCurrentUser ? Colors.white24 : _primaryOrange,
              shape: BoxShape.circle,
            ),
            child: const Icon(
              Icons.play_arrow,
              color: Colors.white,
              size: 20,
            ),
          ),
          const SizedBox(width: 8),
          Expanded(
            child: Container(
              height: 2,
              decoration: BoxDecoration(
                color: message.isFromCurrentUser
                    ? Colors.white24
                    : Colors.grey[300],
                borderRadius: BorderRadius.circular(1),
              ),
            ),
          ),
        ],
      ),
    );
  }

  IconData _getFileIcon(String fileName) {
    final extension = fileName.split('.').last.toLowerCase();
    switch (extension) {
      case 'pdf':
        return Icons.picture_as_pdf;
      case 'doc':
      case 'docx':
        return Icons.description;
      case 'xls':
      case 'xlsx':
        return Icons.table_chart;
      case 'ppt':
      case 'pptx':
        return Icons.slideshow;
      case 'txt':
        return Icons.text_snippet;
      default:
        return Icons.insert_drive_file;
    }
  }

  String _getFileTypeDisplay(String fileName) {
    final extension = fileName.split('.').last.toLowerCase();
    switch (extension) {
      case 'pdf':
        return 'PDF Document';
      case 'doc':
      case 'docx':
        return 'Word Document';
      case 'xls':
      case 'xlsx':
        return 'Excel Spreadsheet';
      case 'ppt':
      case 'pptx':
        return 'PowerPoint Presentation';
      case 'txt':
        return 'Text File';
      default:
        return 'Document';
    }
  }

  Widget _buildMessageFooter(ChatMessage message) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(12, 0, 12, 8),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        mainAxisAlignment: MainAxisAlignment.end,
        children: [
          Text(
            _formatMessageTime(message.timestamp),
            style: TextStyle(
              fontSize: 11,
              color:
                  message.isFromCurrentUser ? Colors.white70 : Colors.grey[600],
            ),
          ),
          if (message.isFromCurrentUser) ...[
            const SizedBox(width: 4),
            Icon(
              message.isRead
                  ? Icons.done_all
                  : message.isDelivered
                      ? Icons.done_all
                      : Icons.done,
              size: 16,
              color: message.isRead
                  ? const Color.fromARGB(255, 255, 255, 255)
                  : Colors.white70,
            ),
          ],
        ],
      ),
    );
  }

  void _showMessageOptions(ChatMessage message) {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      builder: (context) => Container(
        decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 40,
              height: 4,
              margin: const EdgeInsets.only(top: 12),
              decoration: BoxDecoration(
                color: Colors.grey[300],
                borderRadius: BorderRadius.circular(2),
              ),
            ),
            ListTile(
              leading: Icon(Icons.reply, color: _primaryOrange),
              title: const Text('Reply'),
              onTap: () {
                Navigator.pop(context);
                setState(() {
                  _replyingToMessage = message;
                });
                _messageFocusNode.requestFocus();
              },
            ),
            ListTile(
              leading: Icon(Icons.copy, color: _primaryOrange),
              title: const Text('Copy'),
              onTap: () {
                Navigator.pop(context);
                Clipboard.setData(ClipboardData(text: message.message));
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Message copied')),
                );
              },
            ),
            if (message.isFromCurrentUser)
              ListTile(
                leading: const Icon(Icons.delete, color: Colors.red),
                title:
                    const Text('Delete', style: TextStyle(color: Colors.red)),
                onTap: () {
                  Navigator.pop(context);
                  // Implement delete functionality
                },
              ),
            const SizedBox(height: 20),
          ],
        ),
      ),
    );
  }

  Widget _buildConsultationBanner() {
    if (_isCurrentUserConsultant) return const SizedBox.shrink();
    if (_isLoadingConversation) {
      return Container(
        color: Colors.white,
        padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 12),
        child: const Row(
          children: [
            SizedBox(width: 16, height: 16, child: CircularProgressIndicator(strokeWidth: 2)),
            SizedBox(width: 8),
            Text('Loading consultation...', style: TextStyle(fontSize: 12)),
          ],
        ),
      );
    }
    if (_isPaid) {
      return Container(
        color: Colors.green[50],
        padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 12),
        child: Row(
          children: [
            Icon(Icons.check_circle, color: Colors.green[700], size: 18),
            const SizedBox(width: 8),
            Expanded(
              child: Text(
                'Paid consultation - unlimited chat',
                style: TextStyle(fontSize: 12, color: Colors.green[700], fontWeight: FontWeight.w600),
              ),
            ),
          ],
        ),
      );
    }
    if (_showPaymentUI || (_freeUntil != null && DateTime.now().isAfter(_freeUntil!))) {
      return Container(
        color: Colors.red[50],
        padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(Icons.timer_off, color: Colors.red[700], size: 18),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    'Free chat ended. Pay ₹$_paymentAmount to continue.',
                    style: TextStyle(fontSize: 12, color: Colors.red[700], fontWeight: FontWeight.w600),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 6),
            Row(
              children: [
                Expanded(
                  child: Text(
                    'Wallet: ₹${_walletBalance.toStringAsFixed(0)}',
                    style: TextStyle(fontSize: 12, color: Colors.grey[700]),
                  ),
                ),
                ElevatedButton(
                  onPressed: _isPaying ? null : _payForChat,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: _primaryOrange,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                    minimumSize: const Size(0, 32),
                    textStyle: const TextStyle(fontSize: 12),
                  ),
                  child: _isPaying
                      ? const SizedBox(width: 14, height: 14, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                      : Text('Pay ₹$_paymentAmount'),
                ),
                const SizedBox(width: 8),
                TextButton(
                  onPressed: _isAddingMoney ? null : () => _showAddMoneyDialog(),
                  style: TextButton.styleFrom(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 6),
                    minimumSize: const Size(0, 32),
                    textStyle: const TextStyle(fontSize: 12),
                  ),
                  child: _isAddingMoney
                      ? const SizedBox(width: 14, height: 14, child: CircularProgressIndicator(strokeWidth: 2))
                      : const Text('Add Money'),
                ),
              ],
            ),
          ],
        ),
      );
    }
    if (_freeUntil != null) {
      return Container(
        color: Colors.orange[50],
        padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 12),
        child: Row(
          children: [
            Icon(Icons.timer, color: Colors.orange[700], size: 18),
            const SizedBox(width: 8),
            Expanded(
              child: Text(
                _freeChatRemaining.isNotEmpty
                    ? 'Free chat ends in $_freeChatRemaining'
                    : 'Free chat active',
                style: TextStyle(fontSize: 12, color: Colors.orange[700], fontWeight: FontWeight.w600),
              ),
            ),
          ],
        ),
      );
    }
    return const SizedBox.shrink();
  }

  Widget _buildMessageInput() {
    final bool canSend = !_showPaymentUI || _isPaid;
    if (!canSend) {
      return Container(
        color: Colors.grey[200],
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 14),
        child: Row(
          children: [
            Icon(Icons.lock_outline, color: Colors.grey[600], size: 20),
            const SizedBox(width: 8),
            Expanded(
              child: Text(
                'Free chat ended. Pay ₹$_paymentAmount to continue chatting.',
                style: TextStyle(fontSize: 13, color: Colors.grey[700]),
              ),
            ),
          ],
        ),
      );
    }
    return Container(
      color: _inputBackground,
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 8),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (_replyingToMessage != null) _buildReplyPreview(),
          Row(
            children: [
              Expanded(
                child: Container(
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(25),
                    border: Border.all(color: Colors.grey[300]!),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withOpacity(0.05),
                        blurRadius: 4,
                        offset: const Offset(0, 2),
                      ),
                    ],
                  ),
                  child: Row(
                    children: [
                      if (_isCurrentUserConsultant)
                        IconButton(
                          icon: Icon(Icons.auto_fix_high,
                              color: const Color(0xFF0D47A1), size: 22),
                          tooltip: 'Templates',
                          onPressed: () {
                            showModalBottomSheet(
                              context: context,
                              isScrollControlled: true,
                              backgroundColor: Colors.white,
                              shape: const RoundedRectangleBorder(
                                borderRadius: BorderRadius.vertical(
                                    top: Radius.circular(16)),
                              ),
                              builder: (_) => ConsultantTemplatePicker(
                                agentId: _currentUserId,
                                onSelect: (content) {
                                  _messageController.text = content;
                                  _messageController.selection =
                                      TextSelection.fromPosition(
                                    TextPosition(
                                        offset: _messageController.text.length),
                                  );
                                },
                              ),
                            );
                          },
                        ),
                      IconButton(
                        icon: Icon(Icons.emoji_emotions_outlined,
                            color: Colors.grey[600]),
                        onPressed: () {
                          // Show emoji picker
                        },
                      ),
                      Expanded(
                        child: TextField(
                          controller: _messageController,
                          focusNode: _messageFocusNode,
                          style: const TextStyle(color: Colors.black87),
                          decoration: const InputDecoration(
                            hintText: 'Type a message',
                            hintStyle: TextStyle(color: Colors.grey),
                            border: InputBorder.none,
                            contentPadding: EdgeInsets.symmetric(vertical: 10),
                          ),
                          maxLines: 5,
                          minLines: 1,
                          textCapitalization: TextCapitalization.sentences,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(width: 8),
              GestureDetector(
                onTap: _messageController.text.trim().isNotEmpty
                    ? () => _sendMessage(
                          replyToId: _replyingToMessage?.id,
                        )
                    : null,
                child: Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: _messageController.text.trim().isNotEmpty
                        ? _primaryOrange
                        : Colors.grey[400],
                    shape: BoxShape.circle,
                    boxShadow: _messageController.text.trim().isNotEmpty
                        ? [
                            BoxShadow(
                              color: _primaryOrange.withOpacity(0.3),
                              blurRadius: 8,
                              offset: const Offset(0, 2),
                            ),
                          ]
                        : null,
                  ),
                  child: const Icon(
                    Icons.send,
                    color: Colors.white,
                    size: 20,
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildReplyPreview() {
    final message = _replyingToMessage;
    if (message == null) return const SizedBox.shrink();

    final bool isReplyToImage = message.type == MessageType.image;
    final bool isReplyToFile = message.type == MessageType.file;
    final String previewText = isReplyToImage
        ? (message.fileName ?? '📷 Photo')
        : isReplyToFile
            ? (message.fileName ?? '📎 File')
            : message.message;

    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border(
          left: BorderSide(color: _primaryOrange, width: 4),
        ),
      ),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  message.senderName,
                  style: TextStyle(
                    color: _primaryOrange,
                    fontWeight: FontWeight.w600,
                    fontSize: 12,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  previewText,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: TextStyle(
                    color: Colors.grey[700],
                    fontSize: 13,
                  ),
                ),
              ],
            ),
          ),
          if (isReplyToImage && message.imageUrl != null)
            ClipRRect(
              borderRadius: BorderRadius.circular(6),
              child: SizedBox(
                width: 36,
                height: 36,
                child: _buildImageWidget(message),
              ),
            ),
          const SizedBox(width: 8),
          GestureDetector(
            onTap: () {
              setState(() {
                _replyingToMessage = null;
              });
            },
            child: Icon(Icons.close, color: Colors.grey[600], size: 20),
          ),
        ],
      ),
    );
  }
}
