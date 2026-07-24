import { useState, useCallback, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../hooks/useChat';
import { useNotifications } from '../hooks/useNotifications';
import Sidebar from '../components/layout/Sidebar';
import ChatArea from '../components/chat/ChatArea';
import UserChatNavbar from '../components/chat/UserChatNavbar';
import UserChatDrawer from '../components/chat/UserChatDrawer';
import toast from 'react-hot-toast';
import { chatAPI } from '../services/api';

const Chat = ({ className = 'h-screen flex overflow-hidden bg-gray-50 dark:bg-surface-dark' }) => {
  const { user } = useAuth();
  const { on, socketVersion } = useSocket();
  const chat = useChat();
  const { notifyMessage } = useNotifications();
  const navigate = useNavigate();
  const [activeConversation, setActiveConversation] = useState(null);
  const [showMobileSidebar, setShowMobileSidebar] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const urlActionRef = useRef(false);

  // User chat layout (userchat.php style)
  const [showUserDrawer, setShowUserDrawer] = useState(false);
  const [wallet, setWallet] = useState({ balance: user?.walletBalance || 0 });
  const [showAddMoney, setShowAddMoney] = useState(false);
  const [addAmount, setAddAmount] = useState(100);
  const [addingMoney, setAddingMoney] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const isUser = user?.role === 'user';

  useEffect(() => {
    chat.loadConversations();
  }, []);

  // Fetch wallet for user chat layout
  useEffect(() => {
    if (!isUser) return;
    let cancelled = false;
    const fetchWallet = async () => {
      try {
        const res = await userAPI.getWallet();
        if (!cancelled) setWallet(res.data?.data || { balance: 0 });
      } catch (error) {
        console.error('Failed to fetch wallet:', error);
      }
    };
    fetchWallet();
    return () => { cancelled = true; };
  }, [isUser, user?.walletBalance]);

  const handleAddMoney = async () => {
    if (!addAmount || addAmount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    setAddingMoney(true);
    try {
      const res = await userAPI.addMoney(addAmount);
      setWallet(res.data?.data || { balance: 0 });
      toast.success('Money added to wallet');
      setShowAddMoney(false);
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to add money');
    } finally {
      setAddingMoney(false);
    }
  };

  // Message listeners
  useEffect(() => {
    const handleNewMessage = (message) => {
      const conversationId = message.conversation;
      chat.addMessage(conversationId, message);

      // Update conversation list so new messages appear in real-time
      chat.setConversations((prev) => {
        const existing = prev.find((c) => c._id === conversationId);
        if (!existing) return prev;
        const isFromOther = String(message.sender?._id || message.sender) !== String(user?._id);
        const isActive = String(activeConversation?._id) === String(conversationId);
        const updated = { ...existing, lastMessage: message, updatedAt: message.createdAt };
        if (isFromOther && !isActive) {
          updated.unreadCount = (existing.unreadCount || 0) + 1;
        }
        return prev
          .map((c) => (c._id === conversationId ? updated : c))
          .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
      });

      if (message.sender?._id !== user?._id) {
        notifyMessage(
          message.sender?.displayName || message.sender?.username || 'New message',
          message
        );
        // Show toast if message is from a different conversation than the active one
        if (activeConversation && String(message.conversation) !== String(activeConversation._id)) {
          toast(
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <i className="bi bi-chat-dots" style={{ fontSize: '1.2rem', color: '#3b82f6' }} />
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{message.sender?.displayName || 'New message'}</div>
                <div style={{ fontSize: '0.8rem', color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '200px', whiteSpace: 'nowrap' }}>
                  {message.content || (message.type === 'file' ? '📎 Sent a file' : '')}
                </div>
              </div>
            </div>,
            { duration: 4000, position: 'top-right', style: { background: '#fff', color: '#0f172a', borderRadius: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', padding: '12px 16px' } }
          );
        }
        // Play notification beep for incoming messages while chatting
        try {
          const ctx = new (window.AudioContext || window.webkitAudioContext)();
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.frequency.value = 600;
          gain.gain.value = 0.15;
          osc.start();
          osc.stop(ctx.currentTime + 0.1);
        } catch {}
      }
    };

    const cleanupMessage = on('message:new', handleNewMessage);

    const handleStatusChange = (data) => {
      chat.updateMessage(data.conversation || activeConversation?._id, data.messageId, {
        status: data.status,
      });
    };

    const cleanupStatus = on('message:status', handleStatusChange);

    const handleReaction = (data) => {
      chat.updateMessage(data.conversation || activeConversation?._id, data.messageId, {
        reactions: data.reactions,
      });
    };

    const cleanupReaction = on('message:reaction:updated', handleReaction);

    const handleEdit = (data) => {
      chat.updateMessage(data.conversation || activeConversation?._id, data.messageId, {
        content: data.content,
        isEdited: data.isEdited,
        editedAt: data.editedAt,
      });
    };

    const cleanupEdit = on('message:edited', handleEdit);

    const handleDelete = (data) => {
      if (data.forEveryone) {
        chat.updateMessage(data.conversation || activeConversation?._id, data.messageId, {
          isDeleted: true,
          content: 'This message was deleted',
        });
      }
    };

    const cleanupDelete = on('message:deleted', handleDelete);

    const handleRead = (data) => {
      const msgs = chat.messages[data.conversationId] || [];
      msgs.forEach((msg) => {
        if (msg.sender?._id === user?._id) {
          chat.updateMessage(data.conversationId, msg._id, { status: 'seen' });
        }
      });
    };

    const cleanupRead = on('messages:read', handleRead);

    return () => {
      cleanupMessage();
      cleanupStatus();
      cleanupReaction();
      cleanupEdit();
      cleanupDelete();
      cleanupRead();
    };
  }, [user, on, notifyMessage, chat, activeConversation, socketVersion]);

  const handleSelectConversation = useCallback((conv) => {
    setActiveConversation(conv);
    setShowMobileSidebar(false);
    chat.loadMessages(conv._id, true);
  }, [chat.loadMessages]);

  const handleBackToSidebar = useCallback(() => {
    setShowMobileSidebar(true);
  }, []);

  const openConversation = useCallback(async (targetId) => {
    try {
      const res = await chatAPI.getOrCreateConversation(targetId);
      const conversation = res.data?.data;
      if (!conversation) return null;

      chat.setConversations((prev) => {
        const exists = prev.find((c) => c._id === conversation._id);
        if (exists) return prev;
        return [conversation, ...prev];
      });
      setActiveConversation(conversation);
      setShowMobileSidebar(false);
      chat.loadMessages(conversation._id, true);
      return conversation;
    } catch (error) {
      console.error('Failed to open conversation from URL:', error);
      toast.error('Could not open conversation');
      return null;
    }
  }, [chat, setActiveConversation, setShowMobileSidebar]);

  // Open chat when the user arrives with ?userId=...
  useEffect(() => {
    const userId = searchParams.get('userId');
    if (!userId) return;
    if (urlActionRef.current) return;
    urlActionRef.current = true;

    const process = async () => {
      await openConversation(userId);
      setSearchParams({}, { replace: true });
    };

    process();
  }, [searchParams, openConversation, setSearchParams]);

  const renderWelcome = () => (
    <div className="flex-1 flex items-center justify-center">
      <div className="text-center">
        <div className="w-24 h-24 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-12 h-12 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Welcome to VoiceCall
        </h2>
        <p className="text-gray-500 dark:text-gray-400 max-w-sm">
          {isUser ? 'Open the menu to see your chats or start a chat from Consultants' : 'Select a conversation or search for users to start chatting'}
        </p>
      </div>
    </div>
  );

  return (
    <>
      {isUser ? (
        <div className="h-screen flex flex-col bg-gray-100 dark:bg-gray-900 overflow-hidden">
          <UserChatNavbar
            user={user}
            walletBalance={wallet.balance}
            onAddMoney={() => setShowAddMoney(true)}
            onToggleDrawer={() => setShowUserDrawer(true)}
            searchValue={userSearch}
            onSearch={setUserSearch}
          />

          <div className="flex-1 flex overflow-hidden relative">
            <UserChatDrawer
              isOpen={showUserDrawer}
              onClose={() => setShowUserDrawer(false)}
            >
              <Sidebar
                activeConversation={activeConversation}
                onSelectConversation={(conv) => {
                  handleSelectConversation(conv);
                  setShowUserDrawer(false);
                }}
                chat={chat}
              />
            </UserChatDrawer>

            {activeConversation ? (
              <div className="flex-1 p-4 overflow-hidden">
                <ChatArea
                  conversation={activeConversation}
                  chat={chat}
                  onBack={() => setShowUserDrawer(true)}
                  onEndChat={() => navigate('/consultants')}
                />
              </div>
            ) : (
              renderWelcome()
            )}
          </div>

          {showAddMoney && (
            <div
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
              onClick={() => setShowAddMoney(false)}
            >
              <div
                className="bg-white dark:bg-surface-dark rounded-lg p-6 w-80 shadow-xl"
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Recharge Wallet</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                  Current balance: <span className="font-semibold">₹{wallet.balance}</span>
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
                  className="w-full mt-2 py-2 px-4 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

        </div>
      ) : (
        <div className={className}>
          <div className={`${showMobileSidebar ? 'flex' : 'hidden'} md:flex w-full md:w-96 lg:w-[420px] flex-shrink-0 border-r border-gray-200 dark:border-gray-700`}>
            <Sidebar
              activeConversation={activeConversation}
              onSelectConversation={handleSelectConversation}
              chat={chat}
            />
          </div>

          <div className={`${!showMobileSidebar ? 'flex' : 'hidden'} md:flex flex-1 flex-col`}>
            {activeConversation ? (
              <ChatArea
                conversation={activeConversation}
                chat={chat}
                onBack={handleBackToSidebar}
              />
            ) : (
              renderWelcome()
            )}
          </div>

        </div>
      )}
    </>
  );
};

export default Chat;
