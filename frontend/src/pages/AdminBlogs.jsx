import { useEffect, useRef, useState } from 'react';
import { adminAPI } from '../services/api';
import toast from 'react-hot-toast';
import '../styles/adminBlogs.css';

const CATEGORIES = ['General', 'Tourist Visa', 'Country Guides', 'Company News', 'Leadership', 'Immigration Updates', 'Success Stories'];

const todayStr = () => new Date().toISOString().split('T')[0];

const initialForm = {
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  featuredImage: '',
  imageAlt: '',
  category: 'General',
  tags: '',
  author: 'A Visa Experts',
  metaTitle: '',
  metaDescription: '',
  metaKeywords: '',
  canonicalUrl: '',
  publishedAt: todayStr(),
  status: 'published',
};

const slugify = (text) =>
  String(text || '')
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');

const AdminBlogs = () => {
  const [form, setForm] = useState(initialForm);
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [slugTouched, setSlugTouched] = useState(false);
  const [search, setSearch] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const formRef = useRef(null);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const res = await adminAPI.getBlogs({ search });
      setBlogs(res.data?.data || []);
    } catch (err) {
      toast.error('Failed to load blogs');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => {
      const next = { ...prev, [name]: value };
      if (name === 'title' && !slugTouched) next.slug = slugify(value);
      if (name === 'title' && !prev.metaTitle) next.metaTitle = value;
      return next;
    });
    if (name === 'slug') setSlugTouched(true);
  };

  const resetForm = () => {
    setForm(initialForm);
    setEditingId(null);
    setSlugTouched(false);
    setShowPreview(false);
  };

  const handleEdit = (post) => {
    setEditingId(post._id);
    setSlugTouched(true);
    setForm({
      title: post.title || '',
      slug: post.slug || '',
      excerpt: post.excerpt || '',
      content: post.content || '',
      featuredImage: post.featuredImage || '',
      imageAlt: post.imageAlt || '',
      category: post.category || 'General',
      tags: Array.isArray(post.tags) ? post.tags.join(', ') : (post.tags || ''),
      author: post.author || 'A Visa Experts',
      metaTitle: post.metaTitle || '',
      metaDescription: post.metaDescription || '',
      metaKeywords: post.metaKeywords || '',
      canonicalUrl: post.canonicalUrl || '',
      publishedAt: post.publishedAt ? String(post.publishedAt).slice(0, 10) : todayStr(),
      status: post.status || 'published',
    });
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      toast.error('Title is required');
      return;
    }
    if (!form.content.trim()) {
      toast.error('Content is required');
      return;
    }
    const payload = {
      ...form,
      slug: form.slug || slugify(form.title),
      imageAlt: form.imageAlt || form.title,
      metaTitle: form.metaTitle || form.title,
      metaDescription: form.metaDescription || form.excerpt,
    };
    try {
      setSaving(true);
      if (editingId) {
        await adminAPI.updateBlog(editingId, payload);
        toast.success('Blog updated successfully');
      } else {
        await adminAPI.createBlog(payload);
        toast.success('Blog published successfully');
      }
      resetForm();
      fetchBlogs();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save blog');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this blog permanently?')) return;
    try {
      await adminAPI.deleteBlog(id);
      toast.success('Blog deleted');
      setBlogs((prev) => prev.filter((b) => b._id !== id));
      if (editingId === id) resetForm();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to delete blog');
    }
  };

  const previewSlug = form.slug || slugify(form.title) || 'your-blog-title';
  const previewUrl = form.canonicalUrl || `https://avisaexperts.com/blog/${editingId || 'new'}/${previewSlug}`;
  const serpTitle = form.metaTitle || form.title || 'Your blog title';
  const serpDesc = form.metaDescription || form.excerpt || 'Add a meta description to control how this blog appears on Google.';

  return (
    <div className="admin-blogs-page">
      <div className="admin-blogs-header">
        <div>
          <h2>{editingId ? 'Edit Blog' : 'Blogs'}</h2>
          <p>Publish SEO-optimised blog posts that appear on the website&apos;s blog page.</p>
        </div>
        {editingId && (
          <button className="blog-btn ghost" onClick={resetForm}>+ New Blog</button>
        )}
      </div>

      {/* Editor */}
      <form className="blog-form-card" onSubmit={handleSubmit} ref={formRef}>
        <h3 className="blog-form-title">
          <i className={editingId ? 'bi bi-pencil-square' : 'bi bi-journal-plus'} />
          {editingId ? 'Edit Blog Post' : 'Create New Blog Post'}
        </h3>

        <div className="blog-form-grid">
          <div className="blog-field full">
            <label>Blog Title <span className="req">*</span></label>
            <input name="title" value={form.title} onChange={handleChange} placeholder="e.g. UK Tourist Visa 2026: Complete Guide" />
          </div>

          <div className="blog-field">
            <label>URL Slug</label>
            <input name="slug" value={form.slug} onChange={handleChange} placeholder="auto-generated-from-title" />
          </div>
          <div className="blog-field">
            <label>Category</label>
            <select name="category" value={form.category} onChange={handleChange}>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="blog-field full">
            <label>Excerpt / Summary</label>
            <textarea name="excerpt" value={form.excerpt} onChange={handleChange} rows={2} placeholder="Short summary shown on the blog listing and used as fallback meta description." />
          </div>

          <div className="blog-field full">
            <div className="blog-label-row">
              <label>Content (HTML supported) <span className="req">*</span></label>
              <button type="button" className="blog-btn ghost small" onClick={() => setShowPreview((v) => !v)}>
                {showPreview ? 'Hide Preview' : 'Show Preview'}
              </button>
            </div>
            <textarea
              name="content"
              value={form.content}
              onChange={handleChange}
              rows={12}
              className="blog-content-input"
              placeholder="<h2>Introduction</h2><p>Write your blog content here...</p>"
            />
            {showPreview && (
              <div className="blog-content-preview" dangerouslySetInnerHTML={{ __html: form.content }} />
            )}
          </div>

          <div className="blog-field">
            <label>Featured Image URL</label>
            <input name="featuredImage" value={form.featuredImage} onChange={handleChange} placeholder="https://..." />
          </div>
          <div className="blog-field">
            <label>Image Alt Text (SEO)</label>
            <input name="imageAlt" value={form.imageAlt} onChange={handleChange} placeholder="Describe the image" />
          </div>
          {form.featuredImage && (
            <div className="blog-field full">
              <img className="blog-image-preview" src={form.featuredImage} alt={form.imageAlt || 'preview'} onError={(e) => { e.currentTarget.style.display = 'none'; }} />
            </div>
          )}
        </div>

        {/* SEO section */}
        <div className="blog-seo-section">
          <h4><i className="bi bi-google" /> Search Engine Optimisation</h4>
          <div className="blog-serp-preview">
            <div className="serp-url">{previewUrl}</div>
            <div className="serp-title">{serpTitle}</div>
            <div className="serp-desc">{serpDesc}</div>
          </div>

          <div className="blog-form-grid">
            <div className="blog-field full">
              <label>Meta Title <span className={`counter ${(form.metaTitle || form.title).length > 60 ? 'over' : ''}`}>{(form.metaTitle || form.title).length}/60</span></label>
              <input name="metaTitle" value={form.metaTitle} onChange={handleChange} placeholder="SEO title (leave blank to use blog title)" />
            </div>
            <div className="blog-field full">
              <label>Meta Description <span className={`counter ${(form.metaDescription || form.excerpt).length > 160 ? 'over' : ''}`}>{(form.metaDescription || form.excerpt).length}/160</span></label>
              <textarea name="metaDescription" value={form.metaDescription} onChange={handleChange} rows={2} placeholder="SEO description (leave blank to use excerpt)" />
            </div>
            <div className="blog-field full">
              <label>Meta Keywords</label>
              <input name="metaKeywords" value={form.metaKeywords} onChange={handleChange} placeholder="uk tourist visa, visa consultants, ..." />
            </div>
            <div className="blog-field">
              <label>Canonical URL</label>
              <input name="canonicalUrl" value={form.canonicalUrl} onChange={handleChange} placeholder="https://avisaexperts.com/blog/..." />
            </div>
            <div className="blog-field">
              <label>Tags (comma separated)</label>
              <input name="tags" value={form.tags} onChange={handleChange} placeholder="uk, tourist visa, guide" />
            </div>
            <div className="blog-field">
              <label>Author</label>
              <input name="author" value={form.author} onChange={handleChange} />
            </div>
            <div className="blog-field">
              <label>Publish Date</label>
              <input type="date" name="publishedAt" value={form.publishedAt} onChange={handleChange} />
            </div>
            <div className="blog-field">
              <label>Status</label>
              <select name="status" value={form.status} onChange={handleChange}>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
            </div>
          </div>
        </div>

        <div className="blog-form-actions">
          <button type="submit" className="blog-btn primary" disabled={saving}>
            {saving ? <><span className="spinner-border spinner-border-sm" /> Saving...</> : <><i className="bi bi-check-lg" /> {editingId ? 'Update Blog' : 'Publish Blog'}</>}
          </button>
          {editingId && <button type="button" className="blog-btn ghost" onClick={resetForm}>Cancel</button>}
        </div>
      </form>

      {/* List */}
      <div className="blog-list-header">
        <h3><i className="bi bi-journal-text" /> All Blogs</h3>
        <input className="blog-search" placeholder="Search blogs..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {loading ? (
        <div className="blog-empty"><div className="spinner-border text-primary" role="status" /></div>
      ) : blogs.length === 0 ? (
        <div className="blog-empty"><i className="bi bi-journal" /><div className="fw-semibold">No blogs yet</div></div>
      ) : (
        <div className="blog-cards">
          {blogs.map((b) => (
            <div className={`blog-item ${editingId === b._id ? 'editing' : ''}`} key={b._id}>
              {b.featuredImage ? (
                <img className="blog-item-thumb" src={b.featuredImage} alt={b.imageAlt || b.title} onError={(e) => { e.currentTarget.style.display = 'none'; }} />
              ) : (
                <div className="blog-item-thumb fallback"><i className="bi bi-image" /></div>
              )}
              <div className="blog-item-body">
                <div className="blog-item-top">
                  <span className="blog-item-title">{b.title}</span>
                  <span className={`blog-status ${b.status}`}>{b.status}</span>
                </div>
                <div className="blog-item-meta">
                  <span>{b.category || 'General'}</span>
                  <span>•</span>
                  <span>{b.publishedAt ? new Date(b.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}</span>
                  {b.clicks > 0 && <><span>•</span><span>{b.clicks} views</span></>}
                </div>
                {b.excerpt && <p className="blog-item-excerpt">{b.excerpt}</p>}
              </div>
              <div className="blog-item-actions">
                <button className="blog-btn ghost small" onClick={() => handleEdit(b)}><i className="bi bi-pencil" /> Edit</button>
                <button className="blog-btn danger small" onClick={() => handleDelete(b._id)}><i className="bi bi-trash" /> Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminBlogs;
