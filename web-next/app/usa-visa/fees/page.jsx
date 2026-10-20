import UsaVisaFees from '../../../components/pages/UsaVisaFees';

export const metadata = {
  title: 'USA Visa Fees 2026: How Much Does It Cost? | A Visa Experts',
  description:
    'USA visa fees explained — the nonimmigrant visa application (MRV) fee by visa type, what it covers, other costs and why the US visa fee is non-refundable.',
  keywords:
    'USA visa fees, US visa fees, how much does a US visa cost, US visa application fee, MRV fee, B1 B2 visa fee, US visa fee India, USA visa cost 2026',
  alternates: {
    canonical: '/usa-visa/fees',
    languages: { en: '/usa-visa/fees', 'en-IN': '/usa-visa/fees', 'x-default': '/usa-visa/fees' },
  },
  openGraph: {
    title: 'USA Visa Fees 2026: How Much Does It Cost? | A Visa Experts',
    description: 'The US visa application fee by visa type, what it covers and other costs to plan for.',
    url: 'https://avisaexperts.com/usa-visa/fees',
    images: ['/images/user/statueofliberty 1.webp'],
  },
};

export default function Page() {
  return <UsaVisaFees />;
}
