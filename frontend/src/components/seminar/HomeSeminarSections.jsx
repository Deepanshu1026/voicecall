import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/seminar.css';

const gallery = [
  { img: 'https://res.cloudinary.com/fniv4k20/image/upload/v1788524351/DSC08783-100kb_yq5ibr.jpg', cls: 'wide', depth: 18 },
  { img: 'https://res.cloudinary.com/fniv4k20/image/upload/v1788524351/DSC08782-100kb_ieygmt.jpg', cls: '', depth: 10 },
  { img: 'https://res.cloudinary.com/fniv4k20/image/upload/v1788523874/DSC08565_bboj12.jpg', cls: 'tall', depth: 26 },
  { img: 'https://res.cloudinary.com/fniv4k20/image/upload/v1788523873/DSC08560_wvvwqo.jpg', cls: '', depth: 12 },
  { img: 'https://res.cloudinary.com/fniv4k20/image/upload/v1788523872/DSC08562_ysozce.jpg', cls: '', depth: 8 },
  {
    type: 'card',
    cls: 'collage-feature-card card-1',
    depth: 14,
    badge: 'LIVE FROM THE STAGE',
    title: '500+ Ambitious Minds',
    desc: 'Actionable blueprints for Canada, UK, Australia & Europe migration.',
    action: 'Watch Highlights',
    arrow: 'loop',
  },
  { img: 'https://res.cloudinary.com/fniv4k20/image/upload/v1788523873/DSC08563_cwiyq0.jpg', cls: 'wide', depth: 22 },
  { img: 'https://res.cloudinary.com/fniv4k20/image/upload/v1788523872/DSC08564_ai9hwh.jpg', cls: '', depth: 15 },
  {
    type: 'card',
    cls: 'collage-feature-card card-2',
    depth: 20,
    badge: 'WHAT LIES AHEAD',
    title: 'Your Global Future',
    desc: 'Personalized legal advisory to turn migration dreams into reality.',
    action: 'Discover Agenda',
    arrow: 'down',
  },
];

const HomeSeminarSections = () => {
  const navigate = useNavigate();
  const [mouse, setMouse] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMouse({
      x: (e.clientX - rect.left) / rect.width - 0.5,
      y: (e.clientY - rect.top) / rect.height - 0.5,
    });
  };

  return (
    <section className="seminar-collage" onMouseMove={handleMouseMove}>
      <div className="seminar-collage-inner">
        <div className="seminar-section-head">
          <div className="kicker">The Moments</div>
          <h2>Captured At The Seminar</h2>
          <p>Move your cursor and watch the moments come alive.</p>
        </div>
        <div className="seminar-collage-grid">
          {gallery.map((g, i) =>
            g.type === 'card' ? (
              <div
                className={`g-item ${g.cls}`}
                key={i}
                style={{ transform: `translate(${mouse.x * g.depth}px, ${mouse.y * g.depth}px)` }}
                onClick={() => {
                  if (g.arrow === 'down') {
                    navigate('/seminar');
                  } else {
                    document.querySelector('.outer-hero-new')?.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
              >
                <div className="collage-card-glow" />
                <div className="collage-card-corner tl" />
                <div className="collage-card-corner br" />

                <div>
                  <div className="collage-card-badge">
                    <span className="collage-card-dot" />
                    {g.badge}
                  </div>
                  <h3 className="collage-card-title">{g.title}</h3>
                  <p className="collage-card-desc">{g.desc}</p>
                </div>

                <div className="collage-card-bottom">
                  <span className="collage-card-action">{g.action}</span>
                  {g.arrow === 'loop' ? (
                    <svg className="collage-fancy-arrow arrow-curve-loop" viewBox="0 0 110 44" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <defs>
                        <linearGradient id={`goldGradLoop-${i}`} x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#c9a24b" stopOpacity="0.35" />
                          <stop offset="50%" stopColor="#f7dc99" />
                          <stop offset="100%" stopColor="#c9a24b" />
                        </linearGradient>
                      </defs>
                      <circle cx="8" cy="34" r="2" fill="#c9a24b" opacity="0.45" />
                      <circle cx="18" cy="35" r="2.5" fill="#c9a24b" opacity="0.75" />
                      <path d="M28 35 C 50 36, 62 10, 84 14 C 92 16, 99 23, 106 30" stroke={`url(#goldGradLoop-${i})`} strokeWidth="2.5" strokeLinecap="round" />
                      <path d="M95 30 L 106 31 L 103 20" stroke={`url(#goldGradLoop-${i})`} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : (
                    <svg className="collage-fancy-arrow arrow-curve-down" viewBox="0 0 76 58" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <defs>
                        <linearGradient id={`goldGradDown-${i}`} x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#c9a24b" stopOpacity="0.35" />
                          <stop offset="50%" stopColor="#f7dc99" />
                          <stop offset="100%" stopColor="#c9a24b" />
                        </linearGradient>
                      </defs>
                      <path d="M10 10 C 35 4, 68 12, 64 36 C 61 46, 48 50, 36 53" stroke={`url(#goldGradDown-${i})`} strokeWidth="2.5" strokeLinecap="round" strokeDasharray="4 2.5" />
                      <path d="M47 46 L 35 54 L 38 41" stroke={`url(#goldGradDown-${i})`} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
              </div>
            ) : (
              <div
                className={`g-item ${g.cls}`}
                key={i}
                style={{ transform: `translate(${mouse.x * g.depth}px, ${mouse.y * g.depth}px)` }}
              >
                <img src={g.img} alt={`Seminar moment ${i + 1}`} />
              </div>
            )
          )}
        </div>
      </div>
    </section>
  );
};

export default HomeSeminarSections;
