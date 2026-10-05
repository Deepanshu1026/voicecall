'use client';

import VisitorVisaPage from './VisitorVisaPage';

const interviewQuestions = [
  'Why are you visiting the USA?',
  'What is the purpose of your business trip?',
  'Who are you meeting?',
  'How long do you plan to stay?',
  'Who will cover your travel expenses?',
  'What do you do professionally?',
  'What are your plans after your visit?',
];

const data = {
  heroImage: '/images/user/statueofliberty 1.webp',
  title: 'USA Visitor Visa',
  heroText:
    'Your USA journey starts with the right visa guidance. Planning a business visit, attending meetings, or visiting the USA for a short stay? Our experts make the process simple.',

  introHeading: 'Your USA Journey Starts With the Right Visa Guidance',
  introParas: [
    'Planning a business visit, attending meetings, exploring opportunities, or visiting the USA for a short stay?',
    'Our USA Visitor Visa experts help you navigate the application process with professional guidance, accurate documentation and personalized support\u2014so you can focus on planning your trip while we help you prepare your visa application.',
  ],
  stats: [
    { value: '7+ Years', label: 'Experience' },
    { value: '99%', label: 'Success Rate' },
    { value: '40+', label: 'Legal Visa Experts' },
    { value: '2 Lakh+', label: 'Followers' },
  ],
  planningText: "Planning Your USA Visit? Let's make your visa process simple.",

  whyHeading: 'Why Choose Us for Your USA Visitor Visa?',
  whyParas: [
    'A successful visa application starts with the right preparation.',
    'From understanding your profile to preparing your documents and getting you ready for the interview, our team provides complete guidance at every stage.',
  ],
  whySubhead: 'Our USA Visitor Visa Assistance Includes:',
  whyList: [
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
  ],
  whyClosing: 'One Application. One Dedicated Team. Complete Guidance.',

  processHeading: 'How We Help You Get Ready for Your USA Visit',
  steps: [
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
  ],

  businessHeading: 'USA Visitor Visa for Business Travel',
  businessSub: 'Visit the USA for Your Business Needs',
  businessText:
    'Planning to travel to the USA for eligible business activities? A USA Visitor Visa may be relevant for temporary business activities such as:',
  businessSubhead: 'Business Visit Activities May Include:',
  businessList: [
    'Attending business meetings',
    'Meeting clients or business associates',
    'Attending conferences and seminars',
    'Participating in eligible business events',
    'Negotiating business arrangements',
    'Exploring business opportunities',
    'Visiting a US business partner',
  ],
  businessClosing:
    'We help you prepare your application around your genuine purpose of travel and supporting documentation.',

  strongHeading: 'What Makes a Strong USA Visitor Visa Application?',
  strongPoints: [
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
  ],

  docsHeading: 'Documents Required for USA Visitor Visa',
  docsIntro: 'Your exact requirements may vary depending on your profile and purpose of travel.',
  docGroups: [
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
  ],

  faqHeading: 'Frequently Asked Questions',
  faqs: [
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
      title: 'Interview Preparation',
      text: 'Get practical preparation before your USA Visitor Visa interview.',
    },
    {
      title: '2 Lakh+ Followers',
      text: 'A growing community that follows our visa and immigration guidance.',
    },
  ],

  ctaHeading: 'Ready to Visit the USA?',
  ctaText:
    "Your business trip starts with the right preparation. Whether you're attending a meeting, conference, business event or visiting the USA for another permitted temporary purpose, our team can help you prepare your Visitor Visa application. Plan your USA visit with confidence.",
  ctaTags:
    'USA Visitor Visa Assistance | Business Visit Guidance | Documentation Support | Interview Preparation',
};

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
  mainEntity: data.faqs.map((faq) => ({
    '@type': 'Question',
    name: faq.q,
    acceptedAnswer: { '@type': 'Answer', text: faq.a },
  })),
};

const UsaInterviewSection = () => (
  <section className="spage-section">
    <div className="spage-wrap">
      <h2>USA Visitor Visa Interview Preparation</h2>
      <p>Walk Into Your Interview Prepared &amp; Confident</p>
      <p>
        The visa interview is an important part of the application process. Our team helps you prepare for questions
        related to:
      </p>
      <ul className="spage-list">
        {interviewQuestions.map((q, i) => (
          <li key={i}>{q}</li>
        ))}
      </ul>
      <div className="spage-note">
        <h3>Our Goal?</h3>
        <p>Help you understand your application clearly and present your genuine travel purpose with confidence.</p>
      </div>
    </div>
  </section>
);

const UsaVisitorVisa = () => (
  <VisitorVisaPage data={data} jsonLd={jsonLd} faqJsonLd={faqJsonLd}>
    <UsaInterviewSection />
  </VisitorVisaPage>
);

export default UsaVisitorVisa;
