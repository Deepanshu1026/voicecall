'use client';

const HomeAboutSection = ({ variant = 'full' }) => {
  const goTo = (p) => window.location.assign(p);
  const isShort = variant === 'short';

  const features = [
    { title: 'Global Reach', desc: 'USA, UK, Canada, EU & Australia' },
    { title: '2 Lakh+ Clients', desc: 'Successful cases & aspirants' },
    { title: '40+ Legal Advisors', desc: 'Seasoned visa attorneys' },
    { title: 'Fast-Track Filing', desc: 'End-to-end file preparation' },
  ];

  const links = [
    { label: 'About Us', href: '/about' },
    { label: 'Visa Services', href: '/services' },
    { label: 'Tourist Visa', href: '/tourist-visa' },
    { label: 'Transit Visa', href: '/transit-visa' },
    { label: 'Talk to an Advisor', href: '/consultants' },
    { label: 'Visa Blogs', href: '/blogs' },
  ];

  const stats = [
    { value: '2 Lakh+', label: 'Followers' },
    { value: '7+ Years', label: 'Proven Experience' },
    { value: '40+', label: 'Legal Visa Experts' },
    { value: '99%', label: 'Success Rate*' },
  ];

  return (
    <section className="aboutx" id="about-us">
      <div className="aboutx-container">
        <div className="aboutx-head">
          <span className="aboutx-kicker">About A Visa Experts</span>
          <h2>Guiding Your Global Journey With Proven Excellence</h2>
          <p>
            India&apos;s trusted visa &amp; immigration consultancy, backed by seasoned legal advisors and hundreds of
            thousands of success stories.
          </p>
        </div>

        <div className="aboutx-grid">
          <div className="aboutx-media">
            <img
              src="/images/user/sirpic 1.webp"
              alt="Kaveesh Kapoor - Chairman & Founder of A Visa Experts"
              loading="lazy"
            />
          </div>

          <div className="aboutx-body">
            <div className="aboutx-person">
              <h3 className="aboutx-name">Kaveesh Kapoor</h3>
              <span className="aboutx-role">Chairman &amp; Founder — A Visa Experts</span>
            </div>

            {isShort ? (
              <p className="aboutx-bio">
                <strong>A Visa Experts</strong> — India&apos;s trusted visa &amp; immigration consultancy founded by
                {' '}<strong>Kaveesh Kapoor</strong>. We help you secure tourist, transit &amp; PR visas for the USA, UK,
                Canada, Australia &amp; Europe.
              </p>
            ) : (
              <>
                <p className="aboutx-bio">
                  Welcome to <strong>A Visa Experts</strong> — India&apos;s trusted visa &amp; immigration consultancy.
                  Founded by <strong>Kaveesh Kapoor</strong>, we help individuals and families secure tourist, transit
                  and permanent residency visas for the <strong>USA, UK, Canada, Australia, Europe</strong> and beyond —
                  with clear guidance, honest advice, and an exceptional track record of success.
                </p>
                <p className="aboutx-bio">
                  Backed by seasoned legal advisors, a dedicated end-to-end visa process, and a 2 Lakh+ strong community
                  of successful applicants, we make every visa journey smooth, transparent and stress-free.
                </p>
                <blockquote className="aboutx-quote">
                  Our mission is simple: to turn your global aspirations into reality with complete transparency,
                  unwavering dedication, and personalized guidance every step of the way.
                  <cite>— Kaveesh Kapoor, Chairman &amp; Founder</cite>
                </blockquote>
              </>
            )}

            <div className="aboutx-links">
              {links.map((l) => (
                <a key={l.href} href={l.href}>
                  {l.label}
                </a>
              ))}
            </div>

            {!isShort && (
              <div className="aboutx-features">
                {features.map((f) => (
                  <div className="aboutx-feature" key={f.title}>
                    <span className="aboutx-check" aria-hidden="true">✓</span>
                    <div>
                      <strong>{f.title}</strong>
                      <span>{f.desc}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="aboutx-actions">
              <button className="aboutx-btn primary" onClick={() => goTo('/about')}>
                Meet Kaveesh Kapoor
              </button>
              <button className="aboutx-btn outline" onClick={() => goTo('/appointment')}>
                Book Appointment
              </button>
            </div>
          </div>
        </div>

        <div className="aboutx-stats">
          {stats.map((s) => (
            <div className="aboutx-stat" key={s.label}>
              <div className="aboutx-stat-value">{s.value}</div>
              <div className="aboutx-stat-label">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HomeAboutSection;
