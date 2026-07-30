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
