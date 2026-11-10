// Country + office-city pages, e.g. /uk-visa-consultant-in-noida
// Plan: avisaexperts-city-pages-and-sitemap-plan.xlsx (Phase 1, "Country + office city")
//
// Each page must be genuinely country-specific - not the same copy with a
// different country name. Application-centre details are deliberately left
// general until they can be verified from the official source; we do not
// publish guessed addresses or timings.
//
// A page goes live (and enters sitemap-cities.xml) only when status === 'published',
// and each one also needs its own route folder:
//   web-next/app/<slug>/page.jsx

const CTA = {
  book: '/book-appointment',
  consult: '/consultants',
};

export const CITY_COUNTRY_PAGES = {
  'uk-visa-consultant-in-noida': {
    status: 'published',
    country: 'UK',
    countryPath: '/uk-visa',
    city: 'Noida',
    cityPath: '/visa-consultant-in-noida',
    metaTitle: 'UK Visa Consultant in Noida | A Visa Experts',
    metaDescription:
      'UK visa help for Noida applicants: which visa to apply for, documents, bank statements, the biometrics appointment in Delhi NCR and refusal review. Visit our Sector 2 office.',
    h1: 'UK Visa Consultant in Noida',
    hero: [
      'Applying for a UK visa from Noida usually means the Standard Visitor Visa: a holiday in London, visiting a son or daughter in the UK, or a short business trip. The application itself is online, but the documents are where most applications are won or lost.',
      'We sit with you at our Sector 2 office (or online) and go through the whole file before it is submitted - purpose of travel, funds, ties to India and the invitation from your host.',
    ],
    help: [
      'Choosing between a Standard Visitor Visa, a family visit and a long-term 2, 5 or 10-year visa.',
      'Building the document file: bank statements, income proof, employer letter, invitation letter and host documents.',
      'Checking your finances for the things officers query most - unexplained deposits, thin balances and funds that do not match your income.',
      'Booking and preparing for the biometrics appointment, and telling you exactly what to carry.',
      'If you have been refused before, reviewing the refusal letter and rebuilding the application around the actual reason.',
    ],
    centreNote:
      'The UK visa application centre serving Noida applicants is in Delhi NCR. When you book with us we confirm the exact centre, how long to allow for travel from Noida, and what to carry on the day.',
    documentsLinks: [
      { label: 'UK tourist visa documents checklist', href: '/blog/uk-tourist-visa-documents-checklist' },
      { label: 'UK visa bank balance requirements', href: '/blog/uk-visa-bank-balance-requirements-2026-how-much-money-do-you-need' },
      { label: 'UK visa application form guide', href: '/blog/uk-visa-application-form-guide' },
    ],
    moreLinks: [
      { label: 'UK visa from India', href: '/uk-visa' },
      { label: 'UK visa requirements', href: '/uk-visa/requirements' },
      { label: 'UK visit visa for parents', href: '/uk-visa/family-visit-visa' },
      { label: 'UK visa processing time', href: '/uk-visa/processing-time' },
      { label: 'UK visa refusal reasons', href: '/uk-visa/refusal' },
    ],
    faqs: [
      {
        q: 'Do I need an interview for a UK tourist visa?',
        a: 'Usually no. For a Standard Visitor Visa you give biometrics and submit documents. An interview is only requested in some cases.',
      },
      {
        q: 'Can I apply for a UK visa from Noida?',
        a: 'Yes. You apply online and attend a biometrics appointment. Our office in Sector 2, Noida is a few minutes from Noida Sector 15 Metro on the Blue Line.',
      },
      {
        q: 'How long does a UK visa take from Noida?',
        a: 'A decision usually comes within about three weeks of your biometrics appointment. We tell you the current timeline when you apply.',
      },
      {
        q: 'I was refused a UK visa before. Can you help?',
        a: 'Yes. We read the refusal letter first and rebuild the application around the actual reason, rather than resubmitting the same file.',
      },
      {
        q: 'Do you help with a UK visa for my parents?',
        a: 'Yes. Parents visiting children in the UK are one of the most common applications we handle.',
      },
    ],
    cta: CTA,
  },

  'usa-visa-consultant-in-noida': {
    status: 'published',
    country: 'USA',
    countryPath: '/usa-visa',
    city: 'Noida',
    cityPath: '/visa-consultant-in-noida',
    metaTitle: 'USA Visa Consultant in Noida | A Visa Experts',
    metaDescription:
      'USA visa help for Noida applicants: DS-160, B1/B2 documents, the interview at the US Embassy in Delhi, OFC biometrics and interview preparation. Office in Sector 2, Noida.',
    h1: 'USA Visa Consultant in Noida',
    hero: [
      'A USA visitor visa is the one that most depends on the interview. Most Noida applicants need a B1/B2 visa, which means a DS-160 form, an OFC appointment for fingerprints and photo, and an interview at the US Embassy or consulate.',
      'We prepare the DS-160 carefully, build the document file, and then spend real time on the interview itself - the questions that get asked, and how to answer them honestly and clearly.',
    ],
    help: [
      'Filling the DS-160 accurately - small inconsistencies here are a common reason for trouble later.',
      'Choosing between B1, B2 and B1/B2, and matching it to your actual purpose of travel.',
      'Preparing the document file: employment or business proof, finances, property and family ties, previous travel.',
      'Booking the OFC biometrics appointment and the interview slot, and explaining the waiting times.',
      'Mock interview practice - the most useful hour you can spend before the real thing.',
      'If you were refused under 214(b), reviewing what changed and whether it is worth reapplying.',
    ],
    centreNote:
      'The US Embassy is in New Delhi, with the OFC (biometrics) centre in Delhi NCR as well. Interview waiting times change constantly - we check the current slot availability and plan your dates around it.',
    documentsLinks: [
      { label: 'USA visa document checklist', href: '/blog/usa-visa-document-checklist' },
      { label: 'DS-160 guide', href: '/blog/ds-160-guide-a-simple-guide-for-usa-visa-applicants' },
      { label: 'USA visa interview questions', href: '/blog/usa-visa-interview-questions-answers' },
    ],
    moreLinks: [
      { label: 'USA visa from India', href: '/usa-visa' },
      { label: 'USA B1/B2 visa', href: '/usa-visa/usa-b1b2-visa' },
      { label: 'USA visa appointment', href: '/usa-visa/appointment' },
      { label: 'USA visa processing time', href: '/usa-visa/processing-time' },
      { label: 'USA visa rejection reasons', href: '/usa-visa/rejection-reasons' },
    ],
    faqs: [
      {
        q: 'Do I have to attend an interview for a USA visa?',
        a: 'For most first-time B1/B2 applicants, yes. There are limited interview-waiver cases, but assume you will attend one.',
      },
      {
        q: 'Where is the US visa interview held for Noida applicants?',
        a: 'At the US Embassy in New Delhi. Biometrics are taken separately at the OFC centre in Delhi NCR before the interview.',
      },
      {
        q: 'How long is the USA visa wait from Noida?',
        a: 'Interview waiting times change often. This is the visa to start earliest - we check current slot availability before you fix travel dates.',
      },
      {
        q: 'I was refused under 214(b). What now?',
        a: '214(b) means the officer was not convinced you would return. Nothing about your file changes by reapplying immediately - what has to change is your ties and the evidence for them.',
      },
      {
        q: 'Do you prepare me for the interview?',
        a: 'Yes. We go through the questions that are actually asked for your profile and practise the answers with you.',
      },
    ],
    cta: CTA,
  },

  'canada-visa-consultant-in-noida': {
    status: 'published',
    country: 'Canada',
    countryPath: '/canada-visa',
    city: 'Noida',
    cityPath: '/visa-consultant-in-noida',
    metaTitle: 'Canada Visa Consultant in Noida | A Visa Experts',
    metaDescription:
      'Canada visa help for Noida applicants: visitor visa or super visa, invitation letter, biometrics at the Canada VAC, funds and refusal review. Visit our Sector 2 office.',
    h1: 'Canada Visa Consultant in Noida',
    hero: [
      'Canada applications live or die on the paper trail. Whether it is a visitor visa to see family in Toronto or a super visa for parents, the officer is reading your documents to decide whether you will return.',
      'We build the file with you: the invitation from your host, your funds and their source, your ties to India, and - for parents - the right visa for a long stay.',
    ],
    help: [
      'Choosing between a Canada visitor visa and a super visa for parents (a long-stay option for eligible families).',
      'Getting the invitation letter right, including what your host in Canada must include.',
      'Assembling funds and income proof, and explaining any large or recent deposits before the officer asks.',
      'Booking the biometrics appointment at the Canada visa application centre and preparing what to carry.',
      'Reviewing previous refusals and rebuilding around the stated reason.',
    ],
    centreNote:
      'Biometrics for Canada are given at a Canada visa application centre in Delhi NCR. We book the appointment and confirm the centre and travel time from Noida when you apply.',
    documentsLinks: [
      { label: 'Canada visa guide', href: '/blog/your-guide-to-canada-visa-application-a-visa-experts-visa-immigration-experts' },
      { label: 'Canada eTA vs visa', href: '/blog/canada-eta-vs-visa' },
      { label: 'Tourist and visitor visa guide', href: '/blog/tourist-visitor-visa-from-india-a-simple-guide' },
    ],
    moreLinks: [
      { label: 'Canada visa from India', href: '/canada-visa' },
      { label: 'Tourist visa services', href: '/tourist-visa' },
      { label: 'Talk to a consultant', href: '/consultants' },
    ],
    faqs: [
      {
        q: 'What is the difference between a Canada visitor visa and a super visa?',
        a: 'A visitor visa is for short trips. A super visa is for parents and grandparents of Canadian citizens or permanent residents and allows much longer stays per entry.',
      },
      {
        q: 'Do Noida applicants need biometrics for Canada?',
        a: 'Yes, for most applicants. Biometrics are given at a Canada visa application centre, usually in Delhi NCR for Noida applicants.',
      },
      {
        q: 'How long does a Canada visa take from India?',
        a: 'Processing times change often. We check the current estimate for your category before you commit to travel dates.',
      },
      {
        q: 'My Canada visa was refused. Is it worth reapplying?',
        a: 'It depends on the reason. If the refusal was about funds or ties, the file has to actually change - we go through the letter with you first.',
      },
      {
        q: 'Can you help my parents apply to visit me in Canada?',
        a: 'Yes. Parents visiting children in Canada is one of our most common applications, including super visa cases.',
      },
    ],
    cta: CTA,
  },

  'schengen-visa-consultant-in-noida': {
    status: 'published',
    country: 'Schengen',
    countryPath: '/tourist-visa',
    city: 'Noida',
    cityPath: '/visa-consultant-in-noida',
    metaTitle: 'Schengen Visa Consultant in Noida | A Visa Experts',
    metaDescription:
      'Schengen visa help for Noida applicants: which country to apply to, itinerary, travel insurance, funds and appointment booking. Visit our Sector 2, Noida office.',
    h1: 'Schengen Visa Consultant in Noida',
    hero: [
      'A Schengen visa lets you travel across 29 European countries on one visa - but you must apply to the right country, and that is where most applicants get it wrong.',
      'We work out which consulate actually has to handle your application, then build the itinerary, insurance and funds evidence that goes with it.',
    ],
    help: [
      'Deciding which Schengen country you must apply to - main destination, or the country of first entry if stays are equal.',
      'Building a realistic itinerary and matching hotel and travel arrangements to it.',
      'Travel medical insurance that meets the Schengen requirement, and knowing exactly what the cover has to include.',
      'Funds and income proof that fit the length of your trip.',
      'Booking the consulate or visa centre appointment, and preparing the folder in the order they expect.',
    ],
    centreNote:
      'Schengen applications are handled by the consulate or its visa centre for the country you are applying to, all in Delhi NCR. Which one applies to you depends on your itinerary - we confirm it before you book anything non-refundable.',
    documentsLinks: [
      { label: 'Tourist and visitor visa guide', href: '/blog/tourist-visitor-visa-from-india-a-simple-guide' },
      { label: 'Bank balance guide', href: '/blog/minimum-bank-balance-for-usa-tourist-visa-from-india-complete-guide-2026' },
    ],
    moreLinks: [
      { label: 'Tourist visa services', href: '/tourist-visa' },
      { label: 'All visa services', href: '/services' },
      { label: 'Talk to a consultant', href: '/consultants' },
    ],
    faqs: [
      {
        q: 'Which Schengen country should I apply to?',
        a: 'The country where you will spend the most nights. If nights are equal, you apply to the country you enter first.',
      },
      {
        q: 'Is travel insurance compulsory for a Schengen visa?',
        a: 'Yes. You need travel medical insurance meeting the Schengen minimum cover, valid for the whole trip.',
      },
      {
        q: 'How long can I stay in the Schengen area?',
        a: 'Generally up to 90 days within any 180-day period on a short-stay visa. The exact validity depends on what is granted.',
      },
      {
        q: 'Do I need confirmed flight tickets to apply?',
        a: 'You need to show your travel plan. Avoid non-refundable bookings before the visa is decided.',
      },
      {
        q: 'Can I apply for a Schengen visa from Noida?',
        a: 'Yes. The consulates and visa centres are in Delhi NCR, which is straightforward from Noida by metro or road.',
      },
    ],
    cta: CTA,
  },

  'australia-visa-consultant-in-noida': {
    status: 'published',
    country: 'Australia',
    countryPath: '/tourist-visa',
    city: 'Noida',
    cityPath: '/visa-consultant-in-noida',
    metaTitle: 'Australia Visa Consultant in Noida | A Visa Experts',
    metaDescription:
      'Australia visitor visa help for Noida applicants: online application, documents, funds, biometrics if requested and refusal review. Visit our Sector 2, Noida office.',
    h1: 'Australia Visa Consultant in Noida',
    hero: [
      'Australia visitor visas are applied for online, and there is usually no interview - which means the decision rests entirely on the documents you upload.',
      'That makes the file the whole case. We go through your funds, your employment or business, your family ties and your travel history before anything is submitted.',
    ],
    help: [
      'Applying for the right visitor visa for your trip, and understanding what each one is for.',
      'Building a document file that answers the officer\u2019s questions without needing an interview.',
      'Funds and income evidence, and making sure your bank history supports the trip you are proposing.',
      'Completing the online application accurately and uploading documents in the right format.',
      'Advising on biometrics, which are requested for some applicants only.',
      'Reviewing a previous refusal and strengthening the weak points before reapplying.',
    ],
    centreNote:
      'Australian visa applications are lodged online. If biometrics are requested, they are given at an Australian visa application centre - for Noida applicants that means Delhi NCR. We confirm when your application needs it.',
    documentsLinks: [
      { label: 'Tourist and visitor visa guide', href: '/blog/tourist-visitor-visa-from-india-a-simple-guide' },
      { label: 'Australia transit visa guide', href: '/blog/australia-transit-visa-rules-fees-and-processing-times' },
    ],
    moreLinks: [
      { label: 'Tourist visa services', href: '/tourist-visa' },
      { label: 'Transit visa services', href: '/transit-visa' },
      { label: 'All visa services', href: '/services' },
    ],
    faqs: [
      {
        q: 'Is there an interview for an Australia visitor visa?',
        a: 'Usually no. The decision is based on the documents you submit online, which is why the file matters so much.',
      },
      {
        q: 'Do I need biometrics for Australia?',
        a: 'Only if they are requested for your application. If so, they are given at an Australian visa application centre in Delhi NCR.',
      },
      {
        q: 'Can I apply for an Australia visa from Noida?',
        a: 'Yes. The application is lodged online, and you can do everything with us from our Sector 2 office or remotely.',
      },
      {
        q: 'How much bank balance do I need?',
        a: 'There is no fixed figure. Your funds have to credibly cover the trip and match your income. We review your statements first.',
      },
      {
        q: 'I was refused an Australia visa. Can you help?',
        a: 'Yes. We start from the refusal reason and fix the specific weakness rather than resubmitting the same file.',
      },
    ],
    cta: CTA,
  },
};

export const publishedCityCountrySlugs = () =>
  Object.entries(CITY_COUNTRY_PAGES)
    .filter(([, page]) => page.status === 'published')
    .map(([slug]) => slug);
