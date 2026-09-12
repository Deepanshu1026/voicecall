import { useEffect, useState } from 'react';
import { adminAPI } from '../services/api';
import toast from 'react-hot-toast';
import '../styles/agentPortal.css';

const initialForm = {
  user_name: '',
  visa_type: '',
  rating: '5',
  story: '',
  user_image: '',
};

const AdminReviews = () => {
  const [form, setForm] = useState(initialForm);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const res = await adminAPI.getReviews();
      setReviews(res.data?.data || []);
    } catch (err) {
      toast.error('Failed to load reviews');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.user_name.trim() || !form.story.trim()) {
      toast.error('Client name and review text are required');
      return;
    }
    try {
      setSaving(true);
      await adminAPI.createReview({
        user_name: form.user_name.trim(),
        visa_type: form.visa_type.trim(),
        rating: Number(form.rating),
        story: form.story.trim(),
        user_image: form.user_image.trim(),
      });
      toast.success('Review added successfully');
      setForm(initialForm);
      fetchReviews();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to add review');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this review?')) return;
    try {
      await adminAPI.deleteReview(id);
      toast.success('Review deleted');
      setReviews((prev) => prev.filter((r) => r._id !== id));
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to delete review');
    }
  };

  const renderStars = (rating) => {
    const n = Math.round(Number(rating) || 0);
    return '★'.repeat(n) + '☆'.repeat(Math.max(0, 5 - n));
  };

  return (
    <>
      <div className="page-header d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 style={{ fontSize: '1.75rem', fontWeight: 600, color: '#1a202c', margin: 0 }}>Reviews</h3>
          <p style={{ color: '#718096', margin: '4px 0 0 0', fontSize: '0.95rem' }}>
            Add client success stories that appear on the website.
          </p>
        </div>
      </div>

      {/* Add review form */}
      <div className="agent-card" style={{ marginBottom: '24px' }}>
        <div className="agent-card-header">
          <h3>Add Review</h3>
        </div>
        <div className="agent-card-body">
          <form onSubmit={handleSubmit}>
            <div className="agent-form-grid">
              <div className="agent-form-group">
                <label>Client Name *</label>
                <input name="user_name" value={form.user_name} onChange={handleChange} placeholder="e.g. Ravi Sharma" required />
              </div>
              <div className="agent-form-group">
                <label>Visa Type / Title</label>
                <input name="visa_type" value={form.visa_type} onChange={handleChange} placeholder="e.g. UK Visitor Visa Approved" />
              </div>
              <div className="agent-form-group">
                <label>Rating (1-5)</label>
                <select name="rating" value={form.rating} onChange={handleChange}>
                  <option value="5">★★★★★ (5)</option>
                  <option value="4">★★★★☆ (4)</option>
                  <option value="3">★★★☆☆ (3)</option>
                  <option value="2">★★☆☆☆ (2)</option>
                  <option value="1">★☆☆☆☆ (1)</option>
                </select>
              </div>
              <div className="agent-form-group">
                <label>Client Image URL</label>
                <input name="user_image" value={form.user_image} onChange={handleChange} placeholder="https://... (optional)" />
              </div>
              <div className="agent-form-group full-width">
                <label>Review Text *</label>
                <textarea name="story" value={form.story} onChange={handleChange} rows={4} placeholder="Write the client's success story..." required />
              </div>
            </div>
            <div className="d-flex gap-2 mt-3">
              <button type="submit" className="agent-btn agent-btn-primary" disabled={saving}>
                {saving ? <><span className="spinner-border spinner-border-sm me-1" /> Saving...</> : <><i className="bi bi-plus-lg" /> Add Review</>}
              </button>
              <button type="button" className="agent-btn agent-btn-outline" onClick={() => setForm(initialForm)}>
                Clear
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Reviews list */}
      <div className="agent-card">
        <div className="agent-card-header">
          <h3>All Reviews</h3>
          <span className="text-muted" style={{ fontSize: '0.85rem' }}>
            Total: <strong>{reviews.length}</strong>
          </span>
        </div>
        <div className="agent-card-body" style={{ overflowX: 'auto' }}>
          {loading ? (
            <div className="agent-loading">
              <div className="spinner-border text-primary" role="status" />
              <p className="mt-2 text-muted">Loading reviews...</p>
            </div>
          ) : reviews.length === 0 ? (
            <div className="agent-empty">
              <i className="bi bi-star" />
              <div className="fw-semibold">No reviews yet</div>
              <div className="small">Add your first client review above.</div>
            </div>
          ) : (
            <table className="agent-table">
              <thead>
                <tr>
                  <th style={{ width: '60px' }}>#</th>
                  <th>Client</th>
                  <th>Title / Visa</th>
                  <th>Rating</th>
                  <th>Review</th>
                  <th style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {reviews.map((r, idx) => (
                  <tr key={r._id}>
                    <td style={{ color: '#718096', fontSize: '0.85rem' }}>{idx + 1}</td>
                    <td className="fw-semibold">{r.user_name || r.title || 'Anonymous'}</td>
                    <td>{r.visa_type || r.subtitle || '—'}</td>
                    <td style={{ color: '#f59e0b', whiteSpace: 'nowrap' }}>{renderStars(r.rating ?? r.stars)}</td>
                    <td style={{ maxWidth: '360px' }}>
                      <span style={{ display: 'inline-block', maxWidth: '360px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', verticalAlign: 'bottom' }}>
                        {r.story || r.description || r.content || ''}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button className="agent-btn agent-btn-sm" onClick={() => handleDelete(r._id)} title="Delete">
                        <i className="bi bi-trash" /> Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
};

export default AdminReviews;
