import { urlset, xmlResponse } from '../../lib/sitemap';

export const revalidate = 3600;

const PAGES = [
  '/',
  '/about',
  '/services',
  '/tourist-visa',
  '/transit-visa',
  '/immigration-laws',
  '/consultants',
  '/appointment',
  '/contact',
  '/blogs',
];

export async function GET() {
  return xmlResponse(urlset(PAGES.map((path) => ({ path }))));
}
