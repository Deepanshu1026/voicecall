'use client';

import LandingLayout from '../LandingLayout';

const docRows = [
  ['Valid Passport', 'Identity and international travel'],
  ['DS-160 Confirmation', 'Visa application record'],
  ['Appointment Confirmation', 'Interview appointment'],
  ['Bank Statements', 'Evidence of financial circumstances'],
  ['Salary Slips', 'Employment and income evidence'],
  ['ITR / Tax Documents', 'Financial and tax information'],
  ['Employment Proof', 'Evidence of professional ties'],
  ['Business Documents', 'Relevant business information, where applicable'],
  ['Travel Itinerary', 'Information about the planned trip'],
];

const requirements = [
  'Valid passport',
  'Completed DS-160 application form',
  'Visa application fee payment',
  'Clear purpose of travel',
  'Evidence of financial capability',
  'Employment or business information',
  'Evidence of ties to India',
  'Supporting documents relevant to your circumstances',
];

const steps = [
  {
    title: 'Step 1: Determine the Appropriate Visa Category',
    text: 'Understand whether your planned visit falls under the B-1, B-2, or B-1/B-2 visa category based on the purpose of your trip.',
  },
  {
    title: 'Step 2: Complete the DS-160 Form',
    text: 'Complete the DS-160 online application form with accurate personal, travel, employment, and background information.',
    link: { label: 'Read our DS-160 Guide', href: '/blog/ds-160-guide-a-simple-guide-for-usa-visa-applicants' },
  },
  {
    title: 'Step 3: Pay the Visa Application Fee',
    text: 'Pay the applicable USA visa application fee using the available payment process.',
    link: { label: 'Check the Latest USA Visa Fees', href: '#fees' },
  },
  {
    title: 'Step 4: Schedule Your Visa Appointment',
    text: 'After completing the required application steps, schedule your USA visa appointment according to the applicable process.',
    link: { label: 'Read the USA Visa Appointment Guide', href: '#how-to-apply' },
  },
  {
    title: 'Step 5: Prepare Your Documents',
    text: 'Keep your passport, application confirmation, appointment details, and relevant supporting documents ready before the interview.',
  },
  {
    title: 'Step 6: Attend the Visa Interview',
    text: 'Attend the USA visa interview and answer the consular officer\u2019s questions clearly and truthfully.',
    link: { label: 'Read USA Visa Interview Tips', href: '#interview' },
  },
  {
    title: 'Step 7: Wait for the Visa Decision',
    text: 'After the interview, the application will be processed according to the applicable procedure. Processing times can vary depending on individual circumstances and other factors.',
    link: { label: 'Check USA Visa Processing Time', href: '#processing' },
  },
];

const interviewQuestions = [
  'Why do you want to visit the USA?',
  'What is the purpose of your trip?',
  'How long do you plan to stay?',
  'Who will pay for your trip?',
  'What do you do for work?',
  'Where will you stay in the USA?',
  'Do you have relatives or friends in the USA?',
  'Why will you return to India?',
];

const refusalReasons = [
  'Inconsistent or unclear information',
  'Unclear purpose of travel',
  'Insufficient evidence supporting the application',
  'Financial circumstances that do not adequately support the proposed trip',
  'Insufficient evidence of ties to the home country',
  'Previous immigration or visa-related concerns',
];

const faqs = [
  {
    q: 'What is a USA Tourist Visa?',
    a: 'A USA Tourist Visa generally refers to the B-2 visa category, which is used by eligible travelers for tourism and other permitted temporary visitor purposes.',
  },
  {
    q: 'What is the difference between a Visitor Visa and a Tourist Visa?',
    a: 'A tourist visa generally refers to travel for tourism under the B-2 category, while visitor visa is a broader term that can include permitted tourism, visiting family or friends, and certain other temporary visitor purposes.',
  },
  {
    q: 'What is a B1/B2 Visa?',
    a: 'A B1/B2 visa can cover eligible temporary business and tourism-related travel.',
  },
  {
    q: 'How much bank balance is required for a USA Tourist Visa?',
    a: 'There is no single fixed bank balance amount that guarantees approval. Financial circumstances should reasonably support the planned trip and should be considered together with the applicant\u2019s overall circumstances.',
  },
  {
    q: 'Do I need an invitation letter for a USA Tourist Visa?',
    a: 'An invitation letter may be relevant in some circumstances, but having an invitation letter alone does not guarantee visa approval.',
  },
  {
    q: 'Is USA Tourist Visa approval guaranteed?',
    a: 'No. Visa approval cannot be guaranteed by a consultant, agent, document, or service.',
  },
  {
    q: 'How long does a USA Tourist Visa take?',
    a: 'Processing and appointment timelines can vary. Applicants should check the latest official information and appointment availability when planning their application.',
  },
];

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: 'USA Visitor Visa & Tourist Visa Services',
  provider: {
    '@type': 'Organization',
    name: 'A Visa Experts',
    url: 'https://avisaexperts.com',
  },
  description:
    'USA Visitor Visa and Tourist Visa guidance from A Visa Experts, including B-1/B-2 categories, requirements, documents, DS-160, fees, processing time and interview preparation.',
  serviceType: 'USA Visitor Visa & Tourist Visa Consulting',
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

const UsaVisitorVisa = () => {
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
        <section className="spage-hero" style={{ backgroundImage: "url('/images/user/statueofliberty 1.webp')" }}>
          <div className="spage-hero-inner">
            <h1>USA Visitor Visa &amp; Tourist Visa from India</h1>
            <p>
              Planning to visit the United States for tourism, visiting family or friends, or certain business
              activities? A USA Visitor Visa allows eligible travelers to visit the United States temporarily for
              permitted purposes. For tourism-related travel, applicants generally apply under the B-2 visa category,
              while the B-1/B-2 visa can cover permitted business and tourism purposes.
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
              At AvisaExperts, we provide guidance throughout the USA visa application process, including understanding
              visa requirements, preparing supporting documents, completing the DS-160, scheduling an appointment, and
              preparing for the visa interview.
            </p>
            <div className="spage-btns left" style={{ marginTop: '8px' }}>
              <button className="spage-btn dark" onClick={() => navigate('/appointment')}>
                Get Expert Guidance for Your USA Visitor Visa or Tourist Visa
              </button>
            </div>
          </div>
        </section>

        {/* What is a USA Visitor Visa? */}
        <section className="spage-section" id="visitor-visa">
          <div className="spage-wrap">
            <h2>What is a USA Visitor Visa?</h2>
            <p>
              A USA Visitor Visa is a nonimmigrant visa for eligible travelers who want to visit the United States
              temporarily for purposes such as tourism, visiting family or friends, or certain business activities.
            </p>
            <p>
              For tourism, the B-2 visa is generally used for permitted tourist and visitor activities. The B-1 visa is
              generally used for permitted temporary business activities, while the combined B-1/B-2 visa can cover both
              eligible business and tourism purposes.
            </p>
            <p>
              If you are planning a short trip to the United States, understanding the appropriate visa category and
              application requirements is an important first step.
            </p>
            <a className="spage-link" href="#types">Learn more about the USA B1/B2 Visa</a>
          </div>
        </section>

        {/* What is a USA Tourist Visa? */}
        <section className="spage-section" id="tourist-visa">
          <div className="spage-wrap">
            <h2>What is a USA Tourist Visa?</h2>
            <p>
              A USA Tourist Visa is generally associated with the B-2 visitor visa category and is used by eligible
              travelers visiting the United States temporarily for tourism and other permitted visitor purposes.
            </p>
            <p>
              Depending on the circumstances, travelers may use a B-2 visa for activities such as tourism, holidays,
              visiting family or friends, or other permitted temporary visitor activities.
            </p>
            <p>
              Applicants should understand the purpose of their trip and choose the appropriate visa category before
              starting their application.
            </p>
            <a className="spage-link" href="/blog/usa-tourist-visa">Read the complete USA Tourist Visa Guide</a>
          </div>
        </section>

        {/* Types */}
        <section className="spage-section" id="types">
          <div className="spage-wrap">
            <h2>Types of USA Visitor and Tourist Visa</h2>
            <div className="spage-cards">
              <div className="spage-card">
                <h3>B-1 Business Visa</h3>
                <p>
                  The B-1 visa is intended for eligible temporary business activities such as attending meetings,
                  conferences, consultations, or other permitted business activities.
                </p>
              </div>
              <div className="spage-card">
                <h3>B-2 Tourist Visa</h3>
                <p>
                  The B-2 visa is generally used for tourism, holidays, visiting family or friends, and certain other
                  permitted temporary visitor purposes.
                </p>
              </div>
              <div className="spage-card">
                <h3>B-1/B-2 Visa</h3>
                <p>
                  The B-1/B-2 visa combines permitted business and tourism purposes and is commonly used by eligible
                  travelers whose trips may involve both purposes.
                </p>
              </div>
            </div>
            <a className="spage-link" href="/blog/usa-visit-visa-from-india-b1b2-visa-guide-for-indian-travelers">
              Explore our USA B1/B2 Visa Guide
            </a>
          </div>
        </section>

        {/* Requirements */}
        <section className="spage-section" id="requirements">
          <div className="spage-wrap">
            <h2>USA Visitor Visa and Tourist Visa Requirements</h2>
            <p>
              Before applying for a USA Visitor Visa or Tourist Visa, applicants should understand the applicable
              requirements and prepare appropriate supporting information. Common requirements may include:
            </p>
            <ul className="spage-list">
              {requirements.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
            <p>
              The documents required can vary depending on the applicant&apos;s individual circumstances. Providing
              accurate and consistent information throughout the application is important.
            </p>
            <a className="spage-link" href="#documents">Check the complete USA Visa Requirements</a>
          </div>
        </section>

        {/* Documents */}
        <section className="spage-section" id="documents">
          <div className="spage-wrap">
            <h2>Documents Required for USA Tourist and Visitor Visa</h2>
            <p>
              Preparing the right documents can make your USA visa application more organized. The documents you may need
              can depend on your personal, professional, financial, and travel circumstances.
            </p>
            <table className="spage-table">
              <thead>
                <tr>
                  <th>Document</th>
                  <th>Purpose</th>
                </tr>
              </thead>
              <tbody>
                {docRows.map((row, i) => (
                  <tr key={i}>
                    <td>{row[0]}</td>
                    <td>{row[1]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p>
              Applicants should prepare documents according to their individual circumstances rather than relying on a
              fixed document list.
            </p>
            <a className="spage-link" href="/blog/usa-visa-document-checklist">
              View the complete USA Visa Document Checklist
            </a>
          </div>
        </section>

        {/* How to Apply */}
        <section className="spage-section" id="how-to-apply">
          <div className="spage-wrap">
            <h2>How to Apply for a USA Visitor or Tourist Visa</h2>
            <p>
              The USA Visitor Visa and Tourist Visa application process involves several important steps. Applicants
              should complete each stage carefully and provide accurate information.
            </p>
            <ol className="spage-steps">
              {steps.map((s, i) => (
                <li key={i}>
                  <strong>{s.title}</strong>
                  <span>{s.text}</span>
                  {s.link && (
                    <a className="spage-link" href={s.link.href}>
                      {s.link.label}
                    </a>
                  )}
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Interview Questions */}
        <section className="spage-section" id="interview">
          <div className="spage-wrap">
            <h2>USA Tourist Visa Interview Questions</h2>
            <p>
              The USA tourist visa interview is an important part of the application process. Applicants should be
              prepared to clearly explain their travel plans, purpose of visit, financial circumstances, and reasons for
              returning to India. Common questions may include:
            </p>
            <ul className="spage-list">
              {interviewQuestions.map((q, i) => (
                <li key={i}>{q}</li>
              ))}
            </ul>
            <p>Your answers should be truthful, clear, and consistent with your application.</p>
            <a
              className="spage-link"
              href="/blog/usa-visitor-visa-interview-questions-for-indians-complete-guide-2025"
            >
              Read our USA Visa Interview Questions and Answers Guide
            </a>
          </div>
        </section>

        {/* Fees */}
        <section className="spage-section" id="fees">
          <div className="spage-wrap">
            <h2>USA Tourist Visa Fees</h2>
            <p>
              The USA Tourist Visa fee depends on the applicable visa category and the current U.S. government fee
              structure.
            </p>
            <p>
              Visa fees and other charges can change, so applicants should always check the latest official fee
              information before making payment.
            </p>
            <a className="spage-link" href="/consultants">Check the Latest USA Visa Fees</a>
          </div>
        </section>

        {/* Processing Time */}
        <section className="spage-section" id="processing">
          <div className="spage-wrap">
            <h2>USA Tourist Visa Processing Time</h2>
            <p>
              The USA Tourist Visa processing time can vary depending on factors such as appointment availability,
              application circumstances, administrative processing, and consular workload.
            </p>
            <p>
              Because processing times can change, applicants should avoid relying on a fixed number of days when
              planning international travel.
            </p>
            <a className="spage-link" href="#processing">Check USA Visa Processing Time</a>
          </div>
        </section>

        {/* Refusal Reasons */}
        <section className="spage-section" id="refusal">
          <div className="spage-wrap">
            <h2>Common Reasons for USA Tourist Visa Refusal</h2>
            <p>
              A USA Tourist Visa or Visitor Visa application can be refused for different reasons depending on the
              applicant&apos;s individual circumstances. Some common concerns may include:
            </p>
            <ul className="spage-list">
              {refusalReasons.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
            <p className="spage-subnote">
              No consultant, document, or service can guarantee USA visa approval. The final decision is made by the
              appropriate U.S. authorities.
            </p>
            <a className="spage-link" href="#refusal">Read Common USA Visa Rejection Reasons</a>
          </div>
        </section>

        {/* FAQ */}
        <section className="spage-section" id="faq">
          <div className="spage-wrap">
            <h2>Frequently Asked Questions About USA Visitor and Tourist Visa</h2>
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
          <h2>Need Help With Your USA Visitor or Tourist Visa?</h2>
          <p>
            Preparing a USA Visitor Visa or Tourist Visa application can be confusing, especially when you are unsure
            about the visa category, documents, DS-160, appointment, or interview preparation. AvisaExperts can help you
            understand the USA visa application process and prepare your application more systematically.
          </p>
          <div className="spage-btns">
            <button className="spage-btn primary" onClick={() => navigate('/appointment')}>
              Get Expert Guidance for Your USA Visitor or Tourist Visa
            </button>
          </div>
        </section>
      </div>
    </LandingLayout>
  );
};

export default UsaVisitorVisa;
