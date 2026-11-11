import { SITE, xmlResponse } from '../../lib/sitemap';

export const revalidate = 3600;

export async function GET() {
  const files = ['sitemap-pages.xml', 'sitemap-visa.xml', 'sitemap-blogs.xml', 'sitemap-cities.xml'];
  const today = new Date().toISOString().slice(0, 10);
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="${SITE}/sitemap.xsl"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${files.map((f) => `<sitemap><loc>${SITE}/${f}</loc><lastmod>${today}</lastmod></sitemap>`).join('\n')}
</sitemapindex>`;
  return xmlResponse(xml);
}
