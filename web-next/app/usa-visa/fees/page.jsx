import UsaVisaFees from '../../../components/pages/UsaVisaFees';

export const metadata = {
  title: 'USA Visa Fees for Indian Applicants 2026 | A Visa Experts',
  description:
    'Understanding USA visa fees for Indian applicants — the visa application (MRV) fee, what the fee covers, refund rules, payment steps and fee categories.',
  keywords:
    'USA visa fees, USA visa fees for Indian applicants, US visa application fee, MRV fee, B1 B2 visa fee, USA visa fee payment, US visa fee refundable, USA visa fee 2026',
  alternates: {
    canonical: '/usa-visa/fees',
    languages: { en: '/usa-visa/fees', 'en-IN': '/usa-visa/fees', 'x-default': '/usa-visa/fees' },
  },
  openGraph: {
    title: 'USA Visa Fees for Indian Applicants 2026 | A Visa Experts',
    description:
      'USA visa fees explained for Indian applicants — what the fee covers, refund rules and payment steps.',
    url: 'https://avisaexperts.com/usa-visa/fees',
    images: ['/images/user/statueofliberty 1.webp'],
  },
};

export default function Page() {
  return <UsaVisaFees />;
}
