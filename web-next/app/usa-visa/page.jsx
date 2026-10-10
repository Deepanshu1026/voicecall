import UsaVisitorVisa from '../../components/pages/UsaVisitorVisa';

export const metadata = {
  title: 'USA Visitor Visa & Tourist Visa from India | A Visa Experts',
  description:
    'USA Visitor Visa and Tourist Visa guidance from A Visa Experts. Understand B-1/B-2 categories, requirements, documents, DS-160, fees, processing time and interview preparation.',
  keywords:
    'USA visitor visa, USA tourist visa, B1 B2 visa, USA visa from India, DS-160, USA visa requirements, USA visa documents, USA visa fees, USA visa interview questions, A Visa Experts',
  alternates: { canonical: '/usa-visa', languages: { en: '/usa-visa', 'en-IN': '/usa-visa', 'x-default': '/usa-visa' } },
  openGraph: {
    title: 'USA Visitor Visa & Tourist Visa from India | A Visa Experts',
    description:
      'USA Visitor Visa and Tourist Visa guidance from A Visa Experts. Understand B-1/B-2 categories, requirements, documents, DS-160, fees, processing time and interview preparation.',
    url: 'https://avisaexperts.com/usa-visa',
    images: ['/images/user/statueofliberty 1.webp'],
  },
};

export default function Page() {
  return <UsaVisitorVisa />;
}
