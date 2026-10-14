'use client';

import LandingLayout from '../LandingLayout';
import '../../styles/appointment.css';

const BOOK_URL = '/book-appointment';

const plans = [
  {
    key: 'basic',
    className: 'card basic',
    title: 'Customer Support',
    price: (
      <>
        Free <del>₹599</del>
      </>
    ),
    features: [
      '10-minute team meeting',
      'Free of charge',
      'Introduction to visa types & offers',
      'General Q&A session',
      'Bring your passport',
      'Ideal for quick visa info',
    ],
    cta: 'Select Plan',
  },
  {
    key: 'advance',
    className: 'card popular',
    badge: 'Most Popular',
    title: 'Senior Manager',
    price: (
      <>
        ₹1180 <span className="gst-note">(GST Included)</span>
      </>
    ),
    features: [
      '15-minute Manager Meeting',
      'In-depth consultation on specific visa types',
      'Detailed explanations of eligibility requirements',
      'Bring your passport',
      'Ideal for clients who need personalized advice',
    ],
    cta: 'Select Plan',
  },
  {
    key: 'premium',
    className: 'card premium chairman-card',
    badge: 'Premium',
    badgeClass: 'badge premium-ribbon',
    chairman: true,
    price: (
      <>
        ₹1770 <span className="gst-note">(GST Included)</span>
      </>
    ),
    features: [
      '20-minute personal meeting with Chairman',
      'Customized visa strategy for your profile',
      'Case Manager support throughout the process',
      'Bring your passport & documents',
      'Ideal for complex cases & full assistance',
    ],
    cta: 'Select Premium Plan',
  },
];

const expectations = [
  'A review of your profile and travel purpose',
  'The exact requirements for your destination and visa category',
  'A personalised document checklist',
  'Honest guidance on timelines and expected processing',
  'Answers to your questions about the application process',
];

const faqs = [
  {
    q: 'How do I book a visa appointment with A Visa Experts?',
    a: 'Choose a plan, then open the booking page and pick a date and time that suits you. Share a few details about your trip, and your advisor will meet you at the scheduled time.',
  },
  {
    q: 'What is the difference between the plans?',
    a: 'Customer Support is a free 10-minute team meeting for general guidance. The Senior Manager plan is a 15-minute in-depth consultation on specific visa types. The Premium plan is a 20-minute personal meeting with our Chairman, Mr. Kaveesh Kapoor, for complex cases.',
  },
  {
    q: 'Can I meet online or visit the office?',
    a: 'Both. You can choose an online meeting with secure video conferencing, or visit our Noida or Ahmedabad office for an in-person consultation. Please bring your passport when visiting the office.',
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
    'Book a visa appointment with A Visa Experts. Choose from a free 10-minute team meeting, a Senior Manager consultation, or a personal meeting with the Chairman. Online or in-office.',
  areaServed: ['US', 'GB', 'CA', 'AU', 'EU', 'IN'],
  offers: [
    { '@type': 'Offer', name: 'Customer Support (Free 10-minute meeting)', price: '0', priceCurrency: 'INR' },
    { '@type': 'Offer', name: 'Senior Manager (15-minute consultation)', price: '1180', priceCurrency: 'INR' },
    { '@type': 'Offer', name: 'Premium (20-minute meeting with the Chairman)', price: '1770', priceCurrency: 'INR' },
  ],
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
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
    />

    <div className="appointment-page">
      {/* Offer banner */}
      <div className="offer-screen-container">
        <img
          className="offer_screen"
          src="/images/user/25-off-offer.png"
          alt="25% off senior manager consultations - A Visa Experts"
          width={1200}
          height={240}
        />
      </div>

      {/* Intro / H1 */}
      <section className="appt-intro">
        <h1>Book a Visa Appointment with A Visa Experts</h1>
        <p>
          Choose the consultation that suits you — from a free 10-minute team meeting to a personal session with our
          Chairman. Get clear guidance for your tourist, visitor, transit or PR visa, online or at our office.
        </p>
      </section>

      {/* Pricing cards */}
      <div className="pricing-section">
        <div className="pricing-container">
          {plans.map((plan) => (
            <div className={plan.className} key={plan.key}>
              <div className="circle-checkbox" />
              <div className="card-content">
                {plan.chairman ? (
                  <>
                    <span className={plan.badgeClass}>{plan.badge}</span>
                    <div className="chairman-header">
                      <div className="chairman-avatar">
                        <img src="/images/user/sirpic 1.webp" alt="Kaveesh Kapoor - A Visa Experts" width={120} height={120} />
                        <span className="chairman-badge">Chairman</span>
                      </div>
                      <div className="chairman-title">
                        <h3>Meet Mr. Kaveesh Kapoor</h3>
                        <p>Founder &amp; Chairman, A Visa Experts</p>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    {plan.badge && <span className="badge">{plan.badge}</span>}
                    <h3>{plan.title}</h3>
                  </>
                )}
                <div className="price">{plan.price}</div>
                <ul>
                  {plan.features.map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
                <a className="appt-plan-btn" href={BOOK_URL}>
                  {plan.cta}
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div className="section-divider">
        <span>Schedule Your Meeting</span>
      </div>

      {/* CTA (replaces the app booking form) */}
      <div className="form-container">
        <div className="appt-cta">
          <h2>Book your appointment in a few clicks</h2>
          <p>
            Pick a date and time, choose an online meeting or an office visit, and tell us a little about your visa
            query. You will receive a confirmation and your advisor will meet you at the scheduled time.
          </p>
          <a className="appt-schedule-btn" href={BOOK_URL}>
            Schedule Meeting
          </a>
          <p className="appt-cta-sub">
            Prefer to talk first? <a href="/consultants">Talk to a consultant</a>
          </p>
        </div>
      </div>
    </div>

    {/* SEO content */}
    <div className="spage">
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

      <section className="spage-section">
        <div className="spage-wrap">
          <h2>Online or office visit — your choice</h2>
          <div className="spage-cards">
            <div className="spage-card">
              <h3>Online meeting (recommended)</h3>
              <p>
                Connect with our expert from anywhere through secure video conferencing — HD video quality, screen
                sharing and no travel required.
              </p>
            </div>
            <div className="spage-card">
              <h3>Office visit meeting</h3>
              <p>
                Visit our office for an in-person consultation at Sector 2, Noida, Uttar Pradesh 201301 or Valmik
                Complex, Shanti Sadan Society, Ahmedabad, Gujarat 380006. Please bring your passport while visiting the
                office.
              </p>
            </div>
          </div>
        </div>
      </section>

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

      <section className="spage-cta">
        <div className="spage-wrap">
          <h2>Ready to book your visa appointment?</h2>
          <p>Choose your plan and schedule a meeting with a visa expert today.</p>
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
