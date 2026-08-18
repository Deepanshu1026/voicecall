import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../services/api';
import toast from 'react-hot-toast';
import '../styles/adminChatDashboard.css';
import '../styles/pushNotifications.css';

const TABS = [
  { key: 'single', label: 'Single User', icon: 'bi bi-person', desc: 'Send to one user' },
  { key: 'broadcast', label: 'Broadcast All', icon: 'bi bi-broadcast', desc: 'Send to all users' },
];

const TITLE_LIMIT = 60;
const BODY_LIMIT = 200;

const AdminPushNotifications = () => {
  const navigate = useNavigate();
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState({ current_page: 1, total_pages: 1, total_records: 0 });
  const [activeTab, setActiveTab] = useState('single');
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedUserName, setSelectedUserName] = useState('');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [dataKey, setDataKey] = useState('');
  const [dataValue, setDataValue] = useState('');
  const [confirmModal, setConfirmModal] = useState(null);
  const [results, setResults] = useState([]);

  const fetchTokens = async (p, s) => {
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

  const filteredTokens = useMemo(() => {
    if (!search.trim()) return tokens;
    const q = search.toLowerCase();
    return tokens.filter((t) => {
      const name = (t.userId?.displayName || t.userId?.username || '').toLowerCase();
      const id = String(t.userId?._id || t.userId).toLowerCase();
      const token = (t.token || '').toLowerCase();
      return name.includes(q) || id.includes(q) || token.includes(q);
    });
  }, [tokens, search]);

  const getDataPayload = () => {
    const data = {};
    if (dataKey.trim() && dataValue.trim()) {
      data[dataKey.trim()] = dataValue.trim();
    }
    return data;
  };

  const resetForm = () => {
    setTitle('');
    setBody('');
    setImageUrl('');
    setDataKey('');
    setDataValue('');
    setSelectedUserId('');
    setSelectedUserName('');
  };

  const addResult = (type, data) => {
    setResults((prev) => [
      {
        type,
        title: title.trim(),
        body: body.trim(),
        time: new Date().toLocaleString(),
        ...data,
      },
      ...prev.slice(0, 9),
    ]);
  };

  const handleSingleSend = async () => {
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
      const data = res.data?.data || {};
      addResult('Single User', data);
      toast.success(
        `Single notification sent: ${data.successCount || 0} delivered, ${data.failureCount || 0} failed`
      );
      resetForm();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send notification');
      console.error(err);
    } finally {
      setSending(false);
      setConfirmModal(null);
    }
  };

  const handleBroadcastSend = async () => {
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
      const data = res.data?.data || {};
      addResult('Broadcast', data);
      toast.success(
        `Broadcast sent: ${data.successCount || 0} delivered, ${data.failureCount || 0} failed, ${data.invalidTokensRemoved || 0} invalid tokens removed`
      );
      resetForm();
      fetchTokens(1);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send broadcast');
      console.error(err);
    } finally {
      setSending(false);
      setConfirmModal(null);
    }
  };

  const openConfirm = (type) => {
    if (!title.trim() || !body.trim()) {
      toast.error('Title and body are required');
      return;
    }
    if (type === 'single' && !selectedUserId) {
      toast.error('Please select a user first');
      return;
    }
    setConfirmModal(type);
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

  const deviceBadgeClass = (device) => {
    const d = (device || 'A').toLowerCase();
    if (d.includes('android')) return 'push-token-badge android';
    if (d.includes('ios') || d.includes('iphone') || d.includes('ipad')) return 'push-token-badge ios';
    if (d.includes('web')) return 'push-token-badge web';
    return 'push-token-badge';
  };

  return (
    <div className="push-notifications-page">
      <div className="push-header">
        <div>
          <h3>Push Notifications</h3>
          <p>Send manual and broadcast notifications to app users.</p>
        </div>
        <button className="agent-btn agent-btn-outline-dark" onClick={() => navigate('/agent/dashboard')}>
          <i className="bi bi-arrow-left" /> Back to Dashboard
        </button>
      </div>

      <div className="push-layout">
        {/* Left: Tokens panel */}
        <div className="push-tokens-panel">
          <div className="push-tokens-header">
            <h4><i className="bi bi-phone me-2" />FCM Tokens</h4>
            <span className="badge bg-primary" style={{ fontSize: '0.75rem' }}>{pagination.total_records}</span>
          </div>
          <div className="push-tokens-search">
            <input
              type="text"
              placeholder="Search user, ID, or token..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="push-tokens-list">
            {loading ? (
              <div className="push-empty">
                <div className="spinner-border text-primary" />
                <p className="mt-2">Loading tokens...</p>
              </div>
            ) : filteredTokens.length === 0 ? (
              <div className="push-empty">
                <i className="bi bi-bell-slash" />
                <div className="push-empty-title">No tokens found</div>
                <div className="push-empty-subtitle">Try a different search or no tokens exist.</div>
              </div>
            ) : (
              filteredTokens.map((t) => (
                <div
                  key={t._id}
                  className={`push-token-item ${selectedUserId === String(t.userId?._id || t.userId) ? 'active' : ''}`}
                  onClick={() => {
                    setActiveTab('single');
                    setSelectedUserId(String(t.userId?._id || t.userId));
                    setSelectedUserName(t.userId?.displayName || t.userId?.username || t.userId || 'Unknown');
                  }}
                >
                  <div className="push-token-user">
                    <span>{t.userId?.displayName || t.userId?.username || 'Unknown'}</span>
                    <span className={deviceBadgeClass(t.device)}>{t.device || 'A'}</span>
                  </div>
                  <div className="push-token-id">{t.token.slice(0, 35)}...</div>
                  <div className="push-token-meta">
                    <span>ID: {String(t.userId?._id || t.userId).slice(-6)}</span>
                    <span>{new Date(t.updatedAt).toLocaleDateString()}</span>
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
        <div className="push-compose-panel">
          <div className="push-compose-header">
            <h4><i className="bi bi-pencil-square me-2" />Compose Notification</h4>
          </div>
          <div className="push-compose-body">
            {/* Tabs */}
            <div className="push-tabs">
              {TABS.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  className={`push-tab ${activeTab === tab.key ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab.key)}
                >
                  <i className={`bi ${tab.icon}`} />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            <div className="push-form-grid">
              <div>
                {activeTab === 'single' && selectedUserId && (
                  <div className="push-selected-user">
                    <i className="bi bi-person-check" />
                    <span>Sending to: <strong>{selectedUserName}</strong> ({selectedUserId})</span>
                  </div>
                )}

                {activeTab === 'broadcast' && (
                  <div className="push-alert push-alert-warning">
                    <i className="bi bi-exclamation-triangle-fill" />
                    <div>
                      <strong>Broadcast will reach all {pagination.total_records} saved tokens.</strong><br />
                      This includes real users. Double-check your message before sending.
                    </div>
                  </div>
                )}

                <div className="push-form-group">
                  <label className="push-form-label">
                    <span>Notification Title</span>
                    <span className={`push-char-count ${title.length > TITLE_LIMIT ? 'danger' : title.length > TITLE_LIMIT * 0.8 ? 'warning' : ''}`}>
                      {title.length}/{TITLE_LIMIT}
                    </span>
                  </label>
                  <input
                    type="text"
                    className="push-form-control"
                    value={title}
                    onChange={(e) => setTitle(e.target.value.slice(0, TITLE_LIMIT))}
                    placeholder="Enter notification title"
                    required
                  />
                </div>

                <div className="push-form-group">
                  <label className="push-form-label">
                    <span>Message Body</span>
                    <span className={`push-char-count ${body.length > BODY_LIMIT ? 'danger' : body.length > BODY_LIMIT * 0.8 ? 'warning' : ''}`}>
                      {body.length}/{BODY_LIMIT}
                    </span>
                  </label>
                  <textarea
                    className="push-form-control push-textarea"
                    value={body}
                    onChange={(e) => setBody(e.target.value.slice(0, BODY_LIMIT))}
                    placeholder="Enter notification message"
                    required
                  />
                </div>

                <div className="push-form-group">
                  <label className="push-form-label">Image URL (optional)</label>
                  <input
                    type="url"
                    className="push-form-control"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                  />
                  <div className="push-helper">Shown as a large image in the notification.</div>
                </div>

                <div className="push-form-group">
                  <label className="push-form-label">Custom Data Payload (optional)</label>
                  <div className="push-data-row">
                    <input
                      type="text"
                      className="push-form-control"
                      value={dataKey}
                      onChange={(e) => setDataKey(e.target.value)}
                      placeholder="Key (e.g. screen)"
                    />
                    <input
                      type="text"
                      className="push-form-control"
                      value={dataValue}
                      onChange={(e) => setDataValue(e.target.value)}
                      placeholder="Value (e.g. home)"
                    />
                  </div>
                  <div className="push-helper">Used by the app to open a specific screen when tapped.</div>
                </div>

                <div className="push-actions">
                  <button
                    type="button"
                    className="push-btn push-btn-primary"
                    disabled={sending}
                    onClick={() => openConfirm(activeTab)}
                  >
                    {sending ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <i className={`bi ${activeTab === 'single' ? 'bi-send' : 'bi-broadcast'} me-2`} />
                        {activeTab === 'single' ? 'Send to User' : 'Send Broadcast'}
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    className="push-btn push-btn-outline"
                    onClick={resetForm}
                    disabled={sending}
                  >
                    <i className="bi bi-x-lg me-2" /> Reset
                  </button>
                </div>
              </div>

              {/* Preview */}
              <div className="push-preview-card">
                <div className="push-preview-title">Live Preview</div>
                <div className="push-phone">
                  <div className="push-phone-notch" />
                  <div className="push-phone-screen">
                    <div className="push-phone-time">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                    <div className="push-notification-bubble">
                      <div className="push-notification-icon">
                        <i className="bi bi-bell" />
                      </div>
                      <div className="push-notification-content">
                        <div className="push-notification-app">A Visa Experts</div>
                        <div className="push-notification-title">{title.trim() || 'Notification Title'}</div>
                        <div className="push-notification-body">{body.trim() || 'Notification message will appear here...'}</div>
                        {imageUrl.trim() && (
                          <img
                            src={imageUrl.trim()}
                            alt=""
                            className="push-notification-image"
                            onError={(e) => { e.target.style.display = 'none'; }}
                            onLoad={(e) => { e.target.style.display = 'block'; }}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Results */}
            {results.length > 0 && (
              <div className="push-results">
                <div className="push-results-title"><i className="bi bi-clock-history me-2" />Recent Send Results</div>
                {results.map((r, idx) => (
                  <div key={idx} className="push-result-card">
                    <div className="push-result-header">
                      <span className="push-result-title">{r.type}: {r.title}</span>
                      <span className="push-result-time">{r.time}</span>
                    </div>
                    <div className="push-result-body" style={{ fontSize: '0.85rem', color: '#4b5563', marginBottom: '10px' }}>
                      {r.body}
                    </div>
                    <div className="push-result-stats">
                      <div className="push-result-stat">
                        <div className="push-result-stat-value success">{r.successCount || 0}</div>
                        <div className="push-result-stat-label">Delivered</div>
                      </div>
                      <div className="push-result-stat">
                        <div className={`push-result-stat-value ${r.failureCount ? 'danger' : ''}`}>{r.failureCount || 0}</div>
                        <div className="push-result-stat-label">Failed</div>
                      </div>
                      {'invalidTokensRemoved' in r && (
                        <div className="push-result-stat">
                          <div className="push-result-stat-value">{r.invalidTokensRemoved || 0}</div>
                          <div className="push-result-stat-label">Invalid Removed</div>
                        </div>
                      )}
                      {'totalTokens' in r && (
                        <div className="push-result-stat">
                          <div className="push-result-stat-value">{r.totalTokens || 0}</div>
                          <div className="push-result-stat-label">Total Tokens</div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {confirmModal && (
        <div className="push-modal-overlay" onClick={() => !sending && setConfirmModal(null)}>
          <div className="push-modal" onClick={(e) => e.stopPropagation()}>
            <div className={`push-modal-icon ${confirmModal === 'broadcast' ? 'danger' : ''}`}>
              <i className={`bi ${confirmModal === 'broadcast' ? 'bi-broadcast' : 'bi-send'}`} />
            </div>
            <h4>
              {confirmModal === 'broadcast'
                ? 'Send broadcast to all users?'
                : 'Send notification to this user?'}
            </h4>
            <p>
              {confirmModal === 'broadcast'
                ? `You are about to send "${title.trim()}" to all ${pagination.total_records} saved FCM tokens. This action cannot be undone.`
                : `You are about to send "${title.trim()}" to ${selectedUserName || 'the selected user'}.`}
            </p>
            <div className="push-modal-actions">
              <button
                type="button"
                className="push-btn push-btn-outline"
                onClick={() => setConfirmModal(null)}
                disabled={sending}
              >
                Cancel
              </button>
              <button
                type="button"
                className={`push-btn ${confirmModal === 'broadcast' ? 'push-btn-danger' : 'push-btn-primary'}`}
                onClick={confirmModal === 'broadcast' ? handleBroadcastSend : handleSingleSend}
                disabled={sending}
              >
                {sending ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" />
                    Sending...
                  </>
                ) : (
                  <>
                    <i className={`bi ${confirmModal === 'broadcast' ? 'bi-broadcast' : 'bi-send'} me-2`} />
                    {confirmModal === 'broadcast' ? 'Send Broadcast' : 'Send Now'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPushNotifications;
