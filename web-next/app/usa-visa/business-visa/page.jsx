import UsaBusinessVisa from '../../../components/pages/UsaBusinessVisa';

export const metadata = {
  title: 'USA Business Visa (B-1) 2026 | A Visa Experts',
  description:
    'USA business visa (B-1) guide for Indian travellers — who needs it, permitted activities, requirements, documents and how to apply.',
  keywords:
    'USA business visa, US business visa, B1 visa, B-1 visa requirements, USA business visa documents, business visa for USA from India, US business visa process',
  alternates: {
    canonical: '/usa-visa/business-visa',
    languages: {
      en: '/usa-visa/business-visa',
      'en-IN': '/usa-visa/business-visa',
      'x-default': '/usa-visa/business-visa',
    },
  },
  openGraph: {
    title: 'USA Business Visa (B-1) 2026 | A Visa Experts',
    description: 'Requirements, documents and the process for the US B-1 business visa.',
    url: 'https://avisaexperts.com/usa-visa/business-visa',
    images: ['/images/user/statueofliberty 1.webp'],
  },
};

export default function Page() {
  return <UsaBusinessVisa />;
}
