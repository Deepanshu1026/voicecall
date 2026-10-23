import AppointmentInfo from '../../components/pages/AppointmentInfo';

export const metadata = {
  title: 'Book a Visa Appointment Online | A Visa Experts',
  description:
    'Book a visa appointment with A Visa Experts. Get one-to-one advice, a personalised document checklist and clear next steps for your USA, UK or Canada visa.',
  alternates: {
    canonical: '/appointment',
    languages: { en: '/appointment', 'en-IN': '/appointment', 'x-default': '/appointment' },
  },
  openGraph: {
    title: 'Book a Visa Appointment Online | A Visa Experts',
    description:
      'Book a one-to-one visa consultation with an experienced advisor. Get a personalised document checklist and clear next steps for your visa application.',
    url: 'https://avisaexperts.com/appointment',
    images: ['/images/user/appointmentbg 1.webp'],
  },
};

export default function Page() {
  return <AppointmentInfo />;
}
