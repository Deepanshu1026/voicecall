import { CITY_COUNTRY_PAGES } from './cityCountryPages';
import { CITY_PAGES } from './cityPages';

const SITE = 'https://avisaexperts.com';

export const cityCountryPath = (slug) => `/${slug}`;

export function cityCountryMetadata(slug) {
  const page = CITY_COUNTRY_PAGES[slug];
  if (!page || page.status !== 'published') {
    return { title: 'Page not found | A Visa Experts', robots: { index: false, follow: true } };
  }
  const url = `${SITE}${cityCountryPath(slug)}`;
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

export function cityCountryJsonLd(slug) {
  const page = CITY_COUNTRY_PAGES[slug];
  if (!page) return null;
  const url = `${SITE}${cityCountryPath(slug)}`;
  const citySlug = (page.cityPath || '').split('/').pop();
  const office = CITY_PAGES[citySlug]?.office;
  const graph = [];

  if (office) {
    graph.push({
      '@type': 'LocalBusiness',
      '@id': `${url}#office`,
      name: `A Visa Experts - ${page.city}`,
      url,
      telephone: office.phone,
      address: {
        '@type': 'PostalAddress',
        streetAddress: office.address,
        addressLocality: page.city,
        addressRegion: CITY_PAGES[citySlug]?.state,
        addressCountry: 'IN',
      },
      openingHours: office.hours,
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

  return { '@context': 'https://schema.org', '@graph': graph };
}
