import UsaAppointment from '../../../components/pages/UsaAppointment';

export const metadata = {
  title: 'USA Visa Appointment from India | A Visa Experts',
  description:
    'USA visa appointment from India explained — the appointment process, biometrics and interview, what to carry, appointment availability, rescheduling and expedited appointments.',
  keywords:
    'USA visa appointment, USA visa appointment from India, US visa appointment booking, US visa biometrics appointment, US visa interview appointment, reschedule US visa appointment, expedited US visa appointment',
  alternates: {
    canonical: '/usa-visa/appointment',
    languages: {
      en: '/usa-visa/appointment',
      'en-IN': '/usa-visa/appointment',
      'x-default': '/usa-visa/appointment',
    },
  },
  openGraph: {
    title: 'USA Visa Appointment from India | A Visa Experts',
    description:
      'How to get a US visa appointment from India — the process, biometrics, interview and what to carry.',
    url: 'https://avisaexperts.com/usa-visa/appointment',
    images: ['/images/user/statueofliberty 1.webp'],
  },
};

export default function Page() {
  return <UsaAppointment />;
}
