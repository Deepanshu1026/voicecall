'use client';

import LandingLayout from '../LandingLayout';

const b1b2Rows = [
  ['Main purpose', 'Business', 'Tourism and visitor activities'],
  ['Business meetings', 'Yes, where permitted', 'No'],
  ['Tourism', 'No as the primary purpose', 'Yes'],
  ['Visiting family/friends', 'No as the primary purpose', 'Yes'],
  ['Conferences', 'Certain business/professional conferences', 'Certain permitted visitor activities'],
  ['Employment in USA', 'Not permitted', 'Not permitted'],
];

const b1Activities = [
  'Attending business meetings',
  'Participating in business consultations',
  'Attending professional or business conferences',
  'Negotiating contracts',
  'Meeting business associates',
  'Participating in certain professional activities permitted under the B-1 category',
];

const b2Activities = [
  'Tourism and sightseeing',
  'Taking a vacation in the USA',
  'Visiting family or friends',
  'Certain social visits',
  'Certain permitted medical treatment',
  'Participating in certain recreational activities',
];

const allowedB1 = [
  'Business meetings',
  'Consultations with business associates',
  'Professional conferences',
  'Negotiating contracts',
  'Certain business-related activities permitted under U.S. immigration rules',
];

const allowedB2 = [
  'Tourism',
  'Sightseeing',
  'Vacation',
  'Visiting relatives or friends',
  'Certain medical treatment',
  'Certain recreational or social activities',
];

const notAllowed = [
  'Taking up employment in the USA',
  'Taking up employment with a U.S. employer',
  'Permanently living in the United States',
  'Using a visitor visa for purposes that require a different visa category',
];

const whoCanExplain = [
  'Why they want to visit the USA',
  'What they plan to do during the trip',
  'How long they intend to stay',
  'Their circumstances and plans relevant to the temporary visit',
];

const interviewQuestions = [
  'Why do you want to visit the USA?',
  'Are you traveling for business or tourism?',
  'Which company or organization are you visiting?',
  'Who are you planning to meet?',
  'Where will you stay in the USA?',
  'How long do you plan to stay?',
  'Who will pay for your trip?',
  'What do you do in India?',
  'Have you traveled internationally before?',
];

const faqs = [
  {
    q: 'Is B1/B2 the same as a tourist visa?',
    a: 'Not exactly. B-2 is the visitor/tourism classification, while B-1 is for certain temporary business activities. A B1/B2 visa combines both classifications.',
  },
  {
    q: 'Can I use a B1/B2 Visa for a vacation?',
    a: 'Yes. The B-2 purpose generally covers eligible tourism and vacation activities.',
  },
  {
    q: 'Can I attend business meetings on a B1/B2 Visa?',
    a: 'The B-1 classification can cover certain permitted temporary business activities, including eligible business meetings.',
  },
  {
    q: 'Does a B1/B2 Visa allow employment in the USA?',
    a: 'No. A B1/B2 Visa does not generally authorize regular employment in the United States.',
  },
  {
    q: 'Can I visit my family in the USA with a B1/B2 Visa?',
    a: 'Yes. Visiting family or friends can generally fall under the B-2 visitor purpose, subject to the applicable requirements.',
  },
  {
    q: 'Can I use B1/B2 for both business and tourism?',
    a: 'Yes. A B1/B2 combination visa can cover eligible temporary business and tourism purposes.',
  },
  {
    q: 'Does B1/B2 Visa validity mean I can stay in the USA for the entire validity period?',
    a: 'No. Visa validity and authorized length of stay are different. The period you may remain in the USA is determined separately when you are admitted.',
  },
];

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: 'USA B1/B2 Visa Services',
  provider: {
    '@type': 'Organization',
    name: 'A Visa Experts',
    url: 'https://avisaexperts.com',
  },
  description:
    'USA B1/B2 Visa guidance from A Visa Experts for eligible temporary business and tourism travel, including B-1 and B-2 purposes, application and interview preparation.',
  serviceType: 'USA B1/B2 Visa Consulting',
  areaServed: 'US',
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

const UsaB1B2Visa = () => {
  const navigate = (p) => window.location.assign(p);

  return (
    <LandingLayout>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <div className="spage">
        {/* Hero */}
        <section className="spage-hero" style={{ backgroundImage: "url('/images/user/carousel3img 1.webp')" }}>
          <div className="spage-hero-inner">
            <h1>USA B1/B2 Visa from India</h1>
            <p>
              The USA B1/B2 Visa is a nonimmigrant visa category for people who want to travel to the United States
              temporarily for eligible business or tourism purposes. It combines the B-1 Business Visa and B-2 Visitor
              Visa under one visa classification.
            </p>
            <div className="spage-btns">
              <button className="spage-btn primary" onClick={() => navigate('/appointment')}>
                Get Expert Guidance
              </button>
            </div>
          </div>
        </section>

        {/* Intro */}
        <section className="spage-section">
          <div className="spage-wrap">
            <p>
              A B1/B2 Visa can be relevant if you are planning a short-term business visit, attending a business meeting
              or conference, taking a holiday, sightseeing, or visiting family and friends in the USA.
            </p>
          </div>
        </section>

        {/* What Does B1/B2 Mean */}
        <section className="spage-section" id="meaning">
          <div className="spage-wrap">
            <h2>What Does B1/B2 Visa Mean?</h2>
            <p>B1/B2 refers to two different purposes of temporary travel to the United States:</p>
            <ul className="spage-list">
              <li>
                <strong>B-1 Visa:</strong> For permitted temporary business activities.
              </li>
              <li>
                <strong>B-2 Visa:</strong> For tourism and other permitted visitor activities.
              </li>
            </ul>
            <p>When both purposes are applicable, a traveler may be issued a B-1/B-2 combination visa.</p>
            <p>
              The visa does not give permission to live permanently in the United States. Your activities in the
              USA must remain within the purpose permitted by your visa.
            </p>
            <p>
              For general visitor visa information, you can read our{' '}
              <a className="spage-link" href="/usa-visa">USA Visitor Visa Guide</a>.
            </p>
          </div>
        </section>

        {/* B-1 Business Visa */}
        <section className="spage-section" id="b1">
          <div className="spage-wrap">
            <h2>What is a B-1 Business Visa?</h2>
            <p>The B-1 Business Visa is intended for certain temporary business activities in the United States.</p>
            <p>Examples of activities that may fall under B-1 include:</p>
            <ul className="spage-list">
              {b1Activities.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
            <p>
              The B-1 category is for temporary business activities and does not generally allow employment in the USA.
            </p>
          </div>
        </section>

        {/* B-2 Visitor Visa */}
        <section className="spage-section" id="b2">
          <div className="spage-wrap">
            <h2>What is a B-2 Visitor Visa?</h2>
            <p>The B-2 Visa is generally used for temporary tourism and visitor activities. Examples include:</p>
            <ul className="spage-list">
              {b2Activities.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
            <p>
              If your main purpose is tourism, you can also read our{' '}
              <a className="spage-link" href="/blog/usa-tourist-visa">USA Tourist Visa Guide</a> for more information.
            </p>
          </div>
        </section>

        {/* B-1 vs B-2 */}
        <section className="spage-section" id="difference">
          <div className="spage-wrap">
            <h2>B-1 vs B-2 Visa: What is the Difference?</h2>
            <p>Although both categories are temporary visitor visas, their purposes are different.</p>
            <div className="spage-table-wrap">
              <table className="spage-table">
                <thead>
                  <tr>
                    <th>Feature</th>
                    <th>B-1 Visa</th>
                    <th>B-2 Visa</th>
                  </tr>
                </thead>
                <tbody>
                  {b1b2Rows.map((row, i) => (
                    <tr key={i}>
                      <td>{row[0]}</td>
                      <td>{row[1]}</td>
                      <td>{row[2]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p>
              A B1/B2 Visa can cover both eligible business and tourism purposes, depending on the circumstances of the
              traveler.
            </p>
          </div>
        </section>

        {/* When to apply */}
        <section className="spage-section" id="when">
          <div className="spage-wrap">
            <h2>When Should You Apply for a B1/B2 Visa?</h2>
            <p>A B1/B2 Visa may be relevant when your planned temporary visit involves business, tourism, or both. For example:</p>
            <p>
              <strong>Business Trip:</strong> You are traveling to the USA to attend business meetings, consultations,
              or a conference.
            </p>
            <p>
              <strong>Tourist Trip:</strong> You are traveling to the USA for a holiday, sightseeing, or to visit
              family or friends.
            </p>
            <p>
              <strong>Business + Tourism:</strong> You have a business meeting during your trip and also plan to spend
              some time sightseeing or visiting family.
            </p>
            <p>
              The correct visa category depends on the actual purpose of your travel and your individual circumstances.
            </p>
          </div>
        </section>

        {/* Allowed activities */}
        <section className="spage-section" id="allowed">
          <div className="spage-wrap">
            <h2>Activities Allowed on a B1/B2 Visa</h2>
            <p>The activities you can undertake depend on whether you are traveling under the B-1 or B-2 purpose.</p>
            <h3>B-1 Activities</h3>
            <p>Permitted temporary business activities can include:</p>
            <ul className="spage-list">
              {allowedB1.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
            <h3>B-2 Activities</h3>
            <p>Permitted visitor activities can include:</p>
            <ul className="spage-list">
              {allowedB2.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
            <p>Always make sure your planned activities are permitted under the applicable visa category.</p>
          </div>
        </section>

        {/* Not allowed */}
        <section className="spage-section" id="not-allowed">
          <div className="spage-wrap">
            <h2>Activities Not Allowed on a B1/B2 Visa</h2>
            <p>
              A B1/B2 Visa does not authorize regular employment in the United States.
              Generally, you should not use a B1/B2 Visa for activities such as:
            </p>
            <ul className="spage-list">
              {notAllowed.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
            <p>
              If your purpose of travel is different from tourism, visiting, or permitted temporary business activities,
              you should determine whether another U.S. visa category is required.
            </p>
          </div>
        </section>

        {/* Who can apply */}
        <section className="spage-section" id="who-can-apply">
          <div className="spage-wrap">
            <h2>Who Can Apply for a B1/B2 Visa?</h2>
            <p>
              People who need to travel to the United States temporarily for an eligible business or visitor purpose may
              apply for the appropriate visa. Applicants should be able to clearly explain:
            </p>
            <ul className="spage-list">
              {whoCanExplain.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
            <p>
              Applicants must provide accurate information in their visa application and during the interview, if an
              interview is required.
            </p>
            <p>
              For broader eligibility information, check our{' '}
              <a className="spage-link" href="/usa-visa#requirements">USA Visa Requirements Guide</a>.
            </p>
          </div>
        </section>

        {/* Validity */}
        <section className="spage-section" id="validity">
          <div className="spage-wrap">
            <h2>B1/B2 Visa Validity and Duration of Stay</h2>
            <p>Visa validity and length of stay are not the same thing.</p>
            <p>
              The validity period of a visa determines the period during which the visa can generally be used to request
              admission to the United States. It does not mean that you can remain in the USA for the entire validity
              period.
            </p>
            <p>The length of your authorized stay is determined separately when you are admitted to the United States.</p>
            <p>
              Therefore, having a B1/B2 Visa valid for several years does not automatically mean you can stay in the USA
              for several years.
            </p>
          </div>
        </section>

        {/* Both purposes */}
        <section className="spage-section" id="business-tourism">
          <div className="spage-wrap">
            <h2>Can You Travel for Both Business and Tourism on a B1/B2 Visa?</h2>
            <p>Yes, a B1/B2 combination visa can be used for eligible temporary business and tourism purposes.</p>
            <p>
              For example, you may travel to the USA for a permitted business meeting and also undertake permitted
              tourism activities during the same trip.
            </p>
            <p>
              However, your activities must remain within the activities permitted under the applicable B-1 or B-2
              classification.
            </p>
          </div>
        </section>

        {/* Interview */}
        <section className="spage-section" id="interview">
          <div className="spage-wrap">
            <h2>B1/B2 Visa Interview</h2>
            <p>
              If you are required to attend a visa interview, the consular officer may ask questions to understand your
              travel purpose and circumstances. For a B1/B2 application, questions may include:
            </p>
            <ul className="spage-list">
              {interviewQuestions.map((q, i) => (
                <li key={i}>{q}</li>
              ))}
            </ul>
            <p>
              Keep your answers short, clear, and truthful. Your answers should be consistent with the information in
              your application.
            </p>
            <p>
              For detailed preparation, read our{' '}
              <a
                className="spage-link"
                href="/blog/usa-visitor-visa-interview-questions-for-indians-complete-guide-2025"
              >
                USA Visa Interview Questions and Answers Guide
              </a>
              .
            </p>
          </div>
        </section>

        {/* FAQ */}
        <section className="spage-section" id="faq">
          <div className="spage-wrap">
            <h2>Frequently Asked Questions About USA B1/B2 Visa</h2>
            <div className="spage-faq">
              {faqs.map((f, i) => (
                <details key={i}>
                  <summary>{f.q}</summary>
                  <p>{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* Need help */}
        <section className="spage-cta" id="need-help">
          <h2>Need Help With Your USA B1/B2 Visa?</h2>
          <p>
            Understanding whether your trip falls under the B-1 business purpose, B-2 visitor purpose, or both can help
            you prepare your application correctly. AvisaExperts can assist you with understanding the USA B1/B2 Visa
            process, documentation, application preparation, and interview preparation.
          </p>
          <div className="spage-btns">
            <button className="spage-btn primary" onClick={() => navigate('/appointment')}>
              Contact AvisaExperts for USA B1/B2 Visa Assistance
            </button>
          </div>
        </section>
      </div>
    </LandingLayout>
  );
};

export default UsaB1B2Visa;
