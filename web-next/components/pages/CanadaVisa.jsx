import LandingLayout from '../LandingLayout';

const BOOK_URL = '/book-appointment';

const chooseRows = [
  ['Holiday or sightseeing in Canada', 'Canada tourist visa'],
  ['Visiting family or friends', 'Canada tourist visa'],
  ['Parents visiting children in Canada', 'Canada visa for parents'],
  ['Business meetings or conferences', 'Canada business visa'],
  ['Changing flights in Canada, 48 hours or less', 'Canada transit visa'],
  ['Layover longer than 48 hours, or leaving the airport', 'Canada tourist visa'],
];

const touristPurposes = [
  'Tourism and holidays',
  'Visiting family and friends',
  'Certain business activities, such as meetings and conferences',
];

const transitWhen = [
  'You are connecting between two international flights',
  'Your time in Canada is 48 hours or less',
  'You do not already hold a valid Canadian tourist visa',
];

const requirements = [
  'A valid passport',
  'A genuine, temporary purpose of travel',
  'Enough money for your stay and return',
  'Ties to India that show you will return, such as job, business, family or property',
  'Honest and consistent information in your application',
];

const applySteps = [
  { title: 'Step 1: Choose the Right Visa', text: 'Tourist visa or transit visa, depending on your trip.' },
  { title: 'Step 2: Apply Online', text: 'Complete the online application and upload your supporting documents.' },
  {
    title: 'Step 3: Pay the Fees',
    text: 'Pay the applicable fees online. Both the application fee and the biometrics fee depend on the country\u2019s visa requirements and the type of visa you are applying for. Check the current fees before you submit.',
  },
  {
    title: 'Step 4: Give Biometrics',
    text: 'You receive a biometrics instruction letter, then give your fingerprints and photo at a visa application centre in India. Canadian biometrics are generally valid for 10 years.',
  },
  { title: 'Step 5: Wait for a Decision', text: 'Processing time depends on current workloads.' },
  {
    title: 'Step 6: Submit Your Passport',
    text: 'If approved, you are asked to submit your passport so the visa can be placed in it. The passport is then returned to you.',
  },
];

const refusalReasons = [
  'Purpose of travel not clearly explained',
  'Insufficient or unexplained funds',
  'Weak evidence of ties to India',
  'Inconsistent information',
  'Undeclared previous refusals',
];

const faqs = [
  { q: 'Can Indians get Canada eTA?', a: 'No. Indian passport holders need a visa, not an eTA.' },
  {
    q: 'Do I need a Canada transit visa for a layover?',
    a: 'Yes, if you are connecting between international flights in Canada for 48 hours or less and do not hold a valid Canadian tourist visa.',
  },
  {
    q: 'What is the fee for a Canada visa from India?',
    a: 'Both the application fee and the biometrics fee depend on the country\u2019s visa requirements and the type of visa you are applying for. Check the current fees before applying.',
  },
  { q: 'Are Canada biometrics valid for future applications?', a: 'Biometrics are generally valid for 10 years.' },
  { q: 'Is Canada visa approval guaranteed?', a: 'No. Every decision is made by the Canadian immigration authorities.' },
];

const guides = [
  { label: 'Diwali abroad with family', href: '/blog/diwali-abroad-family-visa-guide' },
  { label: 'Canada eTA vs Visa: Kya Fark Hai?', href: '/blog/canada-eta-vs-visa' },
  { label: 'Your Guide to Canada Visa Application', href: '/blog/your-guide-to-canada-visa-application-a-visa-experts-visa-immigration-experts' },
  { label: 'Canada Work Permit: A Golden Opportunity', href: '/blog/canada-work-permit-a-golden-opportunity-to-build-your-future-abroad' },
  { label: 'UK Visa from India', href: '/uk-visa' },
  { label: 'USA Visa from India', href: '/usa-visa' },
];

const CanadaVisa = () => (
  <LandingLayout>
    <div className="spage">
      {/* Hero */}
      <section className="spage-hero hero-canada">
        <div className="spage-hero-inner">
          <h1>Canada Visa from India: Tourist and Transit Visa Guide</h1>
          <p>
            Indian citizens need a visa to enter Canada, whether they are planning a holiday in Toronto, visiting family
            in Vancouver, attending a business meeting in Montreal, or simply changing flights at a Canadian airport.
            The right visa depends on why you are travelling and how long you will be in Canada.
          </p>
          <p>This page explains the Canada visa options for Indian travellers and helps you choose the one that fits your trip.</p>
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

      {/* Which visa */}
      <section className="spage-section">
        <div className="spage-wrap">
          <h2>Which Canada Visa Do You Need?</h2>
          <div className="spage-table-wrap">
            <table className="spage-table">
              <thead>
                <tr>
                  <th>Your plan</th>
                  <th>Visa you need</th>
                </tr>
              </thead>
              <tbody>
                {chooseRows.map((row) => (
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

      {/* Do Indians need a visa */}
      <section className="spage-section">
        <div className="spage-wrap">
          <h2>Do Indians Need a Visa for Canada?</h2>
          <p>
            Yes. India is a visa-required country for Canada. Indian passport holders cannot use Canada&rsquo;s
            electronic travel authorisation (eTA). They need a visa to visit Canada, and a transit visa to change
            flights in Canada, unless they already hold a valid Canadian tourist visa.
          </p>
          <p className="spage-subnote">
            Read the full comparison:{' '}
            <a className="spage-link" href="/blog/canada-eta-vs-visa">
              Canada eTA vs visa
            </a>
            .
          </p>
        </div>
      </section>

      {/* Tourist visa */}
      <section className="spage-section">
        <div className="spage-wrap">
          <h2>Canada Tourist Visa from India</h2>
          <p>
            The Canada tourist visa, officially a Temporary Resident Visa (TRV), lets eligible travellers visit Canada
            temporarily for:
          </p>
          <ul className="spage-list">
            {touristPurposes.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <p>
            The length of each stay is decided by the border officer when you arrive, and is commonly up to six months.
            A tourist visa can allow multiple entries during its validity.
          </p>
        </div>
      </section>

      {/* Transit visa */}
      <section className="spage-section">
        <div className="spage-wrap">
          <h2>Canada Transit Visa for Indians</h2>
          <p>If your flight connects through a Canadian airport on the way to another country, you need a Canada transit visa when:</p>
          <ul className="spage-list">
            {transitWhen.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <p>
            Indian passport holders are not eligible for Canada&rsquo;s Transit Without Visa program. If your layover is
            longer than 48 hours, or you plan to leave the airport and visit Canada, you need a tourist visa instead.
          </p>
        </div>
      </section>

      {/* Business */}
      <section className="spage-section">
        <div className="spage-wrap">
          <h2>Canada Business Visa from India</h2>
          <p>
            Short business trips, such as meetings, conferences, trade events and negotiations, are covered by the
            Canada tourist visa with business as the purpose of travel. Working for a Canadian employer is not allowed
            on this visa.
          </p>
        </div>
      </section>

      {/* Parents */}
      <section className="spage-section">
        <div className="spage-wrap">
          <h2>Canada Visa for Parents from India</h2>
          <p>
            Parents and grandparents visiting their children in Canada usually apply for a tourist visa with family
            visit as the purpose, supported by the host&rsquo;s invitation and documents.
          </p>
        </div>
      </section>

      {/* Requirements */}
      <section className="spage-section">
        <div className="spage-wrap">
          <h2>Canada Visa Requirements for Indians</h2>
          <p>To get a Canada tourist visa, you generally need to show:</p>
          <ul className="spage-list">
            {requirements.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <p>
            Some applicants may also need a medical exam, depending on the length and nature of the stay.
          </p>
        </div>
      </section>

      {/* How to apply */}
      <section className="spage-section">
        <div className="spage-wrap">
          <h2>How to Apply for Canada Visa from India</h2>
          <ol className="spage-steps">
            {applySteps.map((step) => (
              <li key={step.title}>
                <strong>{step.title}</strong>
                <span>{step.text}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Fees */}
      <section className="spage-section">
        <div className="spage-wrap">
          <h2>Canada Visa Fees for Indians</h2>
          <p>
            The cost of a Canada visa is not the same for every applicant. Both the application fee and the biometrics
            fee depend on the country&rsquo;s visa requirements, the type of visa you apply for, and your individual
            circumstances. Visa application centre service charges and optional services are separate from government
            fees.
          </p>
          <p>Fees are revised from time to time, so always check the current fees before applying.</p>
        </div>
      </section>

      {/* Processing time */}
      <section className="spage-section">
        <div className="spage-wrap">
          <h2>Canada Visa Processing Time in India</h2>
          <p>
            Processing times for Canadian visas from India change frequently, sometimes week to week, depending on the
            number of applications. Apply well before your travel date and avoid booking non-refundable travel until
            you have a decision.
          </p>
        </div>
      </section>

      {/* Refusals */}
      <section className="spage-section">
        <div className="spage-wrap">
          <h2>Canada Visa Rejection Reasons</h2>
          <p>Common reasons for refusal include:</p>
          <ul className="spage-list">
            {refusalReasons.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <p>
            A Canadian tourist visa refusal does not carry a regular right of appeal. Most applicants reapply after
            addressing the reasons. Understanding the officer&rsquo;s notes on your file can help you plan a stronger
            application.
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="spage-section">
        <div className="spage-wrap">
          <h2>Canada Visa FAQs</h2>
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
          <h2>Explore Canada Visa Guides</h2>
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
          <h2>Book a Canada Visa Consultation</h2>
          <p>For help choosing between a tourist and transit visa, or preparing your documents, book a consultation.</p>
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

export default CanadaVisa;
