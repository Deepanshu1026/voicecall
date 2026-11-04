import CanadaVisa from '../../components/pages/CanadaVisa';

const SITE_URL = 'https://avisaexperts.com';

const TITLE = 'Canada Visa from India: Tourist & Transit Visa Guide 2026';
const DESCRIPTION =
  'Canada visa from India explained: which visa you need, tourist and transit visa rules, requirements, biometrics, fees, processing time and refusals.';

export const metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: '/canada-visa', languages: { en: '/canada-visa', 'en-IN': '/canada-visa', 'x-default': '/canada-visa' } },
  openGraph: {
    type: 'article',
    title: TITLE,
    description: DESCRIPTION,
    url: `${SITE_URL}/canada-visa`,
    siteName: 'A Visa Experts',
    images: ['/images/user/canada 1.webp'],
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
    images: ['/images/user/canada 1.webp'],
  },
};

const faqs = [
  ['Can Indians get Canada eTA?', 'No. Indian passport holders need a visa, not an eTA.'],
  [
    'Do I need a Canada transit visa for a layover?',
    'Yes, if you are connecting between international flights in Canada for 48 hours or less and do not hold a valid Canadian tourist visa.',
  ],
  [
    'What is the fee for a Canada visa from India?',
    'Both the application fee and the biometrics fee depend on the country\u2019s visa requirements and the type of visa you are applying for. Check the current fees before applying.',
  ],
  ['Are Canada biometrics valid for future applications?', 'Biometrics are generally valid for 10 years.'],
  ['Is Canada visa approval guaranteed?', 'No. Every decision is made by the Canadian immigration authorities.'],
];

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebPage',
      '@id': `${SITE_URL}/canada-visa`,
      url: `${SITE_URL}/canada-visa`,
      name: TITLE,
      description: DESCRIPTION,
      isPartOf: { '@id': `${SITE_URL}/#website` },
    },
    {
      '@type': 'FAQPage',
      mainEntity: faqs.map(([q, a]) => ({
        '@type': 'Question',
        name: q,
        acceptedAnswer: { '@type': 'Answer', text: a },
      })),
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/` },
        { '@type': 'ListItem', position: 2, name: 'Canada Visa', item: `${SITE_URL}/canada-visa` },
      ],
    },
  ],
};

export default function Page() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <CanadaVisa />
    </>
  );
}
