import WorkVisa from '../../components/pages/WorkVisa';

export const metadata = {
  title: 'Work Visa Services | A Visa Experts',
  description:
    'Apply for a work visa with expert guidance from A Visa Experts. We assist professionals with Canada, UK, Australia, Europe, and Hong Kong work visas.',
  keywords:
    'work visa, work permit, Canada work visa, UK skilled worker visa, Australia work visa, Hong Kong work visa, employment visa',
  alternates: { canonical: '/work-visa' },
  openGraph: {
    title: 'Work Visa Services | A Visa Experts',
    description:
      'Apply for a work visa with expert guidance from A Visa Experts. We assist professionals with Canada, UK, Australia, Europe, and Hong Kong work visas.',
    url: 'https://avisaexperts.com/work-visa',
    images: ['/images/user/workvisa_full 1.webp'],
  },
};

export default function Page() {
  return <WorkVisa />;
}
