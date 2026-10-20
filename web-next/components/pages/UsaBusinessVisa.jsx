import Link from 'next/link';
import LandingLayout from '../LandingLayout';

const BOOK_URL = '/book-appointment';

const allowed = [
  'Attending business meetings, conferences and negotiations',
  'Consulting with business associates or partners in the USA',
  'Attending a professional or educational convention',
  'Short-term training that is not leading to employment',
  'Contract negotiations and settling an estate',
  'Independent research or professional activities (not paid by a US source)',
];

const notAllowed = [
  'Taking up paid employment in the USA',
  'Operating a business or freelancing for US clients',
  'Studying a full-time course',
  'Performing as a professional artist or athlete without the right visa',
  'Long-term work — this needs an H-1B, L-1 or similar work visa',
];

const requirements = [
  'A valid passport (usually valid for at least six months beyond your stay)',
  'A genuine, temporary purpose of business travel',
  'Proof that your trip is temporary and you will return home',
  'Adequate funds to cover your stay',
  'Ties to your home country — job, business, family, property',
  'Evidence of the US business you are visiting (invitation or correspondence)',
];

const documents = [
  'Passport and previous passports',
  'Completed DS-160 confirmation page',
  'Visa application (MRV) fee receipt',
  'A recent photograph meeting US specifications',
  'Invitation letter from the US company or your business contact',
  'Your employer’s letter confirming your position, purpose and dates of travel',
  'Company registration or business proof if you are self-employed',
  'Financial documents — bank statements and income proof',
  'Travel itinerary and accommodation details',
  'Previous US visas and travel history',
];

const steps = [
  { title: 'Confirm you need a B-1 visa', text: 'Check that your activity fits the B-1 business visa and not a work visa category.' },
  { title: 'Complete the DS-160', text: 'Fill the online application accurately, matching your passport and documents.' },
  { title: 'Pay the visa fee', text: 'Pay the nonimmigrant visa application fee and keep the receipt.' },
  { title: 'Book your appointment', text: 'Schedule the biometrics and interview at your nearest US consulate.' },
  { title: 'Attend the interview', text: 'Bring your documents and answer questions about your business purpose and ties.' },
  { title: 'Receive your passport', text: 'Once approved, your passport is returned with the B-1/B-2 visa.' },
];

const faqs = [
  {
    q: 'What is a USA business visa (B-1)?',
    a: 'The B-1 visa is for temporary business travel to the USA — attending meetings, conferences, negotiations or consultations. It does not allow you to work for a US employer or earn a salary in the USA.',
  },
  {
    q: 'What is the difference between a B-1 and a B-2 visa?',
    a: 'B-1 covers business travel and B-2 covers tourism or visiting family. Both are usually issued together as a combined B-1/B-2 visa, so most travellers can use the same visa for business and leisure.',
  },
  {
    q: 'Can I work in the USA on a B-1 visa?',
    a: 'No. The B-1 visa does not permit employment, freelancing or operating a business in the USA. Paid work requires a work visa such as H-1B, L-1 or another appropriate category.',
  },
  {
    q: 'What documents are required for a USA business visa?',
    a: 'Your passport, DS-160 confirmation, fee receipt, a photo, an invitation letter from the US company, your employer’s letter, business and financial documents, and your travel itinerary.',
  },
  {
    q: 'How long can I stay on a B-1 visa?',
    a: 'The visa itself can be valid for multiple years, but the length of each stay is decided by the US officer at entry — commonly up to six months for business visitors.',
  },
  {
    q: 'How long does a USA business visa take?',
    a: 'It depends mostly on appointment availability at your consulate. See our guide to USA visa processing time for the typical stages and ranges.',
  },
];

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: 'USA Business Visa (B-1) Assistance',
  serviceType: 'US Business Visa Consulting',
  provider: { '@type': 'Organization', name: 'A Visa Experts', url: 'https://avisaexperts.com' },
  description:
    'Guidance for the USA B-1 business visa — eligibility, permitted activities, required documents and the application process for Indian business travellers.',
  areaServed: ['US', 'IN'],
};

const howToJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'How to apply for a USA business visa (B-1)',
  description: 'The steps to apply for a US B-1 business visa from India.',
  step: steps.map((s, i) => ({ '@type': 'HowToStep', position: i + 1, name: s.title, text: s.text })),
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
      name: 'USA Business Visa',
      item: 'https://avisaexperts.com/usa-visa/business-visa',
    },
  ],
};

const UsaBusinessVisa = () => (
  <LandingLayout>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToJsonLd) }} />
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

    <div className="spage">
      <section className="spage-hero hero-usa">
        <div className="spage-hero-inner">
          <h1>USA Business Visa (B-1): Requirements, Documents &amp; How to Apply</h1>
          <p>
            Travelling to the United States for meetings, conferences or business negotiations? The B-1 business visa
            lets you visit the USA for legitimate business activities without taking up employment. This guide explains
            who needs it, what it allows, the documents required and how to apply.
          </p>
          <div className="spage-btns">
            <a className="spage-btn primary" href={BOOK_URL}>
              Book an Appointment
            </a>
            <a className="spage-btn dark" href="/consultants">
              Talk to a Consultant
            </a>
          </div>
        </div>
      </section>

      <section className="spage-section">
        <div className="spage-wrap">
          <h2>What is a USA business visa (B-1)?</h2>
          <p>
            The <strong>B-1 visa</strong> is a nonimmigrant visa for temporary business travel to the United States. It
            is designed for people who need to attend to business matters — meetings, conferences, negotiations,
            consultations — but who will not be employed or paid by a US source.
          </p>
          <p>
            The B-1 is usually issued together with the B-2 tourist visa as a combined <strong>B-1/B-2 visa</strong>, so
            you can use the same visa for business and leisure travel. Learn more in our{' '}
            <Link className="spage-link" href="/usa-visa/usa-b1b2-visa">
              USA B1/B2 visa guide
            </Link>
            .
          </p>
        </div>
      </section>

      <section className="spage-section">
        <div className="spage-wrap">
          <h2>What you can and cannot do on a B-1 visa</h2>
          <div className="spage-cards">
            <div className="spage-card">
              <h3>Permitted business activities</h3>
              <ul className="spage-list">
                {allowed.map((a) => (
                  <li key={a}>{a}</li>
                ))}
              </ul>
            </div>
            <div className="spage-card">
              <h3>Not permitted</h3>
              <ul className="spage-list">
                {notAllowed.map((a) => (
                  <li key={a}>{a}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="spage-section">
        <div className="spage-wrap">
          <h2>USA business visa requirements</h2>
          <ul className="spage-list">
            {requirements.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="spage-section">
        <div className="spage-wrap">
          <h2>Documents required for a USA business visa</h2>
          <ul className="spage-list">
            {documents.map((d) => (
              <li key={d}>{d}</li>
            ))}
          </ul>
          <p className="spage-subnote">
            Documents vary by case. See the full{' '}
            <Link className="spage-link" href="/usa-visa/requirements">
              USA visa requirements for Indian citizens
            </Link>
            .
          </p>
        </div>
      </section>

      <section className="spage-section">
        <div className="spage-wrap">
          <h2>How to apply for a USA business visa</h2>
          <ol className="spage-steps">
            {steps.map((s) => (
              <li key={s.title}>
                <strong>{s.title}</strong>
                <span>{s.text}</span>
              </li>
            ))}
          </ol>
          <div className="spage-btns left spage-mt-24">
            <a className="spage-btn primary" href={BOOK_URL}>
              Book an Appointment
            </a>
          </div>
        </div>
      </section>

      <section className="spage-section">
        <div className="spage-wrap">
          <h2>Business visa interview tips</h2>
          <ul className="spage-list">
            <li>Be clear and specific about your business purpose and the company you are visiting.</li>
            <li>Show that the trip is temporary and that you have strong reasons to return home.</li>
            <li>Keep your answers consistent with your DS-160, employer letter and invitation.</li>
            <li>Carry organised documents — invitation, employer letter and financial proof.</li>
          </ul>
          <p className="spage-mt-16">
            See also{' '}
            <Link className="spage-link" href="/usa-visa/fees">
              USA visa fees
            </Link>{' '}
            and{' '}
            <Link className="spage-link" href="/usa-visa/processing-time">
              USA visa processing time
            </Link>
            .
          </p>
        </div>
      </section>

      <section className="spage-section">
        <div className="spage-wrap">
          <h2>USA business visa FAQs</h2>
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
          <h2>Planning business travel to the USA?</h2>
          <p>Get expert help with your B-1 business visa — documents, DS-160 and interview preparation.</p>
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

export default UsaBusinessVisa;
