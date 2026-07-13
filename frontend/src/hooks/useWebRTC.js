import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { useSocket } from '../context/SocketContext';

const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
};

const PEER_CONNECTION_CONFIG = {
  ...ICE_SERVERS,
  iceCandidatePoolSize: 10,
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

  const peerRef = useRef(null);
  const callIdRef = useRef(null);
  const durationIntervalRef = useRef(null);
  const statsIntervalRef = useRef(null);
  const isInitiatorRef = useRef(false);
  const localStreamRef = useRef(null);
  const callDurationRef = useRef(0);

  // Keep refs in sync with state so callbacks always see the current values
  useEffect(() => {
    localStreamRef.current = localStream;
  }, [localStream]);

  useEffect(() => {
    callDurationRef.current = callDuration;
  }, [callDuration]);

  const startDurationTimer = useCallback(() => {
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
    }
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
    // Reuse existing stream if it still has active audio tracks
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

  const createPeerConnection = useCallback((stream, callId) => {
    if (peerRef.current) {
      console.log('[WebRTC] PC already exists, reusing');
      return peerRef.current;
    }

    console.log('[WebRTC] Creating RTCPeerConnection for call', callId);
    const pc = new RTCPeerConnection(PEER_CONNECTION_CONFIG);

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        console.log('[WebRTC] Sending ICE candidate');
        emit('call:signal', {
          callId,
          signal: { candidate: event.candidate },
        });
      }
    };

    pc.ontrack = (event) => {
      console.log('[WebRTC] Received remote track', event.streams[0]?.getTracks().map((t) => t.kind));
      setRemoteStream(event.streams[0]);
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
      } else if (pc.connectionState === 'closed') {
        setCallQuality({});
        stopStatsMonitoring();
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

  const startCall = useCallback(async (receiverId, type = 'audio') => {
    try {
      console.log('[WebRTC] Starting call to', receiverId);
      const stream = await getMediaStream();
      if (!stream) {
        setCallState('idle');
        return;
      }
      setCallState('calling');
      emit('call:initiate', { receiverId, type });
    } catch (error) {
      console.error('Failed to start call:', error);
      setCallState('idle');
    }
  }, [emit, getMediaStream]);

  const acceptCall = useCallback(async (callId, roomId) => {
    try {
      console.log('[WebRTC] Accepting call', callId);
      callIdRef.current = callId;
      isInitiatorRef.current = false;
      const stream = await getMediaStream();
      if (!stream) {
        console.error('[WebRTC] Cannot accept call: no media stream');
        setCallState('idle');
        return;
      }
      const pc = createPeerConnection(stream, callId);
      setOpusCodecPreference(pc);

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      console.log('[WebRTC] Created offer, sending');

      emit('call:accept', { callId, roomId });
      emit('call:signal', {
        callId,
        signal: { sdp: pc.localDescription },
      });
      setCallState('connecting');
    } catch (error) {
      console.error('Failed to accept call:', error);
      setCallState('idle');
    }
  }, [createPeerConnection, emit, getMediaStream, setOpusCodecPreference]);

  const rejectCall = useCallback((callId) => {
    emit('call:reject', { callId });
    setCallState('idle');
  }, [emit]);

  const endCall = useCallback(() => {
    stopDurationTimer();
    stopStatsMonitoring();
    stopMediaStream();

    if (peerRef.current) {
      peerRef.current.close();
      peerRef.current = null;
    }

    emit('call:end', {
      callId: callIdRef.current,
      duration: callDurationRef.current,
    });

    setRemoteStream(null);
    setCallState('idle');
    setCallDuration(0);
    callIdRef.current = null;
    isInitiatorRef.current = false;
  }, [emit, stopMediaStream, stopStatsMonitoring]);

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

  const handleCallAccepted = useCallback((handler) => {
    on('call:accepted', handler);
    return () => off('call:accepted', handler);
  }, [on, off]);

  const handleCallRejected = useCallback((handler) => {
    on('call:rejected', handler);
    return () => off('call:rejected', handler);
  }, [on, off]);

  const handleCallEnded = useCallback((handler) => {
    on('call:ended', handler);
    return () => off('call:ended', handler);
  }, [on, off]);

  const handleSignal = useCallback(() => {
    const signalHandler = async (data) => {
      try {
        console.log('[WebRTC] Received signal', data.signal?.sdp?.type || 'candidate', 'for call', data.callId);
        let pc = peerRef.current;
        const callId = data.callId;

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
            console.log('[WebRTC] Set remote offer, creating answer');
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            console.log('[WebRTC] Created answer, sending');
            emit('call:signal', {
              callId,
              signal: { sdp: pc.localDescription },
            });
            callIdRef.current = callId;
            setCallState('connecting');
          } else if (data.signal.sdp.type === 'answer') {
            if (!pc) {
              console.log('[WebRTC] Received answer but no PC yet');
              return;
            }
            await pc.setRemoteDescription(new RTCSessionDescription(data.signal.sdp));
            console.log('[WebRTC] Set remote answer');
            setCallState('connecting');
          }
        } else if (data.signal.candidate) {
          if (!pc) {
            console.log('[WebRTC] Received candidate before PC created, ignoring');
            return;
          }
          await pc.addIceCandidate(new RTCIceCandidate(data.signal.candidate));
          console.log('[WebRTC] Added ICE candidate');
        }
      } catch (error) {
        console.error('[WebRTC] Signal error:', error);
      }
    };

    on('call:signal', signalHandler);
    return () => off('call:signal', signalHandler);
  }, [on, off, emit, getMediaStream, createPeerConnection, setOpusCodecPreference, startDurationTimer]);

  const handleCallAcceptedSocket = useCallback(() => {
    const handler = async (data) => {
      const callId = data.call?._id;
      console.log('[WebRTC] Call accepted event', callId);
      if (!callId) {
        console.error('[WebRTC] call:accepted event missing call id');
        return;
      }
      callIdRef.current = callId;
      if (peerRef.current) {
        console.log('[WebRTC] PC already exists from signal handler');
        return;
      }
      const stream = await getMediaStream();
      if (!stream) {
        console.error('[WebRTC] Cannot prepare accepted call: no media stream');
        return;
      }
      createPeerConnection(stream, callId);
      setOpusCodecPreference(peerRef.current);
      setCallState('connecting');
    };

    on('call:accepted', handler);
    return () => off('call:accepted', handler);
  }, [on, off, createPeerConnection, getMediaStream, setOpusCodecPreference]);

  useEffect(() => {
    return () => {
      if (peerRef.current) peerRef.current.close();
      if (localStream) localStream.getTracks().forEach((t) => t.stop());
      stopDurationTimer();
    };
  }, [localStream, stopDurationTimer]);

  return useMemo(() => ({
    localStream,
    remoteStream,
    callState,
    callDuration,
    isMuted,
    isSpeakerOn,
    callQuality,
    startCall,
    acceptCall,
    rejectCall,
    endCall,
    toggleMute,
    toggleSpeaker,
    handleIncomingCall,
    handleCallAccepted,
    handleCallRejected,
    handleCallEnded,
    handleSignal,
    handleCallAcceptedSocket,
  }), [
    localStream,
    remoteStream,
    callState,
    callDuration,
    isMuted,
    isSpeakerOn,
    callQuality,
    startCall,
    acceptCall,
    rejectCall,
    endCall,
    toggleMute,
    toggleSpeaker,
    handleIncomingCall,
    handleCallAccepted,
    handleCallRejected,
    handleCallEnded,
    handleSignal,
    handleCallAcceptedSocket,
  ]);
};
