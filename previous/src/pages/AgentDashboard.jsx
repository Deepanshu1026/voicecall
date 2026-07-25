import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Chat from './Chat';
import '../styles/agentAuth.css';

const AgentDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/agent/login', { replace: true });
  };

  return (
    <div className="agent-dashboard">
      <header className="agent-dashboard-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <img className="logo" src="/images/user/tmlogo 1.webp" alt="Avisa Experts" />
          <span
            style={{
              background: 'rgba(249, 115, 22, 0.15)',
              color: '#f97316',
              padding: '4px 12px',
              borderRadius: '50px',
              fontSize: '12px',
              fontWeight: 700,
              letterSpacing: '1px',
              textTransform: 'uppercase',
              border: '1px solid rgba(249, 115, 22, 0.3)',
            }}
          >
            Agent Portal
          </span>
        </div>
        <div className="actions">
          <span className="user-name">{user?.displayName || user?.username || 'Agent'}</span>
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      <div style={{ height: 'calc(100vh - 72px)' }}>
        <Chat className="h-full w-full flex overflow-hidden bg-gray-50 dark:bg-surface-dark" />
      </div>
    </div>
  );
};

export default AgentDashboard;
