'use client';

import LandingLayout from '../LandingLayout';

const UsaVisitorVisa = () => {
  const navigate = (p) => window.location.assign(p);

  const slides = [
    { country: 'USA', img: '/images/user/carousel3img 1.webp' },
    { country: 'New York', img: '/images/user/statueofliberty 1.webp' },
    { country: 'USA', img: '/images/user/popularplace3 1.webp' },
  ];

  const stats = [
    { value: '7+ Years', label: 'Experience' },
    { value: '99%', label: 'Success Rate' },
    { value: '40+', label: 'Legal Visa Experts' },
    { value: '2 Lakh+', label: 'Followers' },
  ];

  const assistance = [
    'Profile assessment',
    'USA Visitor Visa application guidance',
    'DS-160 assistance',
    'Personalized document checklist',
    'Financial document guidance',
    'Business travel documentation',
    'Appointment assistance',
    'Visa interview preparation',
    'Application review',
    'End-to-end case support',
  ];

  const steps = [
    {
      title: 'Understand Your Profile',
      text: 'We learn about your travel purpose, professional background, financial profile and previous travel history.',
    },
    {
      title: 'Build Your Application',
      text: 'Our team guides you through the required information and documentation for your USA Visitor Visa application.',
    },
    {
      title: 'Prepare Your Documents',
      text: 'From financial documents to business or travel-related supporting papers, we help you organize your application properly.',
    },
    {
      title: 'DS-160 & Appointment Guidance',
      text: 'Get step-by-step assistance with your DS-160 and visa appointment process.',
    },
    {
      title: 'Prepare for Your Interview',
      text: 'We help you understand the interview process and prepare for questions related to your travel plans, business activities and personal circumstances.',
    },
    {
      title: 'Stay Updated',
      text: 'Our team keeps you informed about important updates throughout your application journey.',
    },
  ];

  const businessActivities = [
    'Attending business meetings',
    'Meeting clients or business associates',
    'Attending conferences and seminars',
    'Participating in eligible business events',
    'Negotiating business arrangements',
    'Exploring business opportunities',
    'Visiting a US business partner',
  ];

  const strongPoints = [
    {
      title: 'Clear Travel Purpose',
      text: 'Your reason for visiting the USA should be genuine, clear and supported by appropriate documentation.',
    },
    {
      title: 'Strong Financial Profile',
      text: 'Your financial documents should demonstrate your ability to support your planned trip.',
    },
    {
      title: 'Professional Background',
      text: 'Your employment or business profile can help establish your circumstances and purpose of travel.',
    },
    {
      title: 'Travel History',
      text: 'Previous international travel and compliance with immigration rules may form part of your overall profile.',
    },
    {
      title: 'Proper Documentation',
      text: 'Accurate and consistent information across your application and supporting documents is essential.',
    },
    {
      title: 'Interview Preparation',
      text: 'Being prepared to clearly explain your travel plans can help you approach your interview with confidence.',
    },
  ];

  const docGroups = [
    {
      title: 'Personal Documents',
      items: [
        'Valid passport',
        'Recent photograph, where applicable',
        'DS-160 confirmation',
        'Visa appointment confirmation',
      ],
    },
    {
      title: 'Financial Documents',
      items: [
        'Bank statements',
        'Income documents',
        'Salary slips, where applicable',
        'Income tax documents, where applicable',
        'Other financial supporting documents',
      ],
    },
    {
      title: 'Professional / Business Documents',
      items: [
        'Employment proof',
        'Business registration documents, if applicable',
        'Company profile, if applicable',
        'Business invitation or meeting details, if applicable',
        'Conference or event details, if applicable',
      ],
    },
    {
      title: 'Travel Documents',
      items: [
        'Proposed travel itinerary',
        'Accommodation details, if available',
        'Invitation documents, if applicable',
        'Previous travel and visa documents',
      ],
    },
  ];

  const interviewQuestions = [
    'Why are you visiting the USA?',
    'What is the purpose of your business trip?',
    'Who are you meeting?',
    'How long do you plan to stay?',
    'Who will cover your travel expenses?',
    'What do you do professionally?',
    'What are your plans after your visit?',
  ];

  const faqs = [
    {
      q: 'What is a USA Visitor Visa?',
      a: 'A USA Visitor Visa is a temporary visa for eligible individuals travelling to the United States for permitted purposes such as tourism, visiting family or friends, or certain temporary business activities.',
    },
    {
      q: 'Can I visit the USA for business purposes?',
      a: 'Yes, a Visitor Visa may cover certain temporary business activities, such as attending meetings, conferences or negotiating business arrangements, subject to applicable US immigration rules.',
    },
    {
      q: 'Can I attend a business meeting in the USA?',
      a: 'Eligible temporary business meetings can generally be a permitted purpose of a business visitor, provided the activity complies with the applicable rules.',
    },
    {
      q: 'Do I need an invitation letter for a USA Visitor Visa?',
      a: 'An invitation letter may be useful depending on your circumstances and purpose of travel, but requirements vary from case to case.',
    },
    {
      q: 'How much bank balance is required for a USA Visitor Visa?',
      a: 'There is no single fixed bank-balance amount that guarantees approval. Your financial situation should reasonably support your proposed travel plans and overall circumstances.',
    },
    {
      q: 'Is a USA Visitor Visa guaranteed after applying?',
      a: 'No visa can be guaranteed. Each application is assessed based on the applicant\u2019s circumstances and applicable US visa requirements.',
    },
    {
      q: 'How long does the USA Visitor Visa process take?',
      a: 'Processing and appointment times can vary depending on the applicant\u2019s location, appointment availability and other circumstances.',
    },
    {
      q: 'How can your team help?',
      a: 'We provide profile assessment, documentation guidance, DS-160 assistance, appointment guidance, interview preparation and end-to-end application support.',
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
      title: 'Interview Preparation',
      text: 'Get practical preparation before your USA Visitor Visa interview.',
    },
    {
      title: '2 Lakh+ Followers',
      text: 'A growing community that follows our visa and immigration guidance.',
    },
  ];

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: 'USA Visitor Visa Services',
    provider: {
      '@type': 'Organization',
      name: 'A Visa Experts',
      url: 'https://avisaexperts.com',
    },
    description:
      'Expert USA Visitor Visa assistance including profile assessment, DS-160 guidance, documentation support and interview preparation.',
    serviceType: 'USA Visitor Visa Consulting',
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
            <span className="visa-hero-badge">USA Visitor Visa</span>
            <h1>USA Visitor Visa</h1>
            <p>
              Your USA journey starts with the right visa guidance. Planning a business visit, attending meetings,
              exploring opportunities, or visiting the USA for a short stay? Our USA Visitor Visa experts help you
              navigate the application process with professional guidance, accurate documentation and personalized
              support.
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
                <img src="/images/user/popularplace3 1.webp" alt="USA Visitor Visa" />
              </div>
              <div className="visa-about-content">
                <span className="visa-label">USA Visitor Visa</span>
                <h2>Your USA Journey Starts With the Right Visa Guidance</h2>
                <p>
                  Planning a business visit, attending meetings, exploring opportunities, or visiting the USA for a
                  short stay? Our USA Visitor Visa experts help you navigate the application process with professional
                  guidance, accurate documentation and personalized support&mdash;so you can focus on planning your trip
                  while we help you prepare your visa application.
                </p>
                <div className="visa-stats">
                  {stats.map((stat, idx) => (
                    <div className="visa-stat" key={idx}>
                      <strong>{stat.value}</strong>
                      <span>{stat.label}</span>
                    </div>
                  ))}
                </div>
                <div className="visa-callout">
                  <h3>Planning Your USA Visit?</h3>
                  <p>Let&apos;s make your visa process simple.</p>
                  <button className="visa-about-button" onClick={() => navigate('/appointment')}>
                    Book a Free Consultation
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="visa-section visa-primary">
          <div className="visa-container">
            <div className="visa-section-header">
              <span className="visa-label">Why Choose Us</span>
              <h2>Why Choose Us for Your USA Visitor Visa?</h2>
              <p>A successful visa application starts with the right preparation.</p>
            </div>
            <p className="visa-lead">
              From understanding your profile to preparing your documents and getting you ready for the interview, our
              team provides complete guidance at every stage.
            </p>
            <h3 className="visa-subhead">Our USA Visitor Visa Assistance Includes:</h3>
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
              <h2>How We Help You Get Ready for Your USA Visit</h2>
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
              <h2>USA Visitor Visa for Business Travel</h2>
              <p>Visit the USA for Your Business Needs</p>
            </div>
            <p className="visa-lead">
              Planning to travel to the USA for eligible business activities? A USA Visitor Visa may be relevant for
              temporary business activities such as:
            </p>
            <div className="visa-doc-list">
              {businessActivities.map((item, idx) => (
                <div className="visa-doc-item" key={idx}>
                  <span className="visa-doc-check">&#10003;</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
            <p className="visa-lead" style={{ marginTop: '28px' }}>
              We help you prepare your application around your genuine purpose of travel and supporting documentation.
            </p>
          </div>
        </section>

        {/* Strong Application */}
        <section className="visa-section visa-dark">
          <div className="visa-container">
            <div className="visa-section-header">
              <span className="visa-label">Strong Application</span>
              <h2>What Makes a Strong USA Visitor Visa Application?</h2>
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
              <h2>Documents Required for USA Visitor Visa</h2>
              <p>Your exact requirements may vary depending on your profile and purpose of travel.</p>
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

        {/* Interview */}
        <section className="visa-section visa-white">
          <div className="visa-container">
            <div className="visa-section-header">
              <span className="visa-label">Interview</span>
              <h2>USA Visitor Visa Interview Preparation</h2>
              <p>Walk Into Your Interview Prepared &amp; Confident</p>
            </div>
            <p className="visa-lead">
              The visa interview is an important part of the application process. Our team helps you prepare for
              questions related to:
            </p>
            <div className="visa-doc-list">
              {interviewQuestions.map((q, idx) => (
                <div className="visa-doc-item" key={idx}>
                  <span className="visa-doc-check">&#10003;</span>
                  <span>{q}</span>
                </div>
              ))}
            </div>
            <div className="visa-callout" style={{ maxWidth: '900px', margin: '28px auto 0' }}>
              <h3>Our Goal?</h3>
              <p>
                Help you understand your application clearly and present your genuine travel purpose with confidence.
              </p>
            </div>
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
        <section className="visa-section visa-primary">
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
            <h2>Ready to Visit the USA?</h2>
            <p>
              Your business trip starts with the right preparation. Whether you&apos;re attending a meeting, conference,
              business event or visiting the USA for another permitted temporary purpose, our team can help you prepare
              your Visitor Visa application. Plan your USA visit with confidence.
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
              USA Visitor Visa Assistance | Business Visit Guidance | Documentation Support | Interview Preparation
            </p>
          </div>
        </section>
      </div>
    </LandingLayout>
  );
};

export default UsaVisitorVisa;
