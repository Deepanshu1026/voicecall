'use client';

const HomeAboutSection = ({ variant = 'full' }) => {
  const goTo = (p) => window.location.assign(p);
  const isShort = variant === 'short';


  return (
<section className="home-about-section" id="about-us">
        {/* Ambient decorative lighting */}
        <div className="home-about-glow-1" aria-hidden="true" />
        <div className="home-about-glow-2" aria-hidden="true" />

        <div className="home-about-container">
          {/* Section Header */}
          <div className="home-about-header">
            <div className="home-about-badge">
              <span className="home-about-badge-sparkle">✦</span>
              <span>ABOUT A VISA EXPERTS</span>
            </div>
            <h2 className="home-about-title">
              Guiding Your Global Journey With <span className="home-about-gold-gradient">Proven Excellence</span>
            </h2>
            <p className="home-about-subtitle">
              India&apos;s trusted visa &amp; immigration consultancy, backed by seasoned legal advisors and hundreds of thousands of success stories.
            </p>
          </div>

          {/* Main Content Grid */}
          <div className="home-about-grid">
            {/* Left: Founder Portrait Card with Floating Badges */}
            <div className="home-about-image-wrapper">
              <div className="home-about-image-frame">
                <div className="home-about-image-glow" />
                <img
                  src="/images/user/sirpic 1.webp"
                  alt="Kaveesh Kapoor - Chairman & Founder of A Visa Experts"
                  className="home-about-img"
                  loading="lazy"
                />
                <div className="home-about-image-overlay" />

                {/* Floating Badge: Experience */}
                <div className="home-about-float-badge float-badge-top">
                  <div className="float-badge-icon gold">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                    </svg>
                  </div>
                  <div className="float-badge-text">
                    <span className="float-val">7+ Years</span>
                    <span className="float-lbl">Leadership</span>
                  </div>
                </div>

                {/* Floating Badge: Dedicated Process */}
                <div className="home-about-float-badge float-badge-bottom">
                  <div className="float-badge-icon blue">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" />
                    </svg>
                  </div>
                  <div className="float-badge-text">
                    <span className="float-val">100% Dedicated</span>
                    <span className="float-lbl">Visa Success Process</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Founder Information & Highlights */}
            <div className="home-about-info-col">
              <div className="founder-header">
                <div className="founder-name-wrap">
                  <h3 className="founder-name">Kaveesh Kapoor</h3>
                  <div className="founder-verified-chip" title="Verified Founder">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" fill="#2563eb" />
                      <path d="M8 12L10.5 14.5L16 9" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span>Founder</span>
                  </div>
                </div>
                <div className="founder-role">
                  CHAIRMAN &amp; FOUNDER — A VISA EXPERTS
                </div>
              </div>

              {/* Founder Quote */}
              {!isShort && (
                <div className="founder-quote-card">
                  <span className="quote-icon">“</span>
                  <p>
                    Our mission is simple: to turn your global aspirations into reality with complete transparency, unwavering dedication, and personalized guidance every step of the way.
                  </p>
                </div>
              )}

              {/* Description Body */}
              {isShort ? (
                <p className="founder-bio">
                  <strong>A Visa Experts</strong> — India&apos;s trusted visa &amp; immigration consultancy founded by
                  {' '}<strong>Kaveesh Kapoor</strong>. We help you secure tourist, work &amp; PR visas for the USA, UK,
                  Canada, Australia &amp; Europe.
                </p>
              ) : (
                <>
                  <p className="founder-bio">
                    Welcome to <strong>A Visa Experts</strong> — India&apos;s trusted visa &amp; immigration
                    consultancy. Founded by <strong>Kaveesh Kapoor</strong>, we help individuals and families secure
                    tourist, work, and permanent residency visas for the <strong>USA, UK, Canada, Australia,
                    Europe</strong> and beyond — with clear guidance, honest advice, and an exceptional track record of
                    success.
                  </p>
                  <p className="founder-bio">
                    Backed by seasoned legal advisors, a dedicated end-to-end visa process, and a 2 Lakh+ strong
                    community of successful applicants, we make every visa journey smooth, transparent and stress-free.
                  </p>
                </>
              )}

              {/* Internal links */}
              <nav className="home-about-links" aria-label="Explore A Visa Experts">
                <a href="/about">About Us</a>
                <a href="/services">Visa Services</a>
                <a href="/tourist-visa">Tourist Visa</a>
                <a href="/work-visa">Work Visa</a>
                <a href="/transit-visa">Transit Visa</a>
                <a href="/consultants">Talk to an Advisor</a>
                <a href="/blogs">Visa Blogs</a>
              </nav>

              {/* 4 Feature Highlights Grid (full only) */}
              {!isShort && (
              <div className="about-features-grid">
                <div className="about-feature-card">
                  <div className="feature-card-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#c9a24b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="2" y1="12" x2="22" y2="12" />
                      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                    </svg>
                  </div>
                  <div className="feature-card-content">
                    <span className="feature-card-title">Global Reach</span>
                    <span className="feature-card-desc">USA, UK, Canada, EU &amp; Aus</span>
                  </div>
                </div>

                <div className="about-feature-card">
                  <div className="feature-card-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#c9a24b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                  </div>
                  <div className="feature-card-content">
                    <span className="feature-card-title">2 Lakh+ Clients</span>
                    <span className="feature-card-desc">Successful cases &amp; aspirants</span>
                  </div>
                </div>

                <div className="about-feature-card">
                  <div className="feature-card-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#c9a24b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                  </div>
                  <div className="feature-card-content">
                    <span className="feature-card-title">40+ Legal Advisors</span>
                    <span className="feature-card-desc">Seasoned visa attorneys</span>
                  </div>
                </div>

                <div className="about-feature-card">
                  <div className="feature-card-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#c9a24b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                    </svg>
                  </div>
                  <div className="feature-card-content">
                    <span className="feature-card-title">Fast-Track Filing</span>
                    <span className="feature-card-desc">End-to-end file preparation</span>
                  </div>
                </div>
              </div>
              )}

              {/* Social Connect & Actions */}
              <div className="about-actions-row">
                {!isShort && (
                <div className="about-social-group">
                  <span className="social-label">Follow Us:</span>
                  <div className="about-social-icons">
                    <a
                      href="https://www.linkedin.com/company/a-visa-experts"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="about-social-link linkedin"
                      aria-label="LinkedIn"
                    >
                      <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
                      </svg>
                    </a>
                    <a
                      href="https://www.instagram.com/avisa.expert/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="about-social-link instagram"
                      aria-label="Instagram"
                    >
                      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                      </svg>
                    </a>
                    <a
                      href="https://www.facebook.com/profile.php?id=61590985693281"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="about-social-link facebook"
                      aria-label="Facebook"
                    >
                      <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                      </svg>
                    </a>
                    <a
                      href="https://www.youtube.com/@avisaexperts"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="about-social-link youtube"
                      aria-label="YouTube"
                    >
                      <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                      </svg>
                    </a>
                  </div>
                </div>
                )}

                <div className="about-buttons-wrapper">
                  <button className="home-about-cta-btn" onClick={() => goTo('/about')}>
                    <span>Meet Kaveesh Kapoor</span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="5" y1="12" x2="19" y2="12" />
                      <polyline points="12 5 19 12 12 19" />
                    </svg>
                  </button>
                  <button className="home-about-outline-btn" onClick={() => goTo('/appointment')}>
                    <span>Book Appointment</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="home-about-stats-container">
            <div className="home-about-stat-item">
              <div className="home-about-stat-number">2 Lakh+</div>
              <div className="home-about-stat-label">Followers</div>
            </div>
            <div className="home-about-stat-divider" />
            <div className="home-about-stat-item">
              <div className="home-about-stat-number">7+ Years</div>
              <div className="home-about-stat-label">Proven Experience</div>
            </div>
            <div className="home-about-stat-divider" />
            <div className="home-about-stat-item">
              <div className="home-about-stat-number">40+</div>
              <div className="home-about-stat-label">Legal Visa Experts</div>
            </div>
            <div className="home-about-stat-divider" />
            <div className="home-about-stat-item">
              <div className="home-about-stat-number">99%</div>
              <div className="home-about-stat-label">Success Rate*</div>
            </div>
          </div>
        </div>
      </section>
  );
};

export default HomeAboutSection;
