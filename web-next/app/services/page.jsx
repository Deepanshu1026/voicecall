import Services from '../../components/pages/Services';

export const metadata = {
  title: 'Visa Consultants in Noida & Delhi | Visa Services | A Visa Experts',
  description:
    'Trusted visa consultants in Noida & Delhi for tourist and transit visas. Expert guidance for USA, UK, Canada, Australia and Europe. Book a free consultation.',
  keywords:
    'visa consultants in Noida, visa agents in Delhi, immigration consultants Delhi NCR, visa consultancy near me, tourist visa consultant Noida, visa services Noida, best visa consultant Delhi',
  alternates: { canonical: '/services', languages: { en: '/services', 'en-IN': '/services', 'x-default': '/services' } },
  openGraph: {
    title: 'Visa Consultants in Noida & Delhi | Visa Services | A Visa Experts',
    description:
      'Trusted visa consultants in Noida & Delhi for tourist and transit visas. Expert guidance for USA, UK, Canada, Australia and Europe. Book a free consultation.',
    url: 'https://avisaexperts.com/services',
    images: ['/images/user/touristvisa_full 1.webp'],
  },
};

export default function Page() {
  return <Services />;
}
