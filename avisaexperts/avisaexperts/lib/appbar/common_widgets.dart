// common_widgets.dart
import 'package:flutter/material.dart';
import 'package:lottie/lottie.dart'; // <-- Import Lottie
import 'package:cached_network_image/cached_network_image.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'dart:async';

import '../pages/notifications_screen.dart';
import '../pages/my_tickets_screen.dart';
import '../models/app_notifiers.dart';
import '../navigation/main_navigation_screen.dart';

// Colors
const Color primaryColor = Color(0xFF0D47A1);
const Color textFieldFillColor = Colors.white;
const Color scaffoldBgColor = Color(0xFFF8F9FA);
const Color errorColor = Color(0xFFD32F2F); // A specific, strong red for errors

final ValueNotifier<bool> hasNewNotificationsNotifier =
    ValueNotifier<bool>(false);

const String baseImageUrl = 'https://avisaexperts.com/';

class GlobalAppBar extends StatefulWidget implements PreferredSizeWidget {
  final String userName;
  final String? userImagePath;
  final VoidCallback? onNotificationTap;
  final bool showBackButton;

  const GlobalAppBar({
    super.key,
    required this.userName,
    this.userImagePath,
    this.onNotificationTap,
    this.showBackButton = false,
  });

  @override
  State<GlobalAppBar> createState() => _GlobalAppBarState();

  @override
  Size get preferredSize => const Size.fromHeight(kToolbarHeight);
}

class _GlobalAppBarState extends State<GlobalAppBar> {
  static Timer? _globalPollingTimer;
  static int? _globalPollingUserId;
  static bool _isGlobalPollingActive = false;
  int? _instanceUserId;

  @override
  void initState() {
    super.initState();
    _initializePolling();
  }

  Future<void> _initializePolling() async {
    final prefs = await SharedPreferences.getInstance();
    if (!mounted) return;

    _instanceUserId = prefs.getInt(USER_ID_PREFS_KEY);
    if (_instanceUserId == null) {
      if (mounted) ticketCountNotifier.value = 0;
      return;
    }

    final count = await fetchTicketCountFromApi(_instanceUserId!);
    if (mounted && ticketCountNotifier.value != count) {
      ticketCountNotifier.value = count;
    }

    if (!_isGlobalPollingActive || _globalPollingUserId != _instanceUserId) {
      _globalPollingTimer?.cancel();
      _globalPollingUserId = _instanceUserId;
      _globalPollingTimer =
          Timer.periodic(const Duration(seconds: 30), (timer) async {
        if (_globalPollingUserId == null) {
          timer.cancel();
          _isGlobalPollingActive = false;
          return;
        }
        final c = await fetchTicketCountFromApi(_globalPollingUserId!);
        if (ticketCountNotifier.value != c) {
          ticketCountNotifier.value = c;
        }
      });
      _isGlobalPollingActive = true;
    }
  }

  @override
  Widget build(BuildContext context) {
    final Widget placeholderIcon =
        Icon(Icons.person, size: 24, color: Colors.grey.shade600);

    String? fullImageUrl;
    if (widget.userImagePath != null && widget.userImagePath!.isNotEmpty) {
      fullImageUrl = widget.userImagePath!.startsWith('http')
          ? widget.userImagePath
          : baseImageUrl + widget.userImagePath!.replaceAll(RegExp(r'^/'), '');
    }

    Widget leadingAvatar;
    if (fullImageUrl != null) {
      leadingAvatar = ClipOval(
        child: CachedNetworkImage(
          imageUrl: fullImageUrl,
          width: 40,
          height: 40,
          fit: BoxFit.cover,
          placeholder: (context, url) => Container(
            width: 40,
            height: 40,
            color: Colors.grey.shade200,
            child: const Center(
                child: SizedBox(
                    width: 20,
                    height: 20,
                    child: CircularProgressIndicator(strokeWidth: 2))),
          ),
          errorWidget: (context, url, _) => Container(
            width: 40,
            height: 40,
            color: Colors.grey.shade200,
            child: placeholderIcon,
          ),
        ),
      );
    } else {
      leadingAvatar = ClipOval(
        child: Container(
          width: 40,
          height: 40,
          color: Colors.grey.shade200,
          child: placeholderIcon,
        ),
      );
    }

    return AppBar(
      elevation: 1.0,
      backgroundColor: const Color.fromARGB(255, 255, 255, 255),
      surfaceTintColor: const Color.fromARGB(255, 255, 255, 255),
      leadingWidth: widget.showBackButton ? 56 : 56 + 16,
      leading: widget.showBackButton
          ? IconButton(
              icon: const Icon(Icons.arrow_back, color: Colors.black54),
              onPressed: () => Navigator.maybePop(context),
            )
          : GestureDetector(
              behavior: HitTestBehavior.opaque,
              onTap: () => MainNavigationScreen.navigateToTab(context, 3),
              child: Center(
                child: Padding(
                  padding: const EdgeInsets.only(left: 16.0, right: 8.0),
                  child: leadingAvatar,
                ),
              ),
            ),
      titleSpacing: 0,
      title: GestureDetector(
        onTap: () => MainNavigationScreen.navigateToTab(context, 3),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Text("Hey",
                style: TextStyle(
                    color: Colors.black54,
                    fontSize: 14,
                    fontWeight: FontWeight.normal)),
            Text(widget.userName,
                style: const TextStyle(
                    color: Colors.black,
                    fontWeight: FontWeight.bold,
                    fontSize: 16),
                overflow: TextOverflow.ellipsis),
          ],
        ),
      ),
      actions: [
        ValueListenableBuilder<int>(
          valueListenable: ticketCountNotifier,
          builder: (context, count, _) => Stack(
            alignment: Alignment.center,
            children: [
              IconButton(
                icon: SizedBox(
                  height: 26,
                  width: 28,
                  child: Lottie.asset(
                      'assets/lottieflow-ecommerce-14-12-000000-easey.json',
                      alignment: Alignment.center,
                      animate: true),
                ),
                tooltip: 'My Tickets',
                onPressed: () => Navigator.push(context,
                    MaterialPageRoute(builder: (_) => const MyTicketsScreen())),
              ),
              if (count > 0)
                Positioned(
                  right: 6,
                  top: 6,
                  child: Container(
                    padding: EdgeInsets.all(count > 9 ? 3 : 4),
                    decoration: BoxDecoration(
                      color: Colors.red,
                      shape: BoxShape.circle,
                      border: Border.all(color: Colors.white, width: 1.5),
                    ),
                    constraints: const BoxConstraints(
                      minWidth: 18,
                      minHeight: 18,
                    ),
                    child: Text(count > 99 ? '99+' : count.toString(),
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 10,
                          fontWeight: FontWeight.bold,
                        ),
                        textAlign: TextAlign.center),
                  ),
                ),
            ],
          ),
        ),
        ValueListenableBuilder<bool>(
          valueListenable: hasNewNotificationsNotifier,
          builder: (context, hasNew, _) => Stack(
            alignment: Alignment.center,
            children: [
              IconButton(
                icon: Icon(Icons.notifications_outlined,
                    color: Colors.grey.shade700),
                tooltip: 'Notifications',
                onPressed: () {
                  hasNewNotificationsNotifier.value = false;
                  if (widget.onNotificationTap != null) {
                    widget.onNotificationTap!();
                  } else {
                    Navigator.push(
                        context,
                        MaterialPageRoute(
                            builder: (_) => const NotificationsScreen()));
                  }
                },
              ),
              if (hasNew)
                Positioned(
                  top: 10,
                  right: 10,
                  child: Container(
                    width: 9,
                    height: 9,
                    decoration: const BoxDecoration(
                        color: Colors.redAccent, shape: BoxShape.circle),
                  ),
                ),
            ],
          ),
        ),
        const SizedBox(width: 8),
      ],
    );
  }
}

Widget buildTextField({
  required TextEditingController controller,
  required String label,
  required String hint,
  required IconData icon,
  TextInputType keyboardType = TextInputType.text,
  String? Function(String?)? validator,
  bool obscureText = false,
  Widget? suffixIcon,
  bool enabled = true,
}) {
  return Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      Text(label,
          style: const TextStyle(
              fontSize: 15,
              fontWeight: FontWeight.w500,
              color: Colors.black87)),
      const SizedBox(height: 8),
      TextFormField(
        controller: controller,
        keyboardType: keyboardType,
        obscureText: obscureText,
        enabled: enabled,
        decoration: InputDecoration(
          prefixIcon: Icon(icon, color: Colors.grey.shade600, size: 22),
          suffixIcon: suffixIcon,
          hintText: hint,
          hintStyle: TextStyle(color: Colors.grey.shade500, fontSize: 14),
          filled: true,
          fillColor: enabled ? textFieldFillColor : Colors.grey.shade100,
          contentPadding:
              const EdgeInsets.symmetric(vertical: 16, horizontal: 12),
          border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: BorderSide(color: Colors.grey.shade300, width: 1.0)),
          enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: BorderSide(color: Colors.grey.shade300, width: 1.0)),
          focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: const BorderSide(color: primaryColor, width: 1.5)),
          errorBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: BorderSide(color: errorColor, width: 1.0)),
          focusedErrorBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: BorderSide(color: errorColor, width: 1.5)),
          disabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: BorderSide(color: Colors.grey.shade200, width: 1.0)),
        ),
        validator: validator,
        style: TextStyle(
            fontSize: 15,
            color: enabled ? Colors.black87 : Colors.grey.shade600),
      ),
    ],
  );
}

AppBar buildAuthAppBar(BuildContext context, String logoPath) {
  return AppBar(
    backgroundColor: Colors.white,
    elevation: 0,
    leading: Navigator.canPop(context)
        ? IconButton(
            icon: const Icon(Icons.arrow_back, color: Colors.black54),
            onPressed: () => Navigator.of(context).pop())
        : null,
    title: Image.asset(logoPath, height: 45), // Adjusted height slightly
    centerTitle: true,
  );
}

// ================================================================
// --- NEW "CRAZY" UI DESIGN FOR THE ERROR DIALOG ---
// ================================================================
void showErrorDialog(BuildContext context, String message) {
  if (!context.mounted) return;

  showGeneralDialog(
    context: context,
    barrierDismissible: true,
    barrierLabel: 'Close',
    transitionDuration: const Duration(milliseconds: 400),
    pageBuilder: (context, anim1, anim2) {
      return Center(
        child: Container(
          margin: const EdgeInsets.symmetric(horizontal: 24),
          padding: const EdgeInsets.fromLTRB(24, 16, 24, 24),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(20),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.1),
                blurRadius: 20,
                offset: const Offset(0, 5),
              ),
            ],
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              SizedBox(
                width: 120,
                height: 120,
                child: Lottie.asset('assets/Error.json'),
              ),
              const Text(
                'Something went wrong',
                style: TextStyle(
                  fontSize: 22,
                  fontWeight: FontWeight.bold,
                  color: Colors.black87,
                  decoration:
                      TextDecoration.none, // Required for showGeneralDialog
                ),
              ),
              const SizedBox(height: 12),
              Text(
                message,
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 16,
                  color: Colors.grey.shade600,
                  height: 1.4,
                  decoration:
                      TextDecoration.none, // Required for showGeneralDialog
                ),
              ),
              const SizedBox(height: 24),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: errorColor,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                    padding: const EdgeInsets.symmetric(vertical: 14),
                  ),
                  onPressed: () => Navigator.of(context).pop(),
                  child: const Text(
                    'TRY AGAIN',
                    style: TextStyle(
                      color: Colors.white,
                      fontWeight: FontWeight.bold,
                      fontSize: 16,
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      );
    },
    // The "Crazy" Animation
    transitionBuilder: (context, anim1, anim2, child) {
      return Transform.scale(
        scale: Curves.easeOutBack.transform(anim1.value),
        child: FadeTransition(
          opacity: anim1,
          child: child,
        ),
      );
    },
  );
}
