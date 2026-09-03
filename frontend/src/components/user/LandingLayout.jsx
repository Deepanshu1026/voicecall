import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { bannerAPI } from '../../services/api';
import SocialLinks from '../common/SocialLinks';
import '../../styles/userLanding.css';

const navLinks = [
  { label: 'Home', href: '/home' },
  { label: 'Services', href: '/services' },
  { label: 'About us', href: '/about' },
  { label: 'Blogs', href: '/blogs' },
  { label: 'Our Advisor', href: '/consultants' },
];

const addressAccordion = [
  { key: 'noida', title: 'Uttar pradesh Office', span: '(IN)', content: 'B Block, Sector 2, Noida, Uttar Pradesh 201301', flag: '/images/user/indflgsvg 1.webp' },
  { key: 'ahmedabad', title: 'Ahmedabad', span: '(IN)', content: 'A-1 , First Floor, Valmik Complex, opposite Kalupur Bank, near Parimal Cross Road, Shanti Sadan Society, Ambawadi, Ahmedabad, Gujarat 380006', flag: '/images/user/indflgsvg 1.webp' },
  { key: 'newyork', title: 'New York Office', span: '(USA)', content: '300 International Dr Suite 100, Williamsville, NY 14221, United States', flag: 'us' },
  { key: 'florida', title: 'Florida Office', span: '(USA)', content: '2012 Hollywood Blvd, Hollywood, FL 33020, USA', flag: 'us' },
  { key: 'seattle', title: 'Seattle', span: '(USA)', content: '3614 California Ave SW, Seattle, WA 98116, USA', flag: 'us' },
  { key: 'london', title: 'London office', span: '(UK)', content: '128 City Rd, London EC1V 2NX, UK', flag: 'uk' },
];

const LandingLayout = ({ children }) => {
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [bannerOpen, setBannerOpen] = useState(false);
  const [banner, setBanner] = useState({ enabled: true, imageUrl: '', altText: 'Special offer', link: '' });
  const [bannerLoading, setBannerLoading] = useState(true);
  const [accordionOpen, setAccordionOpen] = useState({
    noida: true,
    ahmedabad: false,
    newyork: false,
    florida: false,
    seattle: false,
    london: false,
  });

  useEffect(() => {
    const handleScroll = () => {
      if (window.innerWidth > 1008) {
        setScrolled(window.scrollY > 50);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    const handleResize = () => {
      if (window.innerWidth <= 1008) setScrolled(false);
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    const loadBanner = async () => {
      try {
        const res = await bannerAPI.getBanner();
        const data = res.data?.data || res.data || {};
        setBanner({
          enabled: data.enabled !== false,
          imageUrl: data.imageUrl || '',
          altText: data.altText || 'Special offer',
          link: data.link || '',
        });
        if (data.enabled !== false && data.imageUrl) {
          setBannerOpen(true);
        }
      } catch (err) {
        console.error('Failed to load banner', err);
      } finally {
        setBannerLoading(false);
      }
    };
    loadBanner();
  }, []);

  const closeBanner = () => {
    setBannerOpen(false);
  };

  const toggleAccordion = (key) => {
    setAccordionOpen((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="user-landing">
      {/* Top contact bar */}
      <div className="landing-top-bar">
        <div className="landing-top-bar-inner">
          <span className="landing-top-bar-label">Call us on</span>
          <a href="tel:+911204502750" className="landing-top-bar-phone">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
            +91 120-4502750
          </a>
          <a href="tel:+919711000022" className="landing-top-bar-phone">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
            +91 9711000022
          </a>
        </div>
      </div>

      {/* Header */}
      <header className={`landing-header ${scrolled ? 'scrolled' : ''}`}>
        <div className="landing-header-left">
          <a href="/home" className="landing-logo-link">
            <img className="landing-logo" src="/images/user/tmlogo 1.webp" alt="Visa Experts" />
          </a>
        </div>

        <nav className={`landing-nav-links ${menuOpen ? 'nav-open' : ''}`}>
          {navLinks.map((link) => {
            const isActive =
              link.href === '/home'
                ? location.pathname === '/home' || location.pathname === '/'
                : location.pathname === link.href || location.pathname.startsWith(link.href + '/');
            return (
              <a
                key={link.label}
                className={`default-bg ${isActive ? 'activelink' : ''}`}
                href={link.href}
              >
                {link.label}
              </a>
            );
          })}
          {!isAuthenticated && (
            <a className="landing-login-link mobile-only" href="/login">
              Login
            </a>
          )}
        </nav>

        <div className="landing-header-right">
          {!isAuthenticated && (
            <a className="landing-login-link desktop-only" href="/login">
              Login
            </a>
          )}
          <button
            className={`menu-toggle ${menuOpen ? 'cross' : ''}`}
            aria-label="Menu Toggle"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <span></span>
            <span className="second-span"></span>
            <span className="last-span"></span>
          </button>
        </div>
      </header>

      {/* Offer banner popup */}
      {!bannerLoading && bannerOpen && banner.enabled && banner.imageUrl && (
        <div className="offer-banner-overlay" onClick={closeBanner}>
          <div className="offer-banner-popup" onClick={(e) => e.stopPropagation()}>
            <button
              className="offer-banner-close"
              onClick={closeBanner}
              aria-label="Close offer banner"
            >
              &times;
            </button>
            <div className="offer-banner-content">
              {banner.link ? (
                <a href={banner.link} target="_blank" rel="noopener noreferrer" className="offer-banner-link">
                  <img src={banner.imageUrl} alt={banner.altText} className="offer-banner-image" />
                </a>
              ) : (
                <img src={banner.imageUrl} alt={banner.altText} className="offer-banner-image" />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Page content */}
      {children}

      {/* Footer */}
      <footer className="site-footer">
        <div className="footer-wrapper">
          <div className="footer-section footer-logo-section">
            <img className="footer-logo" src="/images/user/tmlogo 1.webp" alt="Logo" />
            <p>A Visa Expert helps individuals secure visas for the US, UK, Canada, New Zealand, and Australia. Our experienced team offers
              personalized guidance, ensuring a smooth application process for tourist, student, and work visas.</p>
          </div>

          <div className="footer-section footer-second-clm">
            <h3>About</h3>
            <ul>
              <li><a href="/about">About Us</a></li>
              <li><a href="/home">Contact Us</a></li>
              <li><a href="/agent/login">AVE Partners</a></li>
            </ul>
          </div>
          <div className="footer-section footer-second-clm">
            <h3>Help</h3>
            <ul>
              <li><a href="/consultants">Consultant</a></li>
            </ul>
          </div>
          <div className="footer-section footer-second-clm">
            <h3>Get In Touch</h3>
            <ul>
              <li><a href="/home">Contact Us</a></li>
            </ul>
          </div>

          <div className="ouetr-address-sec">
            <div className="accordion">
              {addressAccordion.map((item) => (
                <div className="accordion-item" key={item.key}>
                  <div className="accordion-header" onClick={() => toggleAccordion(item.key)}>
                    <div className="svgname">
                      {item.flag === 'us' ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="60" height="42" viewBox="0 0 60 42" fill="none">
                          <g clipPath="url(#clipUS)">
                            <mask id="maskUS" style={{ maskType: 'alpha' }} maskUnits="userSpaceOnUse" x="0" y="0" width="60" height="42">
                              <path d="M54.2794 0H6.51749C3.41417 0 0.898438 2.46542 0.898438 5.50667V35.7933C0.898438 38.8346 3.41417 41.3 6.51749 41.3H54.2794C57.3827 41.3 59.8984 38.8346 59.8984 35.7933V5.50667C59.8984 2.46542 57.3827 0 54.2794 0Z" fill="white" />
                            </mask>
                            <g mask="url(#maskUS)">
                              <path d="M54.2794 0H6.51749C3.41417 0 0.898438 2.46542 0.898438 5.50667V35.7933C0.898438 38.8346 3.41417 41.3 6.51749 41.3H54.2794C57.3827 41.3 59.8984 38.8346 59.8984 35.7933V5.50667C59.8984 2.46542 57.3827 0 54.2794 0Z" fill="white" />
                              <path fillRule="evenodd" clipRule="evenodd" d="M0.898438 0H26.1842V19.2733H0.898438V0Z" fill="#444379" />
                              <path fillRule="evenodd" clipRule="evenodd" d="M3.70703 2.75342V5.50675H6.51656V2.75342H3.70703ZM9.32608 2.75342V5.50675H12.1356V2.75342H9.32608ZM14.9451 2.75342V5.50675H17.7547V2.75342H14.9451ZM20.5642 2.75342V5.50675H23.3737V2.75342H20.5642ZM17.7547 5.50675V8.26009H20.5642V5.50675H17.7547ZM12.1356 5.50675V8.26009H14.9451V5.50675H12.1356ZM6.51656 5.50675V8.26009H9.32608V5.50675H6.51656ZM3.70703 8.26009V11.0134H6.51656V8.26009H3.70703ZM9.32608 8.26009V11.0134H12.1356V8.26009H9.32608ZM14.9451 8.26009V11.0134H17.7547V8.26009H14.9451ZM20.5642 8.26009V11.0134H23.3737V8.26009H20.5642ZM3.70703 13.7668V16.5201H6.51656V13.7668H3.70703ZM9.32608 13.7668V16.5201H12.1356V13.7668H9.32608ZM14.9451 13.7668V16.5201H17.7547V13.7668H14.9451ZM20.5642 13.7668V16.5201H23.3737V13.7668H20.5642ZM17.7547 11.0134V13.7668H20.5642V11.0134H17.7547ZM12.1356 11.0134V13.7668H14.9451V11.0134H12.1356ZM6.51656 11.0134V13.7668H9.32608V11.0134H6.51656Z" fill="#A7B6E7" />
                              <path fillRule="evenodd" clipRule="evenodd" d="M26.1842 0V2.75333H59.8984V0H26.1842ZM26.1842 5.50667V8.26H59.8984V5.50667H26.1842ZM26.1842 11.0133V13.7667H59.8984V11.0133H26.1842ZM26.1842 16.52V19.2733H59.8984V16.52H26.1842ZM0.898438 22.0267V24.78H59.8984V22.0267H0.898438ZM0.898438 27.5333V30.2867H59.8984V27.5333H0.898438ZM0.898438 33.04V35.7933H59.8984V33.04H0.898438ZM0.898438 38.5467V41.3H59.8984V38.5467H0.898438Z" fill="#ED4C49" />
                              <path d="M54.2809 1.37671H6.51897C4.19149 1.37671 2.30469 3.22577 2.30469 5.50671V35.7934C2.30469 38.0743 4.19149 39.9234 6.51897 39.9234H54.2809C56.6084 39.9234 58.4952 38.0743 58.4952 35.7934V5.50671C58.4952 3.22577 56.6084 1.37671 54.2809 1.37671Z" stroke="black" strokeOpacity="0.1" strokeWidth="0.59" />
                            </g>
                          </g>
                          <defs>
                            <clipPath id="clipUS">
                              <rect width="59" height="41.3" fill="white" transform="translate(0.898438)" />
                            </clipPath>
                          </defs>
                        </svg>
                      ) : item.flag === 'uk' ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="59" height="42" viewBox="0 0 59 42" fill="none">
                          <g clipPath="url(#clipUK)">
                            <mask id="maskUK" style={{ maskType: 'alpha' }} maskUnits="userSpaceOnUse" x="0" y="0" width="59" height="42">
                              <path d="M53.381 0H5.61905C2.51573 0 0 2.46542 0 5.50667V35.7933C0 38.8346 2.51573 41.3 5.61905 41.3H53.381C56.4843 41.3 59 38.8346 59 35.7933V5.50667C59 2.46542 56.4843 0 53.381 0Z" fill="white" />
                            </mask>
                            <g mask="url(#maskUK)">
                              <path d="M53.381 0H5.61905C2.51573 0 0 2.46542 0 5.50667V35.7933C0 38.8346 2.51573 41.3 5.61905 41.3H53.381C56.4843 41.3 59 38.8346 59 35.7933V5.50667C59 2.46542 56.4843 0 53.381 0Z" fill="#22438B" />
                              <path fillRule="evenodd" clipRule="evenodd" d="M8.42647 2.75342L2.73438 2.825L2.80742 8.26008L50.5188 38.6238L56.2418 38.522L56.135 33.1199L8.42647 2.75342Z" fill="white" />
                              <path fillRule="evenodd" clipRule="evenodd" d="M5.61812 2.75342L2.80859 5.50675L53.38 38.5468L56.1896 35.7934L5.61812 2.75342Z" fill="#C7152A" />
                              <path fillRule="evenodd" clipRule="evenodd" d="M50.5709 2.75342H56.1899V8.26008C56.1899 8.26008 23.178 28.6237 8.47859 38.6238C8.30159 38.745 2.86516 38.6321 2.86516 38.6321L2.42969 33.398L50.5709 2.75342Z" fill="white" />
                              <path fillRule="evenodd" clipRule="evenodd" d="M53.5008 2.67627L56.1896 5.5067L5.61812 38.5467L2.80859 35.7934L53.5008 2.67627Z" fill="#C7152A" />
                              <path fillRule="evenodd" clipRule="evenodd" d="M22.4753 2.75342H36.5229V13.7668H56.1896V27.5334H36.5229V38.5468H22.4753V27.5334H2.80859V13.7668H22.4753V2.75342Z" fill="white" />
                              <path fillRule="evenodd" clipRule="evenodd" d="M25.2848 2.75342H33.7134V16.5201H56.1896V24.7801H33.7134V38.5468H25.2848V24.7801H2.80859V16.5201H25.2848V2.75342Z" fill="#C7152A" />
                              <path d="M53.3824 1.37671H5.62054C3.29305 1.37671 1.40625 3.22577 1.40625 5.50671V35.7934C1.40625 38.0743 3.29305 39.9234 5.62054 39.9234H53.3824C55.7099 39.9234 57.5967 38.0743 57.5967 35.7934V5.50671C57.5967 3.22577 55.7099 1.37671 53.3824 1.37671Z" stroke="black" strokeOpacity="0.1" strokeWidth="0.59" />
                            </g>
                          </g>
                          <defs>
                            <clipPath id="clipUK">
                              <rect width="59" height="41.3" fill="white" />
                            </clipPath>
                          </defs>
                        </svg>
                      ) : (
                        <img style={{ borderRadius: '5px' }} width="40px" src={item.flag} alt="flag" />
                      )}
                      <div className="ofic-nm">{item.title} <span>{item.span}</span></div>
                    </div>
                    <span className="footer-add-icon">{accordionOpen[item.key] ? 'âˆ’' : '+'}</span>
                  </div>
                  <div className="accordion-content" style={{ display: accordionOpen[item.key] ? 'block' : 'none' }}>
                    <p>{item.content}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="footer-section footer-second-clm margin-footer">
            <h3>Follow Us</h3>
            <SocialLinks className="social-media-links" />
          </div>
        </div>
      </footer>

      <div className="footer-bottom-text">
        <div className="copy-right">&copy; 2025-2026 All Rights Reserved.</div>
        <a href="/agent/login" className="footer-partner-login">
          AVE Partners
        </a>
      </div>
    </div>
  );
};

export default LandingLayout;
