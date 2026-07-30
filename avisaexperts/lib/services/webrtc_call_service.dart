import 'dart:async';

import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_webrtc/flutter_webrtc.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../config/app_config.dart';
import 'chat_socket_service.dart';

enum CallState { idle, calling, ringing, connecting, connected, ended, error }

/// WebRTC voice/video call service matching the React website implementation.
/// Uses the same socket.io signaling and backend endpoints.
class WebRTCCallService extends ChangeNotifier {
  static final WebRTCCallService _instance = WebRTCCallService._internal();
  factory WebRTCCallService() => _instance;
  WebRTCCallService._internal() {
    ensureTurnServersInitialized();
  }

  // Core WebRTC
  RTCPeerConnection? _peerConnection;
  MediaStream? _localStream;
  MediaStream? _remoteStream;

  // State
  CallState _callState = CallState.idle;
  String? _callId;
  String? _roomId;
  bool _isInitiator = false;
  bool _isMuted = false;
  bool _isSpeakerOn = true;
  int _callDuration = 0;
  String? _callError;
  Map<String, dynamic>? _callData;
  Map<String, dynamic>? _otherUser;

  // Timers
  Timer? _durationTimer;
  Timer? _callTimeoutTimer;
  Timer? _keepAliveTimer;
  Timer? _statsTimer;

  // ICE candidate queue
  final List<RTCIceCandidate> _iceCandidateQueue = [];
  final List<Map<String, dynamic>> _pendingSignals = [];

  // Billing / quality
  int _ratePerMinute = 0;
  int _amountCharged = 0;
  String _connectionQuality = 'Good';

  // Diagnostic log of the last call events (useful in release builds where
  // debugPrint is stripped). Only keeps the most recent entries.
  final List<String> _callEventLog = [];

  // Subscriptions
  final List<void Function()> _socketUnsubscribers = [];
  bool _listenersBound = false;

  // Getters
  CallState get callState => _callState;
  MediaStream? get localStream => _localStream;
  MediaStream? get remoteStream => _remoteStream;
  bool get isMuted => _isMuted;
  bool get isSpeakerOn => _isSpeakerOn;
  int get callDuration => _callDuration;
  String? get callError => _callError;
  Map<String, dynamic>? get callData => _callData;
  Map<String, dynamic>? get otherUser => _otherUser;
  bool get hasActiveCall => _callState != CallState.idle;
  bool get isInitiator => _isInitiator;
  String? get callId => _callId;
  String? get roomId => _roomId;
  int get ratePerMinute => _ratePerMinute;
  int get amountCharged => _amountCharged;
  String get connectionQuality => _connectionQuality;
  List<String> get callEventLog => List.unmodifiable(_callEventLog);

  // Constants
  static const List<Map<String, dynamic>> _stunServers = [
    {'urls': 'stun:stun.l.google.com:19302'},
    {'urls': 'stun:stun1.l.google.com:19302'},
  ];

  // Fallback public TURN relay used only if the backend TURN credentials endpoint fails.
  static const List<Map<String, dynamic>> _fallbackTurnServers = [
    {
      'urls': [
        'turn:openrelay.metered.ca:80',
        'turn:openrelay.metered.ca:443',
        'turn:openrelay.metered.ca:443?transport=tcp',
      ],
      'username': 'openrelayproject',
      'credential': 'openrelayproject',
    },
  ];

  static const int _callConnectTimeoutMs = 30000;
  static const int _callRingingTimeoutMs = 30000;

  // TURN servers fetched from the backend (refreshed periodically).
  List<Map<String, dynamic>> _fetchedTurnServers = [];
  Timer? _turnRefreshTimer;
  bool _turnFetchFailed = false;

  String _currentUserId() {
    // Synchronous fallback. Prefer _currentUserIdAsync() for reliable mobile reads.
    try {
      final socketUserId = ChatSocketService().socket?.io.options?['extraHeaders']?['userId']?.toString();
      if (socketUserId != null && socketUserId.isNotEmpty) return socketUserId;
    } catch (_) {}
    return '';
  }

  Future<String> _currentUserIdAsync() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final dynamic userId = prefs.get('userId');
      if (userId is String) return userId;
      if (userId is int) return userId.toString();
      return '';
    } catch (_) {
      return '';
    }
  }

  bool _isSocketConnected() {
    return ChatSocketService().isConnected;
  }

  bool _emit(String event, dynamic data) {
    final isConnected = ChatSocketService().isConnected;
    final socket = ChatSocketService().socket;
    final socketState = socket?.connected ?? false;

    _logCallEvent('[EMIT] $event, isConnected=$isConnected, socketConnected=$socketState');

    if (!isConnected) {
      debugPrint('[WebRTC] Socket not connected, cannot emit $event');
      _logCallEvent('ERROR: Socket not connected, cannot emit $event');
      return false;
    }

    ChatSocketService().emitEvent(event, data);
    _logCallEvent('[EMIT] $event sent to server');
    return true;
  }

  void _logCallEvent(String message) {
    final timestamp = DateTime.now().toIso8601String();
    _callEventLog.add('[$timestamp] $message');
    if (_callEventLog.length > 50) {
      _callEventLog.removeAt(0);
    }
    debugPrint('[WebRTC] $message');
  }

  /// Fetch TURN server credentials from the backend on startup and refresh them
  /// every 4 minutes so they don't expire mid-call.
  Future<void> initializeTurnServers() async {
    await _fetchTurnServers();
    _turnRefreshTimer?.cancel();
    _turnRefreshTimer = Timer.periodic(const Duration(minutes: 4), (_) async {
      await _fetchTurnServers();
    });
  }

  Future<void> _fetchTurnServers() async {
    try {
      final dio = Dio();
      final response = await dio
          .get(AppConfig.turnCredentials)
          .timeout(const Duration(seconds: 15));

      if (response.statusCode == 200 && response.data is Map<String, dynamic>) {
        final data = response.data as Map<String, dynamic>;
        final servers = data['servers'];
        if (servers is List && servers.isNotEmpty) {
          _fetchedTurnServers = servers.cast<Map<String, dynamic>>();
          _turnFetchFailed = false;
          debugPrint('[WebRTC] TURN credentials loaded (${_fetchedTurnServers.length} servers)');
          return;
        }
      }
      throw Exception('Invalid TURN credentials response');
    } catch (e) {
      debugPrint('[WebRTC] Failed to load TURN credentials: $e');
      _turnFetchFailed = true;
    }
  }

  void bindGlobalListeners() {
    if (_listenersBound) return;
    _listenersBound = true;

    _socketUnsubscribers.add(
      ChatSocketService().onEvent('call:incoming', (data) {
        _logCallEvent('Incoming call: $data');
        _onIncomingCall(data);
      }),
    );

    _socketUnsubscribers.add(
      ChatSocketService().onEvent('call:ringing', (data) {
        _logCallEvent('Ringing: $data');
        _callState = CallState.ringing;
        _callData = _extractMap(data, 'call');
        _callId = _callData?['_id']?.toString() ?? _callId;
        _roomId = data is Map<String, dynamic> ? data['roomId']?.toString() : null;
        _ratePerMinute = (_callData?['ratePerMinute'] ?? 0).toInt();
        _amountCharged = (_callData?['amountCharged'] ?? 0).toInt();
        // Call ID is now known; send any ICE candidates gathered before this event.
        _flushPendingSignals();
        notifyListeners();
      }),
    );

    _socketUnsubscribers.add(
      ChatSocketService().onEvent('call:accepted', (data) {
        _logCallEvent('Call accepted: $data');
        _callState = CallState.connecting;
        _callData = _extractMap(data, 'call');
        _callId = _callData?['_id']?.toString() ?? _callId;
        _roomId = data is Map<String, dynamic> ? data['roomId']?.toString() : _roomId;
        _ratePerMinute = (_callData?['ratePerMinute'] ?? 0).toInt();
        _amountCharged = (_callData?['amountCharged'] ?? 0).toInt();
        // Both sides are in the room; send any queued ICE candidates.
        _flushPendingSignals();
        notifyListeners();
      }),
    );

    _socketUnsubscribers.add(
      ChatSocketService().onEvent('call:rejected', (data) {
        _logCallEvent('Call rejected: $data');
        _callError = 'Call rejected';
        _callState = CallState.ended;
        _reset();
      }),
    );

    _socketUnsubscribers.add(
      ChatSocketService().onEvent('call:ended', (data) {
        _logCallEvent('Call ended: $data');
        _callState = CallState.ended;
        _reset();
      }),
    );

    _socketUnsubscribers.add(
      ChatSocketService().onEvent('call:missed', (data) {
        _logCallEvent('Call missed: $data');
        _callState = CallState.ended;
        _callError = 'Missed call';
        _reset();
      }),
    );

    _socketUnsubscribers.add(
      ChatSocketService().onEvent('call:error', (data) {
        _logCallEvent('Call error: $data');
        _callError = data is Map<String, dynamic> ? data['message']?.toString() : 'Call error';
        _callState = CallState.error;
        _reset();
      }),
    );

    _socketUnsubscribers.add(
      ChatSocketService().onEvent('call:signal', (data) {
        _logCallEvent('Signal received: ${data is Map<String, dynamic> ? data.keys : data}');
        _handleSignal(data);
      }),
    );

    _socketUnsubscribers.add(
      ChatSocketService().onEvent('call:low-balance', (data) {
        _logCallEvent('Low balance: $data');
        _callError = data is Map<String, dynamic> ? data['message']?.toString() : 'Low balance';
        notifyListeners();
        endCall();
      }),
    );

    _socketUnsubscribers.add(
      ChatSocketService().onEvent('call:charged', (data) {
        _logCallEvent('Call charged: $data');
        if (data is Map<String, dynamic>) {
          _amountCharged = (data['amountCharged'] ?? 0).toInt();
          _ratePerMinute = (data['ratePerMinute'] ?? _ratePerMinute).toInt();
          if (_callData != null) {
            _callData!['amountCharged'] = _amountCharged;
            _callData!['ratePerMinute'] = _ratePerMinute;
          }
          notifyListeners();
        }
      }),
    );
  }

  void unbindGlobalListeners() {
    for (final unsub in _socketUnsubscribers) {
      unsub();
    }
    _socketUnsubscribers.clear();
    _listenersBound = false;
  }

  Map<String, dynamic>? _extractMap(dynamic data, String key) {
    if (data is! Map<String, dynamic>) return null;
    final value = data[key];
    if (value is Map<String, dynamic>) return value;
    return null;
  }

  void _onIncomingCall(dynamic data) {
    if (data is! Map<String, dynamic>) return;
    if (_callState != CallState.idle) {
      final incomingCallId = data['call']?['_id']?.toString();
      if (incomingCallId != null) {
        _emit('call:reject', {'callId': incomingCallId});
      }
      return;
    }

    _callData = _extractMap(data, 'call');
    _otherUser = _extractMap(data, 'caller');
    _callId = _callData?['_id']?.toString();
    _roomId = data['roomId']?.toString();
    _isInitiator = false;
    _callState = CallState.ringing;
    _callError = null;
    notifyListeners();
  }

  Future<bool> _requestPermissions({bool video = false}) async {
    final micStatus = await Permission.microphone.request();
    if (micStatus != PermissionStatus.granted) {
      _callError = 'Microphone permission denied';
      notifyListeners();
      return false;
    }
    if (video) {
      final cameraStatus = await Permission.camera.request();
      if (cameraStatus != PermissionStatus.granted) {
        _callError = 'Camera permission denied';
        notifyListeners();
        return false;
      }
    }
    return true;
  }

  Future<MediaStream?> _getMediaStream({bool video = false}) async {
    if (_localStream != null) {
      final audioTracks = _localStream!.getAudioTracks();
      if (audioTracks.any((t) => t.enabled)) {
        return _localStream;
      }
    }

    try {
      final mediaConstraints = <String, dynamic>{
        'audio': {
          'echoCancellation': true,
          'noiseSuppression': true,
          'autoGainControl': true,
          'sampleRate': 48000,
          'channelCount': 1,
        },
        'video': video,
      };
      final stream = await navigator.mediaDevices.getUserMedia(mediaConstraints);
      _localStream = stream;
      notifyListeners();
      return stream;
    } catch (e) {
      debugPrint('[WebRTC] Failed to get media stream: $e');
      _callError = 'Could not access microphone: $e';
      notifyListeners();
      return null;
    }
  }

  void _stopMediaStream() {
    if (_localStream != null) {
      for (final track in _localStream!.getTracks()) {
        track.stop();
      }
      _localStream = null;
    }
    _remoteStream = null;
    notifyListeners();
  }

  List<Map<String, dynamic>> _getIceServers() {
    final servers = List<Map<String, dynamic>>.from(_stunServers);
    if (_fetchedTurnServers.isNotEmpty) {
      servers.addAll(_fetchedTurnServers);
    } else {
      // Fallback to public relay only if the backend credentials aren't available.
      servers.addAll(_fallbackTurnServers);
    }
    return servers;
  }

  /// Call this when the app starts so TURN servers are ready before a call.
  void ensureTurnServersInitialized() {
    if (_turnRefreshTimer == null) {
      initializeTurnServers();
    }
  }

  Future<RTCPeerConnection> _createPeerConnection() async {
    if (_peerConnection != null) {
      try {
        await _peerConnection!.close();
      } catch (e) {
        debugPrint('[WebRTC] Error closing existing peer: $e');
      }
      _peerConnection = null;
    }

    debugPrint('[WebRTC] Creating RTCPeerConnection');
    final pc = await createPeerConnection(
      {
        'iceServers': _getIceServers(),
        'iceCandidatePoolSize': 10,
        'bundlePolicy': 'max-bundle',
        'rtcpMuxPolicy': 'require',
      },
      {},
    );

    pc.onIceCandidate = (event) {
      if (event.candidate != null && event.candidate!.isNotEmpty) {
        final currentCallId = _callId;
        if (currentCallId != null) {
          _emit('call:signal', {
            'callId': currentCallId,
            'signal': {'candidate': event.toMap()},
          });
        } else {
          _pendingSignals.add({'candidate': event.toMap()});
        }
      }
    };

    pc.onTrack = (event) {
      debugPrint('[WebRTC] onTrack: ${event.track.kind}');
      final stream = event.streams.isNotEmpty ? event.streams.first : null;
      if (stream != null) {
        _remoteStream = stream;
        notifyListeners();
      }
      _maybeSetConnected();
    };

    pc.onAddTrack = (stream, track) {
      debugPrint('[WebRTC] onAddTrack: ${track.kind}');
      _remoteStream = stream;
      notifyListeners();
      _maybeSetConnected();
    };

    pc.onIceConnectionState = (state) {
      debugPrint('[WebRTC] ICE connection state: $state');
      if (state == RTCIceConnectionState.RTCIceConnectionStateConnected ||
          state == RTCIceConnectionState.RTCIceConnectionStateCompleted) {
        _onConnected();
      } else if (state == RTCIceConnectionState.RTCIceConnectionStateFailed) {
        _scheduleEndIfStillFailed();
      }
    };

    pc.onConnectionState = (state) {
      debugPrint('[WebRTC] Connection state: $state');
      if (state == RTCPeerConnectionState.RTCPeerConnectionStateConnected) {
        _onConnected();
      } else if (state == RTCPeerConnectionState.RTCPeerConnectionStateDisconnected) {
        // Disconnected can be transient; wait a bit before restarting ICE.
        Future.delayed(const Duration(seconds: 3), () {
          if (_peerConnection != null) {
            _peerConnection?.getConnectionState().then((current) {
              if (current == RTCPeerConnectionState.RTCPeerConnectionStateDisconnected ||
                  current == RTCPeerConnectionState.RTCPeerConnectionStateFailed) {
                try {
                  _peerConnection?.restartIce();
                } catch (e) {
                  debugPrint('[WebRTC] ICE restart failed: $e');
                }
              }
            });
          }
        });
      } else if (state == RTCPeerConnectionState.RTCPeerConnectionStateFailed) {
        _scheduleEndIfStillFailed();
      } else if (state == RTCPeerConnectionState.RTCPeerConnectionStateClosed) {
        _callState = CallState.ended;
        _reset();
      }
    };

    _peerConnection = pc;
    notifyListeners();
    return pc;
  }

  Future<void> _addLocalTracks(MediaStream? stream) async {
    if (stream == null || _peerConnection == null) return;
    for (final track in stream.getTracks()) {
      await _peerConnection!.addTrack(track, stream);
    }
  }

  void _startDurationTimer() {
    _durationTimer?.cancel();
    _callDuration = 0;
    _durationTimer = Timer.periodic(const Duration(seconds: 1), (_) {
      _callDuration++;
      notifyListeners();
    });
  }

  void _stopDurationTimer() {
    _durationTimer?.cancel();
    _durationTimer = null;
  }

  void _onConnected() {
    if (_callState == CallState.connected) return;
    _clearCallTimeout();
    _callState = CallState.connected;
    _startDurationTimer();
    _startStatsMonitoring();
    notifyListeners();
  }

  void _startStatsMonitoring() {
    _statsTimer?.cancel();
    final pc = _peerConnection;
    if (pc == null) return;

    _statsTimer = Timer.periodic(const Duration(seconds: 3), (_) async {
      try {
        if (_peerConnection == null) return;
        final stats = await _peerConnection!.getStats();
        int packetsLost = 0;
        int packetsReceived = 0;
        for (final report in stats) {
          if (report.type == 'inbound-rtp' && report.values['kind'] == 'audio') {
            packetsLost += (report.values['packetsLost'] ?? 0) as int;
            packetsReceived += (report.values['packetsReceived'] ?? 0) as int;
          }
        }
        final lossRate = packetsReceived > 0 ? (packetsLost / (packetsLost + packetsReceived)) * 100 : 0.0;
        String quality = 'Good';
        if (lossRate > 5) {
          quality = 'Poor';
        } else if (lossRate > 1) {
          quality = 'Fair';
        }
        if (_connectionQuality != quality) {
          _connectionQuality = quality;
          notifyListeners();
        }
      } catch (e) {
        debugPrint('[WebRTC] Stats error: $e');
      }
    });
  }

  void _stopStatsMonitoring() {
    _statsTimer?.cancel();
    _statsTimer = null;
  }

  void _maybeSetConnected() {
    // Fallback: if we already have a remote stream, mark connected.
    if (_remoteStream != null &&
        (_callState == CallState.connecting || _callState == CallState.ringing)) {
      _onConnected();
    }
  }

  Timer? _failedEndTimer;
  void _scheduleEndIfStillFailed() {
    _failedEndTimer?.cancel();
    _failedEndTimer = Timer(const Duration(seconds: 15), () {
      if (_peerConnection != null) {
        _peerConnection?.getConnectionState().then((current) {
          if (current == RTCPeerConnectionState.RTCPeerConnectionStateFailed ||
              current == RTCPeerConnectionState.RTCPeerConnectionStateClosed) {
            endCall();
          }
        });
        _peerConnection?.getIceConnectionState().then((current) {
          if (current == RTCIceConnectionState.RTCIceConnectionStateFailed) {
            endCall();
          }
        });
      }
    });
  }

  void _startCallTimeout(int ms, String message) {
    _callTimeoutTimer?.cancel();
    _callTimeoutTimer = Timer(Duration(milliseconds: ms), () {
      debugPrint('[WebRTC] Call timeout: $message');
      _callError = message;
      _callState = CallState.error;
      if (_callId != null) {
        _emit('call:end', {'callId': _callId, 'duration': _callDuration});
      }
      _reset();
    });
  }

  void _clearCallTimeout() {
    _callTimeoutTimer?.cancel();
    _callTimeoutTimer = null;
    _failedEndTimer?.cancel();
    _failedEndTimer = null;
  }

  Future<void> _flushPendingSignals() async {
    final pc = _peerConnection;
    if (pc == null) return;
    while (_pendingSignals.isNotEmpty) {
      final signal = _pendingSignals.removeAt(0);
      _emit('call:signal', {'callId': _callId, 'signal': signal});
    }
  }

  Future<void> _processIceQueue() async {
    final pc = _peerConnection;
    if (pc == null) return;
    final remoteDesc = await pc.getRemoteDescription();
    if (remoteDesc == null) return;
    while (_iceCandidateQueue.isNotEmpty) {
      final candidate = _iceCandidateQueue.removeAt(0);
      try {
        await pc.addCandidate(candidate);
      } catch (e) {
        debugPrint('[WebRTC] Failed to add queued ICE candidate: $e');
      }
    }
  }

  Future<void> _handleSignal(dynamic data) async {
    try {
      if (data is! Map<String, dynamic>) return;
      final signal = data['signal'] as Map<String, dynamic>?;
      if (signal == null) return;
      final callId = data['callId']?.toString();
      if (callId != null) _callId = callId;

      final pc = _peerConnection ?? await _createPeerConnection();

      if (signal['sdp'] != null) {
        final sdp = signal['sdp'] as Map<String, dynamic>;
        final type = sdp['type']?.toString();
        final sdpString = sdp['sdp']?.toString() ?? '';
        if (type == 'offer') {
          await pc.setRemoteDescription(RTCSessionDescription(sdpString, 'offer'));
          await _processIceQueue();
          await _flushPendingSignals();
          final answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          final localDesc = await pc.getLocalDescription();
          _emit('call:signal', {
            'callId': _callId,
            'signal': {
              'sdp': {'type': localDesc?.type ?? answer.type, 'sdp': localDesc?.sdp ?? answer.sdp}
            },
          });
          _callState = CallState.connecting;
          notifyListeners();
        } else if (type == 'answer') {
          await pc.setRemoteDescription(RTCSessionDescription(sdpString, 'answer'));
          await _processIceQueue();
          await _flushPendingSignals();
          _callState = CallState.connecting;
          notifyListeners();
        }
      } else if (signal['candidate'] != null) {
        final cand = signal['candidate'] as Map<String, dynamic>;
        final candidate = RTCIceCandidate(
          cand['candidate']?.toString(),
          cand['sdpMid']?.toString(),
          cand['sdpMLineIndex'] as int?,
        );
        final remoteDesc = await pc.getRemoteDescription();
        if (remoteDesc != null) {
          await pc.addCandidate(candidate);
        } else {
          _iceCandidateQueue.add(candidate);
        }
      }
    } catch (e) {
      debugPrint('[WebRTC] Signal error: $e');
      _callError = 'Call connection failed';
      notifyListeners();
    }
  }

  Future<bool> startCall(String receiverId, {Map<String, dynamic>? receiver, String type = 'audio'}) async {
    _callEventLog.clear();
    _logCallEvent('[STEP 1] startCall to $receiverId');

    if (_callState != CallState.idle) {
      _logCallEvent('[FAIL] Already in a call (state: $_callState)');
      _callError = 'Already in a call';
      notifyListeners();
      return false;
    }

    if (!ChatSocketService().isConnected) {
      _logCallEvent('[FAIL] Socket NOT connected');
      _callError = 'Not connected to server. Please check your internet and try again.';
      notifyListeners();
      return false;
    }

    final socket = ChatSocketService().socket;
    if (socket == null || !socket.connected) {
      _logCallEvent('[FAIL] Socket object is null or disconnected');
      _callError = 'Socket connection lost. Please try again.';
      notifyListeners();
      return false;
    }
    _logCallEvent('[STEP 2] Socket connected: true, id=${socket.id}');

    final currentUserId = await _currentUserIdAsync();
    _logCallEvent('[STEP 3] currentUserId=$currentUserId, receiverId=$receiverId');
    if (currentUserId.isNotEmpty && receiverId == currentUserId) {
      _logCallEvent('[FAIL] Cannot call yourself');
      _callError = 'Cannot call yourself';
      notifyListeners();
      return false;
    }

    final bool isVideo = type == 'video';
    _logCallEvent('[STEP 4] Requesting permissions...');
    final granted = await _requestPermissions(video: isVideo);
    if (!granted) {
      _logCallEvent('[FAIL] Permission denied');
      return false;
    }
    _logCallEvent('[STEP 5] Permissions granted');

    _logCallEvent('[STEP 6] Getting media stream...');
    final stream = await _getMediaStream(video: isVideo);
    if (stream == null) {
      _logCallEvent('[FAIL] Media stream failed');
      _callState = CallState.idle;
      notifyListeners();
      return false;
    }
    _logCallEvent('[STEP 7] Media stream OK');

    _callState = CallState.calling;
    _isInitiator = true;
    _callError = null;
    _otherUser = receiver;
    _logCallEvent('[STEP 8] State=calling, TURN loaded=${_fetchedTurnServers.isNotEmpty}');
    notifyListeners();

    _startCallTimeout(_callRingingTimeoutMs, 'Call timed out: no answer');

    _logCallEvent('[STEP 9] Creating peer connection...');
    final pc = await _createPeerConnection();
    await _addLocalTracks(stream);
    _logCallEvent('[STEP 10] Peer connection created');

    try {
      _logCallEvent('[STEP 11] Creating offer...');
      final offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      final localDesc = await pc.getLocalDescription();
      _logCallEvent('[STEP 12] Offer created, emitting call:initiate...');

      final emitted = _emit('call:initiate', {
        'receiverId': receiverId,
        'type': type,
        'offer': {'type': localDesc?.type ?? offer.type, 'sdp': localDesc?.sdp ?? offer.sdp},
      });
      _logCallEvent('[STEP 13] call:initiate emitted=$emitted');

      if (!emitted) {
        _logCallEvent('[FAIL] Could not emit call:initiate - socket disconnected');
        _callError = 'Socket disconnected while sending call';
        _callState = CallState.error;
        notifyListeners();
        _reset();
        return false;
      }

      _logCallEvent('[SUCCESS] Call initiated, waiting for ringing...');
      return true;
    } catch (e) {
      _logCallEvent('[FAIL] Start call error: $e');
      debugPrint('[WebRTC] Failed to start call: $e');
      _callError = 'Failed to start call: $e';
      _callState = CallState.error;
      notifyListeners();
      _reset();
      return false;
    }
  }

  Future<bool> acceptCall(String callId, String roomId) async {
    if (_callState != CallState.ringing) return false;

    _callId = callId;
    _roomId = roomId;
    _isInitiator = false;

    final bool isVideo = _callData?['type']?.toString() == 'video';
    final granted = await _requestPermissions(video: isVideo);
    if (!granted) {
      rejectCall();
      return false;
    }

    final stream = await _getMediaStream(video: isVideo);
    if (stream == null) {
      rejectCall();
      return false;
    }

    _callState = CallState.connecting;
    notifyListeners();

    _startCallTimeout(_callConnectTimeoutMs, 'Call connection failed');

    await _createPeerConnection();
    await _addLocalTracks(stream);

    _emit('call:accept', {'callId': callId, 'roomId': roomId});
    return true;
  }

  void rejectCall() {
    final callId = _callId;
    if (callId != null) {
      _emit('call:reject', {'callId': callId});
    }
    _reset();
  }

  void missCall() {
    final callId = _callId;
    if (callId != null) {
      _emit('call:missed', {'callId': callId});
    }
    _reset();
  }

  void cancelCall() {
    final callId = _callId;
    if (callId != null) {
      _emit('call:end', {'callId': callId, 'duration': 0});
    }
    _reset();
  }

  void endCall() {
    final callId = _callId;
    if (callId != null) {
      _emit('call:end', {'callId': callId, 'duration': _callDuration});
    }
    _reset();
  }

  void toggleMute() {
    if (_localStream == null) return;
    final audioTracks = _localStream!.getAudioTracks();
    if (audioTracks.isNotEmpty) {
      final track = audioTracks.first;
      track.enabled = !track.enabled;
      _isMuted = !track.enabled;
      notifyListeners();
    }
  }

  Future<void> toggleSpeaker() async {
    _isSpeakerOn = !_isSpeakerOn;
    notifyListeners();
    try {
      await Helper.setSpeakerphoneOn(_isSpeakerOn);
    } catch (e) {
      debugPrint('[WebRTC] Failed to toggle speaker: $e');
    }
  }

  void _reset() {
    _stopDurationTimer();
    _stopKeepAlive();
    _stopStatsMonitoring();
    _clearCallTimeout();
    _failedEndTimer?.cancel();
    _failedEndTimer = null;
    _pendingSignals.clear();
    _iceCandidateQueue.clear();
    if (_peerConnection != null) {
      _peerConnection!.close().catchError((e) {
        debugPrint('[WebRTC] Error closing peer: $e');
      });
      _peerConnection = null;
    }
    _stopMediaStream();
    _callId = null;
    _roomId = null;
    _isInitiator = false;
    _callDuration = 0;
    _isMuted = false;
    _isSpeakerOn = true;
    _ratePerMinute = 0;
    _amountCharged = 0;
    _connectionQuality = 'Good';
    Future.delayed(const Duration(milliseconds: 300), () {
      if (_callState == CallState.ended || _callState == CallState.error) {
        _callState = CallState.idle;
        _callError = null;
        _callData = null;
        _otherUser = null;
        notifyListeners();
      }
    });
    notifyListeners();
  }

  void _stopKeepAlive() {
    _keepAliveTimer?.cancel();
    _keepAliveTimer = null;
  }

  @override
  void dispose() {
    _reset();
    unbindGlobalListeners();
    super.dispose();
  }
}
