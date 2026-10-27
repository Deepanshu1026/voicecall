import LandingLayout from '../LandingLayout';

const BOOK_URL = '/book-appointment';

const activities = [
  ['Attending business meetings', '✅ Yes'],
  ['Attending conferences, seminars and exhibitions', '✅ Yes'],
  ['Negotiating and signing contracts', '✅ Yes'],
  ['Attending trade fairs for promotion (no direct selling)', '✅ Yes'],
  ['Site visits and inspections', '✅ Yes'],
  ['Attending a job interview', '✅ Yes'],
  ['Gathering information for work outside the UK', '✅ Yes'],
  ['Being briefed by a UK client (work done outside UK)', '✅ Yes'],
  ['Remote work for your Indian employer (not the main purpose)', '✅ Yes'],
  ['Working for a UK company', '❌ No'],
  ['Providing services to UK clients in the UK', '❌ No'],
  ['Filling a role or vacancy in a UK office', '❌ No'],
  ['Selling goods directly to the public', '❌ No'],
  ['Receiving a salary or fee from a UK source', '❌ Generally no'],
];

const intraCompany = [
  'Advise and consult on an internal project',
  'Troubleshoot',
  'Provide or receive training',
  'Share skills and knowledge with UK colleagues',
];

const requirements = [
  'A genuine business purpose that is permitted for visitors',
  'Intention to leave the UK at the end of the visit',
  'Funds for the trip, from the applicant, employer or UK host company',
  'Strong ties to India, such as employment or business',
  'A passport valid for the whole stay',
];

const salariedDocs = [
  'Passport and previous passports',
  'Employer letter: designation, salary, length of service, purpose and dates of trip, who is paying, confirmation of return',
  'Salary slips for 3 to 6 months',
  'Personal bank statements for 6 months',
  'ITR or Form 16',
];

const ownerDocs = [
  'Business registration (GST, Udyam, partnership deed or company documents)',
  'Business and personal bank statements for 6 months',
  'Business and personal ITRs',
  'Company profile',
  'Evidence of trade with the UK company, such as purchase orders, contracts or emails',
];

const ukCompanyDocs = [
  'Invitation letter',
  'Meeting schedule, conference registration or trade fair confirmation',
  'Company details and contact person',
];

const invitationLetter = [
  "The visitor's name, designation and Indian company",
  'The relationship between the two companies',
  'Specific meetings or activities, with dates',
  'Who is paying for travel and accommodation',
  'That the visitor will not be employed or paid by the UK company',
  'Name and contact details of the signatory',
];

const applySteps = [
  { title: 'Step 1: Check Your Activities', text: 'Make sure every planned activity is permitted for business visitors.' },
  {
    title: 'Step 2: Fill the Online Application',
    text: 'Select business as the main purpose.',
  },
  {
    title: 'Step 3: Pay the Visa Fee and Book an Appointment',
    text: 'Pay online and book a slot at a visa application centre in India.',
  },
  {
    title: 'Step 4: Attend Biometrics',
    text: 'Fingerprints and photo are taken, and documents are submitted.',
  },
  { title: 'Step 5: Receive the Decision', text: 'Approved applicants receive an eVisa linked to their passport.' },
];

const validityRows = [
  ['Standard', 'Up to 6 months', 'Up to 6 months'],
  ['Long-term 2 years', '2 years', 'Up to 6 months'],
  ['Long-term 5 years', '5 years', 'Up to 6 months'],
  ['Long-term 10 years', '10 years', 'Up to 6 months'],
];

const rejectionReasons = [
  'Letters describing the trip as work, such as "working on the client\'s project"',
  'UK company offering a fee or salary for the visit',
  'No evidence of a real business relationship',
  'Dates in the invitation, employer letter and application not matching',
  "Weak evidence of the applicant's own employment or business in India",
];

const faqs = [
  {
    q: 'Can I go to the UK for a business meeting on a tourist visa?',
    a: 'Yes. Business meetings and tourism are both covered by the Standard Visitor Visa.',
  },
  {
    q: 'Can a UK company pay for my travel and hotel?',
    a: 'Yes. A UK company can usually cover reasonable travel and accommodation costs. It should be stated in the invitation letter.',
  },
  {
    q: 'Can I work in the UK on a business visitor visa?',
    a: 'No. Working for a UK company or UK clients is not allowed.',
  },
  {
    q: 'Can I attend a job interview in the UK on a visitor visa?',
    a: 'Yes, but you cannot start working on the visitor visa.',
  },
  {
    q: 'Can freelancers apply for UK business visa?',
    a: 'Freelancers can visit for meetings and negotiations, but the actual work for UK clients must be done outside the UK.',
  },
  {
    q: 'How long can I stay on a UK business visa?',
    a: 'Up to 6 months per visit, though the stay should match the business purpose.',
  },
  {
    q: 'Is a UK business visa guaranteed with an invitation letter?',
    a: 'No. An invitation supports the application, but the decision is made by UK Visas and Immigration.',
  },
];

const UkBusinessVisa = () => (
  <LandingLayout>
    <div className="spage">
      {/* Hero */}
      <section className="spage-hero hero-uk">
        <div className="spage-hero-inner">
          <h1>UK Business Visa from India</h1>
          <p>
            Indian professionals and business owners travelling to the UK for meetings, conferences, trade fairs or
            contract negotiations apply for the UK Standard Visitor Visa with business as the purpose of visit. This is
            what is commonly called the UK business visa or UK business visitor visa.
          </p>
          <p>
            The visa allows a defined list of business activities, but it does not allow you to work in the UK. This page
            explains what is allowed, the documents required and how to apply from India.
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

      {/* Separate visa? */}
      <section className="spage-section">
        <div className="spage-wrap">
          <h2>Is There a Separate UK Business Visa?</h2>
          <p>
            No. For short business trips, the UK does not issue a separate business visa. Business travellers apply for
            the Standard Visitor Visa, the same visa used for tourism and family visits, and state business as the main
            purpose. Tourism can be combined with a business trip on the same visa.
          </p>
          <p>
            For the general rules of the visitor route, see{' '}
            <a className="spage-link" href="/uk-visa">
              UK visa from India
            </a>
            .
          </p>
        </div>
      </section>

      {/* Permitted activities */}
      <section className="spage-section">
        <div className="spage-wrap">
          <h2>UK Business Visitor Visa: Permitted Activities</h2>
          <div className="spage-table-wrap">
            <table className="spage-table">
              <thead>
                <tr>
                  <th>Activity</th>
                  <th>Allowed?</th>
                </tr>
              </thead>
              <tbody>
                {activities.map((row) => (
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

      {/* Intra-company */}
      <section className="spage-section">
        <div className="spage-wrap">
          <h2>UK Business Visa for Intra-Company Visits</h2>
          <p>
            Employees of an Indian company that is part of the same group as a UK company may visit to:
          </p>
          <ul className="spage-list">
            {intraCompany.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <p>
            These activities must stay internal to the company group. Working directly with the UK company&rsquo;s
            clients is not allowed.
          </p>
          <h3>Installing or Servicing Equipment in the UK</h3>
          <p>
            Employees of an overseas supplier may install, repair, service or advise on equipment or software supplied
            to a UK company, where this is part of the sale or after-sales contract.
          </p>
        </div>
      </section>

      {/* Permitted paid engagement */}
      <section className="spage-section">
        <div className="spage-wrap">
          <h2>Permitted Paid Engagement in the UK</h2>
          <p>
            Certain professionals invited by a UK organisation because of their expertise can be paid for a specific
            engagement, for example guest lectures, examining, speaking at events or performing. The engagement must be
            arranged before travel, relate to the person&rsquo;s expertise and be supported by a formal invitation.
          </p>
        </div>
      </section>

      {/* Requirements */}
      <section className="spage-section">
        <div className="spage-wrap">
          <h2>UK Business Visa Requirements</h2>
          <p>Business visitors must meet the same requirements as all visitors:</p>
          <ul className="spage-list">
            {requirements.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <p className="spage-subnote">
            Full details:{' '}
            <a className="spage-link" href="/uk-visa/requirements">
              UK visa requirements for Indians
            </a>
            .
          </p>
        </div>
      </section>

      {/* Documents */}
      <section className="spage-section">
        <div className="spage-wrap">
          <h2>UK Business Visa Documents Required</h2>
          <h3>Documents for Salaried Employees</h3>
          <ul className="spage-list">
            {salariedDocs.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <h3>Documents for Business Owners and Self-Employed</h3>
          <ul className="spage-list">
            {ownerDocs.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <h3>Documents From the UK Company</h3>
          <ul className="spage-list">
            {ukCompanyDocs.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <p className="spage-subnote">
            Complete list:{' '}
            <a className="spage-link" href="/blog/uk-tourist-visa-documents-checklist">
              UK tourist visa documents checklist
            </a>
            .
          </p>
        </div>
      </section>

      {/* Invitation letter */}
      <section className="spage-section">
        <div className="spage-wrap">
          <h2>UK Business Visa Invitation Letter</h2>
          <p>
            A business invitation letter is not mandatory but is strongly recommended. It should be on the UK
            company&rsquo;s letterhead and state:
          </p>
          <ul className="spage-list">
            {invitationLetter.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <p>
            The dates and purpose in the letter must match the online application and the employer letter.
          </p>
        </div>
      </section>

      {/* How to apply */}
      <section className="spage-section">
        <div className="spage-wrap">
          <h2>How to Apply for UK Business Visa from India</h2>
          <ol className="spage-steps">
            {applySteps.map((step) => (
              <li key={step.title}>
                <strong>{step.title}</strong>
                {step.text && <span>{step.text}</span>}
              </li>
            ))}
          </ol>
          <p className="spage-subnote">
            Guide:{' '}
            <a className="spage-link" href="/blog/uk-visa-application-form-guide">
              UK visa application form
            </a>
            .
          </p>
        </div>
      </section>

      {/* Fees */}
      <section className="spage-section">
        <div className="spage-wrap">
          <h2>UK Business Visa Fees</h2>
          <p>
            The fee depends on the visa length: a 6-month visa costs less than a 2, 5 or 10-year visa. Faster-decision
            services cost extra where available. Fees change from time to time; check the current fee before paying.
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
          <h2>UK Business Visa Processing Time</h2>
          <p>
            A decision is usually made within 3 weeks of the biometrics appointment. Priority (around 5 working days)
            and super priority (next working day) may be available.
          </p>
        </div>
      </section>

      {/* Validity */}
      <section className="spage-section">
        <div className="spage-wrap">
          <h2>UK Business Visa Validity: 6 Months, 2, 5 and 10 Years</h2>
          <div className="spage-table-wrap">
            <table className="spage-table">
              <thead>
                <tr>
                  <th>Visa</th>
                  <th>Validity</th>
                  <th>Stay per visit</th>
                </tr>
              </thead>
              <tbody>
                {validityRows.map((row) => (
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
            Frequent business travellers can consider a{' '}
            <a className="spage-link" href="/uk-visa/long-term-visitor-visa">
              long-term visitor visa
            </a>
            .
          </p>
        </div>
      </section>

      {/* Rejection reasons */}
      <section className="spage-section">
        <div className="spage-wrap">
          <h2>UK Business Visa Rejection Reasons</h2>
          <ul className="spage-list">
            {rejectionReasons.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </section>

      {/* FAQ */}
      <section className="spage-section">
        <div className="spage-wrap">
          <h2>UK Business Visa FAQs</h2>
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
          <h2>Book a UK Business Visa Consultation</h2>
          <p>For questions about your business trip, documents or permitted activities, book a consultation.</p>
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

export default UkBusinessVisa;
