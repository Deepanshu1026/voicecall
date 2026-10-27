import LandingLayout from '../LandingLayout';

const BOOK_URL = '/book-appointment';

const glanceRows = [
  ['Visa for tourism, family visits and business trips', 'UK Standard Visitor Visa'],
  ['Maximum stay per visit', 'Usually up to 6 months'],
  ['Long-term options', '2, 5 and 10-year visitor visas'],
  ['When to apply', 'Up to 3 months before travel'],
  ['How to apply', 'Online application + biometrics appointment in India'],
  ['Usual decision time', 'Within 3 weeks of the biometrics appointment'],
  ['Visa format', 'eVisa (digital), no sticker in passport'],
  ['Can Indians use the UK ETA?', 'No, a visa is required'],
];

const visaTypes = [
  {
    title: 'UK Tourist Visa for Holidays',
    text: 'For sightseeing, holidays and leisure travel. Your application should show a clear travel plan, how the trip will be funded and your ties to India. A planned UK itinerary helps explain your purpose.',
  },
  {
    title: 'UK Visit Visa for Parents and Family',
    text: 'For parents, relatives and friends visiting people who live in the UK. These applications often include evidence from the UK host.',
  },
  {
    title: 'UK Business Visa from India',
    text: 'For meetings, conferences, negotiations and other permitted business activities. Short business trips are covered by the Standard Visitor Visa; there is no separate business visa for these.',
  },
  {
    title: 'UK Long-Term Visitor Visa (2, 5 and 10 Year)',
    text: 'For people who visit the UK regularly. A long-term visa allows multiple visits over 2, 5 or 10 years, with each visit normally limited to six months.',
  },
  {
    title: 'UK Visa for Children',
    text: 'Children need their own visa application, with consent from their parents and details of who they are travelling with.',
  },
  {
    title: 'UK Transit',
    text: 'A Standard Visitor Visa also allows transit through the UK. Travellers who are only changing flights may need a transit visa instead, depending on their route.',
  },
];

const permitted = [
  'Tourism and holidays',
  'Visiting family and friends',
  'Attending business meetings, conferences and seminars',
  'Negotiating and signing contracts',
  'Attending a job interview',
  'Short courses of up to 30 days for recreation, or study of up to six months in certain cases',
  'Private medical treatment, subject to additional requirements',
  'Transit through the UK',
];

const notPermitted = [
  'Working for a UK employer or as self-employed, paid or unpaid',
  'Claiming public funds',
  'Living in the UK through frequent or back-to-back visits',
  'Getting married or giving notice of marriage (a separate Marriage Visitor Visa is needed)',
];

const requirements = [
  'Are visiting for a permitted purpose',
  'Will leave the UK at the end of your visit',
  'Can pay for your trip and return journey, or have a genuine sponsor',
  'Will not live in the UK through repeated visits',
  'Have a passport valid for the whole stay',
];

const docRows = [
  ['Valid passport and old passports', 'Identity and travel history'],
  ['Bank statements (commonly 6 months)', 'Funds for the trip'],
  ['Salary slips / ITR / Form 16', 'Income evidence'],
  ['Employer letter with approved leave', 'Employment and return to India'],
  ['Business registration and business bank statements', 'For self-employed applicants'],
  ['Pension statements and property documents', 'For retired applicants'],
  ['Invitation and sponsor documents, if applicable', 'Family visits or sponsored trips'],
  ['Travel itinerary and accommodation details', 'Purpose and length of stay'],
];

const applySteps = [
  {
    title: 'Choose the right visa',
    text: 'Standard Visitor Visa for a single trip, or a 2, 5 or 10-year long-term visa.',
  },
  {
    title: 'Fill the UK visa application form online',
    text: 'Enter personal, travel, employment, financial and immigration history details accurately.',
  },
  { title: 'Pay the UK visa fee online', text: '' },
  {
    title: 'Book the UK visa appointment',
    text: 'Choose a visa application centre in India.',
  },
  {
    title: 'Attend biometrics',
    text: 'Fingerprints and a photograph are taken and documents are submitted. The passport is usually returned the same day.',
  },
  {
    title: 'Get the decision',
    text: 'Approved applicants receive an eVisa linked to their passport.',
  },
];

const rejectionReasons = [
  'Unclear purpose of travel',
  'Unexplained or insufficient funds',
  'Weak evidence of ties to India',
  'Information in the form not matching documents',
  'Undeclared previous refusals',
];

const faqs = [
  {
    q: 'Is UK tourist visa easy to get for Indians?',
    a: 'There is no "easy" or "hard" category. Applications with a clear purpose, explained funds and strong ties to India are easier for an officer to assess.',
  },
  {
    q: 'How much bank balance is required for UK tourist visa?',
    a: 'There is no fixed amount. Funds should cover the planned trip and match your income.',
  },
  {
    q: 'How long can I stay in the UK on a tourist visa?',
    a: 'Usually up to 6 months per visit.',
  },
  {
    q: 'Can I apply for UK visa online from India?',
    a: 'Yes. The application is made online, followed by a biometrics appointment at a visa application centre in India.',
  },
  {
    q: 'Is interview required for UK tourist visa?',
    a: 'Usually not. Most applications are decided on documents, though an officer may occasionally contact an applicant.',
  },
  {
    q: 'Can I work in the UK on a visitor visa?',
    a: 'No. Paid or unpaid work for a UK employer is not allowed.',
  },
  {
    q: 'Can I visit Ireland with a UK visa?',
    a: 'In certain cases, under the British-Irish Visa Scheme.',
  },
  {
    q: 'Is UK visa approval guaranteed?',
    a: 'No. Every decision is made by UK Visas and Immigration.',
  },
];

const guides = [
  { label: 'UK Visa Requirements for Indians', href: '/uk-visa/requirements' },
  { label: 'UK Business Visa from India', href: '/uk-visa/business-visitor-visa' },
  { label: 'UK Visit Visa for Parents from India', href: '/uk-visa/family-visit-visa' },
  { label: 'UK 10 Year Visa (Long-Term Visitor Visa)', href: '/uk-visa/long-term-visitor-visa' },
  { label: 'UK Visa Fees for Indians', href: '/uk-visa/fees' },
  { label: 'UK Visa Processing Time in India', href: '/uk-visa/processing-time' },
  { label: 'UK Tourist Visa Documents Checklist', href: '/blog/uk-tourist-visa-documents-checklist' },
  { label: 'UK Visa Application Form Guide', href: '/blog/uk-visa-application-form-guide' },
  { label: 'UK Visa Bank Balance Requirements', href: '/blog/uk-visa-bank-balance-requirements-2026-how-much-money-do-you-need' },
  { label: 'UK eVisa and ETA Update for Indians', href: '/blog/uk-evisa-update-2026' },
  { label: 'UK Transit Visa Explained', href: '/blog/uk-transit-visa-fully-explained-by-a-visa-experts' },
  { label: 'London Tourist Visa Guide', href: '/blog/london-tourist-visa-your-complete-guide-to-explore-the-uk-with-avisa-experts' },
  { label: 'Transit Visa Services', href: '/transit-visa' },
  { label: 'Latest UK Visa News and Updates', href: '/blog/visa-guide-2026-uk-visa-us-visa-canada-visa-australia-visa-latest-travel-visa-updates' },
];

const UkVisitorVisa = () => (
  <LandingLayout>
    <div className="spage">
      {/* Hero */}
      <section className="spage-hero hero-uk">
        <div className="spage-hero-inner">
          <h1>UK Visa from India: UK Tourist &amp; Visitor Visa Guide</h1>
          <p>
            Indian citizens need a visa to travel to the United Kingdom, whether the trip is a holiday in London, a
            visit to family in Birmingham or a business meeting in Manchester. For most short trips, the visa required
            is the UK Standard Visitor Visa, commonly called the UK tourist visa or UK visit visa.
          </p>
          <p>
            This page explains everything about the UK visa for Indians in one place: which visa to apply for, the
            requirements, documents, fees, processing time and the application process.
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

      {/* At a glance */}
      <section className="spage-section">
        <div className="spage-wrap">
          <h2>UK Visa at a Glance</h2>
          <div className="spage-table-wrap">
            <table className="spage-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Detail</th>
                </tr>
              </thead>
              <tbody>
                {glanceRows.map((row) => (
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

      {/* What is a UK visitor visa */}
      <section className="spage-section">
        <div className="spage-wrap">
          <h2>What Is a UK Visitor Visa?</h2>
          <p>
            The UK Standard Visitor Visa allows eligible travellers to visit the United Kingdom temporarily for
            permitted purposes such as tourism, visiting family and friends, and certain business activities. It does
            not allow you to work in the UK or live there.
          </p>
          <p>
            Visitors can usually stay for up to six months on each visit and must leave the UK at the end of their trip.
          </p>
        </div>
      </section>

      {/* Tourist vs visitor */}
      <section className="spage-section">
        <div className="spage-wrap">
          <h2>UK Tourist Visa vs UK Visitor Visa: Is There a Difference?</h2>
          <p>
            No. &ldquo;UK tourist visa&rdquo;, &ldquo;UK visit visa&rdquo; and &ldquo;UK visitor visa&rdquo; all refer
            to the same visa: the Standard Visitor Visa. The UK does not issue a separate tourist visa. The purpose of
            your trip, whether tourism, a family visit or a business meeting, is stated in your application, and your
            documents should support that purpose.
          </p>
        </div>
      </section>

      {/* Do Indians need a visa */}
      <section className="spage-section">
        <div className="spage-wrap">
          <h2>Do Indians Need a Visa for the UK?</h2>
          <p>
            Yes. Indian passport holders must get a visa before travelling to the UK for any purpose. The UK Electronic
            Travel Authorisation (ETA) is only for nationals of visa-exempt countries, and India is not one of them.
            Read more in our{' '}
            <a className="spage-link" href="/blog/uk-evisa-update-2026">
              UK eVisa and ETA update for Indians
            </a>
            .
          </p>
        </div>
      </section>

      {/* Types */}
      <section className="spage-section" id="types">
        <div className="spage-wrap">
          <h2>Types of UK Visit Visa for Indians</h2>
          <div className="spage-cards">
            {visaTypes.map((type) => (
              <div className="spage-card" key={type.title}>
                <h3>{type.title}</h3>
                <p>{type.text}</p>
              </div>
            ))}
          </div>
          <p className="spage-mt-16">
            Travelling for work? Read the full{' '}
            <a className="spage-link" href="/uk-visa/business-visitor-visa">
              UK business visa guide
            </a>
            . Visiting family in the UK? See the{' '}
            <a className="spage-link" href="/uk-visa/family-visit-visa">
              UK visit visa for parents
            </a>
            . Visit often? Compare the{' '}
            <a className="spage-link" href="/uk-visa/long-term-visitor-visa">
              2, 5 and 10-year visitor visas
            </a>
            . Looking for transit specifically? See our{' '}
            <a className="spage-link" href="/transit-visa">
              transit visa
            </a>{' '}
            page.
          </p>
        </div>
      </section>

      {/* What you can and cannot do */}
      <section className="spage-section">
        <div className="spage-wrap">
          <h2>What You Can and Cannot Do on a UK Visitor Visa</h2>
          <h3>Permitted activities</h3>
          <ul className="spage-list">
            {permitted.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <h3>Not permitted</h3>
          <ul className="spage-list">
            {notPermitted.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </section>

      {/* Requirements */}
      <section className="spage-section" id="requirements">
        <div className="spage-wrap">
          <h2>UK Visa Requirements for Indian Citizens</h2>
          <p>To be granted a UK visitor visa, you must show that you:</p>
          <ul className="spage-list">
            {requirements.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <p>
            There is no fixed minimum bank balance. Funds should be reasonable for the planned trip and consistent with
            your income. Read our guide to{' '}
            <a
              className="spage-link"
              href="/blog/uk-visa-bank-balance-requirements-2026-how-much-money-do-you-need"
            >
              UK visa bank balance
            </a>
            .
          </p>
          <p className="spage-subnote">
            See the full{' '}
            <a className="spage-link" href="/uk-visa/requirements">
              UK visa requirements for Indians
            </a>
            .
          </p>
        </div>
      </section>

      {/* Documents */}
      <section className="spage-section" id="documents">
        <div className="spage-wrap">
          <h2>UK Tourist Visa Documents Required</h2>
          <div className="spage-table-wrap">
            <table className="spage-table">
              <thead>
                <tr>
                  <th>Document</th>
                  <th>Purpose</th>
                </tr>
              </thead>
              <tbody>
                {docRows.map((row) => (
                  <tr key={row[0]}>
                    <td>{row[0]}</td>
                    <td>{row[1]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="spage-subnote">
            Documents not in English must have a certified translation. See the full{' '}
            <a className="spage-link" href="/blog/uk-tourist-visa-documents-checklist">
              UK tourist visa documents checklist
            </a>
            .
          </p>
        </div>
      </section>

      {/* How to apply */}
      <section className="spage-section" id="how-to-apply">
        <div className="spage-wrap">
          <h2>How to Apply for UK Visa from India</h2>
          <ol className="spage-steps">
            {applySteps.map((step) => (
              <li key={step.title}>
                <strong>{step.title}</strong>
                {step.text && <span>{step.text}</span>}
              </li>
            ))}
          </ol>
          <p className="spage-subnote">
            The form is filled online in English. See our{' '}
            <a className="spage-link" href="/blog/uk-visa-application-form-guide">
              UK visa application form guide
            </a>
            .
          </p>
        </div>
      </section>

      {/* Fees */}
      <section className="spage-section">
        <div className="spage-wrap">
          <h2>UK Visa Fees for Indians</h2>
          <p>
            The UK visa fee depends on the visa length: a 6-month visitor visa costs less than a 2, 5 or 10-year visa.
            Priority and super priority services, where available, cost extra. Fees are set by the UK government and
            change from time to time, so check the current fee before paying.
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
          <h2>UK Visa Processing Time in India</h2>
          <p>
            A decision on a UK visitor visa is usually made within 3 weeks of the biometrics appointment. Priority
            service, where available, aims for around 5 working days, and super priority for the next working day. Busy
            seasons can take longer.
          </p>
          <p className="spage-subnote">
            Full timeline:{' '}
            <a className="spage-link" href="/uk-visa/processing-time">
              UK visa processing time in India
            </a>
            .
          </p>
        </div>
      </section>

      {/* Rejection reasons */}
      <section className="spage-section">
        <div className="spage-wrap">
          <h2>UK Visa Rejection Reasons</h2>
          <p>Common reasons for UK visitor visa refusal include:</p>
          <ul className="spage-list">
            {rejectionReasons.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <p>
            Most UK visitor visa refusals have no right of appeal; a fresh application addressing the refusal reasons is
            the usual route.
          </p>
        </div>
      </section>

      {/* eVisa */}
      <section className="spage-section">
        <div className="spage-wrap">
          <h2>UK eVisa for Indians</h2>
          <p>
            UK visitor visas are now issued as eVisas, a digital record of permission linked to your passport, instead
            of a sticker. After approval, you access the eVisa through a UK Visas and Immigration account. If you renew
            your passport, update the details in the account before travelling. See our{' '}
            <a className="spage-link" href="/blog/uk-evisa-update-2026">
              UK eVisa update
            </a>
            .
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="spage-section">
        <div className="spage-wrap">
          <h2>UK Visa FAQs</h2>
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

      {/* Guides */}
      <section className="spage-section">
        <div className="spage-wrap">
          <h2>Explore UK Visa Guides</h2>
          <ul className="spage-list">
            {guides.map((guide) => (
              <li key={guide.href}>
                <a className="spage-link" href={guide.href}>
                  {guide.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* CTA */}
      <section className="spage-cta">
        <div className="spage-wrap">
          <h2>Book a UK Visa Consultation</h2>
          <p>
            For questions about your UK visa application, documents or eligibility, talk to a UK visa expert at A Visa
            Experts.
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
    </div>
  </LandingLayout>
);

export default UkVisitorVisa;
