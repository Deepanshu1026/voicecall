import { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import LandingLayout from '../components/user/LandingLayout';
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

const deriveCategory = (title) => {
  const t = title.toLowerCase();
  if (t.includes('work') || t.includes('seasonal') || t.includes('lmia') || t.includes('permit')) return 'Work Visa';
  if (t.includes('tourist') || t.includes('travel') || t.includes('visitor')) return 'Tourist Visa';
  if (t.includes('kaveesh kapoor')) return 'Leadership';
  if (t.includes('app') || t.includes('consultation')) return 'Company News';
  if (t.includes('canada') || t.includes('uk') || t.includes('russia') || t.includes('japan') || t.includes('australia') || t.includes('hong kong') || t.includes('usa') || t.includes('europe')) return 'Country Guides';
  return 'General';
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

const Blogs = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [visibleCount, setVisibleCount] = useState(6);

  useEffect(() => {
    fetch('/data/blog_posts.json')
      .then((res) => res.json())
      .then((data) => {
        const enriched = data.map((post) => ({ ...post, derivedCategory: deriveCategory(post.title) }));
        setPosts(enriched);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const categories = useMemo(() => {
    const cats = new Set(posts.map((p) => p.derivedCategory));
    return ['All', ...Array.from(cats).sort()];
  }, [posts]);

  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      const matchesSearch =
        post.title.toLowerCase().includes(search.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = activeCategory === 'All' || post.derivedCategory === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [posts, search, activeCategory]);

  const featuredPost = filteredPosts[0];
  const gridPosts = filteredPosts.slice(1, visibleCount + 1);
  const hasMore = filteredPosts.length > visibleCount + 1;

  const handleLoadMore = () => setVisibleCount((prev) => prev + 6);

  useEffect(() => {
    setVisibleCount(6);
  }, [search, activeCategory]);

  const listJsonLd = useMemo(() => {
    return {
      '@context': 'https://schema.org',
      '@type': 'Blog',
      name: 'A Visa Experts Blog',
      url: 'https://avisaexperts.com/blogs',
      description:
        'Stay updated with expert visa tips, country guides, and success stories from A Visa Experts.',
      publisher: {
        '@type': 'Organization',
        name: 'A Visa Experts',
        logo: 'https://avisaexperts.com/images/user/tmlogo 1.webp',
      },
      blogPost: posts.slice(0, 12).map((post) => ({
        '@type': 'BlogPosting',
        headline: post.title,
        url: `https://avisaexperts.com/blog/${post.id}/${slugify(post.title)}`,
        datePublished: post.created_at,
        image: post.featured_image || fallbackImage,
      })),
    };
  }, [posts]);

  const breadcrumbJsonLd = useMemo(() => {
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
      ],
    };
  }, []);

  return (
    <LandingLayout>
      <div className="blogs-page">
        <Helmet>
          <title>A Visa Experts Blog | Visa Tips, Guides & Success Stories</title>
          <meta
            name="description"
            content="Explore expert visa tips, country guides, immigration updates, and success stories from A Visa Experts, India's trusted visa and immigration company."
          />
          <meta
            name="keywords"
            content="visa blog, immigration tips, tourist visa, work visa, Canada visa, UK visa, Australia visa, Kaveesh Kapoor, A Visa Experts"
          />
          <link rel="canonical" href="https://avisaexperts.com/blogs" />
          <meta property="og:type" content="website" />
          <meta property="og:title" content="A Visa Experts Blog | Visa Tips & Immigration Guides" />
          <meta
            property="og:description"
            content="Stay updated with expert visa tips, country guides, and success stories from A Visa Experts."
          />
          <meta property="og:url" content="https://avisaexperts.com/blogs" />
          <meta property="og:image" content="https://avisaexperts.com/images/user/touristvisa_full 1.webp" />
          <meta property="og:site_name" content="A Visa Experts" />
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content="A Visa Experts Blog | Visa Tips & Immigration Guides" />
          <meta name="twitter:description" content="Stay updated with expert visa tips, country guides, and success stories from A Visa Experts." />
          <meta name="twitter:image" content="https://avisaexperts.com/images/user/touristvisa_full 1.webp" />
          <script type="application/ld+json">{JSON.stringify(listJsonLd)}</script>
          <script type="application/ld+json">{JSON.stringify(breadcrumbJsonLd)}</script>
        </Helmet>

        <section className="blogs-hero">
          <div className="blogs-hero-overlay" />
          <div className="blogs-hero-content">
            <span className="blogs-hero-badge">Insights</span>
            <h1>Visa Insights & Travel Guides</h1>
            <p>
              Stay updated with expert tips, country guides, and success stories from A Visa Experts.
            </p>
          </div>
        </section>

        <section className="blogs-toolbar">
          <div className="blogs-container">
            <div className="blogs-search">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.3-4.3"></path>
              </svg>
              <input
                type="text"
                placeholder="Search articles..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="blogs-categories">
              {categories.map((cat) => (
                <button
                  key={cat}
                  className={activeCategory === cat ? 'active' : ''}
                  onClick={() => setActiveCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="blogs-section">
          <div className="blogs-container">
            {loading ? (
              <div className="blogs-loading">Loading articles...</div>
            ) : filteredPosts.length === 0 ? (
              <div className="blogs-empty">
                <h3>No articles found</h3>
                <p>Try a different search or category.</p>
              </div>
            ) : (
              <>
                {featuredPost && (
                  <Link
                    className="blogs-featured"
                    to={`/blog/${featuredPost.id}/${slugify(featuredPost.title)}`}
                  >
                    <div className="blogs-featured-image">
                      <img
                        src={featuredPost.featured_image || fallbackImage}
                        alt={featuredPost.image_alt || featuredPost.title}
                        onError={(e) => { e.target.src = fallbackImage; }}
                      />
                      <span className="blogs-featured-category">{featuredPost.derivedCategory}</span>
                    </div>
                    <div className="blogs-featured-content">
                      <span className="blogs-date">{formatDate(featuredPost.created_at)}</span>
                      <h2>{featuredPost.title}</h2>
                      <p>{featuredPost.excerpt}</p>
                      <span className="blogs-read-more">Read Full Article</span>
                    </div>
                  </Link>
                )}

                {gridPosts.length > 0 && (
                  <div className="blogs-grid">
                    {gridPosts.map((post) => (
                      <Link
                        className="blogs-card"
                        key={post.id}
                        to={`/blog/${post.id}/${slugify(post.title)}`}
                      >
                        <div className="blogs-card-image">
                          <img
                            src={post.featured_image || fallbackImage}
                            alt={post.image_alt || post.title}
                            onError={(e) => { e.target.src = fallbackImage; }}
                          />
                          <span className="blogs-card-category">{post.derivedCategory}</span>
                        </div>
                        <div className="blogs-card-body">
                          <span className="blogs-date">{formatDate(post.created_at)}</span>
                          <h3>{post.title}</h3>
                          <p>{post.excerpt}</p>
                          <span className="blogs-card-link">Read More →</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}

                {hasMore && (
                  <div className="blogs-load-more">
                    <button onClick={handleLoadMore}>Load More Articles</button>
                  </div>
                )}
              </>
            )}
          </div>
        </section>

        <section className="blogs-cta">
          <div className="blogs-cta-inner">
            <h2>Need Personalized Visa Guidance?</h2>
            <p>Book a free consultation with our experts and get your visa journey started.</p>
            <div className="blogs-cta-buttons">
              <button className="blogs-cta-primary" onClick={() => navigate('/appointment')}>
                Book Consultation
              </button>
              <button className="blogs-cta-secondary" onClick={() => navigate('/consultants')}>
                Talk to an Expert
              </button>
            </div>
          </div>
        </section>
      </div>
    </LandingLayout>
  );
};

export default Blogs;
