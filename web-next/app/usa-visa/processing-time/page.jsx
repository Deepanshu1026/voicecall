import UsaProcessingTime from '../../../components/pages/UsaProcessingTime';

export const metadata = {
  title: 'USA Visa Processing Time 2026 | A Visa Experts',
  description:
    'Understand USA visa processing time stage by stage — DS-160, fee, appointment wait, interview and passport return — plus practical tips to avoid delays.',
  keywords:
    'USA visa processing time, US visa processing time, how long does a US visa take, B1 B2 visa processing time, USA tourist visa processing time, US visa appointment wait time, US visa interview waiver, CEAC visa status',
  alternates: {
    canonical: '/usa-visa/processing-time',
    languages: {
      en: '/usa-visa/processing-time',
      'en-IN': '/usa-visa/processing-time',
      'x-default': '/usa-visa/processing-time',
    },
  },
  openGraph: {
    title: 'USA Visa Processing Time 2026 | A Visa Experts',
    description:
      'How long does a US visa take? See the typical processing time for each stage and how to avoid delays.',
    url: 'https://avisaexperts.com/usa-visa/processing-time',
    images: ['/images/user/statueofliberty 1.webp'],
  },
};

export default function Page() {
  return <UsaProcessingTime />;
}
