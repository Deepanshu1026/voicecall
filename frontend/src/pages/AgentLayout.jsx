import { NavLink, Outlet, useNavigate, useLocation, useBlocker } from 'react-router-dom';
import { useEffect, useState, useCallback, useRef } from 'react';
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

const adminMenu = [
  { path: '/agent/dashboard/admin', label: 'Admin Settings', icon: 'bi bi-shield-lock' },
];

const AgentLayout = () => {
  const { user, logout } = useAuth();
  const isAdmin = user?.role === 'admin';
  const navigate = useNavigate();
  const location = useLocation();
  const isChatPath = location.pathname === '/agent/dashboard/chat';
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [pendingLogout, setPendingLogout] = useState(false);
  const blocker = useRef(null);

  const navigateBlocker = useBlocker(
    ({ currentLocation, nextLocation }) => {
      // Only block navigation that leaves the agent dashboard entirely
      return (
        currentLocation.pathname.startsWith('/agent/dashboard') &&
        !nextLocation.pathname.startsWith('/agent/dashboard')
      );
    }
  );
  blocker.current = navigateBlocker;

  // Warn when closing the tab/window (browser-native dialog)
  useEffect(() => {
    const handleBeforeUnload = (event) => {
      event.preventDefault();
      event.returnValue = '';
      return '';
    };

    const handleUnload = async () => {
      const token = localStorage.getItem('employeeAccessToken');
      if (token) {
        try {
          fetch('/api/employees/logout', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            keepalive: true,
          });
        } catch (error) {
          console.error('Logout beacon failed:', error);
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('unload', handleUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('unload', handleUnload);
    };
  }, []);

  // Show custom modal when SPA navigation is blocked
  useEffect(() => {
    if (navigateBlocker.state === 'blocked') {
      setShowLeaveModal(true);
    }
  }, [navigateBlocker.state]);

  const handleLogout = useCallback(async () => {
    setPendingLogout(true);
    await logout();
    navigate('/agent/login', { replace: true });
  }, [logout, navigate]);

  const confirmLeave = () => {
    setShowLeaveModal(false);
    if (navigateBlocker.state === 'blocked') {
      navigateBlocker.proceed();
    }
  };

  const cancelLeave = () => {
    setShowLeaveModal(false);
    if (navigateBlocker.state === 'blocked') {
      navigateBlocker.reset();
    }
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
          {isAdmin && (
            <>
              <div className="sidebar-divider" />
              {adminMenu.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                >
                  <i className={item.icon} />
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </>
          )}
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

      {showLeaveModal && (
        <div className="agent-leave-modal-overlay">
          <div className="agent-leave-modal">
            <h3 className="agent-leave-modal-title">Leave Avisa Portal?</h3>
            <p className="agent-leave-modal-text">
              If you leave this page you will be logged out and shown as offline.
            </p>
            <div className="agent-leave-modal-actions">
              <button
                type="button"
                className="agent-leave-modal-btn agent-leave-modal-btn-primary"
                onClick={cancelLeave}
                autoFocus
              >
                Cancel
              </button>
              <button
                type="button"
                className="agent-leave-modal-btn agent-leave-modal-btn-secondary"
                onClick={confirmLeave}
              >
                Leave
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgentLayout;