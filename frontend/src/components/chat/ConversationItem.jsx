import Avatar from '../common/Avatar';
import { getDisplayName, formatMessageTime, formatLastSeen } from '../../utils/helpers';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { useCall } from '../../context/CallContext';
import { HiPhone, HiXMark, HiCheckBadge, HiCheck, HiPhoto } from 'react-icons/hi2';
import { useState } from 'react';

const ConversationItem = ({ conversation, isActive, onSelect }) => {
  const { user } = useAuth();
  const { isUserOnline } = useSocket();
  const { startCall } = useCall();

  const otherParticipant = conversation.otherParticipant || conversation.participants?.find(
    (p) => p._id !== user?._id
  );

  const online = otherParticipant && isUserOnline(otherParticipant._id);
  const unread = conversation.unreadCount || 0;
  const lastMessage = conversation.lastMessage;
  const lastMsgText = lastMessage?.isDeleted
    ? 'Message deleted'
    : lastMessage?.isSystemMessage
    ? lastMessage?.content
    : lastMessage?.type === 'file'
    ? `📎 ${lastMessage?.fileName || 'File'}`
    : lastMessage?.content || '';

  const statusIcon = () => {
    if (lastMessage?.status === 'seen') return <HiCheckBadge className="w-3.5 h-3.5 text-blue-400" />;
    if (lastMessage?.status === 'delivered') return <HiCheck className="w-3.5 h-3.5 text-gray-400" />;
    return null;
  };

  return (
    <div
      onClick={() => onSelect(conversation)}
      className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors relative
        ${isActive
          ? 'bg-primary-50 dark:bg-primary-900/20 border-l-4 border-primary-600'
          : 'hover:bg-gray-50 dark:hover:bg-gray-800/50 border-l-4 border-transparent'
        }`}
    >
      <div className="relative flex-shrink-0">
        <Avatar user={otherParticipant} showStatus size="md" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <h3 className={`font-medium text-sm truncate ${isActive ? 'text-primary-900 dark:text-primary-100' : 'text-gray-900 dark:text-white'}`}>
            {getDisplayName(otherParticipant)}
          </h3>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {lastMessage && (
              <span className="text-[10px] text-gray-400 dark:text-gray-500">
                {formatMessageTime(lastMessage.createdAt)}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between mt-0.5">
          <div className="flex items-center gap-1 min-w-0">
            {lastMessage?.sender?._id === user?._id && statusIcon()}
            <p className={`text-xs truncate ${lastMessage?.sender?._id === user?._id ? 'text-gray-500 dark:text-gray-400' : 'text-gray-400 dark:text-gray-500'}`}>
              {lastMsgText}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0 ml-2">
            {online && (
              <button
                onClick={(e) => { e.stopPropagation(); startCall(otherParticipant?._id, 'audio'); }}
                className="p-1 rounded-full bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 hover:bg-primary-100 dark:hover:bg-primary-900/50 transition-colors"
                title="Call"
              >
                <HiPhone className="w-3.5 h-3.5" />
              </button>
            )}
            {unread > 0 && (
              <span className="min-w-[18px] h-[18px] flex items-center justify-center bg-primary-600 text-white text-[10px] font-bold rounded-full px-1">
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
