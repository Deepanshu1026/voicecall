import { urlset, xmlResponse } from '../../lib/sitemap';

export const revalidate = 600;

const PAGES = [
  '/uk-visa',
  '/uk-visa/requirements',
  '/uk-visa/business-visitor-visa',
  '/uk-visa/family-visit-visa',
  '/uk-visa/long-term-visitor-visa',
  '/uk-visa/fees',
  '/uk-visa/processing-time',
  '/uk-visa/refusal',
  '/usa-visa',
  '/usa-visa/appointment',
  '/usa-visa/business-visa',
  '/usa-visa/fees',
  '/usa-visa/processing-time',
  '/usa-visa/rejection-reasons',
  '/usa-visa/requirements',
  '/usa-visa/usa-b1b2-visa',
  '/canada-visa',
];

export async function GET() {
  return xmlResponse(urlset(PAGES.map((path) => ({ path }))));
}
