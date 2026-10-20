import Link from 'next/link';
import LandingLayout from '../LandingLayout';

const BOOK_URL = '/book-appointment';

const bookingSteps = [
  { title: 'Complete the DS-160', text: 'Submit your online nonimmigrant visa application and save the barcode confirmation.' },
  { title: 'Pay the visa fee', text: 'Pay the MRV fee through the official channels and keep the receipt.' },
  { title: 'Create your appointment profile', text: 'Set up your applicant profile on the official appointment system using your DS-160 barcode and fee receipt.' },
  { title: 'Choose your consulate and slot', text: 'Select the US embassy or consulate in India and pick the earliest available date and time.' },
  { title: 'Confirm the appointment', text: 'Review the details and confirm. Save or print the appointment confirmation.' },
  { title: 'Attend on the day', text: 'Arrive early with your documents for biometrics and the visa interview.' },
];

const bring = [
  'Appointment confirmation page',
  'DS-160 confirmation page (barcode)',
  'Valid passport and previous passports',
  'Visa fee payment receipt',
  'A photograph meeting US specifications (if requested)',
  'Supporting documents — financial, employment or business proof',
  'Invitation letter, if applicable',
];

const happens = [
  'Security check and document verification on arrival',
  'Biometrics — your fingerprints and photograph are collected',
  'The visa interview with a consular officer',
  'The officer decides on your case, often on the same day',
  'Your passport is retained and returned with the visa once approved',
];

const tips = [
  'Book the earliest available slot rather than waiting for a preferred date.',
  'Arrive 15–30 minutes early — late arrivals may be turned away.',
  'Carry only the required documents; do not bring large bags or electronics.',
  'Answer questions clearly, honestly and consistently with your DS-160.',
  'Check your case status on CEAC after the interview.',
];

const faqs = [
  {
    q: 'How do I book a US visa appointment from India?',
    a: 'Complete the DS-160, pay the visa fee, then use the official US visa appointment system to choose your consulate and the earliest available slot. Save the appointment confirmation for the interview day.',
  },
  {
    q: 'How long does it take to get a US visa appointment in India?',
    a: 'Appointment wait times vary by consulate and season, from days to several months. See our USA visa processing time guide for the typical ranges and how to plan.',
  },
  {
    q: 'What should I bring to my US visa appointment?',
    a: 'Your appointment confirmation, DS-160 confirmation, passport, visa fee receipt, a compliant photo if requested, and your supporting documents (financial, employment/business and any invitation letter).',
  },
  {
    q: 'What happens at the US visa appointment?',
    a: 'You go through a security check, have your biometrics (fingerprints and photo) taken, and attend the visa interview with a consular officer, who usually decides on the same day.',
  },
  {
    q: 'Can I reschedule or cancel my US visa appointment?',
    a: 'Yes — you can reschedule or cancel through the official appointment system. Frequent rescheduling can delay your case, and fees are non-refundable.',
  },
  {
    q: 'Do I need an interview for a US visa?',
    a: 'Most first-time applicants need an interview. Some renewals qualify for an interview waiver (dropbox), which skips the interview and is usually faster.',
  },
];

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'USA Visa Appointment: How to Book and What to Expect',
  description:
    'How to book a US visa appointment from India — the steps, documents to bring, what happens at biometrics and the interview, and how to reschedule.',
  author: { '@type': 'Organization', name: 'A Visa Experts', url: 'https://avisaexperts.com' },
  publisher: {
    '@type': 'Organization',
    name: 'A Visa Experts',
    logo: { '@type': 'ImageObject', url: 'https://avisaexperts.com/images/user/tmlogo%201.webp' },
  },
  mainEntityOfPage: { '@type': 'WebPage', '@id': 'https://avisaexperts.com/usa-visa/appointment' },
};

const howToJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'How to book a US visa appointment',
  description: 'The steps to book a US visa appointment from India.',
  step: bookingSteps.map((s, i) => ({ '@type': 'HowToStep', position: i + 1, name: s.title, text: s.text })),
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
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToJsonLd) }} />
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

    <div className="spage">
      <section className="spage-hero hero-usa">
        <div className="spage-hero-inner">
          <h1>USA Visa Appointment: How to Book and What to Expect</h1>
          <p>
            The US visa appointment is where your application is completed — biometrics and the visa interview at the
            embassy or consulate. This guide explains how to book the appointment from India, what to bring, what happens
            on the day, and how to reschedule if your plans change.
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
          <h2>What is the US visa appointment?</h2>
          <p>
            The US visa appointment has two parts: <strong>biometrics</strong> (fingerprints and a photograph) and the{' '}
            <strong>visa interview</strong> with a consular officer. Depending on the consulate, these can be on the same
            day or on separate days. The interview is where the officer assesses your application and usually decides
            your case.
          </p>
          <p>
            Some applicants qualify for an <strong>interview waiver (dropbox)</strong>, which skips the interview. See our{' '}
            <Link className="spage-link" href="/usa-visa/processing-time">
              processing time guide
            </Link>{' '}
            for how that affects your timeline.
          </p>
        </div>
      </section>

      <section className="spage-section">
        <div className="spage-wrap">
          <h2>How to book a US visa appointment</h2>
          <ol className="spage-steps">
            {bookingSteps.map((s) => (
              <li key={s.title}>
                <strong>{s.title}</strong>
                <span>{s.text}</span>
              </li>
            ))}
          </ol>
          <div className="spage-btns left spage-mt-24">
            <a className="spage-btn primary" href={BOOK_URL}>
              Get Appointment Help
            </a>
          </div>
        </div>
      </section>

      <section className="spage-section">
        <div className="spage-wrap">
          <h2>What to bring to your US visa appointment</h2>
          <ul className="spage-list">
            {bring.map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
          <p className="spage-subnote">
            See the full{' '}
            <Link className="spage-link" href="/blog/usa-visa-document-checklist">
              USA visa document checklist
            </Link>
            .
          </p>
        </div>
      </section>

      <section className="spage-section">
        <div className="spage-wrap">
          <h2>What happens at the appointment</h2>
          <ul className="spage-list">
            {happens.map((h) => (
              <li key={h}>{h}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="spage-section">
        <div className="spage-wrap">
          <h2>Appointment tips</h2>
          <ul className="spage-list">
            {tips.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
          <p className="spage-mt-16">
            Preparing for the interview? Review our{' '}
            <Link
              className="spage-link"
              href="/blog/usa-visitor-visa-interview-questions-for-indians-complete-guide-2025"
            >
              USA visa interview questions
            </Link>{' '}
            guide.
          </p>
        </div>
      </section>

      <section className="spage-section">
        <div className="spage-wrap">
          <h2>Related USA visa guides</h2>
          <div className="spage-cards">
            <div className="spage-card">
              <h3>
                <Link className="spage-link" href="/usa-visa/processing-time">
                  USA Visa Processing Time
                </Link>
              </h3>
              <p>How long each stage takes, including appointment waits.</p>
            </div>
            <div className="spage-card">
              <h3>
                <Link className="spage-link" href="/usa-visa/fees">
                  USA Visa Fees
                </Link>
              </h3>
              <p>What you pay and when, before booking your appointment.</p>
            </div>
            <div className="spage-card">
              <h3>
                <Link className="spage-link" href="/usa-visa/requirements">
                  USA Visa Requirements for India
                </Link>
              </h3>
              <p>Eligibility and documents for Indian applicants.</p>
            </div>
            <div className="spage-card">
              <h3>
                <Link className="spage-link" href="/usa-visa">
                  USA Visa Overview
                </Link>
              </h3>
              <p>Visitor and tourist visa guidance for the USA.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="spage-section">
        <div className="spage-wrap">
          <h2>USA visa appointment FAQs</h2>
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
          <h2>Need help booking your US visa appointment?</h2>
          <p>Talk to a USA visa expert at A Visa Experts for guidance on slots, documents and interview preparation.</p>
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
