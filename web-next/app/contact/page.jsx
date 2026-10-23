import Contact from '../../components/pages/Contact';

const SITE_URL = 'https://avisaexperts.com';

const TITLE = 'Contact Us | A Visa Experts';
const DESCRIPTION =
  'Contact A Visa Experts — call +91 120-4502750, email info@avisaexperts.com, or visit our offices in Noida, Ahmedabad, New York, Florida, Seattle and London.';

export const metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: `${SITE_URL}/contact`, languages: { en: '/contact', 'en-IN': '/contact', 'x-default': '/contact' } },
  openGraph: {
    type: 'website',
    title: TITLE,
    description: DESCRIPTION,
    url: `${SITE_URL}/contact`,
    siteName: 'A Visa Experts',
    images: ['/images/user/tmlogo%201.webp'],
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
    images: ['/images/user/tmlogo%201.webp'],
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'ContactPage',
      '@id': `${SITE_URL}/contact`,
      url: `${SITE_URL}/contact`,
      name: TITLE,
      description: DESCRIPTION,
      isPartOf: { '@id': `${SITE_URL}/#website` },
    },
    {
      '@type': 'Organization',
      '@id': `${SITE_URL}/#organization`,
      name: 'A Visa Experts',
      url: SITE_URL,
      logo: `${SITE_URL}/images/user/tmlogo%201.webp`,
      email: 'info@avisaexperts.com',
      telephone: '+91-120-4502750',
      contactPoint: [
        {
          '@type': 'ContactPoint',
          telephone: '+91-120-4502750',
          contactType: 'customer service',
          areaServed: ['IN', 'US', 'GB', 'CA', 'AU', 'NZ'],
          availableLanguage: ['English', 'Hindi'],
        },
      ],
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'B Block, Sector 2',
        addressLocality: 'Noida',
        addressRegion: 'Uttar Pradesh',
        postalCode: '201301',
        addressCountry: 'IN',
      },
      location: [
        {
          '@type': 'Place',
          name: 'A Visa Experts — Noida',
          address: {
            '@type': 'PostalAddress',
            streetAddress: 'B Block, Sector 2',
            addressLocality: 'Noida',
            addressRegion: 'Uttar Pradesh',
            postalCode: '201301',
            addressCountry: 'IN',
          },
        },
        {
          '@type': 'Place',
          name: 'A Visa Experts — Ahmedabad',
          address: {
            '@type': 'PostalAddress',
            streetAddress: 'A-1, First Floor, Valmik Complex, opposite Kalupur Bank, near Parimal Cross Road, Ambawadi',
            addressLocality: 'Ahmedabad',
            addressRegion: 'Gujarat',
            postalCode: '380006',
            addressCountry: 'IN',
          },
        },
        {
          '@type': 'Place',
          name: 'A Visa Experts — New York',
          address: {
            '@type': 'PostalAddress',
            streetAddress: '300 International Dr, Suite 100',
            addressLocality: 'Williamsville',
            addressRegion: 'NY',
            postalCode: '14221',
            addressCountry: 'US',
          },
        },
        {
          '@type': 'Place',
          name: 'A Visa Experts — Florida',
          address: {
            '@type': 'PostalAddress',
            streetAddress: '2012 Hollywood Blvd',
            addressLocality: 'Hollywood',
            addressRegion: 'FL',
            postalCode: '33020',
            addressCountry: 'US',
          },
        },
        {
          '@type': 'Place',
          name: 'A Visa Experts — Seattle',
          address: {
            '@type': 'PostalAddress',
            streetAddress: '3614 California Ave SW',
            addressLocality: 'Seattle',
            addressRegion: 'WA',
            postalCode: '98116',
            addressCountry: 'US',
          },
        },
        {
          '@type': 'Place',
          name: 'A Visa Experts — London',
          address: {
            '@type': 'PostalAddress',
            streetAddress: '128 City Rd',
            addressLocality: 'London',
            postalCode: 'EC1V 2NX',
            addressCountry: 'GB',
          },
        },
      ],
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/` },
        { '@type': 'ListItem', position: 2, name: 'Contact', item: `${SITE_URL}/contact` },
      ],
    },
  ],
};

export default function Page() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Contact />
    </>
  );
}
