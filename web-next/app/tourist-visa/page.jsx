import TouristVisa from '../../components/pages/TouristVisa';

export const metadata = {
  title: 'Tourist Visa Services | A Visa Experts',
  description:
    'Apply for a tourist visa with expert guidance from A Visa Experts. We help travelers secure visas for USA, UK, Canada, Australia, Europe, and Japan.',
  keywords:
    'tourist visa, visitor visa, travel visa, USA tourist visa, UK tourist visa, Canada tourist visa, Australia tourist visa, Japan visa',
  alternates: { canonical: '/tourist-visa' },
  openGraph: {
    title: 'Tourist Visa Services | A Visa Experts',
    description:
      'Apply for a tourist visa with expert guidance from A Visa Experts. We help travelers secure visas for USA, UK, Canada, Australia, Europe, and Japan.',
    url: 'https://avisaexperts.com/tourist-visa',
    images: ['/images/user/touristvisa_full 1.webp'],
  },
};

export default function Page() {
  return <TouristVisa />;
}
