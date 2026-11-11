import { notFound } from 'next/navigation';
import CityPage from '../../components/pages/CityPage';
import { CITY_PAGES } from '../../lib/cityPages';
import { cityMetadata, cityJsonLd } from '../../lib/cityPageMeta';

const SLUG = 'gurgaon';
const REVIEWS_API = 'https://voicecall-6ylg.onrender.com/api/app/reviews';

export const revalidate = 3600;

export function generateMetadata() {
  return cityMetadata(SLUG);
}

async function getReviews(city) {
  try {
    const res = await fetch(REVIEWS_API, { next: { revalidate: 3600 } });
    const json = await res.json();
    const list = Array.isArray(json?.data) ? json.data : [];
    const needle = String(city || '').toLowerCase();
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
