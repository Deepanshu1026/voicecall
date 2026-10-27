import UkVisaFees from '../../../components/pages/UkVisaFees';

const SITE_URL = 'https://avisaexperts.com';

const TITLE = 'UK Visa Fees for Indians 2026 | Tourist, Priority & 10 Year Visa';
const DESCRIPTION =
  'UK visa fees for Indians explained: tourist visa fee by validity, priority and super priority charges, centre services, payment in rupees and refund rules.';

export const metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: {
    canonical: `${SITE_URL}/uk-visa/fees`,
    languages: { en: '/uk-visa/fees', 'en-IN': '/uk-visa/fees', 'x-default': '/uk-visa/fees' },
  },
  openGraph: {
    type: 'article',
    title: TITLE,
    description: DESCRIPTION,
    url: `${SITE_URL}/uk-visa/fees`,
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
    'What is the UK tourist visa fee for Indians?',
    'The fee depends on the visa length. A 6-month visa has the lowest fee. Check the current government fee before applying.',
  ],
  ['Is UK visa fee refundable if rejected?', 'Generally no.'],
  [
    'Is the UK business visa fee different from the tourist visa fee?',
    'No. Both use the Standard Visitor Visa; the fee depends on the visa length.',
  ],
  ['Do children pay the same UK visa fee?', 'Each child pays for their own application.'],
  [
    'Can I pay UK visa fee in rupees?',
    'Payment is made online by card; the amount may appear in pounds or rupees, and bank charges may apply.',
  ],
  [
    'Does paying for priority service guarantee a UK visa?',
    'No. It only speeds up when the application is decided.',
  ],
];

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebPage',
      '@id': `${SITE_URL}/uk-visa/fees`,
      url: `${SITE_URL}/uk-visa/fees`,
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
        { '@type': 'ListItem', position: 3, name: 'Fees', item: `${SITE_URL}/uk-visa/fees` },
      ],
    },
  ],
};

export default function Page() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <UkVisaFees />
    </>
  );
}
