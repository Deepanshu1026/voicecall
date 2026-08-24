import 'package:flutter/foundation.dart';

class AppConfig {
  // ==== NEW REACT / NODE BACKEND ====
  // Change this single value when moving from local development to production.
  // Examples:
  //   Android emulator (local):  http://10.0.2.2:5002
  //   iOS simulator (local):     http://localhost:5002
  //   Local physical device:     http://<your-computer-ip>:5002
  // Production:                https://voicecall-6ylg.onrender.com
  static const String _baseDomain = 'https://voicecall-6ylg.onrender.com';

  // Set to true to use the local dev backend above; false uses the production _baseDomain.
  static const bool _useLocalDev = false;

  static String get apiBaseUrl {
    if (_useLocalDev) {
      if (kIsWeb) return 'http://localhost:5002';
      if (defaultTargetPlatform == TargetPlatform.android) return 'http://10.0.2.2:5002';
      if (defaultTargetPlatform == TargetPlatform.iOS) return 'http://localhost:5002';
      return 'http://localhost:5002';
    }
    return _baseDomain;
  }

  // API endpoints provided by the unified Node.js backend
  static String get flutterApiBase => '$apiBaseUrl/api/app';

  // Legacy PHP endpoints replaced by the new backend
  static String get login => '$flutterApiBase/login';                        // was applogin1.php
  static String get agentLogin => '$flutterApiBase/agent-login';             // was appagentlogin.php
  static String get register => '$flutterApiBase/register';                  // was appsignup1.php
  static String get forgotPassword => '$flutterApiBase/forgot-password';     // was forgot_password.php
  static String get verifyOtp => '$flutterApiBase/verify-otp';               // was verify_otp.php
  static String get resetPassword => '$flutterApiBase/reset-password';       // was reset_password.php
  static String get editProfile => '$flutterApiBase/edit-profile';           // was appEditProfile.php
  static String get consultants => '$flutterApiBase/consultants';            // was getAppAllConsultant.php / consultant.php
  static String get inbox => '$flutterApiBase/inbox';                        // was allMessages.php
  static String get chatMessages => '$flutterApiBase/chat/messages';        // was getMessages.php
  static String get chatSend => '$flutterApiBase/chat/send';                  // was sendMessage.php
  static String get chatConversation => '$flutterApiBase/chat/conversation';  // React chat parity
  static String get chatGreet => '$flutterApiBase/chat/greet';                  // React chat parity
  static String get chatPay => '$flutterApiBase/chat/pay';                    // React chat parity
  static String get turnCredentials => '$flutterApiBase/turn-credentials';    // WebRTC TURN servers
  static String get callInitiate => '$flutterApiBase/call/initiate';           // REST call initiation
  static String get wallet => '$flutterApiBase/wallet';                       // React wallet parity
  static String get walletAddMoney => '$flutterApiBase/wallet/add-money';     // React wallet parity
  static String get tickets => '$flutterApiBase/tickets';                    // was getMyTickets.php
  static String get appointments => '$flutterApiBase/appointments';          // was book_appointment.php
  static String get timeSlots => '$flutterApiBase/time-slots';                // was time_slots.php
  static String get cancelledDates => '$flutterApiBase/cancelled-dates';    // was getDates.php
  static String get meetingsStatus => '$flutterApiBase/meetings/status';    // was appApis/meetings_api.php
  static String get pricing => '$flutterApiBase/pricing';                    // was Dev_Acess/price_api.php
  static String get offerImage => '$flutterApiBase/offer-image';             // was Dev_Acess/offer_image.php
  static String get banners => '$flutterApiBase/banners';                    // was digital_dashboard/get_banners.php
  static String get reviews => '$flutterApiBase/reviews';                    // was review_API.php
  static String get notifications => '$flutterApiBase/notifications';        // was getNotification.php
  static String get usersAllData => '$flutterApiBase/users-all-data';        // was getusersAllData.php
  static String get guest => '$flutterApiBase/guest';                        // was insert_guest.php
  static String get guestUpgrade => '$flutterApiBase/guest/upgrade';         // was update_guest_to_user.php
  static String get fcmToken => '$flutterApiBase/fcm-token';                  // was save_tokencheck.php
  static String get screenshot => '$flutterApiBase/screenshot';              // was screenshot_update.php
  static String get updateCountryCode => '$flutterApiBase/update-country-code'; // was appupdatecountrycode.php
  static String get instaApiKey => '$flutterApiBase/insta-api-key';          // was instaapi.php
  static String get adminSettings => '$apiBaseUrl/api/settings';                 // admin chat settings

  // Static assets host. The new backend also serves the React public images.
  // Point this to the root of the backend domain so old `img/...` paths resolve.
  static const String staticAssetBase = 'https://voicecall-6ylg.onrender.com';
}
