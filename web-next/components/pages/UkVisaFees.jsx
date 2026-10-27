import LandingLayout from '../LandingLayout';

const BOOK_URL = '/book-appointment';

const breakdownRows = [
  ['Visa application fee', 'UK government', 'Yes', 'Generally no'],
  ['Priority / super priority service', 'UK government', 'Optional', 'Generally no'],
  ['Optional centre services', 'Visa application centre', 'Optional', 'Generally no'],
  ['Certified translations', 'Translator', 'Only for non-English documents', 'No'],
  ['Consultancy fee', 'Consultant, if used', 'Optional', "As per consultant's terms"],
];

const longTermFees = [
  '6-month visa: lowest fee',
  '2-year visa: higher fee',
  '5-year visa: higher than 2-year',
  '10-year visa: highest fee',
];

const priorityRows = [
  ['Standard', 'Within 3 weeks of appointment', 'Included in visa fee'],
  ['Priority', 'Around 5 working days', 'Extra fee'],
  ['Super priority', 'By the end of the next working day', 'Higher extra fee'],
];

const centreServices = [
  'Premium lounge',
  'Appointments outside normal hours',
  'Document scanning assistance',
  'Courier return',
  'SMS updates',
];

const paySteps = [
  {
    title: 'Step 1: Complete the Online Application',
    text: 'The fee is paid after you fill and submit the application.',
  },
  {
    title: 'Step 2: Pay by Card',
    text: 'Pay the visa fee online using a debit or credit card that allows international online payments.',
  },
  {
    title: 'Step 3: Book the Appointment',
    text: 'After payment, you book an appointment at a visa application centre. Optional services are usually selected at this stage.',
  },
  { title: 'Step 4: Save the Payment Confirmation', text: 'Keep the confirmation with your documents.' },
];

const refundRules = [
  'The visa fee is generally not refunded if the application is refused.',
  'Priority fees and centre service charges already used are generally not refunded.',
  'In limited cases, such as withdrawing an application before it is processed, a refund may be possible under the rules at that time.',
];

const dos = [
  'Check the current official fee on the day you apply',
  'Choose the visa length before starting the form',
  'Budget a separate fee for each traveller',
  'Keep the payment receipt',
];

const donts = [
  'Rely on fee amounts from old posts or social media',
  'Pay for priority service expecting better chances',
  'Pay anyone who claims they can get a visa without the official fee',
  'Rush the application only to save time',
];

const faqs = [
  {
    q: 'What is the UK tourist visa fee for Indians?',
    a: 'The fee depends on the visa length. A 6-month visa has the lowest fee. Check the current government fee before applying.',
  },
  { q: 'Is UK visa fee refundable if rejected?', a: 'Generally no.' },
  {
    q: 'Is the UK business visa fee different from the tourist visa fee?',
    a: 'No. Both use the Standard Visitor Visa; the fee depends on the visa length.',
  },
  { q: 'Do children pay the same UK visa fee?', a: 'Each child pays for their own application.' },
  {
    q: 'Can I pay UK visa fee in rupees?',
    a: 'Payment is made online by card; the amount may appear in pounds or rupees, and bank charges may apply.',
  },
  { q: 'Does paying for priority service guarantee a UK visa?', a: 'No. It only speeds up when the application is decided.' },
];

const UkVisaFees = () => (
  <LandingLayout>
    <div className="spage">
      {/* Hero */}
      <section className="spage-hero hero-uk">
        <div className="spage-hero-inner">
          <h1>UK Visa Fees for Indians</h1>
          <p>
            The UK visa fee for Indian applicants is not one fixed number. The total cost depends on the type of visitor
            visa you choose, whether you need a faster decision and which optional services you select at the visa
            application centre. UK visa fees are set by the UK government and are revised from time to time.
          </p>
          <p>
            This page explains each part of the cost so you can understand what you are paying for when you check the
            current fee.
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

      {/* Breakdown */}
      <section className="spage-section">
        <div className="spage-wrap">
          <h2>UK Visa Fee Breakdown</h2>
          <div className="spage-table-wrap">
            <table className="spage-table">
              <thead>
                <tr>
                  <th>Cost</th>
                  <th>Charged by</th>
                  <th>Compulsory?</th>
                  <th>Refunded if refused?</th>
                </tr>
              </thead>
              <tbody>
                {breakdownRows.map((row) => (
                  <tr key={row[0]}>
                    <td>{row[0]}</td>
                    <td>{row[1]}</td>
                    <td>{row[2]}</td>
                    <td>{row[3]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="spage-subnote">Only the visa application fee is compulsory for every applicant.</p>
        </div>
      </section>

      {/* Tourist visa fee */}
      <section className="spage-section">
        <div className="spage-wrap">
          <h2>UK Tourist Visa Fees from India</h2>
          <p>
            The UK tourist visa, the Standard Visitor Visa, has one government fee for a visa of up to 6 months. The fee
            is the same whether your purpose is tourism, a family visit or a business trip. It changes only with the
            length of visa you choose.
          </p>
          <p>
            For an overview of the visa, see{' '}
            <a className="spage-link" href="/uk-visa">
              UK visa from India
            </a>
            .
          </p>
        </div>
      </section>

      {/* Long-term fees */}
      <section className="spage-section">
        <div className="spage-wrap">
          <h2>UK 2 Year, 5 Year and 10 Year Visa Fees</h2>
          <p>Long-term visitor visas cost more than a 6-month visa, and the fee rises with the validity:</p>
          <ul className="spage-list">
            {longTermFees.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <p>
            For someone who visits the UK every year, a long-term visa can be more practical than applying repeatedly.
            See the{' '}
            <a className="spage-link" href="/uk-visa/long-term-visitor-visa">
              UK 10 year visa
            </a>
            .
          </p>
        </div>
      </section>

      {/* Priority */}
      <section className="spage-section">
        <div className="spage-wrap">
          <h2>UK Priority Visa Fee and Super Priority Visa Fee</h2>
          <div className="spage-table-wrap">
            <table className="spage-table">
              <thead>
                <tr>
                  <th>Service</th>
                  <th>Usual decision time</th>
                  <th>Cost</th>
                </tr>
              </thead>
              <tbody>
                {priorityRows.map((row) => (
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
            Priority services are not always available at every centre or in every season. Paying for a faster decision
            does not change how the application is assessed. See{' '}
            <a className="spage-link" href="/uk-visa/processing-time">
              UK visa processing time in India
            </a>
            .
          </p>
        </div>
      </section>

      {/* Centre services */}
      <section className="spage-section">
        <div className="spage-wrap">
          <h2>UK Visa Application Centre Service Charges</h2>
          <p>Visa application centres in India may offer optional paid services, such as:</p>
          <ul className="spage-list">
            {centreServices.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <p className="spage-subnote">
            These services are optional and do not affect the visa decision.
          </p>
        </div>
      </section>

      {/* Rupees */}
      <section className="spage-section">
        <div className="spage-wrap">
          <h2>UK Visa Fee in Indian Rupees</h2>
          <p>
            The visa fee is set by the UK government. When paying online from India, the amount may be shown in pounds
            or rupees depending on the payment page, and your bank may apply currency conversion or international
            transaction charges. Always check the amount on the payment page before confirming.
          </p>
        </div>
      </section>

      {/* How to pay */}
      <section className="spage-section">
        <div className="spage-wrap">
          <h2>How to Pay UK Visa Fee from India</h2>
          {paySteps.map((step) => (
            <div key={step.title}>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </div>
          ))}
          <p className="spage-subnote">
            Guide:{' '}
            <a className="spage-link" href="/blog/uk-visa-application-form-guide">
              UK visa application form
            </a>
            .
          </p>
        </div>
      </section>

      {/* Children */}
      <section className="spage-section">
        <div className="spage-wrap">
          <h2>UK Visa Fee for Children</h2>
          <p>Each child needs a separate application and pays a separate visa fee. A family of four travelling together pays four fees.</p>
        </div>
      </section>

      {/* Refunds */}
      <section className="spage-section">
        <div className="spage-wrap">
          <h2>UK Visa Fee Refund Rules</h2>
          <ul className="spage-list">
            {refundRules.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <p>
            Since a refused application means paying again for a new one, review the UK visa application mistakes guide
            before applying. If you were refused before, check the common refusal reasons.
          </p>
        </div>
      </section>

      {/* Trip budget */}
      <section className="spage-section">
        <div className="spage-wrap">
          <h2>UK Visa Fees vs Trip Budget</h2>
          <p>
            The visa fee is only a small part of the trip cost. The visa officer looks at whether you can afford the
            whole trip: flights, stay, travel within the UK and daily expenses. See{' '}
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

      {/* Do and don't */}
      <section className="spage-section">
        <div className="spage-wrap">
          <h2>UK Visa Fees: Do&rsquo;s and Don&rsquo;ts</h2>
          <h3>Do</h3>
          <ul className="spage-list">
            {dos.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <h3>Don&rsquo;t</h3>
          <ul className="spage-list">
            {donts.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </section>

      {/* FAQ */}
      <section className="spage-section">
        <div className="spage-wrap">
          <h2>UK Visa Fees FAQs</h2>
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
          <h2>Book a Consultation for UK Visa Fees and Application</h2>
          <p>For questions about which visa length or services suit your trip, book a consultation.</p>
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

export default UkVisaFees;
