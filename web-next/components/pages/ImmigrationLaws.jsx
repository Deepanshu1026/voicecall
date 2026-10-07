'use client';

import LandingLayout from '../LandingLayout';

const countryCards = [
  {
    title: 'United States',
    text: 'Visitor (B-1/B-2), business, work and other nonimmigrant visa categories for the USA.',
    href: '/usa-visa',
  },
  {
    title: 'United Kingdom',
    text: 'Standard Visitor Visa and other UK immigration and settlement routes.',
    href: '/uk-visa',
  },
  {
    title: 'Canada',
    text: 'Visitor (TRV), work permits and permanent residency pathways for Canada.',
    href: '/canada-visa',
  },
  {
    title: 'Australia',
    text: 'Visitor, business and skilled migration options for Australia.',
    href: '/services',
  },
  {
    title: 'Europe',
    text: 'Schengen and European visa guidance for travel, business and long stays.',
    href: '/services',
  },
];

const categories = [
  'Work Visas — for eligible employment or business purposes.',
  'Permanent Residency (PR) — long-term settlement pathways.',
  'Tourist & Visitor Visas — tourism, visiting family or friends, or short stays.',
  'Business Visas — meetings, conferences and permitted business activities.',
  'Transit Visas — short stops while travelling through a country.',
];

const eligibility = [
  'A valid passport',
  'A clear purpose of travel',
  'Financial capability to support the trip',
  'Employment or business information',
  'Ties to your home country',
  'Accurate and consistent documentation',
];

const assessment = [
  'Genuine purpose that matches the visa category',
  'Consistency across your application and documents',
  'Sufficient funds for the planned stay',
  'Intent to comply with visa conditions and return',
];

const help = [
  'Eligibility assessment based on your profile and destination',
  'Documentation guidance and checklist',
  'Application preparation and review',
  'Appointment and interview preparation',
  'Updates throughout your application journey',
];

const faqs = [
  {
    q: 'What are immigration laws?',
    a: 'Immigration laws are the rules that govern how foreign nationals can enter, stay, work and settle in a country. They define visa categories, eligibility, documentation and pathways to permanent residency.',
  },
  {
    q: 'What is the difference between a visa and immigration?',
    a: 'A visa generally permits entry and a temporary stay for a specific purpose, while immigration usually refers to longer-term or permanent settlement in a country.',
  },
  {
    q: 'Which countries can I immigrate to?',
    a: 'Many countries offer visitor, work and permanent residency routes. Popular destinations include the USA, UK, Canada, Australia and Europe, each with its own rules and eligibility criteria.',
  },
  {
    q: 'What is permanent residency?',
    a: 'Permanent residency (PR) allows an eligible person to live and often work in a country on an ongoing basis, subject to that country\u2019s rules and conditions.',
  },
  {
    q: 'Do immigration laws change?',
    a: 'Yes. Immigration rules, fees and processing times change frequently. Applicants should always check the latest official requirements for their destination.',
  },
  {
    q: 'How long does immigration take?',
    a: 'Timelines vary widely depending on the country, visa category and individual circumstances. Applicants should avoid relying on a fixed number of days when planning.',
  },
  {
    q: 'Can A Visa Experts help with immigration?',
    a: 'Yes. We provide guidance on visa categories, documentation, application preparation and interview preparation for popular destinations, based on current requirements.',
  },
];

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: 'Immigration & Visa Guidance',
  provider: {
    '@type': 'Organization',
    name: 'A Visa Experts',
    url: 'https://avisaexperts.com',
  },
  description:
    'Guidance on immigration laws and visa categories for the USA, UK, Canada, Australia and Europe, including eligibility, documentation and application preparation.',
  serviceType: 'Immigration & Visa Consulting',
  areaServed: ['US', 'GB', 'CA', 'AU', 'EU', 'IN'],
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
    { '@type': 'ListItem', position: 2, name: 'Immigration Laws', item: 'https://avisaexperts.com/immigration-laws' },
  ],
};

const ImmigrationLaws = () => {
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
        <section className="spage-hero" style={{ backgroundImage: "url('/images/user/popularplace2 1.webp')" }}>
          <div className="spage-hero-inner">
            <h1>Immigration Laws 2026: Complete Guide for the USA, UK, Canada &amp; Australia</h1>
            <p>
              Immigration laws decide who can enter, live, work and settle in a country. They cover visa categories,
              eligibility, documentation and permanent residency. This guide explains the key rules for popular
              destinations and how to approach your application with confidence.
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
              Immigration laws vary from country to country and can change over time. Understanding the requirements for
              your destination helps you prepare a stronger, more organized application and avoid common mistakes.
            </p>
          </div>
        </section>

        {/* What are immigration laws */}
        <section className="spage-section" id="what-are-immigration-laws">
          <div className="spage-wrap">
            <h2>What Are Immigration Laws?</h2>
            <p>
              Immigration laws are the rules that govern how foreign nationals can enter, stay, work and settle in a
              country. They define visa categories, eligibility criteria, documentation requirements, duration of stay
              and pathways to permanent residency or citizenship.
            </p>
            <p>
              These rules are set by each country&apos;s government and can change. Applicants should always check the
              latest official requirements for their destination before applying.
            </p>
          </div>
        </section>

        {/* By country */}
        <section className="spage-section" id="by-country">
          <div className="spage-wrap">
            <h2>Immigration &amp; Visa Rules by Country</h2>
            <p>Each destination has its own immigration rules and visa categories. Explore guidance for popular countries:</p>
            <div className="spage-cards">
              {countryCards.map((c, i) => (
                <div className="spage-card" key={i}>
                  <h3>{c.title}</h3>
                  <p>{c.text}</p>
                  <a className="spage-link" href={c.href}>
                    View {c.title} guidance
                  </a>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Categories */}
        <section className="spage-section" id="categories">
          <div className="spage-wrap">
            <h2>Common Visa &amp; Immigration Categories</h2>
            <p>Most countries organise immigration through different visa categories based on the purpose of travel:</p>
            <ul className="spage-list">
              {categories.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
            <a className="spage-link" href="/services">Explore our visa services</a>
          </div>
        </section>

        {/* Changes */}
        <section className="spage-section" id="changes">
          <div className="spage-wrap">
            <h2>Immigration Laws Change — Stay Updated</h2>
            <p>
              Immigration policies, visa fees and processing times change frequently. Rules that applied last year may be
              different today, and relying on outdated information can lead to delays or refusals.
            </p>
            <p>
              We track updates and guide you based on the current requirements for your destination. Always confirm the
              latest official information before you apply.
            </p>
            <a
              className="spage-link"
              href="/blog/immigration-india-2026-complete-guide-to-uk-immigration-us-immigration-canada-immigration-australia-immigration-with-latest-immigration-news"
            >
              Read the latest immigration updates
            </a>
          </div>
        </section>

        {/* Eligibility */}
        <section className="spage-section" id="eligibility">
          <div className="spage-wrap">
            <h2>Eligibility &amp; Documents</h2>
            <p>
              While requirements differ by country and visa type, applicants are generally expected to show:
            </p>
            <ul className="spage-list">
              {eligibility.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
            <p>
              The exact documents depend on your profile and the visa category you are applying for. Providing accurate
              and consistent information is essential.
            </p>
          </div>
        </section>

        {/* How laws affect application */}
        <section className="spage-section" id="affect">
          <div className="spage-wrap">
            <h2>How Immigration Laws Affect Your Application</h2>
            <p>
              Immigration officers assess whether your purpose, circumstances and documents align with the visa you are
              applying for. Key factors often include:
            </p>
            <ul className="spage-list">
              {assessment.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
            <p className="spage-subnote">
              No consultant, document or service can guarantee a visa outcome. The final decision is made by the relevant
              immigration authorities.
            </p>
          </div>
        </section>

        {/* How we help */}
        <section className="spage-section" id="how-we-help">
          <div className="spage-wrap">
            <h2>How A Visa Experts Helps</h2>
            <p>
              A Visa Experts provides clear, personalized guidance to help applicants understand their visa requirements
              and navigate the application process with confidence.
            </p>
            <ul className="spage-list">
              {help.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
            <p>
              <a className="spage-link" href="/immigration-lawyers">Meet our immigration lawyers &amp; consultants</a>{' '}
              or{' '}
              <a className="spage-link" href="/consultants">talk to an advisor</a>.
            </p>
          </div>
        </section>

        {/* FAQ */}
        <section className="spage-section" id="faq">
          <div className="spage-wrap">
            <h2>Frequently Asked Questions About Immigration Laws</h2>
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
          <h2>Need Guidance on Immigration &amp; Visa Laws?</h2>
          <p>
            Whether you are planning a short visit, a work move or long-term settlement, understanding the current rules
            is the first step. A Visa Experts can help you prepare your application more systematically.
          </p>
          <div className="spage-btns">
            <button className="spage-btn primary" onClick={() => navigate('/appointment')}>
              Book a Free Consultation
            </button>
          </div>
        </section>
      </div>
    </LandingLayout>
  );
};

export default ImmigrationLaws;
