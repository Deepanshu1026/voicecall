// City & location pages.
// Plan: avisaexperts-city-pages-and-sitemap-plan.xlsx
//
// Rules from that plan:
//  - Publish one phase at a time, 5-10 pages per batch.
//  - NEVER publish a page where only the city name changes.
//  - Office cities (Phase 1) can show a real address. Online-served cities
//    (Phase 2) must say so honestly and must NOT show a fake local address.
//
// A page only becomes live + enters sitemap-cities.xml when status === 'published'.
//
// IMPORTANT: the Next App Router does not support partial dynamic segments, so
// each city also needs its own tiny route folder:
//   web-next/app/visa-consultant-in-<slug>/page.jsx
// (copy the Noida one and change SLUG). Set status to 'published' here too.

export const BOOK_URL = '/book-appointment';

export const CITY_PAGES = {
  noida: {
    status: 'published',
    city: 'Noida',
    state: 'Uttar Pradesh',
    kind: 'office', // office | online
    metaTitle: 'Visa Consultant in Noida | A Visa Experts',
    metaDescription:
      'Visa consultants in Noida for UK, USA, Canada, Schengen and Australia visas. Walk-in office in Sector 2, 5 minutes from Noida Sector 15 Metro, plus free online consultation.',
    h1: 'Visa Consultant in Noida',
    hero: [
      'A Visa Experts is based in Noida. If you are applying for a UK, USA, Canada, Schengen or Australia visa and would rather sit across a table than fill in a form alone, you are welcome to visit our office in Sector 2.',
      'We handle the whole application with you: choosing the right visa, preparing documents, checking your bank statements and finances, filling the form, booking biometrics or an interview slot, and preparing you for the questions that matter.',
    ],
    office: {
      address: 'B Block, Sector 2, Noida, Uttar Pradesh 201301',
      phone: '+91 120-4502750',
      phoneHref: 'tel:+911204502750',
      hours: 'Monday to Saturday, 10:00 am - 7:00 pm',
      travel: [
        {
          title: 'Coming from Delhi?',
          text: 'Our office is in Noida, just a 5 minute walk from Noida Sector 15 Metro Station (Blue Line). Take the Blue Line directly from Rajiv Chowk / Connaught Place - no change of trains needed.',
        },
        {
          title: 'Prefer not to travel?',
          text: 'Book a free online consultation by phone, chat or video. Many clients outside Noida never visit the office and still get the same step-by-step help.',
        },
      ],
    },
    countries: [
      { label: 'UK visa', href: '/uk-visa' },
      { label: 'USA visa', href: '/usa-visa' },
      { label: 'Canada visa', href: '/canada-visa' },
      { label: 'Tourist visa', href: '/tourist-visa' },
      { label: 'Transit visa', href: '/transit-visa' },
    ],
    // Country + this city pages (see lib/cityCountryPages.js)
    countryCityLinks: [
      { label: 'UK visa consultant in Noida', href: '/uk-visa-consultant-in-noida' },
      { label: 'USA visa consultant in Noida', href: '/usa-visa-consultant-in-noida' },
      { label: 'Canada visa consultant in Noida', href: '/canada-visa-consultant-in-noida' },
      { label: 'Schengen visa consultant in Noida', href: '/schengen-visa-consultant-in-noida' },
      { label: 'Australia visa consultant in Noida', href: '/australia-visa-consultant-in-noida' },
    ],
    centresNote:
      'UK, USA, Canada and Schengen visa application centres are all in Delhi NCR. When you book with us we tell you exactly which centre applies to you, what to carry, and how much travel time to allow.',
    documentsLinks: [
      { label: 'UK tourist visa documents checklist', href: '/blog/uk-tourist-visa-documents-checklist' },
      { label: 'USA visa document checklist', href: '/blog/usa-visa-document-checklist' },
      { label: 'UK visa bank balance requirements', href: '/blog/uk-visa-bank-balance-requirements-2026-how-much-money-do-you-need' },
    ],
    faqs: [
      {
        q: 'Do you have an office in Noida that I can visit?',
        a: 'Yes. Our office is at B Block, Sector 2, Noida, Uttar Pradesh 201301. We are open Monday to Saturday, 10:00 am to 7:00 pm.',
      },
      {
        q: 'I live in Delhi. How do I reach your Noida office?',
        a: 'Take the Blue Line to Noida Sector 15 Metro Station. The office is a 5 minute walk from the station, and the Blue Line runs directly from Rajiv Chowk / Connaught Place with no change of trains.',
      },
      {
        q: 'Can I apply for a UK visa from Noida?',
        a: 'Yes. You apply online, then attend a biometrics appointment. We prepare your documents, check your finances and book your slot so there are no surprises on the day.',
      },
      {
        q: 'Do I have to visit the office, or can everything be done online?',
        a: 'Everything can be done online by phone, chat or video. Many of our clients outside Noida never visit the office.',
      },
      {
        q: 'Which visas do you handle for Noida applicants?',
        a: 'UK, USA, Canada, Schengen, Australia, tourist, transit and family visit visas. We will tell you honestly if a visa is not the right fit for your situation.',
      },
      {
        q: 'How much bank balance do I need for a tourist visa?',
        a: 'There is no fixed minimum. Your funds should cover the trip, match your income and come from a clear source. We review your statements before you apply.',
      },
    ],
  },

  // ==================== Phase 2: cities we serve ONLINE ====================
  // No office in these cities, and these pages say so plainly. No invented
  // local addresses. Only the Noida office is ever shown.

  gurgaon: {
    status: 'published',
    city: 'Gurgaon',
    state: 'Haryana',
    kind: 'online',
    metaTitle: 'Visa Consultant in Gurgaon | A Visa Experts',
    metaDescription:
      'Visa help for Gurgaon applicants, served online from our Noida office. UK, USA, Canada and Schengen visas, document review, appointment booking and interview preparation.',
    h1: 'Visa Consultant for Gurgaon Applicants',
    hero: [
      'We do not have an office in Gurgaon. We serve Gurgaon applicants online and from our Noida office, and most people never need to travel at all.',
      'That suits Gurgaon particularly well: between work and commutes, a video call in the evening is usually easier than a trip across the city. Everything else - documents, the form, the appointment - happens the same way it would in person.',
    ],
    online: {
      honest: 'To be clear: we are based in Noida, not Gurgaon. There is no A Visa Experts office in Gurgaon.',
      steps: [
        'A free consultation by phone, chat or video at a time that suits you - including after work hours.',
        'Share your documents digitally (scans or photos). We review them and tell you what is missing before you apply.',
        'We fill the application form with you on a screen-share or send it for your approval, so nothing is submitted unchecked.',
        'We book your biometrics or interview slot and prepare you for it - mock interviews included for USA visas.',
      ],
      centre: 'Visa application centres for the UK, USA, Canada and Schengen are in Delhi NCR, which is straightforward from Gurgaon. We confirm which centre applies to you and what to carry.',
    },
    countries: [
      { label: 'UK visa', href: '/uk-visa' },
      { label: 'USA visa', href: '/usa-visa' },
      { label: 'Canada visa', href: '/canada-visa' },
      { label: 'Tourist visa', href: '/tourist-visa' },
      { label: 'Transit visa', href: '/transit-visa' },
    ],
    documentsLinks: [
      { label: 'UK tourist visa documents checklist', href: '/blog/uk-tourist-visa-documents-checklist' },
      { label: 'USA visa document checklist', href: '/blog/usa-visa-document-checklist' },
      { label: 'DS-160 guide', href: '/blog/ds-160-guide-a-simple-guide-for-usa-visa-applicants' },
    ],
    faqs: [
      { q: 'Do you have an office in Gurgaon?', a: 'No. We are based in Noida and serve Gurgaon applicants online by phone, chat and video. If you would rather meet in person, you are welcome at our Noida office.' },
      { q: 'Can everything be done without visiting Noida?', a: 'Yes. Documents, forms and consultation all happen online. Only biometrics or an interview requires you to attend in person, and that is at a visa centre, not our office.' },
      { q: 'Can I get a consultation after working hours?', a: 'Yes. Evening slots are usually the easiest for Gurgaon applicants - tell us a time that works and we will book it.' },
      { q: 'How do you review my documents if we never meet?', a: 'You send scans or clear photos. We go through them line by line on a call and tell you exactly what to add, fix or explain before submission.' },
      { q: 'Which visa do most Gurgaon applicants need?', a: 'It depends on the trip. USA B1/B2 for business travel, UK and Canada for visiting family, and Schengen for holidays are the most common.' },
    ],
  },

  ghaziabad: {
    status: 'published',
    city: 'Ghaziabad',
    state: 'Uttar Pradesh',
    kind: 'online',
    metaTitle: 'Visa Consultant in Ghaziabad | A Visa Experts',
    metaDescription:
      'Visa help for Ghaziabad applicants from our Noida office, a short drive away. UK, USA, Canada and Schengen visas, document review and appointment booking.',
    h1: 'Visa Consultant for Ghaziabad Applicants',
    hero: [
      'Ghaziabad is the closest of the cities we serve to our Noida office - close enough that many clients simply drive over, and close enough that everything can also be handled online if that is easier.',
      'Either way the process is the same: we review your documents, build the application with you and handle the appointment booking.',
    ],
    online: {
      honest: 'We are based in Noida. There is no separate A Visa Experts office in Ghaziabad.',
      steps: [
        'Book a free consultation - by phone, chat or video, or in person at Noida if you prefer.',
        'Send your documents digitally for a full review before anything is submitted.',
        'We complete the form with you and check it before it goes in.',
        'We book your biometrics or interview and tell you exactly what to carry on the day.',
      ],
      centre: 'Visa application centres are in Delhi NCR, an easy run from Ghaziabad. We confirm the right centre for your visa and the travel time to allow.',
    },
    countries: [
      { label: 'UK visa', href: '/uk-visa' },
      { label: 'USA visa', href: '/usa-visa' },
      { label: 'Canada visa', href: '/canada-visa' },
      { label: 'Tourist visa', href: '/tourist-visa' },
      { label: 'Transit visa', href: '/transit-visa' },
    ],
    documentsLinks: [
      { label: 'UK tourist visa documents checklist', href: '/blog/uk-tourist-visa-documents-checklist' },
      { label: 'USA visa document checklist', href: '/blog/usa-visa-document-checklist' },
      { label: 'Bank balance guide', href: '/blog/uk-visa-bank-balance-requirements-2026-how-much-money-do-you-need' },
    ],
    faqs: [
      { q: 'Do you have an office in Ghaziabad?', a: 'No. Our office is in Noida, and Ghaziabad applicants either come to Noida or work with us online.' },
      { q: 'How far is your office from Ghaziabad?', a: 'It is a short drive across the Noida border. Message us and we will send you the exact address and directions.' },
      { q: 'Do I need to come in person at all?', a: 'No. Everything can be done online. You only attend in person for biometrics or an interview, at the visa centre.' },
      { q: 'Can you help if my visa was refused before?', a: 'Yes. We start with the refusal letter and rebuild the application around the actual reason rather than resubmitting the same file.' },
      { q: 'Which countries do you handle?', a: 'UK, USA, Canada, Schengen, Australia, plus tourist, transit and family visit visas.' },
    ],
  },

  chandigarh: {
    status: 'published',
    city: 'Chandigarh',
    state: 'Chandigarh',
    kind: 'online',
    metaTitle: 'Visa Consultant in Chandigarh | A Visa Experts',
    metaDescription:
      'UK and Canada visa help for Chandigarh applicants, served online from our Noida office. Document review, refusal analysis and appointment booking. No fake local address.',
    h1: 'Visa Consultant for Chandigarh Applicants',
    hero: [
      'Chandigarh sends a large number of applicants to the UK and Canada, usually to visit children or relatives who have settled there. Those files get read closely, and the paperwork is where they are decided.',
      'We do not have an office in Chandigarh. We work with Chandigarh applicants online, and the review is the same one we do across the table in Noida.',
    ],
    online: {
      honest: 'There is no A Visa Experts office in Chandigarh. We serve Chandigarh applicants online from our Noida office.',
      steps: [
        'A free consultation by phone, chat or video, whenever suits you.',
        'Send your documents digitally - we review the invitation letter, funds and ties before anything is submitted.',
        'We prepare and check the application form with you.',
        'We book the biometrics appointment and tell you what to carry and where to go.',
      ],
      centre: 'Chandigarh has its own visa application centres for several countries, and Delhi NCR is the alternative. We confirm which one applies to your visa before you book anything.',
    },
    countries: [
      { label: 'UK visa', href: '/uk-visa' },
      { label: 'Canada visa', href: '/canada-visa' },
      { label: 'Tourist visa', href: '/tourist-visa' },
      { label: 'Transit visa', href: '/transit-visa' },
    ],
    countryCityLinks: [
      { label: 'UK visa consultant in Chandigarh', href: '/uk-visa-consultant-in-chandigarh' },
      { label: 'Canada visa consultant in Chandigarh', href: '/canada-visa-consultant-in-chandigarh' },
    ],
    documentsLinks: [
      { label: 'UK tourist visa documents checklist', href: '/blog/uk-tourist-visa-documents-checklist' },
      { label: 'UK visa bank balance requirements', href: '/blog/uk-visa-bank-balance-requirements-2026-how-much-money-do-you-need' },
      { label: 'Canada visa guide', href: '/blog/your-guide-to-canada-visa-application-a-visa-experts-visa-immigration-experts' },
    ],
    faqs: [
      { q: 'Do you have an office in Chandigarh?', a: 'No. We are based in Noida and serve Chandigarh applicants online, by phone, chat and video.' },
      { q: 'Can a Chandigarh applicant apply for a UK visa online?', a: 'Yes. The application is lodged online, and you attend a biometrics appointment. We prepare the file and book the slot.' },
      { q: 'How do I send my documents if we never meet?', a: 'Scans or clear photos by email or WhatsApp. We review them on a call and tell you exactly what to add or fix.' },
      { q: 'My visa was refused. Can you look at it?', a: 'Yes - that is one of the most common reasons people come to us. We read the refusal letter first and fix the specific weakness.' },
      { q: 'Do you help parents applying to visit children abroad?', a: 'Yes. Parents visiting children in the UK or Canada is a large part of what we do.' },
    ],
  },

  ludhiana: {
    status: 'published',
    city: 'Ludhiana',
    state: 'Punjab',
    kind: 'online',
    metaTitle: 'Visa Consultant in Ludhiana | A Visa Experts',
    metaDescription:
      'UK and Canada visa help for Ludhiana applicants, served online from our Noida office. Invitation letters, funds, refusal review and appointment booking.',
    h1: 'Visa Consultant for Ludhiana Applicants',
    hero: [
      'For Ludhiana applicants the trip is usually family: a son or daughter in Canada, a brother in the UK, a wedding, a new grandchild. Those applications need the relationship and the funds to be obvious on paper.',
      'We work with Ludhiana applicants online from our Noida office - no need to travel to Delhi for advice, only for biometrics if your visa requires it.',
    ],
    online: {
      honest: 'We have no office in Ludhiana. All consultation is online or at our Noida office.',
      steps: [
        'Free consultation by phone, chat or video.',
        'Digital document review: invitation letter, relationship proof, bank statements and income.',
        'We build and check the application form with you.',
        'Appointment booking plus a clear list of what to carry and where to go.',
      ],
      centre: 'Depending on the country, your nearest visa application centre may be in Chandigarh or in Delhi NCR. We confirm which one before you book.',
    },
    countries: [
      { label: 'UK visa', href: '/uk-visa' },
      { label: 'Canada visa', href: '/canada-visa' },
      { label: 'Tourist visa', href: '/tourist-visa' },
      { label: 'Transit visa', href: '/transit-visa' },
    ],
    countryCityLinks: [
      { label: 'UK visa consultant in Ludhiana', href: '/uk-visa-consultant-in-ludhiana' },
      { label: 'Canada visa consultant in Ludhiana', href: '/canada-visa-consultant-in-ludhiana' },
    ],
    documentsLinks: [
      { label: 'UK tourist visa documents checklist', href: '/blog/uk-tourist-visa-documents-checklist' },
      { label: 'Canada visa guide', href: '/blog/your-guide-to-canada-visa-application-a-visa-experts-visa-immigration-experts' },
      { label: 'Tourist and visitor visa guide', href: '/blog/tourist-visitor-visa-from-india-a-simple-guide' },
    ],
    faqs: [
      { q: 'Do you have an office in Ludhiana?', a: 'No. We serve Ludhiana applicants online from our Noida office.' },
      { q: 'Can I apply for a Canada visa from Ludhiana?', a: 'Yes. The application is online and you give biometrics at a visa application centre. We prepare the whole file and book the appointment.' },
      { q: 'What matters most when visiting family?', a: 'Proof of the relationship and proof you will return. Both have to be on paper - we go through exactly how.' },
      { q: 'Do you help with a super visa for parents?', a: 'Yes. For Canada, a super visa is often the better fit for parents than a short visitor visa, and we will tell you honestly which applies.' },
      { q: 'Can you help if my visa was refused?', a: 'Yes. We start from the refusal reason and rebuild the application around it.' },
    ],
  },

  jalandhar: {
    status: 'published',
    city: 'Jalandhar',
    state: 'Punjab',
    kind: 'online',
    metaTitle: 'Visa Consultant in Jalandhar | A Visa Experts',
    metaDescription:
      'UK and Canada visa help for Jalandhar applicants, served online from our Noida office. Document review, invitation letters, refusal analysis and appointment booking.',
    h1: 'Visa Consultant for Jalandhar Applicants',
    hero: [
      'Jalandhar has one of the strongest family links to the UK and Canada of any city in India. Most applications we see are parents or siblings visiting relatives, or attending a wedding or graduation.',
      'We are not based in Jalandhar. We handle these files online from Noida, which for most applicants means advice the same week rather than a trip to Delhi.',
    ],
    online: {
      honest: 'There is no A Visa Experts office in Jalandhar. We serve the city online from our Noida office.',
      steps: [
        'Free consultation by phone, chat or video.',
        'We review the invitation, relationship proof and finances digitally.',
        'The application form is completed and checked with you.',
        'We book your appointment and prepare you for what happens on the day.',
      ],
      centre: 'Your nearest visa application centre may be in Chandigarh or Delhi NCR depending on the country. We confirm which applies before you book.',
    },
    countries: [
      { label: 'UK visa', href: '/uk-visa' },
      { label: 'Canada visa', href: '/canada-visa' },
      { label: 'Tourist visa', href: '/tourist-visa' },
      { label: 'Transit visa', href: '/transit-visa' },
    ],
    countryCityLinks: [
      { label: 'UK visa consultant in Jalandhar', href: '/uk-visa-consultant-in-jalandhar' },
      { label: 'Canada visa consultant in Jalandhar', href: '/canada-visa-consultant-in-jalandhar' },
    ],
    documentsLinks: [
      { label: 'UK tourist visa documents checklist', href: '/blog/uk-tourist-visa-documents-checklist' },
      { label: 'UK visit visa for parents', href: '/uk-visa/family-visit-visa' },
      { label: 'Canada visa guide', href: '/blog/your-guide-to-canada-visa-application-a-visa-experts-visa-immigration-experts' },
    ],
    faqs: [
      { q: 'Do you have an office in Jalandhar?', a: 'No. We are based in Noida and serve Jalandhar applicants online.' },
      { q: 'I want to visit my son in Canada. Which visa?', a: 'Usually a visitor visa, or a super visa if you qualify and want longer stays. We will tell you which fits and why.' },
      { q: 'Can everything be arranged without coming to Delhi?', a: 'Yes. Only biometrics or an interview requires you to attend in person, and that is at a visa centre.' },
      { q: 'What documents prove a family relationship?', a: 'Birth certificates, marriage certificates, old photographs and the host\u2019s documents together. We tell you which ones actually matter for your case.' },
      { q: 'Do you handle refused applications?', a: 'Yes. We read the refusal letter and rebuild the file around the reason given.' },
    ],
  },

  amritsar: {
    status: 'published',
    city: 'Amritsar',
    state: 'Punjab',
    kind: 'online',
    metaTitle: 'Visa Consultant in Amritsar | A Visa Experts',
    metaDescription:
      'UK and Canada visa help for Amritsar applicants, served online from our Noida office. Family visit documents, funds, refusal review and appointment booking.',
    h1: 'Visa Consultant for Amritsar Applicants',
    hero: [
      'Most Amritsar applications we handle are family visits to the UK or Canada, or parents travelling for a wedding, a birth or a graduation. The trip is genuine - the job is proving it on paper.',
      'We are not based in Amritsar. We work with applicants from the city online, and by the time you travel it is only for biometrics.',
    ],
    online: {
      honest: 'We have no office in Amritsar. Our office is in Noida and we serve Amritsar applicants online.',
      steps: [
        'A free consultation by phone, chat or video.',
        'Send your documents digitally for a full review before submission.',
        'We complete and check the application form with you.',
        'We book the appointment and brief you on what to carry.',
      ],
      centre: 'Depending on the country, your nearest visa application centre may be in Chandigarh or Delhi NCR. We confirm the right one and the travel involved.',
    },
    countries: [
      { label: 'UK visa', href: '/uk-visa' },
      { label: 'Canada visa', href: '/canada-visa' },
      { label: 'Tourist visa', href: '/tourist-visa' },
      { label: 'Transit visa', href: '/transit-visa' },
    ],
    countryCityLinks: [
      { label: 'UK visa consultant in Amritsar', href: '/uk-visa-consultant-in-amritsar' },
      { label: 'Canada visa consultant in Amritsar', href: '/canada-visa-consultant-in-amritsar' },
    ],
    documentsLinks: [
      { label: 'UK tourist visa documents checklist', href: '/blog/uk-tourist-visa-documents-checklist' },
      { label: 'Tourist and visitor visa guide', href: '/blog/tourist-visitor-visa-from-india-a-simple-guide' },
      { label: 'Canada visa guide', href: '/blog/your-guide-to-canada-visa-application-a-visa-experts-visa-immigration-experts' },
    ],
    faqs: [
      { q: 'Do you have an office in Amritsar?', a: 'No. We serve Amritsar applicants online from our Noida office.' },
      { q: 'How long does a UK visitor visa take?', a: 'A decision usually comes within about three weeks of the biometrics appointment. We tell you the current timeline when you apply.' },
      { q: 'Do I need to show property or land?', a: 'It helps to show ties to India, but it is not the only thing. Pension, family responsibilities and ongoing commitments count too.' },
      { q: 'Can you help my parents apply to visit me?', a: 'Yes - that is most of what we do for Punjab applicants.' },
      { q: 'What if I was refused before?', a: 'We start with the refusal letter and fix the specific reason, rather than submitting the same documents again.' },
    ],
  },

  vadodara: {
    status: 'published',
    city: 'Vadodara',
    state: 'Gujarat',
    kind: 'online',
    metaTitle: 'Visa Consultant in Vadodara | A Visa Experts',
    metaDescription:
      'Visa help for Vadodara applicants, served online from our Noida office. USA, UK and Canada visas, document review, interview preparation and appointment booking.',
    h1: 'Visa Consultant for Vadodara Applicants',
    hero: [
      'Vadodara applicants come to us for two main reasons: family visits to the USA, UK and Canada, and business travel. Both live or die on the documents you submit.',
      'We do not have an office in Vadodara. We work with the city online from Noida, which for most people means a consultation this week instead of a trip to Mumbai or Delhi.',
    ],
    online: {
      honest: 'There is no A Visa Experts office in Vadodara. We serve Vadodara applicants online from our Noida office.',
      steps: [
        'Free consultation by phone, chat or video.',
        'Digital document review - funds, income, business records and ties.',
        'We complete and check the application form with you.',
        'For USA visas, interview preparation and mock interviews over video.',
      ],
      centre: 'Visa application centres for the USA, UK and Canada are in Mumbai and Delhi NCR. We confirm which one applies to you and what to allow for travel.',
    },
    countries: [
      { label: 'USA visa', href: '/usa-visa' },
      { label: 'UK visa', href: '/uk-visa' },
      { label: 'Canada visa', href: '/canada-visa' },
      { label: 'Tourist visa', href: '/tourist-visa' },
    ],
    countryCityLinks: [
      { label: 'USA visa consultant in Vadodara', href: '/usa-visa-consultant-in-vadodara' },
      { label: 'UK visa consultant in Vadodara', href: '/uk-visa-consultant-in-vadodara' },
      { label: 'Canada visa consultant in Vadodara', href: '/canada-visa-consultant-in-vadodara' },
    ],
    documentsLinks: [
      { label: 'USA visa document checklist', href: '/blog/usa-visa-document-checklist' },
      { label: 'DS-160 guide', href: '/blog/ds-160-guide-a-simple-guide-for-usa-visa-applicants' },
      { label: 'USA visa interview questions', href: '/blog/usa-visa-interview-questions-answers' },
    ],
    faqs: [
      { q: 'Do you have an office in Vadodara?', a: 'No. We are based in Noida and serve Vadodara applicants online.' },
      { q: 'Can I prepare for a USA interview over video?', a: 'Yes. Mock interviews work well over video - it is the same questions and the same practice, just on a screen.' },
      { q: 'Do I have to go to Delhi for the USA visa?', a: 'For the interview and biometrics, yes - those are in Delhi NCR or Mumbai. Everything before that can be done online.' },
      { q: 'What if I run a business and travel often?', a: 'Business records, turnover and tax filings matter more than a large balance. We help you present them clearly.' },
      { q: 'Can you help with a Canada super visa?', a: 'Yes. For parents visiting children in Canada it is often the better option, and we will say so if it fits.' },
    ],
  },

  surat: {
    status: 'published',
    city: 'Surat',
    state: 'Gujarat',
    kind: 'online',
    metaTitle: 'Visa Consultant in Surat | A Visa Experts',
    metaDescription:
      'Visa help for Surat applicants, served online from our Noida office. USA, UK and Canada visas for business and family travel, with document review and interview prep.',
    h1: 'Visa Consultant for Surat Applicants',
    hero: [
      'Surat applicants are often travelling for business - buyers, suppliers, trade fairs - or to visit family in the USA, UK and Canada. Business travel needs the company paperwork to be as clean as the personal file.',
      'We are not based in Surat. We serve the city online from Noida, so the first conversation can happen the same week you get in touch.',
    ],
    online: {
      honest: 'We have no office in Surat. All consultation happens online or at our Noida office.',
      steps: [
        'Free consultation by phone, chat or video.',
        'Document review covering both personal and business papers - turnover, filings, invitations.',
        'We complete and check the application form with you.',
        'Interview preparation for USA visas, and appointment booking for all.',
      ],
      centre: 'Visa application centres for the USA, UK and Canada are in Mumbai and Delhi NCR. We confirm which applies and how much travel to allow.',
    },
    countries: [
      { label: 'USA visa', href: '/usa-visa' },
      { label: 'UK visa', href: '/uk-visa' },
      { label: 'Canada visa', href: '/canada-visa' },
      { label: 'Tourist visa', href: '/tourist-visa' },
    ],
    countryCityLinks: [
      { label: 'USA visa consultant in Surat', href: '/usa-visa-consultant-in-surat' },
      { label: 'UK visa consultant in Surat', href: '/uk-visa-consultant-in-surat' },
      { label: 'Canada visa consultant in Surat', href: '/canada-visa-consultant-in-surat' },
    ],
    documentsLinks: [
      { label: 'USA visa document checklist', href: '/blog/usa-visa-document-checklist' },
      { label: 'USA B1/B2 visa', href: '/usa-visa/usa-b1b2-visa' },
      { label: 'DS-160 guide', href: '/blog/ds-160-guide-a-simple-guide-for-usa-visa-applicants' },
    ],
    faqs: [
      { q: 'Do you have an office in Surat?', a: 'No. We serve Surat applicants online from our Noida office.' },
      { q: 'I am travelling for business. What documents matter?', a: 'A letter from your company explaining the purpose, who is paying, plus company registration, turnover and tax filings. We go through them with you.' },
      { q: 'Can I apply for a USA business visa online?', a: 'The DS-160 and the paperwork are online. The interview and biometrics are in person, in Delhi NCR or Mumbai.' },
      { q: 'Do you help with family visit visas too?', a: 'Yes. Visiting children or relatives in the USA, UK or Canada is a large part of what we handle.' },
      { q: 'What if a previous application was refused?', a: 'We read the refusal first and rebuild the application around the stated reason.' },
    ],
  },

  // --- Not published (kept here as a reminder of the plan) ---
  //
  // Ahmedabad: deferred for now, on request. Leave as draft.
  //
  // Delhi: the plan lists it as an office city, but the site's footer and
  // contact page only list Noida in India (plus New York, Florida, Seattle and
  // London). So Delhi would have to be an ONLINE-served city (kind: 'online'),
  // which must say so honestly and show no local address.
  ahmedabad: {
    status: 'draft',
    city: 'Ahmedabad',
    state: 'Gujarat',
    kind: 'office',
  },
  delhi: {
    status: 'draft',
    city: 'Delhi',
    state: 'Delhi',
    kind: 'online',
  },
};

export const publishedCitySlugs = () =>
  Object.entries(CITY_PAGES)
    .filter(([, page]) => page.status === 'published')
    .map(([slug]) => slug);
