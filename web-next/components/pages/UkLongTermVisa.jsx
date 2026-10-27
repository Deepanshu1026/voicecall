import LandingLayout from '../LandingLayout';

const BOOK_URL = '/book-appointment';

const compareRows = [
  ['Validity', 'Up to 6 months', '2 years', '5 years', '10 years'],
  ['Stay per visit', 'Up to 6 months', 'Up to 6 months', 'Up to 6 months', 'Up to 6 months'],
  ['Entries', 'Multiple within validity', 'Multiple', 'Multiple', 'Multiple'],
  ['Fee', 'Lowest', 'Higher', 'Higher', 'Highest'],
  ['Suits', 'Single trip', 'Visits over 1-2 years', 'Regular visitor', 'Long-term frequent visitor'],
];

const sixMonthRules = [
  'Each visit is normally limited to 6 months',
  'You must not live in the UK through frequent or back-to-back visits',
  'Each visit must be for a permitted visitor purpose',
  'You may be asked about your current visit at the UK border, even with a valid long-term visa',
];

const eligibility = [
  'A continuing reason to visit the UK regularly',
  'That you will leave after each visit',
  'Funds for your visits, yourself or through a genuine sponsor',
  'Stable circumstances in India, such as job, business, property or family',
];

const selfCheck = [
  'I visit the UK at least once a year, or plan to',
  'The reason for my visits is ongoing (children in the UK, business ties, regular events)',
  'My job, business or family in India is stable',
  'I have visited the UK before and followed the visa conditions',
  'I can show steady finances over a longer period',
];

const documents = [
  'Old passports with previous UK visas and travel stamps',
  'Explanation of why you need to visit regularly',
  "Evidence of the ongoing reason, such as a family member's UK status or business contracts",
  'Financial records showing a stable pattern',
];

const myths = [
  ['"I can stay in the UK for 10 years."', 'Each visit is normally limited to 6 months.'],
  ['"A 10-year visa means no questions at the airport."', 'Border officers may still ask about the purpose of each visit.'],
  ['"Only people with many UK visits can apply."', 'Anyone can apply, but the need for a long-term visa must be clear.'],
  ['"The fee is refunded if refused."', 'Visa fees are generally not refunded.'],
];

const faqs = [
  { q: 'How long can I stay in the UK with a 10 year visa?', a: 'Up to 6 months per visit.' },
  { q: 'Is the UK 10 year visa multiple entry?', a: 'Yes. All long-term visitor visas allow multiple visits.' },
  { q: 'Can I work in the UK on a 10 year visa?', a: 'No. It is a visitor visa and does not allow work.' },
  {
    q: 'What happens if my passport expires during the 10 year visa?',
    a: 'Update your new passport details in your UK Visas and Immigration account so your eVisa is linked to it.',
  },
  {
    q: 'Can children get a UK 10 year visa?',
    a: 'Children can apply for long-term visitor visas, but the rules for under-18s include extra requirements.',
  },
  {
    q: 'Is UK 10 year visa approval guaranteed?',
    a: 'No. Each application is decided by UK Visas and Immigration.',
  },
];

const UkLongTermVisa = () => (
  <LandingLayout>
    <div className="spage">
      {/* Hero */}
      <section className="spage-hero hero-uk">
        <div className="spage-hero-inner">
          <h1>UK 10 Year Visa for Indians: 2, 5 and 10 Year Visitor Visa</h1>
          <p>
            The UK long-term visitor visa allows Indian citizens to visit the United Kingdom multiple times over 2, 5 or
            10 years without applying for a new visa before each trip. It is the same Standard Visitor Visa used for
            tourism, family visits and business trips. The only difference is its validity.
          </p>
          <p>This page compares the three options and explains who they suit, the eligibility rules and how to apply.</p>
          <div className="spage-btns">
            <a className="spage-btn primary" href={BOOK_URL}>
              Book a Consultation
            </a>
            <a className="spage-btn dark" href="/consultants">
              Talk to a Consultant
            </a>
          </div>
        </div>
      </section>

      {/* Comparison */}
      <section className="spage-section">
        <div className="spage-wrap">
          <h2>UK 2 Year vs 5 Year vs 10 Year Visa</h2>
          <div className="spage-table-wrap">
            <table className="spage-table">
              <thead>
                <tr>
                  <th></th>
                  <th>6-month visa</th>
                  <th>2 year visa</th>
                  <th>5 year visa</th>
                  <th>10 year visa</th>
                </tr>
              </thead>
              <tbody>
                {compareRows.map((row) => (
                  <tr key={row[0]}>
                    <td>
                      <strong>{row[0]}</strong>
                    </td>
                    <td>{row[1]}</td>
                    <td>{row[2]}</td>
                    <td>{row[3]}</td>
                    <td>{row[4]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="spage-subnote">
            All options allow the same activities: tourism, family visits and permitted business activities. See{' '}
            <a className="spage-link" href="/uk-visa">
              UK visa from India
            </a>
            .
          </p>
        </div>
      </section>

      {/* 6-month rule */}
      <section className="spage-section">
        <div className="spage-wrap">
          <h2>UK 10 Year Visa Rules: The 6-Month Rule</h2>
          <p>A 10-year visa does not allow a 10-year stay. Key rules:</p>
          <ul className="spage-list">
            {sixMonthRules.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <p>
            If total time spent in the UK becomes a large part of each year, it can raise questions about whether you
            are really a visitor.
          </p>
        </div>
      </section>

      {/* Eligibility */}
      <section className="spage-section">
        <div className="spage-wrap">
          <h2>UK 10 Year Visa Eligibility</h2>
          <p>
            The eligibility rules are the same as for a standard visitor visa, but they are applied to the whole
            validity period. You must show:
          </p>
          <ul className="spage-list">
            {eligibility.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <p className="spage-subnote">
            See{' '}
            <a className="spage-link" href="/uk-visa/requirements">
              UK visa requirements for Indians
            </a>
            .
          </p>
        </div>
      </section>

      {/* Self check */}
      <section className="spage-section">
        <div className="spage-wrap">
          <h2>Is the UK 10 Year Visa Right for You? (Self-Check)</h2>
          <ul className="spage-checklist">
            {selfCheck.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <p>
            If most boxes are ticked, a long-term visa may be suitable. If not, a 6-month visa is usually the better
            first step.
          </p>
        </div>
      </section>

      {/* Parents */}
      <section className="spage-section">
        <div className="spage-wrap">
          <h2>UK 10 Year Visa for Parents</h2>
          <p>
            Parents whose children live in the UK and who visit every year often choose a 5 or 10-year visa. A previous
            UK visit where they returned on time strengthens the application. See{' '}
            <a className="spage-link" href="/uk-visa/family-visit-visa">
              UK visit visa for parents
            </a>
            .
          </p>
        </div>
      </section>

      {/* Business travellers */}
      <section className="spage-section">
        <div className="spage-wrap">
          <h2>UK Long Term Visa for Business Travellers</h2>
          <p>
            Professionals who travel to the UK several times a year for meetings, client visits or conferences can use a
            2 or 5-year visa to avoid applying before each trip. See{' '}
            <a className="spage-link" href="/uk-visa/business-visitor-visa">
              UK business visa from India
            </a>
            .
          </p>
        </div>
      </section>

      {/* First-time travellers */}
      <section className="spage-section">
        <div className="spage-wrap">
          <h2>Can First-Time Travellers Get a UK 10 Year Visa?</h2>
          <p>
            There is no rule stopping a first-time applicant from applying for a long-term visa. However, an applicant
            with previous UK visits and a clean travel record can more easily show why a long-term visa makes sense.
            First-time visitors often apply for a 6-month visa first.
          </p>
        </div>
      </section>

      {/* Documents */}
      <section className="spage-section">
        <div className="spage-wrap">
          <h2>UK 10 Year Visa Documents Required</h2>
          <p>Along with the standard visitor documents, include:</p>
          <ul className="spage-list">
            {documents.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <p className="spage-subnote">
            Full list:{' '}
            <a className="spage-link" href="/blog/uk-tourist-visa-documents-checklist">
              UK tourist visa documents checklist
            </a>
            .
          </p>
        </div>
      </section>

      {/* Fees */}
      <section className="spage-section">
        <div className="spage-wrap">
          <h2>UK 10 Year Visa Fees</h2>
          <p>
            The longer the visa, the higher the fee. The fee is paid upfront and is generally not refunded if the
            application is refused. Fees change from time to time; check the current fee before applying.
          </p>
          <p className="spage-subnote">
            Full breakdown:{' '}
            <a className="spage-link" href="/uk-visa/fees">
              UK visa fees for Indians
            </a>
            .
          </p>
        </div>
      </section>

      {/* Processing time */}
      <section className="spage-section">
        <div className="spage-wrap">
          <h2>UK 10 Year Visa Processing Time</h2>
          <p>
            Long-term visas follow the same process as a 6-month visa. A decision is usually made within 3 weeks of the
            biometrics appointment.
          </p>
        </div>
      </section>

      {/* Passport renewal */}
      <section className="spage-section">
        <div className="spage-wrap">
          <h2>UK 10 Year Visa and Passport Renewal</h2>
          <p>
            UK visitor visas are now issued as eVisas linked to your passport. If your passport expires during your
            long-term visa, renew it and update the new passport details in your UK Visas and Immigration account before
            travelling. See our{' '}
            <a className="spage-link" href="/blog/uk-evisa-update-2026">
              UK eVisa update
            </a>
            .
          </p>
        </div>
      </section>

      {/* Myths */}
      <section className="spage-section">
        <div className="spage-wrap">
          <h2>UK 10 Year Visa: Myths vs Facts</h2>
          <div className="spage-table-wrap">
            <table className="spage-table">
              <thead>
                <tr>
                  <th>Myth</th>
                  <th>Fact</th>
                </tr>
              </thead>
              <tbody>
                {myths.map((row) => (
                  <tr key={row[0]}>
                    <td>{row[0]}</td>
                    <td>{row[1]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="spage-section">
        <div className="spage-wrap">
          <h2>UK 10 Year Visa FAQs</h2>
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

      {/* CTA */}
      <section className="spage-cta">
        <div className="spage-wrap">
          <h2>Book a Consultation for UK Long-Term Visa</h2>
          <p>For questions about choosing between a 2, 5 or 10-year UK visa, book a consultation.</p>
          <div className="spage-btns">
            <a className="spage-btn primary" href={BOOK_URL}>
              Book a Consultation
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

export default UkLongTermVisa;
