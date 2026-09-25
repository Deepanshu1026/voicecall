import About from '../../components/pages/About';

export const metadata = {
  title: 'About Us | A Visa Experts - Visa & Immigration Experts',
  description:
    "Learn about A Visa Experts, India's trusted visa and immigration company led by Kaveesh Kapoor. We help clients with tourist, work, and transit visas.",
  keywords:
    'about A Visa Experts, Kaveesh Kapoor, visa immigration company, visa consultants, immigration experts',
  alternates: { canonical: '/about' },
  openGraph: {
    title: 'About Us | A Visa Experts - Visa & Immigration Experts',
    description:
      "Learn about A Visa Experts, India's trusted visa and immigration company led by Kaveesh Kapoor. We help clients with tourist, work, and transit visas.",
    url: 'https://avisaexperts.com/about',
    images: ['/images/user/sirpic 1.webp'],
  },
};

export default function Page() {
  return <About />;
}
