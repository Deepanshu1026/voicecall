import { useEffect, useState } from 'react';
import api from '../services/api';
import '../styles/adminDashboard.css';

const AdminDashboard = () => {
  const [settings, setSettings] = useState({
    unlimitedFreeChat: false,
    freeChatDurationSeconds: 600,
    chatPaymentAmount: 100,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [maintenanceOn, setMaintenanceOn] = useState(false);
  const [maintenanceBusy, setMaintenanceBusy] = useState(false);
  const [maintenanceMsg, setMaintenanceMsg] = useState('');

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await api.get('/settings');
        const s = res.data?.data?.settings || {};
        setSettings((prev) => ({
          unlimitedFreeChat: !!s.unlimitedFreeChat,
          freeChatDurationSeconds: s.freeChatDurationSeconds ?? prev.freeChatDurationSeconds,
          chatPaymentAmount: s.chatPaymentAmount ?? prev.chatPaymentAmount,
        }));
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Failed to load settings');
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  useEffect(() => {
    api
      .get('/settings/maintenance')
      .then((res) => setMaintenanceOn(!!res.data?.data?.enabled))
      .catch(() => {});
  }, []);

  const enableMaintenance = async () => {
    const confirmed = window.confirm(
      'Turn ON maintenance mode for the WHOLE website?\n\n' +
        'Every visitor will see only the maintenance page. The staff area stays accessible. ' +
        'There is no button to turn it back off.'
    );
    if (!confirmed) return;
    setMaintenanceBusy(true);
    setMaintenanceMsg('');
    try {
      await api.post('/settings/maintenance/enable');
      setMaintenanceOn(true);
      setMaintenanceMsg('Maintenance mode is now ON for the whole website.');
    } catch (err) {
      setMaintenanceMsg(err.response?.data?.message || err.message || 'Failed to enable maintenance mode');
    } finally {
      setMaintenanceBusy(false);
    }
  };

  const handleToggle = () => {
    setSettings((prev) => ({ ...prev, unlimitedFreeChat: !prev.unlimitedFreeChat }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings((prev) => ({ ...prev, [name]: parseInt(value) || 0 }));
  };

  const save = async () => {
    setSaving(true);
    setMessage('');
    setError('');
    try {
      const res = await api.put('/settings', {
        unlimitedFreeChat: settings.unlimitedFreeChat,
        freeChatDurationSeconds: settings.freeChatDurationSeconds,
        chatPaymentAmount: settings.chatPaymentAmount,
      });
      const s = res.data?.data?.settings || {};
      setSettings((prev) => ({
        ...prev,
        unlimitedFreeChat: !!s.unlimitedFreeChat,
        freeChatDurationSeconds: s.freeChatDurationSeconds ?? prev.freeChatDurationSeconds,
        chatPaymentAmount: s.chatPaymentAmount ?? prev.chatPaymentAmount,
      }));
      setMessage('Settings saved successfully');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-dashboard">
        <div className="admin-dashboard-card">
          <p className="admin-dashboard-loading">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="admin-dashboard-card">
        <h1 className="admin-dashboard-title">Admin Settings</h1>
        <p className="admin-dashboard-subtitle">Control the free chat experience for users and agents.</p>

        <div className="admin-dashboard-row">
          <div className="admin-dashboard-toggle-label">
            <span className="admin-dashboard-label">Unlimited Free Chat</span>
            <span className="admin-dashboard-hint">
              When enabled, all user-to-agent chats are free without any time limit.
            </span>
          </div>
          <button
            type="button"
            className={`admin-dashboard-toggle ${settings.unlimitedFreeChat ? 'active' : ''}`}
            onClick={handleToggle}
            aria-pressed={settings.unlimitedFreeChat}
          >
            <span className="admin-dashboard-toggle-thumb" />
          </button>
        </div>

        <div className="admin-dashboard-row">
          <label className="admin-dashboard-label" htmlFor="freeChatDurationSeconds">
            Free Chat Duration (seconds)
          </label>
          <input
            id="freeChatDurationSeconds"
            name="freeChatDurationSeconds"
            type="number"
            min="0"
            className="admin-dashboard-input"
            value={settings.freeChatDurationSeconds}
            onChange={handleChange}
            disabled={settings.unlimitedFreeChat}
          />
        </div>

        <div className="admin-dashboard-row">
          <label className="admin-dashboard-label" htmlFor="chatPaymentAmount">
            Chat Payment Amount (INR)
          </label>
          <input
            id="chatPaymentAmount"
            name="chatPaymentAmount"
            type="number"
            min="0"
            className="admin-dashboard-input"
            value={settings.chatPaymentAmount}
            onChange={handleChange}
            disabled={settings.unlimitedFreeChat}
          />
        </div>

        {message && <p className="admin-dashboard-message success">{message}</p>}
        {error && <p className="admin-dashboard-message error">{error}</p>}

        <button
          type="button"
          className="admin-dashboard-save"
          onClick={save}
          disabled={saving}
        >
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>

      <div className="admin-dashboard-card admin-dashboard-danger">
        <h2 className="admin-dashboard-title">Website Maintenance</h2>
        <p className="admin-dashboard-subtitle">
          This shows the maintenance page for the <strong>whole website</strong> — every visitor will see only that
          page. The staff area stays accessible. This switch is one-way: there is no button to turn it back off.
        </p>

        {maintenanceOn ? (
          <p className="admin-dashboard-message success">Maintenance mode is ON.</p>
        ) : (
          <button
            type="button"
            className="admin-dashboard-save admin-dashboard-danger-btn"
            onClick={enableMaintenance}
            disabled={maintenanceBusy}
          >
            {maintenanceBusy ? 'Enabling...' : 'Enable Maintenance Mode'}
          </button>
        )}

        {maintenanceMsg && <p className="admin-dashboard-message">{maintenanceMsg}</p>}
      </div>
    </div>
  );
};

export default AdminDashboard;
