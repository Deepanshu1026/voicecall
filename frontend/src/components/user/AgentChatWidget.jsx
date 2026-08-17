import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { userAPI } from '../../services/api';
import toast from 'react-hot-toast';
import '../../styles/userLanding.css';

const fallbackAgents = [
  { _id: 'ekta', id: 'ekta', name: 'Ekta', avatar: '/images/user/ekta.webp', status: 'Active' },
  { _id: 'kajal', id: 'kajal', name: 'Kajal', avatar: '/images/user/Kajal.webp', status: 'Active' },
  { _id: 'saniya', id: 'saniya', name: 'Saniya', avatar: '/images/user/saniya.webp', status: 'Active' },
];

const AgentChatWidget = () => {
  const navigate = useNavigate();
  const { isAuthenticated, guestLogin } = useAuth();
  const { isUserOnline } = useSocket();
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(true);
  const [guestLoading, setGuestLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const fetchAgents = async () => {
      try {
        const res = await userAPI.getConsultants();
        const data = res.data?.data || [];
        if (!cancelled) {
          if (data.length > 0) {
            setAgents(data.slice(0, 5));
          } else {
            setAgents(fallbackAgents);
          }
        }
      } catch (err) {
        console.error('Failed to load agents:', err);
        if (!cancelled) setAgents(fallbackAgents);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchAgents();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleChat = (agent, isOnline) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (!isOnline) {
      return;
    }
    const targetId = agent._id || agent.id;
    navigate(`/consultants?userId=${targetId}`);
  };

  const handleGuestStart = async () => {
    if (isAuthenticated) {
      navigate('/consultants');
      return;
    }
    setGuestLoading(true);
    try {
      await guestLogin('web');
      toast.success('Continuing as guest');
      navigate('/consultants');
    } catch (error) {
      console.error('Guest login failed:', error);
      toast.error('Guest login failed. Please try again.');
    } finally {
      setGuestLoading(false);
    }
  };

  if (!open) {
    return (
      <button
        className="agent-widget-fab"
        onClick={() => setOpen(true)}
        aria-label="Open agent chat"
      >
        <span className="agent-widget-fab-emoji">💬</span>
        <span>अनुभवी एजेंटों से संपर्क करें</span>
      </button>
    );
  }

  return (
    <div className="agent-chat-widget">
      <div className="agent-chat-loading-overlay" style={{ display: guestLoading ? 'flex' : 'none' }}>
        <div className="agent-chat-spinner"></div>
        <div className="agent-chat-loading-text">अतिथि सत्र बना रहे हैं... ⏳</div>
      </div>

      <button className="agent-chat-close" onClick={() => setOpen(false)} aria-label="Close agent chat">
        &times;
      </button>

      <div className="agent-chat-header">
        <span className="agent-chat-emoji">💬</span>
        अनुभवी एजेंटों से संपर्क करें
      </div>

      <div className="agent-chat-list">
        {loading ? (
          <p className="agent-chat-empty">एजेंट लोड हो रहे हैं...</p>
        ) : agents.length === 0 ? (
          <p className="agent-chat-empty">अभी कोई एजेंट उपलब्ध नहीं हैं।</p>
        ) : (
          agents.map((agent) => {
            const id = agent._id || agent.id;
            const name = agent.name || agent.displayName || agent.username || 'Agent';
            const avatar = agent.avatar?.url || agent.avatar || '/images/user/userdemo.webp';
            const isOnline = isAuthenticated ? (isUserOnline ? isUserOnline(id) : false) : true;
            return (
              <div className="agent-chat-agent" key={id}>
                <div className="agent-chat-agent-info">
                  <div className={`agent-chat-agent-avatar ${isOnline ? 'online' : ''}`}>
                    <img
                      src={avatar}
                      alt={name}
                      onError={(e) => {
                        e.target.src = '/images/user/userdemo.webp';
                      }}
                    />
                  </div>
                  <div className="agent-chat-agent-details">
                    <div className="agent-chat-agent-name">{name}</div>
                    <div className="agent-chat-agent-status">{isOnline ? 'ऑनलाइन' : 'ऑफलाइन'}</div>
                  </div>
                </div>
                <button
                  className="agent-chat-btn"
                  onClick={() => handleChat(agent, isOnline)}
                  disabled={guestLoading || !isOnline}
                  title={isOnline ? 'चैट शुरू करें' : 'यह एजेंट अभी ऑफलाइन है'}
                >
                  चैट
                </button>
              </div>
            );
          })
        )}
      </div>

      <div className="agent-chat-footer">
        {isAuthenticated ? (
          <div className="agent-chat-logged-in">
            <div className="agent-chat-icon">✅</div>
            <p>
              <strong>आप लॉग इन हैं!</strong>
            </p>
            <p>किसी भी एजेंट को चुनें और चैट शुरू करें</p>
          </div>
        ) : (
          <button
            className="agent-chat-login-btn"
            onClick={handleGuestStart}
            disabled={guestLoading}
          >
            अतिथि के रूप में चैट शुरू करें ✨
          </button>
        )}
      </div>
    </div>
  );
};

export default AgentChatWidget;
