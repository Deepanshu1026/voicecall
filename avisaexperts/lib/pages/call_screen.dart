import 'package:flutter/material.dart';

import '../services/webrtc_call_service.dart';

class CallScreen extends StatefulWidget {
  const CallScreen({super.key});

  @override
  State<CallScreen> createState() => _CallScreenState();
}

class _CallScreenState extends State<CallScreen> {
  final WebRTCCallService _callService = WebRTCCallService();
  late final VoidCallback _listener;
  bool _popped = false;
  bool _showLog = false;
  String? _lastErrorShown;

  @override
  void initState() {
    super.initState();
    _listener = () {
      if (!mounted) return;
      setState(() {});
      _showErrorIfAny();
      if (_callService.callState == CallState.idle && !_popped) {
        _popped = true;
        Navigator.of(context).pop();
      }
    };
    _callService.addListener(_listener);
  }

  void _showErrorIfAny() {
    final error = _callService.callError;
    if (error != null && error.isNotEmpty && error != _lastErrorShown) {
      _lastErrorShown = error;
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(error),
              backgroundColor: Colors.redAccent,
              behavior: SnackBarBehavior.floating,
              duration: const Duration(seconds: 4),
            ),
          );
        }
      });
    }
  }

  @override
  void dispose() {
    _callService.removeListener(_listener);
    super.dispose();
  }

  String _formatDuration(int seconds) {
    final m = (seconds ~/ 60).toString().padLeft(2, '0');
    final s = (seconds % 60).toString().padLeft(2, '0');
    return '$m:$s';
  }

  String _name() {
    final other = _callService.otherUser;
    if (other == null) return 'Unknown';
    return other['displayName']?.toString() ??
        other['username']?.toString() ??
        other['name']?.toString() ??
        'Unknown';
  }

  String _statusText() {
    switch (_callService.callState) {
      case CallState.idle:
        return 'Call ended';
      case CallState.calling:
        return 'Calling...';
      case CallState.ringing:
        return _callService.isInitiator ? 'Ringing...' : 'Incoming call';
      case CallState.connecting:
        return 'Connecting...';
      case CallState.connected:
        return _formatDuration(_callService.callDuration);
      case CallState.ended:
        return 'Call ended';
      case CallState.error:
        return _callService.callError ?? 'Call error';
    }
  }

  Color _qualityColor() {
    switch (_callService.connectionQuality) {
      case 'Good':
        return Colors.green;
      case 'Fair':
        return Colors.orange;
      case 'Poor':
        return Colors.red;
      default:
        return Colors.white70;
    }
  }

  Widget _buildQualityBadge() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: _qualityColor().withValues(alpha: 0.15),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(Icons.wifi, size: 14, color: _qualityColor()),
          const SizedBox(width: 6),
          Text(
            '${_callService.connectionQuality} connection',
            style: TextStyle(color: _qualityColor(), fontSize: 12),
          ),
        ],
      ),
    );
  }

  Widget _buildPricingInfo() {
    final rate = _callService.ratePerMinute;
    final charged = _callService.amountCharged;
    if (rate <= 0 && charged <= 0) return const SizedBox.shrink();
    return Container(
      margin: const EdgeInsets.only(top: 16),
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.08),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Column(
        children: [
          Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(Icons.currency_rupee, size: 14, color: Colors.white70),
              Text(
                '$rate/min',
                style: const TextStyle(color: Colors.white70, fontSize: 13),
              ),
              const SizedBox(width: 16),
              Container(width: 1, height: 14, color: Colors.white24),
              const SizedBox(width: 16),
              const Icon(Icons.account_balance_wallet_outlined, size: 14, color: Colors.white70),
              Text(
                'Charged: ₹$charged',
                style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w600),
              ),
            ],
          ),
          if (charged > 0 && _callService.callState == CallState.connected)
            Padding(
              padding: const EdgeInsets.only(top: 4),
              child: Text(
                '₹${charged ~/ (_callService.callDuration > 0 ? _callService.callDuration / 60 : 1)} / min effective',
                style: TextStyle(color: Colors.white.withValues(alpha: 0.5), fontSize: 11),
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildAvatar() {
    final other = _callService.otherUser;
    final avatarUrl = other?['avatar']?.toString() ?? '';
    return CircleAvatar(
      radius: 60,
      backgroundColor: Colors.grey[800],
      backgroundImage: avatarUrl.isNotEmpty ? NetworkImage(avatarUrl) : null,
      child: avatarUrl.isEmpty
          ? const Icon(Icons.person, size: 60, color: Colors.white)
          : null,
    );
  }

  Widget _buildLog() {
    if (!_showLog) return const SizedBox.shrink();
    final log = _callService.callEventLog.reversed.take(20).toList();
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.black.withValues(alpha: 0.4),
        borderRadius: BorderRadius.circular(12),
      ),
      constraints: const BoxConstraints(maxHeight: 180),
      child: SingleChildScrollView(
        reverse: true,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: log
              .map((line) => Text(
                    line,
                    style: const TextStyle(color: Colors.white70, fontSize: 10),
                  ))
              .toList(),
        ),
      ),
    );
  }

  Widget _buildControls() {
    final state = _callService.callState;

    // Incoming call
    if (state == CallState.ringing && !_callService.isInitiator) {
      return Row(
        mainAxisAlignment: MainAxisAlignment.spaceEvenly,
        children: [
          _circleButton(
            icon: Icons.call_end,
            color: Colors.red,
            label: 'Decline',
            onPressed: () => _callService.rejectCall(),
          ),
          _circleButton(
            icon: Icons.call,
            color: Colors.green,
            label: 'Accept',
            onPressed: () async {
              final callId = _callService.callId;
              final roomId = _callService.roomId;
              if (callId != null && roomId != null) {
                await _callService.acceptCall(callId, roomId);
              }
            },
          ),
        ],
      );
    }

    // Active / connecting / outgoing
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceEvenly,
      children: [
        _circleButton(
          icon: _callService.isMuted ? Icons.mic_off : Icons.mic,
          color: Colors.grey[800]!,
          label: _callService.isMuted ? 'Unmute' : 'Mute',
          onPressed: () => _callService.toggleMute(),
        ),
        _circleButton(
          icon: Icons.call_end,
          color: Colors.red,
          label: 'End',
          onPressed: () {
            if (state == CallState.calling || state == CallState.ringing) {
              _callService.cancelCall();
            } else {
              _callService.endCall();
            }
          },
        ),
        _circleButton(
          icon: _callService.isSpeakerOn ? Icons.volume_up : Icons.volume_off,
          color: Colors.grey[800]!,
          label: _callService.isSpeakerOn ? 'Speaker' : 'Earpiece',
          onPressed: () => _callService.toggleSpeaker(),
        ),
      ],
    );
  }

  Widget _circleButton({
    required IconData icon,
    required Color color,
    required String label,
    required VoidCallback onPressed,
  }) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Material(
          color: color,
          shape: const CircleBorder(),
          child: InkWell(
            customBorder: const CircleBorder(),
            onTap: onPressed,
            child: SizedBox(
              width: 72,
              height: 72,
              child: Icon(icon, color: Colors.white, size: 32),
            ),
          ),
        ),
        const SizedBox(height: 8),
        Text(label, style: const TextStyle(color: Colors.white70, fontSize: 12)),
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    return PopScope(
      canPop: false,
      onPopInvoked: (didPop) {
        if (didPop) return;
        final state = _callService.callState;
        if (state == CallState.calling || state == CallState.ringing) {
          _callService.cancelCall();
        } else if (state != CallState.idle && state != CallState.ended) {
          _callService.endCall();
        }
      },
      child: Scaffold(
        backgroundColor: const Color(0xFF1A1A2E),
        body: SafeArea(
          child: Column(
            children: [
              const SizedBox(height: 60),
              _buildAvatar(),
              const SizedBox(height: 12),
              TextButton.icon(
                onPressed: () => setState(() => _showLog = !_showLog),
                icon: Icon(_showLog ? Icons.visibility_off : Icons.visibility,
                    color: Colors.white54, size: 16),
                label: Text(
                  _showLog ? 'Hide call log' : 'Show call log',
                  style: const TextStyle(color: Colors.white54, fontSize: 12),
                ),
              ),
              _buildLog(),
            const SizedBox(height: 24),
            Text(
              _name(),
              style: const TextStyle(
                color: Colors.white,
                fontSize: 28,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 12),
            Text(
              _statusText(),
              style: const TextStyle(
                color: Colors.white70,
                fontSize: 16,
              ),
            ),
            const SizedBox(height: 16),
            _buildQualityBadge(),
            const SizedBox(height: 12),
            _buildPricingInfo(),
            const Spacer(),
            _buildControls(),
            const SizedBox(height: 60),
          ],
        ),
      ),
    ),
    );
  }
}
