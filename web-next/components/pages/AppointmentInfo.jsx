'use client';

import LandingLayout from '../LandingLayout';

const steps = [
  {
    title: 'Choose a date and time',
    text: 'Pick a slot that suits you from the booking page. Morning and evening options are usually available.',
  },
  {
    title: 'Share a few details',
    text: 'Tell us your destination, purpose of travel and the type of visa you are applying for.',
  },
  {
    title: 'Meet your visa advisor',
    text: 'A one-to-one consultation — in person at our office, over the phone or online.',
  },
  {
    title: 'Get your action plan',
    text: 'Leave with a clear document checklist, timelines and the next steps for your application.',
  },
];

const expectations = [
  'A review of your profile and travel purpose',
  'The exact requirements for your destination and visa category',
  'A personalised document checklist',
  'Honest guidance on timelines and expected processing',
  'Answers to your questions about the application process',
];

const prepare = [
  'Your passport (and any previous passports)',
  'Travel plans — dates, cities and purpose of the trip',
  'Details of any previous visas or refusals',
  'Employment, business or study information',
  'Recent bank statements or proof of funds, if available',
];

const whyUs = [
  {
    title: 'Trusted visa specialists',
    text: 'A Visa Experts is a leading visitor visa and immigration consultancy in India, with thousands of successful applications.',
  },
  {
    title: 'Destinations we cover',
    text: 'Expert guidance for the USA, UK, Canada, Australia, Europe and other popular destinations — tourist, visitor, transit and PR visas.',
  },
  {
    title: 'Refusal support',
    text: 'Already refused? We review the reasons and advise on the strongest way forward, including re-application where appropriate.',
  },
  {
    title: 'Transparent guidance',
    text: 'Clear, honest advice at every step — so you always know what is required and what happens next.',
  },
];

const faqs = [
  {
    q: 'How do I book a visa appointment with A Visa Experts?',
    a: "Click \u201cBook Your Appointment\u201d, choose a slot that suits you, and share a few details about your destination and purpose of travel. You will receive a confirmation, and your advisor will meet you at the scheduled time.",
  },
  {
    q: 'What happens during the appointment?',
    a: 'It is a one-to-one consultation. An advisor reviews your profile, explains the requirements for your destination and visa category, and gives you a personalised document checklist and next steps.',
  },
  {
    q: 'What should I prepare before my appointment?',
    a: 'Keep your passport details, travel plans and any previous visa or refusal history handy. Having a few key documents ready helps us give you accurate, personalised guidance.',
  },
  {
    q: 'Can I reschedule or cancel my appointment?',
    a: 'Yes. Contact our team or use the booking page to choose a new slot if your plans change.',
  },
  {
    q: 'Do you help with visa refusals?',
    a: 'Yes. We review the reasons for the refusal and advise on the most suitable way forward, including re-application where appropriate.',
  },
  {
    q: 'Which destinations do you cover?',
    a: 'We help with tourist, visitor, transit and permanent residency visas for the USA, UK, Canada, Australia, Europe and other popular destinations.',
  },
];

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: 'Visa Appointment & Consultation',
  serviceType: 'Visa Consultation',
  provider: {
    '@type': 'Organization',
    name: 'A Visa Experts',
    url: 'https://avisaexperts.com',
  },
  description:
    'Book a one-to-one visa appointment with A Visa Experts. Get expert guidance, a personalised document checklist and clear next steps for your USA, UK, Canada, Australia or Europe visa application.',
  areaServed: ['US', 'GB', 'CA', 'AU', 'EU', 'IN'],
};

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map((faq) => ({
    '@type': 'Question',
    name: faq.q,
    acceptedAnswer: { '@type': 'Answer', text: faq.a },
  })),
};

const breadcrumbJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://avisaexperts.com/' },
    { '@type': 'ListItem', position: 2, name: 'Book Appointment', item: 'https://avisaexperts.com/appointment' },
  ],
};

const BOOK_URL = '/book-appointment';

const AppointmentInfo = () => (
  <LandingLayout>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
    />

    <div className="spage">
      {/* Hero */}
      <section className="spage-hero hero-appointment">
        <div className="spage-hero-inner">
          <h1>Book a Visa Appointment with A Visa Experts</h1>
          <p>
            Get a personalised consultation with an experienced visa advisor. Choose a convenient time, share a few
            details about your trip, and receive a clear plan for your application — tourist, visitor, transit or PR.
          </p>
          <div className="spage-btns">
            <a className="spage-btn primary" href={BOOK_URL}>
              Book Your Appointment
            </a>
            <a className="spage-btn dark" href="/consultants">
              Talk to a Consultant
            </a>
          </div>
        </div>
      </section>

      {/* Why book */}
      <section className="spage-section">
        <div className="spage-wrap">
          <h2>Why book an appointment with A Visa Experts?</h2>
          <p>
            A visa application is easier — and far less stressful — when you know exactly what is required. An
            appointment gives you a one-to-one conversation with an advisor who understands the rules for your
            destination, so you can apply with confidence and avoid the mistakes that lead to delays and refusals.
          </p>
          <ul className="spage-list">
            <li>One-to-one guidance from a visa expert</li>
            <li>A personalised document checklist for your profile</li>
            <li>An honest assessment of your options and timelines</li>
            <li>Practical help avoiding common mistakes and refusals</li>
          </ul>
          <div className="spage-btns left spage-mt-24">
            <a className="spage-btn primary" href={BOOK_URL}>
              Book Your Appointment
            </a>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="spage-section">
        <div className="spage-wrap">
          <h2>How the appointment works</h2>
          <ol className="spage-steps">
            {steps.map((step, i) => (
              <li key={step.title}>
                <span>{String(i + 1).padStart(2, '0')}</span>
                <strong>{step.title}</strong>
                <p>{step.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* What to expect */}
      <section className="spage-section">
        <div className="spage-wrap">
          <h2>What to expect in your consultation</h2>
          <ul className="spage-list">
            {expectations.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </section>

      {/* What to prepare */}
      <section className="spage-section">
        <div className="spage-wrap">
          <h2>What to prepare before your appointment</h2>
          <p>
            You do not need to bring everything to your first appointment, but having the following details ready helps
            us give you accurate, personalised guidance.
          </p>
          <ul className="spage-list">
            {prepare.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </section>

      {/* Why choose us */}
      <section className="spage-section">
        <div className="spage-wrap">
          <h2>Why choose A Visa Experts</h2>
          <div className="spage-cards">
            {whyUs.map((card) => (
              <div className="spage-card" key={card.title}>
                <h3>{card.title}</h3>
                <p>{card.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="spage-section">
        <div className="spage-wrap">
          <h2>Visa appointment FAQs</h2>
          <div className="spage-faq">
            {faqs.map((faq) => (
              <details key={faq.q}>
                <summary>{faq.q}</summary>
                <p>{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="spage-cta">
        <div className="spage-wrap">
          <h2>Ready to book your visa appointment?</h2>
          <p>
            Choose a time that works for you and speak with a visa expert about your application today.
          </p>
          <div className="spage-btns">
            <a className="spage-btn primary" href={BOOK_URL}>
              Book Your Appointment
            </a>
            <a className="spage-btn dark" href="/consultants">
              Talk to a Consultant
            </a>
          </div>
        </div>
      </section>
    </div>
  </LandingLayout>
);

export default AppointmentInfo;
