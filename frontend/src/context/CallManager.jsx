import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useSocket } from './SocketContext';
import { useAuth } from './AuthContext';
import { useWebRTC } from '../hooks/useWebRTC';
import { useNotifications } from '../hooks/useNotifications';
import { CallProvider } from './CallContext';
import CallModal from '../components/call/CallModal';
import IncomingCallModal from '../components/call/IncomingCallModal';
import { userAPI } from '../services/api';
import toast from 'react-hot-toast';

const CallManager = ({ children }) => {
  const { user } = useAuth();
  const { on, socketVersion } = useSocket();
  const { notifyCall } = useNotifications();
  const webrtc = useWebRTC();
  const webrtcRef = useRef(webrtc);

  useEffect(() => {
    webrtcRef.current = webrtc;
  }, [webrtc]);

  const [searchParams, setSearchParams] = useSearchParams();
  const urlActionRef = useRef(false);

  const [incomingCall, setIncomingCall] = useState(null);
  const [activeCall, setActiveCall] = useState(null);
  const [showCallModal, setShowCallModal] = useState(false);

  // WebRTC/call listeners - re-register on socket reconnect so closures stay fresh
  useEffect(() => {
    const w = webrtcRef.current;

    const cleanupIncoming = w.handleIncomingCall((data) => {
      setIncomingCall(data);
      notifyCall(data.caller?.displayName || data.caller?.username || 'Someone', data.call?.type || 'audio');
    });

    const cleanupRinging = w.handleRinging((data) => {
      setActiveCall(data.call);
      setShowCallModal(true);
    });

    const cleanupRejected = w.handleCallRejected((data) => {
      toast.error('Call rejected');
      setActiveCall(null);
      setShowCallModal(false);
    });

    const cleanupEnded = w.handleCallEnded(() => {
      setActiveCall(null);
      setShowCallModal(false);
      setIncomingCall(null);
    });

    const cleanupAccepted = w.handleCallAccepted((data) => {
      setActiveCall(data.call);
      setShowCallModal(true);
    });

    const cleanupError = w.handleCallError((data) => {
      setActiveCall(null);
      setShowCallModal(false);
      setIncomingCall(null);
    });

    const cleanupMissed = w.handleCallMissed((data) => {
      toast('Missed call', { icon: '📞' });
      setIncomingCall(null);
    });

    const cleanupSignal = w.handleSignal();

    return () => {
      cleanupIncoming();
      cleanupRinging();
      cleanupRejected();
      cleanupEnded();
      cleanupAccepted();
      cleanupError();
      cleanupMissed();
      cleanupSignal();
    };
  }, [socketVersion, notifyCall]);

  // Billing events (cost updates, low balance, insufficient balance to start)
  useEffect(() => {
    const cleanupCharged = on('call:charged', (data) => {
      setActiveCall((prev) => (prev ? { ...prev, amountCharged: data.amountCharged } : null));
    });

    const cleanupLowBalance = on('call:low-balance', (data) => {
      toast.error(data.message || 'Low balance. The call will end soon.');
      if (webrtcRef.current && webrtcRef.current.endCall) {
        webrtcRef.current.endCall();
      }
    });

    const cleanupError = on('call:error', (data) => {
      if (data?.message?.toLowerCase().includes('insufficient balance')) {
        toast.error(data.message);
        setActiveCall(null);
        setShowCallModal(false);
      }
    });

    return () => {
      cleanupCharged();
      cleanupLowBalance();
      cleanupError();
    };
  }, [on]);

  // End active call if the user closes the tab
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (webrtc.callState !== 'idle') {
        webrtc.endCall();
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [webrtc]);

  const startCall = useCallback(async (receiverId, receiver = null, type = 'audio') => {
    const result = await webrtc.startCall(receiverId, type);
    if (result.success) {
      if (receiver) {
        setActiveCall({
          caller: user,
          receiver,
          type,
          status: 'ringing',
          _id: null,
        });
      }
      setShowCallModal(true);
      toast('Calling...', { icon: '📞' });
    }
  }, [webrtc, user]);

  // Start a call when the user arrives with ?callUserId=... (legacy/consultant links)
  useEffect(() => {
    const callUserId = searchParams.get('callUserId');
    if (!callUserId || !user) return;
    if (urlActionRef.current) return;
    urlActionRef.current = true;

    const process = async () => {
      try {
        const userRes = await userAPI.getUserById(callUserId);
        startCall(callUserId, userRes.data?.data, 'audio');
      } catch (err) {
        console.error('Failed to fetch call target:', err);
        startCall(callUserId);
      }
      setSearchParams({}, { replace: true });
    };
    process();
  }, [searchParams, startCall, setSearchParams, user]);

  const value = useMemo(() => ({
    webrtc,
    localStream: webrtc.localStream,
    activeCall,
    setActiveCall,
    showCallModal,
    setShowCallModal,
    incomingCall,
    setIncomingCall,
    startCall,
    cancelCall: webrtc.cancelCall,
    missCall: webrtc.missCall,
  }), [webrtc, webrtc.localStream, activeCall, showCallModal, incomingCall, startCall, webrtc.cancelCall, webrtc.missCall]);

  return (
    <CallProvider value={value}>
      {children}
      {showCallModal && activeCall && <CallModal call={activeCall} />}
      {incomingCall && (
        <IncomingCallModal
          call={incomingCall}
          onAccept={async () => {
            const result = await webrtcRef.current.acceptCall(incomingCall.call._id, incomingCall.roomId);
            if (result.success) {
              setActiveCall(incomingCall.call);
              setShowCallModal(true);
            }
            setIncomingCall(null);
          }}
          onReject={() => {
            webrtc.rejectCall(incomingCall.call._id);
            setIncomingCall(null);
          }}
          onMissed={() => {
            webrtc.missCall(incomingCall.call._id);
            setIncomingCall(null);
          }}
        />
      )}
    </CallProvider>
  );
};

export default CallManager;
