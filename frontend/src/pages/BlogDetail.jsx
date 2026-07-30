import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import LandingLayout from '../components/user/LandingLayout';
import { blogAPI } from '../services/api';
import '../styles/blogs.css';

const fallbackImage = '/images/user/touristvisa_full 1.webp';

const slugify = (text) =>
  text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
};

const stripHtml = (html) => {
  if (!html) return '';
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
};

const BlogDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const postId = id;

  useEffect(() => {
    let cancelled = false;
    const loadPost = async () => {
      try {
        const [postRes, relatedRes] = await Promise.all([
          blogAPI.getPostById(postId),
          blogAPI.getRelatedPosts(postId),
        ]);
        const found = postRes.data?.data;
        const others = relatedRes.data?.data || [];
        if (!cancelled) {
          if (found) {
            setPost({
              ...found,
              id: found._id || found.legacyId,
              featured_image: found.featuredImage || '',
              image_alt: found.imageAlt || '',
              created_at: found.createdAt,
              category: found.category || 'General',
            });
            setRelated(
              others.map((p) => ({
                ...p,
                id: p._id || p.legacyId,
                featured_image: p.featuredImage || '',
                image_alt: p.imageAlt || '',
                created_at: p.createdAt,
              }))
            );
          } else {
            setNotFound(true);
          }
          setLoading(false);
        }
      } catch (err) {
        console.error('Failed to load post:', err);
        if (!cancelled) {
          setNotFound(true);
          setLoading(false);
        }
      }
    };
    loadPost();
    return () => { cancelled = true; };
  }, [postId]);

  const pageUrl = useMemo(() => `https://avisaexperts.com/blog/${post?.id}/${slugify(post?.title || '')}`, [post]);
  const metaDescription = useMemo(() => {
    if (!post) return '';
    return post.excerpt ? stripHtml(post.excerpt).slice(0, 160) : stripHtml(post.content).slice(0, 160);
  }, [post]);
  const metaTitle = useMemo(() => (post ? `${post.title} | A Visa Experts Blog` : 'Blog | A Visa Experts'), [post]);
  const imageUrl = post?.featured_image || fallbackImage;
  const keywords = useMemo(() => {
    if (!post) return '';
    const base = ['visa', 'immigration', 'A Visa Experts', 'Kaveesh Kapoor'];
    const cats = post.category ? [post.category] : [];
    return [...base, ...cats].join(', ');
  }, [post]);

  const jsonLd = useMemo(() => {
    if (!post) return null;
    return {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: post.title,
      description: metaDescription,
      image: imageUrl,
      url: pageUrl,
      datePublished: post.created_at,
      dateModified: post.created_at,
      author: {
        '@type': 'Organization',
        name: 'A Visa Experts',
        url: 'https://avisaexperts.com',
      },
      publisher: {
        '@type': 'Organization',
        name: 'A Visa Experts',
        logo: {
          '@type': 'ImageObject',
          url: 'https://avisaexperts.com/images/user/tmlogo 1.webp',
        },
      },
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': pageUrl,
      },
    };
  }, [post, metaDescription, imageUrl, pageUrl]);

  const breadcrumbJsonLd = useMemo(() => {
    if (!post) return null;
    return {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: 'https://avisaexperts.com/home',
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Blogs',
          item: 'https://avisaexperts.com/blogs',
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: post.title,
          item: pageUrl,
        },
      ],
    };
  }, [post, pageUrl]);

  if (loading) {
    return (
      <LandingLayout>
        <div className="blogs-page">
          <div className="blogs-loading">Loading article...</div>
        </div>
      </LandingLayout>
    );
  }

  if (notFound || !post) {
    return (
      <LandingLayout>
        <div className="blogs-page">
          <Helmet>
            <title>Article Not Found | A Visa Experts Blog</title>
            <meta name="robots" content="noindex, follow" />
          </Helmet>
          <div className="blogs-empty" style={{ padding: '160px 20px 80px' }}>
            <h3>Article Not Found</h3>
            <p>The blog post you are looking for does not exist.</p>
            <button className="blogs-cta-primary" style={{ marginTop: '24px' }} onClick={() => navigate('/blogs')}>
              Back to Blogs
            </button>
          </div>
        </div>
      </LandingLayout>
    );
  }

  return (
    <LandingLayout>
      <div className="blogs-page">
        <Helmet>
          <title>{metaTitle}</title>
          <meta name="description" content={metaDescription} />
          <meta name="keywords" content={keywords} />
          <link rel="canonical" href={pageUrl} />
          <meta property="og:type" content="article" />
          <meta property="og:title" content={post.title} />
          <meta property="og:description" content={metaDescription} />
          <meta property="og:url" content={pageUrl} />
          <meta property="og:image" content={imageUrl} />
          <meta property="og:site_name" content="A Visa Experts" />
          <meta property="article:published_time" content={post.created_at} />
          <meta property="article:modified_time" content={post.created_at} />
          <meta property="article:section" content={post.category || 'General'} />
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content={post.title} />
          <meta name="twitter:description" content={metaDescription} />
          <meta name="twitter:image" content={imageUrl} />
          {jsonLd && <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>}
          {breadcrumbJsonLd && <script type="application/ld+json">{JSON.stringify(breadcrumbJsonLd)}</script>}
        </Helmet>

        <article className="blog-detail">
          <div className="blog-detail-hero">
            <div className="blog-detail-hero-bg">
              <img src={imageUrl} alt={post.image_alt || post.title} onError={(e) => { e.target.src = fallbackImage; }} />
              <div className="blog-detail-hero-overlay" />
            </div>
            <div className="blog-detail-hero-content">
              <div className="blogs-container">
                <span className="blog-detail-category">{post.category || 'General'}</span>
                <h1>{post.title}</h1>
                <div className="blog-detail-meta">
                  <span>Published on {formatDate(post.created_at)}</span>
                  <span>By A Visa Experts</span>
                </div>
              </div>
            </div>
          </div>

          <div className="blogs-container">
            <nav className="blog-breadcrumb" aria-label="Breadcrumb">
              <ol>
                <li><Link to="/home">Home</Link></li>
                <li><Link to="/blogs">Blogs</Link></li>
                <li aria-current="page">{post.title}</li>
              </ol>
            </nav>
            <div className="blog-detail-layout">
              <div className="blog-detail-content">
                <div
                  className="blog-detail-body"
                  dangerouslySetInnerHTML={{ __html: post.content }}
                />
                <div className="blog-detail-actions">
                  <button className="blogs-cta-primary" onClick={() => navigate('/appointment')}>
                    Book Consultation
                  </button>
                  <button className="blogs-cta-secondary" onClick={() => navigate('/consultants')}>
                    Talk to an Expert
                  </button>
                </div>
              </div>

              <aside className="blog-detail-sidebar">
                <div className="blog-sidebar-card">
                  <h3>Need Help With Your Visa?</h3>
                  <p>
                    Get expert guidance from A Visa Experts. We have helped thousands of clients secure their visas with
                    confidence.
                  </p>
                  <button className="blogs-cta-primary" onClick={() => navigate('/appointment')}>
                    Book Free Consultation
                  </button>
                </div>
                <div className="blog-sidebar-card">
                  <h3>Popular Services</h3>
                  <ul className="blog-sidebar-links">
                    <li><Link to="/tourist-visa">Tourist Visa</Link></li>
                    <li><Link to="/work-visa">Work Visa</Link></li>
                    <li><Link to="/transit-visa">Transit Visa</Link></li>
                    <li><Link to="/consultants">Our Advisors</Link></li>
                  </ul>
                </div>
              </aside>
            </div>
          </div>
        </article>

        {related.length > 0 && (
          <section className="blogs-section blog-related-section">
            <div className="blogs-container">
              <h2 className="blog-related-title">Related Articles</h2>
              <div className="blogs-grid">
                {related.map((item) => (
                  <Link
                    className="blogs-card"
                    key={item.id}
                    to={`/blog/${item.id}/${slugify(item.title)}`}
                  >
                    <div className="blogs-card-image">
                      <img
                        src={item.featured_image || fallbackImage}
                        alt={item.image_alt || item.title}
                        onError={(e) => { e.target.src = fallbackImage; }}
                      />
                      <span className="blogs-card-category">{item.category || 'General'}</span>
                    </div>
                    <div className="blogs-card-body">
                      <span className="blogs-date">{formatDate(item.created_at)}</span>
                      <h3>{item.title}</h3>
                      <p>{item.excerpt}</p>
                      <span className="blogs-card-link">Read More →</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}
      </div>
    </LandingLayout>
  );
};

export default BlogDetail;
