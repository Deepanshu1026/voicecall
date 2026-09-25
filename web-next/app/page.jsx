import UserHome from '../components/pages/UserHome';

export const metadata = {
  title: 'A Visa Experts | No.1 Visa Immigration Company in India',
  description:
    "A Visa Experts is India's trusted No.1 Visa Immigration Company. We help with tourist, work, transit and PR visas for USA, UK, Canada, Australia, Europe & NZ.",
  keywords:
    'visa consultants, immigration experts, tourist visa, work visa, Canada visa, UK visa, USA visa, Australia visa, Kaveesh Kapoor',
  alternates: { canonical: '/' },
  openGraph: {
    title: 'A Visa Experts | No.1 Visa Immigration Company in India',
    description:
      "India's trusted No.1 Visa Immigration Company. Free consultation for tourist, work, transit & PR visas for USA, UK, Canada, Australia, Europe & NZ.",
    url: 'https://avisaexperts.com/',
    images: ['/images/user/slider4 1.webp'],
  },
};

export default function Page() {
  return <UserHome />;
}
