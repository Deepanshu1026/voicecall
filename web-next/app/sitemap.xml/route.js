export const dynamic = 'force-dynamic';

const BASE = 'https://avisaexperts.com';
const API = 'https://voicecall-6ylg.onrender.com/api';

// Static marketing pages. Add new static pages here once.
const staticPages = [
  { path: '/', priority: '1.0', changefreq: 'weekly' },
  { path: '/about', priority: '0.8', changefreq: 'monthly' },
  { path: '/services', priority: '0.9', changefreq: 'monthly' },
  { path: '/tourist-visa', priority: '0.8', changefreq: 'monthly' },
  { path: '/transit-visa', priority: '0.7', changefreq: 'monthly' },
  { path: '/usa-visa', priority: '0.9', changefreq: 'monthly' },
  { path: '/usa-visa/usa-b1b2-visa', priority: '0.8', changefreq: 'monthly' },
  { path: '/canada-visa', priority: '0.8', changefreq: 'monthly' },
  { path: '/uk-visa', priority: '0.8', changefreq: 'monthly' },
  { path: '/immigration-laws', priority: '0.9', changefreq: 'weekly' },
  { path: '/immigration-lawyers', priority: '0.8', changefreq: 'monthly' },
  { path: '/blogs', priority: '0.7', changefreq: 'weekly' },
  { path: '/consultants', priority: '0.9', changefreq: 'weekly' },
  { path: '/appointment', priority: '0.6', changefreq: 'monthly' },
];

const escapeXml = (value) =>
  String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const slugify = (text) =>
  String(text || '')
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');

export async function GET() {
  const today = new Date().toISOString().slice(0, 10);

  let posts = [];
  try {
    const res = await fetch(`${API}/app/posts?limit=1000`, { cache: 'no-store' });
    const json = await res.json();
    posts = Array.isArray(json?.data) ? json.data : [];
  } catch {
    posts = [];
  }

  const pageUrls = staticPages.map(
    (p) =>
      `  <url>\n    <loc>${BASE}${p.path}</loc>\n    <lastmod>${today}</lastmod>\n` +
      `    <changefreq>${p.changefreq}</changefreq>\n    <priority>${p.priority}</priority>\n  </url>`
  );

  const blogUrls = posts
    .map((post) => {
      const slug = post.slug || slugify(post.title);
      if (!slug) return null;
      const lastmod = String(post.updatedAt || post.publishedAt || post.createdAt || today).slice(0, 10);
      return (
        `  <url>\n    <loc>${BASE}/blog/${escapeXml(slug)}</loc>\n    <lastmod>${lastmod}</lastmod>\n` +
        `    <changefreq>monthly</changefreq>\n    <priority>0.6</priority>\n  </url>`
      );
    })
    .filter(Boolean);

  const xml =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    `${[...pageUrls, ...blogUrls].join('\n')}\n` +
    `</urlset>\n`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      // Edge-cached ~10 min so new blogs appear automatically without a redeploy.
      'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=86400',
    },
  });
}
