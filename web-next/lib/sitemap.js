export const SITE = 'https://avisaexperts.com';

export const API = 'https://voicecall-6ylg.onrender.com/api';

// Posts that are 301-redirected as duplicates must never appear in a sitemap.
export const REDIRECTED_SLUGS = new Set([
  'minimum-bank-balance-for-uk-visa-what-you-really-need-to-know-in-2026',
  'minimum-bank-balance-for-uk-tourist-visa-from-india-a-clear-guide-by-avisaexperts',
  'usa-visit-visa-from-india-b1b2-visa-guide-for-indian-travelers',
  'usa-visitor-visa-interview-questions-for-indians-complete-guide-2025',
]);

export function xmlResponse(xml) {
  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}

export const escapeXml = (value) =>
  String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// urls: [{ path: '/uk-visa', lastmod: Date|string (optional) }]
export function urlset(urls) {
  const body = urls
    .map(({ path, lastmod }) => {
      const lm = lastmod ? `<lastmod>${new Date(lastmod).toISOString().slice(0, 10)}</lastmod>` : '';
      return `<url><loc>${SITE}${escapeXml(path)}</loc>${lm}</url>`;
    })
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</urlset>`;
}

// Published blog posts from the API, minus anything that 301-redirects.
export async function getPublishedPosts() {
  try {
    const res = await fetch(`${API}/app/posts?limit=1000`, { cache: 'no-store' });
    const json = await res.json();
    const posts = Array.isArray(json?.data) ? json.data : [];
    return posts.filter((p) => p && p.slug && !REDIRECTED_SLUGS.has(p.slug));
  } catch {
    return [];
  }
}
