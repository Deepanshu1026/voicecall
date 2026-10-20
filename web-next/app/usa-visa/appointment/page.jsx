import UsaAppointment from '../../../components/pages/UsaAppointment';

export const metadata = {
  title: 'USA Visa Appointment: How to Book | A Visa Experts',
  description:
    'How to book a US visa appointment from India — the steps, documents to bring, what happens at biometrics and the interview, and how to reschedule.',
  keywords:
    'USA visa appointment, US visa appointment booking, book US visa appointment India, US consulate appointment, US visa interview appointment, biometrics appointment USA visa',
  alternates: {
    canonical: '/usa-visa/appointment',
    languages: {
      en: '/usa-visa/appointment',
      'en-IN': '/usa-visa/appointment',
      'x-default': '/usa-visa/appointment',
    },
  },
  openGraph: {
    title: 'USA Visa Appointment: How to Book | A Visa Experts',
    description: 'How to book a US visa appointment, what to bring and what happens on the day.',
    url: 'https://avisaexperts.com/usa-visa/appointment',
    images: ['/images/user/statueofliberty 1.webp'],
  },
};

export default function Page() {
  return <UsaAppointment />;
}
