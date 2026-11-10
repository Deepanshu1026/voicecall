import { notFound } from 'next/navigation';
import CityPage from '../../components/pages/CityPage';
import { CITY_PAGES } from '../../lib/cityPages';

export const revalidate = 3600;
export const dynamicParams = false;

const SITE = 'https://avisaexperts.com';

export function generateStaticParams() {
  return Object.entries(CITY_PAGES)
    .filter(([, page]) => page.status === 'published')
    .map(([slug]) => ({ city: slug }));
}

export async function generateMetadata({ params }) {
  const page = CITY_PAGES[params.city];
  if (!page || page.status !== 'published') {
    return { title: 'Page not found | A Visa Experts', robots: { index: false, follow: true } };
  }
  const url = `${SITE}/visa-consultant-in-${params.city}`;
  return {
    title: page.metaTitle,
    description: page.metaDescription,
    alternates: { canonical: url, languages: { en: url, 'en-IN': url, 'x-default': url } },
    openGraph: {
      type: 'website',
      title: page.metaTitle,
      description: page.metaDescription,
      url,
      siteName: 'A Visa Experts',
    },
    twitter: { card: 'summary_large_image', title: page.metaTitle, description: page.metaDescription },
  };
}

export default function Page({ params }) {
  const page = CITY_PAGES[params.city];
  if (!page || page.status !== 'published') notFound();

  const url = `${SITE}/visa-consultant-in-${params.city}`;
  const graph = [];

  if (page.office) {
    graph.push({
      '@type': 'LocalBusiness',
      '@id': `${url}#office`,
      name: `A Visa Experts - ${page.city}`,
      url,
      telephone: page.office.phone,
      address: {
        '@type': 'PostalAddress',
        streetAddress: page.office.address,
        addressLocality: page.city,
        addressRegion: page.state,
        addressCountry: 'IN',
      },
      openingHours: page.office.hours,
      parentOrganization: { '@id': `${SITE}/#organization` },
    });
  }

  if (Array.isArray(page.faqs) && page.faqs.length) {
    graph.push({
      '@type': 'FAQPage',
      mainEntity: page.faqs.map((f) => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a },
      })),
    });
  }

  const jsonLd = { '@context': 'https://schema.org', '@graph': graph };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <CityPage page={page} />
    </>
  );
}
