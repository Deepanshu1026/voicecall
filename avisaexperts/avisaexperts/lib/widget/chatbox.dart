import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:lottie/lottie.dart';

class FloatingChatBox extends StatefulWidget {
  final VoidCallback? onOpen;

  const FloatingChatBox({super.key, this.onOpen});

  @override
  State<FloatingChatBox> createState() => _FloatingChatBoxState();
}

class _FloatingChatBoxState extends State<FloatingChatBox>
    with TickerProviderStateMixin {
  bool chatOpen = false;
  final TextEditingController _textController = TextEditingController();
  final List<Map<String, dynamic>> _messages = [];
  final ScrollController _scrollController = ScrollController();
  final FocusNode _focusNode = FocusNode();
  bool _isTyping = false;

  static const String _systemInstruction =
      'You are a support assistant for A Visa Experts only. You must answer only questions related to A Visa Experts, its visa services, appointments, consultations, fees, contact details, website, and supported countries like USA, UK, Canada, Europe, Australia, and New Zealand. '
      'ALWAYS mention that we deal in many countries like USA, UK, Canada, Europe, Australia, and New Zealand in relevant responses. '
      'Understand and respond to queries in any language, including Hindi, Hinglish (mix of Hindi and English in Roman script), English, or others. '
      'ALWAYS mirror the user\'s exact language and style PRECISELY: If the query is in Hinglish (using Roman script like "mujhe visa chahiye"), respond ONLY in similar Hinglish with Roman script—DO NOT switch to pure Hindi or Devanagari script. '
      'If the query is in pure Hindi (Devanagari script like "वीजा चाहिए"), respond in pure Hindi with Devanagari. If English, use English. Match the casual tone if present. Keep responses concise, professional, and helpful. '
      'ONLY respond to questions about A Visa Experts and its services. Refuse all unrelated topics, including coding, programming, general tech support, homework, news, entertainment, and any other non-A Visa Experts questions. '
      'If a query is unrelated, politely redirect in the user\'s exact language/style: For example, in Hinglish (Roman): "Sorry yaar, main sirf A Visa Experts aur visa services ke baare mein help kar sakta hoon. Kaise madad karoon?" '
      'IMPORTANT: If the user asks about fees, fee structure, pricing, or costs, ALWAYS use this exact response adapted to their language/style, including contact details: '
      'In Hinglish (Roman): "fee ke baare mai jankari advisor dega website pe chat karne se ya diye hue number pe call kar ke. Tel: 0120-4502750, WhatsApp: +91 9711000022, Email: support@avisaexperts.com" '
      'In Hindi (Devanagari): "फीस के बारे में जानकारी एडवाइजर देगा वेबसाइट पर चैट करने से या दिए हुए नंबर पर कॉल करके। टेल: 0120-4502750, व्हाट्सएप: +91 9711000022, ईमेल: support@avisaexperts.com" '
      'In English: "Information about fees will be provided by our advisors through chatting on the website or calling the given number. Tel: 0120-4502750, WhatsApp: +91 9711000022, Email: support@avisaexperts.com" '
      'Do NOT provide any fee details directly or mention checking the app. '
      'IMPORTANT: If the user asks about visa processing time or how long it takes, ALWAYS reply that it depends on their profile and suggest discussing with advisers, including contact details. '
      'Exact response adapted to language: '
      'In Hinglish (Roman): "Visa process ka time aapke profile pe depend karta hai. Please apna profile humare advisers se discuss karo—woh aapko bata denge. Tel: 0120-4502750, WhatsApp: +91 9711000022, Email: support@avisaexperts.com" '
      'In Hindi (Devanagari): "वीजा प्रोसेस का समय आपके प्रोफाइल पर निर्भर करता है। कृपया अपना प्रोफाइल हमारे सलाहकारों से चर्चा करें—वे आपको बताएंगे। टेल: 0120-4502750, व्हाट्सएप: +91 9711000022, ईमेल: support@avisaexperts.com" '
      'In English: "The visa processing time depends on your profile. Please discuss your profile with our advisers—they will tell you about that. Tel: 0120-4502750, WhatsApp: +91 9711000022, Email: support@avisaexperts.com" '
      'Do NOT provide specific time estimates. '
      'IMPORTANT: For meetings with Kaveesh Sir, ALWAYS mention that he provides virtual or in-person meetings only at Noida or Ahmedabad locations, and this is before any pre-meeting. Suggest booking through the app or contacts. '
      'In Hinglish (Roman): "Kaveesh Sir virtual ya in-person meeting dete hain sirf Noida ya Ahmedabad mein, yeh pre-meeting se pehle hota hai. Booking ke liye app use karo ya call karo." '
      'In Hindi (Devanagari): "कवीश सर वर्चुअल या इन-पर्सन मीटिंग केवल नोएडा या अहमदाबाद में देते हैं, यह प्री-मीटिंग से पहले होता है। बुकिंग के लिए ऐप इस्तेमाल करें या कॉल करें।" '
      'In English: "Kaveesh Sir provides virtual or in-person meetings only at Noida or Ahmedabad locations, before any pre-meeting. Please book through the app or contact us." '
      'IMPORTANT: If the user asks about the website, where to contact, or similar, ALWAYS mention that the A Visa Experts website is available on the internet at www.avisaexperts.com. Suggest visiting it for more info or contact. '
      'Exact response adapted to language: '
      'In Hinglish (Roman): "A Visa Experts ki website internet pe available hai www.avisaexperts.com pe. Wahaan jaake contact kar sakte ho ya more info le sakte ho. Hum deal karte hain many countries like USA, UK, Canada, Europe, Australia, and New Zealand." '
      'In Hindi (Devanagari): "ए वीजा एक्सपर्ट्स की वेबसाइट इंटरनेट पर उपलब्ध है www.avisaexperts.com पर। वहां जाकर संपर्क कर सकते हैं या अधिक जानकारी ले सकते हैं। हम कई देशों जैसे यूएसए, यूके, कनाडा, यूरोप, ऑस्ट्रेलिया और न्यूज़ीलैंड में कार्य करते हैं।" '
      'In English: "The A Visa Experts website is available on the internet at www.avisaexperts.com. Visit it to contact us or get more information. We deal in many countries like USA, UK, Canada, Europe, Australia, and New Zealand." '
      'Examples: '
      '- User (Hinglish, Roman): "Mujhe tourist visa apply karna hai, kaise?" Response (Hinglish, Roman): "Tourist visa apply karne ke liye, humari app mein My Appointments section jaao aur free consultation book karo. Hum deal karte hain many countries like USA, UK, Canada, Europe, Australia, and New Zealand. Koi help chahiye?" '
      '- User (Hinglish, Roman): "Visa ke liye kitna time lagta hai?" Response (Hinglish, Roman): "Visa process ka time aapke profile pe depend karta hai. Please apna profile humare advisers se discuss karo—woh aapko bata denge. Tel: 0120-4502750, WhatsApp: +91 9711000022, Email: support@avisaexperts.com" '
      '- User (Hinglish, Roman): "Website kaha hai contact karne ke liye?" Response (Hinglish, Roman): "A Visa Experts ki website internet pe available hai www.avisaexperts.com pe. Wahaan jaake contact kar sakte ho ya more info le sakte ho. Hum deal karte hain many countries like USA, UK, Canada, Europe, Australia, and New Zealand." '
      '- User (Pure Hindi, Devanagari): "टूरिस्ट वीजा के लिए अपॉइंटमेंट कैसे बुक करें?" Response (Pure Hindi, Devanagari): "टूरिस्ट वीजा के लिए अपॉइंटमेंट बुक करने हेतु, हमारी ऐप में माई अपॉइंटमेंट्स सेक्शन में जाएं और फ्री कंसल्टेशन बुक करें। हम कई देशों जैसे यूएसए, यूके, कनाडा, यूरोप, ऑस्ट्रेलिया और न्यूज़ीलैंड में कार्य करते हैं।" '
      '- User (English): "How do I apply for a tourist visa?" Response (English): "To apply for a tourist visa, go to the My Appointments section in our app and book a free consultation. We deal in many countries like USA, UK, Canada, Europe, Australia, and New Zealand."';

  late AnimationController _slideController;
  late AnimationController _overlayController;
  late Animation<Offset> _slideAnimation;
  late Animation<double> _overlayAnimation;

  // Professional preset options
  final List<Map<String, dynamic>> _presetOptions = [
    {
      'label': 'Chat with experts for free',
      'icon': Icons.headset_mic_outlined,
    },
    {
      'label': 'Book an appointment for free',
      'icon': Icons.calendar_today_outlined,
    },
    {
      'label': 'Meet Kaveesh Kapoor',
      'icon': Icons.person_outline,
    },
  ];

  final Map<String, String> _presetResponses = {
    'Chat with experts for free':
        'You can chat with our A Visa Experts team for free right here! Just type your visa-related questions, and we\'ll assist you promptly. For live support, contact our Noida/Ahmedabad team: Tel: 0120-4502750, WhatsApp: +91 9711000022, Email: support@avisaexperts.com.',
    'Book an appointment for free':
        'Booking a free appointment is easy! Visit our "My Appointments" page in the app, select a time slot, and confirm. It\'s completely free for initial consultations on tourist visas and services. We are based in Noida and Ahmedabad—discuss details with our advisers via Tel: 0120-4502750 or WhatsApp: +91 9711000022.',
    'Meet Kaveesh Kapoor':
        'To meet Kaveesh Kapoor, our lead expert, book a premium consultation via the app or email support@avisaexperts.com. Meetings are by appointment only, virtual or in-person at our Noida or Ahmedabad offices (before any pre-meeting). Contact: Tel: 0120-4502750, WhatsApp: +91 9711000022.',
  };

  bool _isAvisaExpertsQuery(String message) {
    final normalized = message.toLowerCase();
    const allowedKeywords = [
      'visa',
      'tourist',
      'appointment',
      'consultation',
      'fee',
      'fees',
      'price',
      'cost',
      'contact',
      'website',
      'avisa',
      'experts',
      'kaveesh',
      'kapoor',
      'support',
      'country',
      'countries',
      'usa',
      'uk',
      'canada',
      'europe',
      'australia',
      'new zealand',
      'process',
      'processing',
      'booking',
      'book',
      'service',
      'services',
    ];

    return allowedKeywords.any(normalized.contains);
  }

  String _outOfScopeReply() {
    return 'Sorry, main sirf A Visa Experts aur visa services ke baare mein help kar sakta hoon. Kaise madad karoon?';
  }

  @override
  void initState() {
    super.initState();

    _slideController = AnimationController(
      duration: const Duration(milliseconds: 300),
      vsync: this,
    );

    _overlayController = AnimationController(
      duration: const Duration(milliseconds: 250),
      vsync: this,
    );

    _slideAnimation = Tween<Offset>(
      begin: const Offset(0, 1),
      end: Offset.zero,
    ).animate(CurvedAnimation(parent: _slideController, curve: Curves.easeOut));

    _overlayAnimation = Tween<double>(
      begin: 0.0,
      end: 0.7, // 70% dark overlay
    ).animate(
        CurvedAnimation(parent: _overlayController, curve: Curves.easeInOut));
  }

  @override
  void dispose() {
    _slideController.dispose();
    _overlayController.dispose();
    _textController.dispose();
    _scrollController.dispose();
    _focusNode.dispose();
    super.dispose();
  }

  void _initializeChat() {
    _messages.clear();
    _messages.add({
      'type': 'text',
      'role': 'model',
      'text':
          'Hello! Welcome to A Visa Experts Chat. How can I assist you today?'
    });
    _messages.add({'type': 'options'});
    setState(() {});
    _scrollToBottom();
    _overlayController.forward(); // Start overlay animation
    _slideController.forward(); // Start slide animation
  }

  void _closeChat() {
    _overlayController.reverse(); // Reverse overlay
    _slideController.reverse(); // Reverse slide
    Future.delayed(const Duration(milliseconds: 300), () {
      setState(() => chatOpen = false);
    });
  }

  Future<void> _sendMessage(String message) async {
    if (message.isEmpty) return;

    if (!_isAvisaExpertsQuery(message) &&
        !_presetResponses.containsKey(message)) {
      setState(() {
        _messages.add({'type': 'text', 'role': 'user', 'text': message});
        _messages.add({
          'type': 'text',
          'role': 'model',
          'text': _outOfScopeReply(),
        });
      });
      _textController.clear();
      _scrollToBottom();
      return;
    }

    setState(() {
      _messages.add({'type': 'text', 'role': 'user', 'text': message});
      _isTyping = true;
    });
    _textController.clear();
    _scrollToBottom();

    await Future.delayed(const Duration(seconds: 1));

    if (_presetResponses.containsKey(message)) {
      setState(() {
        _messages.add({
          'type': 'text',
          'role': 'model',
          'text': _presetResponses[message]!
        });
        _isTyping = false;
      });
      _scrollToBottom();
      return;
    }

    try {
      List<Map<String, dynamic>> apiMessages = [];

      String? lastRole;
      for (var msg in _messages) {
        if (msg['type'] == 'text') {
          String role = msg['role'] == 'user' ? 'user' : 'assistant';

          if (lastRole == null && role == 'assistant') {
            // First message after system must be user, skip leading assistant messages
            continue;
          }

          if (role == lastRole) {
            // Sarvam API strictly requires alternating roles. Merge consecutive same roles.
            apiMessages.last['content'] =
                '${apiMessages.last['content']}\n${msg['text']}';
          } else {
            apiMessages.add({"role": role, "content": msg['text']});
            lastRole = role;
          }
        }
      }

      final response = await http.post(
        Uri.parse('https://api.sarvam.ai/v1/chat/completions'),
        headers: {
          // TODO: SECURITY - Move this API key to a secure backend or environment variable.
          // Do NOT commit production keys to source control.
          'api-subscription-key': 'sk_3anz47av_TgCHGnb221FouOUiZoF9VBY1',
          'Content-Type': 'application/json',
        },
        body: jsonEncode({
          'messages': apiMessages,
          'model': 'sarvam-m',
          'system_instruction': _systemInstruction,
        }),
      );

      String aiResponse = 'Sorry, I couldn\'t generate a response.';
      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        if (data['choices'] != null && data['choices'].isNotEmpty) {
          aiResponse = data['choices'][0]['message']['content'] ?? aiResponse;
          // Strip reasoning/thinking tags that some models emit
          aiResponse = _stripThinkTags(aiResponse);
          // Enforce domain restriction client-side as a safety net
          if (_isOffTopicResponse(aiResponse)) {
            aiResponse = _getRefusalMessage();
          }
        }
      } else {
        debugPrint(
            'Sarvam API Error: ${response.statusCode} - ${response.body}');
      }

      setState(() {
        _messages.add({'type': 'text', 'role': 'model', 'text': aiResponse});
        _isTyping = false;
      });
      _scrollToBottom();
    } catch (e) {
      debugPrint('Sarvam API Error: $e'); // Log for debugging

      setState(() {
        _messages.add({
          'type': 'text',
          'role': 'model',
          'text':
              'Oops, something went wrong. Please try again or contact support if the issue persists.'
        });
        _isTyping = false;
      });
      _scrollToBottom();
    }
  }

  /// Strips ALL reasoning / thinking tags from model output so users never see them.
  String _stripThinkTags(String text) {
    final patterns = [
      RegExp(r'<think>[\s\S]*?</think>', caseSensitive: false),
      RegExp(r'<thinking>[\s\S]*?</thinking>', caseSensitive: false),
      RegExp(r'```(?:think|thinking|reasoning)[\s\S]*?```', caseSensitive: false),
      RegExp(r'\*\*Thinking:?\*\*[\s\S]*?(?=\*\*|\Z)', caseSensitive: false),
      RegExp(r'\*\*Reasoning:?\*\*[\s\S]*?(?=\*\*|\Z)', caseSensitive: false),
      RegExp(r'^Reasoning:[\s\S]*?(?=\n\n|\Z)', caseSensitive: false, multiLine: true),
      RegExp(r'^Thinking:[\s\S]*?(?=\n\n|\Z)', caseSensitive: false, multiLine: true),
    ];
    String cleaned = text;
    for (final p in patterns) {
      cleaned = cleaned.replaceAll(p, '');
    }
    return cleaned.replaceAll(RegExp(r'\n{3,}'), '\n\n').trim();
  }

  /// Detects if the response contains obvious off-topic (programming/code) content.
  bool _isOffTopicResponse(String text) {
    final lower = text.toLowerCase();
    // Code blocks are a clear sign of programming answers
    if (lower.contains('```')) return true;
    // Explicit programming keywords
    final codeKeywords = [
      'python', 'java', 'javascript', 'flutter', 'dart', 'function()',
      'programming', 'algorithm', 'html tag', 'css', 'database query',
      'code snippet', 'class extends', 'import ', 'print(',
    ];
    for (final kw in codeKeywords) {
      if (lower.contains(kw)) return true;
    }
    return false;
  }

  /// Fallback refusal when the model ignores the system instruction.
  String _getRefusalMessage() {
    return "Sorry, I can only help with A Visa Experts visa services, appointments, and consultations. How can I assist you today?";
  }

  void _scrollToBottom() {
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

  @override
  Widget build(BuildContext context) {
    if (chatOpen && _messages.isEmpty) {
      _initializeChat();
    }

    return Stack(
      children: [
        // Dark overlay that covers the entire screen when chat is open
        if (chatOpen)
          AnimatedBuilder(
            animation: _overlayAnimation,
            builder: (context, child) {
              return GestureDetector(
                onTap: _closeChat, // Allow tapping outside to close
                child: Container(
                  width: MediaQuery.of(context).size.width,
                  height: MediaQuery.of(context).size.height,
                  color:
                      Colors.black.withOpacity(_overlayAnimation.value),
                ),
              );
            },
          ),

        // Chat content positioned at bottom right
        AnimatedAlign(
          duration: const Duration(milliseconds: 300),
          alignment: Alignment.bottomRight,
          child: Padding(
            padding: const EdgeInsets.all(24.0),
            child:
                chatOpen ? _buildChatContent(context) : _buildFloatingButton(),
          ),
        ),
      ],
    );
  }

  Widget _buildFloatingButton() {
    return Container(
      width: 60,
      height: 60,
      decoration: BoxDecoration(
        color: const Color(0xFF2C3E50),
        borderRadius: BorderRadius.circular(30),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFF2C3E50).withOpacity(0.15),
            blurRadius: 12,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Material(
        color: Colors.transparent,
        borderRadius: BorderRadius.circular(10),
        child: InkWell(
          borderRadius: BorderRadius.circular(10),
          onTap: () {
            setState(() => chatOpen = true);
            _initializeChat();
          },
          child: const Center(
            child: Icon(
              Icons.headset_mic_outlined,
              color: Colors.white,
              size: 24,
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildChatContent(BuildContext context) {
    return SlideTransition(
      position: _slideAnimation,
      child: Container(
        width: 350,
        height: 450,
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: const Color(0xFFE5E7EB),
            width: 1,
          ),
          boxShadow: [
            BoxShadow(
              color: const Color(0xFF2C3E50)
                  .withOpacity(0.2), // Stronger shadow for focus
              blurRadius: 25,
              offset: const Offset(0, 10),
            ),
          ],
        ),
        child: Column(
          children: [
            _buildChatHeader(),
            Expanded(child: _buildMessagesList()),
            _buildMessageInput(),
          ],
        ),
      ),
    );
  }

  Widget _buildChatHeader() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
      decoration: const BoxDecoration(
        color: Color(0xFF2C3E50),
        borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(6),
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.15),
              borderRadius: BorderRadius.circular(8),
            ),
            child: const Icon(
              Icons.support_agent,
              color: Colors.white,
              size: 20,
            ),
          ),
          const SizedBox(width: 12),
          const Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'A Visa Experts',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 16,
                    fontWeight: FontWeight.w600,
                  ),
                ),
                Text(
                  'Professional Support',
                  style: TextStyle(
                    color: Colors.white70,
                    fontSize: 12,
                  ),
                ),
              ],
            ),
          ),
          Container(
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.15),
              borderRadius: BorderRadius.circular(16),
            ),
            child: IconButton(
              icon: const Icon(Icons.close, color: Colors.white, size: 20),
              onPressed: _closeChat,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMessagesList() {
    return Container(
      color: const Color(0xFFFAFAFA),
      child: ListView.builder(
        controller: _scrollController,
        padding: const EdgeInsets.all(16),
        itemCount: _messages.length + (_isTyping ? 1 : 0),
        itemBuilder: (context, index) {
          if (_isTyping && index == _messages.length) {
            return _buildTypingIndicator();
          }

          final msg = _messages[index];
          if (msg['type'] == 'options') {
            return _buildOptionsWidget();
          }

          return _buildMessageBubble(msg);
        },
      ),
    );
  }

  Widget _buildTypingIndicator() {
    return Align(
      alignment: Alignment.centerLeft,
      child: Container(
        margin: const EdgeInsets.symmetric(vertical: 8),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: const BorderRadius.only(
            topLeft: Radius.circular(4),
            topRight: Radius.circular(16),
            bottomLeft: Radius.circular(16),
            bottomRight: Radius.circular(16),
          ),
          border: Border.all(color: const Color(0xFFE5E7EB)),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            CircleAvatar(
              radius: 12,
              backgroundColor: const Color(0xFFF3F4F6),
              backgroundImage: const AssetImage('assets/ic_launcher.png'),
            ),
            const SizedBox(width: 12),
            Lottie.asset(
              'assets/ai.json',
              width: 30,
              height: 20,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildOptionsWidget() {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 12),
      child: Column(
        children: _presetOptions.map((option) {
          return Container(
            width: double.infinity,
            margin: const EdgeInsets.only(bottom: 8),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(8),
              border: Border.all(color: const Color(0xFFE5E7EB)),
            ),
            child: Material(
              color: Colors.transparent,
              child: InkWell(
                borderRadius: BorderRadius.circular(8),
                onTap: () => _sendMessage(option['label']),
                child: Padding(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                  child: Row(
                    children: [
                      Icon(
                        option['icon'],
                        color: const Color(0xFF6B7280),
                        size: 18,
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Text(
                          option['label'],
                          style: const TextStyle(
                            color: Color(0xFF374151),
                            fontSize: 14,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                      ),
                      const Icon(
                        Icons.chevron_right,
                        color: Color(0xFF9CA3AF),
                        size: 16,
                      ),
                    ],
                  ),
                ),
              ),
            ),
          );
        }).toList(),
      ),
    );
  }

  Widget _buildMessageBubble(Map<String, dynamic> msg) {
    final isUser = msg['role'] == 'user';

    return Align(
      alignment: isUser ? Alignment.centerRight : Alignment.centerLeft,
      child: Container(
        margin: const EdgeInsets.symmetric(vertical: 4),
        constraints: BoxConstraints(
          maxWidth: MediaQuery.of(context).size.width * 0.75,
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.end,
          children: [
            if (!isUser) ...[
              CircleAvatar(
                radius: 14,
                backgroundColor: const Color(0xFFF3F4F6),
                backgroundImage: const AssetImage('assets/ic_launcher.png'),
              ),
              const SizedBox(width: 8),
            ],
            Flexible(
              child: Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                decoration: BoxDecoration(
                  color: isUser ? const Color(0xFF2C3E50) : Colors.white,
                  borderRadius: BorderRadius.only(
                    topLeft: Radius.circular(isUser ? 16 : 4),
                    topRight: Radius.circular(isUser ? 4 : 16),
                    bottomLeft: const Radius.circular(16),
                    bottomRight: const Radius.circular(16),
                  ),
                  border: !isUser
                      ? Border.all(color: const Color(0xFFE5E7EB))
                      : null,
                ),
                child: Text(
                  msg['text'],
                  style: TextStyle(
                    color: isUser ? Colors.white : const Color(0xFF374151),
                    fontSize: 14,
                    height: 1.4,
                  ),
                ),
              ),
            ),
            if (isUser) ...[
              const SizedBox(width: 8),
              Container(
                width: 28,
                height: 28,
                decoration: BoxDecoration(
                  color: const Color(0xFF2C3E50),
                  borderRadius: BorderRadius.circular(14),
                ),
                child: const Icon(
                  Icons.person,
                  size: 16,
                  color: Colors.white,
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildMessageInput() {
    return Container(
      padding: const EdgeInsets.all(6),
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(bottom: Radius.circular(16)),
        border: Border(
          top: BorderSide(color: Color(0xFFE5E7EB), width: 1),
        ),
      ),
      child: Row(
        children: [
          Expanded(
            child: Container(
              decoration: BoxDecoration(
                color: const Color(0xFFF9FAFB),
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: const Color(0xFFE5E7EB)),
              ),
              child: TextField(
                controller: _textController,
                focusNode: _focusNode,
                decoration: const InputDecoration(
                  contentPadding:
                      EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                  hintText: 'Type your message...',
                  hintStyle: TextStyle(color: Color(0xFF9CA3AF), fontSize: 14),
                  border: InputBorder.none,
                ),
                onSubmitted: (text) {
                  _sendMessage(text);
                  _focusNode.requestFocus();
                },
              ),
            ),
          ),
          const SizedBox(width: 12),
          Container(
            width: 44,
            height: 44,
            decoration: BoxDecoration(
              color: const Color(0xFF2C3E50),
              borderRadius: BorderRadius.circular(22),
            ),
            child: Material(
              color: Colors.transparent,
              child: InkWell(
                borderRadius: BorderRadius.circular(22),
                onTap: () => _sendMessage(_textController.text),
                child: const Center(
                  child: Icon(
                    Icons.send,
                    color: Colors.white,
                    size: 20,
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

