import { useState, useEffect, useRef, useCallback, Fragment } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { useCall } from '../../context/CallContext';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';
import TypingIndicator from './TypingIndicator';
import Avatar from '../common/Avatar';
import { HiArrowLeft, HiPhone, HiVideoCamera, HiEllipsisVertical, HiXMark } from 'react-icons/hi2';
import { getDisplayName, formatLastSeen, formatMessageDate } from '../../utils/helpers';
import { chatAPI, userAPI } from '../../services/api';
import toast from 'react-hot-toast';

const formatCountdown = (ms) => {
  if (ms <= 0) return '0:00';
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

const isDifferentDay = (date1, date2) => {
  if (!date1 || !date2) return false;
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  return (
    d1.getFullYear() !== d2.getFullYear() ||
    d1.getMonth() !== d2.getMonth() ||
    d1.getDate() !== d2.getDate()
  );
};

const ChatArea = ({ conversation, chat, onBack, onEndChat, onClose }) => {
  const { user } = useAuth();
  const { isUserOnline, typingUsers, emit, on } = useSocket();
  const { startCall } = useCall();
  const [showInfo, setShowInfo] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const [isNearBottom, setIsNearBottom] = useState(true);
  const [timeLeft, setTimeLeft] = useState(0);
  const [duration, setDuration] = useState(0);
  const [paying, setPaying] = useState(false);
  const [walletBalance, setWalletBalance] = useState(user?.walletBalance || 0);
  const [showAddMoney, setShowAddMoney] = useState(false);

  useEffect(() => {
    setWalletBalance(user?.walletBalance || 0);
  }, [user?.walletBalance]);

  // Update wallet balance in real-time via socket
  useEffect(() => {
    const cleanup = on('wallet:updated', (data) => {
      if (data?.balance !== undefined) setWalletBalance(data.balance);
    });
    return cleanup;
  }, [on]);
  const [addAmount, setAddAmount] = useState(100);
  const [addingMoney, setAddingMoney] = useState(false);

  const liveConversation = chat.conversations.find((c) => c._id === conversation?._id) || conversation;
  const otherParticipant = liveConversation?.participants?.find(
    (p) => String(p._id) !== String(user?._id)
  ) || liveConversation?.otherParticipant;

  const messages = chat.messages[conversation?._id] || [];
  const isTyping = typingUsers[conversation?._id] === otherParticipant?._id;
  const online = otherParticipant && isUserOnline(otherParticipant._id);

  const isUser = user?.role === 'user';
  const lockedToAgent = liveConversation?.lockedToAgent?._id || liveConversation?.lockedToAgent;
  const isConsultation = lockedToAgent && otherParticipant?._id?.toString() === lockedToAgent.toString();
  const freeUntil = liveConversation?.freeUntil ? new Date(liveConversation.freeUntil) : null;
  // Agent is the locked agent: the current user IS the lockedToAgent (conversation is locked to them)
  const isAgentLocked = lockedToAgent && freeUntil && user?._id?.toString() === lockedToAgent?.toString();
  const isFreeExpired = freeUntil && new Date() > freeUntil;
  const isPaid = liveConversation?.isPaid;
  const isLockedUser = isUser && isConsultation && user?._id !== lockedToAgent?.toString();
  const isUserConsultation = isConsultation && user?._id !== lockedToAgent?.toString();
  const canUserReply = !isLockedUser || isPaid || !isFreeExpired;
  const paymentAmount = liveConversation?.paymentAmount || 100;

  useEffect(() => {
    if (!freeUntil) return;
    const update = () => setTimeLeft(Math.max(0, freeUntil - new Date()));
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [freeUntil]);

  // Duration timer for user chat (avisaexperts style)
  useEffect(() => {
    if (!isUser) return;
    const start = conversation?.createdAt ? new Date(conversation.createdAt) : new Date();
    const update = () => setDuration(Math.max(0, Math.floor((new Date() - start) / 1000)));
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [isUser, conversation?.createdAt]);

  const formatDuration = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Fetch wallet balance when payment may be needed
  useEffect(() => {
    if (!isLockedUser || isPaid) return;
    let cancelled = false;
    const fetchWallet = async () => {
      try {
        const res = await userAPI.getWallet();
        if (!cancelled) setWalletBalance(res.data?.data?.balance || 0);
      } catch (error) {
        console.error('Failed to fetch wallet:', error);
      }
    };
    fetchWallet();
    return () => { cancelled = true; };
  }, [isLockedUser, isPaid]);

  const handleAddMoney = useCallback(async () => {
    if (!addAmount || addAmount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    setAddingMoney(true);
    try {
      const res = await userAPI.addMoney(addAmount);
      setWalletBalance(res.data?.data?.balance || 0);
      toast.success('Money added to wallet');
      setShowAddMoney(false);
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to add money');
    } finally {
      setAddingMoney(false);
    }
  }, [addAmount]);

  const handlePay = useCallback(async () => {
    if (!conversation?._id) return;
    setPaying(true);
    try {
      const res = await chatAPI.payForConversation(conversation._id);
      const updated = res.data?.data || { isPaid: true, freeUntil: null };
      chat.setConversations((prev) =>
        prev.map((c) => (c._id === conversation._id ? { ...c, ...updated } : c))
      );
      if (updated.walletBalance !== undefined) setWalletBalance(updated.walletBalance);
      toast.success('Payment successful! You can continue chatting.');
    } catch (error) {
      const message = error?.response?.data?.message || 'Payment failed. Please try again.';
      if (error?.response?.status === 402) {
        setShowAddMoney(true);
      }
      toast.error(message);
    } finally {
      setPaying(false);
    }
  }, [conversation?._id, chat.setConversations]);

  const handleReset = useCallback(async () => {
    if (!conversation?._id) return;
    try {
      const res = await chatAPI.resetConversation(conversation._id);
      const updated = res.data?.data || { isPaid: false };
      chat.setConversations((prev) =>
        prev.map((c) => (c._id === conversation._id ? { ...c, ...updated } : c))
      );
      toast.success('Chat reset to free mode (10 min).');
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to reset chat');
    }
  }, [conversation?._id, chat.setConversations]);

  const handleSetTimer = useCallback(async (seconds) => {
    if (!conversation?._id) return;
    try {
      const res = await chatAPI.resetConversation(conversation._id, seconds);
      const updated = res.data?.data || { isPaid: false };
      chat.setConversations((prev) =>
        prev.map((c) => (c._id === conversation._id ? { ...c, ...updated } : c))
      );
      toast.success(seconds === 0 ? 'Free chat ended.' : `Timer set to ${seconds}s.`);
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to set timer');
    }
  }, [conversation?._id, chat.setConversations]);

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

  // Send time-based greeting when the user opens a chat with no messages
  const greetingRequestedRef = useRef(false);
  useEffect(() => {
    if (!conversation?._id || !isUser) return;
    const messages = chat.messages[conversation._id] || [];
    if (chat.loadingMessages || greetingRequestedRef.current) return;
    if (messages.length > 0) return;

    greetingRequestedRef.current = true;
    chatAPI.sendGreeting(conversation._id)
      .then((res) => {
        const greeting = res.data?.data?.greeting;
        if (greeting) {
          chat.addMessage(conversation._id, greeting);
        }
      })
      .catch(() => {
        greetingRequestedRef.current = false;
      });
  }, [conversation?._id, isUser, chat.messages, chat.loadingMessages, chat.addMessage]);

  // Auto mark incoming messages as delivered/seen in real-time
  const deliveredRef = useRef(new Set());
  useEffect(() => {
    deliveredRef.current.clear();
  }, [conversation?._id]);

  useEffect(() => {
    if (!conversation?._id || !messages.length || !user?._id) return;

    const unreadFromOther = messages.filter(
      (msg) =>
        String(msg.sender?._id || msg.sender) !== String(user._id) &&
        msg.status === 'sent' &&
        !deliveredRef.current.has(msg._id)
    );

    if (unreadFromOther.length === 0) return;

    const messageIds = unreadFromOther.map((msg) => msg._id);
    messageIds.forEach((id) => deliveredRef.current.add(id));

    // Mark as delivered
    emit('message:delivered', { messageIds });

    // If the chat is active and visible, also mark as seen
    if (document.visibilityState === 'visible') {
      emit('message:seen', { conversationId: conversation._id });
      chatAPI.markConversationRead(conversation._id).catch(() => {});
    }
  }, [conversation?._id, messages, user?._id, emit]);

  // Mark messages as seen when the tab becomes visible
  useEffect(() => {
    if (!conversation?._id) return;
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        emit('message:seen', { conversationId: conversation._id });
        chatAPI.markConversationRead(conversation._id).catch(() => {});
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
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
    <div className={`flex flex-col h-full bg-white overflow-hidden ${
      isUser
        ? 'rounded-xl shadow-lg border border-gray-200 md:max-w-5xl md:mx-auto md:w-full'
        : ''
    }`}>
      {/* Header */}
      {isUser ? (
        <div className="flex items-center justify-between px-4 py-3 bg-[#001E74] text-white shadow-md">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={onBack}
              className="md:hidden p-1.5 hover:bg-white/20 rounded-full transition flex-shrink-0"
              title="Back"
            >
              <HiArrowLeft className="w-5 h-5" />
            </button>
            <Link to={`/user/${otherParticipant?._id}`} title="View profile" className="cursor-pointer">
              <Avatar user={otherParticipant} showStatus size="md" className="ring-2 ring-white/80 rounded-full" />
            </Link>
            <div className="min-w-0">
              <Link to={`/user/${otherParticipant?._id}`} title="View profile" className="font-semibold text-white truncate hover:underline block">
                {getDisplayName(otherParticipant)}
              </Link>
              <span className="text-xs text-white/80">
                {isUserConsultation
                  ? isPaid
                    ? 'Paid consultation'
                    : isFreeExpired
                    ? 'Free chat ended'
                    : `Free chat ends in ${formatCountdown(timeLeft)}`
                  : formatDuration(duration)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={onEndChat}
              className={`text-xs px-2.5 py-1 rounded-full font-medium transition ${
                online ? 'bg-green-500 text-white hover:bg-green-600' : 'bg-white text-red-600 hover:bg-gray-100'
              }`}
            >
              {online ? 'Online' : 'End Chat'}
            </button>
            <button
              onClick={() => startCall(otherParticipant?._id, otherParticipant, 'audio')}
              className="p-2 rounded-full hover:bg-white/20 transition"
              title="Voice call"
            >
              <HiPhone className="w-5 h-5" />
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-white/20 transition"
                title="Close chat"
              >
                <HiXMark className="w-5 h-5" />
              </button>
            )}
            <button
              onClick={() => setShowInfo(!showInfo)}
              className="p-2 rounded-full hover:bg-white/20 transition"
              title="More"
            >
              <HiEllipsisVertical className="w-5 h-5" />
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-100 bg-white/95 backdrop-blur sticky top-0 z-10">
          <div className="flex items-center gap-3 min-w-0">
            <button onClick={onBack} className="md:hidden btn-ghost p-1.5">
              <HiArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3 min-w-0 cursor-pointer" onClick={() => setShowInfo(true)}>
              <Link to={`/user/${otherParticipant?._id}`} title="View profile" onClick={(e) => e.stopPropagation()}>
                <Avatar user={otherParticipant} showStatus size="md" />
              </Link>
              <div className="min-w-0">
                <Link
                  to={`/user/${otherParticipant?._id}`}
                  title="View profile"
                  onClick={(e) => e.stopPropagation()}
                  className="font-semibold text-[15px] text-gray-900 truncate leading-tight hover:underline block"
                >
                  {getDisplayName(otherParticipant)}
                </Link>
                <p className="text-[12px] text-gray-500 truncate">
                  {online ? (
                    <span className="flex items-center gap-1"><span className="w-2 h-2 bg-green-500 rounded-full inline-block"></span>Online</span>
                  ) : otherParticipant?.lastSeen ? `Last seen ${formatLastSeen(otherParticipant.lastSeen)}` : 'Offline'}
                </p>
                {isAgentLocked && !isPaid && (
                  <p className="text-[11px] font-medium truncate mt-0.5">
                    {isFreeExpired ? (
                      <span className="text-red-500">⚠ Free chat expired</span>
                    ) : (
                      <span className="text-orange-500">⏱ Free chat: {formatCountdown(timeLeft)}</span>
                    )}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-0.5">
            <button
              onClick={() => startCall(otherParticipant?._id, otherParticipant, 'audio')}
              className="p-2 rounded-full text-gray-500 hover:text-primary-600 hover:bg-gray-100 transition-colors"
              title="Voice call"
            >
              <HiPhone className="w-5 h-5" />
            </button>
            <button
              onClick={() => setShowInfo(!showInfo)}
              className="p-2 rounded-full text-gray-500 hover:bg-gray-100 transition-colors"
              title="More"
            >
              <HiEllipsisVertical className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Info Panel */}
      {showInfo && (
        <div className="border-b border-gray-100 bg-gray-50 p-4 animate-slide-down">
          <div className="flex justify-between items-start mb-4">
            <div className="text-center flex-1">
              <Avatar user={otherParticipant} size="xl" showStatus className="mb-2" />
              <h3 className="font-semibold text-gray-900">{getDisplayName(otherParticipant)}</h3>
              <p className="text-sm text-gray-500">@{otherParticipant?.username}</p>
              {otherParticipant?.bio && <p className="text-sm text-gray-600 mt-1">{otherParticipant.bio}</p>}
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

      {/* Consultation status banner - visible to both user and agent */}
      {(isConsultation || isAgentLocked) && (
        <div className="px-4 py-2 bg-orange-50 border-b border-orange-100 text-center">
          {isPaid ? (
            <div className="flex flex-col items-center gap-1">
              <span className="text-sm font-medium text-green-700">
                Paid consultation - unlimited chat
              </span>
              <button
                onClick={handleReset}
                className="text-xs text-orange-600 hover:underline"
              >
                Reset to free chat (test)
              </button>
            </div>
          ) : isFreeExpired ? (
            <div className="flex flex-col items-center gap-1">
              <span className="text-sm font-medium text-red-700">
                Free chat has ended
              </span>
              {isLockedUser && (
                <>
                  <span className="text-xs text-gray-600">
                    Pay ₹{paymentAmount} to continue chatting with {getDisplayName(otherParticipant)}
                  </span>
                  <div className="flex gap-2 mt-1 justify-center">
                    <button onClick={() => handleSetTimer(90)} className="text-xs px-2 py-1 bg-orange-200 text-orange-800 rounded hover:bg-orange-300">
                      Set 1:30
                    </button>
                    <button onClick={() => handleSetTimer(0)} className="text-xs px-2 py-1 bg-red-200 text-red-800 rounded hover:bg-red-300">
                      End Free Chat
                    </button>
                  </div>
                </>
              )}
              {!isLockedUser && (
                <span className="text-xs text-gray-500">Wait for the user to continue.</span>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1">
              <span className="text-sm font-medium text-orange-700">
                Free chat ends in {formatCountdown(timeLeft)}
              </span>
              {isLockedUser && (
                <div className="flex gap-2 mt-1 justify-center">
                  <button onClick={() => handleSetTimer(90)} className="text-xs px-2 py-1 bg-orange-200 text-orange-800 rounded hover:bg-orange-300">
                    Set 1:30
                  </button>
                  <button onClick={() => handleSetTimer(0)} className="text-xs px-2 py-1 bg-red-200 text-red-800 rounded hover:bg-red-300">
                    End Free Chat
                  </button>
                  <button onClick={handleReset} className="text-xs px-2 py-1 bg-green-200 text-green-800 rounded hover:bg-green-300">
                    Reset 10 min
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Messages */}
      <div
        ref={messagesContainerRef}
        onScroll={handleScroll}
        className={`flex-1 overflow-y-auto px-4 py-3 space-y-2 ${
          isUser ? 'bg-blue-50/50' : 'bg-[#f0f2f5]'
        }`}
        style={
          isUser
            ? {
                backgroundImage: 'url("https://res.cloudinary.com/dtjgawrwz/image/upload/v1735983673/allvisaimages/r1nlhta7wfvinjxv92mq.png")',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }
            : undefined
        }
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

        {messages.map((msg, index) => {
          const showDateSeparator = index === 0 || isDifferentDay(messages[index - 1].createdAt, msg.createdAt);
          return (
            <Fragment key={msg._id}>
              {showDateSeparator && (
                <div className="flex justify-center my-3">
                  <div className="px-4 py-1 text-xs font-medium text-gray-500 bg-gray-200/60 rounded-lg shadow-sm">
                    {formatMessageDate(msg.createdAt)}
                  </div>
                </div>
              )}
              <MessageBubble
                message={msg}
                isOwn={msg.sender?._id === user?._id || msg.sender === user?._id}
                variant={isUser ? 'user' : 'default'}
                onDelete={(deleteForEveryone) => handleDeleteMessage(msg._id, deleteForEveryone)}
                onReaction={(emoji) => handleReaction(msg._id, emoji)}
                onEdit={(newContent) => handleEditMessage(msg._id, newContent)}
                onReply={() => setReplyingTo(msg)}
              />
            </Fragment>
          );
        })}

        {isTyping && (
          <div className="flex justify-start">
            <TypingIndicator variant={isUser ? 'user' : 'default'} />
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input / Payment */}
      {!canUserReply ? (
        <div className="p-4 bg-white border-t border-gray-100 text-center">
          <p className="text-sm font-medium text-gray-900 mb-1">
            Free chat has ended
          </p>
          <p className="text-sm text-gray-600 mb-3">
            Wallet balance: <span className="font-semibold text-gray-900">₹{walletBalance}</span>
          </p>

          {(() => {
            const canExtend = walletBalance >= paymentAmount;
            const canCall = otherParticipant?.callRate > 0 && walletBalance >= otherParticipant.callRate;
            if (!canExtend && !canCall) {
              return (
                <>
                  <p className="text-sm text-red-600 mb-2">
                    Insufficient balance. Add money to continue.
                  </p>
                  <button
                    onClick={() => setShowAddMoney(true)}
                    className="w-full py-3 px-4 rounded-lg bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold shadow-md transition"
                  >
                    Add Money
                  </button>
                </>
              );
            }
            return (
              <div className="flex flex-col gap-2">
                {canExtend && (
                  <button
                    onClick={handlePay}
                    disabled={paying}
                    className="w-full py-3 px-4 rounded-lg bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold shadow-md disabled:opacity-60 disabled:cursor-not-allowed transition"
                  >
                    {paying ? 'Processing payment...' : `Extend chat for ₹${paymentAmount}`}
                  </button>
                )}
                {canCall && (
                  <button
                    onClick={() => startCall(otherParticipant._id, otherParticipant, 'audio')}
                    className="w-full py-3 px-4 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-semibold shadow-md transition"
                  >
                    Start voice call ₹{otherParticipant.callRate}/min
                  </button>
                )}
              </div>
            );
          })()}

          {showAddMoney && (
            <div
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
              onClick={() => setShowAddMoney(false)}
            >
              <div
                className="bg-white rounded-lg p-6 w-80 shadow-xl"
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Recharge Wallet</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Current balance: <span className="font-semibold">₹{walletBalance}</span>
                </p>
                <input
                  type="number"
                  min="10"
                  value={addAmount}
                  onChange={(e) => setAddAmount(Number(e.target.value))}
                  className="input-field mb-3"
                  placeholder="Enter amount"
                />
                <button
                  onClick={handleAddMoney}
                  disabled={addingMoney || addAmount <= 0}
                  className="w-full py-2.5 px-4 rounded-lg bg-primary-600 hover:bg-primary-700 text-white font-semibold disabled:opacity-60 disabled:cursor-not-allowed transition"
                >
                  {addingMoney ? 'Adding...' : `Add ₹${addAmount}`}
                </button>
                <button
                  onClick={() => setShowAddMoney(false)}
                  className="w-full mt-2 py-2 px-4 rounded-lg text-gray-600 hover:bg-gray-100 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <MessageInput
          conversation={conversation}
          chat={chat}
          replyingTo={replyingTo}
          onCancelReply={() => setReplyingTo(null)}
          recipientId={otherParticipant?._id}
          variant={isUser ? 'user' : 'default'}
        />
      )}
    </div>
  );
};

export default ChatArea;
