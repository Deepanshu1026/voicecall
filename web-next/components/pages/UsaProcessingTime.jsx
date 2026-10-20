import Link from 'next/link';
import LandingLayout from '../LandingLayout';

const BOOK_URL = '/book-appointment';

const stages = [
  {
    title: 'Complete the DS-160 form',
    text: 'Fill in the online nonimmigrant visa application (DS-160) accurately. Mistakes here are one of the most common causes of delays.',
  },
  {
    title: 'Pay the visa application fee',
    text: 'Pay the MRV fee through the official payment options. Your fee receipt is required before you can book an appointment.',
  },
  {
    title: 'Book your appointment',
    text: 'Schedule the visa interview at your nearest US embassy or consulate. Appointment wait times vary by post and season.',
  },
  {
    title: 'Attend biometrics and the interview',
    text: 'Provide your fingerprints and attend the visa interview. Many applicants are told the decision at the interview itself.',
  },
  {
    title: 'Administrative processing (if required)',
    text: 'Some applications need additional administrative processing before a decision. This is the least predictable stage.',
  },
  {
    title: 'Passport return with your visa',
    text: 'After approval, your passport is returned with the visa by courier or collection from the consulate.',
  },
];

const timeRows = [
  { stage: 'DS-160 form', time: 'Same day (a few hours)', note: 'You can complete it online at any time.' },
  { stage: 'Visa fee payment', time: 'Same day to 1–2 days', note: 'Required before booking an appointment.' },
  { stage: 'Appointment wait', time: 'Days to several months', note: 'Varies by consulate and season — the biggest variable.' },
  { stage: 'Interview + decision', time: 'Usually the same day', note: 'Some decisions need extra review.' },
  { stage: 'Administrative processing', time: 'Weeks to several months', note: 'Only for some applications.' },
  { stage: 'Passport return', time: 'A few days to ~2 weeks', note: 'Depends on the courier/collection option.' },
];

const factors = [
  'The consulate or embassy you apply through — wait times differ widely by post.',
  'The time of year — peak travel seasons have longer appointment queues.',
  'Your visa category and the purpose of travel.',
  'Whether your application is complete and consistent.',
  'Whether the consulate requires additional administrative processing.',
  'Your previous visa and travel history.',
];

const avoidDelays = [
  'Apply well before your planned travel date — never book flights before your visa is approved.',
  'Fill the DS-160 carefully so the details match your passport and documents.',
  'Keep your documents ready and consistent with your application.',
  'Book the earliest available appointment instead of waiting for a preferred date.',
  'Answer interview questions clearly, honestly and consistently.',
  'Check your case status regularly so you can respond quickly if the consulate requests anything.',
];

const faqs = [
  {
    q: 'How long does USA visa processing take?',
    a: 'It depends on the stage and the consulate. Completing the DS-160 and paying the fee can be done in a day or two, but the appointment wait time varies from days to several months depending on the embassy or consulate and the season. After the interview, most passports are returned within a few days to about two weeks.',
  },
  {
    q: 'Is the processing time the same for all US consulates?',
    a: 'No. Appointment availability differs from one consulate to another and changes over time, so two applicants in different cities can have very different total timelines.',
  },
  {
    q: 'How can I get a faster appointment?',
    a: 'Book the earliest slot available rather than waiting for a specific date, keep your DS-160 and documents ready so you can book immediately after paying the fee, and check for cancellations. Some applicants may qualify for an interview waiver (dropbox).',
  },
  {
    q: 'What is an interview waiver (dropbox)?',
    a: 'Eligible applicants can renew or apply without an in-person interview using the interview waiver process, which usually reduces the total processing time. Eligibility depends on the visa type and your previous visas.',
  },
  {
    q: 'What is administrative processing?',
    a: 'It is additional review that some applications require after the interview. It is the least predictable stage and can add weeks or, in some cases, months. The consulate will normally inform you if your case needs it.',
  },
  {
    q: 'How do I check my US visa status?',
    a: 'You can check your case status on the US Department of State CEAC website using your DS-160 barcode or case number. Your passport tracking, once issued, is handled by the courier service.',
  },
  {
    q: 'Can I travel while my visa is processing?',
    a: 'You should not book non-refundable travel until your visa is approved and your passport is returned. Processing times can change, so plan your trip around the visa rather than the other way round.',
  },
  {
    q: 'Does a travel agent or consultant speed up processing?',
    a: 'No one can guarantee a faster government decision. A consultant helps you avoid avoidable delays by preparing an accurate, complete application and choosing the right appointment, so nothing is held up by avoidable errors.',
  },
];

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'USA Visa Processing Time: How Long Does a US Visa Take?',
  description:
    'Understand USA visa processing time stage by stage — DS-160, fee payment, appointment wait, interview, administrative processing and passport return — and how to avoid delays.',
  author: { '@type': 'Organization', name: 'A Visa Experts', url: 'https://avisaexperts.com' },
  publisher: {
    '@type': 'Organization',
    name: 'A Visa Experts',
    logo: { '@type': 'ImageObject', url: 'https://avisaexperts.com/images/user/tmlogo%201.webp' },
  },
  mainEntityOfPage: { '@type': 'WebPage', '@id': 'https://avisaexperts.com/usa-visa/processing-time' },
};

const howToJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'USA visa processing stages',
  description: 'The stages that make up total USA visa processing time, from the DS-160 to passport return.',
  step: stages.map((s, i) => ({ '@type': 'HowToStep', position: i + 1, name: s.title, text: s.text })),
};

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map((faq) => ({
    '@type': 'Question',
    name: faq.q,
    acceptedAnswer: { '@type': 'Answer', text: faq.a },
  })),
};

const breadcrumbJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://avisaexperts.com/' },
    { '@type': 'ListItem', position: 2, name: 'USA Visa', item: 'https://avisaexperts.com/usa-visa' },
    {
      '@type': 'ListItem',
      position: 3,
      name: 'USA Visa Processing Time',
      item: 'https://avisaexperts.com/usa-visa/processing-time',
    },
  ],
};

const UsaProcessingTime = () => (
  <LandingLayout>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToJsonLd) }} />
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
    />

    <div className="spage">
      {/* Hero */}
      <section className="spage-hero hero-usa">
        <div className="spage-hero-inner">
          <h1>USA Visa Processing Time: How Long Does a US Visa Take?</h1>
          <p>
            Applying for a US visa and wondering how long it takes? The total time is the sum of several stages —
            completing the DS-160, paying the fee, waiting for an appointment, the interview, any administrative
            processing and passport return. This guide explains each stage, the typical ranges, and what you can do to
            avoid delays.
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

      {/* Intro */}
      <section className="spage-section">
        <div className="spage-wrap">
          <h2>Why there is no single "USA visa processing time"</h2>
          <p>
            There is no one number that applies to every applicant. The total time is made up of several stages, and
            the stage that usually decides your timeline is the <strong>appointment wait time</strong> at your chosen
            consulate. That wait changes from city to city and from month to month, which is why planning around a fixed
            number of days is risky.
          </p>
          <p>
            The good news is that every stage before the interview is within your control. A complete, accurate
            application prepared in advance means you can book the earliest appointment and avoid the delays that come
            from avoidable errors.
          </p>
          <p>
            If you are still deciding which visa fits your trip, start with our guide to the{' '}
            <Link className="spage-link" href="/usa-visa">
              USA visitor visa
            </Link>{' '}
            and the{' '}
            <Link className="spage-link" href="/usa-visa/usa-b1b2-visa">
              USA B1/B2 visa
            </Link>
            .
          </p>
        </div>
      </section>

      {/* Stages */}
      <section className="spage-section">
        <div className="spage-wrap">
          <h2>How US visa processing works — stage by stage</h2>
          <ol className="spage-steps">
            {stages.map((step) => (
              <li key={step.title}>
                <strong>{step.title}</strong>
                <span>{step.text}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Typical times table */}
      <section className="spage-section">
        <div className="spage-wrap">
          <h2>Typical USA visa processing times</h2>
          <p>
            The table below shows the typical range for each stage. Treat these as a planning guide, not a guarantee —
            always confirm current estimates for your consulate before booking travel.
          </p>
          <div className="spage-table-wrap">
            <table className="spage-table">
              <thead>
                <tr>
                  <th>Stage</th>
                  <th>Typical time</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {timeRows.map((row) => (
                  <tr key={row.stage}>
                    <td>{row.stage}</td>
                    <td>{row.time}</td>
                    <td>{row.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="spage-subnote">
            Ranges are indicative only. Appointment availability and administrative processing vary by consulate and
            over time.
          </p>
        </div>
      </section>

      {/* Factors */}
      <section className="spage-section">
        <div className="spage-wrap">
          <h2>What affects your USA visa processing time</h2>
          <ul className="spage-list">
            {factors.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
        </div>
      </section>

      {/* Interview waiver */}
      <section className="spage-section">
        <div className="spage-wrap">
          <h2>Interview waiver (dropbox) can shorten the timeline</h2>
          <p>
            Some applicants are eligible for an <strong>interview waiver</strong> — often called dropbox — which means
            they do not need an in-person interview. Because you skip the interview queue, the total processing time is
            usually shorter. Eligibility depends on the visa category and your previous US visas.
          </p>
          <p>
            Not sure whether you qualify? Our team can check your eligibility and advise on the fastest route for your
            case.
          </p>
          <div className="spage-btns left spage-mt-16">
            <a className="spage-btn primary" href={BOOK_URL}>
              Check Your Eligibility
            </a>
          </div>
        </div>
      </section>

      {/* Check status */}
      <section className="spage-section">
        <div className="spage-wrap">
          <h2>How to check your US visa status</h2>
          <p>
            After your interview you can follow your case on the US Department of State CEAC website using your DS-160
            barcode or case number. Once the visa is issued, passport delivery or collection is handled by the consulate&rsquo;s
            courier partner, which usually sends tracking details.
          </p>
          <p>
            If your status stays on administrative processing for longer than expected, keep your contact details up to
            date and respond promptly to any request from the consulate.
          </p>
        </div>
      </section>

      {/* Avoid delays */}
      <section className="spage-section">
        <div className="spage-wrap">
          <h2>How to avoid delays</h2>
          <ul className="spage-list">
            {avoidDelays.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
          <p className="spage-mt-16">
            Need a document checklist? See our guide to the{' '}
            <Link className="spage-link" href="/blog/usa-visa-document-checklist">
              USA visa document checklist
            </Link>
            .
          </p>
        </div>
      </section>

      {/* When to apply */}
      <section className="spage-section">
        <div className="spage-wrap">
          <h2>When should you apply?</h2>
          <p>
            Apply as early as your travel plans allow. For many travellers that means starting the process at least a
            few months before the intended travel date, and more during peak seasons. Do not book non-refundable flights
            or hotels until the visa is approved and your passport is back in your hands.
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="spage-section">
        <div className="spage-wrap">
          <h2>USA visa processing time FAQs</h2>
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
          <h2>Planning a US trip? Let&rsquo;s get your timeline right.</h2>
          <p>
            Talk to a USA visa expert at A Visa Experts for a personalised plan, a document checklist and the earliest
            appointment options for your case.
          </p>
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

export default UsaProcessingTime;
