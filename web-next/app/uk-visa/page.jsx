import UkVisitorVisa from '../../components/pages/UkVisitorVisa';

export const metadata = {
  title: 'UK Visitor Visa Services | A Visa Experts',
  description:
    'Expert UK Standard Visitor Visa guidance from A Visa Experts. Profile assessment, online application guidance, documentation support, business-visit guidance and biometrics guidance.',
  alternates: { canonical: '/uk-visa', languages: { en: '/uk-visa', 'en-IN': '/uk-visa', 'x-default': '/uk-visa' } },
  openGraph: {
    title: 'UK Visitor Visa Services | A Visa Experts',
    description:
      'Expert UK Standard Visitor Visa guidance from A Visa Experts. Profile assessment, online application guidance, documentation support, business-visit guidance and biometrics guidance.',
    url: 'https://avisaexperts.com/uk-visa',
    images: ['/images/user/uk 1.webp'],
  },
};

export default function Page() {
  return <UkVisitorVisa />;
}
