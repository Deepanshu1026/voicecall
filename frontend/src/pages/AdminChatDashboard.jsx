import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { adminAPI } from '../services/api';
import { formatMessageTime, getAvatarUrl } from '../utils/helpers';
import toast from 'react-hot-toast';
import { HiMagnifyingGlass, HiOutlineTrash, HiPencilSquare, HiCheck, HiXMark, HiArrowLeft } from 'react-icons/hi2';
import '../styles/adminChatDashboard.css';

const formatName = (account) => account?.displayName || account?.username || 'Unknown';

const AdminChatDashboard = () => {
  const { user, isAuthenticated } = useAuth();
  const { on, off } = useSocket();
  const navigate = useNavigate();

  const [conversations, setConversations] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [stats, setStats] = useState(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');
  const messagesEndRef = useRef(null);

  const fetchStats = useCallback(async () => {
    try {
      const res = await adminAPI.getChatStats();
      setStats(res.data?.data || null);
    } catch (err) {
      console.error('Failed to load chat stats:', err);
    }
  }, []);

  const fetchConversations = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getConversations({ search, limit: 100 });
      const data = res.data?.data || [];
      setConversations(data);
      if (data.length > 0 && !selectedId) {
        setSelectedId(data[0]._id);
      }
    } catch (err) {
      console.error('Failed to load conversations:', err);
      toast.error('Failed to load conversations');
    } finally {
      setLoading(false);
    }
  }, [search, selectedId]);

  const fetchMessages = useCallback(async (conversationId) => {
    if (!conversationId) return;
    setLoadingMessages(true);
    try {
      const res = await adminAPI.getMessages(conversationId, { limit: 200 });
      setMessages(res.data?.data || []);
    } catch (err) {
      console.error('Failed to load messages:', err);
      toast.error('Failed to load messages');
    } finally {
      setLoadingMessages(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    fetchConversations();
  }, [fetchConversations]);

  useEffect(() => {
    fetchMessages(selectedId);
  }, [selectedId, fetchMessages]);

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
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const selectedConversation = useMemo(
    () => conversations.find((c) => c._id === selectedId),
    [conversations, selectedId]
  );

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

  const renderMessage = (message) => {
    const isDeleted = message.isDeleted;
    const isEditing = editingId === message._id;
    const isSystem = message.isSystemMessage;
    const senderName = formatName(message.sender);

    return (
      <div key={message._id} className={`admin-chat-message ${isSystem ? 'system' : ''}`}>
        <div className="admin-chat-message-avatar">
          {message.sender?.avatar ? (
            <img src={getAvatarUrl(message.sender)} alt={senderName} />
          ) : (
            <div className="admin-chat-message-initial">{senderName.charAt(0)}</div>
          )}
        </div>
        <div className="admin-chat-message-body">
          <div className="admin-chat-message-meta">
            <span className="admin-chat-message-sender">{senderName}</span>
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

  if (isAuthenticated && user?.role !== 'admin') {
    return <Navigate to="/agent/dashboard" replace />;
  }

  return (
    <div className="admin-chat-dashboard">
      <div className="admin-chat-dashboard-header">
        <button className="admin-chat-back" onClick={() => navigate('/agent/dashboard')}>
          <HiArrowLeft /> Back
        </button>
        <h1>Admin Chat Monitor</h1>
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
        <div className="admin-chat-sidebar">
          <div className="admin-chat-search">
            <HiMagnifyingGlass />
            <input
              type="text"
              placeholder="Search by user name, email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          {loading && <div className="admin-chat-empty">Loading conversations...</div>}
          {!loading && conversations.length === 0 && <div className="admin-chat-empty">No conversations found</div>}
          <div className="admin-chat-conversation-list">
            {conversations.map((conv) => {
              const isActive = conv._id === selectedId;
              const lastMessage = conv.lastMessage;
              return (
                <button
                  key={conv._id}
                  className={`admin-chat-conversation-item ${isActive ? 'active' : ''}`}
                  onClick={() => setSelectedId(conv._id)}
                >
                  <div className="admin-chat-conversation-names">{conv.participantNames}</div>
                  <div className="admin-chat-conversation-preview">
                    {lastMessage ? `${lastMessage.sender?.displayName || lastMessage.sender?.username || 'User'}: ${lastMessage.content || 'Media'}` : 'No messages yet'}
                  </div>
                  <div className="admin-chat-conversation-time">
                    {lastMessage ? formatMessageTime(lastMessage.createdAt) : formatMessageTime(conv.updatedAt)}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="admin-chat-main">
          {!selectedConversation ? (
            <div className="admin-chat-empty">Select a conversation to monitor</div>
          ) : (
            <>
              <div className="admin-chat-main-header">
                <div className="admin-chat-main-participants">
                  {selectedConversation.participants?.map((p) => (
                    <div key={p._id} className="admin-chat-main-participant">
                      {p.avatar ? (
                        <img src={getAvatarUrl(p)} alt={formatName(p)} />
                      ) : (
                        <div className="admin-chat-participant-initial">{formatName(p).charAt(0)}</div>
                      )}
                      <span>{formatName(p)}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="admin-chat-messages">
                {loadingMessages ? (
                  <div className="admin-chat-empty">Loading messages...</div>
                ) : messages.length === 0 ? (
                  <div className="admin-chat-empty">No messages in this conversation</div>
                ) : (
                  messages.map(renderMessage)
                )}
                <div ref={messagesEndRef} />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminChatDashboard;
