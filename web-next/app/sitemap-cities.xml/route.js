import { urlset, xmlResponse } from '../../lib/sitemap';
import { publishedCitySlugs } from '../../lib/cityPages';
import { publishedCityCountrySlugs } from '../../lib/cityCountryPages';

export const revalidate = 600;

// Driven by lib/cityPages.js and lib/cityCountryPages.js - a page appears here
// only once its status is 'published'.
// See avisaexperts-city-pages-and-sitemap-plan.xlsx.
export async function GET() {
  const paths = [
    ...publishedCitySlugs().map((slug) => `/visa-consultant-in-${slug}`),
    ...publishedCityCountrySlugs().map((slug) => `/${slug}`),
  ];
  return xmlResponse(urlset(paths.map((path) => ({ path }))));
}
