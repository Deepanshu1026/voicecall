import LandingLayout from '../LandingLayout';

const BOOK_URL = '/book-appointment';

const glanceRows = [
  ['Standard', 'Within 3 weeks', 'Biometrics appointment'],
  ['Priority', 'Around 5 working days', 'Biometrics appointment'],
  ['Super priority', 'By end of next working day', 'Biometrics appointment'],
];

const stages = [
  ['1. Document preparation', 'Bank statements, letters, ITR, sponsor documents', '1-4 weeks'],
  ['2. Online application', 'Filling the form and paying the fee', '1-2 days'],
  ['3. Appointment booking', 'Slot at a visa application centre', 'Depends on city and season'],
  ['4. Biometrics', 'Fingerprints, photo, document submission', 'One visit'],
  ['5. Decision', 'Application is assessed', 'Usually within 3 weeks'],
  ['6. eVisa access', 'Decision email and eVisa access', 'Shortly after decision'],
];

const timeline = [
  'Early March: start collecting documents',
  'Mid-March onwards: application can be submitted',
  'April to early May: submit the form and attend biometrics',
  'By mid-May: standard 3-week period completed, with buffer before travel',
];

const delayRows = [
  ['Incomplete or inconsistent documents', 'High application volumes'],
  ['Undeclared previous refusals', 'Additional checks'],
  ['Missing translations', 'Requests for more information'],
  ['Not responding to emails quickly', 'Public holidays'],
  ['Applying too close to travel', 'Changes in processing capacity'],
];

const longerSteps = [
  { title: 'Check Your Email and Spam Folder', text: 'Look for requests for more information.' },
  { title: 'Confirm Your Contact Details', text: 'Make sure the email address in the application was correct.' },
  { title: 'Allow Some Extra Time in Busy Periods', text: 'Some applications naturally take longer.' },
  {
    title: 'Contact UK Visas and Immigration',
    text: 'If the delay continues, use the official contact service for applicants outside the UK and quote your application reference number. Some contact methods may have a charge.',
  },
  { title: 'Avoid Non-Refundable Bookings', text: 'Do not book non-refundable flights until the decision arrives.' },
];

const faqs = [
  { q: 'How long does UK visa take from India?', a: 'Usually within 3 weeks of the biometrics appointment for a standard application.' },
  { q: 'How many days after biometrics does UK visa come?', a: 'Usually within 15 working days for standard service.' },
  { q: 'Is priority service available for UK tourist visa in India?', a: 'It is often available, but depends on the centre and season.' },
  { q: 'Does UK visa processing time start after online application?', a: 'No. It starts after the biometrics appointment.' },
  { q: 'Can I get my passport back while my UK visa is processing?', a: 'Yes. The passport is usually returned at the appointment.' },
  { q: 'Does a long wait mean my UK visa is refused?', a: 'Not necessarily. Some applications need extra checks.' },
];

const UkVisaProcessingTime = () => (
  <LandingLayout>
    <div className="spage">
      {/* Hero */}
      <section className="spage-hero hero-uk">
        <div className="spage-hero-inner">
          <h1>UK Visa Processing Time in India</h1>
          <p>
            For most UK visitor visa applications from India, a decision is usually made within 3 weeks of the biometrics
            appointment. But the full process, from collecting documents to receiving your eVisa, takes longer than that.
            Knowing each stage helps you plan your travel dates safely.
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
          <h2>UK Tourist Visa Processing Time at a Glance</h2>
          <div className="spage-table-wrap">
            <table className="spage-table">
              <thead>
                <tr>
                  <th>Service</th>
                  <th>Usual decision time</th>
                  <th>Starts from</th>
                </tr>
              </thead>
              <tbody>
                {glanceRows.map((row) => (
                  <tr key={row[0]}>
                    <td>{row[0]}</td>
                    <td>{row[1]}</td>
                    <td>{row[2]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="spage-subnote">
            Weekends and public holidays are not counted as working days. Priority and super priority depend on
            availability.
          </p>
        </div>
      </section>

      {/* Stage by stage */}
      <section className="spage-section">
        <div className="spage-wrap">
          <h2>UK Visa Processing Time Stage by Stage</h2>
          <div className="spage-table-wrap">
            <table className="spage-table">
              <thead>
                <tr>
                  <th>Stage</th>
                  <th>What happens</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {stages.map((row) => (
                  <tr key={row[0]}>
                    <td>{row[0]}</td>
                    <td>{row[1]}</td>
                    <td>{row[2]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* After biometrics */}
      <section className="spage-section">
        <div className="spage-wrap">
          <h2>UK Visa Processing Time After Biometrics</h2>
          <p>
            The 3-week period starts after the biometrics appointment and document submission, not when you fill in the
            online form. Your passport is usually returned to you on the day of the appointment, as UK visitor visas are
            now issued as eVisas. See the full{' '}
            <a className="spage-link" href="/blog/uk-visa-biometrics-appointment">
              UK visa appointment and biometrics
            </a>{' '}
            walkthrough.
          </p>
        </div>
      </section>

      {/* Priority */}
      <section className="spage-section">
        <div className="spage-wrap">
          <h2>UK Priority Visa Processing Time</h2>
          <p>
            Priority service usually gives a decision in around 5 working days after biometrics, for an extra fee. Super
            priority aims for a decision by the end of the next working day. Both are optional and subject to
            availability, and they do not change how the application is assessed. See{' '}
            <a className="spage-link" href="/uk-visa/fees">
              UK visa fees for Indians
            </a>
            .
          </p>
        </div>
      </section>

      {/* Business and long-term */}
      <section className="spage-section">
        <div className="spage-wrap">
          <h2>UK Business Visa and Long-Term Visa Processing Time</h2>
          <p>
            Business visitor applications and 2, 5 and 10-year visas follow the same process and the same usual timeline
            as a 6-month tourist visa. See{' '}
            <a className="spage-link" href="/uk-visa/business-visitor-visa">
              UK business visa from India
            </a>{' '}
            and the{' '}
            <a className="spage-link" href="/uk-visa/long-term-visitor-visa">
              UK 10 year visa
            </a>
            .
          </p>
        </div>
      </section>

      {/* When to apply */}
      <section className="spage-section">
        <div className="spage-wrap">
          <h2>When to Apply for UK Visa</h2>
          <p>
            You can apply up to 3 months before your travel date. Planning backwards from your travel date is the safest
            approach.
          </p>
          <p>
            <strong>Example: travel to London on 15 June.</strong>
          </p>
          <ul className="spage-list">
            {timeline.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <p>In the summer holiday season, appointments in big cities fill quickly, so apply early.</p>
        </div>
      </section>

      {/* Peak season */}
      <section className="spage-section">
        <div className="spage-wrap">
          <h2>UK Visa Processing Time in Peak Season</h2>
          <p>
            Demand is usually higher during the summer holiday months and before major festivals and events. During these
            periods, appointment slots can be harder to get and some decisions can take longer than usual. Applying
            early is the best way to avoid last-minute pressure.
          </p>
        </div>
      </section>

      {/* Delays */}
      <section className="spage-section">
        <div className="spage-wrap">
          <h2>Why Is My UK Visa Delayed?</h2>
          <div className="spage-table-wrap">
            <table className="spage-table">
              <thead>
                <tr>
                  <th>In your control</th>
                  <th>Not in your control</th>
                </tr>
              </thead>
              <tbody>
                {delayRows.map((row) => (
                  <tr key={row[0]}>
                    <td>{row[0]}</td>
                    <td>{row[1]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p>
            A complete and consistent application reduces avoidable delays. See the{' '}
            <a className="spage-link" href="/blog/uk-tourist-visa-documents-checklist">
              UK tourist visa documents checklist
            </a>
            .
          </p>
        </div>
      </section>

      {/* Status */}
      <section className="spage-section">
        <div className="spage-wrap">
          <h2>How to Check UK Visa Status</h2>
          <p>
            After biometrics, you will receive an email when a decision has been made. There is no public tracker that
            shows the officer&rsquo;s progress day by day.
          </p>
          <p>
            If approved, you access your eVisa through your UK Visas and Immigration account. See our{' '}
            <a className="spage-link" href="/blog/uk-evisa-update-2026">
              UK eVisa update
            </a>
            .
          </p>
        </div>
      </section>

      {/* Longer than 3 weeks */}
      <section className="spage-section">
        <div className="spage-wrap">
          <h2>What to Do If UK Visa Is Taking Longer Than 3 Weeks</h2>
          {longerSteps.map((step) => (
            <div key={step.title}>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="spage-section">
        <div className="spage-wrap">
          <h2>UK Visa Processing Time FAQs</h2>
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
          <h2>Book a Consultation to Plan Your UK Visa Timeline</h2>
          <p>For help planning your application dates around your travel, book a consultation.</p>
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

export default UkVisaProcessingTime;
