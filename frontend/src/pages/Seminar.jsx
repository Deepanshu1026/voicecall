import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import SEO from '../components/common/SEO';
import { SEMINAR_VIDEO_URL, SEMINAR_VIDEO_IS_EMBED } from '../config/seminarVideo';
import '../styles/seminar.css';

const seminarStats = [
  { num: '500+', label: 'Attendees' },
  { num: '12', label: 'Expert Speakers' },
  { num: '6', label: 'Impactful Sessions' },
  { num: '48hrs', label: 'Of Guidance' },
];

const speakers = [
  {
    name: 'Kaveesh Kapoor',
    role: 'Chairman & Founder',
    img: '/images/user/sirpic 1.webp',
    bio: 'Helped 2 LAKH+ clients settle abroad with his deep expertise in immigration law and visa advisory.',
  },
];

const gallery = [
  { img: 'https://res.cloudinary.com/fniv4k20/image/upload/v1788524351/DSC08783-100kb_yq5ibr.jpg', cls: 'wide', depth: 18 },
  { img: 'https://res.cloudinary.com/fniv4k20/image/upload/v1788524351/DSC08782-100kb_ieygmt.jpg', cls: '', depth: 10 },
  { img: 'https://res.cloudinary.com/fniv4k20/image/upload/v1788523874/DSC08565_bboj12.jpg', cls: 'tall', depth: 26 },
  { img: 'https://res.cloudinary.com/fniv4k20/image/upload/v1788523873/DSC08560_wvvwqo.jpg', cls: '', depth: 12 },
  { img: 'https://res.cloudinary.com/fniv4k20/image/upload/v1788523872/DSC08562_ysozce.jpg', cls: '', depth: 8 },
  { img: 'https://res.cloudinary.com/fniv4k20/image/upload/v1788523873/DSC08563_cwiyq0.jpg', cls: 'wide', depth: 22 },
  { img: 'https://res.cloudinary.com/fniv4k20/image/upload/v1788523872/DSC08564_ai9hwh.jpg', cls: '', depth: 15 },
];

const agenda = [
  { time: '10:00 AM', title: 'Opening Keynote', desc: 'The future of global mobility and why 2026 is the year to take the leap.' },
  { time: '11:30 AM', title: 'Visa Strategy Masterclass', desc: 'Tourist, work and study visas — the complete roadmap from application to approval.' },
  { time: '01:00 PM', title: 'One-on-One Expert Consultations', desc: 'Direct access to immigration lawyers for personalised guidance.' },
  { time: '03:00 PM', title: 'Success Stories & Q&A', desc: 'Real client journeys, common mistakes and live answers to your questions.' },
];

const testimonials = [
  { quote: 'The seminar completely changed how I approached my visa application. Everything finally made sense.', who: 'Attendee — New Delhi' },
  { quote: 'Meeting the experts in person gave me the confidence to finally start my Canada PR process.', who: 'Attendee — Chandigarh' },
  { quote: 'World-class insights delivered with such clarity. Best seminar I have attended in years.', who: 'Attendee — Mumbai' },
];

const marqueeItems = ['Global Immigration', 'Visa Success', 'Expert Guidance', '2 Lakh+ Clients', 'Trusted Advisors', 'Study Abroad', 'PR & Work Visas'];

// Editorial "About" Section Data — Configurable Image URLs & Editorial Narrative
const editorialAboutData = {
  heading: 'About',
  images: {
    // Column 1 - Top image (Warm editorial atmosphere / interior)
    col1Top: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80',
    // Column 2 - Bottom image (Tailored striped garment texture)
    col2Bottom: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=800&q=80',
    // Column 3 - Top image (Editorial portrait profile)
    col3Top: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=80',
    // Column 4 - Top image (Close-up face & eyes portrait)
    col4Top: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
    // Column 4 - Bottom image (Close-up lips, neck & collarbone)
    col4Bottom: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
    // Column 5 - Bottom image (Architectural silhouette / styling)
    col5Bottom: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=800&q=80',
  },
  texts: {
    col1Bottom: 'The brand values precision tailoring, premium materials, and understated elegance, creating garments that remain relevant beyond seasonal trends.',
    col2Top: 'This project presents a concept website for Odette Beauclaire, a premium womenswear brand focused on timeless silhouettes, refined textures, and architectural tailoring.',
    col3Bottom: 'The design focuses on clarity, strong typography, balanced spacing, and refined imagery to convey a premium brand identity.',
    col5Top: 'The goal of the project was to create a minimal yet expressive interface that highlights the clothing without visual noise.',
  },
};

const Seminar = () => {
  const navigate = useNavigate();
  const [mouse, setMouse] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMouse({
      x: (e.clientX - rect.left) / rect.width - 0.5,
      y: (e.clientY - rect.top) / rect.height - 0.5,
    });
  };

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: 'A Visa Experts — Global Immigration Seminar',
    description: 'A premium seminar by A Visa Experts on visa and immigration success.',
    organizer: { '@type': 'Organization', name: 'A Visa Experts', url: 'https://avisaexperts.com' },
  };

  return (
    <>
      <SEO
        title="Seminar | A Visa Experts — Visa & Immigration Insights"
        description="A recap of A Visa Experts' latest successful immigration seminar — expert speakers, powerful sessions and real client success stories."
        canonicalPath="/seminar"
        ogImage="/images/user/sirpic 1.webp"
        jsonLd={jsonLd}
      />

      {/* Minimal seminar-only nav */}
      <nav className="seminar-nav">
        <Link to="/home" className="seminar-nav-logo">
          <img src="/images/user/tmlogo 1.webp" alt="A Visa Experts" />
        </Link>
        <Link to="/home" className="seminar-nav-back">
          ← Back to Home
        </Link>
      </nav>

      <div className="seminar-page">
        {/* HERO — autoplay video background */}
        <section className="seminar-hero">
          {SEMINAR_VIDEO_IS_EMBED ? (
            <iframe
              className="seminar-hero-video seminar-hero-embed"
              src={SEMINAR_VIDEO_URL}
              title="Seminar highlight video"
              frameBorder="0"
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <video
              className="seminar-hero-video"
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
            >
              <source src={SEMINAR_VIDEO_URL} type="video/mp4" />
            </video>
          )}
          <div className="seminar-hero-shade" />
          <div className="seminar-hero-vignette" />

          <div className="seminar-hero-inner">
            <div className="seminar-eyebrow">A Visa Experts Presents</div>
            <h1>
              Global Immigration
              <span className="light">Success Seminar 2026</span>
            </h1>
            <p className="seminar-hero-sub">
              A landmark gathering of visa experts, industry leaders and ambitious travellers —
              one powerful day dedicated to turning your migration dreams into reality.
            </p>
            <div className="seminar-hero-cta">
              <button className="seminar-btn" onClick={() => navigate('/appointment')}>Book a Consultation</button>
              <button className="seminar-btn outline" onClick={() => navigate('/consultants')}>Meet Our Experts</button>
            </div>
            <div className="seminar-hero-meta">
              <span>New Delhi</span>
              <span>500+ Attendees</span>
              <span>Sold Out</span>
            </div>
          </div>

          <div className="seminar-scroll">Scroll</div>
        </section>

        {/* MARQUEE */}
        <div className="seminar-marquee">
          <div className="seminar-marquee-track">
            {[...marqueeItems, ...marqueeItems].map((m, i) => (
              <span key={i}><b>●</b> {m}</span>
            ))}
          </div>
        </div>

        {/* STATS */}
        <section style={{ padding: '70px 24px', background: 'var(--sm-black-2)' }}>
          <div className="seminar-container">
            <div className="seminar-stats">
              {seminarStats.map((s) => (
                <div className="seminar-stat" key={s.label}>
                  <div className="seminar-stat-num">{s.num}</div>
                  <div className="seminar-stat-label">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* EDITORIAL ABOUT SECTION */}
        <section className="seminar-editorial-section" id="seminar-about">
          {/* Subtle geometric line graphics in top-right */}
          <svg
            className="editorial-bg-geometry"
            viewBox="0 0 600 420"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <polygon
              points="600,0 450,0 210,420 600,420"
              stroke="#111111"
              strokeWidth="0.8"
              strokeDasharray="4 6"
              opacity="0.22"
            />
            <line
              x1="90"
              y1="0"
              x2="600"
              y2="390"
              stroke="#111111"
              strokeWidth="0.8"
              opacity="0.18"
            />
          </svg>

          <div className="editorial-container">
            {/* Expressive handwritten cursive "About" signature */}
            <div className="editorial-script-wrap" aria-hidden="true">
              <span className="editorial-script-title">{editorialAboutData.heading}</span>
            </div>

            {/* 5-Column Staggered Editorial Grid */}
            <div className="editorial-grid">
              {/* Column 1: Top Image, Bottom Text */}
              <div className="editorial-col">
                <div className="editorial-media-card">
                  <img
                    src={editorialAboutData.images.col1Top}
                    alt="Editorial concept showcase 1"
                    loading="lazy"
                  />
                </div>
                <div className="editorial-text-card align-bottom">
                  <p className="editorial-text">{editorialAboutData.texts.col1Bottom}</p>
                </div>
              </div>

              {/* Column 2: Top Text, Bottom Image */}
              <div className="editorial-col">
                <div className="editorial-text-card col2-text">
                  <p className="editorial-text">{editorialAboutData.texts.col2Top}</p>
                </div>
                <div className="editorial-media-card">
                  <img
                    src={editorialAboutData.images.col2Bottom}
                    alt="Editorial concept showcase 2"
                    loading="lazy"
                  />
                </div>
              </div>

              {/* Column 3: Top Image, Bottom Text */}
              <div className="editorial-col">
                <div className="editorial-media-card">
                  <img
                    src={editorialAboutData.images.col3Top}
                    alt="Editorial concept showcase 3"
                    loading="lazy"
                  />
                </div>
                <div className="editorial-text-card align-bottom">
                  <p className="editorial-text">{editorialAboutData.texts.col3Bottom}</p>
                </div>
              </div>

              {/* Column 4: Two Stacked Portrait Media Cards */}
              <div className="editorial-col editorial-col-double">
                <div className="editorial-media-card col4-top">
                  <img
                    src={editorialAboutData.images.col4Top}
                    alt="Editorial portrait focus eyes"
                    loading="lazy"
                  />
                </div>
                <div className="editorial-media-card col4-bottom">
                  <img
                    src={editorialAboutData.images.col4Bottom}
                    alt="Editorial portrait focus lips and collar"
                    loading="lazy"
                  />
                </div>
              </div>

              {/* Column 5: Top Text, Bottom Image */}
              <div className="editorial-col">
                <div className="editorial-text-card align-top">
                  <p className="editorial-text">{editorialAboutData.texts.col5Top}</p>
                </div>
                <div className="editorial-media-card">
                  <img
                    src={editorialAboutData.images.col5Bottom}
                    alt="Editorial concept showcase 4"
                    loading="lazy"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Discreet footer mark */}
          <div className="editorial-footer-mark">site Design</div>
        </section>

        {/* SPEAKERS */}
        <section className="seminar-speakers">
          <div className="seminar-container">
            <div className="seminar-section-head">
              <div className="kicker">The Speakers</div>
              <h2>Wisdom From Industry Leaders</h2>
              <p>Learn directly from the visionaries who have guided over two lakh clients to new beginnings abroad.</p>
            </div>
            <div className="seminar-speakers-grid">
              {speakers.map((sp, i) => (
                <div
                  className="seminar-speaker"
                  key={sp.name}
                  onClick={() => navigate('/seminar/kaveesh-kapoor')}
                  role="link"
                >
                  <div className="seminar-speaker-media">
                    <img className="seminar-speaker-img" src={sp.img} alt={sp.name} />
                    <span className="seminar-speaker-view">View Profile →</span>
                  </div>
                  <div className="seminar-speaker-body">
                    <div className="seminar-speaker-head">
                      <div className="seminar-speaker-index">{String(i + 1).padStart(2, '0')}</div>
                      <div>
                        <h3>{sp.name}</h3>
                        <div className="role">{sp.role}</div>
                      </div>
                    </div>
                    <p>{sp.bio}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* GALLERY — full-screen mouse-reactive collage */}
        <section className="seminar-collage" onMouseMove={handleMouseMove}>
          <div className="seminar-collage-inner">
            <div className="seminar-section-head">
              <div className="kicker">The Moments</div>
              <h2>Captured At The Seminar</h2>
              <p>Move your cursor and watch the moments come alive.</p>
            </div>
            <div className="seminar-collage-grid">
              {gallery.map((g, i) => (
                <div
                  className={`g-item ${g.cls}`}
                  key={i}
                  style={{ transform: `translate(${mouse.x * g.depth}px, ${mouse.y * g.depth}px)` }}
                >
                  <img src={g.img} alt={`Seminar moment ${i + 1}`} />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* AGENDA */}
        <section className="seminar-highlights">
          <div className="seminar-container">
            <div className="seminar-section-head">
              <div className="kicker">The Program</div>
              <h2>A Day Of Transformation</h2>
              <p>From powerful keynotes to intimate expert consultations — every session was built for real outcomes.</p>
            </div>
            <div className="seminar-timeline">
              {agenda.map((a, i) => (
                <div className="seminar-tl-item" key={i}>
                  <span className="seminar-tl-dot" />
                  <time>{a.time}</time>
                  <h4>{a.title}</h4>
                  <p>{a.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* TESTIMONIALS */}
        <section className="seminar-testimonials">
          <div className="seminar-container">
            <div className="seminar-section-head">
              <div className="kicker">Voices</div>
              <h2>What Attendees Said</h2>
              <p>The impact speaks for itself — hear it in the words of those who were there.</p>
            </div>
            <div className="seminar-quotes">
              {testimonials.map((t, i) => (
                <div className="seminar-quote" key={i}>
                  <div className="mark">&ldquo;</div>
                  <p>{t.quote}</p>
                  <div className="who">{t.who}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="seminar-cta">
          <h2>Ready For Your Next Chapter?</h2>
          <p>Join our upcoming sessions and get one step closer to your global goals with A Visa Experts.</p>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="seminar-btn" onClick={() => navigate('/appointment')}>Book a Consultation</button>
            <button className="seminar-btn outline" onClick={() => navigate('/consultants')}>Meet Our Experts</button>
          </div>
        </section>
      </div>
    </>
  );
};

export default Seminar;
