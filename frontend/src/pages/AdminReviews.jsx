import { useEffect, useState } from 'react';
import { adminAPI } from '../services/api';
import toast from 'react-hot-toast';
import '../styles/adminReviews.css';

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

  const initials = (name) =>
    (name || '?')
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0].toUpperCase())
      .join('');

  return (
    <div className="admin-reviews-page">
      <div className="admin-reviews-header">
        <h2>Reviews</h2>
        <p>Add client success stories that appear on the website.</p>
      </div>

      {/* Add review form */}
      <div className="review-form-card">
        <h3 className="review-form-title">
          <i className="bi bi-plus-circle" /> Add Review
        </h3>
        <form onSubmit={handleSubmit}>
          <div className="review-form-grid">
            <div className="review-field">
              <label>
                Client Name <span className="req">*</span>
              </label>
              <input
                name="user_name"
                value={form.user_name}
                onChange={handleChange}
                placeholder="e.g. Ravi Sharma"
                required
              />
            </div>
            <div className="review-field">
              <label>Visa Type / Title</label>
              <input
                name="visa_type"
                value={form.visa_type}
                onChange={handleChange}
                placeholder="e.g. UK Visitor Visa Approved"
              />
            </div>
            <div className="review-field">
              <label>Rating</label>
              <select name="rating" value={form.rating} onChange={handleChange}>
                <option value="5">★★★★★ (5)</option>
                <option value="4">★★★★☆ (4)</option>
                <option value="3">★★★☆☆ (3)</option>
                <option value="2">★★☆☆☆ (2)</option>
                <option value="1">★☆☆☆☆ (1)</option>
              </select>
            </div>
            <div className="review-field">
              <label>Client Image URL</label>
              <input
                name="user_image"
                value={form.user_image}
                onChange={handleChange}
                placeholder="https://... (optional)"
              />
            </div>
            <div className="review-field full">
              <label>
                Review Text <span className="req">*</span>
              </label>
              <textarea
                name="story"
                value={form.story}
                onChange={handleChange}
                rows={4}
                placeholder="Write the client's success story..."
                required
              />
            </div>
          </div>
          <div className="review-form-actions">
            <button type="submit" className="review-submit-btn" disabled={saving}>
              {saving ? (
                <>
                  <span className="spinner-border spinner-border-sm" /> Saving...
                </>
              ) : (
                <>
                  <i className="bi bi-check-lg" /> Add Review
                </>
              )}
            </button>
            <button type="button" className="review-clear-btn" onClick={() => setForm(initialForm)}>
              Clear
            </button>
          </div>
        </form>
      </div>

      {/* Reviews list */}
      <div className="reviews-list-header">
        <h3>
          <i className="bi bi-star-fill" /> All Reviews
        </h3>
        <span className="reviews-count">{reviews.length} total</span>
      </div>

      {loading ? (
        <div className="reviews-empty">
          <div className="spinner-border text-primary" role="status" />
          <p className="mt-3 mb-0">Loading reviews...</p>
        </div>
      ) : reviews.length === 0 ? (
        <div className="reviews-empty">
          <i className="bi bi-star" />
          <div className="fw-semibold">No reviews yet</div>
          <div className="small mt-1">Add your first client review above.</div>
        </div>
      ) : (
        <div className="review-cards">
          {reviews.map((r) => {
            const name = r.user_name || r.title || 'Anonymous';
            const visa = r.visa_type || r.subtitle;
            const text = r.story || r.description || r.content || '';
            const stars = r.rating ?? r.stars;
            return (
              <div className="review-item" key={r._id}>
                {r.user_image ? (
                  <img className="review-item-avatar" src={r.user_image} alt={name} />
                ) : (
                  <div className="review-item-avatar-fallback">{initials(name)}</div>
                )}
                <div className="review-item-body">
                  <div className="review-item-top">
                    <span className="review-item-name">{name}</span>
                    <span className="review-item-stars">{renderStars(stars)}</span>
                  </div>
                  {visa && <span className="review-item-visa">{visa}</span>}
                  {text && <p className="review-item-text">{text}</p>}
                </div>
                <button
                  className="review-item-delete"
                  onClick={() => handleDelete(r._id)}
                  title="Delete review"
                >
                  <i className="bi bi-trash" /> Delete
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AdminReviews;
