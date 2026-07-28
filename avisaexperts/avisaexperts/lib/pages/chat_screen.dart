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
  const String baseUrl =
      'https://voicecall-6ylg.onrender.com/api/app'; // Replace with your actual domain

  // Handle both '/img/swati.webp' and 'img/swati.webp' formats
  if (url.startsWith('/')) {
    return baseUrl + url;
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

class _ChatScreenState extends State<ChatScreen> with TickerProviderStateMixin {
  final TextEditingController _messageController = TextEditingController();
  final ScrollController _scrollController = ScrollController();
  final FocusNode _messageFocusNode = FocusNode();
  final ImagePicker _imagePicker = ImagePicker();
  final SoundService _soundService = SoundService();

  List<ChatMessage> _messages = [];
  bool _isTyping = false;
  final bool _isOnline = true;
  String _currentUserId = '';
  bool _isLoadingUserId = true;
  bool _isCurrentUserConsultant = false;

  // Scroll behavior tracking
  bool _isUserScrolledUp = false;
  bool _isLoadingNewMessages = false;

  // Animation controllers
  late AnimationController _typingAnimationController;

  Timer? _messageRefreshTimer;
  Timer? _typingTimer;

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
    _messageController.dispose();
    _scrollController.dispose();
    _messageFocusNode.dispose();
    _typingAnimationController.dispose();
    _messageRefreshTimer?.cancel();
    _typingTimer?.cancel();
    clearCurrentChatReceiver();
    super.dispose();
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

      if (mounted) {
        setState(() {
          _currentUserId = loadedUserId?.isNotEmpty == true
              ? loadedUserId!
              : 'guest_${DateTime.now().millisecondsSinceEpoch}';
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
    _loadMessagesFromAPI();
    _startMessageRefreshTimer();
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

  Future<void> _loadMessagesFromAPI() async {
    if (_currentUserId.isEmpty || _isLoadingNewMessages) return;

    setState(() => _isLoadingNewMessages = true);

    try {
      final dio = Dio();
      final response = await dio
          .get(
            '/chat/messages?sender_id=$_currentUserId&receiver_id=${widget.advisorId}',
            options: Options(headers: {'Content-Type': 'application/json'}),
          )
          .timeout(const Duration(seconds: 60));

      if (!mounted) return;

      if (response.statusCode == 200) {
        dynamic decodedData;
        try {
          decodedData = json.decode(response.data);
        } catch (e) {
          logger.e("Invalid JSON format: $e");
          return;
        }

        if (decodedData is Map<String, dynamic>) {
          if (decodedData['success'] == true &&
              decodedData['messages'] is List) {
            final List<dynamic> messagesJson = decodedData['messages'];
            final int previousMessageCount = _messages.length;

            final newMessages = messagesJson.map((messageData) {
              final isFromCurrentUser =
                  messageData['sender_id'].toString() == _currentUserId;

              String? imageUrl;
              String? filePath = messageData['file_path'];

              if (filePath != null && filePath.isNotEmpty) {
                filePath = filePath.replaceAll('\\', '/');
                filePath = filePath.replaceFirst(RegExp(r'^/+'), '');
                imageUrl = "/$filePath";
              }

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
                    _extractFileNameFromPath(filePath) ??
                    'File',
                fileSize: null,
                filePath: filePath,
                isDelivered: true,
                isRead: messageData['is_read'] == 'Yes' ||
                    messageData['status'] == 'Read',
              );
            }).toList();

            // Merge with existing temp messages to prevent flicker
            final existingTempMessages = _messages.where((m) => m.id.startsWith('temp_')).toList();
            final keptTempMessages = existingTempMessages.where((temp) {
              return !newMessages.any((apiMsg) =>
                  apiMsg.senderId == temp.senderId &&
                  apiMsg.message == temp.message);
            }).toList();

            final mergedMessages = [...newMessages, ...keptTempMessages];
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
    } catch (e) {
      logger.e("Error fetching messages: $e");
    } finally {
      setState(() => _isLoadingNewMessages = false);
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
        _loadMessagesFromAPI();
      } else {
        timer.cancel();
      }
    });
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

    final String fileUrl = "/${message.filePath!}";
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
        _viewImageFullscreen(fileUrl, null);
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
    );

    setState(() {
      _messages.add(tempMessage);
      if (type == MessageType.text) _messageController.clear();
      _isTyping = false;
    });

    _scrollToBottomSmooth();

    try {
      final dio = Dio();
      String messageToSend = type == MessageType.text
          ? messageText
          : (caption ?? fileName ?? 'Media file');
      final String url = '/chat/send';

      Response response;

      if (type == MessageType.text) {
        response = await dio
            .post(
              url,
              data: {
                'sender_id': _currentUserId,
                'receiver_id': widget.advisorId,
                'message': messageToSend,
                'message_type': type.name,
              },
              options: Options(
                contentType: 'application/x-www-form-urlencoded',
                responseType: ResponseType.json,
              ),
            )
            .timeout(const Duration(seconds: 30));
      } else {
        FormData formData = FormData.fromMap({
          'sender_id': _currentUserId,
          'receiver_id': widget.advisorId,
          'message': messageToSend,
          'message_type': type.name,
          'file_type': type.name,
          'file_name': fileName,
          'file_size': fileSize,
          'file':
              filePath != null ? await MultipartFile.fromFile(filePath) : null,
        });

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

        // Keep temp message as-is. The 3-second timer will merge it with the real server message.
        // Don't reload immediately — the DB read may happen before the write commits.
      } else {
        throw Exception('Server error: ${response.statusCode}');
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
    return DateFormat('HH:mm').format(dateTime);
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
                  '/img/blackbg%201.webp',
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
          onPressed: () {},
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
    final now = DateTime.now();
    final difference = now.difference(date).inDays;

    if (difference == 0) {
      return 'Today';
    } else if (difference == 1) {
      return 'Yesterday';
    } else if (difference < 7) {
      return DateFormat('EEEE').format(date);
    } else {
      return DateFormat('dd/MM/yy').format(date);
    }
  }

  bool _isSameDay(DateTime date1, DateTime date2) {
    return date1.year == date2.year &&
        date1.month == date2.month &&
        date1.day == date2.day;
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

  Widget _buildMessageInput() {
    return Container(
      color: _inputBackground,
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 8),
      child: Row(
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
                  IconButton(
                    icon: Icon(Icons.attach_file, color: Colors.grey[600]),
                    onPressed: _showAttachmentOptions,
                  ),
                  if (_messageController.text.trim().isEmpty)
                    IconButton(
                      icon: Icon(Icons.camera_alt, color: Colors.grey[600]),
                      onPressed: _takePhoto,
                    ),
                ],
              ),
            ),
          ),
          const SizedBox(width: 8),
          GestureDetector(
            onTap: _messageController.text.trim().isNotEmpty
                ? () => _sendMessage()
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
    );
  }
}
