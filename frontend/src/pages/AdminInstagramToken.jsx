import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../services/api';
import toast from 'react-hot-toast';
import '../styles/pushNotifications.css';

const AdminInstagramToken = () => {
  const navigate = useNavigate();
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showToken, setShowToken] = useState(false);

  useEffect(() => {
    const loadToken = async () => {
      try {
        const res = await adminAPI.getInstagramToken();
        setToken(res.data?.data?.token || '');
      } catch (err) {
        toast.error('Failed to load Instagram token');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadToken();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!token.trim()) {
      toast.error('Token cannot be empty');
      return;
    }

    setSaving(true);
    try {
      await adminAPI.updateInstagramToken(token.trim());
      toast.success('Instagram token saved');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save Instagram token');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="push-notifications-page">
      <div className="push-header">
        <div>
          <h3>Instagram Token</h3>
          <p>Manage the Instagram access token used by the mobile app promotion video.</p>
        </div>
        <button className="agent-btn agent-btn-outline-dark" onClick={() => navigate('/agent/dashboard')}>
          <i className="bi bi-arrow-left" /> Back
        </button>
      </div>

      <div className="push-compose-panel">
        <div className="push-compose-header">
          <h4><i className="bi bi-instagram me-2" />Instagram Access Token</h4>
        </div>
        <div className="push-compose-body">
          {loading ? (
            <div className="push-empty">
              <div className="spinner-border text-primary" />
              <p className="mt-2">Loading token...</p>
            </div>
          ) : (
            <form onSubmit={handleSave}>
              <div className="push-form-group">
                <label className="push-form-label">Access Token</label>
                <div className="position-relative">
                  <input
                    type={showToken ? 'text' : 'password'}
                    className="push-form-control"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    placeholder="Paste Instagram Basic Display API token here"
                    required
                    style={{ paddingRight: '80px' }}
                  />
                  <button
                    type="button"
                    className="agent-btn agent-btn-sm"
                    style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)' }}
                    onClick={() => setShowToken((prev) => !prev)}
                  >
                    {showToken ? 'Hide' : 'Show'}
                  </button>
                </div>
                <div className="push-helper">
                  The token is used by the Flutter app to fetch the latest Instagram reels.
                </div>
              </div>

              <div className="push-form-group">
                <label className="push-form-label">How to generate a new token</label>
                <ol className="push-helper" style={{ marginLeft: '16px', paddingLeft: '0' }}>
                  <li>Go to <a href="https://developers.facebook.com/apps/" target="_blank" rel="noopener noreferrer">Facebook Developers</a></li>
                  <li>Open your app → Instagram Basic Display</li>
                  <li>Click <strong>User Token Generator</strong></li>
                  <li>Copy the generated token and paste it above</li>
                </ol>
              </div>

              <div className="push-form-actions">
                <button type="submit" className="agent-btn" disabled={saving}>
                  {saving ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-check-lg me-2" /> Save Token
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminInstagramToken;
