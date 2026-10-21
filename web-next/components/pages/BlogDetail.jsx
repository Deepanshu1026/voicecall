'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import LandingLayout from '../LandingLayout';
import { cleanPostHtml } from '../../lib/cleanPostHtml';

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
  if (Number.isNaN(date.getTime())) return '';
  // Fixed timeZone so the server (UTC) and the browser (local) render identical text.
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });
};

const stripHtml = (html) => {
  if (!html) return '';
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
};

/**
 * Cleans the post HTML, demotes in-content H1s to H2 (the page title is the only
 * H1) and gives every main heading (H2) a stable id. Returns the rewritten HTML
 * plus the heading list used to build the table of contents.
 */
const buildArticle = (content) => {
  let html = cleanPostHtml(content || '');
  html = html.replace(/<h1(\s[^>]*)?>/gi, '<h2$1>').replace(/<\/h1>/gi, '</h2>');

  const toc = [];
  const used = new Set();

  html = html.replace(/<h2(\s[^>]*)?>([\s\S]*?)<\/h2>/gi, (match, attrs, inner) => {
    const text = stripHtml(inner).replace(/&nbsp;/g, ' ').trim();
    if (!text) return match;

    const attrsStr = attrs || '';
    const existing = /\sid="([^"]+)"/i.exec(attrsStr);
    const base = existing ? existing[1] : slugify(text) || `section-${toc.length + 1}`;
    let id = base;
    let n = 2;
    while (used.has(id)) {
      id = `${base}-${n}`;
      n += 1;
    }
    used.add(id);
    toc.push({ id, text });

    const cleanAttrs = attrsStr.replace(/\sid="[^"]*"/i, '');
    return `<h2${cleanAttrs} id="${id}">${inner}</h2>`;
  });

  return { html, toc };
};

const escapeAttr = (value) => String(value || '').replace(/"/g, '&quot;').replace(/</g, '&lt;');

/**
 * Drops the featured image into the middle of the article — before the middle
 * H2 section, or after the second paragraph when the post has few headings.
 */
const insertFeaturedImage = (html, post) => {
  if (!html || !post) return html;
  if (post.featured_image && html.includes(post.featured_image)) return html;

  const src = escapeAttr(post.featured_image || fallbackImage);
  const alt = escapeAttr(`${post.image_alt || post.title || ''} - A Visa Experts`);
  const figure = `<figure><img src="${src}" alt="${alt}" width="1200" height="630" loading="lazy" /></figure>`;

  const headings = [...html.matchAll(/<h2[^>]*>/gi)];
  if (headings.length >= 2) {
    const pos = headings[Math.floor(headings.length / 2)].index;
    return html.slice(0, pos) + figure + html.slice(pos);
  }

  const paragraphs = [...html.matchAll(/<\/p>/gi)];
  if (paragraphs.length >= 2) {
    const pos = paragraphs[1].index + paragraphs[1][0].length;
    return html.slice(0, pos) + figure + html.slice(pos);
  }

  return html + figure;
};

const BlogDetail = ({ post, related = [] }) => {
  const navigate = (p) => window.location.assign(p);

  const [activeId, setActiveId] = useState('');
  const [progress, setProgress] = useState(0);
  const [showTop, setShowTop] = useState(false);
  const [copied, setCopied] = useState(false);
  const bodyRef = useRef(null);

  const pageUrl = useMemo(() => `https://avisaexperts.com/blog/${post?.slug || slugify(post?.title || '')}`, [post]);
  const metaDescription = useMemo(() => {
    if (!post) return '';
    return post.excerpt ? stripHtml(post.excerpt).slice(0, 160) : stripHtml(post.content).slice(0, 160);
  }, [post]);
  const metaTitle = useMemo(() => (post ? `${post.title} | A Visa Experts Blog` : 'Blog | A Visa Experts'), [post]);
  const imageUrl = post?.featured_image || fallbackImage;

  const { html: bodyHtml, toc } = useMemo(() => {
    const article = buildArticle(post?.content || '');
    return { html: insertFeaturedImage(article.html, post), toc: article.toc };
  }, [post]);

  const readingTime = useMemo(() => {
    const words = stripHtml(bodyHtml).split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.round(words / 200));
  }, [bodyHtml]);

  const tags = useMemo(
    () => (Array.isArray(post?.tags) ? post.tags.filter(Boolean) : []),
    [post]
  );

  const keywords = useMemo(() => {
    if (!post) return '';
    const base = ['visa', 'immigration', 'A Visa Experts', 'Kaveesh Kapoor'];
    const cats = post.category ? [post.category] : [];
    return [...base, ...cats].join(', ');
  }, [post]);

  // Reading progress bar, back-to-top button and scroll-spy for the TOC.
  useEffect(() => {
    const onScroll = () => {
      // Progress is measured over the article itself so the bar reaches 100% when
      // the reader finishes the post — not when they reach the bottom of the page.
      const body = bodyRef.current;
      if (body) {
        const top = body.getBoundingClientRect().top + window.scrollY;
        const start = top - 150;
        const end = top + body.offsetHeight - window.innerHeight * 0.75;
        const span = end - start;
        const ratio = span > 0 ? (window.scrollY - start) / span : 1;
        setProgress(Math.min(100, Math.max(0, ratio * 100)));
      }

      setShowTop(window.scrollY > 700);

      if (toc.length) {
        let current = toc[0].id;
        for (const item of toc) {
          const el = document.getElementById(item.id);
          if (el && el.getBoundingClientRect().top <= 150) current = item.id;
        }
        setActiveId(current);
      }
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [toc]);

  // Swap any broken image inside the article (featured or inline) for the fallback.
  useEffect(() => {
    const el = bodyRef.current;
    if (!el) return undefined;
    const onImageError = (event) => {
      const target = event.target;
      if (target && target.tagName === 'IMG' && !target.src.includes(fallbackImage)) {
        target.src = fallbackImage;
      }
    };
    el.addEventListener('error', onImageError, true);
    return () => el.removeEventListener('error', onImageError, true);
  }, [bodyHtml]);

  const handleTocClick = (event, id) => {
    event.preventDefault();
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    if (window.history?.replaceState) window.history.replaceState(null, '', `#${id}`);
    setActiveId(id);
  };

  const handleShare = (network) => {
    const url = encodeURIComponent(pageUrl);
    const text = encodeURIComponent(post?.title || '');
    if (network === 'copy') {
      if (navigator.clipboard?.writeText) {
        navigator.clipboard
          .writeText(pageUrl)
          .then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          })
          .catch(() => {});
      }
      return;
    }
    const links = {
      whatsapp: `https://wa.me/?text=${text}%20${url}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      x: `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
    };
    if (links[network]) window.open(links[network], '_blank', 'noopener,noreferrer');
  };

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
          item: 'https://avisaexperts.com/',
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

  // Longer lists step down in size so the box fits without its own scrollbar.
  const tocDensity =
    toc.length > 22 ? ' is-ultra' : toc.length > 15 ? ' is-dense' : toc.length > 10 ? ' is-compact' : '';

  const renderToc = (variant) => (
    <ul className={`blog-toc-list blog-toc-list--${variant}`}>
      {toc.map((item) => (
        <li key={item.id} className="blog-toc-item">
          <a
            href={`#${item.id}`}
            className={activeId === item.id ? 'is-active' : undefined}
            onClick={(event) => handleTocClick(event, item.id)}
          >
            {item.text}
          </a>
        </li>
      ))}
    </ul>
  );

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

        <div className="blog-progress" aria-hidden="true">
          <span className="blog-progress-bar" style={{ width: `${progress}%` }} />
        </div>

        <article className="blog-detail">
          <div className="blog-detail-hero">
            <div className="blog-detail-hero-content">
              <div className="blogs-container">
                <span className="blog-detail-category">{post.category || 'General'}</span>
                <h1>{post.title}</h1>
                <div className="blog-detail-meta">
                  <span className="blog-detail-meta-item">
                    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 8v5l4 2" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2" /></svg>
                    {readingTime} min read
                  </span>
                  <span className="blog-detail-meta-item">
                    <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2" fill="none" stroke="currentColor" strokeWidth="2" /><path d="M3 9h18M8 3v4M16 3v4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
                    {formatDate(post.created_at)}
                  </span>
                  <span className="blog-detail-meta-item">
                    <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="4" fill="none" stroke="currentColor" strokeWidth="2" /><path d="M4 21c0-4 3.6-6 8-6s8 2 8 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
                    By A Visa Experts
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="blogs-container">
            <nav className="blog-breadcrumb" aria-label="Breadcrumb">
              <ol>
                <li><Link href="/">Home</Link></li>
                <li><Link href="/blogs">Blogs</Link></li>
                <li aria-current="page">{post.title}</li>
              </ol>
            </nav>

            <div className={`blog-detail-layout${toc.length >= 2 ? ' has-toc' : ''}`}>
              <div className="blog-detail-content">
                {toc.length >= 2 && (
                  <details className="blog-toc-mobile">
                    <summary>
                      <span>Table of Contents</span>
                      <span className="blog-toc-mobile-count">{toc.length} sections</span>
                    </summary>
                    {renderToc('mobile')}
                  </details>
                )}

                <div
                  ref={bodyRef}
                  className="blog-detail-body"
                  dangerouslySetInnerHTML={{ __html: bodyHtml }}
                />

                {tags.length > 0 && (
                  <div className="blog-detail-tags">
                    {tags.map((tag) => (
                      <span className="blog-tag" key={tag}>{tag}</span>
                    ))}
                  </div>
                )}

                <div className="blog-share">
                  <span className="blog-share-label">Share this article</span>
                  <div className="blog-share-buttons">
                    <button type="button" className="blog-share-btn is-whatsapp" onClick={() => handleShare('whatsapp')} aria-label="Share on WhatsApp">
                      <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5.1-1.3A10 10 0 1 0 12 2Zm0 18a8 8 0 0 1-4.1-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8 8 0 1 1 12 20Zm4.5-5.9c-.2-.1-1.4-.7-1.7-.8s-.4-.1-.5.1-.6.7-.7.9-.3.2-.5.1a6.5 6.5 0 0 1-3.2-2.8c-.2-.4.2-.4.6-1.2.1-.2 0-.3 0-.5s-.5-1.3-.7-1.7-.3-.4-.5-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c2 .8 2.4.7 2.9.6a2.6 2.6 0 0 0 1.7-1.2 2.1 2.1 0 0 0 .1-1.2c0-.1-.2-.2-.5-.4Z" /></svg>
                    </button>
                    <button type="button" className="blog-share-btn is-facebook" onClick={() => handleShare('facebook')} aria-label="Share on Facebook">
                      <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M13.5 21v-8h2.7l.4-3h-3.1V8.1c0-.9.3-1.5 1.6-1.5h1.7V3.9A22 22 0 0 0 14.6 3c-2.4 0-4 1.5-4 4.2V10H8v3h2.6v8h2.9Z" /></svg>
                    </button>
                    <button type="button" className="blog-share-btn is-x" onClick={() => handleShare('x')} aria-label="Share on X">
                      <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M17.5 3h3.1l-6.8 7.8L22 21h-6.3l-4.9-6.4L5.2 21H2.1l7.3-8.3L2 3h6.4l4.4 5.9L17.5 3Zm-1.1 16.1h1.7L7.7 4.8H5.9l10.5 14.3Z" /></svg>
                    </button>
                    <button type="button" className="blog-share-btn is-linkedin" onClick={() => handleShare('linkedin')} aria-label="Share on LinkedIn">
                      <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M6.9 8.5H3.6V21h3.3V8.5ZM5.2 3a1.9 1.9 0 1 0 0 3.8 1.9 1.9 0 0 0 0-3.8ZM21 14c0-3.3-1.8-4.9-4.2-4.9a3.6 3.6 0 0 0-3.3 1.8V8.5H10V21h3.4v-6.6c0-1.5.3-2.9 2.1-2.9s1.8 1.7 1.8 3V21H21v-7Z" /></svg>
                    </button>
                    <button type="button" className="blog-share-btn is-copy" onClick={() => handleShare('copy')} aria-label="Copy link">
                      {copied ? (
                        <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="m5 13 4 4L19 7" /></svg>
                      ) : (
                        <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M10 13a5 5 0 0 0 7 0l2-2a5 5 0 0 0-7-7l-1 1M14 11a5 5 0 0 0-7 0l-2 2a5 5 0 0 0 7 7l1-1" /></svg>
                      )}
                    </button>
                    {copied && <span className="blog-share-copied">Link copied</span>}
                  </div>
                </div>

                <div className="blog-detail-actions">
                  <button className="blogs-cta-primary" onClick={() => navigate('/book-appointment')}>
                    Book Consultation
                  </button>
                  <button className="blogs-cta-secondary" onClick={() => navigate('/consultants')}>
                    Talk to an Expert
                  </button>
                </div>
              </div>

              {toc.length >= 2 && (
                <aside className="blog-detail-sidebar">
                  <nav className={`blog-toc${tocDensity}`} aria-label="Table of contents">
                    <h3 className="blog-toc-title">Table of Contents</h3>
                    {renderToc('desktop')}
                  </nav>
                </aside>
              )}
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
                    href={`/blog/${item.slug || slugify(item.title)}`}
                  >
                    <div className="blogs-card-image">
                      <img
                        src={item.featured_image || fallbackImage}
                        alt={`${item.image_alt || item.title} - A Visa Experts`}
                        width={600}
                        height={400}
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

        <button
          type="button"
          className={`blog-back-to-top${showTop ? ' is-visible' : ''}`}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          aria-label="Back to top"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="m6 14 6-6 6 6" /></svg>
        </button>
      </div>
    </LandingLayout>
  );
};

export default BlogDetail;
