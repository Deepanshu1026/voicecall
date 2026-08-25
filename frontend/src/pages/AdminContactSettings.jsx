import { useEffect, useState } from 'react';
import api from '../services/api';
import '../styles/adminDashboard.css';

const DEFAULT_CONTACT = {
  email: 'Support@avisaexperts.com',
  phone: '+91 120-4502750',
  whatsapp: '+91 9711000022',
  emailResponseTime: 'Response within 2-4 hours',
  phoneHours: 'Mon-Sat, 11AM-6PM EST',
  whatsappHours: 'Mon-Sat, 11AM-6PM EST',
};

const AdminContactSettings = () => {
  const [settings, setSettings] = useState(DEFAULT_CONTACT);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/settings/contact')
      .then((res) => {
        const s = res.data?.data?.settings;
        if (s) setSettings((prev) => ({ ...prev, ...s }));
      })
      .catch((err) => setError(err.response?.data?.message || 'Failed to load'))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings((prev) => ({ ...prev, [name]: value }));
  };

  const save = async () => {
    setSaving(true);
    setMessage('');
    setError('');
    try {
      await api.put('/settings/contact', settings);
      setMessage('Contact settings saved successfully');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-dashboard">
        <div className="admin-dashboard-card">
          <p>Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="admin-dashboard-card">
        <h1 className="admin-dashboard-title">Contact Settings</h1>
        <p className="admin-dashboard-subtitle">
          Manage the contact info shown on the &quot;Let&apos;s Connect With Our Team&quot; section
          of the landing page.
        </p>

        <div className="admin-dashboard-row">
          <label className="admin-dashboard-label" htmlFor="email">Email Address</label>
          <input
            id="email" name="email" type="email"
            className="admin-dashboard-input"
            value={settings.email} onChange={handleChange}
          />
        </div>

        <div className="admin-dashboard-row">
          <label className="admin-dashboard-label" htmlFor="phone">Phone Number</label>
          <input
            id="phone" name="phone" type="text"
            className="admin-dashboard-input"
            value={settings.phone} onChange={handleChange}
          />
        </div>

        <div className="admin-dashboard-row">
          <label className="admin-dashboard-label" htmlFor="whatsapp">WhatsApp Number</label>
          <input
            id="whatsapp" name="whatsapp" type="text"
            className="admin-dashboard-input"
            value={settings.whatsapp} onChange={handleChange}
          />
        </div>

        <div className="admin-dashboard-row">
          <label className="admin-dashboard-label" htmlFor="emailResponseTime">Email Response Time</label>
          <input
            id="emailResponseTime" name="emailResponseTime" type="text"
            className="admin-dashboard-input"
            value={settings.emailResponseTime} onChange={handleChange}
          />
        </div>

        <div className="admin-dashboard-row">
          <label className="admin-dashboard-label" htmlFor="phoneHours">Phone Availability Hours</label>
          <input
            id="phoneHours" name="phoneHours" type="text"
            className="admin-dashboard-input"
            value={settings.phoneHours} onChange={handleChange}
          />
        </div>

        <div className="admin-dashboard-row">
          <label className="admin-dashboard-label" htmlFor="whatsappHours">WhatsApp Availability Hours</label>
          <input
            id="whatsappHours" name="whatsappHours" type="text"
            className="admin-dashboard-input"
            value={settings.whatsappHours} onChange={handleChange}
          />
        </div>

        {message && <p className="admin-dashboard-message success">{message}</p>}
        {error && <p className="admin-dashboard-message error">{error}</p>}

        <button type="button" className="admin-dashboard-save" onClick={save} disabled={saving}>
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </div>
  );
};

export default AdminContactSettings;
