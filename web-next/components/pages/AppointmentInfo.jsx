import Link from 'next/link';
import LandingLayout from '../LandingLayout';

const BOOK_URL = '/book-appointment';

const whoShould = [
  'First-time visa applicants who want to get it right the first time.',
  'Travellers who have had a visa refused and need a clear way forward.',
  'Families and groups planning a trip and unsure which visa each member needs.',
  'Business travellers and students who need the correct category and documents.',
  'Applicants who are unsure about eligibility, funds or supporting documents.',
  'Anyone preparing for an embassy or consulate interview (biometrics and interview appointment).',
];

const planRows = [
  {
    plan: 'Customer Support',
    duration: '10 minutes',
    price: 'Free (usually ₹599)',
    best: 'Quick questions and general guidance',
  },
  {
    plan: 'Senior Manager',
    duration: '15 minutes',
    price: '₹1180 (GST included)',
    best: 'Personalised advice on specific visa types',
  },
  {
    plan: 'Premium — Chairman',
    duration: '20 minutes',
    price: '₹1770 (GST included)',
    best: 'Complex cases and full assistance',
  },
];

const planDetails = [
  {
    title: 'Customer Support — free 10-minute meeting',
    items: [
      '10-minute meeting with our support team',
      'Free of charge',
      'Introduction to visa types and current offers',
      'General Q&A session',
      'Bring your passport',
      'Ideal for quick visa information',
    ],
  },
  {
    title: 'Senior Manager — 15-minute consultation',
    items: [
      '15-minute meeting with a Senior Manager',
      'In-depth consultation on specific visa types',
      'Detailed explanation of eligibility requirements',
      'Bring your passport',
      'Ideal for clients who need personalised advice',
    ],
  },
  {
    title: 'Premium — 20-minute meeting with the Chairman',
    items: [
      '20-minute personal meeting with our Chairman, Mr. Kaveesh Kapoor',
      'Customised visa strategy for your profile',
      'Case Manager support throughout the process',
      'Bring your passport and documents',
      'Ideal for complex cases and full assistance',
    ],
  },
];

const steps = [
  {
    title: 'Choose your plan',
    text: 'Pick the consultation that suits you — a free 10-minute team meeting, a 15-minute Senior Manager session, or a 20-minute meeting with the Chairman.',
  },
  {
    title: 'Pick a date and time',
    text: 'Select a convenient slot from the booking page. Appointments are available Monday to Saturday; our office is closed on Sundays.',
  },
  {
    title: 'Choose online or office',
    text: 'Meet online through secure video conferencing, or visit our Noida or Ahmedabad office in person.',
  },
  {
    title: 'Share a few details',
    text: 'Tell us your destination, purpose of travel and the type of visa you are applying for, so your advisor can prepare.',
  },
  {
    title: 'Meet your visa advisor',
    text: 'A one-to-one consultation where an expert reviews your profile and answers your questions.',
  },
  {
    title: 'Leave with a clear plan',
    text: 'You receive a personalised document checklist, timelines and the exact next steps for your application.',
  },
];

const expectations = [
  'A review of your profile, travel purpose and history',
  'The exact requirements for your destination and visa category',
  'A personalised document checklist you can act on',
  'Honest guidance on timelines and expected processing',
  'Clear answers to your questions about the application process',
  'Advice on avoiding the mistakes that lead to refusals',
];

const bring = [
  'Your current passport (and any previous passports)',
  'Travel plans — dates, cities and purpose of the trip',
  'Details of any previous visas, travel history or refusals',
  'Employment, business or study information',
  'Recent bank statements or proof of funds, if available',
  'Invitation letters or sponsor details, where relevant',
];

const tips = [
  'Write down your questions before the appointment so nothing is missed.',
  'Be honest about refusals and past applications — it helps us advise accurately.',
  'Keep your documents organised and easy to share during the meeting.',
  'Note down the checklist and timelines your advisor gives you.',
  'Ask about processing times for your specific destination and category.',
  'Book early — apply well before your planned travel date.',
];

const afterAppointment = [
  {
    title: 'Prepare your documents',
    text: 'Follow the checklist you receive and gather each document before you apply.',
    href: '/services',
    linkText: 'Explore our visa services',
  },
  {
    title: 'Apply for the right visa',
    text: 'Choose the correct category for your trip — tourist, visitor, transit or PR.',
    href: '/tourist-visa',
    linkText: 'Tourist & visitor visas',
  },
  {
    title: 'Prepare for your embassy appointment',
    text: 'Get ready for biometrics and the visa interview with the right answers and documents.',
    href: '/usa-visa',
    linkText: 'USA visa guidance',
  },
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
    text: 'Clear, honest advice at every step, so you always know what is required and what happens next.',
  },
];

const related = [
  { title: 'Tourist & Visitor Visas', text: 'Guidance for holiday and family visits worldwide.', href: '/tourist-visa' },
  { title: 'Transit Visas', text: 'Rules for short stops while travelling through a country.', href: '/transit-visa' },
  { title: 'USA Visa', text: 'Visitor (B-1/B-2) and B1/B2 visa guidance for the USA.', href: '/usa-visa' },
  { title: 'UK Visa', text: 'Standard Visitor Visa and UK immigration routes.', href: '/uk-visa' },
  { title: 'Canada Visa', text: 'Visitor (TRV) and permanent residency pathways.', href: '/canada-visa' },
  { title: 'Immigration Laws', text: 'How immigration and visa rules work across countries.', href: '/immigration-laws' },
  { title: 'Immigration Lawyers', text: 'When you need legal help with an immigration case.', href: '/immigration-lawyers' },
  { title: 'Visa Blog & Guides', text: 'Latest visa news, checklists and step-by-step guides.', href: '/blogs' },
];

const faqs = [
  {
    q: 'What is a visa appointment with A Visa Experts?',
    a: 'It is a one-to-one consultation with a visa expert. You choose a plan, pick a date and time, and meet an advisor online or at our office. The advisor reviews your profile, explains the requirements for your destination and gives you a personalised document checklist and next steps.',
  },
  {
    q: 'Is this the same as the embassy or consulate appointment?',
    a: 'No. The embassy or consulate appointment is the official biometrics and interview slot that you book on the government portal. Our appointment is a preparation consultation that helps you understand the process and get ready for that official appointment with confidence.',
  },
  {
    q: 'How do I book a visa appointment?',
    a: 'Choose a plan on this page, then open the booking page and select a date and time that suits you. Share a few details about your trip, and your advisor will meet you at the scheduled time.',
  },
  {
    q: 'What is the difference between the plans?',
    a: 'Customer Support is a free 10-minute team meeting for general guidance. The Senior Manager plan is a 15-minute in-depth consultation on specific visa types. The Premium plan is a 20-minute personal meeting with our Chairman, Mr. Kaveesh Kapoor, for complex cases and full assistance.',
  },
  {
    q: 'Can I meet online or visit the office?',
    a: 'Both. Choose an online meeting with secure video conferencing, or visit our Noida (Uttar Pradesh) or Ahmedabad (Gujarat) office for an in-person consultation. Please bring your passport when visiting the office.',
  },
  {
    q: 'How long does the consultation take?',
    a: 'It depends on the plan: 10 minutes for Customer Support, 15 minutes for the Senior Manager consultation and 20 minutes for the Premium meeting with the Chairman.',
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
    q: 'Which destinations and visa types do you cover?',
    a: 'We help with tourist, visitor, transit and permanent residency visas for the USA, UK, Canada, Australia, Europe and other popular destinations.',
  },
];

const serviceJsonLd = {
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
    'Book a visa appointment with A Visa Experts. Choose from a free 10-minute team meeting, a 15-minute Senior Manager consultation, or a 20-minute personal meeting with the Chairman. Online or in-office.',
  areaServed: ['US', 'GB', 'CA', 'AU', 'EU', 'IN'],
  offers: [
    {
      '@type': 'Offer',
      name: 'Customer Support — free 10-minute meeting',
      price: '0',
      priceCurrency: 'INR',
      description: '10-minute team meeting, free of charge, for general visa guidance.',
    },
    {
      '@type': 'Offer',
      name: 'Senior Manager — 15-minute consultation',
      price: '1180',
      priceCurrency: 'INR',
      description: 'In-depth consultation on specific visa types and eligibility requirements.',
    },
    {
      '@type': 'Offer',
      name: 'Premium — 20-minute meeting with the Chairman',
      price: '1770',
      priceCurrency: 'INR',
      description: 'Personal meeting with Mr. Kaveesh Kapoor with customised visa strategy and Case Manager support.',
    },
  ],
};

const howToJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'How to book a visa appointment with A Visa Experts',
  description: 'Book a one-to-one visa consultation online or at our office in six simple steps.',
  step: steps.map((s, i) => ({
    '@type': 'HowToStep',
    position: i + 1,
    name: s.title,
    text: s.text,
  })),
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

const AppointmentInfo = () => (
  <LandingLayout>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJsonLd) }} />
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToJsonLd) }} />
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
    />

    <div className="spage">
      {/* Hero */}
      <section className="spage-hero hero-appointment">
        <div className="spage-hero-inner">
          <h1>Visa Appointment &amp; Consultation — Book with A Visa Experts</h1>
          <p>
            Book a one-to-one visa appointment with an experienced advisor at A Visa Experts. Whether you are applying
            for a tourist, visitor, transit or permanent residency visa — or recovering from a refusal — a consultation
            gives you a clear, personalised plan. Choose a free 10-minute team meeting, a 15-minute Senior Manager
            consultation, or a 20-minute personal session with our Chairman, Mr. Kaveesh Kapoor.
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

      {/* What is a visa appointment */}
      <section className="spage-section">
        <div className="spage-wrap">
          <h2>What is a visa appointment?</h2>
          <p>
            A visa appointment with A Visa Experts is a scheduled, one-to-one consultation with a visa expert. It is your
            opportunity to sit down with someone who understands the rules for your destination, ask questions, and get a
            personalised plan for your application. Instead of guessing which documents you need or how long processing
            will take, you leave the meeting knowing exactly what to do next.
          </p>
          <p>
            It is worth clarifying an important distinction. Many people search for a &ldquo;visa appointment&rdquo; meaning
            the official <strong>embassy or consulate appointment</strong> — the biometrics and interview slot you book on
            the government portal. That appointment is separate from ours. Our consultation is a{' '}
            <strong>preparation appointment</strong>: we help you understand the process, prepare the right documents and
            get ready for that official embassy appointment with confidence.
          </p>
          <p>
            Whether you are applying for a{' '}
            <Link className="spage-link" href="/tourist-visa">
              tourist or visitor visa
            </Link>
            , a{' '}
            <Link className="spage-link" href="/transit-visa">
              transit visa
            </Link>
            , or a longer-term route such as{' '}
            <Link className="spage-link" href="/usa-visa">
              a USA visitor visa
            </Link>{' '}
            or{' '}
            <Link className="spage-link" href="/canada-visa">
              Canada visitor visa
            </Link>
            , an appointment with an expert saves time and helps you avoid avoidable mistakes.
          </p>
        </div>
      </section>

      {/* Who should book */}
      <section className="spage-section">
        <div className="spage-wrap">
          <h2>Who should book a visa consultation?</h2>
          <p>A consultation is useful for almost every applicant, and especially for:</p>
          <ul className="spage-list">
            {whoShould.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </section>

      {/* Plans table */}
      <section className="spage-section">
        <div className="spage-wrap">
          <h2>Consultation plans and prices</h2>
          <p>
            Choose the level of support that matches your case. Every plan is a live, one-to-one meeting with a real
            advisor — never a chatbot or a call centre.
          </p>
          <div className="spage-table-wrap">
            <table className="spage-table">
              <thead>
                <tr>
                  <th>Plan</th>
                  <th>Duration</th>
                  <th>Price</th>
                  <th>Best for</th>
                </tr>
              </thead>
              <tbody>
                {planRows.map((row) => (
                  <tr key={row.plan}>
                    <td>{row.plan}</td>
                    <td>{row.duration}</td>
                    <td>{row.price}</td>
                    <td>{row.best}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="spage-subnote">
            Prices are in Indian Rupees and include GST where stated. The Customer Support meeting is free of charge.
          </p>
        </div>
      </section>

      {/* What each plan includes */}
      <section className="spage-section">
        <div className="spage-wrap">
          <h2>What each plan includes</h2>
          {planDetails.map((plan) => (
            <div className="spage-note" key={plan.title}>
              <h3>{plan.title}</h3>
              <ul className="spage-list">
                {plan.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="spage-section">
        <div className="spage-wrap">
          <h2>How the appointment works</h2>
          <ol className="spage-steps">
            {steps.map((step) => (
              <li key={step.title}>
                <strong>{step.title}</strong>
                <span>{step.text}</span>
              </li>
            ))}
          </ol>
          <div className="spage-btns left spage-mt-24">
            <a className="spage-btn primary" href={BOOK_URL}>
              Book Your Appointment
            </a>
          </div>
        </div>
      </section>

      {/* Online or office */}
      <section className="spage-section">
        <div className="spage-wrap">
          <h2>Online meeting or office visit?</h2>
          <p>
            You can meet your advisor wherever it is most convenient for you. Both options cover the same expert
            guidance — the choice is simply about how you prefer to meet.
          </p>
          <div className="spage-cards">
            <div className="spage-card">
              <h3>Online meeting (recommended)</h3>
              <p>
                Connect with our expert from anywhere through secure video conferencing — HD video quality, screen
                sharing and no travel required. Ideal if you are outside Noida or Ahmedabad, or short on time.
              </p>
            </div>
            <div className="spage-card">
              <h3>Office visit meeting</h3>
              <p>
                Visit us for an in-person consultation at <strong>Sector 2, Noida, Uttar Pradesh 201301</strong> or{' '}
                <strong>Valmik Complex, Shanti Sadan Society, Ahmedabad, Gujarat 380006</strong>. Please bring your
                passport while visiting the office.
              </p>
            </div>
          </div>
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

      {/* What to bring */}
      <section className="spage-section">
        <div className="spage-wrap">
          <h2>What to bring to your appointment</h2>
          <p>
            You do not need to bring everything to your first appointment, but having the following details ready helps
            us give you accurate, personalised guidance.
          </p>
          <ul className="spage-list">
            {bring.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </section>

      {/* Tips */}
      <section className="spage-section">
        <div className="spage-wrap">
          <h2>Tips to get the most out of your appointment</h2>
          <ul className="spage-list">
            {tips.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </section>

      {/* After your appointment */}
      <section className="spage-section">
        <div className="spage-wrap">
          <h2>After your appointment: your next steps</h2>
          <div className="spage-cards">
            {afterAppointment.map((card) => (
              <div className="spage-card" key={card.title}>
                <h3>{card.title}</h3>
                <p>{card.text}</p>
                <Link className="spage-link" href={card.href}>
                  {card.linkText} &rarr;
                </Link>
              </div>
            ))}
          </div>
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

      {/* Related services */}
      <section className="spage-section">
        <div className="spage-wrap">
          <h2>Related visa services</h2>
          <p>Explore the services our clients book most often after their consultation.</p>
          <div className="spage-cards">
            {related.map((card) => (
              <div className="spage-card" key={card.title}>
                <h3>
                  <Link className="spage-link" href={card.href}>
                    {card.title}
                  </Link>
                </h3>
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
            Choose your plan and schedule a one-to-one meeting with a visa expert today. Online or at our Noida or
            Ahmedabad office.
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
