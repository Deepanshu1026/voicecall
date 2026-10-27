import UkFamilyVisitVisa from '../../../components/pages/UkFamilyVisitVisa';

const SITE_URL = 'https://avisaexperts.com';

const TITLE = 'UK Visit Visa for Parents from India 2026 | Documents & Sponsor';
const DESCRIPTION =
  'UK visit visa for parents from India: documents for parents and sponsor, sponsor letter, how long parents can stay, processing time and common refusal reasons.';

export const metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: {
    canonical: `${SITE_URL}/uk-visa/family-visit-visa`,
    languages: {
      en: '/uk-visa/family-visit-visa',
      'en-IN': '/uk-visa/family-visit-visa',
      'x-default': '/uk-visa/family-visit-visa',
    },
  },
  openGraph: {
    type: 'article',
    title: TITLE,
    description: DESCRIPTION,
    url: `${SITE_URL}/uk-visa/family-visit-visa`,
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
    'Can my son in UK sponsor my visit visa?',
    'Yes. A son or daughter in the UK can sponsor the visit with a sponsor letter and financial documents.',
  ],
  [
    'Does the sponsor need to be a British citizen?',
    'No. The sponsor can be a British citizen, settled, or on a work or study visa.',
  ],
  ['Do both parents need separate visa applications?', 'Yes. Each parent applies separately and pays a separate fee.'],
  ['Can parents stay 6 months in the UK?', 'Yes, up to 6 months per visit, but the stay should match the purpose.'],
  ['Can parents extend their UK visitor visa?', 'In most cases, no.'],
  ['Is travel insurance required for parents\u2019 UK visa?', 'Not mandatory, but recommended.'],
  [
    'Does having children in the UK guarantee a visa for parents?',
    'No. Each application is decided by UK Visas and Immigration.',
  ],
];

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebPage',
      '@id': `${SITE_URL}/uk-visa/family-visit-visa`,
      url: `${SITE_URL}/uk-visa/family-visit-visa`,
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
          name: 'Family Visit Visa',
          item: `${SITE_URL}/uk-visa/family-visit-visa`,
        },
      ],
    },
  ],
};

export default function Page() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <UkFamilyVisitVisa />
    </>
  );
}
