import UkVisaProcessingTime from '../../../components/pages/UkVisaProcessingTime';

const SITE_URL = 'https://avisaexperts.com';

const TITLE = 'UK Visa Processing Time in India 2026 | Tourist & Priority Visa';
const DESCRIPTION =
  'UK visa processing time in India: standard decision time after biometrics, priority and super priority timelines, reasons for delay and when to apply.';

export const metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: {
    canonical: `${SITE_URL}/uk-visa/processing-time`,
    languages: {
      en: '/uk-visa/processing-time',
      'en-IN': '/uk-visa/processing-time',
      'x-default': '/uk-visa/processing-time',
    },
  },
  openGraph: {
    type: 'article',
    title: TITLE,
    description: DESCRIPTION,
    url: `${SITE_URL}/uk-visa/processing-time`,
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
    'How long does UK visa take from India?',
    'Usually within 3 weeks of the biometrics appointment for a standard application.',
  ],
  ['How many days after biometrics does UK visa come?', 'Usually within 15 working days for standard service.'],
  [
    'Is priority service available for UK tourist visa in India?',
    'It is often available, but depends on the centre and season.',
  ],
  ['Does UK visa processing time start after online application?', 'No. It starts after the biometrics appointment.'],
  ['Can I get my passport back while my UK visa is processing?', 'Yes. The passport is usually returned at the appointment.'],
  ['Does a long wait mean my UK visa is refused?', 'Not necessarily. Some applications need extra checks.'],
];

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebPage',
      '@id': `${SITE_URL}/uk-visa/processing-time`,
      url: `${SITE_URL}/uk-visa/processing-time`,
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
        { '@type': 'ListItem', position: 3, name: 'Processing Time', item: `${SITE_URL}/uk-visa/processing-time` },
      ],
    },
  ],
};

export default function Page() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <UkVisaProcessingTime />
    </>
  );
}
