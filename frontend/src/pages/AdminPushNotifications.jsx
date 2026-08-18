import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../services/api';
import toast from 'react-hot-toast';
import '../styles/adminChatDashboard.css';

const TABS = [
  { key: 'single', label: 'Single User', icon: 'bi bi-person' },
  { key: 'broadcast', label: 'Broadcast All', icon: 'bi bi-broadcast' },
];

const AdminPushNotifications = () => {
  const navigate = useNavigate();
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ current_page: 1, total_pages: 1, total_records: 0 });
  const [activeTab, setActiveTab] = useState('single');
  const [selectedUserId, setSelectedUserId] = useState('');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [dataKey, setDataKey] = useState('');
  const [dataValue, setDataValue] = useState('');

  const fetchTokens = async (p) => {
    try {
      setLoading(true);
      const res = await adminAPI.getFcmTokens({ page: p || page, limit: 50 });
      setTokens(res.data.data || []);
      setPagination(res.data.pagination || { current_page: p || page, total_pages: 1, total_records: 0 });
    } catch (err) {
      toast.error('Failed to load FCM tokens');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTokens(1);
  }, []);

  const getDataPayload = () => {
    const data = {};
    if (dataKey.trim() && dataValue.trim()) {
      data[dataKey.trim()] = dataValue.trim();
    }
    return data;
  };

  const handleSingleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !body.trim() || !selectedUserId) {
      toast.error('Title, body, and user are required');
      return;
    }

    setSending(true);
    try {
      const res = await adminAPI.sendPush({
        userId: selectedUserId,
        title: title.trim(),
        body: body.trim(),
        imageUrl: imageUrl.trim() || undefined,
        data: getDataPayload(),
      });
      toast.success(res.data?.message || 'Notification sent');
      resetForm();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send notification');
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  const handleBroadcastSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) {
      toast.error('Title and body are required');
      return;
    }

    setSending(true);
    try {
      const res = await adminAPI.broadcastPush({
        title: title.trim(),
        body: body.trim(),
        imageUrl: imageUrl.trim() || undefined,
        data: getDataPayload(),
      });
      toast.success(
        `Broadcast sent: ${res.data?.data?.successCount || 0} delivered, ${res.data?.data?.failureCount || 0} failed`
      );
      resetForm();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send broadcast');
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setBody('');
    setImageUrl('');
    setDataKey('');
    setDataValue('');
    setSelectedUserId('');
  };

  const renderPagination = () => {
    const total = pagination.total_pages || 1;
    const current = pagination.current_page || 1;
    const go = (p) => { setPage(p); fetchTokens(p); };
    const pages = [];
    const range = 2;
    let start = Math.max(1, current - range);
    let end = Math.min(total, current + range);

    if (start > 1) {
      pages.push(<button key={1} className="pagination-btn" onClick={() => go(1)}>1</button>);
      if (start > 2) pages.push(<span key="s1" className="px-1" style={{ color: '#94a3b8' }}>...</span>);
    }
    for (let i = start; i <= end; i++) {
      pages.push(
        <button key={i} className={`pagination-btn ${i === current ? 'active' : ''}`} onClick={() => go(i)}>
          {i}
        </button>
      );
    }
    if (end < total) {
      if (end < total - 1) pages.push(<span key="s2" className="px-1" style={{ color: '#94a3b8' }}>...</span>);
      pages.push(<button key={total} className="pagination-btn" onClick={() => go(total)}>{total}</button>);
    }

    return (
      <div className="d-flex align-items-center gap-1">
        <button className="pagination-btn" disabled={current <= 1} onClick={() => go(current - 1)}>
          <i className="bi bi-chevron-left" />
        </button>
        {pages}
        <button className="pagination-btn" disabled={current >= total} onClick={() => go(current + 1)}>
          <i className="bi bi-chevron-right" />
        </button>
      </div>
    );
  };

  const renderFormFields = () => (
    <>
      <div className="mb-3">
        <label className="form-label" style={{ fontWeight: 500 }}>Title</label>
        <input
          type="text"
          className="form-control"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Notification title"
          required
        />
      </div>
      <div className="mb-3">
        <label className="form-label" style={{ fontWeight: 500 }}>Body</label>
        <textarea
          className="form-control"
          rows={4}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Notification body"
          required
        />
      </div>
      <div className="mb-3">
        <label className="form-label" style={{ fontWeight: 500 }}>Image URL (optional)</label>
        <input
          type="url"
          className="form-control"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          placeholder="https://..."
        />
      </div>
      <div className="row g-3 mb-4">
        <div className="col-md-6">
          <label className="form-label" style={{ fontWeight: 500 }}>Data Key (optional)</label>
          <input
            type="text"
            className="form-control"
            value={dataKey}
            onChange={(e) => setDataKey(e.target.value)}
            placeholder="screen"
          />
        </div>
        <div className="col-md-6">
          <label className="form-label" style={{ fontWeight: 500 }}>Data Value (optional)</label>
          <input
            type="text"
            className="form-control"
            value={dataValue}
            onChange={(e) => setDataValue(e.target.value)}
            placeholder="home"
          />
        </div>
      </div>
    </>
  );

  return (
    <div className="admin-chat-dashboard">
      <div className="page-header d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 style={{ fontSize: '1.75rem', fontWeight: 600, color: '#1a202c', margin: 0 }}>Push Notifications</h3>
          <p style={{ color: '#718096', margin: '4px 0 0 0', fontSize: '0.95rem' }}>Send manual or broadcast FCM notifications.</p>
        </div>
        <button className="agent-btn agent-btn-outline-dark" onClick={() => navigate('/agent/dashboard')}>
          <i className="bi bi-arrow-left" /> Back to Dashboard
        </button>
      </div>

      <div className="admin-layout-row">
        {/* Left: Tokens list */}
        <div className="admin-conversations">
          <div className="admin-panel-header">
            <h4>FCM Tokens</h4>
            <span className="text-muted small">Total: {pagination.total_records}</span>
          </div>
          <div className="admin-conversations-list">
            {loading ? (
              <div className="admin-empty">
                <div className="spinner-border text-primary" />
                <p>Loading tokens...</p>
              </div>
            ) : tokens.length === 0 ? (
              <div className="admin-empty">
                <i className="bi bi-bell-slash" />
                <p>No FCM tokens found.</p>
              </div>
            ) : (
              tokens.map((t) => (
                <div
                  key={t._id}
                  className={`admin-conversation-item ${selectedUserId === String(t.userId?._id || t.userId) ? 'active' : ''}`}
                  onClick={() => {
                    setActiveTab('single');
                    setSelectedUserId(String(t.userId?._id || t.userId));
                  }}
                >
                  <div className="admin-conversation-info">
                    <div className="admin-conversation-name">User: {t.userId?.displayName || t.userId?.username || t.userId || 'Unknown'}</div>
                    <div className="admin-conversation-preview" style={{ fontSize: '0.75rem', fontFamily: 'monospace' }}>
                      {t.token.slice(0, 40)}...
                    </div>
                    <div className="admin-conversation-meta">
                      <span>{t.device || 'A'}</span>
                      <span>{new Date(t.updatedAt).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          {tokens.length > 0 && (
            <div className="agent-pagination" style={{ padding: '12px 16px', borderTop: '1px solid #e2e8f0' }}>
              <div className="page-info">Page {pagination.current_page} of {pagination.total_pages}</div>
              <nav>{renderPagination()}</nav>
            </div>
          )}
        </div>

        {/* Right: Compose panel */}
        <div className="admin-chat-panel">
          <div className="admin-panel-header">
            <h4>Compose</h4>
          </div>
          <div className="admin-chat-messages" style={{ padding: '24px' }}>
            {/* Tabs */}
            <div className="d-flex gap-2 mb-4" style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
              {TABS.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  className={`agent-btn ${activeTab === tab.key ? 'agent-btn-primary' : 'agent-btn-outline-dark'}`}
                  onClick={() => setActiveTab(tab.key)}
                >
                  <i className={`bi ${tab.icon} me-2`} />
                  {tab.label}
                </button>
              ))}
            </div>

            {activeTab === 'single' ? (
              <form onSubmit={handleSingleSubmit}>
                <div className="mb-3">
                  <label className="form-label" style={{ fontWeight: 500 }}>Selected User</label>
                  <input
                    type="text"
                    className="form-control"
                    value={selectedUserId}
                    onChange={(e) => setSelectedUserId(e.target.value)}
                    placeholder="Click a token on the left or paste a user ID"
                    required
                  />
                </div>
                {renderFormFields()}
                <button
                  type="submit"
                  className="agent-btn agent-btn-primary"
                  disabled={sending || !selectedUserId}
                  style={{ minWidth: '140px' }}
                >
                  {sending ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-send me-2" /> Send to User
                    </>
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleBroadcastSubmit}>
                <div className="alert alert-info d-flex align-items-start gap-2 mb-3" style={{ fontSize: '0.9rem' }}>
                  <i className="bi bi-info-circle mt-1" />
                  <div>
                    This will send the notification to <strong>all {pagination.total_records}</strong> saved FCM tokens.
                    Invalid tokens will be removed automatically.
                  </div>
                </div>
                {renderFormFields()}
                <button
                  type="submit"
                  className="agent-btn agent-btn-primary"
                  disabled={sending}
                  style={{ minWidth: '160px' }}
                >
                  {sending ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" />
                      Broadcasting...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-broadcast me-2" /> Send Broadcast
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPushNotifications;
