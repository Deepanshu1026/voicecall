import { useState, useEffect } from 'react';
import Avatar from '../common/Avatar';
import { getDisplayName } from '../../utils/helpers';
import { HiPhone, HiPhoneXMark } from 'react-icons/hi2';

const IncomingCallModal = ({ call, onAccept, onReject, onMissed }) => {
  const [timeout, setTimeoutState] = useState(30);
  const caller = call?.caller || {};
  const callType = call?.call?.type || 'audio';

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeoutState((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onMissed?.() || onReject();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [onReject, onMissed]);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 animate-fade-in">
      <div className="w-full sm:max-w-sm bg-gray-900 sm:rounded-2xl rounded-t-2xl p-6 animate-slide-up">
        <div className="text-center mb-6">
          <Avatar user={caller} size="xl" className="mx-auto mb-4 animate-call-incoming" />
          <h2 className="text-xl font-bold text-white">{getDisplayName(caller)}</h2>
          <div className="flex items-center justify-center gap-2 mt-1">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500" />
            </span>
            <p className="text-gray-400 capitalize">
              Incoming {callType} call
            </p>
          </div>
          <p className="text-gray-500 text-sm mt-2">Call will be missed in {timeout}s</p>
        </div>

        <div className="flex items-center justify-center gap-8">
          <button
            onClick={onReject}
            className="flex flex-col items-center gap-2"
          >
            <div className="w-14 h-14 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors shadow-lg shadow-red-500/30">
              <HiPhoneXMark className="w-6 h-6" />
            </div>
            <span className="text-xs text-gray-400">Decline</span>
          </button>

          <button
            onClick={onAccept}
            className="flex flex-col items-center gap-2"
          >
            <div className="w-14 h-14 rounded-full bg-green-500 text-white flex items-center justify-center hover:bg-green-600 transition-colors shadow-lg shadow-green-500/30 animate-pulse">
              <HiPhone className="w-6 h-6" />
            </div>
            <span className="text-xs text-green-400">Accept</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default IncomingCallModal;
