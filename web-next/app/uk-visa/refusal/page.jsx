import UkVisaRefusal from '../../../components/pages/UkVisaRefusal';

const SITE_URL = 'https://avisaexperts.com';

const TITLE = 'UK Visa Rejection Reasons 2026 | UK Visa Refused, What Next?';
const DESCRIPTION =
  'Common UK visa rejection reasons for Indians, what a UK visa refusal letter means, appeal and reapply options, and how to prepare a stronger reapplication.';

export const metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: {
    canonical: `${SITE_URL}/uk-visa/refusal`,
    languages: { en: '/uk-visa/refusal', 'en-IN': '/uk-visa/refusal', 'x-default': '/uk-visa/refusal' },
  },
  openGraph: {
    type: 'article',
    title: TITLE,
    description: DESCRIPTION,
    url: `${SITE_URL}/uk-visa/refusal`,
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
    'Why was my UK tourist visa refused?',
    'The refusal letter gives the exact reasons. Common ones are weak ties to India, unexplained funds, unclear purpose and inconsistent information.',
  ],
  ['Can I appeal a UK visitor visa refusal?', 'In most cases, no. A fresh application is usually the practical option.'],
  [
    'How many times can I apply for a UK visa after refusal?',
    'There is no fixed limit, but each application should address the reasons for the earlier refusal.',
  ],
  ['Is UK visa fee refunded after refusal?', 'Generally no.'],
  [
    'Do I have to mention UK visa refusal in future applications?',
    'Yes, whenever an application asks about previous refusals.',
  ],
  [
    'Can a UK visa refusal be cancelled?',
    'A refusal cannot simply be cancelled. It can only be challenged through a legal route where available, or replaced by a successful new application.',
  ],
];

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebPage',
      '@id': `${SITE_URL}/uk-visa/refusal`,
      url: `${SITE_URL}/uk-visa/refusal`,
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
        { '@type': 'ListItem', position: 3, name: 'Refusal', item: `${SITE_URL}/uk-visa/refusal` },
      ],
    },
  ],
};

export default function Page() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <UkVisaRefusal />
    </>
  );
}
