import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { useCall } from '../../context/CallContext';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';
import TypingIndicator from './TypingIndicator';
import Avatar from '../common/Avatar';
import { HiArrowLeft, HiPhone, HiVideoCamera, HiEllipsisVertical, HiXMark } from 'react-icons/hi2';
import { getDisplayName, formatLastSeen } from '../../utils/helpers';
import { chatAPI } from '../../services/api';
import toast from 'react-hot-toast';

const ChatArea = ({ conversation, chat, onBack }) => {
  const { user } = useAuth();
  const { isUserOnline, typingUsers, emit, on } = useSocket();
  const { startCall } = useCall();
  const [showInfo, setShowInfo] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const [isNearBottom, setIsNearBottom] = useState(true);

  const otherParticipant = conversation?.participants?.find(
    (p) => p._id !== user?._id
  ) || conversation?.otherParticipant;

  const messages = chat.messages[conversation?._id] || [];
  const isTyping = typingUsers[conversation?._id] === otherParticipant?._id;
  const online = otherParticipant && isUserOnline(otherParticipant._id);

  const scrollToBottom = useCallback((smooth = false) => {
    messagesEndRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' });
  }, []);

  useEffect(() => {
    if (isNearBottom) scrollToBottom();
  }, [messages, isTyping, isNearBottom, scrollToBottom]);

  useEffect(() => {
    scrollToBottom();
    setTimeout(() => scrollToBottom(), 100);
  }, [conversation?._id, scrollToBottom]);

  const handleScroll = useCallback(() => {
    const container = messagesContainerRef.current;
    if (!container) return;
    const { scrollTop, scrollHeight, clientHeight } = container;
    setIsNearBottom(scrollHeight - scrollTop - clientHeight < 100);

    if (scrollTop < 50 && chat.hasMore[conversation?._id]) {
      chat.loadMessages(conversation._id);
    }
  }, [conversation?._id, chat]);

  useEffect(() => {
    if (conversation?._id) {
      emit('message:seen', { conversationId: conversation._id });
      chatAPI.markConversationRead(conversation._id).catch(() => {});
    }
  }, [conversation?._id, emit]);

  const handleDeleteMessage = async (messageId, deleteForEveryone) => {
    try {
      await chatAPI.deleteMessage(messageId, deleteForEveryone);
      chat.updateMessage(conversation._id, messageId, deleteForEveryone
        ? { isDeleted: true, content: 'This message was deleted' }
        : { deletedFor: [...(messages.find(m => m._id === messageId)?.deletedFor || []), user._id] }
      );
    } catch {
      toast.error('Failed to delete message');
    }
  };

  const handleReaction = async (messageId, emoji) => {
    try {
      const res = await chatAPI.addReaction(messageId, emoji);
      chat.updateMessage(conversation._id, messageId, { reactions: res.data.data });
    } catch {
      toast.error('Failed to add reaction');
    }
  };

  const handleEditMessage = async (messageId, newContent) => {
    try {
      const res = await chatAPI.editMessage(messageId, newContent);
      chat.updateMessage(conversation._id, messageId, {
        content: newContent,
        isEdited: true,
        editedAt: res.data.data.editedAt,
      });
    } catch {
      toast.error('Failed to edit message');
    }
  };

  const handleBlockUser = async () => {
    if (!otherParticipant?._id) return;
    try {
      await chatAPI.blockUser(otherParticipant._id);
      toast.success('User blocked');
    } catch {
      toast.error('Failed to block user');
    }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-surface-dark">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-100 dark:border-gray-700 glass">
        <div className="flex items-center gap-3 min-w-0">
          <button onClick={onBack} className="md:hidden btn-ghost p-1.5">
            <HiArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3 min-w-0 cursor-pointer" onClick={() => setShowInfo(true)}>
            <Avatar user={otherParticipant} showStatus size="md" />
            <div className="min-w-0">
              <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                {getDisplayName(otherParticipant)}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {online ? 'Online' : otherParticipant?.lastSeen ? `Last seen ${formatLastSeen(otherParticipant.lastSeen)}` : 'Offline'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => startCall(otherParticipant?._id, otherParticipant, 'audio')}
            className="btn-ghost p-2 text-gray-500 hover:text-primary-600 dark:hover:text-primary-400"
            title="Voice call"
          >
            <HiPhone className="w-5 h-5" />
          </button>
          <button className="btn-ghost p-2 text-gray-500 hover:text-primary-600 dark:hover:text-primary-400" title="Video call">
            <HiVideoCamera className="w-5 h-5" />
          </button>
          <button
            onClick={() => setShowInfo(!showInfo)}
            className="btn-ghost p-2 text-gray-500"
            title="More"
          >
            <HiEllipsisVertical className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Info Panel */}
      {showInfo && (
        <div className="border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 p-4 animate-slide-down">
          <div className="flex justify-between items-start mb-4">
            <div className="text-center flex-1">
              <Avatar user={otherParticipant} size="xl" showStatus className="mb-2" />
              <h3 className="font-semibold text-gray-900 dark:text-white">{getDisplayName(otherParticipant)}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">@{otherParticipant?.username}</p>
              {otherParticipant?.bio && <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{otherParticipant.bio}</p>}
            </div>
            <button onClick={() => setShowInfo(false)} className="btn-ghost p-1">
              <HiXMark className="w-5 h-5" />
            </button>
          </div>
          <button onClick={handleBlockUser} className="btn-danger w-full text-sm">
            Block User
          </button>
        </div>
      )}

      {/* Messages */}
      <div
        ref={messagesContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-4 py-3 space-y-2 bg-[#efeae2] dark:bg-[#0a0a1a]"
      >
        {chat.loadingMessages && (
          <div className="flex justify-center py-4">
            <div className="flex space-x-1">
              <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <MessageBubble
            key={msg._id}
            message={msg}
            isOwn={msg.sender?._id === user?._id || msg.sender === user?._id}
            onDelete={(deleteForEveryone) => handleDeleteMessage(msg._id, deleteForEveryone)}
            onReaction={(emoji) => handleReaction(msg._id, emoji)}
            onEdit={(newContent) => handleEditMessage(msg._id, newContent)}
            onReply={() => setReplyingTo(msg)}
          />
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <TypingIndicator />
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <MessageInput
        conversation={conversation}
        chat={chat}
        replyingTo={replyingTo}
        onCancelReply={() => setReplyingTo(null)}
        recipientId={otherParticipant?._id}
      />
    </div>
  );
};

export default ChatArea;
