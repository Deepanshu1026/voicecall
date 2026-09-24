// Post-build SEO step.
// The app is a client-side SPA, so every route would otherwise be served the same
// static index.html (identical title/description/canonical). This script writes a
// dedicated HTML file per public route with route-specific meta, and regenerates
// sitemap.xml from the same source of truth.

import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const distDir = resolve(here, '..', 'dist');
const baseUrl = 'https://avisaexperts.com';
const today = new Date().toISOString().split('T')[0];

const HOME_TITLE = 'A Visa Experts | No.1 Visa Immigration Company in India';
const HOME_DESCRIPTION =
  "A Visa Experts is India's trusted No.1 Visa Immigration Company. We help with tourist, work, transit and PR visas for USA, UK, Canada, Australia, Europe & NZ. Free consultation with expert immigration consultants.";

const pages = [
  {
    path: '/',
    file: 'index.html',
    title: HOME_TITLE,
    description: HOME_DESCRIPTION,
    priority: '1.0',
    changefreq: 'weekly',
    includeInSitemap: true,
  },
  {
    path: '/home',
    file: 'home.html',
    canonicalPath: '/',
    title: HOME_TITLE,
    description: HOME_DESCRIPTION,
    includeInSitemap: false,
  },
  {
    path: '/about',
    file: 'about.html',
    title: 'About Us | A Visa Experts - Visa & Immigration Experts',
    description:
      "Learn about A Visa Experts, India's trusted visa and immigration company led by Kaveesh Kapoor. We help clients with tourist, work, and transit visas.",
    priority: '0.8',
    changefreq: 'monthly',
    includeInSitemap: true,
  },
  {
    path: '/services',
    file: 'services.html',
    title: 'Visa Consultants in Noida & Delhi | Visa Services | A Visa Experts',
    description:
      'Trusted visa consultants in Noida & Delhi for tourist, work and transit visas. Expert guidance for USA, UK, Canada, Australia and Europe. Book a free consultation.',
    priority: '0.9',
    changefreq: 'monthly',
    includeInSitemap: true,
  },
  {
    path: '/tourist-visa',
    file: 'tourist-visa.html',
    title: 'Tourist Visa Services | A Visa Experts',
    description:
      'Apply for a tourist visa with expert guidance from A Visa Experts. We help travelers secure visas for USA, UK, Canada, Australia, Europe, and Japan.',
    priority: '0.8',
    changefreq: 'monthly',
    includeInSitemap: true,
  },
  {
    path: '/work-visa',
    file: 'work-visa.html',
    title: 'Work Visa Services | A Visa Experts',
    description:
      'Apply for a work visa with expert guidance from A Visa Experts. We assist professionals with Canada, UK, Australia, Europe, and Hong Kong work visas.',
    priority: '0.8',
    changefreq: 'monthly',
    includeInSitemap: true,
  },
  {
    path: '/transit-visa',
    file: 'transit-visa.html',
    title: 'Transit Visa Services | A Visa Experts',
    description:
      'Understand transit visa requirements and get expert guidance for smooth airport layovers. A Visa Experts helps with transit visas for international travel.',
    priority: '0.7',
    changefreq: 'monthly',
    includeInSitemap: true,
  },
  {
    path: '/blogs',
    file: 'blogs.html',
    title: 'Visa & Immigration Blogs | A Visa Experts',
    description:
      'Read the latest visa and immigration news, guides, and success stories from A Visa Experts. Tips for tourist, work, transit and PR visas.',
    priority: '0.7',
    changefreq: 'weekly',
    includeInSitemap: true,
  },
  {
    path: '/consultants',
    file: 'consultants.html',
    title: 'Visa Consultants & Immigration Experts | A Visa Experts',
    description:
      "Connect with India's top visa consultants and immigration experts for tourist, work, transit and PR visas. Free consultation for USA, UK, Canada, Australia, Europe & New Zealand.",
    priority: '0.9',
    changefreq: 'weekly',
    includeInSitemap: true,
  },
  {
    path: '/appointment',
    file: 'appointment.html',
    title: 'Book an Appointment | A Visa Experts',
    description:
      'Book an appointment with A Visa Experts for a free visa consultation. Get expert guidance on tourist, work, transit and PR visas.',
    priority: '0.6',
    changefreq: 'monthly',
    includeInSitemap: true,
  },
];

const escapeAttr = (value) =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

const setMeta = (html, matcher, replacement) =>
  matcher.test(html) ? html.replace(matcher, replacement) : html;

const template = readFileSync(resolve(distDir, 'index.html'), 'utf8');

for (const page of pages) {
  const canonical = `${baseUrl}${page.canonicalPath || page.path}`;
  const title = escapeAttr(page.title);
  const description = escapeAttr(page.description);

  let html = template;
  html = setMeta(html, /<title>[\s\S]*?<\/title>/, `<title>${title}</title>`);
  html = setMeta(
    html,
    /<meta name="description" content="[\s\S]*?"\s*\/?>/,
    `<meta name="description" content="${description}" />`
  );
  html = setMeta(
    html,
    /<link rel="canonical" href="[\s\S]*?"\s*\/?>/,
    `<link rel="canonical" href="${canonical}" />`
  );
  html = setMeta(
    html,
    /<meta property="og:title" content="[\s\S]*?"\s*\/?>/,
    `<meta property="og:title" content="${title}" />`
  );
  html = setMeta(
    html,
    /<meta property="og:description" content="[\s\S]*?"\s*\/?>/,
    `<meta property="og:description" content="${description}" />`
  );
  html = setMeta(
    html,
    /<meta property="og:url" content="[\s\S]*?"\s*\/?>/,
    `<meta property="og:url" content="${canonical}" />`
  );
  html = setMeta(
    html,
    /<meta name="twitter:title" content="[\s\S]*?"\s*\/?>/,
    `<meta name="twitter:title" content="${title}" />`
  );
  html = setMeta(
    html,
    /<meta name="twitter:description" content="[\s\S]*?"\s*\/?>/,
    `<meta name="twitter:description" content="${description}" />`
  );

  writeFileSync(resolve(distDir, page.file), html, 'utf8');
}

const sitemapUrls = pages
  .filter((p) => p.includeInSitemap)
  .map(
    (p) =>
      `  <url>\n    <loc>${baseUrl}${p.path}</loc>\n    <lastmod>${today}</lastmod>\n` +
      `    <changefreq>${p.changefreq || 'monthly'}</changefreq>\n    <priority>${p.priority || '0.7'}</priority>\n  </url>`
  )
  .join('\n');

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemapUrls}\n</urlset>\n`;
writeFileSync(resolve(distDir, 'sitemap.xml'), sitemap, 'utf8');

console.log(`[seo] generated ${pages.length} HTML pages and sitemap.xml`);
