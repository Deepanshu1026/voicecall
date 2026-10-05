'use client';

import LandingLayout from '../LandingLayout';

const VisitorVisaPage = ({ data, jsonLd, faqJsonLd, children }) => {
  const navigate = (p) => window.location.assign(p);

  return (
    <LandingLayout>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <div className="spage">
        {/* Hero */}
        <section className="spage-hero" style={{ backgroundImage: `url('${data.heroImage}')` }}>
          <div className="spage-hero-inner">
            <h1>{data.title}</h1>
            <p>{data.heroText}</p>
            <div className="spage-btns">
              <button className="spage-btn primary" onClick={() => navigate('/appointment')}>
                Book Consultation
              </button>
              <button className="spage-btn outline" onClick={() => navigate('/consultants')}>
                Talk to an Expert
              </button>
            </div>
          </div>
        </section>

        {/* Intro */}
        <section className="spage-section">
          <div className="spage-wrap">
            <h2>{data.introHeading}</h2>
            {data.introParas.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
            <ul className="spage-stats">
              {data.stats.map((s, i) => (
                <li key={i}>
                  <strong>{s.value}</strong> {s.label}
                </li>
              ))}
            </ul>
            <p style={{ marginTop: '24px' }}>
              <strong>{data.planningText}</strong>
            </p>
            <div className="spage-btns left" style={{ marginTop: '8px' }}>
              <button className="spage-btn dark" onClick={() => navigate('/appointment')}>
                Book a Free Consultation
              </button>
            </div>
          </div>
        </section>

        {/* Why choose us */}
        <section className="spage-section">
          <div className="spage-wrap">
            <h2>{data.whyHeading}</h2>
            {data.whyParas.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
            <h3>{data.whySubhead}</h3>
            <ul className="spage-list">
              {data.whyList.map((it, i) => (
                <li key={i}>{it}</li>
              ))}
            </ul>
            <p>
              <strong>{data.whyClosing}</strong>
            </p>
          </div>
        </section>

        {/* Process */}
        <section className="spage-section">
          <div className="spage-wrap">
            <h2>{data.processHeading}</h2>
            <ol className="spage-steps">
              {data.steps.map((s, i) => (
                <li key={i}>
                  <strong>{s.title}</strong>
                  <span>{s.text}</span>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Business travel */}
        <section className="spage-section">
          <div className="spage-wrap">
            <h2>{data.businessHeading}</h2>
            <p>{data.businessSub}</p>
            <p>{data.businessText}</p>
            <h3>{data.businessSubhead}</h3>
            <ul className="spage-list">
              {data.businessList.map((it, i) => (
                <li key={i}>{it}</li>
              ))}
            </ul>
            <p>{data.businessClosing}</p>
          </div>
        </section>

        {/* Strong application */}
        <section className="spage-section">
          <div className="spage-wrap">
            <h2>{data.strongHeading}</h2>
            {data.strongPoints.map((p, i) => (
              <div key={i}>
                <h3>{p.title}</h3>
                <p>{p.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Documents */}
        <section className="spage-section">
          <div className="spage-wrap">
            <h2>{data.docsHeading}</h2>
            <p>{data.docsIntro}</p>
            {data.docGroups.map((g, i) => (
              <div key={i}>
                <h3>{g.title}</h3>
                <ul className="spage-list">
                  {g.items.map((it, j) => (
                    <li key={j}>{it}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Country-specific sections */}
        {children}

        {/* FAQ */}
        <section className="spage-section">
          <div className="spage-wrap">
            <h2>{data.faqHeading}</h2>
            <div className="spage-faq">
              {data.faqs.map((f, i) => (
                <details key={i}>
                  <summary>{f.q}</summary>
                  <p>{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* Why thousands */}
        <section className="spage-section">
          <div className="spage-wrap">
            <h2>{data.whyUsHeading}</h2>
            {data.whyUs.map((p, i) => (
              <div key={i}>
                <h3>{p.title}</h3>
                <p>{p.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="spage-cta">
          <h2>{data.ctaHeading}</h2>
          <p>{data.ctaText}</p>
          <div className="spage-btns">
            <button className="spage-btn primary" onClick={() => navigate('/appointment')}>
              Book a Free Consultation
            </button>
          </div>
          <p className="spage-tags">{data.ctaTags}</p>
        </section>
      </div>
    </LandingLayout>
  );
};

export default VisitorVisaPage;
