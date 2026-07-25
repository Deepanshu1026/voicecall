import { useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useCall } from '../../context/CallContext';
import Avatar from '../common/Avatar';
import { getDisplayName, formatCallDuration } from '../../utils/helpers';
import { HiMicrophone, HiSpeakerWave, HiSpeakerXMark, HiPhoneXMark } from 'react-icons/hi2';

const CallModal = ({ call }) => {
  const { user } = useAuth();
  const { setShowCallModal, setActiveCall, webrtc, localStream, cancelCall } = useCall();
  const remoteAudioRef = useRef(null);

  const isCaller = call?.caller?._id === user?._id;
  const otherParticipant = isCaller ? call?.receiver : call?.caller;
  const isRinging = webrtc.callState === 'calling' || webrtc.callState === 'connecting';

  useEffect(() => {
    if (webrtc.remoteStream && remoteAudioRef.current) {
      remoteAudioRef.current.srcObject = webrtc.remoteStream;
      remoteAudioRef.current.play().catch((err) => {
        console.log('Autoplay prevented, waiting for user interaction', err);
      });
    }
  }, [webrtc.remoteStream]);

  useEffect(() => {
    if (remoteAudioRef.current) {
      remoteAudioRef.current.volume = webrtc.isSpeakerOn ? 1 : 0.5;
    }
  }, [webrtc.isSpeakerOn]);

  const handleEndCall = () => {
    if (isRinging && isCaller) {
      cancelCall();
    } else {
      webrtc.endCall();
    }
    setActiveCall(null);
    setShowCallModal(false);
  };

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center bg-black/80 animate-fade-in">
      <audio ref={remoteAudioRef} autoPlay playsInline style={{ display: 'none' }} />
      <div className="w-full max-w-md mx-4">
        <div className="text-center mb-8">
          <Avatar user={otherParticipant} size="xl" showStatus className="mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-1">{getDisplayName(otherParticipant)}</h2>
          <p className="text-gray-400 flex items-center justify-center gap-2">
            <span className={`w-2 h-2 rounded-full animate-pulse ${webrtc.callState === 'connected' ? 'bg-green-500' : 'bg-yellow-500'}`} />
            {webrtc.callState === 'connected'
              ? formatCallDuration(webrtc.callDuration)
              : webrtc.callState === 'calling'
              ? 'Calling...'
              : 'Connecting...'}
          </p>
          <p className="text-sm text-gray-300 mt-1">
            {call?.ratePerMinute > 0 ? `₹${call.ratePerMinute}/min` : 'Free call'}
            {call?.amountCharged > 0 ? ` • Charged: ₹${call.amountCharged}` : ''}
          </p>
        </div>

        {!localStream && (
          <div className="text-center mb-4 px-4 py-2 bg-red-500/20 text-red-400 rounded-lg text-sm mx-auto max-w-xs">
            Could not access microphone
          </div>
        )}

        {webrtc.callQuality?.state && webrtc.callState === 'connected' && (
          <div className="flex justify-center mb-4">
            <div className="px-3 py-1 rounded-full text-xs flex items-center gap-1.5 bg-gray-800 text-gray-300">
              <span className={`w-2 h-2 rounded-full ${webrtc.callQuality.state === 'good' ? 'bg-green-500' : webrtc.callQuality.state === 'poor' ? 'bg-yellow-500' : 'bg-red-500'}`} />
              {webrtc.callQuality.state === 'good' ? 'Good connection' : 'Poor connection'}
            </div>
          </div>
        )}

        <div className="flex items-center justify-center gap-6">
          {!isRinging && (
            <button
              onClick={webrtc.toggleMute}
              className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-200
                ${webrtc.isMuted
                  ? 'bg-red-500 text-white'
                  : 'bg-gray-700/80 text-white hover:bg-gray-600'}`}
            >
              {webrtc.isMuted ? (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 10v2a7 7 0 01-10 5.9M5.2 7.2A4 4 0 0012 12" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3l18 18" />
                </svg>
              ) : <HiMicrophone className="w-6 h-6" />}
            </button>
          )}

          <button
            onClick={handleEndCall}
            className="w-16 h-16 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-all duration-200 animate-pulse-ring"
          >
            <HiPhoneXMark className="w-7 h-7" />
          </button>

          {!isRinging && (
            <button
              onClick={webrtc.toggleSpeaker}
              className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-200
                ${webrtc.isSpeakerOn
                  ? 'bg-gray-700/80 text-white hover:bg-gray-600'
                  : 'bg-gray-500/50 text-gray-300'}`}
            >
              {webrtc.isSpeakerOn ? <HiSpeakerWave className="w-6 h-6" /> : <HiSpeakerXMark className="w-6 h-6" />}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CallModal;
