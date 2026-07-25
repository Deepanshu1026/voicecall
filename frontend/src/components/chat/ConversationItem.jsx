import { Link } from 'react-router-dom';
import Avatar from '../common/Avatar';
import { getDisplayName, formatMessageTime } from '../../utils/helpers';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { useCall } from '../../context/CallContext';
import { HiPhone, HiVideoCamera, HiCheckBadge, HiCheck } from 'react-icons/hi2';

const ConversationItem = ({ conversation, isActive, onSelect }) => {
  const { user } = useAuth();
  const { isUserOnline } = useSocket();
  const { startCall } = useCall();

  const otherParticipant = conversation.otherParticipant || conversation.participants?.find(
    (p) => String(p._id) !== String(user?._id)
  );

  const online = otherParticipant && isUserOnline(otherParticipant._id);
  const unread = conversation.unreadCount || 0;
  const lastMessage = conversation.lastMessage;
  const isCallMessage = lastMessage?.isSystemMessage && lastMessage?.callReference;
  const lastMsgText = lastMessage?.isDeleted
    ? 'Message deleted'
    : lastMessage?.isSystemMessage
    ? lastMessage?.content
    : lastMessage?.type === 'file'
    ? `📎 ${lastMessage?.fileName || 'File'}`
    : lastMessage?.content || '';
  const isMissedCall = isCallMessage && lastMessage?.content?.toLowerCase().includes('missed');

  const statusIcon = () => {
    if (lastMessage?.status === 'seen') return <HiCheckBadge className="w-3.5 h-3.5 text-blue-400" />;
    if (lastMessage?.status === 'delivered') return <HiCheck className="w-3.5 h-3.5 text-gray-400" />;
    return null;
  };

  return (
    <div
      onClick={() => onSelect(conversation)}
      className={`flex items-center gap-3 mx-2 my-0.5 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-150
        ${isActive
          ? 'bg-primary-50/80 shadow-sm'
          : 'hover:bg-gray-100'
        }`}
    >
      <Link
        to={`/user/${otherParticipant?._id}`}
        onClick={(e) => e.stopPropagation()}
        className="relative flex-shrink-0"
        title="View profile"
      >
        <Avatar user={otherParticipant} showStatus size="md" />
      </Link>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <Link
            to={`/user/${otherParticipant?._id}`}
            onClick={(e) => e.stopPropagation()}
            className={`font-semibold text-[14px] truncate hover:underline ${isActive ? 'text-primary-700' : 'text-gray-900'}`}
          >
            {getDisplayName(otherParticipant)}
          </Link>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {lastMessage && (
              <span className="text-[11px] text-gray-400 font-medium">
                {formatMessageTime(lastMessage.createdAt)}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between mt-0.5 gap-2">
          <div className="flex items-center gap-1 min-w-0 flex-1">
            {lastMessage?.sender?._id === user?._id && statusIcon()}
            {isCallMessage && (
              <span className="flex-shrink-0">
                {lastMessage?.content?.toLowerCase().includes('video') ? (
                  <HiVideoCamera className="w-3.5 h-3.5 text-gray-500" />
                ) : (
                  <HiPhone className={`w-3.5 h-3.5 ${isMissedCall ? 'text-red-500' : 'text-green-600'}`} />
                )}
              </span>
            )}
            <p className={`text-[13px] truncate leading-tight ${unread > 0 ? 'font-semibold text-gray-900' : 'text-gray-500'}`}>
              {lastMsgText}
            </p>
          </div>

          <div className="flex items-center gap-1.5 flex-shrink-0 ml-1">
            {online && (
              <button
                onClick={(e) => { e.stopPropagation(); startCall(otherParticipant?._id, otherParticipant, 'audio'); }}
                className="p-1 rounded-full text-green-600 hover:bg-green-50 transition-colors"
                title="Call"
              >
                <HiPhone className="w-3.5 h-3.5" />
              </button>
            )}
            {unread > 0 && (
              <span className="min-w-[20px] h-[20px] flex items-center justify-center bg-primary-600 text-white text-[11px] font-bold rounded-full px-1.5 shadow-sm">
                {unread > 99 ? '99+' : unread}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConversationItem;
