import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { bannerAPI } from '../services/api';
import toast from 'react-hot-toast';
import '../styles/pushNotifications.css';

const AdminBannerControl = () => {
  const navigate = useNavigate();
  const [banner, setBanner] = useState({
    enabled: true,
    imageUrl: '',
    altText: 'Special offer',
    link: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');

  useEffect(() => {
    const loadBanner = async () => {
      try {
        const res = await bannerAPI.getBanner();
        const data = res.data?.data || {};
        const bannerData = {
          enabled: data.enabled !== false,
          imageUrl: data.imageUrl || '',
          altText: data.altText || 'Special offer',
          link: data.link || '',
        };
        setBanner(bannerData);
        setPreviewUrl(bannerData.imageUrl);
      } catch (err) {
        toast.error('Failed to load banner settings');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadBanner();
  }, []);

  const handleChange = (field, value) => {
    setBanner((prev) => ({ ...prev, [field]: value }));
    if (field === 'imageUrl') setPreviewUrl(value);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!banner.imageUrl.trim()) {
      toast.error('Image URL is required');
      return;
    }
    if (banner.link && !isValidUrl(banner.link.trim())) {
      toast.error('Invalid link URL');
      return;
    }

    setSaving(true);
    try {
      await bannerAPI.updateBanner({
        enabled: banner.enabled,
        imageUrl: banner.imageUrl.trim(),
        altText: banner.altText.trim() || 'Special offer',
        link: banner.link.trim() || '',
      });
      toast.success('Banner updated successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update banner');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  return (
    <div className="push-notifications-page">
      <div className="push-header">
        <div>
          <h3>Offer Banner Control</h3>
          <p>Change the website popup banner image, link, and visibility.</p>
        </div>
        <button className="agent-btn agent-btn-outline-dark" onClick={() => navigate('/agent/dashboard')}>
          <i className="bi bi-arrow-left" /> Back
        </button>
      </div>

      <div className="push-compose-panel">
        <div className="push-compose-header">
          <h4><i className="bi bi-image me-2" />Banner Settings</h4>
        </div>
        <div className="push-compose-body">
          {loading ? (
            <div className="push-empty">
              <div className="spinner-border text-primary" />
              <p className="mt-2">Loading banner...</p>
            </div>
          ) : (
            <form onSubmit={handleSave}>
              <div className="push-form-grid">
                <div>
                  <div className="push-form-group">
                    <label className="push-form-label d-flex align-items-center gap-2">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        style={{ width: '18px', height: '18px', marginTop: 0 }}
                        checked={banner.enabled}
                        onChange={(e) => handleChange('enabled', e.target.checked)}
                      />
                      <span>Show banner on website</span>
                    </label>
                    <div className="push-helper">Toggle this to show or hide the popup banner on all public pages.</div>
                  </div>

                  <div className="push-form-group">
                    <label className="push-form-label">Banner Image URL</label>
                    <input
                      type="url"
                      className="push-form-control"
                      value={banner.imageUrl}
                      onChange={(e) => handleChange('imageUrl', e.target.value)}
                      placeholder="https://example.com/banner.jpg"
                      required
                    />
                    <div className="push-helper">Use a direct image link. Google Drive shared links must be converted to direct image URLs.</div>
                  </div>

                  <div className="push-form-group">
                    <label className="push-form-label">Alt Text</label>
                    <input
                      type="text"
                      className="push-form-control"
                      value={banner.altText}
                      onChange={(e) => handleChange('altText', e.target.value)}
                      placeholder="Special offer"
                    />
                  </div>

                  <div className="push-form-group">
                    <label className="push-form-label">Link URL (optional)</label>
                    <input
                      type="url"
                      className="push-form-control"
                      value={banner.link}
                      onChange={(e) => handleChange('link', e.target.value)}
                      placeholder="https://example.com/offer"
                    />
                    <div className="push-helper">If provided, clicking the banner will open this link in a new tab.</div>
                  </div>

                  <div className="push-actions">
                    <button type="submit" className="push-btn push-btn-primary" disabled={saving}>
                      {saving ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-save me-2" /> Save Changes
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div className="push-preview-card">
                  <div className="push-preview-title">Preview</div>
                  <div className="push-phone">
                    <div className="push-phone-notch" />
                    <div className="push-phone-screen" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
                      {previewUrl ? (
                        <div style={{ position: 'relative', width: '100%' }}>
                          <button
                            type="button"
                            style={{
                              position: 'absolute',
                              top: '-10px',
                              right: '-10px',
                              width: '28px',
                              height: '28px',
                              borderRadius: '50%',
                              border: 'none',
                              background: '#1e293b',
                              color: '#fff',
                              fontSize: '1.1rem',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'default',
                            }}
                          >
                            &times;
                          </button>
                          <img
                            src={previewUrl}
                            alt={banner.altText}
                            style={{ width: '100%', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}
                            onError={(e) => { e.target.style.display = 'none'; }}
                            onLoad={(e) => { e.target.style.display = 'block'; }}
                          />
                        </div>
                      ) : (
                        <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>
                          <i className="bi bi-image" style={{ fontSize: '2rem', display: 'block', marginBottom: '8px' }} />
                          Enter an image URL to preview
                        </div>
                      )}
                    </div>
                  </div>
                  {!banner.enabled && (
                    <div className="push-alert push-alert-warning mt-3" style={{ marginTop: '16px' }}>
                      <i className="bi bi-eye-slash" />
                      <div>Banner is currently hidden from website visitors.</div>
                    </div>
                  )}
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminBannerControl;
