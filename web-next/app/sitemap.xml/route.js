export const dynamic = 'force-dynamic';

const BASE = 'https://avisaexperts.com';
const API = 'https://voicecall-6ylg.onrender.com/api';

const img = (name) => `${BASE}/images/user/${encodeURIComponent(name)}`;

// Static marketing pages. Add new static pages here once.
const staticPages = [
  {
    path: '/',
    priority: '1.0',
    changefreq: 'weekly',
    images: [
      { loc: img('sirpic 1.webp'), title: 'Kaveesh Kapoor - Visa Immigration Expert' },
      { loc: img('tmlogo 1.webp'), title: 'A Visa Experts Logo' },
      { loc: img('carousel2img 1.webp'), title: 'Tourist Visa Consultation - A Visa Experts' },
    ],
  },
  {
    path: '/about',
    priority: '0.8',
    changefreq: 'monthly',
    images: [
      { loc: img('sirpic 1.webp'), title: 'Kaveesh Kapoor - Founder of A Visa Experts' },
      { loc: img('karansir 1.webp'), title: 'Karan Kapoor - Managing Director, A Visa Experts' },
    ],
  },
  {
    path: '/services',
    priority: '0.9',
    changefreq: 'monthly',
    images: [{ loc: img('eurpean visa 1.webp'), title: 'Visa Services - A Visa Experts' }],
  },
  {
    path: '/contact',
    priority: '0.7',
    changefreq: 'yearly',
    images: [{ loc: img('tmlogo 1.webp'), title: 'Contact A Visa Experts' }],
  },
  {
    path: '/uk-visa/requirements',
    priority: '0.8',
    changefreq: 'monthly',
    images: [{ loc: img('uk 1.webp'), title: 'UK Visa Requirements for Indians - A Visa Experts' }],
  },
  {
    path: '/uk-visa/business-visitor-visa',
    priority: '0.8',
    changefreq: 'monthly',
    images: [{ loc: img('uk 1.webp'), title: 'UK Business Visa from India - A Visa Experts' }],
  },
  {
    path: '/uk-visa/family-visit-visa',
    priority: '0.8',
    changefreq: 'monthly',
    images: [{ loc: img('uk 1.webp'), title: 'UK Visit Visa for Parents from India - A Visa Experts' }],
  },
  {
    path: '/uk-visa/long-term-visitor-visa',
    priority: '0.8',
    changefreq: 'monthly',
    images: [{ loc: img('uk 1.webp'), title: 'UK 10 Year Visa for Indians - A Visa Experts' }],
  },
  {
    path: '/tourist-visa',
    priority: '0.8',
    changefreq: 'monthly',
    images: [
      { loc: img('touristvisa_full 1.webp'), title: 'Tourist Visa Services - A Visa Experts' },
      { loc: img('touristvisa_circle 1.webp'), title: 'Tourist Visa Application - A Visa Experts' },
    ],
  },
  {
    path: '/transit-visa',
    priority: '0.7',
    changefreq: 'monthly',
    images: [{ loc: img('transitvisa_full 1.webp'), title: 'Transit Visa Services - A Visa Experts' }],
  },
  { path: '/usa-visa', priority: '0.9', changefreq: 'monthly' },
  { path: '/usa-visa/business-visa', priority: '0.8', changefreq: 'monthly' },
  { path: '/usa-visa/requirements', priority: '0.8', changefreq: 'monthly' },
  { path: '/usa-visa/fees', priority: '0.8', changefreq: 'monthly' },
  { path: '/usa-visa/appointment', priority: '0.8', changefreq: 'monthly' },
  { path: '/usa-visa/processing-time', priority: '0.8', changefreq: 'monthly' },
  { path: '/usa-visa/rejection-reasons', priority: '0.8', changefreq: 'monthly' },
  { path: '/usa-visa/usa-b1b2-visa', priority: '0.8', changefreq: 'monthly' },
  { path: '/canada-visa', priority: '0.8', changefreq: 'monthly' },
  { path: '/uk-visa', priority: '0.8', changefreq: 'monthly' },
  { path: '/immigration-laws', priority: '0.9', changefreq: 'weekly' },
  { path: '/immigration-lawyers', priority: '0.8', changefreq: 'monthly' },
  { path: '/blogs', priority: '0.7', changefreq: 'weekly' },
  {
    path: '/consultants',
    priority: '0.9',
    changefreq: 'weekly',
    images: [{ loc: img('teammember1 1.webp'), title: 'Visa Consultant Team - A Visa Experts' }],
  },
  { path: '/appointment', priority: '0.7', changefreq: 'monthly' },
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

const imageXml = (images) =>
  (images || [])
    .map(
      (im) =>
        `\n    <image:image>\n      <image:loc>${escapeXml(im.loc)}</image:loc>\n` +
        `      <image:title>${escapeXml(im.title)}</image:title>\n    </image:image>`
    )
    .join('');

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
      `    <changefreq>${p.changefreq}</changefreq>\n    <priority>${p.priority}</priority>` +
      `${imageXml(p.images)}\n  </url>`
  );

  const blogUrls = posts
    .map((post) => {
      const slug = post.slug || slugify(post.title);
      if (!slug) return null;
      const lastmod = String(post.updatedAt || post.publishedAt || post.createdAt || today).slice(0, 10);
      const image = post.featuredImage || post.featured_image || post.image;
      const imageAlt = post.imageAlt || post.image_alt || post.title;
      const imageBlock =
        image && /^https?:\/\//.test(image)
          ? `\n    <image:image>\n      <image:loc>${escapeXml(image)}</image:loc>\n` +
            `      <image:title>${escapeXml(imageAlt)}</image:title>\n    </image:image>`
          : '';
      return (
        `  <url>\n    <loc>${BASE}/blog/${escapeXml(slug)}</loc>\n    <lastmod>${lastmod}</lastmod>\n` +
        `    <changefreq>monthly</changefreq>\n    <priority>0.6</priority>${imageBlock}\n  </url>`
      );
    })
    .filter(Boolean);

  const xml =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n` +
    `        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n` +
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
