# Flutter Rules
-keep class io.flutter.app.** { *; }
-keep class io.flutter.plugin.** { *; }
-keep class io.flutter.util.** { *; }
-keep class io.flutter.view.** { *; }
-keep class io.flutter.embedding.** { *; }
-keep class io.flutter.provider.** { *; }
-keep class io.flutter.plugins.** { *; }
-dontwarn io.flutter.embedding.**

# WebRTC Proguard Rules (CRITICAL FOR VOICE/VIDEO CALLS IN RELEASE BUILDS)
-keep class org.webrtc.** { *; }
-keep interface org.webrtc.** { *; }
-keepclassmembers class org.webrtc.** { *; }
-dontwarn org.webrtc.**

# Socket.io & Engine.io Rules (CRITICAL FOR REALTIME SIGNALING IN RELEASE BUILDS)
-keep class io.socket.** { *; }
-keep class io.socket.client.** { *; }
-keep class io.socket.engineio.client.** { *; }
-keep class io.socket.hasbinary.** { *; }
-keep class io.socket.parseqs.** { *; }
-keep class io.socket.thread.** { *; }
-keep class io.socket.emitter.** { *; }
-dontwarn io.socket.**

# OkHttp & Gson (used by WebSockets and API clients)
-keep class okhttp3.** { *; }
-keep interface okhttp3.** { *; }
-dontwarn okhttp3.**
-keep class com.google.gson.** { *; }

# Firebase Rules
-keep class com.google.firebase.** { *; }
-dontwarn com.google.firebase.**

# Firebase Messaging (required for FCM push notifications)
-keep class com.google.firebase.messaging.** { *; }
-keep class com.google.firebase.iid.** { *; }
-dontwarn com.google.firebase.messaging.**

# Flutter Local Notifications
-keep class com.dexterous.flutterlocalnotifications.** { *; }
-dontwarn com.dexterous.flutterlocalnotifications.**

# image_picker / file_picker (native file access)
-keep class com.dhruvtech.** { *; }
-dontwarn com.dhruvtech.**
-keep class io.flutter.plugin.platform.** { *; }

# pdfx (PDF viewer native libs)
-keep class com.simform.pdf_viewer.** { *; }
-dontwarn com.simform.pdf_viewer.**

# audioplayers
-keep class com.ryanheise.audioplayers.** { *; }
-dontwarn com.ryanheise.audioplayers.**

# flutter_webrtc native
-keep class com.cloudwebrtc.webrtc.** { *; }
-dontwarn com.cloudwebrtc.webrtc.**

# Generic keep for plugin registrants (prevents stripping Flutter plugin methods)
-keep class * implements io.flutter.embedding.engine.plugins.FlutterPlugin { *; }
-keep class * implements io.flutter.plugin.common.MethodChannel$MethodCallHandler { *; }

# Keep annotation-related classes for Gson/reflect (cached_network_image, dio)
-keepattributes *Annotation*
-keepattributes Signature
-keepattributes SourceFile,LineNumberTable
-keep class com.google.gson.** { *; }
-keep class com.google.gson.reflect.TypeToken { *; }
-keep class * extends com.google.gson.reflect.TypeToken

# OkHttp (already above) and Okio
-dontwarn okio.**
-keep class okio.** { *; }

# Retrofit/Dio reflection
-keepclassmembers class * {
    @com.google.gson.annotations.SerializedName <fields>;
}
