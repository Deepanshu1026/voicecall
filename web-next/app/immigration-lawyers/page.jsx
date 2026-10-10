import ImmigrationLawyers from '../../components/pages/ImmigrationLawyers';

export const metadata = {
  title: 'Immigration Lawyers & Visa Consultants | A Visa Experts',
  description:
    'Talk to immigration lawyers and visa consultants at A Visa Experts. Expert guidance for work, permanent residency, tourist, business and transit visas for the USA, UK, Canada, Australia and Europe.',
  keywords:
    'immigration lawyers, immigration consultants, visa consultants, immigration lawyer India, visa officers, immigration advisors, work visa consultant, PR consultant, A Visa Experts',
  alternates: { canonical: '/immigration-lawyers', languages: { en: '/immigration-lawyers', 'en-IN': '/immigration-lawyers', 'x-default': '/immigration-lawyers' } },
  openGraph: {
    title: 'Immigration Lawyers & Visa Consultants | A Visa Experts',
    description:
      'Talk to immigration lawyers and visa consultants at A Visa Experts for work, PR, tourist, business and transit visa guidance.',
    url: 'https://avisaexperts.com/immigration-lawyers',
    images: ['/images/user/popularplace3 1.webp'],
  },
};

export default function Page() {
  return <ImmigrationLawyers />;
}
