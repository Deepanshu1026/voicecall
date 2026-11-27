import LandingLayout from '../LandingLayout';
import '../../styles/visaPages.css';

const BOOK_URL = '/book-appointment';

const questions = [
  ['Is your flight stopping in Canada?', 'If not, you don\u2019t need anything for Canada.'],
  ['Do you already have a valid Canada tourist visa?', 'If yes, it usually covers your transit too.'],
  ['Is your stop 48 hours or less?', 'If yes, apply for a transit visa.'],
  [
    'Is your stop longer than 48 hours, or will you leave the airport to explore?',
    'Then you need a tourist visa. See our Canada visa guide.',
  ],
];

const compareRows = [
  ['What it\u2019s for', 'Changing flights in Canada', 'Visiting Canada for holidays or family'],
  ['How long you can stay', '48 hours or less', 'Decided at entry by the border officer'],
  ['Can you leave the airport?', 'Not for sightseeing', 'Yes'],
  ['When to choose it', 'Short connection to another country', 'Long layover or a visit to Canada'],
  ['Can it be used for transit?', 'Yes', 'Yes, while it is valid'],
];

const documents = [
  'Valid passport, with enough validity for your whole trip and blank pages',
  'Confirmed onward flight ticket showing your stop in Canada is 48 hours or less',
  'Visa for your final destination, if that country needs one (for example, a US visa when flying on to the USA)',
  'Recent photograph that meets the photo specifications given in the application',
  'Travel itinerary showing all flights, airports and times',
  'Proof of purpose of your trip to the final country, such as a hotel booking, an invitation letter or a business letter',
  'Proof that you can pay for your trip, such as recent bank statements',
];

const steps = [
  ['Check your itinerary.', 'Confirm your connection time is 48 hours or less and note the Canadian airport.'],
  ['Fill the online application', 'and choose transit as the purpose of your trip.'],
  ['Upload your documents,', 'especially your flight itinerary and your visa for the final destination.'],
  ['Give biometrics if you are asked,', 'following the instructions in your application.'],
  ['Submit your passport when asked', 'and wait for it to be returned with the visa.'],
];

const situations = [
  [
    'India \u2192 Toronto \u2192 Mexico or the Caribbean',
    'A common route for holidays. Even with a short layover, you usually need a Canada transit visa, as well as any visa your destination needs.',
  ],
  [
    'India \u2192 Vancouver \u2192 USA',
    'You need a valid US visa for the USA, and usually a Canada transit visa for the Vancouver stop. Read our USA visa guide for the US side.',
  ],
  [
    'A long layover in Montreal',
    'If your connection is more than 48 hours, or you want to see the city, apply for a Canada tourist visa instead of a transit visa.',
  ],
];

const mistakes = [
  'Assuming "I won\u2019t leave the airport, so I don\u2019t need a visa"',
  'Booking separate tickets with a long gap in Canada and applying only for transit',
  'Applying for transit when the connection is over 48 hours',
  'Forgetting the visa for the final destination country',
  'Travel dates on the visa not matching changed flights',
  'Leaving the application too late',
];

const faqs = [
  [
    'Canada transit visa kab chahiye?',
    'If you are an Indian citizen with a flight connection in Canada of 48 hours or less, you usually need a Canada transit visa, even if you stay inside the airport.',
  ],
  [
    'Kya US visa hai toh Canada transit visa nahi chahiye?',
    'Usually you still need it. A US visa alone doesn\u2019t normally let Indian passport holders transit through Canada without a Canadian visa. Check the current eTA rules before you travel.',
  ],
  [
    'Kya Canada tourist visa se transit kar sakte hain?',
    'Yes. A valid Canada tourist visa can also be used for transit.',
  ],
  [
    '48 ghante se zyada layover ho toh kya karein?',
    'Apply for a Canada tourist visa instead of a transit visa.',
  ],
  [
    'Canada transit visa ka process kitna time leta hai?',
    'It varies with demand and season. Apply as soon as your flights are confirmed.',
  ],
  [
    'Kya transit ke dauraan airport se bahar ja sakte hain?',
    'Not for sightseeing on a transit visa. If you want to go out, apply for a tourist visa.',
  ],
];

const CanadaTransitVisa = () => (
  <LandingLayout>
    <div className="spage">
      {/* Hero */}
      <section className="spage-hero hero-canada">
        <div className="spage-hero-inner">
          <h1>Canada Transit Visa for Indians: When You Need It and How to Apply</h1>
          <p>
            You found a good fare to Mexico, the USA or the Caribbean, and it has a short stop in Toronto or Vancouver.
            You won&rsquo;t leave the airport, so do you still need a Canadian visa? For most Indian passport holders,
            the answer is yes. This guide explains when you need a Canada transit visa, what to prepare and how to apply
            from India.
          </p>
          <p className="spage-callout">
            <strong>Quick answer:</strong> If you are an Indian citizen and your flight connects through a Canadian
            airport, you usually need a Canada transit visa, even if you never leave the airport. It covers stops of 48
            hours or less. If your stop is longer, or you want to step out and see the city, you need a Canada tourist
            visa instead. If you already hold a valid Canada tourist visa, you can use it to transit.
          </p>
          <div className="spage-btns">
            <a className="spage-btn primary" href={BOOK_URL}>Book a Consultation</a>
            <a className="spage-btn dark" href="/consultants">Talk to a Consultant</a>
          </div>
        </div>
      </section>

      {/* 4 questions */}
      <section className="spage-section">
        <div className="spage-wrap">
          <h2>Canada transit visa kab chahiye?</h2>
          <p>Answer these four questions:</p>
          <ol className="spage-list">
            {questions.map(([q, a]) => (
              <li key={q}>
                <strong>{q}</strong> {a}
              </li>
            ))}
          </ol>
          <p className="spage-subnote">
            <strong>Have a US visa?</strong> A US visa on its own usually doesn&rsquo;t let Indian passport holders skip
            the Canada transit visa. Rules on electronic travel authorisation (eTA) do change, so read our{' '}
            <a className="spage-link" href="/blog/canada-eta-vs-visa">Canada eTA vs visa</a> guide and check the current
            rules before you book.
          </p>
        </div>
      </section>

      {/* Comparison */}
      <section className="spage-section">
        <div className="spage-wrap">
          <h2>Transit visa vs tourist visa for Canada</h2>
          <div className="spage-table-wrap">
            <table className="spage-table">
              <thead>
                <tr>
                  <th />
                  <th>Canada transit visa</th>
                  <th>Canada tourist visa</th>
                </tr>
              </thead>
              <tbody>
                {compareRows.map((row) => (
                  <tr key={row[0]}>
                    <td>{row[0]}</td>
                    <td>{row[1]}</td>
                    <td>{row[2]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Requirements */}
      <section className="spage-section">
        <div className="spage-wrap">
          <h2>Canada transit visa requirements for Indian citizens</h2>
          <p>Keep these ready before you apply:</p>
          <ul className="spage-list">
            {documents.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <p className="spage-subnote">
            The most important document is your onward ticket. It shows the officer that you are only passing through.
          </p>
        </div>
      </section>

      {/* How to apply */}
      <section className="spage-section">
        <div className="spage-wrap">
          <h2>How to apply from India: 5 steps</h2>
          <ol className="spage-list">
            {steps.map(([title, text]) => (
              <li key={title}>
                <strong>{title}</strong> {text}
              </li>
            ))}
          </ol>
          <p className="spage-subnote">
            Need help with the form or documents? Our team can check your file.{' '}
            <a className="spage-link" href="/contact">Contact us</a>.
          </p>
        </div>
      </section>

      {/* Processing + validity */}
      <section className="spage-section">
        <div className="spage-wrap">
          <h2>Canada transit visa processing time and validity</h2>
          <p>
            <strong>Processing time:</strong> it depends on how many applications are being processed and the time of
            year. Apply as soon as your flights are booked, and don&rsquo;t leave it to the last few weeks before travel.
          </p>
          <p>
            <strong>Validity:</strong> a transit visa is usually issued for the specific journey you applied for. Check
            the dates printed on your visa carefully. If your travel dates change, make sure your visa still covers the
            new connection.
          </p>
        </div>
      </section>

      {/* Situations */}
      <section className="spage-section">
        <div className="spage-wrap">
          <h2>Common situations for Indian travellers</h2>
          {situations.map(([title, text]) => (
            <div key={title} className="spage-faq">
              <h3>{title}</h3>
              <p>{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Mistakes */}
      <section className="spage-section">
        <div className="spage-wrap">
          <h2>Mistakes that cause problems at the airport</h2>
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
          <h2>FAQs</h2>
          <div className="spage-faq">
            {faqs.map(([q, a]) => (
              <details key={q}>
                <summary>{q}</summary>
                <p>{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="spage-section spage-cta">
        <div className="spage-wrap">
          <h2>Need help with your Canada transit visa?</h2>
          <p>
            A short connection in Canada shouldn&rsquo;t hold up your trip. If you&rsquo;d like us to check your
            itinerary and documents before you apply, book an appointment or contact our team.
          </p>
          <div className="spage-btns">
            <a className="spage-btn primary" href={BOOK_URL}>Book an Appointment</a>
            <a className="spage-btn dark" href="/contact">Contact Us</a>
          </div>
          <p className="spage-subnote">
            More: <a className="spage-link" href="/canada-visa">Canada visa from India</a> ·{' '}
            <a className="spage-link" href="/transit-visa">transit visa rules for other countries</a> ·{' '}
            <a className="spage-link" href="/usa-visa">USA visa from India</a>.
          </p>
        </div>
      </section>
    </div>
  </LandingLayout>
);

export default CanadaTransitVisa;
