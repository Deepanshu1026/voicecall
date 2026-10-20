import Link from 'next/link';
import LandingLayout from '../LandingLayout';

const BOOK_URL = '/book-appointment';

const processSteps = [
  'Completing the required visa application',
  'Paying the applicable visa fee',
  'Creating or accessing the visa scheduling profile',
  'Providing applicant information',
  'Selecting the applicable appointment location',
  'Choosing an available date',
  'Confirming the appointment',
  'Saving the appointment confirmation',
];

const interviewTopics = [
  'Your reason for visiting the USA',
  'Your planned activities',
  'Your employment or business',
  'Your financial circumstances',
  'Your family situation',
  'Your previous travel',
  'Your plans after the visit',
];

const checkBefore = [
  'Full name',
  'Passport number',
  'Date of birth',
  'Visa category',
  'DS-160 information',
  'Appointment location',
  'Appointment date',
  'Appointment time',
  'Contact information',
];

const carry = [
  'Current passport',
  'Previous passports, if applicable',
  'DS-160 confirmation',
  'Appointment confirmation',
  'Visa fee payment details',
  'Supporting documents',
  'Employment or business documents',
  'Financial documents',
];

const rescheduleChecklist = [
  'Check the available appointments',
  'Confirm that you can attend the new date',
  'Review your appointment details',
  'Save the updated confirmation',
];

const waitingFactors = [
  'Visa category',
  'Appointment location',
  'Seasonal demand',
  'Number of applicants',
  'Available appointment slots',
  'Cancellations',
  'Additional administrative requirements',
];

const tips = [
  'Check your appointment confirmation before travelling.',
  'Carry your current passport.',
  'Keep your DS-160 confirmation accessible.',
  'Organize supporting documents beforehand.',
  'Reach the location according to the instructions provided.',
  'Answer questions honestly during the interview.',
  'Do not submit false or misleading information.',
  'Follow the security instructions at the appointment location.',
  'Do not rely on unofficial sources for appointment availability.',
];

const faqs = [
  {
    q: 'Can I choose my USA visa appointment date?',
    a: 'You can generally select from the appointment dates available through the applicable scheduling system.',
  },
  {
    q: 'Can I change my appointment after booking?',
    a: 'Rescheduling may be available depending on the current appointment system and applicable rules.',
  },
  {
    q: 'Can I request an earlier appointment?',
    a: 'An earlier appointment may become available when additional slots are released or existing appointments are changed. Expedited appointments may also be available in qualifying circumstances.',
  },
  {
    q: 'Do I need to carry my DS-160 confirmation?',
    a: 'Applicants should keep their DS-160 confirmation available as part of their visa application documents.',
  },
  {
    q: 'Is a USA visa appointment the same as visa approval?',
    a: 'No. An appointment is only one stage of the application process. It does not guarantee visa approval.',
  },
  {
    q: 'How early should I prepare for my appointment?',
    a: 'It is better to organize your application and supporting documents before the appointment date so that you are prepared for the required steps.',
  },
];

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'USA Visa Appointment from India',
  description:
    'USA visa appointment from India explained — the appointment process, biometrics and interview, what to carry, appointment availability, rescheduling and expedited appointments.',
  author: { '@type': 'Organization', name: 'A Visa Experts', url: 'https://avisaexperts.com' },
  publisher: {
    '@type': 'Organization',
    name: 'A Visa Experts',
    logo: { '@type': 'ImageObject', url: 'https://avisaexperts.com/images/user/tmlogo%201.webp' },
  },
  mainEntityOfPage: { '@type': 'WebPage', '@id': 'https://avisaexperts.com/usa-visa/appointment' },
};

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map((f) => ({
    '@type': 'Question',
    name: f.q,
    acceptedAnswer: { '@type': 'Answer', text: f.a },
  })),
};

const breadcrumbJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://avisaexperts.com/' },
    { '@type': 'ListItem', position: 2, name: 'USA Visa', item: 'https://avisaexperts.com/usa-visa' },
    {
      '@type': 'ListItem',
      position: 3,
      name: 'USA Visa Appointment',
      item: 'https://avisaexperts.com/usa-visa/appointment',
    },
  ],
};

const UsaAppointment = () => (
  <LandingLayout>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

    <div className="spage">
      <section className="spage-hero hero-usa">
        <div className="spage-hero-inner">
          <h1>USA Visa Appointment from India</h1>
          <p>
            Getting a USA visa appointment is an important part of the visa application process. Applicants need to
            complete the required application steps and follow the current appointment procedure before appearing for
            biometrics or a visa interview, depending on their visa category and individual circumstances.
          </p>
          <div className="spage-btns">
            <a className="spage-btn primary" href={BOOK_URL}>
              Get Appointment Help
            </a>
            <a className="spage-btn dark" href="/consultants">
              Talk to a Consultant
            </a>
          </div>
        </div>
      </section>

      <section className="spage-section">
        <div className="spage-wrap">
          <p>
            The availability of appointment dates can change frequently, so applicants should check the current
            scheduling options before making travel plans.
          </p>
        </div>
      </section>

      <section className="spage-section">
        <div className="spage-wrap">
          <h2>USA Visa Appointment Process for Indians</h2>
          <p>
            The appointment process generally requires applicants to complete the necessary application formalities
            before selecting an available date.
          </p>
          <p>The process may include:</p>
          <ul className="spage-list">
            {processSteps.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
          <p className="spage-mt-16">
            Applicants should make sure that their passport and application information is accurate before confirming
            their appointment.
          </p>
          <p>
            For information about the application charges, visit our{' '}
            <Link className="spage-link" href="/usa-visa/fees">
              USA Visa Fees page
            </Link>
            .
          </p>
        </div>
      </section>

      <section className="spage-section">
        <div className="spage-wrap">
          <h2>USA Visa Appointment Locations in India</h2>
          <p>
            US visa applicants in India may have appointment options depending on their visa category and the current US
            visa appointment system.
          </p>
          <p>
            The location available to you can depend on the type of appointment required and the current scheduling
            arrangements.
          </p>
          <p>
            Before selecting a location, check the available options in the official appointment system and choose a
            location that you can attend on the scheduled date.
          </p>
        </div>
      </section>

      <section className="spage-section">
        <div className="spage-wrap">
          <h2>USA Visa Appointment for Biometrics</h2>
          <p>
            Some applicants may need to provide biometric information as part of their visa application.
          </p>
          <p>
            Biometric appointments can involve the collection of fingerprints and other required information at the
            designated application center.
          </p>
          <p>Carry your passport and the documents specified in your appointment instructions.</p>
        </div>
      </section>

      <section className="spage-section">
        <div className="spage-wrap">
          <h2>USA Visa Interview Appointment</h2>
          <p>A visa interview may be required depending on your visa category and circumstances.</p>
          <p>
            During the interview, the consular officer may ask questions related to your application and intended
            travel.
          </p>
          <p>You should be ready to explain:</p>
          <ul className="spage-list">
            {interviewTopics.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
          <p className="spage-mt-16">
            You can prepare for the interview using our{' '}
            <Link
              className="spage-link"
              href="/blog/usa-visitor-visa-interview-questions-for-indians-complete-guide-2025"
            >
              USA Visa Interview Questions &amp; Answers guide
            </Link>
            .
          </p>
        </div>
      </section>

      <section className="spage-section">
        <div className="spage-wrap">
          <h2>What to Check Before Confirming Your Appointment</h2>
          <p>Before confirming your appointment, carefully check:</p>
          <ul className="spage-list">
            {checkBefore.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
          <p className="spage-mt-16">
            Any incorrect information should be reviewed and corrected according to the applicable procedure before
            proceeding.
          </p>
          <p>
            For help with the DS-160, visit our{' '}
            <Link className="spage-link" href="/blog/ds-160-guide-a-simple-guide-for-usa-visa-applicants">
              DS-160 Guide
            </Link>
            .
          </p>
        </div>
      </section>

      <section className="spage-section">
        <div className="spage-wrap">
          <h2>What to Carry on the Appointment Day</h2>
          <p>Prepare your documents before leaving for the appointment. Depending on your circumstances, you may need:</p>
          <ul className="spage-list">
            {carry.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
          <p className="spage-mt-16">
            Not every applicant will need the same supporting documents. Your documents should match your visa category
            and circumstances.
          </p>
          <p>
            See our{' '}
            <Link className="spage-link" href="/blog/usa-visa-document-checklist">
              USA Visa Document Checklist
            </Link>{' '}
            for detailed preparation.
          </p>
        </div>
      </section>

      <section className="spage-section">
        <div className="spage-wrap">
          <h2>USA Visa Appointment Date Availability</h2>
          <p>
            Appointment availability is not fixed. New appointment dates can become available when additional slots are
            released or when applicants change or cancel their appointments.
          </p>
          <p>
            For this reason, applicants should regularly check the current scheduling system if they are looking for an
            earlier available appointment.
          </p>
          <p>Do not make non-refundable travel arrangements based only on an expected appointment date.</p>
        </div>
      </section>

      <section className="spage-section">
        <div className="spage-wrap">
          <h2>How to Get an Earlier USA Visa Appointment</h2>
          <p>
            Applicants who need an earlier appointment should first check the available dates through the official
            scheduling system.
          </p>
          <p>
            If an earlier date becomes available, it may be possible to change the appointment according to the current
            rules.
          </p>
          <p>
            An earlier appointment should not be assumed or guaranteed because availability depends on the appointment
            system.
          </p>
        </div>
      </section>

      <section className="spage-section">
        <div className="spage-wrap">
          <h2>Emergency USA Visa Appointment</h2>
          <p>
            In certain situations, applicants may be able to request an expedited appointment if they meet the applicable
            criteria.
          </p>
          <p>
            An expedited appointment is not automatically granted simply because an applicant wants an earlier date.
          </p>
          <p>
            Applicants should check the current eligibility requirements and provide appropriate supporting information
            when requesting an expedited appointment.
          </p>
        </div>
      </section>

      <section className="spage-section">
        <div className="spage-wrap">
          <h2>USA Visa Appointment Rescheduling</h2>
          <p>
            If you cannot attend your scheduled appointment, check whether the current scheduling system allows you to
            reschedule.
          </p>
          <p>Before selecting a new date:</p>
          <ul className="spage-list">
            {rescheduleChecklist.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
          <p className="spage-mt-16">
            Avoid cancelling or changing an appointment without first understanding the applicable rules.
          </p>
        </div>
      </section>

      <section className="spage-section">
        <div className="spage-wrap">
          <h2>USA Visa Appointment Cancellation</h2>
          <p>
            If you no longer need your appointment, follow the current cancellation procedure provided by the appointment
            system.
          </p>
          <p>
            If you later decide to apply again, you may need to complete additional steps before booking another
            appointment.
          </p>
          <p>Keep your application and payment information available for future reference.</p>
        </div>
      </section>

      <section className="spage-section">
        <div className="spage-wrap">
          <h2>Missed USA Visa Appointment</h2>
          <p>If you miss your appointment, check the current instructions in the visa scheduling system.</p>
          <p>Depending on the circumstances, you may need to reschedule your appointment.</p>
          <p>
            A missed appointment does not by itself mean that your visa application has been approved or refused. Follow
            the applicable appointment instructions.
          </p>
        </div>
      </section>

      <section className="spage-section">
        <div className="spage-wrap">
          <h2>USA Visa Appointment Waiting Period</h2>
          <p>The waiting period for an appointment can change depending on:</p>
          <ul className="spage-list">
            {waitingFactors.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
          <p className="spage-mt-16">
            Appointment waiting time and visa processing time are different. For information about processing after the
            application stage, read our{' '}
            <Link className="spage-link" href="/usa-visa/processing-time">
              USA Visa Processing Time guide
            </Link>
            .
          </p>
        </div>
      </section>

      <section className="spage-section">
        <div className="spage-wrap">
          <h2>USA Visa Appointment for B1/B2 Applicants</h2>
          <p>
            B1/B2 applicants should make sure that their application information correctly reflects their intended
            business or tourism-related visit.
          </p>
          <p>Before attending the appointment, review your application and supporting documents carefully.</p>
          <p>
            For category-specific information, visit our{' '}
            <Link className="spage-link" href="/usa-visa/usa-b1b2-visa">
              USA B1/B2 Visa Guide
            </Link>
            .
          </p>
        </div>
      </section>

      <section className="spage-section">
        <div className="spage-wrap">
          <h2>USA Tourist Visa Appointment</h2>
          <p>
            Applicants travelling for tourism, holidays, sightseeing, or visiting family and friends should ensure that
            their application accurately reflects their intended visit.
          </p>
          <p>Keep relevant travel and personal documents ready before the appointment.</p>
          <p>
            For more information about tourist visa requirements, visit our{' '}
            <Link className="spage-link" href="/blog/usa-tourist-visa">
              USA Tourist Visa Guide
            </Link>
            .
          </p>
        </div>
      </section>

      <section className="spage-section">
        <div className="spage-wrap">
          <h2>Important USA Visa Appointment Tips</h2>
          <p>Keep these points in mind:</p>
          <ul className="spage-list">
            {tips.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="spage-section">
        <div className="spage-wrap">
          <h2>USA Visa Appointment: Common Questions</h2>
          <div className="spage-faq">
            {faqs.map((f) => (
              <details key={f.q}>
                <summary>{f.q}</summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="spage-cta">
        <div className="spage-wrap">
          <h2>Need Assistance With Your USA Visa Appointment?</h2>
          <p>
            Preparing your application information, appointment details, and supporting documents in advance can help
            you avoid unnecessary mistakes. If you need assistance with your USA visa application or appointment
            preparation, contact A Visa Experts for guidance.
          </p>
          <div className="spage-btns">
            <a className="spage-btn primary" href={BOOK_URL}>
              Book an Appointment
            </a>
            <a className="spage-btn dark" href="/usa-visa">
              Back to USA Visa
            </a>
          </div>
        </div>
      </section>
    </div>
  </LandingLayout>
);

export default UsaAppointment;
