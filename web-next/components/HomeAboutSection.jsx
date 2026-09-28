'use client';

const HomeAboutSection = ({ variant = 'full' }) => {
  const goTo = (p) => window.location.assign(p);
  const isShort = variant === 'short';

  const features = [
    {
      title: 'Global Reach',
      desc: 'USA, UK, Canada, EU & Australia',
      color: 'blue',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="9" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <path d="M12 3a15 15 0 0 1 4 9 15 15 0 0 1-4 9 15 15 0 0 1-4-9 15 15 0 0 1 4-9z" />
        </svg>
      ),
    },
    {
      title: '2 Lakh+ Clients',
      desc: 'Successful cases & counting',
      color: 'purple',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
    },
    {
      title: '40+ Legal Advisors',
      desc: 'Expert support at every step',
      color: 'green',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <path d="M9 12l2 2 4-4" />
        </svg>
      ),
    },
    {
      title: 'Fast-Track Support',
      desc: 'End-to-end file preparation',
      color: 'orange',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
        </svg>
      ),
    },
  ];

  return (
    <section className="abouthero" id="about-us">
      <div className="abouthero-bg" aria-hidden="true">
        <span className="abouthero-script">Your Visa<br />Our Commitment</span>
        <svg className="abouthero-flight" viewBox="0 0 260 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M8 108 C 70 96, 120 40, 236 22" stroke="rgba(255,255,255,0.35)" strokeWidth="1.6" strokeDasharray="4 5" strokeLinecap="round" />
          <path d="M236 22 l-14 -3 l7 12 l3 -7 l4 -2 z" fill="rgba(255,255,255,0.5)" />
        </svg>
      </div>

      <div className="abouthero-inner">
        <div className="abouthero-grid">
          <div className="abouthero-photo">
            <span className="abouthero-photo-shape" aria-hidden="true" />
            <span className="abouthero-photo-tab" aria-hidden="true" />
            <div className="abouthero-photo-frame">
              <div className="abouthero-photo-inner">
                <img
                  src="https://ik.imagekit.io/kaveeshkapoor/kaveesh_kapoor.png"
                  alt="Kaveesh Kapoor - Founder of A Visa Experts"
                  loading="lazy"
                />
                <span className="abouthero-photo-shade" aria-hidden="true" />
                <span className="abouthero-sign">Kaveesh Kapoor</span>
                <span className="abouthero-photo-label">Founder<br />A Visa Experts</span>
              </div>
            </div>
          </div>

          <div className="abouthero-content">
            <span className="abouthero-kicker"><i />Meet</span>
            <h2>
              Kaveesh Kapoor,
              <br />
              <span>Founder of A Visa Experts</span>
            </h2>
            <p>
              Kaveesh Kapoor is the Founder of A Visa Experts, helping individuals and families navigate visa
              applications with clear guidance and a straightforward approach. With a focus on transparency and
              personalized support, he has built A Visa Experts around making the visa process simpler, smoother and
              more accessible for everyone.
            </p>
            {!isShort && (
              <p>
                Backed by seasoned legal advisors and a 2 Lakh+ strong community, our team handles every case with a
                documented, end-to-end process — tourist, transit and permanent residency visas for the USA, UK, Canada,
                Australia and Europe.
              </p>
            )}
            <button className="abouthero-btn" onClick={() => goTo('/about')}>
              Learn more about Kaveesh Kapoor <span aria-hidden="true">→</span>
            </button>
          </div>
        </div>

        <div className="abouthero-features">
          {features.map((f) => (
            <div className="abouthero-feature" key={f.title}>
              <span className={`abouthero-feature-icon ${f.color}`}>{f.icon}</span>
              <div>
                <strong>{f.title}</strong>
                <span>{f.desc}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="abouthero-curve" aria-hidden="true" />
    </section>
  );
};

export default HomeAboutSection;
