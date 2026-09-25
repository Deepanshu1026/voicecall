'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import LandingLayout from '../LandingLayout';

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

const BlogDetail = ({ post, related = [] }) => {
  const navigate = (p) => window.location.assign(p);

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

  return (
    <LandingLayout>
      <div className="blogs-page">
        {jsonLd && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
          />
        )}
        {breadcrumbJsonLd && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
          />
        )}

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
                <li><Link href="/home">Home</Link></li>
                <li><Link href="/blogs">Blogs</Link></li>
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
                    <li><Link href="/tourist-visa">Tourist Visa</Link></li>
                    <li><Link href="/work-visa">Work Visa</Link></li>
                    <li><Link href="/transit-visa">Transit Visa</Link></li>
                    <li><Link href="/consultants">Our Advisors</Link></li>
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
                    href={`/blog/${item.id}/${slugify(item.title)}`}
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
