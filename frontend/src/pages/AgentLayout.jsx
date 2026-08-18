import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import AgentSlidePanel from '../components/agent/AgentSlidePanel';
import SEO from '../components/common/SEO';
import '../styles/agentPortal.css';
import '../styles/agentSlidePanel.css';

const agentMenu = [
  { path: '/agent/dashboard', label: 'Dashboard', icon: 'bi bi-grid-1x2' },
  { path: '/agent/dashboard/new-application', label: 'New Application', icon: 'bi bi-plus-circle' },
  { path: '/agent/dashboard/daily-logins', label: 'Daily Logins', icon: 'bi bi-calendar3' },
  { path: '/agent/dashboard/booked-appointments', label: 'Booked Appointments', icon: 'bi bi-calendar-check' },
  { path: '/agent/dashboard/pending-remarks', label: 'Pending Remarks', icon: 'bi bi-chat-dots', badge: 'pendingRemarks' },
  { path: '/agent/dashboard/chat', label: 'Client Chat', icon: 'bi bi-chat' },
];

const adminMenu = [
  { path: '/agent/dashboard/daily-logins', label: 'All Logins', icon: 'bi bi-calendar3' },
  { path: '/agent/dashboard/booked-appointments', label: 'Booked Appointments', icon: 'bi bi-calendar-check' },
  { path: '/agent/dashboard/admin', label: 'Admin Settings', icon: 'bi bi-shield-lock' },
  { path: '/agent/dashboard/admin/chats', label: 'Chat Monitor', icon: 'bi bi-chat-dots' },
  { path: '/agent/dashboard/admin/push', label: 'Push Notifications', icon: 'bi bi-bell' },
  { path: '/agent/dashboard/admin/banner', label: 'Offer Banner', icon: 'bi bi-image' },
  { path: '/agent/dashboard/admin/instagram-token', label: 'Instagram Token', icon: 'bi bi-instagram' },
];

const AgentLayout = () => {
  const { user, logout } = useAuth();
  const isAdmin = user?.role === 'admin';
  const navigate = useNavigate();
  const location = useLocation();
  const isChatPath = location.pathname === '/agent/dashboard/chat';

  // Warn when closing the tab/window and send a logout beacon
  useEffect(() => {
    const handleBeforeUnload = (event) => {
      event.preventDefault();
      event.returnValue = '';
      return '';
    };

    const handleUnload = () => {
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

  const handleLogout = useCallback(async () => {
    await logout();
    navigate('/agent/login', { replace: true });
  }, [logout, navigate]);

  return (
    <>
      <SEO
        title="Agent Dashboard | A Visa Experts"
        description="Agent portal for A Visa Experts. Manage applications, client chats, and daily logins."
        canonicalPath="/agent/dashboard"
      />
    <div className="agent-portal-layout">
      <aside className="agent-portal-sidebar">
        <div className="sidebar-brand">
          <i className="bi bi-headset" />
          Avisa Portal
        </div>
        <nav className="sidebar-nav">
          {(isAdmin ? adminMenu : agentMenu).map((item) => (
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
            {!isAdmin && (
              <NavLink to="/agent/dashboard/chat" className="agent-btn agent-btn-sm">
                <i className="bi bi-chat" /> Internal Chat
              </NavLink>
            )}
          </div>
        </div>
        <div className="agent-portal-page" style={isChatPath ? { padding: 0, maxWidth: '100%', height: 'calc(100vh - 57px)' } : {}}>
          <Outlet />
        </div>
      </main>

    </div>
    </>
  );
};

export default AgentLayout;
