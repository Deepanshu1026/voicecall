import UsaVisitorVisa from '../../components/pages/UsaVisitorVisa';

export const metadata = {
  title: 'USA Visitor Visa Services | A Visa Experts',
  description:
    'Expert USA Visitor Visa guidance from A Visa Experts. Profile assessment, DS-160 assistance, documentation support and interview preparation. Book a free consultation.',
  keywords:
    'USA visitor visa, US visitor visa, USA business visa, B1 B2 visa, DS-160 assistance, USA visa consultants, USA visa interview preparation, A Visa Experts',
  alternates: { canonical: '/usa-visa' },
  openGraph: {
    title: 'USA Visitor Visa Services | A Visa Experts',
    description:
      'Expert USA Visitor Visa guidance from A Visa Experts. Profile assessment, DS-160 assistance, documentation support and interview preparation.',
    url: 'https://avisaexperts.com/usa-visa',
    images: ['/images/user/popularplace3 1.webp'],
  },
};

export default function Page() {
  return <UsaVisitorVisa />;
}
