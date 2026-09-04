import { useNavigate, Link } from 'react-router-dom';
import SEO from '../components/common/SEO';
import '../styles/seminar.css';

const achievements = [
  { num: '2 Lakh+', label: 'Happy Clients' },
  { num: '7+ Years', label: 'of Experience' },
  { num: '40+', label: 'Immigration Lawyers' },
  { num: '100%', label: 'Success Rate' },
];

const expertise = [
  'Tourist Visas — USA, UK, Canada, Europe, Australia & NZ',
  'Work & Business Visas',
  'Permanent Residency (PR) Applications',
  'Student & Study Abroad Programs',
  'Refusal Case Appeals & Re-applications',
];

const SeminarSpeaker = () => {
  const navigate = useNavigate();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Kaveesh Kapoor',
    jobTitle: 'Chairman & Founder',
    worksFor: { '@type': 'Organization', name: 'A Visa Experts' },
  };

  return (
    <>
      <SEO
        title="Kaveesh Kapoor — Chairman & Founder | A Visa Experts Seminar"
        description="Meet Kaveesh Kapoor, Chairman & Founder of A Visa Experts, and hear his insights from the Global Immigration Success Seminar."
        canonicalPath="/seminar/kaveesh-kapoor"
        ogImage="/images/user/sirpic 1.webp"
        jsonLd={jsonLd}
      />

      <nav className="seminar-nav">
        <Link to="/home" className="seminar-nav-logo">
          <img src="/images/user/tmlogo 1.webp" alt="A Visa Experts" />
        </Link>
        <Link to="/seminar" className="seminar-nav-back">
          ← Back to Seminar
        </Link>
      </nav>

      <div className="seminar-page">
        {/* Speaker hero */}
        <section className="speaker-hero">
          <div className="speaker-hero-inner">
            <div className="speaker-photo">
              <img src="/images/user/sirpic 1.webp" alt="Kaveesh Kapoor" />
              <span className="speaker-photo-badge">Guest Speaker</span>
            </div>

            <div className="speaker-intro">
              <div className="seminar-eyebrow">The Speaker</div>
              <h1>Kaveesh Kapoor</h1>
              <div className="speaker-role">Chairman & Founder — A Visa Experts</div>
              <p className="speaker-description">
                A visionary leader in the immigration industry, Kaveesh Kapoor has helped over
                <strong> two lakh clients</strong> across the globe secure their visas and settle abroad.
                With more than seven years of hands-on experience, he has built A Visa Experts into one of
                India&apos;s most trusted immigration consultancies — known for genuine guidance, transparent
                processes and an unmatched success rate.
              </p>
              <p className="speaker-description">
                At the Global Immigration Success Seminar 2026, Kaveesh shared his personal playbook for
                visa approval — breaking down exactly what makes an application successful and the common
                mistakes that lead to refusals — leaving the audience with a clear, actionable roadmap.
              </p>

              <div className="speaker-stats">
                {achievements.map((a) => (
                  <div className="speaker-stat" key={a.label}>
                    <div className="speaker-stat-num">{a.num}</div>
                    <div className="speaker-stat-label">{a.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Expertise */}
        <section className="speaker-expertise">
          <div className="seminar-container">
            <div className="seminar-section-head">
              <div className="kicker">Areas of Expertise</div>
              <h2>What Kaveesh Covers</h2>
            </div>
            <div className="speaker-expertise-list">
              {expertise.map((item) => (
                <div className="speaker-expertise-item" key={item}>
                  <span className="speaker-expertise-dot" />
                  {item}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="seminar-cta">
          <h2>Hear More From Kaveesh</h2>
          <p>Revisit the seminar highlights or book a consultation to get his expert guidance directly.</p>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="seminar-btn" onClick={() => navigate('/seminar')}>Watch Seminar Highlights</button>
            <button className="seminar-btn outline" onClick={() => navigate('/appointment')}>Book a Consultation</button>
          </div>
        </section>
      </div>
    </>
  );
};

export default SeminarSpeaker;
