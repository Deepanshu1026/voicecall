import UkBusinessVisa from '../../../components/pages/UkBusinessVisa';

const SITE_URL = 'https://avisaexperts.com';

const TITLE = 'UK Business Visa from India 2026 | Requirements & Documents';
const DESCRIPTION =
  'UK business visa from India: permitted business activities, documents required, invitation letter, how to apply, processing time and validity options.';

export const metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: {
    canonical: `${SITE_URL}/uk-visa/business-visitor-visa`,
    languages: {
      en: '/uk-visa/business-visitor-visa',
      'en-IN': '/uk-visa/business-visitor-visa',
      'x-default': '/uk-visa/business-visitor-visa',
    },
  },
  openGraph: {
    type: 'article',
    title: TITLE,
    description: DESCRIPTION,
    url: `${SITE_URL}/uk-visa/business-visitor-visa`,
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
    'Can I go to the UK for a business meeting on a tourist visa?',
    'Yes. Business meetings and tourism are both covered by the Standard Visitor Visa.',
  ],
  [
    'Can a UK company pay for my travel and hotel?',
    'Yes. A UK company can usually cover reasonable travel and accommodation costs. It should be stated in the invitation letter.',
  ],
  [
    'Can I work in the UK on a business visitor visa?',
    'No. Working for a UK company or UK clients is not allowed.',
  ],
  [
    'Can I attend a job interview in the UK on a visitor visa?',
    'Yes, but you cannot start working on the visitor visa.',
  ],
  [
    'Can freelancers apply for UK business visa?',
    'Freelancers can visit for meetings and negotiations, but the actual work for UK clients must be done outside the UK.',
  ],
  [
    'How long can I stay on a UK business visa?',
    'Up to 6 months per visit, though the stay should match the business purpose.',
  ],
  [
    'Is a UK business visa guaranteed with an invitation letter?',
    'No. An invitation supports the application, but the decision is made by UK Visas and Immigration.',
  ],
];

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebPage',
      '@id': `${SITE_URL}/uk-visa/business-visitor-visa`,
      url: `${SITE_URL}/uk-visa/business-visitor-visa`,
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
          name: 'Business Visitor Visa',
          item: `${SITE_URL}/uk-visa/business-visitor-visa`,
        },
      ],
    },
  ],
};

export default function Page() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <UkBusinessVisa />
    </>
  );
}
