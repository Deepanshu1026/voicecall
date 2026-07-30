import 'package:flutter/foundation.dart';
import 'package:socket_io_client/socket_io_client.dart' as io;
import 'package:shared_preferences/shared_preferences.dart';
import '../config/app_config.dart';

/// Shared Socket.IO service for real-time chat.
/// Connects to the same backend used by the React website.
class ChatSocketService {
  static final ChatSocketService _instance = ChatSocketService._internal();
  factory ChatSocketService() => _instance;
  ChatSocketService._internal();

    io.Socket? _socket;
    String? _currentUserId;
    String? _accessToken;
    bool _isConnected = false;

    final List<void Function(Map<String, dynamic>)> _newMessageListeners = [];
  final List<void Function(Map<String, dynamic>)> _messageStatusListeners = [];
  final List<void Function(Map<String, dynamic>)> _conversationUpdateListeners = [];
  final List<void Function()> _connectListeners = [];
  final List<void Function()> _disconnectListeners = [];
  final Map<String, List<void Function(dynamic)>> _rawEventListeners = {};
  final Set<String> _boundRawEvents = {};

  bool get isConnected => _isConnected;
  io.Socket? get socket => _socket;

  /// Connect to the backend with the current user's ID.
  /// Should be called after login or app initialization.
  Future<void> connect({String? userId, String? token}) async {
    if (userId != null) {
      _currentUserId = userId;
    }
    if (token != null) {
      _accessToken = token;
    }

    final prefs = await SharedPreferences.getInstance();
    if (_currentUserId == null || _currentUserId!.isEmpty) {
      final dynamic storedUserId = prefs.get('userId');
      if (storedUserId is String) {
        _currentUserId = storedUserId;
      } else if (storedUserId is int) {
        _currentUserId = storedUserId.toString();
      }
    }
    if (_accessToken == null || _accessToken!.isEmpty) {
      _accessToken = prefs.getString('accessToken');
    }

    if (_currentUserId == null || _currentUserId!.isEmpty) {
      debugPrint('ChatSocketService: No userId, skipping connection.');
      return;
    }

    if (_socket != null && _socket!.connected) {
      debugPrint('ChatSocketService: Already connected.');
      return;
    }

    _socket = io.io(
      AppConfig.apiBaseUrl,
      io.OptionBuilder()
          .setTransports(['websocket', 'polling'])
          .setExtraHeaders({'userId': _currentUserId!})
          .setAuth({'token': _accessToken ?? ''})
          .enableAutoConnect()
          .enableReconnection()
          .build(),
    );

    // Rebind any raw event listeners registered before the socket existed.
    _bindRawEvents();

    _socket!.onConnect((_) {
      _isConnected = true;
      debugPrint('ChatSocketService: Connected to ${_socket!.io.uri}');
      // Join personal room so messages can be routed to this device
      _socket!.emit('join', _currentUserId);
      for (final listener in _connectListeners) {
        try {
          listener();
        } catch (e) {
          debugPrint('ChatSocketService: connect listener error $e');
        }
      }
    });

    _socket!.onDisconnect((_) {
      _isConnected = false;
      debugPrint('ChatSocketService: Disconnected');
      for (final listener in _disconnectListeners) {
        try {
          listener();
        } catch (e) {
          debugPrint('ChatSocketService: disconnect listener error $e');
        }
      }
    });

    _socket!.onConnectError((err) {
      _isConnected = false;
      debugPrint('ChatSocketService: Connect error $err');
    });

    _socket!.on('message:new', (data) {
      debugPrint('ChatSocketService: message:new $data');
      _notify(_newMessageListeners, data);
    });

    _socket!.on('message:status', (data) {
      debugPrint('ChatSocketService: message:status $data');
      _notify(_messageStatusListeners, data);
    });

    _socket!.on('messages:read', (data) {
      debugPrint('ChatSocketService: messages:read $data');
      _notify(_messageStatusListeners, data);
    });

    _socket!.on('message:edited', (data) {
      debugPrint('ChatSocketService: message:edited $data');
      _notify(_messageStatusListeners, data);
    });

    _socket!.on('message:deleted', (data) {
      debugPrint('ChatSocketService: message:deleted $data');
      _notify(_messageStatusListeners, data);
    });

    _socket!.on('conversation:updated', (data) {
      debugPrint('ChatSocketService: conversation:updated $data');
      _notify(_conversationUpdateListeners, data);
    });

    _socket!.on('conversation:new', (data) {
      debugPrint('ChatSocketService: conversation:new $data');
      _notify(_conversationUpdateListeners, data);
    });

    _socket!.connect();
  }

  void _notify(List<void Function(Map<String, dynamic>)> listeners, dynamic data) {
    if (data is Map<String, dynamic>) {
      for (final listener in listeners) {
        try {
          listener(data);
        } catch (e) {
          debugPrint('ChatSocketService: listener error $e');
        }
      }
    }
  }

  void Function() onNewMessage(void Function(Map<String, dynamic>) listener) {
    _newMessageListeners.add(listener);
    return () => _newMessageListeners.remove(listener);
  }

  void onNewMessageOnce(void Function(Map<String, dynamic>) listener) {
    late final void Function(Map<String, dynamic>) wrapped;
    wrapped = (data) {
      listener(data);
      _newMessageListeners.remove(wrapped);
    };
    _newMessageListeners.add(wrapped);
  }

  void Function() onMessageStatus(void Function(Map<String, dynamic>) listener) {
    _messageStatusListeners.add(listener);
    return () => _messageStatusListeners.remove(listener);
  }

  void Function() onConversationUpdate(void Function(Map<String, dynamic>) listener) {
    _conversationUpdateListeners.add(listener);
    return () => _conversationUpdateListeners.remove(listener);
  }

  void Function() onConnectListener(void Function() listener) {
    _connectListeners.add(listener);
    return () => _connectListeners.remove(listener);
  }

  void Function() onDisconnectListener(void Function() listener) {
    _disconnectListeners.add(listener);
    return () => _disconnectListeners.remove(listener);
  }

  /// Mark a message as delivered (recipient side)
  void emitDelivered(List<String> messageIds) {
    if (_socket != null && _isConnected) {
      _socket!.emit('message:delivered', {'messageIds': messageIds});
    }
  }

  /// Mark all messages in a conversation as read
  void emitRead(String conversationId) {
    if (_socket != null && _isConnected) {
      _socket!.emit('message:read', {'conversationId': conversationId});
    }
  }

  /// Typing indicator for a conversation
  void emitTyping(String conversationId, bool isTyping) {
    if (_socket != null && _isConnected) {
      _socket!.emit(
        isTyping ? 'typing:start' : 'typing:stop',
        {'conversationId': conversationId},
      );
    }
  }

  void _bindRawEvents() {
    if (_socket == null) return;
    _boundRawEvents.clear();
    for (final event in _rawEventListeners.keys) {
      _socket!.on(event, (data) {
        for (final l in List<void Function(dynamic)>.from(_rawEventListeners[event] ?? [])) {
          try {
            l(data);
          } catch (e) {
            debugPrint('ChatSocketService: raw event $event listener error $e');
          }
        }
      });
      _boundRawEvents.add(event);
    }
  }

  /// Listen to any socket event. Useful for call signaling.
  void Function() onEvent(String event, void Function(dynamic data) listener) {
    _rawEventListeners.putIfAbsent(event, () => []);
    _rawEventListeners[event]!.add(listener);

    // Bind the event on the socket once per event name.
    if (_socket != null && !_boundRawEvents.contains(event)) {
      _boundRawEvents.add(event);
      _socket!.on(event, (data) {
        for (final l in List<void Function(dynamic)>.from(_rawEventListeners[event] ?? [])) {
          try {
            l(data);
          } catch (e) {
            debugPrint('ChatSocketService: raw event $event listener error $e');
          }
        }
      });
    }

    return () {
      _rawEventListeners[event]?.remove(listener);
      if ((_rawEventListeners[event] ?? []).isEmpty) {
        _rawEventListeners.remove(event);
        _socket?.off(event);
        _boundRawEvents.remove(event);
      }
    };
  }

  /// Emit any socket event. Useful for call signaling.
  void emitEvent(String event, dynamic data) {
    if (_socket != null && _isConnected) {
      _socket!.emit(event, data);
    }
  }

  void disconnect() {
    _socket?.disconnect();
    _socket?.dispose();
    _socket = null;
    _isConnected = false;
    _currentUserId = null;
  }

  void clearListeners() {
    _newMessageListeners.clear();
    _messageStatusListeners.clear();
    _conversationUpdateListeners.clear();
    _connectListeners.clear();
    _disconnectListeners.clear();
    _rawEventListeners.clear();
  }
}
