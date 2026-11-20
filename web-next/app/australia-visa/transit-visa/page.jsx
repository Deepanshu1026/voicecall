import AustraliaTransitVisa from '../../../components/pages/AustraliaTransitVisa';

const SITE = 'https://avisaexperts.com';
const URL = `${SITE}/australia-visa/transit-visa`;

const TITLE = 'Australia Transit Visa for Indians 2026: Subclass 771 Explained';
const DESCRIPTION =
  'Do Indians need a transit visa for Australia? Yes, even for short layovers. Subclass 771 explained: the 72-hour limit, documents, how to apply, and when you need a tourist visa instead.';

export const metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: {
    canonical: URL,
    languages: { en: URL, 'en-IN': URL, 'x-default': URL },
  },
  openGraph: {
    type: 'website',
    title: 'Australia Transit Visa for Indians: Subclass 771',
    description:
      'Indian passport holders need a transit visa for Australia, even for short layovers. Here\u2019s how subclass 771 works.',
    url: URL,
    siteName: 'A Visa Experts',
    images: ['/images/user/australia 1.webp'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Australia Transit Visa for Indians: Subclass 771',
    description: 'Indian passport holders need a transit visa for Australia, even for short layovers.',
    images: ['/images/user/australia 1.webp'],
  },
};

const faqs = [
  [
    'Do Indians need a transit visa for Australia?',
    'Yes. Indian ordinary passport holders are not eligible for Australia\u2019s Transit Without Visa arrangement, so they need a Transit visa (subclass 771) unless they already hold another valid Australian visa.',
  ],
  [
    'Do I need a transit visa for a layover under 8 hours in Australia?',
    'Yes, if you hold an Indian passport. The 8-hour visa-free transit applies only to certain other nationalities.',
  ],
  [
    'How long can I stay on an Australia transit visa?',
    'Up to 72 hours, only for the purpose of transiting to another country.',
  ],
  [
    'What if my layover in Australia is longer than 72 hours?',
    'You need an Australia tourist visa instead of a transit visa.',
  ],
];

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebPage',
      '@id': URL,
      url: URL,
      name: TITLE,
      description: DESCRIPTION,
      isPartOf: { '@id': `${SITE}/#website` },
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
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE}/` },
        { '@type': 'ListItem', position: 2, name: 'Transit Visa', item: `${SITE}/transit-visa` },
        { '@type': 'ListItem', position: 3, name: 'Australia Transit Visa', item: URL },
      ],
    },
  ],
};

export default function Page() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <AustraliaTransitVisa />
    </>
  );
}
