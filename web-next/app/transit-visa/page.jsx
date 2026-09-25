import TransitVisa from '../../components/pages/TransitVisa';

export const metadata = {
  title: 'Transit Visa Services | A Visa Experts',
  description:
    'Understand transit visa requirements and get expert guidance for smooth airport layovers. A Visa Experts helps with transit visas for international travel.',
  keywords:
    'transit visa, airport transit, layover visa, transit visa requirements, international travel',
  alternates: { canonical: '/transit-visa' },
  openGraph: {
    title: 'Transit Visa Services | A Visa Experts',
    description:
      'Understand transit visa requirements and get expert guidance for smooth airport layovers. A Visa Experts helps with transit visas for international travel.',
    url: 'https://avisaexperts.com/transit-visa',
    images: ['/images/user/transitimg 1.webp'],
  },
};

export default function Page() {
  return <TransitVisa />;
}
