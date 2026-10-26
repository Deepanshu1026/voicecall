import UkVisitorVisa from '../../components/pages/UkVisitorVisa';

const SITE_URL = 'https://avisaexperts.com';

const TITLE = 'UK Visa from India: Tourist & Visitor Visa Guide 2026';
const DESCRIPTION =
  'UK visa from India explained: UK tourist visa, visitor visa requirements, documents, fees, processing time, how to apply online and common rejection reasons.';

export const metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: '/uk-visa', languages: { en: '/uk-visa', 'en-IN': '/uk-visa', 'x-default': '/uk-visa' } },
  openGraph: {
    type: 'article',
    title: TITLE,
    description: DESCRIPTION,
    url: `${SITE_URL}/uk-visa`,
    siteName: 'A Visa Experts',
    images: ['/images/user/uk 1.webp'],
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
    images: ['/images/user/uk 1.webp'],
  },
};

const faqs = [
  [
    'Is UK tourist visa easy to get for Indians?',
    'There is no "easy" or "hard" category. Applications with a clear purpose, explained funds and strong ties to India are easier for an officer to assess.',
  ],
  [
    'How much bank balance is required for UK tourist visa?',
    'There is no fixed amount. Funds should cover the planned trip and match your income.',
  ],
  ['How long can I stay in the UK on a tourist visa?', 'Usually up to 6 months per visit.'],
  [
    'Can I apply for UK visa online from India?',
    'Yes. The application is made online, followed by a biometrics appointment at a visa application centre in India.',
  ],
  [
    'Is interview required for UK tourist visa?',
    'Usually not. Most applications are decided on documents, though an officer may occasionally contact an applicant.',
  ],
  ['Can I work in the UK on a visitor visa?', 'No. Paid or unpaid work for a UK employer is not allowed.'],
  ['Can I visit Ireland with a UK visa?', 'In certain cases, under the British-Irish Visa Scheme.'],
  ['Is UK visa approval guaranteed?', 'No. Every decision is made by UK Visas and Immigration.'],
];

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebPage',
      '@id': `${SITE_URL}/uk-visa`,
      url: `${SITE_URL}/uk-visa`,
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
        { '@type': 'ListItem', position: 2, name: 'UK Visa', item: `${SITE_URL}/uk-visa` },
      ],
    },
  ],
};

export default function Page() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <UkVisitorVisa />
    </>
  );
}
