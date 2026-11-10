import { notFound } from 'next/navigation';
import CityPage from '../../components/pages/CityPage';
import { CITY_PAGES } from '../../lib/cityPages';
import { cityMetadata, cityJsonLd } from '../../lib/cityPageMeta';

// Add one folder per city: app/visa-consultant-in-<slug>/page.jsx, then set
// status: 'published' for that slug in lib/cityPages.js. It then appears in
// sitemap-cities.xml automatically.

const SLUG = 'noida';

export const revalidate = 3600;

export function generateMetadata() {
  return cityMetadata(SLUG);
}

export default function Page() {
  const page = CITY_PAGES[SLUG];
  if (!page || page.status !== 'published') notFound();
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(cityJsonLd(SLUG)) }}
      />
      <CityPage page={page} />
    </>
  );
}
