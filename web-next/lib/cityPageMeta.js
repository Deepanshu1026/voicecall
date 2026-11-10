import { CITY_PAGES } from './cityPages';

const SITE = 'https://avisaexperts.com';

// Note: the Next App Router does NOT support partial dynamic segments, so
// `visa-consultant-in-[city]` is treated as a literal folder name. Each city
// therefore gets its own tiny route file (app/visa-consultant-in-<slug>/page.jsx)
// that reuses these helpers.

export const cityPath = (slug) => `/visa-consultant-in-${slug}`;

export function cityMetadata(slug) {
  const page = CITY_PAGES[slug];
  if (!page || page.status !== 'published') {
    return { title: 'Page not found | A Visa Experts', robots: { index: false, follow: true } };
  }
  const url = `${SITE}${cityPath(slug)}`;
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

export function cityJsonLd(slug) {
  const page = CITY_PAGES[slug];
  if (!page) return null;
  const url = `${SITE}${cityPath(slug)}`;
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

  return { '@context': 'https://schema.org', '@graph': graph };
}
