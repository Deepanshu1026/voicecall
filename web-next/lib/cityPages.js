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
