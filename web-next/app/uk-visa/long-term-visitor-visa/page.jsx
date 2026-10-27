import UkLongTermVisa from '../../../components/pages/UkLongTermVisa';

const SITE_URL = 'https://avisaexperts.com';

const TITLE = 'UK 10 Year Visa for Indians 2026 | 2, 5 & 10 Year Visitor Visa';
const DESCRIPTION =
  'UK 10 year visa for Indians explained: compare 2, 5 and 10 year UK visitor visas, eligibility, the 6-month rule, documents, fees and processing time.';

export const metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: {
    canonical: `${SITE_URL}/uk-visa/long-term-visitor-visa`,
    languages: {
      en: '/uk-visa/long-term-visitor-visa',
      'en-IN': '/uk-visa/long-term-visitor-visa',
      'x-default': '/uk-visa/long-term-visitor-visa',
    },
  },
  openGraph: {
    type: 'article',
    title: TITLE,
    description: DESCRIPTION,
    url: `${SITE_URL}/uk-visa/long-term-visitor-visa`,
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
  ['How long can I stay in the UK with a 10 year visa?', 'Up to 6 months per visit.'],
  ['Is the UK 10 year visa multiple entry?', 'Yes. All long-term visitor visas allow multiple visits.'],
  ['Can I work in the UK on a 10 year visa?', 'No. It is a visitor visa and does not allow work.'],
  [
    'What happens if my passport expires during the 10 year visa?',
    'Update your new passport details in your UK Visas and Immigration account so your eVisa is linked to it.',
  ],
  [
    'Can children get a UK 10 year visa?',
    'Children can apply for long-term visitor visas, but the rules for under-18s include extra requirements.',
  ],
  ['Is UK 10 year visa approval guaranteed?', 'No. Each application is decided by UK Visas and Immigration.'],
];

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebPage',
      '@id': `${SITE_URL}/uk-visa/long-term-visitor-visa`,
      url: `${SITE_URL}/uk-visa/long-term-visitor-visa`,
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
        {
          '@type': 'ListItem',
          position: 3,
          name: 'Long-Term Visitor Visa',
          item: `${SITE_URL}/uk-visa/long-term-visitor-visa`,
        },
      ],
    },
  ],
};

export default function Page() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <UkLongTermVisa />
    </>
  );
}
