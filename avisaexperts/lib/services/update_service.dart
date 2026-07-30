import 'package:flutter/material.dart';
import 'package:in_app_update/in_app_update.dart';

class UpdateService {
  static AppUpdateInfo? _lastUpdateInfo;

  /// Check for app updates
  static Future<AppUpdateInfo?> checkForUpdate() async {
    try {
      debugPrint('📱 Checking for app updates...');
      
      final info = await InAppUpdate.checkForUpdate();
      _lastUpdateInfo = info;
      
      debugPrint('📱 Update check result: ${info.updateAvailability}');
      
      if (info.updateAvailability == UpdateAvailability.updateAvailable) {
        debugPrint('🔄 Update available, starting flexible update...');
        try {
          // Use flexible update instead of forced immediate update to respect user choice
          await InAppUpdate.startFlexibleUpdate();
          debugPrint('✅ Flexible update started');
        } catch (e) {
          debugPrint("❌ Flexible update failed: $e");
        }
      } else {
        debugPrint('✅ App is up to date');
      }
      
      return info;
    } catch (e) {
      debugPrint("❌ In-app update error: $e");
      return null;
    }
  }

  /// Check if update is available
  static bool get isUpdateAvailable {
    return _lastUpdateInfo?.updateAvailability == UpdateAvailability.updateAvailable;
  }

  /// Force check for updates (call from settings)
  static Future<bool> forceCheckUpdate() async {
    debugPrint('🔄 Force checking for updates...');
    final info = await checkForUpdate();
    return info?.updateAvailability == UpdateAvailability.updateAvailable;
  }

  /// Complete flexible update if one was started
  static Future<void> completeFlexibleUpdate() async {
    try {
      debugPrint('🔄 Completing flexible update...');
      await InAppUpdate.completeFlexibleUpdate();
      debugPrint('✅ Flexible update completed');
    } catch (e) {
      debugPrint("❌ Complete flexible update failed: $e");
    }
  }
}
