'use client';

import LandingLayout from '../LandingLayout';

const whatTheyDo = [
  'Assess your eligibility and recommend the right visa category',
  'Explain the current requirements for your destination',
  'Prepare a personalized document checklist',
  'Review your application for accuracy and consistency',
  'Guide you through appointments and interview preparation',
  'Keep you updated throughout the application process',
];

const expertise = [
  { title: 'Permanent Residency (PR)', text: 'Long-term settlement pathways and requirements.', href: '/services' },
  { title: 'Tourist & Visitor Visas', text: 'Tourism, visiting family or friends, and short stays.', href: '/tourist-visa' },
  { title: 'Business Visas (B-1/B-2)', text: 'Meetings, conferences and permitted business activities.', href: '/usa-visa/usa-b1b2-visa' },
  { title: 'Transit Visas', text: 'Short stops while travelling through a country.', href: '/transit-visa' },
  { title: 'Documentation & Interviews', text: 'Document checklists and interview preparation.', href: '/consultants' },
];

const whyUs = [
  'Experienced immigration lawyers and visa consultants',
  'Personalized guidance based on your profile and destination',
  'Transparent communication at every stage',
  'Multi-language support, including English, Hindi and Punjabi',
  'Support from the first consultation through the application journey',
];

const faqs = [
  {
    q: 'Are your advisors immigration lawyers?',
    a: 'Our team includes immigration lawyers and visa consultants with experience across visitor, business and permanent residency applications. You can see the current advisors on our advisors page.',
  },
  {
    q: 'What can an immigration consultant help with?',
    a: 'An immigration consultant can help you understand visa requirements, choose the right category, prepare documents, review your application and prepare for appointments or interviews.',
  },
  {
    q: 'Is the first consultation free?',
    a: 'You can talk to our advisors for free consultation on the platform. Availability depends on the advisor and the time of day.',
  },
  {
    q: 'Which countries do your advisors cover?',
    a: 'Our advisors provide guidance for popular destinations including the USA, UK, Canada, Australia and Europe, among others.',
  },
  {
    q: 'Can an advisor guarantee my visa?',
    a: 'No. No consultant, lawyer or service can guarantee a visa outcome. The final decision is made by the relevant immigration authorities.',
  },
  {
    q: 'How do I talk to an advisor?',
    a: 'Visit our advisors page to connect with an immigration lawyer or visa consultant by chat, call or video, based on availability.',
  },
];

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'ProfessionalService',
  name: 'A Visa Experts — Immigration Lawyers & Visa Consultants',
  url: 'https://avisaexperts.com/immigration-lawyers',
  image: 'https://avisaexperts.com/images/user/tmlogo%201.webp',
  description:
    'Immigration lawyers and visa consultants helping applicants with permanent residency, tourist, business and transit visa applications for the USA, UK, Canada, Australia and Europe.',
  areaServed: ['IN', 'US', 'GB', 'CA', 'AU', 'EU'],
  serviceType: 'Immigration & Visa Consulting',
  founder: { '@type': 'Person', name: 'Kaveesh Kapoor' },
  sameAs: [
    'https://www.linkedin.com/company/a-visa-experts',
    'https://www.instagram.com/avisa.expert/',
    'https://www.facebook.com/profile.php?id=61590985693281',
    'https://www.youtube.com/@avisaexperts',
  ],
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
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://avisaexperts.com/home' },
    { '@type': 'ListItem', position: 2, name: 'Immigration Lawyers & Consultants', item: 'https://avisaexperts.com/immigration-lawyers' },
  ],
};

const ImmigrationLawyers = () => {
  const navigate = (p) => window.location.assign(p);

  return (
    <LandingLayout>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <div className="spage">
        {/* Hero */}
        <section className="spage-hero" style={{ backgroundImage: "url('/images/user/popularplace3 1.webp')" }}>
          <div className="spage-hero-inner">
            <h1>Immigration Lawyers &amp; Visa Consultants at A Visa Experts</h1>
            <p>
              Our team of immigration lawyers, visa consultants and documentation specialists helps applicants
              understand visa requirements and prepare stronger applications for the USA, UK, Canada, Australia and
              Europe.
            </p>
            <div className="spage-btns">
              <button className="spage-btn primary" onClick={() => navigate('/consultants')}>
                Talk to an Advisor
              </button>
            </div>
          </div>
        </section>

        {/* Who */}
        <section className="spage-section" id="who">
          <div className="spage-wrap">
            <h2>Who Are Our Immigration Advisors?</h2>
            <p>
              A Visa Experts brings together immigration lawyers, visa consultants and documentation specialists with
              experience across visitor, business and permanent residency applications.
            </p>
            <p>
              Our advisors guide applicants at every stage — from eligibility assessment to documentation, application
              preparation and interview readiness.
            </p>
          </div>
        </section>

        {/* What they do */}
        <section className="spage-section" id="what-they-do">
          <div className="spage-wrap">
            <h2>What Our Immigration Lawyers &amp; Consultants Do</h2>
            <ul className="spage-list">
              {whatTheyDo.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </div>
        </section>

        {/* Expertise */}
        <section className="spage-section" id="expertise">
          <div className="spage-wrap">
            <h2>Areas of Expertise</h2>
            <div className="spage-cards">
              {expertise.map((c, i) => (
                <div className="spage-card" key={i}>
                  <h3>{c.title}</h3>
                  <p>{c.text}</p>
                  <a className="spage-link" href={c.href}>
                    Learn more
                  </a>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Why choose */}
        <section className="spage-section" id="why">
          <div className="spage-wrap">
            <h2>Why Applicants Choose Our Advisors</h2>
            <ul className="spage-list">
              {whyUs.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
            <p>
              Learn more about our approach on the{' '}
              <a className="spage-link" href="/immigration-laws">immigration laws guide</a>.
            </p>
          </div>
        </section>

        {/* Talk */}
        <section className="spage-section" id="talk">
          <div className="spage-wrap">
            <h2>Talk to an Immigration Advisor</h2>
            <p>
              Connect with our immigration lawyers and visa consultants for guidance on your application. You can chat,
              call or start a video consultation with an available advisor.
            </p>
            <div className="spage-btns left" style={{ marginTop: '8px' }}>
              <button className="spage-btn dark" onClick={() => navigate('/consultants')}>
                View Advisors &amp; Chat
              </button>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="spage-section" id="faq">
          <div className="spage-wrap">
            <h2>Frequently Asked Questions About Immigration Lawyers &amp; Consultants</h2>
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

        {/* CTA */}
        <section className="spage-cta" id="need-help">
          <h2>Need Help From an Immigration Lawyer or Consultant?</h2>
          <p>
            Whether you are applying for a visitor or permanent residency visa, our advisors can help you
            understand the requirements and prepare your application more systematically.
          </p>
          <div className="spage-btns">
            <button className="spage-btn primary" onClick={() => navigate('/consultants')}>
              Talk to an Advisor
            </button>
          </div>
        </section>
      </div>
    </LandingLayout>
  );
};

export default ImmigrationLawyers;
