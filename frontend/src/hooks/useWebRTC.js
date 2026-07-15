import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { useSocket } from '../context/SocketContext';
import toast from 'react-hot-toast';

const STUN_SERVERS = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
];

const getTurnServers = () => {
  const servers = [...STUN_SERVERS];
  const turnUrl = import.meta.env.VITE_TURN_SERVER_URL;
  const turnUser = import.meta.env.VITE_TURN_USERNAME;
  const turnPass = import.meta.env.VITE_TURN_PASSWORD;
  if (turnUrl) {
    servers.push({ urls: turnUrl, username: turnUser || '', credential: turnPass || '' });
  }
  return servers;
};

export const useWebRTC = () => {
  const { emit, on, off } = useSocket();
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [callState, setCallState] = useState('idle');
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [callQuality, setCallQuality] = useState({});
  const [callError, setCallError] = useState(null);

  const peerRef = useRef(null);
  const callIdRef = useRef(null);
  const roomIdRef = useRef(null);
  const isInitiatorRef = useRef(false);
  const iceCandidatesQueueRef = useRef([]);
  const pendingSignalsRef = useRef([]);
  const durationIntervalRef = useRef(null);
  const statsIntervalRef = useRef(null);
  const localStreamRef = useRef(null);
  const callDurationRef = useRef(0);
  const remoteAudioRef = useRef(null);
  const iceServersRef = useRef(getTurnServers());
  const resetCallRef = useRef(null);

  const flushPendingSignals = useCallback(() => {
    const callId = callIdRef.current;
    if (!callId) return;
    while (pendingSignalsRef.current.length) {
      const signal = pendingSignalsRef.current.shift();
      emit('call:signal', { callId, signal });
    }
  }, [emit]);

  useEffect(() => {
    const apiKey = import.meta.env.VITE_TURN_API_KEY;
    const appName = import.meta.env.VITE_TURN_APP_NAME || 'openrelay';
    if (!apiKey) return;

    const fetchIceServers = async () => {
      try {
        const response = await fetch(
          `https://${appName}.metered.live/api/v1/turn/credentials?apiKey=${apiKey}`,
          { cache: 'no-store' }
        );
        if (!response.ok) throw new Error(`TURN credentials fetch failed: ${response.status}`);
        const servers = await response.json();
        if (Array.isArray(servers) && servers.length > 0) {
          iceServersRef.current = servers;
          console.log('[WebRTC] TURN credentials loaded');
        }
      } catch (err) {
        console.error('[WebRTC] Failed to fetch TURN credentials:', err.message);
      }
    };

    fetchIceServers();
  }, []);

  useEffect(() => {
    localStreamRef.current = localStream;
  }, [localStream]);

  useEffect(() => {
    callDurationRef.current = callDuration;
  }, [callDuration]);

  const startDurationTimer = useCallback(() => {
    if (durationIntervalRef.current) clearInterval(durationIntervalRef.current);
    durationIntervalRef.current = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);
  }, []);

  const stopDurationTimer = useCallback(() => {
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
      durationIntervalRef.current = null;
    }
  }, []);

  const stopStatsMonitoring = useCallback(() => {
    if (statsIntervalRef.current) {
      clearInterval(statsIntervalRef.current);
      statsIntervalRef.current = null;
    }
  }, []);

  const startStatsMonitoring = useCallback((pc) => {
    stopStatsMonitoring();
    statsIntervalRef.current = setInterval(async () => {
      try {
        if (!pc || pc.connectionState === 'closed') return;
        const stats = await pc.getStats();
        let packetsLost = 0;
        let packetsReceived = 0;
        let jitter = 0;
        let bitrate = 0;
        stats.forEach((report) => {
          if (report.type === 'inbound-rtp' && report.kind === 'audio') {
            packetsLost += report.packetsLost || 0;
            packetsReceived += report.packetsReceived || 0;
            jitter += report.jitter || 0;
          }
          if (report.type === 'outbound-rtp' && report.kind === 'audio') {
            bitrate = (report.targetBitrate || 0) / 1000;
          }
        });
        const lossRate = packetsReceived > 0 ? (packetsLost / (packetsLost + packetsReceived)) * 100 : 0;
        setCallQuality({
          state: lossRate > 5 ? 'poor' : lossRate > 1 ? 'fair' : 'good',
          packetLoss: Math.round(lossRate * 100) / 100,
          jitter: Math.round(jitter * 1000) / 1000,
          bitrate: bitrate ? `${bitrate}kbps` : undefined,
        });
      } catch (err) {
        console.error('[WebRTC] Stats error:', err);
      }
    }, 3000);
  }, [stopStatsMonitoring]);

  const setOpusCodecPreference = useCallback((pc) => {
    try {
      const capabilities = RTCRtpReceiver.getCapabilities('audio');
      if (!capabilities) return;
      const opusCodecs = capabilities.codecs.filter((c) =>
        c.mimeType.toLowerCase().includes('opus')
      );
      if (opusCodecs.length === 0) return;
      pc.getTransceivers().forEach((transceiver) => {
        if (transceiver.sender.track?.kind === 'audio') {
          transceiver.setCodecPreferences(opusCodecs);
          console.log('[WebRTC] Set opus codec preference');
        }
      });
    } catch (err) {
      console.log('[WebRTC] Codec preference not supported:', err.message);
    }
  }, []);

  const getMediaStream = useCallback(async () => {
    const currentStream = localStreamRef.current;
    if (currentStream && currentStream.getAudioTracks().some((t) => t.readyState === 'live')) {
      console.log('[WebRTC] Reusing existing local stream');
      return currentStream;
    }
    try {
      console.log('[WebRTC] Requesting new media stream');
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 48000,
          channelCount: 1,
        },
        video: false,
      });
      setLocalStream(stream);
      localStreamRef.current = stream;
      return stream;
    } catch (err) {
      console.error('Failed to get media stream:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        toast.error('Microphone permission denied. Please allow access and try again.');
      } else if (err.name === 'NotFoundError') {
        toast.error('No microphone found. Please connect a microphone.');
      } else {
        toast.error('Could not access microphone: ' + err.message);
      }
      return null;
    }
  }, []);

  const stopMediaStream = useCallback(() => {
    const stream = localStreamRef.current;
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setLocalStream(null);
      localStreamRef.current = null;
    }
  }, []);

  const processIceQueue = useCallback((pc) => {
    if (!pc || !pc.remoteDescription) return;
    while (iceCandidatesQueueRef.current.length) {
      const candidate = iceCandidatesQueueRef.current.shift();
      try {
        pc.addIceCandidate(new RTCIceCandidate(candidate));
        console.log('[WebRTC] Added queued ICE candidate');
      } catch (err) {
        console.error('[WebRTC] Failed to add queued ICE candidate:', err);
      }
    }
  }, []);

  const createPeerConnection = useCallback((stream, callId) => {
    // Always start a fresh peer connection for a new call to avoid stale state
    if (peerRef.current) {
      console.log('[WebRTC] Closing existing peer before creating new one');
      try {
        peerRef.current.close();
      } catch (err) {
        console.error('[WebRTC] Error closing existing peer:', err);
      }
      peerRef.current = null;
    }

    console.log('[WebRTC] Creating RTCPeerConnection for call', callId);
    const pc = new RTCPeerConnection({
      iceServers: iceServersRef.current,
      iceCandidatePoolSize: 10,
      bundlePolicy: 'max-bundle',
      rtcpMuxPolicy: 'require',
    });

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        const currentCallId = callIdRef.current || callId;
        // Queue candidates until the remote description is set so they are not
        // emitted before the other peer has joined the signalling room.
        if (!currentCallId || !pc.remoteDescription) {
          console.log('[WebRTC] Queuing ICE candidate until remote description is set');
          pendingSignalsRef.current.push({ candidate: event.candidate });
          return;
        }
        console.log('[WebRTC] Sending ICE candidate');
        emit('call:signal', {
          callId: currentCallId,
          signal: { candidate: event.candidate },
        });
      }
    };

    pc.ontrack = (event) => {
      const track = event.track;
      const stream = event.streams[0] || new MediaStream([track]);
      console.log('[WebRTC] Received remote track', track.kind);
      setRemoteStream(stream);
      if (remoteAudioRef.current) {
        remoteAudioRef.current.srcObject = stream;
        remoteAudioRef.current.play().catch((err) => {
          console.log('Autoplay prevented, waiting for user interaction', err);
        });
      }
    };

    pc.onconnectionstatechange = () => {
      console.log('[WebRTC] Connection state:', pc.connectionState);
      if (pc.connectionState === 'connected') {
        setCallState('connected');
        startDurationTimer();
        startStatsMonitoring(pc);
      } else if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
        setCallQuality((prev) => ({ ...prev, state: 'poor', packetLoss: 10 }));
        stopStatsMonitoring();
        // Give ICE a moment to recover, then clean up if still failed
        setTimeout(() => {
          if (peerRef.current === pc && ['failed', 'closed', 'disconnected'].includes(pc.connectionState)) {
            console.log('[WebRTC] Connection did not recover, resetting call');
            resetCallRef.current?.();
          }
        }, 4000);
      } else if (pc.connectionState === 'closed') {
        setCallQuality({});
        stopStatsMonitoring();
      }
    };

    pc.oniceconnectionstatechange = () => {
      console.log('[WebRTC] ICE connection state:', pc.iceConnectionState);
      if (pc.iceConnectionState === 'failed') {
        console.warn('[WebRTC] ICE failed, attempting restart');
        try {
          pc.restartIce();
        } catch (err) {
          console.error('[WebRTC] ICE restart failed:', err);
        }
      }
    };

    if (stream) {
      stream.getTracks().forEach((track) => {
        console.log('[WebRTC] Adding local track', track.kind);
        pc.addTrack(track, stream);
      });
    }

    peerRef.current = pc;
    return pc;
  }, [emit, startDurationTimer, startStatsMonitoring, stopStatsMonitoring]);

  const resetCall = useCallback(() => {
    stopDurationTimer();
    stopStatsMonitoring();
    stopMediaStream();
    if (peerRef.current) {
      try {
        peerRef.current.close();
      } catch (err) {
        console.error('[WebRTC] Error closing peer:', err);
      }
      peerRef.current = null;
    }
    iceCandidatesQueueRef.current = [];
    pendingSignalsRef.current = [];
    setRemoteStream(null);
    setCallState('idle');
    setCallDuration(0);
    setCallQuality({});
    setCallError(null);
    callIdRef.current = null;
    roomIdRef.current = null;
    isInitiatorRef.current = false;
  }, [stopMediaStream, stopDurationTimer, stopStatsMonitoring]);

  resetCallRef.current = resetCall;

  const startCall = useCallback(async (receiverId, type = 'audio') => {
    try {
      console.log('[WebRTC] Starting call to', receiverId);
      const stream = await getMediaStream();
      if (!stream) {
        setCallState('idle');
        return { success: false };
      }

      setCallState('calling');
      isInitiatorRef.current = true;

      const pc = createPeerConnection(stream, null);
      setOpusCodecPreference(pc);

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      console.log('[WebRTC] Created offer');

      emit('call:initiate', { receiverId, type, offer });
      return { success: true };
    } catch (error) {
      console.error('Failed to start call:', error);
      toast.error('Failed to start call: ' + error.message);
      resetCall();
      return { success: false };
    }
  }, [emit, getMediaStream, createPeerConnection, setOpusCodecPreference, resetCall]);

  const acceptCall = useCallback(async (callId, roomId) => {
    try {
      console.log('[WebRTC] Accepting call', callId);
      callIdRef.current = callId;
      roomIdRef.current = roomId;
      isInitiatorRef.current = false;

      const stream = await getMediaStream();
      if (!stream) {
        console.error('[WebRTC] Cannot accept call: no media stream');
        setCallState('idle');
        return { success: false };
      }

      emit('call:accept', { callId, roomId });
      setCallState('connecting');
      return { success: true };
    } catch (error) {
      console.error('Failed to accept call:', error);
      toast.error('Failed to accept call: ' + error.message);
      resetCall();
      return { success: false };
    }
  }, [emit, getMediaStream, resetCall]);

  const rejectCall = useCallback((callId) => {
    emit('call:reject', { callId });
    resetCall();
  }, [emit, resetCall]);

  const missCall = useCallback((callId) => {
    emit('call:missed', { callId });
    resetCall();
  }, [emit, resetCall]);

  const cancelCall = useCallback(() => {
    emit('call:end', { callId: callIdRef.current, duration: 0 });
    resetCall();
  }, [emit, resetCall]);

  const endCall = useCallback(() => {
    emit('call:end', {
      callId: callIdRef.current,
      duration: callDurationRef.current,
    });
    resetCall();
  }, [emit, resetCall]);

  const toggleMute = useCallback(() => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  }, [localStream]);

  const toggleSpeaker = useCallback(() => {
    setIsSpeakerOn((prev) => !prev);
  }, []);

  const handleIncomingCall = useCallback((handler) => {
    on('call:incoming', handler);
    return () => off('call:incoming', handler);
  }, [on, off]);

  const handleRinging = useCallback((handler) => {
    const wrapped = (data) => {
      callIdRef.current = data.call?._id;
      roomIdRef.current = data.roomId;
      if (handler) handler(data);
    };
    on('call:ringing', wrapped);
    return () => off('call:ringing', wrapped);
  }, [on, off]);

  const handleCallAccepted = useCallback((handler) => {
    on('call:accepted', handler);
    return () => off('call:accepted', handler);
  }, [on, off]);

  const handleCallRejected = useCallback((handler) => {
    const wrapped = (data) => {
      resetCall();
      if (handler) handler(data);
    };
    on('call:rejected', wrapped);
    return () => off('call:rejected', wrapped);
  }, [on, off, resetCall]);

  const handleCallEnded = useCallback((handler) => {
    const wrapped = (data) => {
      resetCall();
      if (handler) handler(data);
    };
    on('call:ended', wrapped);
    return () => off('call:ended', wrapped);
  }, [on, off, resetCall]);

  const handleCallError = useCallback((handler) => {
    const wrapped = (data) => {
      setCallError(data.message);
      toast.error(data.message || 'Call error');
      resetCall();
      if (handler) handler(data);
    };
    on('call:error', wrapped);
    return () => off('call:error', wrapped);
  }, [on, off, resetCall]);

  const handleCallMissed = useCallback((handler) => {
    const wrapped = (data) => {
      resetCall();
      if (handler) handler(data);
    };
    on('call:missed', wrapped);
    return () => off('call:missed', wrapped);
  }, [on, off, resetCall]);

  const handleSignal = useCallback(() => {
    const signalHandler = async (data) => {
      try {
        console.log('[WebRTC] Received signal', data.signal?.sdp?.type || 'candidate', 'for call', data.callId);
        const callId = data.callId;
        callIdRef.current = callId;

        let pc = peerRef.current;

        if (data.signal.sdp) {
          if (data.signal.sdp.type === 'offer') {
            if (!pc) {
              const stream = await getMediaStream();
              if (!stream) {
                console.error('[WebRTC] Cannot process offer: no media stream');
                return;
              }
              pc = createPeerConnection(stream, callId);
              setOpusCodecPreference(pc);
            }
            await pc.setRemoteDescription(new RTCSessionDescription(data.signal.sdp));
            processIceQueue(pc);
            flushPendingSignals();
            console.log('[WebRTC] Set remote offer, creating answer');
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            console.log('[WebRTC] Created answer, sending');
            emit('call:signal', {
              callId,
              signal: { sdp: pc.localDescription },
            });
            setCallState('connecting');
          } else if (data.signal.sdp.type === 'answer') {
            if (!pc) {
              console.log('[WebRTC] Received answer but no PC yet');
              return;
            }
            await pc.setRemoteDescription(new RTCSessionDescription(data.signal.sdp));
            processIceQueue(pc);
            flushPendingSignals();
            console.log('[WebRTC] Set remote answer');
            setCallState('connecting');
          }
        } else if (data.signal.candidate) {
          if (!pc) {
            console.log('[WebRTC] Received candidate before PC created, queuing');
            iceCandidatesQueueRef.current.push(data.signal.candidate);
            return;
          }
          if (!pc.remoteDescription) {
            console.log('[WebRTC] Received candidate before remote desc, queuing');
            iceCandidatesQueueRef.current.push(data.signal.candidate);
            return;
          }
          await pc.addIceCandidate(new RTCIceCandidate(data.signal.candidate));
          console.log('[WebRTC] Added ICE candidate');
        }
      } catch (error) {
        console.error('[WebRTC] Signal error:', error);
        toast.error('Call connection failed');
      }
    };

    on('call:signal', signalHandler);
    return () => off('call:signal', signalHandler);
  }, [on, off, emit, getMediaStream, createPeerConnection, setOpusCodecPreference, processIceQueue, flushPendingSignals]);

  useEffect(() => {
    return () => {
      resetCall();
    };
  }, [resetCall]);

  return useMemo(() => ({
    localStream,
    remoteStream,
    callState,
    callDuration,
    isMuted,
    isSpeakerOn,
    callQuality,
    callError,
    remoteAudioRef,
    startCall,
    acceptCall,
    rejectCall,
    missCall,
    cancelCall,
    endCall,
    toggleMute,
    toggleSpeaker,
    handleIncomingCall,
    handleRinging,
    handleCallAccepted,
    handleCallRejected,
    handleCallEnded,
    handleCallError,
    handleCallMissed,
    handleSignal,
    resetCall,
  }), [
    localStream,
    remoteStream,
    callState,
    callDuration,
    isMuted,
    isSpeakerOn,
    callQuality,
    callError,
    startCall,
    acceptCall,
    rejectCall,
    missCall,
    cancelCall,
    endCall,
    toggleMute,
    toggleSpeaker,
    handleIncomingCall,
    handleRinging,
    handleCallAccepted,
    handleCallRejected,
    handleCallEnded,
    handleCallError,
    handleCallMissed,
    handleSignal,
    resetCall,
  ]);
};

export default useWebRTC;
