import UsaVisaFees from '../../../components/pages/UsaVisaFees';

const SITE_URL = 'https://avisaexperts.com';

const TITLE = 'US Visa Fees from India: Kaise Pay Karein? (2026)';
const DESCRIPTION =
  'US B1/B2 tourist visa fee kaise pay karein? Payment options, reschedule par fee ka kya hota hai, sab simple steps mein samjhiye.';

export const metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: {
    canonical: `${SITE_URL}/usa-visa/fees`,
    languages: { en: '/usa-visa/fees', 'en-IN': '/usa-visa/fees', 'x-default': '/usa-visa/fees' },
  },
  openGraph: {
    type: 'article',
    title: TITLE,
    description: DESCRIPTION,
    url: `${SITE_URL}/usa-visa/fees`,
    siteName: 'A Visa Experts',
    images: ['/images/user/statueofliberty 1.webp'],
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
    images: ['/images/user/statueofliberty 1.webp'],
  },
};

export default function Page() {
  return <UsaVisaFees />;
}
