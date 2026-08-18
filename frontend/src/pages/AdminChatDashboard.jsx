import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { adminAPI } from '../services/api';
import { formatMessageTime, getAvatarUrl } from '../utils/helpers';
import toast from 'react-hot-toast';
import {
  HiMagnifyingGlass,
  HiOutlineTrash,
  HiPencilSquare,
  HiCheck,
  HiXMark,
  HiArrowLeft,
  HiArrowDown,
  HiUsers,
  HiChatBubbleLeftRight,
} from 'react-icons/hi2';
import '../styles/adminChatDashboard.css';

const formatName = (account) => account?.displayName || account?.username || 'Unknown';
const CONV_LIMIT = 25;
const MSG_LIMIT = 30;

const isSameDay = (a, b) => {
  if (!a || !b) return false;
  const d1 = new Date(a);
  const d2 = new Date(b);
  return d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();
};

const formatDateHeader = (date) => {
  const d = new Date(date);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (isSameDay(d, today)) return 'Today';
  if (isSameDay(d, yesterday)) return 'Yesterday';
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
};

const AdminChatDashboard = () => {
  const { user, isAuthenticated } = useAuth();
  const { on } = useSocket();
  const navigate = useNavigate();

  const [conversations, setConversations] = useState([]);
  const [convPage, setConvPage] = useState(1);
  const [convHasMore, setConvHasMore] = useState(true);
  const [loadingConversations, setLoadingConversations] = useState(false);
  const [loadingMoreConversations, setLoadingMoreConversations] = useState(false);

  const [selectedId, setSelectedId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [msgPage, setMsgPage] = useState(1);
  const [msgHasMore, setMsgHasMore] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [loadingMoreMessages, setLoadingMoreMessages] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [mobileShowChat, setMobileShowChat] = useState(false);

  const [stats, setStats] = useState(null);
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const conversationsContainerRef = useRef(null);
  const searchTimeoutRef = useRef(null);

  const fetchStats = useCallback(async () => {
    try {
      const res = await adminAPI.getChatStats();
      setStats(res.data?.data || null);
    } catch (err) {
      console.error('Failed to load chat stats:', err);
    }
  }, []);

  const fetchConversations = useCallback(async (page = 1, append = false) => {
    if (page === 1) setLoadingConversations(true);
    else setLoadingMoreConversations(true);

    try {
      const res = await adminAPI.getConversations({ search, page, limit: CONV_LIMIT });
      const data = res.data?.data || [];
      const pagination = res.data?.pagination;

      setConversations((prev) => (append ? [...prev, ...data] : data));
      setConvPage(page);
      setConvHasMore(pagination ? pagination.page < pagination.pages : false);

      if (page === 1 && data.length > 0 && !selectedId) {
        setSelectedId(data[0]._id);
      }
    } catch (err) {
      console.error('Failed to load conversations:', err);
      toast.error('Failed to load conversations');
    } finally {
      setLoadingConversations(false);
      setLoadingMoreConversations(false);
    }
  }, [search, selectedId]);

  const loadMoreConversations = useCallback(() => {
    if (!loadingMoreConversations && convHasMore) {
      fetchConversations(convPage + 1, true);
    }
  }, [convHasMore, convPage, loadingMoreConversations, fetchConversations]);

  const fetchMessages = useCallback(async (conversationId, page = 1, append = false) => {
    if (!conversationId) return;
    if (page === 1) setLoadingMessages(true);
    else setLoadingMoreMessages(true);

    try {
      const res = await adminAPI.getMessages(conversationId, { page, limit: MSG_LIMIT });
      const data = res.data?.data || [];
      const pagination = res.data?.pagination;

      setMessages((prev) => {
        if (append) {
          const existingIds = new Set(prev.map((m) => m._id));
          const newMessages = data.filter((m) => !existingIds.has(m._id));
          return [...newMessages, ...prev];
        }
        return data;
      });
      setMsgPage(page);
      setMsgHasMore(pagination ? pagination.page < pagination.pages : false);
    } catch (err) {
      console.error('Failed to load messages:', err);
      toast.error('Failed to load messages');
    } finally {
      setLoadingMessages(false);
      setLoadingMoreMessages(false);
    }
  }, []);

  const loadMoreMessages = useCallback(() => {
    if (!loadingMoreMessages && msgHasMore && selectedId) {
      fetchMessages(selectedId, msgPage + 1, true);
    }
  }, [msgHasMore, msgPage, loadingMoreMessages, selectedId, fetchMessages]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => {
      fetchConversations(1, false);
    }, 300);
    return () => clearTimeout(searchTimeoutRef.current);
  }, [search, fetchConversations]);

  useEffect(() => {
    setMessages([]);
    setMsgPage(1);
    setMsgHasMore(true);
    fetchMessages(selectedId, 1, false);
  }, [selectedId, fetchMessages]);

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const nearBottom = scrollHeight - scrollTop - clientHeight < 120;
      setShowScrollButton(!nearBottom);
      if (scrollTop < 80) {
        loadMoreMessages();
      }
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, [loadMoreMessages]);

  useEffect(() => {
    const container = conversationsContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      if (scrollHeight - scrollTop - clientHeight < 120) {
        loadMoreConversations();
      }
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, [loadMoreConversations]);

  useEffect(() => {
    const handleNewMessage = (message) => {
      setMessages((prev) => {
        const exists = prev.find((m) => m._id === message._id || m._id?.toString() === message._id?.toString());
        if (exists) return prev;
        if (message.conversation?.toString() === selectedId) {
          return [...prev, message];
        }
        return prev;
      });
      setConversations((prev) => {
        const convId = message.conversation?.toString();
        const exists = prev.find((c) => c._id === convId);
        if (!exists) return prev;
        return [
          { ...exists, lastMessage: message, updatedAt: message.createdAt || new Date().toISOString() },
          ...prev.filter((c) => c._id !== convId),
        ].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
      });
    };

    const handleEdited = (data) => {
      setMessages((prev) =>
        prev.map((m) =>
          m._id === data.messageId || m._id?.toString() === data.messageId?.toString()
            ? { ...m, content: data.content, isEdited: true, editedAt: data.editedAt }
            : m
        )
      );
    };

    const handleDeleted = (data) => {
      setMessages((prev) =>
        prev.map((m) =>
          m._id === data.messageId || m._id?.toString() === data.messageId?.toString()
            ? { ...m, isDeleted: true, content: 'This message was deleted' }
            : m
        )
      );
    };

    const unsubNew = on('admin:message:new', handleNewMessage);
    const unsubEdited = on('admin:message:edited', handleEdited);
    const unsubDeleted = on('admin:message:deleted', handleDeleted);

    return () => {
      unsubNew && unsubNew();
      unsubEdited && unsubEdited();
      unsubDeleted && unsubDeleted();
    };
  }, [on, selectedId]);

  useEffect(() => {
    if (!loadingMessages && messages.length > 0) {
      scrollToBottom();
    }
  }, [loadingMessages, selectedId]);

  const handleEdit = (message) => {
    if (message.isDeleted || message.type !== 'text') return;
    setEditingId(message._id);
    setEditText(message.content);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditText('');
  };

  const handleSaveEdit = async (messageId) => {
    try {
      await adminAPI.editMessage(messageId, editText);
      toast.success('Message updated');
      setMessages((prev) =>
        prev.map((m) =>
          m._id === messageId ? { ...m, content: editText, isEdited: true, editedAt: new Date().toISOString() } : m
        )
      );
      setEditingId(null);
      setEditText('');
    } catch (err) {
      console.error('Edit failed:', err);
      toast.error('Failed to update message');
    }
  };

  const handleDelete = async (messageId) => {
    if (!window.confirm('Delete this message for everyone?')) return;
    try {
      await adminAPI.deleteMessage(messageId);
      toast.success('Message deleted');
      setMessages((prev) =>
        prev.map((m) =>
          m._id === messageId ? { ...m, isDeleted: true, content: 'This message was deleted' } : m
        )
      );
    } catch (err) {
      console.error('Delete failed:', err);
      toast.error('Failed to delete message');
    }
  };

  const handleSelectConversation = (id) => {
    setSelectedId(id);
    setMobileShowChat(true);
  };

  const handleBackToList = () => {
    setMobileShowChat(false);
  };

  const selectedConversation = useMemo(
    () => conversations.find((c) => c._id === selectedId),
    [conversations, selectedId]
  );

  const messageGroups = useMemo(() => {
    const groups = [];
    let currentGroup = null;
    messages.forEach((msg) => {
      if (!currentGroup || !isSameDay(msg.createdAt, currentGroup.date)) {
        currentGroup = { date: msg.createdAt, messages: [] };
        groups.push(currentGroup);
      }
      currentGroup.messages.push(msg);
    });
    return groups;
  }, [messages]);

  const renderAvatar = (account, size = 36) => {
    const name = formatName(account);
    if (account?.avatar) {
      return <img src={getAvatarUrl(account)} alt={name} style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover' }} />;
    }
    return (
      <div
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          background: '#2563eb',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: size > 30 ? '14px' : '12px',
          fontWeight: 600,
        }}
      >
        {name.charAt(0).toUpperCase()}
      </div>
    );
  };

  const renderMessage = (message) => {
    const isDeleted = message.isDeleted;
    const isEditing = editingId === message._id;
    const isSystem = message.isSystemMessage;
    const senderName = formatName(message.sender);
    const isCurrentUser = message.sender?._id === user?._id;

    return (
      <div key={message._id} className={`admin-chat-message ${isSystem ? 'system' : ''} ${isCurrentUser ? 'own' : ''}`}>
        {!isSystem && renderAvatar(message.sender)}
        <div className="admin-chat-message-wrapper">
          <div className="admin-chat-message-body">
            <div className="admin-chat-message-meta">
              <span className="admin-chat-message-sender">{isSystem ? 'System' : senderName}</span>
              <span className="admin-chat-message-time">{formatMessageTime(message.createdAt)}</span>
              {message.isEdited && <span className="admin-chat-message-edited">edited</span>}
            </div>
            {isEditing ? (
              <div className="admin-chat-edit-row">
                <input
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  className="admin-chat-edit-input"
                  autoFocus
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit(message._id)}
                />
                <button className="admin-chat-edit-btn save" onClick={() => handleSaveEdit(message._id)}>
                  <HiCheck />
                </button>
                <button className="admin-chat-edit-btn cancel" onClick={handleCancelEdit}>
                  <HiXMark />
                </button>
              </div>
            ) : (
              <div className={`admin-chat-message-content ${isDeleted ? 'deleted' : ''}`}>
                {isDeleted ? (
                  <em>{message.content}</em>
                ) : (
                  <>
                    {message.fileUrl && message.type !== 'text' && (
                      <div className="admin-chat-message-file">
                        {message.fileUrl.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i) ? (
                          <img src={message.fileUrl} alt={message.fileName} className="admin-chat-message-image" />
                        ) : (
                          <a href={message.fileUrl} target="_blank" rel="noopener noreferrer">
                            {message.fileName || 'File'}
                          </a>
                        )}
                      </div>
                    )}
                    <p>{message.content}</p>
                  </>
                )}
              </div>
            )}
          </div>
          {!isDeleted && !isEditing && !isSystem && message.type === 'text' && (
            <div className="admin-chat-message-actions">
              <button className="admin-chat-action-btn" onClick={() => handleEdit(message)} title="Edit">
                <HiPencilSquare />
              </button>
              <button className="admin-chat-action-btn delete" onClick={() => handleDelete(message._id)} title="Delete">
                <HiOutlineTrash />
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderConversationSkeleton = () => (
    <div className="admin-chat-conversation-skeleton">
      <div className="skeleton-avatar" />
      <div className="skeleton-lines">
        <div className="skeleton-line" />
        <div className="skeleton-line short" />
      </div>
    </div>
  );

  if (isAuthenticated && user?.role !== 'admin') {
    return <Navigate to="/agent/dashboard" replace />;
  }

  return (
    <div className="admin-chat-dashboard">
      <div className="admin-chat-dashboard-header">
        <div className="admin-chat-header-left">
          <button className="admin-chat-back" onClick={() => navigate('/agent/dashboard')}>
            <HiArrowLeft /> Back
          </button>
          <h1>
            <HiChatBubbleLeftRight className="admin-chat-header-icon" />
            Chat Monitor
          </h1>
        </div>
        <div className="admin-chat-stats">
          <div className="admin-chat-stat">
            <span className="admin-chat-stat-value">{stats?.totalConversations ?? '-'}</span>
            <span className="admin-chat-stat-label">Chats</span>
          </div>
          <div className="admin-chat-stat">
            <span className="admin-chat-stat-value">{stats?.totalMessages ?? '-'}</span>
            <span className="admin-chat-stat-label">Messages</span>
          </div>
          <div className="admin-chat-stat">
            <span className="admin-chat-stat-value">{stats?.todayMessages ?? '-'}</span>
            <span className="admin-chat-stat-label">Today</span>
          </div>
        </div>
      </div>

      <div className="admin-chat-dashboard-body">
        {/* Sidebar */}
        <div className={`admin-chat-sidebar ${mobileShowChat ? 'hidden-mobile' : ''}`}>
          <div className="admin-chat-search">
            <HiMagnifyingGlass />
            <input
              type="text"
              placeholder="Search conversations..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="admin-chat-conversation-list" ref={conversationsContainerRef}>
            {loadingConversations && conversations.length === 0 && (
              <>
                {renderConversationSkeleton()}
                {renderConversationSkeleton()}
                {renderConversationSkeleton()}
                {renderConversationSkeleton()}
                {renderConversationSkeleton()}
              </>
            )}

            {!loadingConversations && conversations.length === 0 && (
              <div className="admin-chat-empty-state">
                <HiChatBubbleLeftRight className="empty-icon" />
                <p>No conversations found</p>
                <span>Try a different search term</span>
              </div>
            )}

            {conversations.map((conv) => {
              const isActive = conv._id === selectedId;
              const lastMessage = conv.lastMessage;
              const otherParticipant = conv.participants?.find((p) => p._id !== user?._id);
              const participantNames = conv.participantNames || conv.participants?.map((p) => formatName(p)).join(', ') || 'Unknown';
              const messageCount = conv.messageCount || 0;

              return (
                <button
                  key={conv._id}
                  className={`admin-chat-conversation-item ${isActive ? 'active' : ''}`}
                  onClick={() => handleSelectConversation(conv._id)}
                >
                  <div className="admin-chat-conversation-avatar">
                    {renderAvatar(otherParticipant || conv.participants?.[0], 44)}
                  </div>
                  <div className="admin-chat-conversation-info">
                    <div className="admin-chat-conversation-top">
                      <span className="admin-chat-conversation-names">{participantNames}</span>
                      <span className="admin-chat-conversation-time">
                        {lastMessage ? formatMessageTime(lastMessage.createdAt) : formatMessageTime(conv.updatedAt)}
                      </span>
                    </div>
                    <div className="admin-chat-conversation-preview">
                      {lastMessage ? (
                        <>
                          <span className="preview-sender">{lastMessage.sender?.displayName || lastMessage.sender?.username || 'User'}:</span>
                          <span className="preview-text">{lastMessage.content || 'Media'}</span>
                        </>
                      ) : (
                        'No messages yet'
                      )}
                    </div>
                    {messageCount > 0 && (
                      <div className="admin-chat-conversation-footer">
                        <span className="admin-chat-message-count">{messageCount} messages</span>
                      </div>
                    )}
                  </div>
                </button>
              );
            })}

            {loadingMoreConversations && (
              <div className="admin-chat-loading-more">
                <span className="spinner-border spinner-border-sm" /> Loading more...
              </div>
            )}
          </div>
        </div>

        {/* Main Chat */}
        <div className={`admin-chat-main ${mobileShowChat ? 'show-mobile' : ''}`}>
          {!selectedConversation ? (
            <div className="admin-chat-empty-state">
              <HiChatBubbleLeftRight className="empty-icon" />
              <p>Select a conversation to monitor</p>
              <span>Choose from the list on the left</span>
            </div>
          ) : (
            <>
              <div className="admin-chat-main-header">
                <div className="admin-chat-main-header-left">
                  <button className="admin-chat-mobile-back" onClick={handleBackToList}>
                    <HiArrowLeft />
                  </button>
                  <div className="admin-chat-main-participants">
                    <HiUsers className="participants-icon" />
                    <div className="admin-chat-participant-names">
                      {selectedConversation.participants?.map((p) => formatName(p)).join(' ↔ ')}
                    </div>
                  </div>
                </div>
                <div className="admin-chat-main-header-right">
                  <span className="admin-chat-main-message-count">{messages.length} messages loaded</span>
                </div>
              </div>

              <div className="admin-chat-messages" ref={messagesContainerRef}>
                {loadingMoreMessages && (
                  <div className="admin-chat-loading-more top">
                    <span className="spinner-border spinner-border-sm" /> Loading older messages...
                  </div>
                )}

                {loadingMessages ? (
                  <div className="admin-chat-empty-state">
                    <span className="spinner-border text-primary" />
                    <p>Loading messages...</p>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="admin-chat-empty-state">
                    <p>No messages in this conversation</p>
                  </div>
                ) : (
                  messageGroups.map((group) => (
                    <div key={group.date} className="admin-chat-message-group">
                      <div className="admin-chat-date-divider">
                        <span>{formatDateHeader(group.date)}</span>
                      </div>
                      <div className="admin-chat-message-list">{group.messages.map(renderMessage)}</div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {showScrollButton && (
                <button className="admin-chat-scroll-bottom" onClick={scrollToBottom} title="Jump to latest">
                  <HiArrowDown />
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminChatDashboard;
