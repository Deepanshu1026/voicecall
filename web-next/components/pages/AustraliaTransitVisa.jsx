import LandingLayout from '../LandingLayout';
import '../../styles/visaPages.css';

const BOOK_URL = '/book-appointment';

const mythRows = [
  ['"Layover under 8 hours? No visa needed."', 'Australia\u2019s visa-free transit (TWOV) is only for certain nationalities. India is not one of them.'],
  ['"If I stay in the transit lounge, I\u2019m fine."', 'Indian passport holders still need a subclass 771 visa, even if they stay airside.'],
  ['"The airline will sort it out."', 'Airlines can refuse boarding if you don\u2019t have the right visa.'],
  ['"I can get a transit visa on arrival."', 'No. Apply before you travel.'],
];

const layoverRows = [
  ['Any layover in Australia, staying airside', 'Subclass 771 transit visa'],
  ['Layover where you change airports or collect bags, under 72 hours', 'Subclass 771 transit visa'],
  ['Layover longer than 72 hours', 'Australia tourist visa'],
  ['You want to see Sydney or visit family during the layover', 'Australia tourist visa'],
  ['You already hold a valid Australian visa', 'Usually no separate transit visa'],
];

const whoRows = [
  'Indian ordinary passport holders transiting through any Australian airport',
  'Travellers who don\u2019t already hold another valid Australian visa that allows entry',
  'Crew members joining a ship in Australia (special conditions apply)',
];

const documentRows = [
  'A valid passport',
  'Confirmed onward ticket leaving Australia within 72 hours of arrival',
  'A visa or entry permission for your final destination, if that country requires one',
  'Evidence that you are genuinely transiting, such as your full itinerary',
];

const steps = [
  ['Check your itinerary.', 'Confirm your time in Australia is under 72 hours.'],
  ['Apply online before travel,', 'with your passport details, itinerary and destination visa.'],
  ['Wait for a decision.', 'Processing times vary, so apply well before your flight.'],
  ['Travel with your passport and onward ticket.', 'The visa is linked to your passport electronically.'],
];

const mistakes = [
  'Booking a cheap fare via Sydney without checking the transit visa rule',
  'Assuming the 8-hour rule applies to Indian passports',
  'Booking a connection longer than 72 hours and applying for a transit visa',
  'Separate tickets that require collecting bags and checking in again without planning for immigration',
  'Applying too close to the travel date',
];

const faqs = [
  ['Do Indians need a transit visa for Australia?', 'Yes, a subclass 771 visa, unless you hold another valid Australian visa.'],
  ['Sydney mein 5 ghante ka layover hai, visa chahiye?', 'Yes. Indian passport holders need a transit visa even for short layovers.'],
  ['How long can I stay on a transit visa?', 'Up to 72 hours, only for transit.'],
  ['Can I leave the airport on a transit visa?', 'Only as needed for your transit, within 72 hours. For sightseeing, apply for a tourist visa.'],
  ['What if my layover is longer than 72 hours?', 'You need an Australia tourist visa.'],
  ['Is Australia transit visa approval guaranteed?', 'No. The decision is made by the Australian authorities.'],
];

const AustraliaTransitVisa = () => (
  <LandingLayout>
    <div className="spage">
      {/* Hero */}
      <section className="spage-hero hero-australia">
        <div className="spage-hero-inner">
          <h1>Australia Transit Visa for Indians: Subclass 771 Explained</h1>
          <p>
            Flying from India to New Zealand, Fiji or the Pacific Islands with a connection in Sydney, Melbourne or
            Brisbane? Before you book, there&rsquo;s one rule every Indian traveller should know:
          </p>
          <p>
            <strong>
              Indian passport holders need an Australia transit visa (subclass 771) for every transit through
              Australia, even if the layover is short and you never leave the airport
            </strong>
            , unless you already hold another valid Australian visa.
          </p>
          <p>This page explains how the transit visa works, the 72-hour limit, and when you need a tourist visa instead.</p>
          <p><em>Information checked in November 2026.</em></p>
          <div className="spage-btns">
            <a className="spage-btn primary" href={BOOK_URL}>Book a Consultation</a>
            <a className="spage-btn dark" href="/consultants">Talk to a Consultant</a>
          </div>
        </div>
      </section>

      {/* Myth vs fact */}
      <section className="spage-section">
        <div className="spage-wrap">
          <h2>Myth vs fact: the 8-hour rule</h2>
          <p>Many websites say &ldquo;no visa needed for layovers under 8 hours&rdquo;. That&rsquo;s only half true.</p>
          <div className="spage-table-wrap">
            <table className="spage-table">
              <thead>
                <tr>
                  <th>What you may have read</th>
                  <th>What applies to Indians</th>
                </tr>
              </thead>
              <tbody>
                {mythRows.map((row) => (
                  <tr key={row[0]}>
                    <td>{row[0]}</td>
                    <td>{row[1]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* What is it */}
      <section className="spage-section">
        <div className="spage-wrap">
          <h2>What is the Australia transit visa (subclass 771)?</h2>
          <p>The subclass 771 transit visa lets you:</p>
          <ul className="spage-list">
            <li>Transit through Australia on your way to another country</li>
            <li>Stay for up to 72 hours, only for the purpose of transit</li>
            <li>
              Clear immigration if needed, for example to change airports or collect bags, within that 72-hour window
            </li>
          </ul>
          <p className="spage-subnote">
            It does not allow tourism, visiting family, business or study in Australia.
          </p>
        </div>
      </section>

      {/* 72-hour rule */}
      <section className="spage-section">
        <div className="spage-wrap">
          <h2>The 72-hour rule: plan your connection</h2>
          <div className="spage-table-wrap">
            <table className="spage-table">
              <thead>
                <tr>
                  <th>Your layover</th>
                  <th>What you need</th>
                </tr>
              </thead>
              <tbody>
                {layoverRows.map((row) => (
                  <tr key={row[0]}>
                    <td>{row[0]}</td>
                    <td>{row[1]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Who needs it */}
      <section className="spage-section">
        <div className="spage-wrap">
          <h2>Who needs an Australia transit visa?</h2>
          <ul className="spage-list">
            {whoRows.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </section>

      {/* Documents */}
      <section className="spage-section">
        <div className="spage-wrap">
          <h2>Documents for an Australia transit visa</h2>
          <ul className="spage-list">
            {documentRows.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <p className="spage-subnote">You&rsquo;ll also need to meet Australia&rsquo;s health and character requirements.</p>
        </div>
      </section>

      {/* How to apply */}
      <section className="spage-section">
        <div className="spage-wrap">
          <h2>How to apply for an Australia transit visa from India</h2>
          <ol className="spage-list">
            {steps.map(([title, text]) => (
              <li key={title}>
                <strong>{title}</strong> {text}
              </li>
            ))}
          </ol>
          <p className="spage-subnote">
            Fees: both the application fee and any other charges depend on the country&rsquo;s visa requirements.
            Check the current fees before applying.
          </p>
        </div>
      </section>

      {/* Mistakes */}
      <section className="spage-section">
        <div className="spage-wrap">
          <h2>Common mistakes Indian travellers make</h2>
          <ul className="spage-list">
            {mistakes.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </section>

      {/* FAQs */}
      <section className="spage-section">
        <div className="spage-wrap">
          <h2>Australia Transit Visa FAQs</h2>
          <div className="spage-faq">
            {faqs.map(([q, a]) => (
              <details key={q}>
                <summary>{q}</summary>
                <p>{a}</p>
              </details>
            ))}
          </div>
          <p className="spage-subnote">
            क्या भारतीयों को ऑस्ट्रेलिया में ट्रांज़िट के लिए वीज़ा चाहिए? हाँ। भारतीय पासपोर्ट धारकों को ऑस्ट्रेलिया से होकर किसी दूसरे देश जाने के लिए
            सबक्लास 771 ट्रांज़िट वीज़ा चाहिए, चाहे लेओवर कुछ ही घंटों का हो और आप एयरपोर्ट से बाहर न जाएँ। यह वीज़ा 72 घंटे तक के ट्रांज़िट के लिए होता है।
            इससे लंबे रुकने के लिए टूरिस्ट वीज़ा चाहिए।
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="spage-section spage-cta">
        <div className="spage-wrap">
          <h2>Check your Australia layover</h2>
          <p>
            Share your itinerary and we&rsquo;ll help you confirm whether you need a transit visa or a tourist visa.
          </p>
          <div className="spage-btns">
            <a className="spage-btn primary" href={BOOK_URL}>Book a Consultation</a>
            <a className="spage-btn dark" href="/consultants">Talk to a Consultant</a>
          </div>
          <p className="spage-subnote">
            Transit rules for other countries:{' '}
            <a className="spage-link" href="/transit-visa">transit visa</a>. Detailed guide:{' '}
            <a className="spage-link" href="/blog/australia-transit-visa-rules-fees-and-processing-times">
              Australia transit visa rules and processing times
            </a>
            . Visiting Australia for a holiday instead? See{' '}
            <a className="spage-link" href="/tourist-visa">tourist visa services</a>.
          </p>
        </div>
      </section>
    </div>
  </LandingLayout>
);

export default AustraliaTransitVisa;
