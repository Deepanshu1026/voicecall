import UsaVisaRequirements from '../../../components/pages/UsaVisaRequirements';

export const metadata = {
  title: 'USA Visa Requirements for Indians 2026 | A Visa Experts',
  description:
    'USA visa requirements for Indians — eligibility, passport and documents, financial and employment proof, DS-160, photo and interview requirements.',
  keywords:
    'USA visa requirements for Indians, US visa requirements India, documents required for US visa, USA visa eligibility, US visa financial requirements, DS-160 requirements, USA visa photo requirements, US visa interview requirements',
  alternates: {
    canonical: '/usa-visa/requirements',
    languages: {
      en: '/usa-visa/requirements',
      'en-IN': '/usa-visa/requirements',
      'x-default': '/usa-visa/requirements',
    },
  },
  openGraph: {
    title: 'USA Visa Requirements for Indians 2026 | A Visa Experts',
    description:
      'Eligibility, documents, financial and employment proof, DS-160, photo and interview requirements for a US visa from India.',
    url: 'https://avisaexperts.com/usa-visa/requirements',
    images: ['/images/user/statueofliberty 1.webp'],
  },
};

export default function Page() {
  return <UsaVisaRequirements />;
}
