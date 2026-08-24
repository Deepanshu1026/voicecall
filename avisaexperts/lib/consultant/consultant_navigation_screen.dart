import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'consultant_chat_list_screen.dart';
import 'consultant_profile_screen.dart';
import 'consultant_admin_settings_screen.dart';

const Color consultantPrimaryColor = Color(0xFF0D47A1);
const Color consultantNavBackground = Colors.white;
const Color consultantActiveIconColor = consultantPrimaryColor;
const Color consultantInactiveIconColor = Color(0xFF757575);
const double consultantNavIconSize = 24.0;
const double consultantBottomNavBarHeight = 65.0;

class ConsultantNavigationScreen extends StatefulWidget {
  final int initialTab;

  const ConsultantNavigationScreen({
    super.key,
    this.initialTab = 0,
  });

  static void navigateToTab(BuildContext context, int index) {
    final state = context.findAncestorStateOfType<_ConsultantNavigationScreenState>();
    state?.setTabIndex(index);
  }

  @override
  State<ConsultantNavigationScreen> createState() => _ConsultantNavigationScreenState();
}

class _ConsultantNavigationScreenState extends State<ConsultantNavigationScreen>
    with TickerProviderStateMixin {
  int _currentIndex = 0;
  bool _isAdmin = false;

  List<Widget> _screens = [];

  List<int> _tabHistory = [0];
  DateTime? _lastBackButtonTime;

  void setTabIndex(int index) {
    _navigateTo(index);
  }

  @override
  void initState() {
    super.initState();
    _checkAdminAndInit();
  }

  Future<void> _checkAdminAndInit() async {
    final prefs = await SharedPreferences.getInstance();
    final role = prefs.getString('consultantRole') ?? '';
    if (mounted) {
      setState(() {
        _isAdmin = role == 'admin';
        _screens = [
          const ConsultantChatListScreen(),
          const ConsultantProfileScreen(),
          if (_isAdmin) const ConsultantAdminSettingsScreen(),
        ];
        _currentIndex = widget.initialTab.clamp(0, _screens.length - 1);
        _tabHistory = [_currentIndex];
      });
    }
  }

  void _navigateTo(int index,
      {bool isForwardNavigation = true, bool fromPageView = false}) {
    if (index < 0 || index >= _screens.length) return;
    if (_currentIndex == index && !fromPageView && isForwardNavigation) return;

    if (mounted) {
      setState(() {
        if (isForwardNavigation) {
          if (_tabHistory.isEmpty || _tabHistory.last != index) {
            _tabHistory.add(index);
          }
          if (_tabHistory.length > 20) {
            _tabHistory = _tabHistory.sublist(_tabHistory.length - 20);
          }
        }
        _currentIndex = index;
      });
    }
  }

  Widget _buildAnimatedIcon(IconData icon, bool isActive, {Key? key}) {
    return TweenAnimationBuilder<double>(
      key: key,
      tween: Tween(begin: isActive ? 0.8 : 1.0, end: isActive ? 1.15 : 1.0),
      duration: const Duration(milliseconds: 250),
      curve: isActive ? Curves.elasticOut : Curves.easeInQuad,
      builder: (context, scale, child) {
        return Transform.scale(
          scale: scale,
          child: Icon(
            icon,
            size: consultantNavIconSize,
            color: isActive ? consultantActiveIconColor : consultantInactiveIconColor,
          ),
        );
      },
    );
  }

  Widget _buildNavItem({
    required int index,
    required IconData icon,
    required IconData activeIcon,
    required String label,
  }) {
    final isActive = _currentIndex == index;
    return Expanded(
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          splashColor: const Color(0xFFE3F2FD).withOpacity(0.5),
          highlightColor: Colors.transparent,
          onTap: () => _navigateTo(index),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              _buildAnimatedIcon(
                isActive ? activeIcon : icon, isActive,
                key: ValueKey<IconData>(isActive ? activeIcon : icon),
              ),
              const SizedBox(height: 5),
              AnimatedDefaultTextStyle(
                duration: const Duration(milliseconds: 200),
                style: TextStyle(
                  fontSize: isActive ? 12.0 : 11.5,
                  fontWeight: isActive ? FontWeight.w700 : FontWeight.w500,
                  color: isActive ? consultantPrimaryColor : consultantInactiveIconColor,
                ),
                child: Text(label),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Future<bool> _onWillPop() async {
    if (_currentIndex != 0 && _tabHistory.length > 1) {
      _tabHistory.removeLast();
      final previousTab = _tabHistory.last;
      _navigateTo(previousTab, isForwardNavigation: false);
      return false;
    }
    final now = DateTime.now();
    if (_lastBackButtonTime == null ||
        now.difference(_lastBackButtonTime!) > const Duration(seconds: 2)) {
      _lastBackButtonTime = now;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Press back again to exit')),
      );
      return false;
    }
    return true;
  }

  @override
  Widget build(BuildContext context) {
    final double bottomPadding = MediaQuery.of(context).padding.bottom;

    if (_screens.isEmpty) {
      return const Scaffold(
        body: Center(child: CircularProgressIndicator()),
      );
    }

    return WillPopScope(
      onWillPop: _onWillPop,
      child: Scaffold(
        body: IndexedStack(
          index: _currentIndex,
          children: _screens,
        ),
          bottomNavigationBar: Container(
          height: consultantBottomNavBarHeight + bottomPadding,
          decoration: BoxDecoration(
            color: consultantNavBackground,
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.08),
                blurRadius: 15,
                spreadRadius: 0,
                offset: const Offset(0, -3),
              )
            ],
          ),
          child: Padding(
            padding: EdgeInsets.only(bottom: bottomPadding),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                _buildNavItem(
                  index: 0,
                  icon: Icons.chat_bubble_outline_rounded,
                  activeIcon: Icons.chat_bubble_rounded,
                  label: 'Chats',
                ),
                _buildNavItem(
                  index: 1,
                  icon: Icons.person_outline_rounded,
                  activeIcon: Icons.person_rounded,
                  label: 'Profile',
                ),
                if (_isAdmin)
                  _buildNavItem(
                    index: 2,
                    icon: Icons.settings_outlined,
                    activeIcon: Icons.settings,
                    label: 'Settings',
                  ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
