'use client';

import LandingLayout from '../LandingLayout';

const CanadaVisitorVisa = () => {
  const navigate = (p) => window.location.assign(p);

  const slides = [
    { country: 'Canada', img: '/images/user/popularplace2 1.webp' },
    { country: 'Canada', img: '/images/user/stratch2 1.webp' },
    { country: 'Canada', img: '/images/user/canada 1.webp' },
    { country: 'Canada', img: '/images/user/stratch2 1.webp' },
    { country: 'Canada', img: '/images/user/popularplace2 1.webp' },
  ];

  const stats = [
    { value: '7+ Years', label: 'Experience' },
    { value: '99%', label: 'Success Rate' },
    { value: '40+', label: 'Legal Visa Experts' },
    { value: '2 Lakh+', label: 'Followers' },
  ];

  const assistance = [
    'Profile assessment',
    'Canada Visitor Visa application guidance',
    'Online application guidance',
    'Personalized document checklist',
    'Financial document guidance',
    'Business travel documentation',
    'Invitation letter guidance',
    'Biometrics guidance',
    'Application review',
    'End-to-end case support',
  ];

  const steps = [
    {
      title: 'Understand Your Profile',
      text: 'We understand your travel purpose, professional background, financial profile and previous travel history.',
    },
    {
      title: 'Build Your Application',
      text: 'Our experts guide you through the information and supporting documents relevant to your Canada Visitor Visa application.',
    },
    {
      title: 'Prepare Your Documents',
      text: 'We help you organize your financial, professional, travel and supporting documents properly.',
    },
    {
      title: 'Online Application Guidance',
      text: 'Get step-by-step assistance with your Canada Visitor Visa application and document submission.',
    },
    {
      title: 'Biometrics Guidance',
      text: 'We help you understand the biometrics process and guide you through the required steps.',
    },
    {
      title: 'Stay Updated',
      text: 'Our team keeps you informed about important updates throughout your application journey.',
    },
  ];

  const businessActivities = [
    'Attending business meetings',
    'Meeting Canadian clients or business associates',
    'Attending conferences and events',
    'Participating in eligible business activities',
    'Visiting a Canadian business partner',
    'Discussing or negotiating business arrangements',
    'Participating in eligible short-term business activities',
  ];

  const strongPoints = [
    {
      title: 'Clear Travel Purpose',
      text: 'Your reason for visiting Canada should be genuine, clear and supported by appropriate documentation.',
    },
    {
      title: 'Strong Financial Profile',
      text: 'Your financial documents should reasonably demonstrate that you can support yourself during your planned stay.',
    },
    {
      title: 'Strong Home-Country Ties',
      text: 'Your personal, professional and financial circumstances should support the temporary nature of your visit.',
    },
    {
      title: 'Professional Background',
      text: 'Your employment or business background can help establish your circumstances and purpose of travel.',
    },
    {
      title: 'Travel History',
      text: 'Previous travel, visas and travel records may form part of your overall application.',
    },
    {
      title: 'Proper Documentation',
      text: 'Accurate and consistent information across your application and supporting documents is essential.',
    },
  ];

  const docGroups = [
    {
      title: 'Personal Documents',
      items: [
        'Valid passport',
        'Relevant passport pages',
        'Application confirmation',
        'Previous passports and visas',
        'Other documents applicable to your application',
      ],
    },
    {
      title: 'Financial Documents',
      items: [
        'Bank statements',
        'Proof of funds',
        'Income documents',
        'Salary slips, where applicable',
        'Income tax documents, where applicable',
        'Other relevant financial documents',
      ],
    },
    {
      title: 'Professional / Business Documents',
      items: [
        'Employment proof',
        'Employer letter, where applicable',
        'Business registration documents, if applicable',
        'Company profile, if applicable',
        'Business invitation letter, if applicable',
        'Conference or event details, if applicable',
      ],
    },
    {
      title: 'Travel Documents',
      items: [
        'Proposed travel itinerary',
        'Accommodation details, if available',
        'Invitation letter, if applicable',
        'Previous travel records',
        'Other supporting travel documents',
      ],
    },
  ];

  const biometricsPoints = [
    'Online application process',
    'Document submission',
    'Biometrics requirements',
    'Biometrics appointment guidance',
    'Supporting documents',
    'Application updates',
    'Additional document requests, where applicable',
  ];

  const gcmsUnderstand = [
    'Application processing history',
    'Officer notes and comments, where disclosed',
    'Information recorded on your immigration file',
    'Assessment information available in the records',
    'Previous application information',
    'Information that may help you understand a refusal or delay',
  ];

  const gcmsWho = [
    {
      title: 'Previous Refusal',
      text: 'Understand available information in your immigration file following a previous refusal.',
    },
    {
      title: 'Delayed Application',
      text: 'Review available information about your application beyond the standard online status.',
    },
    {
      title: 'Planning to Reapply',
      text: 'Understand available file information before preparing a future application.',
    },
    {
      title: 'Previous Canada Application',
      text: 'Review records associated with a previous Canadian immigration application.',
    },
  ];

  const faqs = [
    {
      q: 'What is a Canada Visitor Visa?',
      a: 'A Canada Visitor Visa, also known as a Temporary Resident Visa (TRV), allows eligible travellers to seek entry to Canada as a visitor.',
    },
    {
      q: 'Can I visit Canada for business purposes?',
      a: 'Eligible business visitors may travel to Canada for certain temporary business activities, subject to Canadian immigration requirements.',
    },
    {
      q: 'Can I attend a business meeting in Canada?',
      a: 'Business meetings can be an eligible business-visitor activity when the applicable requirements are met.',
    },
    {
      q: 'Do I need an invitation letter for a Canada Visitor Visa?',
      a: 'An invitation letter may be relevant depending on your circumstances and purpose of travel.',
    },
    {
      q: 'How much bank balance is required for a Canada Visitor Visa?',
      a: 'There is no single fixed bank-balance amount that guarantees approval. Your financial situation should reasonably support your proposed travel plans and circumstances.',
    },
    {
      q: 'Do I need to give biometrics?',
      a: 'Some applicants are required to provide fingerprints and a photograph. Requirements depend on individual circumstances.',
    },
    {
      q: 'What are GCMS Notes?',
      a: "GCMS Notes are records from Canada's Global Case Management System that may contain information related to an immigration application, subject to applicable disclosure rules.",
    },
    {
      q: 'What are CAIPS Notes?',
      a: 'CAIPS is an older term associated with Canadian immigration case records and is still commonly used when referring to Canadian immigration file notes.',
    },
    {
      q: 'Are GCMS Notes and CAIPS Notes the same?',
      a: 'The terms are often used interchangeably when discussing Canadian immigration file notes. GCMS is the current case-management system, while CAIPS is an older terminology.',
    },
    {
      q: 'Can GCMS / CAIPS Notes guarantee visa approval?',
      a: 'No. GCMS / CAIPS Notes provide available information from an immigration file, but they do not guarantee approval of a future application.',
    },
    {
      q: 'How long does the Canada Visitor Visa process take?',
      a: 'Processing times can vary depending on the application, location, completeness and other circumstances.',
    },
    {
      q: 'Is Canada Visitor Visa approval guaranteed?',
      a: "No visa outcome can be guaranteed. Each application is assessed according to applicable Canadian immigration requirements and the applicant's circumstances.",
    },
    {
      q: 'How can your team help?',
      a: 'We provide profile assessment, application guidance, documentation support, business-visit guidance, biometrics guidance, GCMS / CAIPS Notes assistance and end-to-end application support.',
    },
  ];

  const whyUs = [
    {
      title: '7+ Years of Experience',
      text: 'Professional experience in helping applicants navigate visa processes.',
    },
    {
      title: '40+ Legal Visa Experts',
      text: 'A dedicated team providing structured support throughout your application.',
    },
    {
      title: 'Personalized Guidance',
      text: 'Your application is reviewed according to your individual profile and travel purpose.',
    },
    {
      title: 'Complete Documentation Support',
      text: 'We help you understand and organize the documents relevant to your application.',
    },
    {
      title: 'Business Visit Guidance',
      text: 'Get guidance for eligible temporary business travel to Canada.',
    },
    {
      title: 'GCMS / CAIPS Notes Guidance',
      text: 'Get assistance understanding available information from your Canadian immigration file.',
    },
    {
      title: '2 Lakh+ Followers',
      text: 'A growing community that follows our visa and immigration guidance.',
    },
  ];

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: 'Canada Visitor Visa Services',
    provider: {
      '@type': 'Organization',
      name: 'A Visa Experts',
      url: 'https://avisaexperts.com',
    },
    description:
      'Expert Canada Visitor Visa assistance including profile assessment, online application guidance, documentation support, biometrics guidance and GCMS / CAIPS Notes assistance.',
    serviceType: 'Canada Visitor Visa Consulting',
    areaServed: 'CA',
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
      <div className="visa-page">
        {/* Hero */}
        <section className="visa-hero">
          <div className="visa-hero-bg">
            {slides.map((slide, idx) => (
              <div
                key={idx}
                className="visa-hero-slide"
                style={{ backgroundImage: `url('${slide.img}')`, animationDelay: `${idx * 4}s` }}
              >
                <span className="visa-hero-slide-label">{slide.country}</span>
              </div>
            ))}
          </div>
          <div className="visa-hero-content">
            <span className="visa-hero-badge">Canada Visitor Visa</span>
            <h1>Canada Visitor Visa</h1>
            <p>
              Your Canada journey starts with the right visa guidance. Planning a business visit, attending meetings, or
              visiting Canada for a short stay? Our experts make the process simple.
            </p>
            <div className="visa-hero-buttons">
              <button className="visa-hero-primary" onClick={() => navigate('/appointment')}>
                Book Consultation
              </button>
              <button className="visa-hero-secondary" onClick={() => navigate('/consultants')}>
                Talk to an Expert
              </button>
            </div>
          </div>
        </section>

        {/* Intro */}
        <section className="visa-section visa-white">
          <div className="visa-container">
            <div className="visa-about">
              <div className="visa-about-image">
                <img src="/images/user/canada 1.webp" alt="Canada Visitor Visa" />
              </div>
              <div className="visa-about-content">
                <span className="visa-label">Canada Visitor Visa</span>
                <h2>Your Canada Journey Starts With the Right Visa Guidance</h2>
                <p>
                  Planning a business visit, attending meetings, exploring opportunities, or visiting Canada for a short
                  stay?
                </p>
                <p>
                  Our Canada Visitor Visa experts help you navigate the application process with professional guidance,
                  accurate documentation and personalized support&mdash;so you can focus on planning your trip while we
                  help you prepare your visa application.
                </p>
                <button className="visa-about-button" onClick={() => navigate('/appointment')}>
                  Book a Free Consultation
                </button>
              </div>
            </div>

            <div className="visa-stats">
              {stats.map((stat, idx) => (
                <div className="visa-stat" key={idx}>
                  <strong>{stat.value}</strong>
                  <span>{stat.label}</span>
                </div>
              ))}
            </div>

            <div className="visa-callout visa-callout-wide">
              <div>
                <h3>Planning Your Canada Visit?</h3>
                <p>Let&apos;s make your visa process simple.</p>
              </div>
              <button className="visa-about-button" onClick={() => navigate('/appointment')}>
                Book a Free Consultation
              </button>
            </div>
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="visa-section visa-primary">
          <div className="visa-container">
            <div className="visa-section-header">
              <span className="visa-label">Why Choose Us</span>
              <h2>Why Choose Us for Your Canada Visitor Visa?</h2>
              <p>A successful visa application starts with the right preparation.</p>
            </div>
            <p className="visa-lead">
              From understanding your profile to preparing your documents and guiding you through the application
              process, our team provides complete support at every stage.
            </p>
            <h3 className="visa-subhead">Our Canada Visitor Visa Assistance Includes:</h3>
            <div className="visa-doc-list">
              {assistance.map((item, idx) => (
                <div className="visa-doc-item" key={idx}>
                  <span className="visa-doc-check">&#10003;</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
            <p className="visa-lead" style={{ marginTop: '28px' }}>
              One Application. One Dedicated Team. Complete Guidance.
            </p>
          </div>
        </section>

        {/* Process */}
        <section className="visa-section visa-light">
          <div className="visa-container">
            <div className="visa-section-header">
              <span className="visa-label">Process</span>
              <h2>How We Help You Get Ready for Your Canada Visit</h2>
            </div>
            <div className="visa-features-grid">
              {steps.map((step, idx) => (
                <div className="visa-feature" key={idx}>
                  <div className="visa-feature-number">{String(idx + 1).padStart(2, '0')}</div>
                  <h3>{step.title}</h3>
                  <p>{step.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Business Travel */}
        <section className="visa-section visa-white">
          <div className="visa-container">
            <div className="visa-section-header">
              <span className="visa-label">Business Travel</span>
              <h2>Canada Visitor Visa for Business Travel</h2>
              <p>Visit Canada for Your Business Needs</p>
            </div>
            <p className="visa-lead">
              Planning to travel to Canada for eligible temporary business activities? Business visitors may travel to
              Canada for permitted activities such as meetings, conferences, events and certain short-term business
              activities, subject to applicable Canadian immigration requirements.
            </p>
            <h3 className="visa-subhead">Business Visit Activities May Include:</h3>
            <div className="visa-doc-list">
              {businessActivities.map((item, idx) => (
                <div className="visa-doc-item" key={idx}>
                  <span className="visa-doc-check">&#10003;</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
            <p className="visa-lead" style={{ marginTop: '28px' }}>
              We help you prepare your application around your genuine purpose of travel and relevant supporting
              documentation.
            </p>
          </div>
        </section>

        {/* Strong Application */}
        <section className="visa-section visa-dark">
          <div className="visa-container">
            <div className="visa-section-header">
              <span className="visa-label">Strong Application</span>
              <h2>What Makes a Strong Canada Visitor Visa Application?</h2>
            </div>
            <div className="visa-highlights-grid">
              {strongPoints.map((point, idx) => (
                <div className="visa-highlight" key={idx}>
                  <h3>{point.title}</h3>
                  <p>{point.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Documents */}
        <section className="visa-section visa-light">
          <div className="visa-container">
            <div className="visa-section-header">
              <span className="visa-label">Documents</span>
              <h2>Documents Required for Canada Visitor Visa</h2>
              <p>Your exact requirements may vary depending on your profile, travel purpose and individual circumstances.</p>
            </div>
            <div className="visa-doc-groups">
              {docGroups.map((group, idx) => (
                <div className="visa-doc-group" key={idx}>
                  <h3>{group.title}</h3>
                  <ul>
                    {group.items.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Biometrics */}
        <section className="visa-section visa-white">
          <div className="visa-container">
            <div className="visa-section-header">
              <span className="visa-label">Biometrics</span>
              <h2>Canada Visitor Visa Biometrics</h2>
              <p>Prepare Every Step With Confidence</p>
            </div>
            <p className="visa-lead">
              Depending on your circumstances, you may need to provide fingerprints and a photograph as biometrics as
              part of your Canada Visitor Visa application. Our team helps you understand:
            </p>
            <div className="visa-doc-list">
              {biometricsPoints.map((item, idx) => (
                <div className="visa-doc-item" key={idx}>
                  <span className="visa-doc-check">&#10003;</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
            <div className="visa-callout" style={{ maxWidth: '900px', margin: '28px auto 0' }}>
              <h3>Our Goal?</h3>
              <p>Help you understand your application clearly and complete each stage with confidence.</p>
            </div>
          </div>
        </section>

        {/* GCMS / CAIPS */}
        <section className="visa-section visa-primary">
          <div className="visa-container">
            <div className="visa-section-header">
              <span className="visa-label">GCMS &amp; CAIPS Notes</span>
              <h2>Understand Your Canadian Immigration File Better</h2>
            </div>
            <p className="visa-lead">
              GCMS Notes / CAIPS Notes can provide information recorded in your Canadian immigration file, where
              disclosure is available under applicable rules.
            </p>
            <p className="visa-lead">
              GCMS stands for Global Case Management System, the current case-management system used by Canadian
              immigration authorities.
            </p>
            <p className="visa-lead">
              CAIPS is an older term that is still commonly used when referring to Canadian immigration file notes.
            </p>

            <h3 className="visa-subhead" style={{ marginTop: '48px' }}>
              What Can GCMS / CAIPS Notes Help You Understand?
            </h3>
            <div className="visa-doc-list">
              {gcmsUnderstand.map((item, idx) => (
                <div className="visa-doc-item" key={idx}>
                  <span className="visa-doc-check">&#10003;</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>

            <h3 className="visa-subhead" style={{ marginTop: '48px' }}>
              Who May Consider GCMS / CAIPS Notes?
            </h3>
            <div className="visa-highlights-grid">
              {gcmsWho.map((item, idx) => (
                <div className="visa-highlight" key={idx}>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </div>
              ))}
            </div>

            <div className="visa-callout visa-callout-wide" style={{ marginTop: '40px' }}>
              <div>
                <h3>Need Help With Your GCMS / CAIPS Notes?</h3>
                <p>
                  Our team can help you obtain and understand available GCMS / CAIPS information and explain how it may
                  relate to your future visa application.
                </p>
              </div>
              <button className="visa-about-button" onClick={() => navigate('/consultants')}>
                Get GCMS / CAIPS Notes Guidance &rarr;
              </button>
            </div>

            <p className="visa-disclaimer">
              GCMS / CAIPS Notes are government records and their availability and disclosure are subject to applicable
              Canadian privacy and access-to-information rules. Obtaining or reviewing these notes does not guarantee
              visa approval.
            </p>
          </div>
        </section>

        {/* FAQ */}
        <section className="visa-section visa-light">
          <div className="visa-container">
            <div className="visa-section-header">
              <span className="visa-label">FAQ</span>
              <h2>Frequently Asked Questions</h2>
            </div>
            <div className="visa-faq">
              {faqs.map((faq, idx) => (
                <details className="visa-faq-item" key={idx}>
                  <summary>
                    <span className="visa-faq-question">{faq.q}</span>
                    <span className="visa-faq-icon" aria-hidden="true" />
                  </summary>
                  <div className="visa-faq-answer">
                    <p>{faq.a}</p>
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* Why Thousands */}
        <section className="visa-section visa-light">
          <div className="visa-container">
            <div className="visa-section-header">
              <span className="visa-label">Why Us</span>
              <h2>Why Thousands Choose Our Visa Guidance</h2>
            </div>
            <div className="visa-features-grid">
              {whyUs.map((item, idx) => (
                <div className="visa-feature" key={idx}>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="visa-cta">
          <div className="visa-cta-inner">
            <h2>Ready to Visit Canada?</h2>
            <p>
              Your Canada trip starts with the right preparation. Whether you&apos;re attending a business meeting,
              conference, event or visiting Canada for another permitted temporary purpose, our team can help you prepare
              your Visitor Visa application. Plan your Canada visit with confidence.
            </p>
            <div className="visa-cta-buttons">
              <button className="visa-cta-primary" onClick={() => navigate('/appointment')}>
                Book a Free Consultation
              </button>
              <button className="visa-cta-secondary" onClick={() => navigate('/consultants')}>
                Talk to a Consultant
              </button>
            </div>
            <p className="visa-cta-tags">
              Canada Visitor Visa Assistance | Business Visit Guidance | Documentation Support | Biometrics Guidance |
              GCMS / CAIPS Notes Assistance
            </p>
          </div>
        </section>
      </div>
    </LandingLayout>
  );
};

export default CanadaVisitorVisa;
