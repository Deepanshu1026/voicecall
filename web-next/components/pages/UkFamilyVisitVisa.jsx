import LandingLayout from '../LandingLayout';

const BOOK_URL = '/book-appointment';

const whoCanApply = [
  'Parents visiting a son or daughter in the UK',
  'Grandparents visiting a newborn grandchild',
  'Parents attending a graduation, wedding or family function',
  'Brothers, sisters and other relatives',
  'Friends visiting someone living in the UK',
];

const parentDocs = [
  'Current and old passports',
  'Bank statements for 6 months',
  'Pension statements, rental income or other income proof',
  'ITR, if filed',
  'Property documents',
  'Evidence of family and responsibilities in India',
  'Previous visas and travel history',
];

const sponsorDocs = [
  'Invitation / sponsor letter',
  'Copy of passport',
  'Proof of UK immigration status, if not a British citizen',
  'Proof of address: tenancy agreement, mortgage statement or council tax bill',
  'Bank statements and payslips, if paying for the trip',
  "Proof of relationship, such as birth certificate of the son or daughter showing parents' names",
];

const sponsorLetter = [
  "Sponsor's full name, address, phone and email",
  "Sponsor's UK status and occupation",
  'Relationship to the parents',
  "Parents' names, dates of birth and passport numbers",
  'Purpose of the visit, with dates',
  'Where the parents will stay',
  'What the sponsor will pay for, if anything',
  'A list of documents attached',
  'Signature and date',
];

const whoPaysRows = [
  [
    'Parents pay everything',
    'Own bank statements, income/pension proof',
    'Sponsor letter, address proof, status proof',
  ],
  [
    'Shared costs (e.g. sponsor gives accommodation)',
    'Financial documents for their share',
    'Sponsor letter stating what they cover, address proof',
  ],
  [
    'Sponsor pays everything',
    'Evidence of ties to India',
    'Sponsor letter, bank statements, payslips, status and address proof',
  ],
];

const seniorPoints = [
  'Pension income and savings',
  'Ownership of a house or property',
  'Spouse or other children staying in India',
  'Previous international trips where they returned on time',
];

const purposes = [
  {
    title: 'UK Visa for Parents for Delivery or Newborn Grandchild',
    text: 'Visiting family around the birth of a grandchild is a permitted reason for a visit. The application should mention the expected due date and the planned length of stay.',
  },
  {
    title: 'UK Visa for Parents to Attend Graduation',
    text: 'Include the graduation ceremony details or invitation from the university, if available, along with the sponsor\u2019s documents.',
  },
  {
    title: 'UK Visa for Parents to Attend a Wedding',
    text: 'Attending a family wedding is permitted. The parents themselves cannot marry on a visitor visa, but attending as guests is allowed.',
  },
  {
    title: 'UK Visa for Parents Visiting Every Year',
    text: 'Parents who visit regularly can consider a 2, 5 or 10-year visa. See the UK long-term visitor visa.',
  },
];

const applyTimeline = [
  {
    title: '3 Months Before Travel',
    text: 'Fix the travel dates. The sponsor prepares the letter and documents; parents collect bank, pension and property papers.',
  },
  {
    title: '2 to 3 Months Before Travel',
    text: 'Fill the online application for each parent separately.',
  },
  {
    title: 'Appointment Day',
    text: 'Each parent attends the visa application centre for fingerprints and photo.',
  },
  {
    title: 'After the Appointment',
    text: 'A decision usually comes within 3 weeks.',
  },
];

const rejectionReasons = [
  "Application focuses only on the sponsor, with little about the parents' own life in India",
  'Repeated long stays of close to 6 months',
  "Sponsor's bank statement without any letter explaining the arrangement",
  'Different address or dates in the sponsor letter and the online form',
  "Unexplained recent deposits in the parents' account",
];

const faqs = [
  {
    q: 'Can my son in UK sponsor my visit visa?',
    a: 'Yes. A son or daughter in the UK can sponsor the visit with a sponsor letter and financial documents.',
  },
  {
    q: 'Does the sponsor need to be a British citizen?',
    a: 'No. The sponsor can be a British citizen, settled, or on a work or study visa.',
  },
  {
    q: 'Do both parents need separate visa applications?',
    a: 'Yes. Each parent applies separately and pays a separate fee.',
  },
  {
    q: 'Can parents stay 6 months in the UK?',
    a: 'Yes, up to 6 months per visit, but the stay should match the purpose.',
  },
  {
    q: 'Can parents extend their UK visitor visa?',
    a: 'In most cases, no.',
  },
  {
    q: 'Is travel insurance required for parents\u2019 UK visa?',
    a: 'Not mandatory, but recommended.',
  },
  {
    q: 'Does having children in the UK guarantee a visa for parents?',
    a: 'No. Each application is decided by UK Visas and Immigration.',
  },
];

const UkFamilyVisitVisa = () => (
  <LandingLayout>
    <div className="spage">
      {/* Hero */}
      <section className="spage-hero hero-uk">
        <div className="spage-hero-inner">
          <h1>UK Visit Visa for Parents from India</h1>
          <p>
            Many Indian parents travel to the UK to visit a son or daughter, see a newborn grandchild or attend a
            graduation. There is no separate &ldquo;parents visa&rdquo; for these trips. Parents, relatives and friends
            apply for the UK Standard Visitor Visa, often called the UK family visit visa.
          </p>
          <p>
            A parent&rsquo;s application usually involves two people: the parent applying from India and the son or
            daughter living in the UK. This page explains what each of them needs to provide. For general information on
            the visitor visa, see{' '}
            <a href="/uk-visa">UK visa from India</a>.
          </p>
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

      {/* Who can apply */}
      <section className="spage-section">
        <div className="spage-wrap">
          <h2>UK Family Visit Visa: Who Can Apply</h2>
          <ul className="spage-list">
            {whoCanApply.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <p>
            The UK host can be a British citizen, a settled person, or someone living in the UK on a work or study visa.
          </p>
        </div>
      </section>

      {/* Documents */}
      <section className="spage-section">
        <div className="spage-wrap">
          <h2>Documents Required for UK Visit Visa for Parents</h2>
          <h3>Documents From Parents (Applicant in India)</h3>
          <ul className="spage-list">
            {parentDocs.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <h3>Documents From Son or Daughter (Sponsor in UK)</h3>
          <ul className="spage-list">
            {sponsorDocs.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <p className="spage-subnote">
            Documents not in English, such as birth certificates in Hindi or regional languages, need a certified
            translation. Full list:{' '}
            <a className="spage-link" href="/blog/uk-tourist-visa-documents-checklist">
              UK tourist visa documents checklist
            </a>
            .
          </p>
        </div>
      </section>

      {/* Sponsor letter */}
      <section className="spage-section">
        <div className="spage-wrap">
          <h2>UK Visa Sponsor Letter for Parents</h2>
          <p>The letter from the son or daughter should include:</p>
          <ul className="spage-list">
            {sponsorLetter.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <p>
            The letter should state facts, not promises. Writing &ldquo;I guarantee my parents will return&rdquo;
            carries less weight than facts about the parents&rsquo; life in India.
          </p>
        </div>
      </section>

      {/* Who pays */}
      <section className="spage-section">
        <div className="spage-wrap">
          <h2>UK Visa for Parents Sponsored by Son or Daughter</h2>
          <div className="spage-table-wrap">
            <table className="spage-table">
              <thead>
                <tr>
                  <th>Who pays</th>
                  <th>Parents provide</th>
                  <th>Sponsor provides</th>
                </tr>
              </thead>
              <tbody>
                {whoPaysRows.map((row) => (
                  <tr key={row[0]}>
                    <td>{row[0]}</td>
                    <td>{row[1]}</td>
                    <td>{row[2]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p>
            When the sponsor pays, the officer checks whether the sponsor can afford it along with their own expenses.
            See{' '}
            <a
              className="spage-link"
              href="/blog/uk-visa-bank-balance-requirements-2026-how-much-money-do-you-need"
            >
              UK visa bank balance
            </a>
            .
          </p>
        </div>
      </section>

      {/* Senior citizens */}
      <section className="spage-section">
        <div className="spage-wrap">
          <h2>UK Visa for Senior Citizens and Retired Parents</h2>
          <p>Retired parents should focus on showing financial independence and life in India:</p>
          <ul className="spage-list">
            {seniorPoints.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <p>
            Travel insurance is not mandatory but is recommended for older travellers, since visitors are generally
            charged for NHS treatment.
          </p>
        </div>
      </section>

      {/* By purpose */}
      <section className="spage-section">
        <div className="spage-wrap">
          <h2>UK Visit Visa for Parents by Purpose</h2>
          {purposes.map((item) => (
            <div key={item.title}>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </div>
          ))}
          <p className="spage-subnote">
            Comparing options? See the{' '}
            <a className="spage-link" href="/uk-visa/long-term-visitor-visa">
              UK long-term visitor visa (2, 5 and 10 year)
            </a>
            .
          </p>
        </div>
      </section>

      {/* How long */}
      <section className="spage-section">
        <div className="spage-wrap">
          <h2>How Long Can Parents Stay in UK on Visitor Visa?</h2>
          <p>
            Parents can stay for up to 6 months per visit. A stay that matches the purpose of the visit, for example 8
            weeks around a delivery or graduation, is easier to explain than the full 6 months without a clear reason.
            Visitor visas generally cannot be extended after arriving in the UK, except in limited cases.
          </p>
        </div>
      </section>

      {/* How to apply */}
      <section className="spage-section">
        <div className="spage-wrap">
          <h2>How to Apply for UK Visit Visa for Parents</h2>
          {applyTimeline.map((item) => (
            <div key={item.title}>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </div>
          ))}
          <p className="spage-subnote">
            Guide:{' '}
            <a className="spage-link" href="/blog/uk-visa-application-form-guide">
              UK visa application form
            </a>{' '}
            and the{' '}
            <a className="spage-link" href="/blog/uk-visa-biometrics-appointment">
              appointment and biometrics walkthrough
            </a>
            . Timeline:{' '}
            <a className="spage-link" href="/uk-visa/processing-time">
              UK visa processing time in India
            </a>
            .
          </p>
        </div>
      </section>

      {/* Fees */}
      <section className="spage-section">
        <div className="spage-wrap">
          <h2>UK Visa for Parents Fees</h2>
          <p>
            Each parent pays a separate visa fee. The fee depends on the visa length. See{' '}
            <a className="spage-link" href="/uk-visa/fees">
              UK visa fees for Indians
            </a>
            .
          </p>
        </div>
      </section>

      {/* Rejection reasons */}
      <section className="spage-section">
        <div className="spage-wrap">
          <h2>UK Visa for Parents Rejection Reasons</h2>
          <ul className="spage-list">
            {rejectionReasons.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <p className="spage-subnote">
            See{' '}
            <a className="spage-link" href="/uk-visa/refusal">
              UK visa rejection reasons
            </a>
            .
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="spage-section">
        <div className="spage-wrap">
          <h2>UK Visit Visa for Parents FAQs</h2>
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
          <h2>Book a Consultation for Parents&rsquo; UK Visa</h2>
          <p>For questions about documents for parents or the sponsor, book a consultation.</p>
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

export default UkFamilyVisitVisa;
