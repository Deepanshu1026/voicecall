import { notFound } from 'next/navigation';
import CityPage from '../../components/pages/CityPage';
import { CITY_PAGES } from '../../lib/cityPages';
import { cityMetadata, cityJsonLd } from '../../lib/cityPageMeta';

// Add one folder per city: app/visa-consultant-in-<slug>/page.jsx, then set
// status: 'published' for that slug in lib/cityPages.js. It then appears in
// sitemap-cities.xml automatically.

const SLUG = 'noida';
const REVIEWS_API = 'https://voicecall-6ylg.onrender.com/api/app/reviews';

export const revalidate = 3600;

export function generateMetadata() {
  return cityMetadata(SLUG);
}

// Real client reviews from the site, rendered server-side. Reviews mentioning
// this city are shown first, then topped up with the most recent others.
async function getReviews(city) {
  try {
    const res = await fetch(REVIEWS_API, { next: { revalidate: 3600 } });
    const json = await res.json();
    const list = Array.isArray(json?.data) ? json.data : [];
    const needle = (city || '').toLowerCase();
    const local = list.filter((r) => String(r.story || '').toLowerCase().includes(needle));
    const rest = list.filter((r) => !local.includes(r));
    return [...local, ...rest].slice(0, 4);
  } catch {
    return [];
  }
}

export default async function Page() {
  const page = CITY_PAGES[SLUG];
  if (!page || page.status !== 'published') notFound();
  const reviews = await getReviews(page.city);
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(cityJsonLd(SLUG)) }}
      />
      <CityPage page={page} reviews={reviews} />
    </>
  );
}
