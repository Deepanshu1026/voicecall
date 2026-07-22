import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AgentSlidePanel from '../components/agent/AgentSlidePanel';
import '../styles/agentPortal.css';
import '../styles/agentSlidePanel.css';

const menu = [
  { path: '/agent/dashboard', label: 'Dashboard', icon: 'bi bi-grid-1x2' },
  { path: '/agent/dashboard/new-application', label: 'New Application', icon: 'bi bi-plus-circle' },
  { path: '/agent/dashboard/daily-logins', label: 'Daily Logins', icon: 'bi bi-calendar3' },
  { path: '/agent/dashboard/pending-remarks', label: 'Pending Remarks', icon: 'bi bi-chat-dots', badge: 'pendingRemarks' },
  { path: '/agent/dashboard/chat', label: 'Client Chat', icon: 'bi bi-chat' },
];

const AgentLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isChatPath = location.pathname === '/agent/dashboard/chat';

  const handleLogout = async () => {
    await logout();
    navigate('/agent/login', { replace: true });
  };

  return (
    <div className="agent-portal-layout">
      <aside className="agent-portal-sidebar">
        <div className="sidebar-brand">
          <i className="bi bi-headset" />
          Avisa Portal
        </div>
        <nav className="sidebar-nav">
          {menu.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/agent/dashboard'}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <i className={item.icon} />
              <span>{item.label}</span>
              {item.badge === 'pendingRemarks' && <span className="sidebar-badge">27</span>}
            </NavLink>
          ))}
        </nav>
        <button className="sidebar-logout" onClick={handleLogout}>
          <i className="bi bi-box-arrow-right" />
          <span>Logout</span>
        </button>
      </aside>

      <main className="agent-portal-main">
        <div className="agent-topbar">
          <div className="agent-topbar-welcome">
            Welcome, <strong>{user?.displayName || user?.username || 'Agent'}</strong>
          </div>
          <div className="d-flex align-items-center gap-2">
            <AgentSlidePanel />
            <NavLink to="/agent/dashboard/chat" className="agent-btn agent-btn-sm">
              <i className="bi bi-chat" /> Internal Chat
            </NavLink>
          </div>
        </div>
        <div className="agent-portal-page" style={isChatPath ? { padding: 0, maxWidth: '100%', height: 'calc(100vh - 57px)' } : {}}>
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AgentLayout;