import LandingLayout from '../LandingLayout';

const BOOK_URL = '/book-appointment';

const first48 = [
  'Read the full refusal letter, not just the first line',
  'Save the refusal letter and your original application',
  'Collect every document you submitted',
  'Note anything the officer may have misunderstood',
  'Do not book a new appointment immediately',
  'Do not make non-refundable travel bookings',
];

const reasons = [
  {
    title: 'Not Satisfied You Will Leave the UK',
    text: 'The officer did not see enough evidence of ties to India, such as job, business, property or family.',
  },
  {
    title: 'Funds Not Shown to Be Genuine',
    text: 'Large recent deposits without explanation, or funds that do not match income.',
  },
  {
    title: 'Trip Cost Too High Compared With Income',
    text: 'The planned trip would use a large share of the applicant\u2019s income or savings.',
  },
  {
    title: 'Purpose of Visit Not Clear',
    text: 'A vague purpose such as only "tourism", with no plan or supporting details.',
  },
  {
    title: 'Information Not Matching',
    text: 'Salary, dates, address or relationship details different in the form and the documents.',
  },
  {
    title: 'Activities Not Allowed for Visitors',
    text: 'Plans that look like work, such as working on a UK client\u2019s project.',
  },
  {
    title: 'Previous Refusal Not Declared',
    text: 'Leaving out an earlier refusal from the UK or any other country.',
  },
  {
    title: 'Previous Immigration History',
    text: 'An earlier overstay or breach of visa conditions that has not been explained.',
  },
];

const changeRows = [
  ['Not satisfied you will leave', 'Stronger evidence of job, business, family and property in India'],
  ['Funds not genuine', 'Proof of the source of funds and a steady financial history'],
  ['Trip cost too high', 'Realistic trip plan; clear sponsor documents if someone else is paying'],
  ['Purpose unclear', 'Day-wise itinerary, event details or invitation'],
  ['Information not matching', 'Form and every document checked for consistency'],
  ['Activities not allowed', 'Correct description of activities, or a different visa route'],
  ['Undeclared refusal', 'Declare and explain all previous refusals'],
];

const appealRows = [
  ['Fresh application', 'Always available', 'Yes, the usual route'],
  ['Appeal', 'Only in limited cases, such as human rights claims', 'Rarely'],
  ['Administrative review', 'Not usually available for visitor visas applied for from outside the UK', 'Rarely'],
  ['Judicial review', 'When the decision may be legally flawed; through a solicitor', 'Rarely; costly and slow'],
];

const reapplySoon = [
  'Evidence was missing or unclear and can now be provided',
  'A fact was misunderstood and can now be proved',
  'The purpose was poorly explained',
];

const waitBefore = [
  'Your income, job or ties have not changed',
  'You need time to build a clearer financial record',
  'You have been refused more than once for the same reason',
];

const reapplyChecklist = [
  'Every refusal reason in the letter addressed',
  'New evidence added, not just more copies of old documents',
  'Changes in circumstances explained',
  'Form and documents checked for consistency',
  'Previous refusal declared in the new form',
  'Source of any large deposits proved',
  'Day-wise UK visa itinerary included',
  'Sponsor documents included, if sponsored',
];

const faqs = [
  {
    q: 'Why was my UK tourist visa refused?',
    a: 'The refusal letter gives the exact reasons. Common ones are weak ties to India, unexplained funds, unclear purpose and inconsistent information.',
  },
  { q: 'Can I appeal a UK visitor visa refusal?', a: 'In most cases, no. A fresh application is usually the practical option.' },
  {
    q: 'How many times can I apply for a UK visa after refusal?',
    a: 'There is no fixed limit, but each application should address the reasons for the earlier refusal.',
  },
  { q: 'Is UK visa fee refunded after refusal?', a: 'Generally no.' },
  {
    q: 'Do I have to mention UK visa refusal in future applications?',
    a: 'Yes, whenever an application asks about previous refusals.',
  },
  {
    q: 'Can a UK visa refusal be cancelled?',
    a: 'A refusal cannot simply be cancelled. It can only be challenged through a legal route where available, or replaced by a successful new application.',
  },
];

const UkVisaRefusal = () => (
  <LandingLayout>
    <div className="spage">
      {/* Hero */}
      <section className="spage-hero hero-uk">
        <div className="spage-hero-inner">
          <h1>UK Visa Rejection Reasons and What to Do After a Refusal</h1>
          <p>
            A UK visa refusal stops a planned trip, but it does not stop you from applying again. Most UK visitor visa
            refusals happen because the application did not clearly show the officer one or more of the visitor
            requirements. Once those reasons are understood and addressed, a fresh application can be made.
          </p>
          <p>This page explains the common UK visa rejection reasons for Indian applicants, your options after a refusal and how to reapply.</p>
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

      {/* First 48 hours */}
      <section className="spage-section">
        <div className="spage-wrap">
          <h2>UK Visa Refused: What to Do in the First 48 Hours</h2>
          <ul className="spage-checklist">
            {first48.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </section>

      {/* Reasons */}
      <section className="spage-section">
        <div className="spage-wrap">
          <h2>Common UK Tourist Visa Rejection Reasons</h2>
          {reasons.map((item) => (
            <div key={item.title}>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* What to change */}
      <section className="spage-section">
        <div className="spage-wrap">
          <h2>UK Visa Rejection Reasons and What to Change</h2>
          <div className="spage-table-wrap">
            <table className="spage-table">
              <thead>
                <tr>
                  <th>Refusal reason</th>
                  <th>What to change in the new application</th>
                </tr>
              </thead>
              <tbody>
                {changeRows.map((row) => (
                  <tr key={row[0]}>
                    <td>{row[0]}</td>
                    <td>{row[1]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="spage-subnote">
            See{' '}
            <a className="spage-link" href="/uk-visa/requirements">
              UK visa requirements for Indians
            </a>
            .
          </p>
        </div>
      </section>

      {/* Refusal letter */}
      <section className="spage-section">
        <div className="spage-wrap">
          <h2>UK Visa Refusal Letter</h2>
          <p>
            The refusal letter lists the requirements the officer was not satisfied about and explains why. It also
            states whether you have any right of appeal or review.
          </p>
        </div>
      </section>

      {/* Appeal */}
      <section className="spage-section">
        <div className="spage-wrap">
          <h2>Can I Appeal a UK Visa Refusal?</h2>
          <div className="spage-table-wrap">
            <table className="spage-table">
              <thead>
                <tr>
                  <th>Option</th>
                  <th>When it applies</th>
                  <th>Practical for most visitor refusals?</th>
                </tr>
              </thead>
              <tbody>
                {appealRows.map((row) => (
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
            For most Standard Visitor Visa refusals from India, there is no right of appeal and no administrative review.
            A well-prepared fresh application is the usual way forward.
          </p>
        </div>
      </section>

      {/* How soon */}
      <section className="spage-section">
        <div className="spage-wrap">
          <h2>How Soon Can I Reapply for UK Visa After Refusal?</h2>
          <p>
            There is no compulsory waiting period. You can reapply at any time. What matters is whether the new
            application addresses the reasons for refusal.
          </p>
          <h3>Reapply Soon If</h3>
          <ul className="spage-list">
            {reapplySoon.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <h3>Wait Before Reapplying If</h3>
          <ul className="spage-list">
            {waitBefore.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </section>

      {/* Reapply checklist */}
      <section className="spage-section">
        <div className="spage-wrap">
          <h2>UK Visa Reapply After Refusal: Checklist</h2>
          <ul className="spage-checklist">
            {reapplyChecklist.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <p className="spage-subnote">
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

      {/* Other countries */}
      <section className="spage-section">
        <div className="spage-wrap">
          <h2>Does UK Visa Refusal Affect USA, Canada or Schengen Visa?</h2>
          <p>
            A UK refusal does not automatically lead to refusal for other countries. However, visa forms for the USA,
            Canada, Schengen countries and Australia ask about previous refusals, and you must declare it honestly.
            Hiding a refusal can cause far more serious problems than the refusal itself.
          </p>
        </div>
      </section>

      {/* Deception */}
      <section className="spage-section">
        <div className="spage-wrap">
          <h2>UK Visa Refusal for Deception</h2>
          <p>
            If the refusal letter says false documents or false information were used, the consequences are serious and
            can include a ban on future UK applications for several years. Legal advice should be taken before any
            further step.
          </p>
        </div>
      </section>

      {/* Multiple refusals */}
      <section className="spage-section">
        <div className="spage-wrap">
          <h2>UK Visa Refused Multiple Times</h2>
          <p>
            Applying again with the same facts usually leads to the same result. Before a third application, review all
            refusal letters together, identify the common reason and wait until your circumstances or evidence have
            genuinely changed.
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="spage-section">
        <div className="spage-wrap">
          <h2>UK Visa Rejection FAQs</h2>
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
          <h2>Book a UK Visa Refusal Review Consultation</h2>
          <p>For a review of your refusal letter and the documents you submitted, book a consultation.</p>
          <div className="spage-btns">
            <a className="spage-btn primary" href={BOOK_URL}>
              Book a Consultation
            </a>
            <a className="spage-btn dark" href="/consultants">
              Talk to a Consultant
            </a>
          </div>
          <p className="spage-tags">
            For an overview of the visa, see <a href="/uk-visa">UK visa from India</a>.
          </p>
        </div>
      </section>
    </div>
  </LandingLayout>
);

export default UkVisaRefusal;
