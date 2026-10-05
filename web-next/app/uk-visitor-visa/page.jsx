import UkVisitorVisa from '../../components/pages/UkVisitorVisa';

export const metadata = {
  title: 'UK Visitor Visa Services | A Visa Experts',
  description:
    'Expert UK Standard Visitor Visa guidance from A Visa Experts. Profile assessment, online application guidance, documentation support, business-visit guidance and biometrics guidance.',
  keywords:
    'UK visitor visa, UK standard visitor visa, UK business visa, UK visa application, biometrics guidance, UK visa consultants, A Visa Experts',
  alternates: { canonical: '/uk-visitor-visa' },
  openGraph: {
    title: 'UK Visitor Visa Services | A Visa Experts',
    description:
      'Expert UK Standard Visitor Visa guidance from A Visa Experts. Profile assessment, online application guidance, documentation support, business-visit guidance and biometrics guidance.',
    url: 'https://avisaexperts.com/uk-visitor-visa',
    images: ['/images/user/uk 1.webp'],
  },
};

export default function Page() {
  return <UkVisitorVisa />;
}
