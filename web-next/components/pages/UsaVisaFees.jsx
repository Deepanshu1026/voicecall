import Link from 'next/link';
import LandingLayout from '../LandingLayout';

const BOOK_URL = '/book-appointment';

const feeRows = [
  { type: 'B-1/B-2 visitor visa (business/tourism)', fee: 'US$185', note: 'Standard nonimmigrant visa application fee' },
  { type: 'F-1 / M-1 student visa', fee: 'US$185', note: 'Plus a separate SEVIS fee' },
  { type: 'H-1B / L-1 work visa', fee: 'US$205', note: 'Additional fraud-prevention fees may apply' },
  { type: 'Other nonimmigrant categories', fee: 'Varies', note: 'Confirm the current fee for your category' },
];

const otherCosts = [
  'Courier or passport delivery charges (if you choose delivery)',
  'Photograph costs',
  'SEVIS fee for student and exchange visitor visas',
  'Reciprocity fees, where they apply to your nationality and visa type',
  'Optional professional preparation and consultation services',
];

const covered = [
  'Processing of your nonimmigrant visa application by the US authorities',
  'The visa interview and the decision on your application',
];

const notCovered = [
  'A guarantee of approval — the fee is for processing, not for the visa itself',
  'Travel costs, flights, hotels or insurance',
  'A refund if your visa is refused',
];

const faqs = [
  {
    q: 'How much does a USA visa cost?',
    a: 'The standard nonimmigrant visa application (MRV) fee for a B-1/B-2 visitor visa is currently US$185. Some categories cost more — for example, H-1B and L-1 work visas are typically US$205. Always confirm the current fee for your visa category before you pay.',
  },
  {
    q: 'Is the US visa fee refundable?',
    a: 'No. The visa application (MRV) fee is non-refundable and non-transferable, even if your visa is refused or you do not attend your appointment.',
  },
  {
    q: 'How do I pay the US visa fee in India?',
    a: 'The fee is paid through the official US visa fee payment channels before you book your appointment. You must have a valid payment receipt to schedule the interview.',
  },
  {
    q: 'Does the fee guarantee my visa?',
    a: 'No. Paying the fee only means your application will be processed. The decision is made solely by the consular officer based on your application and interview.',
  },
  {
    q: 'Are there extra fees for a student or work visa?',
    a: 'Yes. Student and exchange visitor visas usually require a separate SEVIS fee, and some work visa categories include additional fraud-prevention fees. See the official fee schedule for your category.',
  },
  {
    q: 'How long is the visa fee receipt valid?',
    a: 'The MRV fee receipt is valid for a limited period for scheduling an appointment. If it expires before you book, you may need to pay again — so plan your appointment promptly after paying.',
  },
];

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'USA Visa Fees (2026): How Much Does a US Visa Cost?',
  description:
    'USA visa fees explained — the nonimmigrant visa application (MRV) fee by visa type, what the fee covers, other costs and why it is non-refundable.',
  author: { '@type': 'Organization', name: 'A Visa Experts', url: 'https://avisaexperts.com' },
  publisher: {
    '@type': 'Organization',
    name: 'A Visa Experts',
    logo: { '@type': 'ImageObject', url: 'https://avisaexperts.com/images/user/tmlogo%201.webp' },
  },
  mainEntityOfPage: { '@type': 'WebPage', '@id': 'https://avisaexperts.com/usa-visa/fees' },
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
    { '@type': 'ListItem', position: 3, name: 'USA Visa Fees', item: 'https://avisaexperts.com/usa-visa/fees' },
  ],
};

const UsaVisaFees = () => (
  <LandingLayout>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

    <div className="spage">
      <section className="spage-hero hero-usa">
        <div className="spage-hero-inner">
          <h1>USA Visa Fees (2026): How Much Does a US Visa Cost?</h1>
          <p>
            The cost of a US visa is made up of the government application fee plus a few possible extras. This guide
            explains the nonimmigrant visa application (MRV) fee by visa type, what the fee covers, other costs to plan
            for, and why the fee is not refundable.
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
          <h2>USA visa application fees by visa type</h2>
          <div className="spage-table-wrap">
            <table className="spage-table">
              <thead>
                <tr>
                  <th>Visa type</th>
                  <th>Application (MRV) fee</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {feeRows.map((r) => (
                  <tr key={r.type}>
                    <td>{r.type}</td>
                    <td>{r.fee}</td>
                    <td>{r.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="spage-subnote">
            Fees are set by the US government and can change. Always confirm the current fee for your visa category
            before you pay — our team can guide you.
          </p>
        </div>
      </section>

      <section className="spage-section">
        <div className="spage-wrap">
          <h2>What the visa fee covers — and what it doesn&rsquo;t</h2>
          <div className="spage-cards">
            <div className="spage-card">
              <h3>What it covers</h3>
              <ul className="spage-list">
                {covered.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
            </div>
            <div className="spage-card">
              <h3>What it does not cover</h3>
              <ul className="spage-list">
                {notCovered.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="spage-section">
        <div className="spage-wrap">
          <h2>Other costs to plan for</h2>
          <ul className="spage-list">
            {otherCosts.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
          <p className="spage-subnote">
            The visa application fee is non-refundable and non-transferable — it is not returned if your visa is refused
            or you miss your appointment.
          </p>
        </div>
      </section>

      <section className="spage-section">
        <div className="spage-wrap">
          <h2>Paying the US visa fee in India</h2>
          <p>
            The visa fee is paid through the official US visa fee payment channels before you can schedule your
            appointment. Keep your payment receipt safe — you will need it to book the interview, and it is valid for a
            limited period.
          </p>
          <p className="spage-mt-16">
            Once paid, move quickly to booking. See our guide to the{' '}
            <Link className="spage-link" href="/usa-visa/appointment">
              USA visa appointment
            </Link>{' '}
            and{' '}
            <Link className="spage-link" href="/usa-visa/processing-time">
              processing time
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
                <Link className="spage-link" href="/usa-visa/requirements">
                  USA Visa Requirements for India
                </Link>
              </h3>
              <p>Eligibility, documents and the application process.</p>
            </div>
            <div className="spage-card">
              <h3>
                <Link className="spage-link" href="/usa-visa/business-visa">
                  USA Business Visa
                </Link>
              </h3>
              <p>B-1 business visa requirements and how to apply.</p>
            </div>
            <div className="spage-card">
              <h3>
                <Link className="spage-link" href="/usa-visa/rejection-reasons">
                  USA Visa Rejection Reasons
                </Link>
              </h3>
              <p>Why US visas get refused and how to avoid it.</p>
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
          <h2>USA visa fees FAQs</h2>
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
          <h2>Not sure what your US visa will cost?</h2>
          <p>Talk to an expert — we&rsquo;ll confirm the current fee for your category and plan your application.</p>
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

export default UsaVisaFees;
