import { urlset, xmlResponse } from '../../lib/sitemap';
import { publishedCitySlugs } from '../../lib/cityPages';

export const revalidate = 3600;

// Driven by lib/cityPages.js - a page appears here only once its status is
// 'published'. See avisaexperts-city-pages-and-sitemap-plan.xlsx.
export async function GET() {
  return xmlResponse(
    urlset(publishedCitySlugs().map((slug) => ({ path: `/visa-consultant-in-${slug}` })))
  );
}
