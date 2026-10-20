import Link from 'next/link';
import LandingLayout from '../LandingLayout';

const BOOK_URL = '/book-appointment';

const reasons = [
  {
    title: 'Incomplete or inconsistent application (DS-160)',
    text: 'Mistakes, missing fields or details that do not match your passport and documents are one of the most common reasons for a refusal. The officer compares your DS-160 with everything you submit, so small inconsistencies can raise doubts about your application.',
  },
  {
    title: 'Insufficient ties to your home country (INA 214(b))',
    text: 'This is the most frequently cited ground for refusal. The officer must be satisfied that you will return home after your visit. Strong family, employment, business, property or ongoing commitments in your home country help show that.',
  },
  {
    title: 'Insufficient proof of funds',
    text: 'If you cannot show that you can finance the trip — and that the money is genuinely yours — the officer may doubt that the trip is affordable and legitimate. Bank statements should be consistent, recent and explainable.',
  },
  {
    title: 'Unclear purpose of travel or a weak itinerary',
    text: 'Vague plans ("just visiting") with no dates, places or arrangements make it harder to show a genuine, well-planned trip. A clear itinerary that matches your funds and time off work supports your case.',
  },
  {
    title: 'Inconsistent or vague interview answers',
    text: 'The interview is where the officer tests whether your application holds together. Answers that contradict your DS-160, your documents or your own earlier answers create doubt, even when your paperwork is otherwise fine.',
  },
  {
    title: 'Previous overstay or immigration violations',
    text: 'Staying longer than permitted on a previous visa, working when you were not allowed to, or other violations are serious. They can lead to a refusal and, in some cases, a longer-term ineligibility.',
  },
  {
    title: 'Criminal record or other inadmissibility grounds',
    text: 'Certain criminal convictions, security concerns, health-related grounds or prior immigration fraud can make an applicant inadmissible. These are legal grounds that usually require specific advice.',
  },
  {
    title: 'Missing or unreliable supporting documents',
    text: 'Documents that are missing, unclear, expired or impossible to verify weaken an application. Everything you present should be genuine, current and easy for the officer to check.',
  },
  {
    title: 'Limited travel history',
    text: 'A first-time traveller with no previous international travel is not automatically refused, but travel history is one factor officers consider. A clear, well-documented purpose of travel matters more.',
  },
  {
    title: 'Applying for the wrong visa category',
    text: 'Applying for a visitor visa when your real purpose is work or study — or any mismatch between the visa type and your plans — leads to a refusal. Choosing the correct category is essential.',
  },
];

const avoid = [
  'Complete the DS-160 carefully and make sure every detail matches your documents.',
  'Show strong, specific ties to your home country — job, business, family, property, ongoing commitments.',
  'Provide clear, consistent proof of funds that you can explain at the interview.',
  'Prepare a realistic itinerary with dates, places and accommodation.',
  'Practise clear, honest, consistent answers — and never memorise a script.',
  'Choose the correct visa category for your real purpose of travel.',
  'Bring genuine, current supporting documents.',
  'Be open about any previous refusals or overstays instead of hiding them.',
];

const help = [
  {
    title: 'Refusal review',
    text: 'We read your refusal notice and the reasons behind it, then identify the weak points in your previous application.',
  },
  {
    title: 'Stronger application',
    text: 'We help you rebuild the application — DS-160, documents and funds — so it addresses the officer’s concerns.',
  },
  {
    title: 'Interview preparation',
    text: 'One-to-one practice so your answers are clear, honest and consistent with your paperwork.',
  },
  {
    title: 'Honest advice',
    text: 'Straight guidance on your options, including whether reapplying now is the right move.',
  },
];

const faqs = [
  {
    q: 'Why was my US visa refused?',
    a: 'The most common reason is INA 214(b) — the officer was not satisfied that you would return to your home country after your visit. Other common reasons include insufficient proof of funds, an unclear purpose of travel, inconsistent answers or documents, a previous overstay, or applying in the wrong visa category.',
  },
  {
    q: 'Can I reapply after a USA visa refusal?',
    a: 'Yes. In most cases you can reapply, but simply reapplying with the same application usually leads to the same result. You should first understand the reason for the refusal and address it with stronger evidence before you apply again.',
  },
  {
    q: 'What does a 214(b) refusal mean?',
    a: '214(b) means the officer was not convinced you qualify as a genuine temporary visitor — typically because they were not satisfied you would return home. It is not a permanent ban, but you will need to present a stronger case if you reapply.',
  },
  {
    q: 'What is a 221(g) refusal?',
    a: '221(g) is not a final refusal — it usually means the consulate needs more information or additional administrative processing before deciding. You will normally be told what to submit or that your case is under review.',
  },
  {
    q: 'How soon can I apply again?',
    a: 'There is generally no fixed waiting period for reapplying after a 214(b) refusal, but reapplying immediately with the same information is rarely helpful. It is better to strengthen your application first.',
  },
  {
    q: 'Will a refusal affect future visa applications?',
    a: 'A previous refusal is part of your record and must be declared honestly. It does not automatically bar you, but the officer will see it, so a stronger, consistent application is important.',
  },
  {
    q: 'Can a consultant guarantee my US visa will be approved?',
    a: 'No. No consultant, document or service can guarantee approval — the decision is made solely by the US authorities. What we can do is prepare an accurate, complete and well-supported application and help you avoid avoidable mistakes.',
  },
  {
    q: 'Should I use an agent or a lawyer after a refusal?',
    a: 'For straightforward visitor visa refusals, a preparation-focused consultant can help you rebuild the application. If your case involves criminal, security or immigration-law issues, you may need a qualified immigration lawyer.',
  },
];

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'USA Visa Rejection Reasons: Why US Visas Get Refused',
  description:
    'The most common USA visa rejection reasons — from insufficient ties and funds to inconsistent answers — plus what the refusal notice means and how to strengthen a reapplication.',
  author: { '@type': 'Organization', name: 'A Visa Experts', url: 'https://avisaexperts.com' },
  publisher: {
    '@type': 'Organization',
    name: 'A Visa Experts',
    logo: { '@type': 'ImageObject', url: 'https://avisaexperts.com/images/user/tmlogo%201.webp' },
  },
  mainEntityOfPage: { '@type': 'WebPage', '@id': 'https://avisaexperts.com/usa-visa/rejection-reasons' },
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
      name: 'USA Visa Rejection Reasons',
      item: 'https://avisaexperts.com/usa-visa/rejection-reasons',
    },
  ],
};

const UsaRejectionReasons = () => (
  <LandingLayout>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
    />

    <div className="spage">
      {/* Hero */}
      <section className="spage-hero hero-usa">
        <div className="spage-hero-inner">
          <h1>USA Visa Rejection Reasons: Why US Visas Get Refused</h1>
          <p>
            A US visa refusal is stressful — but it is rarely the end of the road. Understanding exactly why the
            application was refused is the first step to fixing it. This guide covers the most common USA visa
            rejection reasons, what your refusal notice means, and how to build a stronger application next time.
          </p>
          <div className="spage-btns">
            <a className="spage-btn primary" href={BOOK_URL}>
              Get Refusal Support
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
          <h2>Why US visas get refused</h2>
          <p>
            Every US visa decision is made by a consular officer. The officer&rsquo;s job is to decide whether your
            application is genuine and whether you qualify under US immigration law. A refusal usually means the officer
            was not satisfied on one or more points — not that you can never travel to the United States.
          </p>
          <p>
            The most important thing after a refusal is to understand the <strong>reason</strong>. Without that, most
            people simply reapply with the same application and get the same result. Read your refusal notice carefully
            and use the guidance below to identify the weak points.
          </p>
          <p>
            If you are still preparing your first application, start with our guides to the{' '}
            <Link className="spage-link" href="/usa-visa">
              USA visitor visa
            </Link>{' '}
            and{' '}
            <Link className="spage-link" href="/usa-visa/processing-time">
              USA visa processing time
            </Link>
            .
          </p>
        </div>
      </section>

      {/* Reasons */}
      <section className="spage-section">
        <div className="spage-wrap">
          <h2>The most common USA visa rejection reasons</h2>
          {reasons.map((r) => (
            <div key={r.title}>
              <h3>{r.title}</h3>
              <p>{r.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Refusal notice */}
      <section className="spage-section">
        <div className="spage-wrap">
          <h2>What does your refusal notice mean?</h2>
          <p>The refusal notice tells you which section of US immigration law was applied to your case:</p>
          <div className="spage-note">
            <h3>214(b) — not a genuine temporary visitor</h3>
            <p>
              The most common refusal for visitor and tourist visas. It means the officer was not satisfied that you
              would return to your home country after your visit, or that you qualify for the visa. It is not a
              permanent ban — you can reapply, but with a stronger case.
            </p>
          </div>
          <div className="spage-note">
            <h3>221(g) — additional information or administrative processing</h3>
            <p>
              This is usually not a final refusal. The consulate needs more information or time to review your case.
              You will normally be told what to submit, or that your case is under administrative processing.
            </p>
          </div>
          <div className="spage-note">
            <h3>Other ineligibilities</h3>
            <p>
              Criminal, security, health-related or immigration-fraud grounds can make an applicant inadmissible. These
              are legal matters and usually need specific professional advice.
            </p>
          </div>
        </div>
      </section>

      {/* Reapply */}
      <section className="spage-section">
        <div className="spage-wrap">
          <h2>Can you reapply after a USA visa refusal?</h2>
          <p>
            In most cases, yes. A 214(b) refusal is not a permanent ban, and there is generally no fixed waiting period
            before you can apply again. However, reapplying straight away with the same information rarely changes the
            outcome.
          </p>
          <p>
            The right approach is to understand the reason for the refusal, fix the weak points, and then apply with a
            clearer, more consistent and better-supported application. If your refusal involved a legal ineligibility,
            get specific advice before you apply again.
          </p>
          <div className="spage-btns left spage-mt-16">
            <a className="spage-btn primary" href={BOOK_URL}>
              Review My Refusal
            </a>
          </div>
        </div>
      </section>

      {/* Avoid */}
      <section className="spage-section">
        <div className="spage-wrap">
          <h2>How to avoid a US visa refusal</h2>
          <ul className="spage-list">
            {avoid.map((a) => (
              <li key={a}>{a}</li>
            ))}
          </ul>
          <p className="spage-mt-16">
            See also our{' '}
            <Link className="spage-link" href="/blog/usa-visa-document-checklist">
              USA visa document checklist
            </Link>{' '}
            and{' '}
            <Link
              className="spage-link"
              href="/blog/usa-visitor-visa-interview-questions-for-indians-complete-guide-2025"
            >
              USA visa interview questions
            </Link>
            .
          </p>
        </div>
      </section>

      {/* How we help */}
      <section className="spage-section">
        <div className="spage-wrap">
          <h2>How A Visa Experts helps after a refusal</h2>
          <div className="spage-cards">
            {help.map((c) => (
              <div className="spage-card" key={c.title}>
                <h3>{c.title}</h3>
                <p>{c.text}</p>
              </div>
            ))}
          </div>
          <p className="spage-subnote">
            No consultant, document or service can guarantee USA visa approval. The final decision is made solely by the
            US authorities.
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="spage-section">
        <div className="spage-wrap">
          <h2>USA visa refusal FAQs</h2>
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
          <h2>Refused a US visa? Let&rsquo;s fix it together.</h2>
          <p>
            Book a consultation with a USA visa expert at A Visa Experts. We&rsquo;ll review your refusal, identify the
            weak points and build a stronger application for your next attempt.
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

export default UsaRejectionReasons;
