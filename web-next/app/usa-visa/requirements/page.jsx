import UsaVisaRequirements from '../../../components/pages/UsaVisaRequirements';

export const metadata = {
  title: 'USA Visa Requirements for India 2026 | A Visa Experts',
  description:
    'USA visa requirements for Indian citizens — eligibility, documents, proof of funds and the step-by-step US visa application process from India.',
  keywords:
    'USA visa requirements for Indian citizens, US visa requirements India, documents required for US visa, USA visa documents, US visa eligibility, USA visa process from India',
  alternates: {
    canonical: '/usa-visa/requirements',
    languages: {
      en: '/usa-visa/requirements',
      'en-IN': '/usa-visa/requirements',
      'x-default': '/usa-visa/requirements',
    },
  },
  openGraph: {
    title: 'USA Visa Requirements for India 2026 | A Visa Experts',
    description: 'Eligibility, documents and the process for a US visa from India.',
    url: 'https://avisaexperts.com/usa-visa/requirements',
    images: ['/images/user/statueofliberty 1.webp'],
  },
};

export default function Page() {
  return <UsaVisaRequirements />;
}
