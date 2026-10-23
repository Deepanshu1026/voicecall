import UsaRejectionReasons from '../../../components/pages/UsaRejectionReasons';

export const metadata = {
  title: 'USA Visa Rejection Reasons 2026 | A Visa Experts',
  description:
    'Why do US visas get refused? See the most common USA visa rejection reasons, what 214(b) and 221(g) mean, and how to strengthen your reapplication.',
  alternates: {
    canonical: '/usa-visa/rejection-reasons',
    languages: {
      en: '/usa-visa/rejection-reasons',
      'en-IN': '/usa-visa/rejection-reasons',
      'x-default': '/usa-visa/rejection-reasons',
    },
  },
  openGraph: {
    title: 'USA Visa Rejection Reasons 2026 | A Visa Experts',
    description:
      'The most common reasons US visas get refused, what your refusal notice means, and how to strengthen your next application.',
    url: 'https://avisaexperts.com/usa-visa/rejection-reasons',
    images: ['/images/user/statueofliberty 1.webp'],
  },
};

export default function Page() {
  return <UsaRejectionReasons />;
}
