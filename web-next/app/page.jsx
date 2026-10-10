import UserHome from '../components/pages/UserHome';

export const metadata = {
  title: 'A Visa Experts | No.1 Visitor Visa & Immigration Company in India',
  description:
    "A Visa Experts is India's trusted No.1 Visitor Visa & Immigration Company, led by Kaveesh Kapoor. Expert guidance for visitor visas to the UK, USA, Canada, Australia & Europe — plus support if you face a visa refusal.",
  keywords:
    'visa experts, visitor visa, visitor visa India, visa refusal, UK visa approval, immigration company, tourist visa, Canada visa, UK visa, USA visa, Kaveesh Kapoor',
  alternates: { canonical: 'https://avisaexperts.com/' },
  openGraph: {
    title: 'A Visa Experts | No.1 Visitor Visa & Immigration Company in India',
    description:
      "India's trusted No.1 Visitor Visa & Immigration Company, led by Kaveesh Kapoor. Expert guidance for UK, USA, Canada, Australia & Europe visitor visas.",
    url: 'https://avisaexperts.com/',
    images: ['/images/user/slider4 1.webp'],
  },
};

export default function Page() {
  return <UserHome />;
}
