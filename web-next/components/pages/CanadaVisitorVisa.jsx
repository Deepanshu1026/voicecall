'use client';

import VisitorVisaPage from './VisitorVisaPage';

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

const data = {
  heroImage: '/images/user/canada 1.webp',
  title: 'Canada Visitor Visa',
  heroText:
    'Your Canada journey starts with the right visa guidance. Planning a business visit, attending meetings, or visiting Canada for a short stay? Our experts make the process simple.',

  introHeading: 'Your Canada Journey Starts With the Right Visa Guidance',
  introParas: [
    'Planning a business visit, attending meetings, exploring opportunities, or visiting Canada for a short stay?',
    'Our Canada Visitor Visa experts help you navigate the application process with professional guidance, accurate documentation and personalized support\u2014so you can focus on planning your trip while we help you prepare your visa application.',
  ],
  stats: [
    { value: '7+ Years', label: 'Experience' },
    { value: '99%', label: 'Success Rate' },
    { value: '40+', label: 'Legal Visa Experts' },
    { value: '2 Lakh+', label: 'Followers' },
  ],
  planningText: "Planning Your Canada Visit? Let's make your visa process simple.",

  whyHeading: 'Why Choose Us for Your Canada Visitor Visa?',
  whyParas: [
    'A successful visa application starts with the right preparation.',
    'From understanding your profile to preparing your documents and guiding you through the application process, our team provides complete support at every stage.',
  ],
  whySubhead: 'Our Canada Visitor Visa Assistance Includes:',
  whyList: [
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
  ],
  whyClosing: 'One Application. One Dedicated Team. Complete Guidance.',

  processHeading: 'How We Help You Get Ready for Your Canada Visit',
  steps: [
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
  ],

  businessHeading: 'Canada Visitor Visa for Business Travel',
  businessSub: 'Visit Canada for Your Business Needs',
  businessText:
    'Planning to travel to Canada for eligible temporary business activities? Business visitors may travel to Canada for permitted activities such as meetings, conferences, events and certain short-term business activities, subject to applicable Canadian immigration requirements.',
  businessSubhead: 'Business Visit Activities May Include:',
  businessList: [
    'Attending business meetings',
    'Meeting Canadian clients or business associates',
    'Attending conferences and events',
    'Participating in eligible business activities',
    'Visiting a Canadian business partner',
    'Discussing or negotiating business arrangements',
    'Participating in eligible short-term business activities',
  ],
  businessClosing:
    'We help you prepare your application around your genuine purpose of travel and relevant supporting documentation.',

  strongHeading: 'What Makes a Strong Canada Visitor Visa Application?',
  strongPoints: [
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
  ],

  docsHeading: 'Documents Required for Canada Visitor Visa',
  docsIntro: 'Your exact requirements may vary depending on your profile, travel purpose and individual circumstances.',
  docGroups: [
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
  ],

  faqHeading: 'Frequently Asked Questions',
  faqs: [
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
  ],

  ctaHeading: 'Ready to Visit Canada?',
  ctaText:
    "Your Canada trip starts with the right preparation. Whether you're attending a business meeting, conference, event or visiting Canada for another permitted temporary purpose, our team can help you prepare your Visitor Visa application. Plan your Canada visit with confidence.",
  ctaTags:
    'Canada Visitor Visa Assistance | Business Visit Guidance | Documentation Support | Biometrics Guidance | GCMS / CAIPS Notes Assistance',
};

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
  mainEntity: data.faqs.map((faq) => ({
    '@type': 'Question',
    name: faq.q,
    acceptedAnswer: { '@type': 'Answer', text: faq.a },
  })),
};

const CanadaSections = () => (
  <>
    <section className="spage-section">
      <div className="spage-wrap">
        <h2>Canada Visitor Visa Biometrics</h2>
        <p>Prepare Every Step With Confidence</p>
        <p>
          Depending on your circumstances, you may need to provide fingerprints and a photograph as biometrics as part
          of your Canada Visitor Visa application. Our team helps you understand:
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

    <section className="spage-section">
      <div className="spage-wrap">
        <h2>GCMS &amp; CAIPS Notes</h2>
        <p>Understand Your Canadian Immigration File Better</p>
        <p>
          GCMS Notes / CAIPS Notes can provide information recorded in your Canadian immigration file, where disclosure
          is available under applicable rules.
        </p>
        <p>
          GCMS stands for Global Case Management System, the current case-management system used by Canadian immigration
          authorities.
        </p>
        <p>CAIPS is an older term that is still commonly used when referring to Canadian immigration file notes.</p>

        <h3>What Can GCMS / CAIPS Notes Help You Understand?</h3>
        <ul className="spage-list">
          {gcmsUnderstand.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>

        <h3>Who May Consider GCMS / CAIPS Notes?</h3>
        {gcmsWho.map((item, i) => (
          <div key={i}>
            <h3>{item.title}</h3>
            <p>{item.text}</p>
          </div>
        ))}

        <div className="spage-note">
          <h3>Need Help With Your GCMS / CAIPS Notes?</h3>
          <p>
            Our team can help you obtain and understand available GCMS / CAIPS information and explain how it may relate
            to your future visa application.
          </p>
          <div className="spage-btns left" style={{ marginTop: '16px' }}>
            <button
              className="spage-btn dark"
              onClick={() => window.location.assign('/consultants')}
            >
              Get GCMS / CAIPS Notes Guidance &rarr;
            </button>
          </div>
        </div>

        <p className="spage-disclaimer">
          GCMS / CAIPS Notes are government records and their availability and disclosure are subject to applicable
          Canadian privacy and access-to-information rules. Obtaining or reviewing these notes does not guarantee visa
          approval.
        </p>
      </div>
    </section>
  </>
);

const CanadaVisitorVisa = () => (
  <VisitorVisaPage data={data} jsonLd={jsonLd} faqJsonLd={faqJsonLd}>
    <CanadaSections />
  </VisitorVisaPage>
);

export default CanadaVisitorVisa;
