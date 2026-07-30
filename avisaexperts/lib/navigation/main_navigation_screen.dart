// lib/main_navigation_screen.dart
import 'package:flutter/material.dart';
import '../models/app_notifiers.dart'; // ✅ Import your app notifiers

// Import the screens you want to navigate between
import '../pages/home_screen.dart';
import '../pages/appointment_booking_page.dart';
import '../pages/inbox_screen.dart';
import '../pages/profile_screen.dart';

// --- Color & Size Constants (same as before) ---
const Color primaryAppColor = Color(0xFF0D47A1);
const Color bottomNavBackground = Colors.white;
const Color activeNavIconColor = primaryAppColor;
const Color inactiveNavIconColor = Color(0xFF757575);
const Color activeNavTextColor = primaryAppColor;
const Color inactiveNavTextColor = Color(0xFF757575);
const Color activeIndicatorColor = primaryAppColor;
const Color navSplashColor = Color(0xFFE3F2FD);

const double navIconSize = 24.0;
const double selectedNavFontSize = 12.0;
const double unselectedNavFontSize = 11.5;
const double bottomNavBarHeight = 65.0;
const double navItemCornerRadius = 24.0;
const double navShadowBlurRadius = 15.0;
const double navShadowSpreadRadius = 0.0;
const Offset navShadowOffset = Offset(0, -3);

class MainNavigationScreen extends StatefulWidget {
  final int initialTab;

  const MainNavigationScreen({
    super.key,
    this.initialTab = 0,
  });

  static void navigateToTab(BuildContext context, int index) {
    final state = context.findAncestorStateOfType<_MainNavigationScreenState>();
    state?.setTabIndex(index);
  }

  @override
  State<MainNavigationScreen> createState() => _MainNavigationScreenState();
}

class _MainNavigationScreenState extends State<MainNavigationScreen>
    with TickerProviderStateMixin {
  int _currentIndex = 0;

  void setTabIndex(int index) {
    _navigateTo(index);
  }

  final List<Widget> _screens = [
    const HomeScreen(),
    const AppointmentBookingScreen(),
    const InboxScreen(),
    const ProfileScreen(),
  ];

  List<int> _tabHistory = [0];
  DateTime? _lastBackButtonTime;
  final Set<int> _visitedInCurrentBackSequence = {};

  late AnimationController _indicatorAnimationController;
  late Animation<double> _indicatorPositionAnimation;

  final List<GlobalKey> _navItemKeys = [
    GlobalKey(),
    GlobalKey(),
    GlobalKey(),
    GlobalKey()
  ];

  late PageController _pageController;

  @override
  void initState() {
    super.initState();

    _currentIndex = widget.initialTab.clamp(0, _screens.length - 1);
    _tabHistory = [_currentIndex];

    _pageController = PageController(initialPage: _currentIndex);

    _indicatorAnimationController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 300),
    );
    _indicatorPositionAnimation = Tween<double>(begin: 0.0, end: 0.0).animate(
      CurvedAnimation(
          parent: _indicatorAnimationController, curve: Curves.easeInOutCubic),
    );

    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (mounted) {
        _updateIndicatorPosition(animate: false);
      }
    });

    // ✅ Start unread message polling using the service
    UnreadMessageService.startPolling();
  }

  @override
  void dispose() {
    _indicatorAnimationController.dispose();
    _pageController.dispose();
    // ✅ Stop polling when screen is disposed
    UnreadMessageService.stopPolling();
    super.dispose();
  }

  // ... (keep all your existing navigation methods unchanged) ...

  void _navigateTo(int index,
      {bool isForwardNavigation = true, bool fromPageView = false}) {
    if (index < 0 || index >= _screens.length) return;
    if (_currentIndex == index && !fromPageView && isForwardNavigation) return;

    if (mounted) {
      final previousIndex = _currentIndex;
      setState(() {
        if (isForwardNavigation) {
          _visitedInCurrentBackSequence.clear();
          if (_tabHistory.isEmpty || _tabHistory.last != index) {
            _tabHistory.add(index);
          }
          if (_tabHistory.length > 20) {
            _tabHistory = _tabHistory.sublist(_tabHistory.length - 20);
          }
        }
        _currentIndex = index;
      });

      if (!fromPageView &&
          _pageController.hasClients &&
          _pageController.page?.round() != index) {
        _pageController.animateToPage(
          index,
          duration: const Duration(milliseconds: 350),
          curve: Curves.easeInOutCubic,
        );
      }
      _updateIndicatorPosition(animate: previousIndex != index);

      // ✅ Refresh unread count when navigating to/from inbox
      if (index == 2 || previousIndex == 2) {
        UnreadMessageService.refreshCount();
      }
    }
  }

  // ... (keep all other existing methods) ...

  // Add the missing method to update the indicator position
  void _updateIndicatorPosition({bool animate = true}) {
    // This is a placeholder implementation.
    // You should update this logic to match your indicator animation needs.
    final double targetPosition = _currentIndex.toDouble();
    if (animate) {
      _indicatorPositionAnimation = Tween<double>(
        begin: _indicatorPositionAnimation.value,
        end: targetPosition,
      ).animate(
        CurvedAnimation(
          parent: _indicatorAnimationController,
          curve: Curves.easeInOutCubic,
        ),
      );
      _indicatorAnimationController.forward(from: 0.0);
    } else {
      _indicatorPositionAnimation = AlwaysStoppedAnimation(targetPosition);
    }
    setState(() {});
  }

  // ✅ Build icon with badge using ValueListenableBuilder
  Widget _buildAnimatedIconWithBadge(IconData icon, bool isActive, {Key? key}) {
    return TweenAnimationBuilder<double>(
      key: key,
      tween: Tween(begin: isActive ? 0.8 : 1.0, end: isActive ? 1.15 : 1.0),
      duration: const Duration(milliseconds: 250),
      curve: isActive ? Curves.elasticOut : Curves.easeInQuad,
      builder: (context, scale, child) {
        return Transform.scale(
          scale: scale,
          child: ValueListenableBuilder<int>(
            valueListenable:
                unreadMessageCountNotifier, // ✅ Listen to global notifier
            builder: (context, unreadCount, child) {
              return Stack(
                clipBehavior: Clip.none,
                children: [
                  Icon(
                    icon,
                    size: navIconSize,
                    color: isActive ? activeNavIconColor : inactiveNavIconColor,
                  ),
                  // ✅ Badge for unread count
                  if (unreadCount > 0)
                    Positioned(
                      right: -8,
                      top: -8,
                      child: Container(
                        padding: const EdgeInsets.all(4),
                        decoration: BoxDecoration(
                          color: Colors.red,
                          borderRadius: BorderRadius.circular(200),
                          border: Border.all(color: Colors.white, width: 0),
                        ),
                        constraints: const BoxConstraints(
                          minWidth: 18,
                          minHeight: 18,
                        ),
                        child: Text(
                          unreadCount > 9 ? '9+' : unreadCount.toString(),
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 10,
                            fontWeight: FontWeight.bold,
                          ),
                          textAlign: TextAlign.center,
                        ),
                      ),
                    ),
                ],
              );
            },
          ),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    // final screenWidth = MediaQuery.of(context).size.width;
    final double bottomPadding = MediaQuery.of(context).padding.bottom;

    return WillPopScope(
      onWillPop: _onWillPop,
      child: Scaffold(
        body: PageView(
          controller: _pageController,
          children: _screens.map((screen) {
            return screen;
          }).toList(),
          onPageChanged: (index) {
            _navigateTo(index,
                isForwardNavigation:
                    _tabHistory.isNotEmpty ? _tabHistory.last < index : true,
                fromPageView: true);
          },
        ),
        bottomNavigationBar: Container(
          height: bottomNavBarHeight + bottomPadding,
          decoration: BoxDecoration(
            color: bottomNavBackground,
            boxShadow: [
              BoxShadow(
                  color: Colors.black.withOpacity(0.08),
                  blurRadius: navShadowBlurRadius,
                  spreadRadius: navShadowSpreadRadius,
                  offset: navShadowOffset)
            ],
          ),
          child: Stack(
            children: [
              // ... (keep existing indicator animation) ...
              Padding(
                padding: EdgeInsets.only(bottom: bottomPadding),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceAround,
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    _buildNavItem(
                        index: 0,
                        icon: Icons.home_outlined,
                        activeIcon: Icons.home_filled,
                        label: 'Home',
                        itemKey: _navItemKeys[0]),
                    _buildNavItem(
                        index: 1,
                        icon: Icons.add_circle_outline_rounded,
                        activeIcon: Icons.add_circle_rounded,
                        label: 'Appointment',
                        itemKey: _navItemKeys[1]),
                    // ✅ UPDATED: Inbox with global notifier badge
                    _buildNavItem(
                        index: 2,
                        icon: Icons.mail_outline_rounded,
                        activeIcon: Icons.mail_rounded,
                        label: 'Inbox',
                        itemKey: _navItemKeys[2],
                        hasNotificationBadge: true), // ✅ Enable badge for inbox
                    _buildNavItem(
                        index: 3,
                        icon: Icons.person_outline_rounded,
                        activeIcon: Icons.person_rounded,
                        label: 'Profile',
                        itemKey: _navItemKeys[3]),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  // ✅ UPDATED: Build nav item with optional notification badge
  Widget _buildNavItem({
    required int index,
    required IconData icon,
    required IconData activeIcon,
    required String label,
    required GlobalKey itemKey,
    bool hasNotificationBadge = false, // ✅ Add badge flag
  }) {
    final isActive = _currentIndex == index;
    return Expanded(
      key: itemKey,
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          splashColor: navSplashColor.withOpacity(0.5),
          highlightColor: Colors.transparent,
          onTap: () => _onTabTapped(index),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              // ✅ Use badge icon for inbox, regular icon for others
              hasNotificationBadge
                  ? _buildAnimatedIconWithBadge(
                      isActive ? activeIcon : icon, isActive,
                      key: ValueKey<IconData>(isActive ? activeIcon : icon))
                  : _buildAnimatedIcon(isActive ? activeIcon : icon, isActive,
                      key: ValueKey<IconData>(isActive ? activeIcon : icon)),
              const SizedBox(height: 5),
              AnimatedDefaultTextStyle(
                duration: const Duration(milliseconds: 200),
                style: TextStyle(
                    fontSize:
                        isActive ? selectedNavFontSize : unselectedNavFontSize,
                    fontWeight: isActive ? FontWeight.w700 : FontWeight.w500,
                    color:
                        isActive ? activeNavTextColor : inactiveNavTextColor),
                child: Text(label),
              ),
            ],
          ),
        ),
      ),
    );
  }

  // ... (keep all other existing methods unchanged) ...

  // Add the missing _buildAnimatedIcon method
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
            size: navIconSize,
            color: isActive ? activeNavIconColor : inactiveNavIconColor,
          ),
        );
      },
    );
  }

  // Add the missing _onTabTapped method
  void _onTabTapped(int index) {
    _navigateTo(index);
  }

  // Add the missing _onWillPop method
  Future<bool> _onWillPop() async {
    // If not on the first tab, go back to previous tab
    if (_currentIndex != 0 && _tabHistory.length > 1) {
      _tabHistory.removeLast();
      final previousTab = _tabHistory.last;
      _navigateTo(previousTab, isForwardNavigation: false);
      return false;
    }
    // Optionally: double-tap to exit
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
}
