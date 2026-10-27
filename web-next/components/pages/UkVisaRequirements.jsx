import LandingLayout from '../LandingLayout';

const BOOK_URL = '/book-appointment';

const eligibility = [
  {
    title: 'Genuine Purpose of Visit',
    text: 'Your reason for travelling must be a permitted visitor activity, such as tourism, visiting family or attending business meetings, and it must be the real reason for the trip.',
  },
  {
    title: 'Intention to Leave the UK',
    text: 'You must show that you will leave the UK at the end of your visit. Your job, business, studies, family and property in India are considered here.',
  },
  {
    title: 'Funds for the Trip',
    text: 'You must be able to pay for your stay and return journey without working or claiming public funds, or have a genuine sponsor who will pay.',
  },
  {
    title: 'No Long Stays Through Repeated Visits',
    text: 'You must not use frequent or back-to-back visits to live in the UK.',
  },
  {
    title: 'Honest and Consistent Information',
    text: 'Your application form and documents must match. Previous visa refusals from any country must be declared.',
  },
];

const passportReqs = [
  'Passport valid for the whole of your stay in the UK',
  'Name, date of birth and passport number in the form must match the passport exactly',
  'Old passports should be included if they show visas or travel history',
  'If you renew your passport after the visa is issued, update the passport details linked to your eVisa',
];

const bankChecks = [
  'Whether the funds are enough for the planned trip',
  'Whether the money genuinely belongs to you or your sponsor',
  'Whether the balance matches your income',
  'Whether there are large recent deposits without explanation',
];

const profiles = [
  {
    title: 'UK Visa Requirements for Salaried Employees',
    items: [
      'Employer letter with designation, salary, joining date and approved leave',
      'Salary slips for the last 3 to 6 months',
      'Bank statements showing salary credits',
      'Form 16 or income tax returns',
    ],
  },
  {
    title: 'UK Visa Requirements for Self-Employed and Business Owners',
    items: [
      'Business registration (GST, Udyam, shop licence or partnership deed)',
      'Business and personal bank statements for 6 months',
      'Business and personal ITRs',
      'Profit and loss statement, if available',
      'Evidence that the business is active, such as invoices or contracts',
    ],
  },
  {
    title: 'UK Visa Requirements for Retired Persons and Senior Citizens',
    items: [
      'Pension statements or pension payment order',
      'Bank statements showing pension credits',
      'Fixed deposits, investments or savings',
      'Property documents',
      'Evidence of family in India',
    ],
  },
  {
    title: 'UK Visa Requirements for Students',
    items: [
      'Bonafide certificate or enrolment letter from the college or school',
      'Student ID card',
      'Leave letter, if travelling during term time',
      "Parent's financial documents and a letter confirming they are paying",
    ],
  },
  {
    title: 'UK Visa Requirements for Homemakers',
    items: [
      "Spouse's financial documents and income proof",
      'Marriage certificate',
      'Own bank statements or savings, if any',
      'Evidence of family and home in India',
    ],
  },
];

const purposes = [
  {
    title: 'UK Tourist Visa Requirements',
    text: 'A clear travel plan, accommodation details and funds that match the trip. A day-wise UK visa itinerary is useful.',
  },
  {
    title: 'UK Visit Visa Requirements for Parents',
    text: "Host's invitation letter, host's passport and UK status, proof of address, proof of relationship, and the host's financial documents if they are paying.",
  },
  {
    title: 'UK Business Visa Requirements',
    text: 'Employer letter, invitation from the UK company, meeting or conference details, and activities that fit the business visitor rules.',
  },
  {
    title: 'UK Long-Term Visa Requirements',
    text: 'The same requirements, applied over the whole visa period, plus a clear reason for regular visits.',
  },
  {
    title: 'UK Visa Requirements for Children',
    text: 'Separate application, birth certificate, parental consent letter and details of the accompanying adult.',
  },
];

const otherReqs = [
  {
    title: 'UK Visa Photo Requirements',
    text: 'No printed photograph is needed. Your digital photo is taken at the biometrics appointment.',
  },
  {
    title: 'UK Visa Biometrics Requirement',
    text: 'Fingerprints and photograph are taken at a visa application centre in India. Children under 5 usually give a photograph only.',
  },
  {
    title: 'UK Visa Travel Insurance Requirement',
    text: 'Travel insurance is not a formal requirement but is recommended, since visitors are generally charged for NHS treatment.',
  },
  {
    title: 'UK Visa Interview Requirement',
    text: 'Most applications are decided on documents without an interview. Occasionally an officer may contact the applicant.',
  },
  {
    title: 'UK Visa Translation Requirement',
    text: 'Any document not in English or Welsh must have a certified translation.',
  },
];

const commonReasons = [
  'Large deposits without explanation',
  'Trip cost too high compared with income',
  'Vague purpose such as only "tourism"',
  'Form details that do not match documents',
  'Undeclared earlier refusals',
  "Only the host's documents, with no evidence of the applicant's own life in India",
];

const checklist = [
  'Passport valid for the full stay',
  'Purpose of visit is permitted and clearly explained',
  'Bank statements for 6 months',
  'Income documents (salary slips / ITR / pension / business)',
  'Evidence of ties to India',
  'Sponsor or host documents, if applicable',
  'Travel itinerary and accommodation details',
  'Certified translations, where needed',
  'All previous refusals declared',
  'Applying within 3 months of travel date',
];

const faqs = [
  {
    q: 'What are the requirements for UK tourist visa from India?',
    a: 'A valid passport, online application, visa fee, biometrics, and evidence of purpose, funds and ties to India.',
  },
  {
    q: 'How much bank balance is required for UK visa from India?',
    a: 'There is no fixed amount. Funds should cover the trip and match your income.',
  },
  {
    q: 'Is ITR required for UK visa?',
    a: 'Not mandatory, but ITRs for 2 to 3 years are useful evidence of income.',
  },
  {
    q: 'Can I get a UK visa without travel history?',
    a: 'Yes. Travel history helps, but it is not a requirement.',
  },
  {
    q: 'Is invitation letter required for UK tourist visa?',
    a: 'Not mandatory. It is useful when visiting family or friends, or for business visits.',
  },
  {
    q: 'Is hotel booking required for UK visa?',
    a: 'No paid booking is required. A refundable reservation or the host\'s address is enough.',
  },
  {
    q: 'Can a housewife apply for UK tourist visa?',
    a: "Yes. Spouse's financial documents and relationship proof are usually used.",
  },
  {
    q: 'Does meeting UK visa requirements guarantee approval?',
    a: 'No. Each application is decided by UK Visas and Immigration.',
  },
];

const UkVisaRequirements = () => (
  <LandingLayout>
    <div className="spage">
      {/* Hero */}
      <section className="spage-hero hero-uk">
        <div className="spage-hero-inner">
          <h1>UK Visa Requirements for Indians</h1>
          <p>
            Indian citizens applying for a UK tourist or visitor visa must meet the requirements of the UK Standard
            Visitor route. These requirements are the same for every applicant, but the way you prove them depends on
            your profile: a salaried employee, a business owner, a retired parent and a student will each show them
            differently.
          </p>
          <p>
            This page explains the UK visitor visa eligibility rules first, then the requirements for each type of
            applicant. For an overview of the visa itself, see <a href="/uk-visa">UK visa from India</a>.
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

      {/* Eligibility */}
      <section className="spage-section">
        <div className="spage-wrap">
          <h2>UK Visitor Visa Eligibility Requirements</h2>
          <p>Every applicant must show the visa officer the following.</p>
          <ol className="spage-steps">
            {eligibility.map((item) => (
              <li key={item.title}>
                <strong>{item.title}</strong>
                <span>{item.text}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Passport */}
      <section className="spage-section">
        <div className="spage-wrap">
          <h2>UK Visa Passport Requirements</h2>
          <ul className="spage-list">
            {passportReqs.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </section>

      {/* Bank balance */}
      <section className="spage-section">
        <div className="spage-wrap">
          <h2>UK Tourist Visa Bank Balance Requirement</h2>
          <p>There is no fixed minimum bank balance for a UK tourist visa. Instead, the officer checks:</p>
          <ul className="spage-list">
            {bankChecks.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <p className="spage-subnote">
            Bank statements for the last 6 months are commonly submitted. Read the detailed guide on{' '}
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

      {/* By profile */}
      <section className="spage-section">
        <div className="spage-wrap">
          <h2>UK Visa Requirements by Applicant Profile</h2>
          {profiles.map((profile) => (
            <div key={profile.title}>
              <h3>{profile.title}</h3>
              <ul className="spage-list">
                {profile.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* By purpose */}
      <section className="spage-section">
        <div className="spage-wrap">
          <h2>UK Visa Requirements by Purpose of Visit</h2>
          {purposes.map((item) => (
            <div key={item.title}>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Other requirements */}
      <section className="spage-section">
        <div className="spage-wrap">
          <h2>Other UK Visa Requirements</h2>
          {otherReqs.map((item) => (
            <div key={item.title}>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Documents */}
      <section className="spage-section">
        <div className="spage-wrap">
          <h2>UK Visa Documents Required</h2>
          <p>
            All supporting documents by profile are listed in the{' '}
            <a className="spage-link" href="/blog/uk-tourist-visa-documents-checklist">
              UK tourist visa documents checklist
            </a>
            . For help filling the form, see the{' '}
            <a className="spage-link" href="/blog/uk-visa-application-form-guide">
              UK visa application form guide
            </a>
            .
          </p>
        </div>
      </section>

      {/* Common reasons */}
      <section className="spage-section">
        <div className="spage-wrap">
          <h2>Common Reasons Applications Do Not Meet UK Visa Requirements</h2>
          <ul className="spage-list">
            {commonReasons.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </section>

      {/* Checklist */}
      <section className="spage-section">
        <div className="spage-wrap">
          <h2>UK Visa Requirements Checklist</h2>
          <ul className="spage-checklist">
            {checklist.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </section>

      {/* FAQ */}
      <section className="spage-section">
        <div className="spage-wrap">
          <h2>UK Visa Requirements FAQs</h2>
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
          <h2>Book a UK Visa Consultation</h2>
          <p>For questions about UK visa requirements for your profile, book a consultation.</p>
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

export default UkVisaRequirements;
