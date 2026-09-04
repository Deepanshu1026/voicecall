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
