import { notFound } from 'next/navigation';
import CountryCityPage from '../../components/pages/CountryCityPage';
import { CITY_COUNTRY_PAGES } from '../../lib/cityCountryPages';
import { cityCountryMetadata, cityCountryJsonLd } from '../../lib/cityCountryMeta';

const SLUG = 'uk-visa-consultant-in-chandigarh';
const REVIEWS_API = 'https://voicecall-6ylg.onrender.com/api/app/reviews';

export const revalidate = 3600;

export function generateMetadata() {
  return cityCountryMetadata(SLUG);
}

async function getReviews() {
  const page = CITY_COUNTRY_PAGES[SLUG];
  try {
    const res = await fetch(REVIEWS_API, { next: { revalidate: 3600 } });
    const json = await res.json();
    const list = Array.isArray(json?.data) ? json.data : [];
    const needles = [String(page?.country || '').toLowerCase(), String(page?.city || '').toLowerCase()].filter(Boolean);
    const match = list.filter((r) => needles.some((n) => `${r.story || ''} ${r.visa_type || ''}`.toLowerCase().includes(n)));
    const rest = list.filter((r) => !match.includes(r));
    return [...match, ...rest].slice(0, 3);
  } catch {
    return [];
  }
}

export default async function Page() {
  const page = CITY_COUNTRY_PAGES[SLUG];
  if (!page || page.status !== 'published') notFound();
  const reviews = await getReviews();
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(cityCountryJsonLd(SLUG)) }}
      />
      <CountryCityPage page={page} reviews={reviews} />
    </>
  );
}
