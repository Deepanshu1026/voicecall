'use client';

import VisitorVisaPage from './VisitorVisaPage';

const biometricsPoints = [
  'Online application process',
  'Application form guidance',
  'Document submission',
  'Visa application centre appointment',
  'Biometrics requirements',
  'Supporting documents',
  'Additional document requests, where applicable',
  'Application updates',
];

const longTermOptions = [
  { title: '2 Years', text: 'For eligible applicants who regularly visit the UK.' },
  { title: '5 Years', text: 'For eligible frequent visitors.' },
  { title: '10 Years', text: 'For eligible applicants who regularly travel to the UK.' },
];

const processingSteps = [
  { title: 'Application Preparation', text: 'Review your information before submission.' },
  { title: 'Document Preparation', text: 'Organize relevant supporting documents.' },
  { title: 'Biometrics Appointment', text: 'Understand the appointment process.' },
  { title: 'Application Review', text: 'Check your application for consistency and completeness.' },
  { title: 'Updates', text: 'Stay informed about your application journey.' },
];

const data = {
  heroImage: '/images/user/uk 1.webp',
  title: 'UK Visitor Visa',
  heroText:
    'Your UK journey starts with the right visa guidance. Planning a business visit, attending meetings, or travelling to the UK for a short stay? Our experts make the process simple.',

  introHeading: 'Your UK Journey Starts With the Right Visa Guidance',
  introParas: [
    'Planning a business visit, attending meetings, exploring opportunities, visiting family, or travelling to the UK for a short stay?',
    'Our UK Visitor Visa experts help you navigate the application process with professional guidance, accurate documentation and personalized support\u2014so you can focus on planning your trip while we help you prepare your visa application.',
  ],
  stats: [
    { value: '7+ Years', label: 'Experience' },
    { value: '99%', label: 'Success Rate' },
    { value: '40+', label: 'Legal Visa Experts' },
    { value: '2 Lakh+', label: 'Followers' },
  ],
  planningText: "Planning Your UK Visit? Let's make your visa process simple.",

  whyHeading: 'Why Choose Us for Your UK Visitor Visa?',
  whyParas: [
    'A successful UK Visitor Visa application starts with the right preparation.',
    'From understanding your profile to preparing your documents and guiding you through the application process, our team provides complete support at every stage.',
  ],
  whySubhead: 'Our UK Visitor Visa Assistance Includes:',
  whyList: [
    'Profile assessment',
    'UK Standard Visitor Visa application guidance',
    'Online application assistance',
    'Personalized document checklist',
    'Financial document guidance',
    'Business visit documentation',
    'Invitation letter guidance',
    'Travel itinerary guidance',
    'Biometrics appointment guidance',
    'Application review',
    'End-to-end case support',
  ],
  whyClosing: 'One Application. One Dedicated Team. Complete Guidance.',

  processHeading: 'How We Help You Get Ready for Your UK Visit',
  steps: [
    {
      title: 'Understand Your Profile',
      text: 'We understand your travel purpose, professional background, financial profile and previous travel history.',
    },
    {
      title: 'Build Your Application',
      text: 'Our experts guide you through the information and supporting documents relevant to your UK Standard Visitor Visa application.',
    },
    {
      title: 'Prepare Your Documents',
      text: 'We help you organize your financial, professional, travel and supporting documents properly.',
    },
    {
      title: 'Online Application Guidance',
      text: 'Get step-by-step assistance with your UK Visitor Visa application and document submission.',
    },
    {
      title: 'Biometrics Guidance',
      text: 'We guide you through your visa application centre appointment, including the required biometric process.',
    },
    {
      title: 'Stay Updated',
      text: 'Our team keeps you informed about important updates throughout your application journey.',
    },
  ],

  businessHeading: 'UK Visitor Visa for Business Travel',
  businessSub: 'Visit the UK for Your Business Needs',
  businessText:
    'The UK Standard Visitor Visa allows eligible visitors to undertake certain permitted business activities for a temporary visit. Depending on the circumstances, permitted activities can include business meetings, conferences, seminars, negotiations, contract signing, promotional activities at trade fairs and site visits.',
  businessSubhead: 'Business Visit Activities May Include:',
  businessList: [
    'Attending business meetings',
    'Meeting UK clients or business associates',
    'Attending conferences and seminars',
    'Negotiating and signing contracts',
    'Attending trade fairs for promotional purposes',
    'Carrying out site visits and inspections',
    'Gathering information for overseas employment',
    'Participating in other permitted business activities',
  ],
  businessClosing:
    'We help you prepare your application around your genuine purpose of travel and relevant supporting documentation.',
  businessNote:
    'Standard Visitor rules do not permit general work in the UK. Activities must fall within the permitted visitor rules.',

  strongHeading: 'What Makes a Strong UK Visitor Visa Application?',
  strongPoints: [
    {
      title: 'Clear Travel Purpose',
      text: 'Your reason for visiting the UK should be genuine, clear and supported by appropriate documentation.',
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
      text: 'Your employment or business background can help demonstrate your circumstances and purpose of travel.',
    },
    {
      title: 'Travel History',
      text: 'Previous travel, visas and travel records may form part of your overall application.',
    },
    {
      title: 'Proper Documentation',
      text: 'Accurate and consistent information across your application and supporting documents is essential.',
    },
  ],
  strongNote:
    'UKVI guidance states that visitors should demonstrate that they are genuine visitors, will leave the UK at the end of their visit and can support themselves and cover relevant travel costs.',

  docsHeading: 'Documents Required for UK Visitor Visa',
  docsIntro: 'Your exact requirements may vary depending on your profile, travel purpose and individual circumstances.',
  docGroups: [
    {
      title: 'Personal Documents',
      items: [
        'Valid passport or travel document',
        'Previous passports, where relevant',
        'Previous visas and travel records',
        'UK visa application details',
        'Other documents applicable to your circumstances',
      ],
    },
    {
      title: 'Financial Documents',
      items: [
        'Bank statements',
        'Proof of funds',
        'Salary slips, where applicable',
        'Income documents',
        'Income tax documents, where applicable',
        'Evidence showing who is paying for the trip, where applicable',
      ],
    },
    {
      title: 'Professional / Business Documents',
      items: [
        'Employment proof',
        'Employer letter, where applicable',
        'Leave approval, where applicable',
        'Business registration documents, if applicable',
        'Company profile, if applicable',
        'UK invitation letter, if applicable',
        'Conference or event details, if applicable',
      ],
    },
    {
      title: 'Travel Documents',
      items: [
        'Proposed travel itinerary',
        'Accommodation details, where applicable',
        'Invitation letter, if applicable',
        'Details of your planned activities in the UK',
        'Previous travel records',
      ],
    },
  ],
  docsNote:
    "UKVI's supporting-document guidance emphasizes evidence of the purpose of the visit, the applicant's circumstances, ability to support the trip and intention to leave the UK.",

  faqHeading: 'Frequently Asked Questions',
  faqs: [
    {
      q: 'What is a UK Standard Visitor Visa?',
      a: 'The UK Standard Visitor Visa is for eligible people who want to visit the UK temporarily for permitted purposes such as tourism, visiting family or friends, or certain business activities.',
    },
    {
      q: 'Can I visit the UK for business purposes?',
      a: 'Yes. Eligible visitors can undertake certain permitted business activities under the Standard Visitor route, subject to the applicable rules.',
    },
    {
      q: 'Can I attend a business meeting in the UK?',
      a: 'Yes. Attending meetings is one of the permitted general business activities for visitors, subject to the applicable requirements.',
    },
    {
      q: 'Can I attend a conference in the UK?',
      a: 'Yes. Attending conferences and seminars can be permitted visitor activities, provided the applicable requirements are met.',
    },
    {
      q: 'Do I need an invitation letter for a UK Visitor Visa?',
      a: 'An invitation or supporting letter may be relevant depending on your purpose of travel and circumstances. It should accurately explain the nature of your visit.',
    },
    {
      q: 'How much bank balance is required for a UK Visitor Visa?',
      a: 'There is no single fixed bank-balance amount that guarantees approval. You need to demonstrate that you can reasonably support yourself and cover the costs of your visit.',
    },
    {
      q: 'Do I need to give biometrics?',
      a: 'If you are applying for a UK visa, you generally need to attend a visa application centre appointment and provide your fingerprints and photograph.',
    },
    {
      q: 'How long can I stay in the UK on a Standard Visitor Visa?',
      a: 'A Standard Visitor can generally stay for up to 6 months, subject to the applicable rules and conditions.',
    },
    {
      q: 'How long does a UK Visitor Visa take?',
      a: 'UKVI currently states that you will usually receive a decision within 3 weeks after completing the required application, identity and document steps, although processing can vary.',
    },
    {
      q: 'Is UK Visitor Visa approval guaranteed?',
      a: "No. Every application is assessed according to the applicable UK immigration rules and the applicant's individual circumstances.",
    },
    {
      q: 'How can your team help?',
      a: 'We provide profile assessment, application guidance, documentation support, business-visit guidance, biometrics guidance and end-to-end application support.',
    },
  ],

  whyUsHeading: 'Why Thousands Choose Our Visa Guidance',
  whyUs: [
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
      text: 'Get guidance for permitted temporary business activities in the UK.',
    },
    {
      title: 'Biometrics Guidance',
      text: 'Get step-by-step support for your visa application centre appointment.',
    },
    {
      title: '2 Lakh+ Followers',
      text: 'A growing community that follows our visa and immigration guidance.',
    },
  ],

  ctaHeading: 'Ready to Visit the UK?',
  ctaText:
    "Your UK trip starts with the right preparation. Whether you're attending a business meeting, conference, seminar, visiting family or travelling to the UK for another permitted temporary purpose, our team can help you prepare your Standard Visitor Visa application. Plan your UK visit with confidence.",
  ctaTags:
    'UK Visitor Visa Assistance | Business Visit Guidance | Documentation Support | Biometrics Guidance | Application Support',
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: 'UK Visitor Visa Services',
  provider: {
    '@type': 'Organization',
    name: 'A Visa Experts',
    url: 'https://avisaexperts.com',
  },
  description:
    'Expert UK Standard Visitor Visa assistance including profile assessment, online application guidance, documentation support, business-visit guidance and biometrics guidance.',
  serviceType: 'UK Visitor Visa Consulting',
  areaServed: 'GB',
};

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: data.faqs.map((faq) => ({
    '@type': 'Question',
    name: faq.q,
    acceptedAnswer: { '@type': 'Answer', text: faq.a },
  })),
};

const UkSections = () => (
  <>
    {/* Biometrics & Application Process */}
    <section className="spage-section">
      <div className="spage-wrap">
        <h2>UK Visitor Visa Biometrics &amp; Application Process</h2>
        <p>Prepare Every Step With Confidence</p>
        <p>
          If you need a UK Standard Visitor Visa, you apply online and attend an appointment at a visa application
          centre. At the appointment, you provide your identity documents and have your fingerprints and photograph
          taken as biometric information. Our team helps you understand:
        </p>
        <ul className="spage-list">
          {biometricsPoints.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
        <div className="spage-note">
          <h3>Our Goal?</h3>
          <p>Help you understand your application clearly and complete each stage with confidence.</p>
        </div>
      </div>
    </section>

    {/* Standard Visitor Visa */}
    <section className="spage-section">
      <div className="spage-wrap">
        <h2>UK Standard Visitor Visa</h2>
        <p>Visit the UK for Up to 6 Months</p>
        <p>
          A Standard Visitor Visa can generally allow eligible visitors to stay in the UK for up to 6 months for
          permitted visitor activities. The current standard application fee is &pound;135.
        </p>
        <p>
          If you visit the UK regularly, long-term Standard Visitor Visas are also available for 2, 5 or 10 years, while
          each individual visit is generally limited to a maximum of 6 months.
        </p>
        <h3>Long-Term Visitor Visa Options</h3>
        {longTermOptions.map((opt, i) => (
          <div key={i}>
            <h3>{opt.title}</h3>
            <p>{opt.text}</p>
          </div>
        ))}
        <p>The length of visa granted is subject to UKVI assessment and eligibility requirements.</p>
      </div>
    </section>

    {/* Processing */}
    <section className="spage-section">
      <div className="spage-wrap">
        <h2>UK Visitor Visa Processing</h2>
        <p>What Happens After You Apply?</p>
        <p>
          Once you have submitted your online application, proved your identity and provided the required documents,
          UKVI says a decision is usually made within 3 weeks, although individual cases can take longer.
        </p>
        <h3>Our Team Helps You With:</h3>
        <ol className="spage-steps">
          {processingSteps.map((s, i) => (
            <li key={i}>
              <strong>{s.title}</strong>
              <span>{s.text}</span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  </>
);

const UkVisitorVisa = () => (
  <VisitorVisaPage data={data} jsonLd={jsonLd} faqJsonLd={faqJsonLd}>
    <UkSections />
  </VisitorVisaPage>
);

export default UkVisitorVisa;
