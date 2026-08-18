import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../services/api';
import toast from 'react-hot-toast';
import '../styles/adminChatDashboard.css';
import '../styles/pushNotifications.css';

const TABS = [
  { key: 'single', label: 'Single User', icon: 'bi bi-person', desc: 'Send to one user by ID' },
  { key: 'broadcast', label: 'Broadcast All', icon: 'bi bi-broadcast', desc: 'Send to all users' },
];

const TITLE_LIMIT = 60;
const BODY_LIMIT = 200;

const AdminPushNotifications = () => {
  const navigate = useNavigate();
  const [totalTokens, setTotalTokens] = useState(0);
  const [sending, setSending] = useState(false);
  const [activeTab, setActiveTab] = useState('single');
  const [selectedUserId, setSelectedUserId] = useState('');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [dataKey, setDataKey] = useState('');
  const [dataValue, setDataValue] = useState('');
  const [confirmModal, setConfirmModal] = useState(null);
  const [results, setResults] = useState([]);

  useEffect(() => {
    const loadTotal = async () => {
      try {
        const res = await adminAPI.getFcmTokens({ limit: 1 });
        setTotalTokens(res.data.pagination?.total || 0);
      } catch (err) {
        console.error('Failed to load token count', err);
      }
    };
    loadTotal();
  }, []);

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
    if (!title.trim() || !body.trim() || !selectedUserId.trim()) {
      toast.error('Title, body, and user ID are required');
      return;
    }

    setSending(true);
    try {
      const res = await adminAPI.sendPush({
        userId: selectedUserId.trim(),
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
      const message = err.response?.data?.message || err.message || 'Failed to send notification';
      const detail = err.response?.data?.error || err.response?.data?.details;
      toast.error(detail ? `${message}: ${detail}` : message);
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
      setTotalTokens((prev) => Math.max(0, prev - (data.invalidTokensRemoved || 0)));
      resetForm();
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Failed to send broadcast';
      const detail = err.response?.data?.error || err.response?.data?.details;
      toast.error(detail ? `${message}: ${detail}` : message);
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
    if (type === 'single' && !selectedUserId.trim()) {
      toast.error('Please enter a user ID');
      return;
    }
    setConfirmModal(type);
  };

  return (
    <div className="push-notifications-page">
      <div className="push-header">
        <div>
          <h3>Push Notifications</h3>
          <p>Send manual and broadcast notifications to app users.</p>
        </div>
        <div className="d-flex align-items-center gap-3">
          <div className="d-flex align-items-center gap-2" style={{ fontSize: '0.9rem', color: '#64748b' }}>
            <i className="bi bi-phone" />
            <span>{totalTokens.toLocaleString()} active tokens</span>
          </div>
          <button className="agent-btn agent-btn-outline-dark" onClick={() => navigate('/agent/dashboard')}>
            <i className="bi bi-arrow-left" /> Back
          </button>
        </div>
      </div>

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
              {activeTab === 'single' && (
                <div className="push-form-group">
                  <label className="push-form-label">User ID</label>
                  <input
                    type="text"
                    className="push-form-control"
                    value={selectedUserId}
                    onChange={(e) => setSelectedUserId(e.target.value)}
                    placeholder="Paste the MongoDB user ID"
                    required
                  />
                  <div className="push-helper">Find the user ID from the user profile or database.</div>
                </div>
              )}

              {activeTab === 'broadcast' && (
                <div className="push-alert push-alert-warning">
                  <i className="bi bi-exclamation-triangle-fill" />
                  <div>
                    <strong>Broadcast will reach all {totalTokens.toLocaleString()} active tokens.</strong><br />
                    This sends to every user with a registered device. Review your message carefully.
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
                  className={`push-btn ${activeTab === 'broadcast' ? 'push-btn-danger' : 'push-btn-primary'}`}
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
                  {(r.failures?.length > 0 || r.batchErrors?.length > 0) && (
                    <div className="mt-3" style={{ fontSize: '0.8rem', color: '#64748b' }}>
                      <div className="fw-semibold mb-1">Sample errors:</div>
                      <ul style={{ paddingLeft: '18px', margin: 0 }}>
                        {r.failures?.slice(0, 3).map((f, i) => (
                          <li key={`f-${i}`}>{f.error || f}</li>
                        ))}
                        {r.batchErrors?.slice(0, 3).map((e, i) => (
                          <li key={`b-${i}`}>{e}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
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
                ? `You are about to send "${title.trim()}" to all ${totalTokens.toLocaleString()} active tokens. This action cannot be undone.`
                : `You are about to send "${title.trim()}" to user ID ${selectedUserId.trim()}.`}
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
