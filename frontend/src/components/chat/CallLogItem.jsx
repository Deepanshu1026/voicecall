import Avatar from '../common/Avatar';
import { getDisplayName, formatCallDuration } from '../../utils/helpers';
import { HiPhone, HiVideoCamera, HiArrowTopRightOnSquare } from 'react-icons/hi2';

const CallLogItem = ({ call, currentUserId, onCallClick }) => {
  const isOutgoing = call.caller?._id?.toString() === currentUserId?.toString();
  const otherUser = isOutgoing ? call.receiver : call.caller;
  const status = call.status;
  const isMissed = status === 'missed';
  const isRejected = status === 'rejected';
  const isVideo = call.type === 'video';

  const getStatusText = () => {
    if (isMissed) return isOutgoing ? 'No answer' : 'Missed call';
    if (isRejected) return 'Call declined';
    if (status === 'ended') {
      return call.duration > 0 ? formatCallDuration(call.duration) : 'Call ended';
    }
    return status;
  };

  const statusColor = isMissed || isRejected ? 'text-red-500' : 'text-gray-500';
  const iconColor = isMissed || isRejected ? 'text-red-500' : isVideo ? 'text-gray-500' : 'text-green-600';
  const Icon = isVideo ? HiVideoCamera : isOutgoing ? HiArrowTopRightOnSquare : HiPhone;

  return (
    <div className="flex items-center gap-3 mx-2 my-0.5 px-3 py-2.5 rounded-xl hover:bg-gray-100 cursor-pointer transition-all duration-150">
      <div className="relative flex-shrink-0">
        <Avatar user={otherUser} showStatus size="md" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-semibold text-[14px] text-gray-900 truncate">
            {getDisplayName(otherUser)}
          </h3>
          <span className="text-[11px] text-gray-400 font-medium flex-shrink-0">
            {new Date(call.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>

        <div className="flex items-center justify-between mt-0.5 gap-2">
          <div className="flex items-center gap-1 min-w-0 flex-1">
            <Icon className={`w-3.5 h-3.5 flex-shrink-0 ${iconColor}`} />
            <p className={`text-[13px] truncate leading-tight ${statusColor}`}>
              {getStatusText()}
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default CallLogItem;
