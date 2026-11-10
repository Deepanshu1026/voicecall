import { urlset, xmlResponse } from '../../lib/sitemap';

export const revalidate = 3600;

// Add a path here ONLY after that page is live (see the City Pages Plan sheet).
// An empty list is fine until the first city page is published.
const PAGES = [
  // '/visa-consultant-in-noida',
];

export async function GET() {
  return xmlResponse(urlset(PAGES.map((path) => ({ path }))));
}
