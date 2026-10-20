import Link from 'next/link';
import LandingLayout from '../LandingLayout';

const BOOK_URL = '/book-appointment';

const eligibility = [
  'You have a valid Indian passport (usually valid at least six months beyond your intended stay)',
  'You have a genuine, temporary purpose of travel — tourism, business, medical treatment or transit',
  'You can show that you will return to India after your visit',
  'You have enough funds to cover your trip',
  'You are not inadmissible — for example, for serious criminal or immigration reasons',
];

const documents = [
  'Valid passport and any previous passports',
  'DS-160 confirmation page (barcode)',
  'Visa application (MRV) fee payment receipt',
  'One recent photograph meeting US photo specifications',
  'Proof of funds — recent bank statements and income proof',
  'Employment documents — offer letter, payslips or leave approval',
  'Business documents — registration, GST and ITR if self-employed',
  'Confirmed travel itinerary and accommodation details',
  'Invitation letter if visiting family, friends or a business contact',
  'Previous US visas and travel history',
  'Proof of ties to India — family, property or ongoing commitments',
];

const steps = [
  { title: 'Choose the right visa type', text: 'Decide whether you need a B-1/B-2 visitor visa or another category for your purpose.' },
  { title: 'Complete the DS-160', text: 'Fill the online form accurately so the details match your passport and documents.' },
  { title: 'Pay the visa fee', text: 'Pay the nonimmigrant visa application fee and save the receipt.' },
  { title: 'Book the appointment', text: 'Schedule biometrics and the interview at your nearest US consulate in India.' },
  { title: 'Attend the interview', text: 'Bring your documents and answer questions clearly and honestly.' },
  { title: 'Collect your passport', text: 'After approval, collect your passport with the visa or receive it by courier.' },
];

const mistakes = [
  'Filling the DS-160 with details that do not match your passport or documents',
  'Showing funds that you cannot explain or that appear arranged at the last minute',
  'Giving vague answers about your purpose of travel',
  'Missing documents or providing documents that cannot be verified',
  'Applying for the wrong visa category',
  'Hiding a previous refusal or overstay',
];

const faqs = [
  {
    q: 'What are the requirements for a USA visa from India?',
    a: 'A valid Indian passport, a genuine temporary purpose of travel, proof that you will return to India, enough funds for the trip, and a complete, consistent application. You must also not be inadmissible under US law.',
  },
  {
    q: 'What documents do Indian citizens need for a US visa?',
    a: 'Your passport, DS-160 confirmation, visa fee receipt, a compliant photograph, financial and employment/business documents, travel itinerary and — where relevant — an invitation letter. The exact list depends on your purpose of travel.',
  },
  {
    q: 'How much bank balance do I need for a US visa?',
    a: 'There is no fixed amount. The officer looks at whether your funds are enough for your trip and whether they are genuinely yours and consistent with your income. See our detailed guide on bank balance for a USA tourist visa.',
  },
  {
    q: 'Do Indian citizens need an interview for a US visa?',
    a: 'Most first-time applicants attend a visa interview. Some renewals may qualify for an interview waiver (dropbox), which usually speeds up the process.',
  },
  {
    q: 'How long does a USA visa take for Indian applicants?',
    a: 'It depends mainly on appointment availability at your consulate. See our USA visa processing time guide for the typical stages and ranges.',
  },
  {
    q: 'Can a US visa be refused even with all documents?',
    a: 'Yes. Documents alone do not guarantee approval. The officer must be satisfied that you qualify — particularly that your visit is temporary and that you will return to India.',
  },
];

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: 'USA Visa Assistance for Indian Citizens',
  serviceType: 'US Visa Consulting',
  provider: { '@type': 'Organization', name: 'A Visa Experts', url: 'https://avisaexperts.com' },
  description:
    'USA visa requirements for Indian citizens — eligibility, documents, proof of funds and the application process for US visitor and business visas.',
  areaServed: ['US', 'IN'],
};

const howToJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'How to apply for a USA visa from India',
  description: 'The steps an Indian applicant follows to apply for a US visa.',
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
      name: 'USA Visa Requirements for India',
      item: 'https://avisaexperts.com/usa-visa/requirements',
    },
  ],
};

const UsaVisaRequirements = () => (
  <LandingLayout>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToJsonLd) }} />
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

    <div className="spage">
      <section className="spage-hero hero-usa">
        <div className="spage-hero-inner">
          <h1>USA Visa Requirements for Indian Citizens (2026)</h1>
          <p>
            Applying for a US visa from India? This guide explains the eligibility requirements, the documents you need,
            proof of funds and the step-by-step application process — so you can prepare a complete, consistent
            application and avoid the mistakes that lead to refusals.
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
          <h2>USA visa eligibility requirements</h2>
          <ul className="spage-list">
            {eligibility.map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
          <p className="spage-mt-16">
            Applying for business travel? See our{' '}
            <Link className="spage-link" href="/usa-visa/business-visa">
              USA business visa
            </Link>{' '}
            guide.
          </p>
        </div>
      </section>

      <section className="spage-section">
        <div className="spage-wrap">
          <h2>Documents required for a USA visa from India</h2>
          <ul className="spage-list">
            {documents.map((d) => (
              <li key={d}>{d}</li>
            ))}
          </ul>
          <p className="spage-subnote">
            Carry originals plus photocopies to your interview. The exact list depends on your visa category and purpose
            of travel.
          </p>
        </div>
      </section>

      <section className="spage-section">
        <div className="spage-wrap">
          <h2>How to apply for a USA visa from India</h2>
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
          <h2>Common mistakes that cause US visa refusals</h2>
          <ul className="spage-list">
            {mistakes.map((m) => (
              <li key={m}>{m}</li>
            ))}
          </ul>
          <p className="spage-mt-16">
            Read the full guide to{' '}
            <Link className="spage-link" href="/usa-visa/rejection-reasons">
              USA visa rejection reasons
            </Link>
            .
          </p>
        </div>
      </section>

      <section className="spage-section">
        <div className="spage-wrap">
          <h2>Related USA visa guides</h2>
          <div className="spage-cards">
            <div className="spage-card">
              <h3>
                <Link className="spage-link" href="/usa-visa/fees">
                  USA Visa Fees
                </Link>
              </h3>
              <p>How much a US visa costs and what the fee covers.</p>
            </div>
            <div className="spage-card">
              <h3>
                <Link className="spage-link" href="/usa-visa/processing-time">
                  USA Visa Processing Time
                </Link>
              </h3>
              <p>How long each stage of US visa processing takes.</p>
            </div>
            <div className="spage-card">
              <h3>
                <Link className="spage-link" href="/usa-visa/appointment">
                  USA Visa Appointment
                </Link>
              </h3>
              <p>How to book the US visa appointment and what to expect.</p>
            </div>
            <div className="spage-card">
              <h3>
                <Link className="spage-link" href="/blog/usa-visa-document-checklist">
                  USA Visa Document Checklist
                </Link>
              </h3>
              <p>A printable checklist of every document you need.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="spage-section">
        <div className="spage-wrap">
          <h2>USA visa requirements FAQs</h2>
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
          <h2>Applying for a US visa from India?</h2>
          <p>Get a personalised requirements checklist and expert help with your application.</p>
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

export default UsaVisaRequirements;
