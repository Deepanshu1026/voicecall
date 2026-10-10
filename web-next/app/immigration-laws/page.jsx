import ImmigrationLaws from '../../components/pages/ImmigrationLaws';

export const metadata = {
  title: 'Immigration Laws 2026: US, UK, Canada & Australia Guide | A Visa Experts',
  description:
    'A clear 2026 guide to immigration laws for the USA, UK, Canada, Australia and Europe. Understand visa categories, permanent residency, eligibility, documents and how to apply.',
  keywords:
    'immigration laws, immigration laws 2026, US immigration, UK immigration, Canada immigration, Australia immigration, visa categories, permanent residency, immigration guide, A Visa Experts',
  alternates: { canonical: '/immigration-laws', languages: { en: '/immigration-laws', 'en-IN': '/immigration-laws', 'x-default': '/immigration-laws' } },
  openGraph: {
    title: 'Immigration Laws 2026: US, UK, Canada & Australia Guide | A Visa Experts',
    description:
      'A clear 2026 guide to immigration laws for the USA, UK, Canada, Australia and Europe — visa categories, permanent residency, eligibility and documents.',
    url: 'https://avisaexperts.com/immigration-laws',
    images: ['/images/user/popularplace2 1.webp'],
  },
};

export default function Page() {
  return <ImmigrationLaws />;
}
