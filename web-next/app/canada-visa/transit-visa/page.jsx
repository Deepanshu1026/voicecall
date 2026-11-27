import CanadaTransitVisa from '../../../components/pages/CanadaTransitVisa';

const SITE = 'https://avisaexperts.com';
const URL = `${SITE}/canada-visa/transit-visa`;

const TITLE = 'Canada Transit Visa for Indians: Rules & Documents (2026)';
const DESCRIPTION =
  'Flying through Canada? Find out when Indians need a Canada transit visa, the 48-hour rule, documents, how to apply and mistakes to avoid. 2026 guide.';

export const metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: {
    canonical: URL,
    languages: { en: URL, 'en-IN': URL, 'x-default': URL },
  },
  openGraph: {
    type: 'website',
    title: TITLE,
    description: DESCRIPTION,
    url: URL,
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
  [
    'Canada transit visa kab chahiye?',
    'If you are an Indian citizen with a flight connection in Canada of 48 hours or less, you usually need a Canada transit visa, even if you stay inside the airport.',
  ],
  [
    'Kya US visa hai toh Canada transit visa nahi chahiye?',
    'Usually you still need it. A US visa alone does not normally let Indian passport holders transit through Canada without a Canadian visa. Check the current eTA rules before you travel.',
  ],
  [
    'Kya Canada tourist visa se transit kar sakte hain?',
    'Yes. A valid Canada tourist visa can also be used for transit.',
  ],
  [
    '48 ghante se zyada layover ho toh kya karein?',
    'Apply for a Canada tourist visa instead of a transit visa.',
  ],
  [
    'Canada transit visa ka process kitna time leta hai?',
    'It varies with demand and season. Apply as soon as your flights are confirmed.',
  ],
  [
    'Kya transit ke dauraan airport se bahar ja sakte hain?',
    'Not for sightseeing on a transit visa. If you want to go out, apply for a tourist visa.',
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
        { '@type': 'ListItem', position: 2, name: 'Canada Visa', item: `${SITE}/canada-visa` },
        { '@type': 'ListItem', position: 3, name: 'Canada Transit Visa', item: URL },
      ],
    },
  ],
};

export default function Page() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <CanadaTransitVisa />
    </>
  );
}
