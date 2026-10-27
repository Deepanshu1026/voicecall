import UkVisaRequirements from '../../../components/pages/UkVisaRequirements';

const SITE_URL = 'https://avisaexperts.com';

const TITLE = 'UK Visa Requirements for Indians 2026 | Tourist & Visitor Visa';
const DESCRIPTION =
  'UK visa requirements for Indians: eligibility, passport, bank balance, documents for salaried, self-employed, retired, students and parents, plus a checklist.';

export const metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: {
    canonical: `${SITE_URL}/uk-visa/requirements`,
    languages: { en: '/uk-visa/requirements', 'en-IN': '/uk-visa/requirements', 'x-default': '/uk-visa/requirements' },
  },
  openGraph: {
    type: 'article',
    title: TITLE,
    description: DESCRIPTION,
    url: `${SITE_URL}/uk-visa/requirements`,
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
    'What are the requirements for UK tourist visa from India?',
    'A valid passport, online application, visa fee, biometrics, and evidence of purpose, funds and ties to India.',
  ],
  [
    'How much bank balance is required for UK visa from India?',
    'There is no fixed amount. Funds should cover the trip and match your income.',
  ],
  ['Is ITR required for UK visa?', 'Not mandatory, but ITRs for 2 to 3 years are useful evidence of income.'],
  ['Can I get a UK visa without travel history?', 'Yes. Travel history helps, but it is not a requirement.'],
  [
    'Is invitation letter required for UK tourist visa?',
    'Not mandatory. It is useful when visiting family or friends, or for business visits.',
  ],
  [
    'Is hotel booking required for UK visa?',
    "No paid booking is required. A refundable reservation or the host's address is enough.",
  ],
  [
    'Can a housewife apply for UK tourist visa?',
    "Yes. Spouse's financial documents and relationship proof are usually used.",
  ],
  [
    'Does meeting UK visa requirements guarantee approval?',
    'No. Each application is decided by UK Visas and Immigration.',
  ],
];

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebPage',
      '@id': `${SITE_URL}/uk-visa/requirements`,
      url: `${SITE_URL}/uk-visa/requirements`,
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
        { '@type': 'ListItem', position: 3, name: 'Requirements', item: `${SITE_URL}/uk-visa/requirements` },
      ],
    },
  ],
};

export default function Page() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <UkVisaRequirements />
    </>
  );
}
