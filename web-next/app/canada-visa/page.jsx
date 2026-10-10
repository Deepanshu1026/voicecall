import CanadaVisitorVisa from '../../components/pages/CanadaVisitorVisa';

export const metadata = {
  title: 'Canada Visitor Visa Services | A Visa Experts',
  description:
    'Expert Canada Visitor Visa guidance from A Visa Experts. Profile assessment, online application guidance, documentation support, biometrics guidance and GCMS / CAIPS Notes assistance.',
  keywords:
    'Canada visitor visa, Canada TRV, Temporary Resident Visa, Canada business visa, biometrics guidance, GCMS notes, CAIPS notes, Canada visa consultants, A Visa Experts',
  alternates: { canonical: '/canada-visa', languages: { en: '/canada-visa', 'en-IN': '/canada-visa', 'x-default': '/canada-visa' } },
  openGraph: {
    title: 'Canada Visitor Visa Services | A Visa Experts',
    description:
      'Expert Canada Visitor Visa guidance from A Visa Experts. Profile assessment, online application guidance, documentation support, biometrics guidance and GCMS / CAIPS Notes assistance.',
    url: 'https://avisaexperts.com/canada-visa',
    images: ['/images/user/canada 1.webp'],
  },
};

export default function Page() {
  return <CanadaVisitorVisa />;
}
