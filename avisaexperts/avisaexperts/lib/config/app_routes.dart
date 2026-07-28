import 'package:flutter/material.dart';
import '../navigation/main_navigation_screen.dart';
import '../pages/appointment_booking_page.dart';
import '../pages/notifications_screen.dart';
import '../pages/profile_screen.dart';
import '../pages/tourist.dart';
import '../pages/transit-visa.dart';
import '../pages/work-visa.dart';
import '../pages/my_tickets_screen.dart';
import '../pages/inbox_screen.dart';
import '../consultant/consultant_navigation_screen.dart';

class AppRoutes {
  static const String home = '/home';
  static const String appointment = '/appointment';
  static const String tourist = '/tourist';
  static const String workVisa = '/workvisa';
  static const String transit = '/transit';
  static const String notification = '/notification';
  static const String profile = '/profile';
  static const String ticket = '/ticket';
  static const String inbox = '/inbox';
  static const String main = '/main';
  static const String consultantMain = '/consultant';

  static Map<String, WidgetBuilder> getRoutes() {
    return {
      home: (context) => const MainNavigationScreen(),
      appointment: (context) => const AppointmentBookingScreen(),
      tourist: (context) => const TouristScreen(),
      workVisa: (context) => const WorkVisaScreen(),
      transit: (context) => const TransitVisaScreen(),
      notification: (context) => const NotificationsScreen(),
      profile: (context) => const ProfileScreen(),
      ticket: (context) => const MyTicketsScreen(),
      inbox: (context) => const InboxScreen(),
      consultantMain: (context) => const ConsultantNavigationScreen(),
      main: (context) {
        final args = ModalRoute.of(context)?.settings.arguments
            as Map<String, dynamic>?;
        final int targetTab = args?['tab'] ?? 2;
        debugPrint('🎯 Navigating to /main with tab: $targetTab');
        return MainNavigationScreen(initialTab: targetTab);
      },
    };
  }

  /// Navigate to route with optional arguments
  static Future<void> navigateTo(
    BuildContext context, 
    String routeName, {
    Map<String, dynamic>? arguments,
    bool replace = false,
  }) async {
    debugPrint('🧭 Navigating to: $routeName');
    
    if (replace) {
      Navigator.of(context).pushReplacementNamed(routeName, arguments: arguments);
    } else {
      Navigator.of(context).pushNamed(routeName, arguments: arguments);
    }
  }

  /// Navigate to main screen with specific tab
  static Future<void> navigateToMainTab(BuildContext context, int tabIndex) async {
    debugPrint('🎯 Navigating to main tab: $tabIndex');
    
    Navigator.of(context).pushNamedAndRemoveUntil(
      main,
      (route) => false,
      arguments: {'tab': tabIndex},
    );
  }

  /// Get route name from path
  static String? getRouteNameFromPath(String path) {
    final routes = getRoutes();
    for (final routeName in routes.keys) {
      if (routeName == path) {
        return routeName;
      }
    }
    return null;
  }
}
