import LandingLayout from '../LandingLayout';
import { CITY_PAGES } from '../../lib/cityPages';
import '../../styles/visaPages.css';
import '../../styles/cityPage.css';

const mapsQuery = (address) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
const mapsEmbed = (address) =>
  `https://www.google.com/maps?q=${encodeURIComponent(address)}&output=embed`;

const Stars = ({ rating }) => {
  const n = Math.max(0, Math.min(5, Number(rating) || 5));
  return (
    <span className="city-stars" aria-label={`${n} out of 5`}>
      {'★'.repeat(n)}
      <span className="city-stars-off">{'★'.repeat(5 - n)}</span>
    </span>
  );
};

const CountryCityPage = ({ page, reviews = [] }) => {
  const citySlug = (page.cityPath || '').split('/').pop();
  const office = CITY_PAGES[citySlug]?.office;

  return (
    <LandingLayout>
      <div className="spage">
        {/* Hero */}
        <section className="spage-hero hero-city">
          <div className="spage-hero-inner">
            <h1>{page.h1}</h1>
            {(page.hero || []).map((para) => (
              <p key={para.slice(0, 24)}>{para}</p>
            ))}
            <div className="spage-btns">
              <a className="spage-btn primary" href={page.cta.book}>Book a Free Consultation</a>
              <a className="spage-btn dark" href={page.cta.consult}>Talk to a Consultant</a>
            </div>
          </div>
        </section>

        {/* How we help */}
        <section className="spage-section">
          <div className="spage-wrap">
            <h2>How we help {page.city} applicants with a {page.country} visa</h2>
            <ul className="spage-checklist">
              {(page.help || []).map((item) => (
                <li key={item.slice(0, 24)}>{item}</li>
              ))}
            </ul>
            {page.centreNote && <p className="spage-subnote">{page.centreNote}</p>}
          </div>
        </section>

        {/* Office */}
        {office && (
          <section className="spage-section">
            <div className="spage-wrap">
              <h2>Where we are</h2>
              <div className="city-office">
                <div className="city-office-info">
                  <p className="city-address">
                    <span aria-hidden="true">📍</span> {office.address}
                  </p>
                  <ul className="city-office-facts">
                    <li>
                      <strong>Phone:</strong>{' '}
                      <a className="spage-link" href={office.phoneHref}>{office.phone}</a>
                    </li>
                    <li><strong>Timings:</strong> {office.hours}</li>
                  </ul>
                  <a
                    className="spage-link"
                    href={mapsQuery(office.address)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Open in Google Maps
                  </a>
                  {(office.travel || []).map((item) => (
                    <div className="city-travel" key={item.title}>
                      <h3>{item.title}</h3>
                      <p>{item.text}</p>
                    </div>
                  ))}
                </div>
                <div className="city-map">
                  <iframe
                    title={`Map of the A Visa Experts ${page.city} office`}
                    src={mapsEmbed(office.address)}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Documents */}
        <section className="spage-section">
          <div className="spage-wrap">
            <h2>Documents to keep ready</h2>
            <ul className="spage-checklist">
              <li>Valid passport, plus any old passports</li>
              <li>Bank statements for the last few months</li>
              <li>Income proof: salary slips, ITR or business records</li>
              <li>Employer letter with approved leave, or business documents</li>
              <li>A clear travel plan with dates and where you will stay</li>
              <li>Invitation letter and host documents, if you are visiting someone</li>
            </ul>
            <p className="spage-subnote">
              Detailed lists:{' '}
              {(page.documentsLinks || []).map((d, i) => (
                <span key={d.href}>
                  {i > 0 ? ' · ' : ''}
                  <a className="spage-link" href={d.href}>{d.label}</a>
                </span>
              ))}
              .
            </p>
          </div>
        </section>

        {/* Reviews */}
        {reviews.length > 0 && (
          <section className="spage-section">
            <div className="spage-wrap">
              <h2>What our clients say</h2>
              <div className="city-reviews">
                {reviews.map((r, i) => (
                  <figure className="city-review" key={`${r.user_name}-${i}`}>
                    <Stars rating={r.rating} />
                    <blockquote>{r.story}</blockquote>
                    <figcaption>
                      <strong>{r.user_name}</strong>
                      {r.visa_type && r.visa_type !== r.user_name ? <span> · {r.visa_type}</span> : null}
                    </figcaption>
                  </figure>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* FAQs */}
        <section className="spage-section">
          <div className="spage-wrap">
            <h2>{page.country} visa FAQs for {page.city} applicants</h2>
            <div className="spage-faq">
              {(page.faqs || []).map((f) => (
                <details key={f.q}>
                  <summary>{f.q}</summary>
                  <p>{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* More */}
        <section className="spage-section">
          <div className="spage-wrap">
            <h2>Read next</h2>
            <div className="city-tags">
              {(page.moreLinks || []).map((l) => (
                <a className="spage-link" key={l.href} href={l.href}>{l.label}</a>
              ))}
              <a className="spage-link" href={page.cityPath}>
                All services for {page.city} applicants
              </a>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="spage-section spage-cta">
          <div className="spage-wrap">
            <h2>Start your {page.country} application</h2>
            <p>
              Come to our {page.city} office, or book a free online consultation from anywhere. We will tell you
              which {page.country} visa fits your trip and exactly what to prepare.
            </p>
            <div className="spage-btns">
              <a className="spage-btn primary" href={page.cta.book}>Book a Consultation</a>
              <a className="spage-btn dark" href={page.cta.consult}>Talk to a Consultant</a>
            </div>
          </div>
        </section>
      </div>
    </LandingLayout>
  );
};

export default CountryCityPage;
