import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../../styles/userLanding.css';

const navLinks = [
  { label: 'Home', href: '/home' },
  { label: 'Services', href: '/home' },
  { label: 'About us', href: '/home' },
  { label: 'Blogs', href: '/home' },
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
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [accordionOpen, setAccordionOpen] = useState({
    noida: true,
    ahmedabad: false,
    newyork: false,
    florida: false,
    seattle: false,
    london: false,
  });

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleAccordion = (key) => {
    setAccordionOpen((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="user-landing">
      {/* Header */}
      <header className={`landing-header ${scrolled ? 'scrolled' : ''}`}>
        <a href="/home" className="landing-logo-link">
          <img className="landing-logo" src="/images/user/tmlogo 1.webp" alt="Visa Experts" />
        </a>

        <nav className={`landing-nav-links ${menuOpen ? 'nav-open' : ''}`}>
          {navLinks.map((link) => (
            <a key={link.label} className="default-bg" href={link.href}>
              {link.label}
            </a>
          ))}
          <Link className="landing-login-link" to="/login">
            Login
          </Link>
          <div className="social-icon">
            <a href="/home" aria-label="instagram">
              <img src="/images/user/instagram 1.webp" alt="instagram" />
            </a>
            <a href="/home" aria-label="twitter">
              <img src="/images/user/skill-icons_twitter (1) 1.webp" alt="twitter" />
            </a>
            <a href="/home" aria-label="facebook">
              <img src="/images/user/logos_facebook 1.webp" alt="facebook" />
            </a>
          </div>
        </nav>

        <button
          className={`menu-toggle ${menuOpen ? 'cross' : ''}`}
          aria-label="Menu Toggle"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <span></span>
          <span className="second-span"></span>
          <span className="last-span"></span>
        </button>
      </header>

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
              <li><a href="/home">About Us</a></li>
              <li><a href="/home">Contact Us</a></li>
              <li><a href="/home">AVE Partners</a></li>
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
                    <span className="footer-add-icon">{accordionOpen[item.key] ? '−' : '+'}</span>
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
            <div className="social-media-links">
              <a href="/home" aria-label="YouTube">
                <svg xmlns="http://www.w3.org/2000/svg" width="30" height="31" viewBox="0 0 64 45" fill="none">
                  <g clipPath="url(#clipYT2)">
                    <path d="M62.5865 7.01875C62.2195 5.66214 61.5034 4.42536 60.5096 3.43157C59.5159 2.43778 58.2791 1.72165 56.9226 1.3545C51.9561 0 31.9675 0 31.9675 0C31.9675 0 11.978 0.0409999 7.01155 1.3955C5.65492 1.76267 4.41816 2.47884 3.42441 3.47268C2.43066 4.46651 1.7146 5.70334 1.34755 7.06C-0.154702 15.8845 -0.737452 29.331 1.3888 37.8025C1.75589 39.1591 2.47196 40.3959 3.46571 41.3897C4.45946 42.3835 5.6962 43.0996 7.0528 43.4668C12.0193 44.8213 32.0083 44.8213 32.0083 44.8213C32.0083 44.8213 51.997 44.8213 56.9633 43.4668C58.3199 43.0996 59.5567 42.3835 60.5505 41.3897C61.5443 40.3959 62.2604 39.1591 62.6275 37.8025C64.212 28.9655 64.7003 15.5273 62.5865 7.01875Z" fill="#FF0000" />
                    <path d="M25.6055 32.0137L42.1875 22.4092L25.6055 12.8047V32.0137Z" fill="white" />
                  </g>
                  <defs>
                    <clipPath id="clipYT2">
                      <rect width="64" height="45" fill="white" />
                    </clipPath>
                  </defs>
                </svg>
              </a>
              <a href="/home" aria-label="X">
                <svg xmlns="http://www.w3.org/2000/svg" width="30" height="31" viewBox="0 0 24 24" fill="none">
                  <path fillRule="evenodd" clipRule="evenodd" d="M5 1C3.93913 1 2.92172 1.42143 2.17157 2.17157C1.42143 2.92172 1 3.93913 1 5V19C1 20.0609 1.42143 21.0783 2.17157 21.8284C2.92172 22.5786 3.93913 23 5 23H19C20.0609 23 21.0783 22.5786 21.8284 21.8284C22.5786 21.0783 23 20.0609 23 19V5C23 3.93913 22.5786 2.92172 21.8284 2.17157C21.0783 1.42143 20.0609 1 19 1H5ZM4.666 4.5C4.55653 4.54068 4.45808 4.60637 4.37848 4.69182C4.29887 4.77727 4.24033 4.88013 4.2075 4.99221C4.17468 5.10428 4.16848 5.22248 4.1894 5.33737C4.21032 5.45227 4.25778 5.56069 4.328 5.654L9.942 13.104L4.027 19.449L3.983 19.5H6.03L10.86 14.321L14.572 19.249C14.6581 19.3631 14.775 19.4502 14.909 19.5H19.331C19.4403 19.4591 19.5386 19.3933 19.6179 19.3077C19.6973 19.2222 19.7556 19.1193 19.7883 19.0072C19.8209 18.8952 19.8269 18.7771 19.8059 18.6623C19.7848 18.5475 19.7373 18.4392 19.667 18.346L14.053 10.896L20.017 4.5H17.967L13.137 9.68L9.423 4.752C9.33702 4.63756 9.22008 4.55012 9.086 4.5H4.666ZM15.546 18.048L6.431 5.952H8.45L17.564 18.047L15.546 18.048Z" fill="black" />
                </svg>
              </a>
              <a href="/home" aria-label="Facebook">
                <svg xmlns="http://www.w3.org/2000/svg" width="30" height="31" viewBox="0 0 30 31" fill="none">
                  <g clipPath="url(#clipFB)">
                    <path d="M30 15.8579C30 7.57369 23.2842 0.85791 15 0.85791C6.71578 0.85791 0 7.57369 0 15.8579C0 23.3448 5.48531 29.5504 12.6562 30.6757V20.1938H8.84766V15.8579H12.6562V12.5532C12.6562 8.79385 14.8957 6.71728 18.322 6.71728C19.9631 6.71728 21.6797 7.01025 21.6797 7.01025V10.7017H19.7883C17.9249 10.7017 17.3438 11.8579 17.3438 13.0442V15.8579H21.5039L20.8389 20.1938H17.3438V30.6757C24.5147 29.5504 30 23.3449 30 15.8579Z" fill="#1877F2" />
                    <path d="M20.835 20.1938L21.5 15.8579H17.3398V13.0442C17.3398 11.8578 17.921 10.7017 19.7844 10.7017H21.6758V7.01025C21.6758 7.01025 19.9592 6.71729 18.318 6.71729C14.8918 6.71729 12.6523 8.79385 12.6523 12.5532V15.8579H8.84375V20.1938H12.6523V30.6757C13.4277 30.7972 14.2113 30.8581 14.9961 30.8579C15.7809 30.8581 16.5645 30.7972 17.3398 30.6757V20.1938H20.835Z" fill="white" />
                  </g>
                  <defs>
                    <clipPath id="clipFB">
                      <rect width="30" height="30" fill="white" transform="translate(0 0.85791)" />
                    </clipPath>
                  </defs>
                </svg>
              </a>
              <a href="/home" aria-label="Instagram">
                <svg xmlns="http://www.w3.org/2000/svg" width="30" height="31" viewBox="0 0 30 31" fill="none">
                  <g clipPath="url(#clipIG)">
                    <path d="M22.9688 0.85791H7.03125C3.148 0.85791 0 4.00591 0 7.88916V23.8267C0 27.7099 3.148 30.8579 7.03125 30.8579H22.9688C26.852 30.8579 30 27.7099 30 23.8267V7.88916C30 4.00591 26.852 0.85791 22.9688 0.85791Z" fill="url(#paint0_radial_IG)" />
                    <path d="M22.9688 0.85791H7.03125C3.148 0.85791 0 4.00591 0 7.88916V23.8267C0 27.7099 3.148 30.8579 7.03125 30.8579H22.9688C26.852 30.8579 30 27.7099 30 23.8267V7.88916C30 4.00591 26.852 0.85791 22.9688 0.85791Z" fill="url(#paint1_radial_IG)" />
                    <path d="M15.0011 4.13916C11.8185 4.13916 11.419 4.15311 10.1691 4.20994C8.92148 4.26713 8.06988 4.46459 7.3248 4.75439C6.55395 5.05369 5.90016 5.45412 5.24883 6.10568C4.59691 6.75713 4.19648 7.41092 3.89625 8.18143C3.60563 8.92674 3.40793 9.77869 3.3518 11.0257C3.2959 12.2757 3.28125 12.6753 3.28125 15.858C3.28125 19.0407 3.29531 19.4389 3.35203 20.6888C3.40945 21.9364 3.60691 22.788 3.89648 23.5331C4.19602 24.304 4.59645 24.9578 5.24801 25.6091C5.89922 26.261 6.55301 26.6624 7.32328 26.9617C8.06895 27.2515 8.92066 27.4489 10.168 27.5061C11.418 27.5629 11.8172 27.5769 14.9996 27.5769C18.1826 27.5769 18.5808 27.5629 19.8307 27.5061C21.0783 27.4489 21.9308 27.2515 22.6765 26.9617C23.447 26.6624 24.0998 26.261 24.7509 25.6091C25.4029 24.9578 25.8032 24.304 26.1035 23.5335C26.3916 22.788 26.5894 21.9362 26.648 20.6891C26.7041 19.4392 26.7188 19.0407 26.7188 15.858C26.7188 12.6753 26.7041 12.276 26.648 11.0259C26.5894 9.77834 26.3916 8.92686 26.1035 8.18178C25.8032 7.41092 25.4029 6.75713 24.7509 6.10568C24.0991 5.45389 23.4472 5.05346 22.6758 4.75451C21.9287 4.46459 21.0766 4.26701 19.8291 4.20994C18.579 4.15311 18.1811 4.13916 14.9974 4.13916H15.0011ZM13.9498 6.251C14.2618 6.25053 14.61 6.251 15.0011 6.251C18.1301 6.251 18.5009 6.26225 19.7365 6.31838C20.8791 6.37064 21.4992 6.56154 21.9123 6.72197C22.4592 6.93432 22.8491 7.18826 23.259 7.59854C23.6692 8.00869 23.923 8.39928 24.1359 8.94619C24.2964 9.35869 24.4875 9.97885 24.5395 11.1214C24.5957 12.3568 24.6079 12.7278 24.6079 15.8553C24.6079 18.9828 24.5957 19.354 24.5395 20.5892C24.4873 21.7318 24.2964 22.352 24.1359 22.7646C23.9236 23.3115 23.6692 23.7009 23.259 24.1108C22.8489 24.521 22.4595 24.7748 21.9123 24.9873C21.4997 25.1484 20.8791 25.3388 19.7365 25.3911C18.5011 25.4472 18.1301 25.4594 15.0011 25.4594C11.8719 25.4594 11.501 25.4472 10.2657 25.3911C9.12316 25.3384 8.50301 25.1475 8.08957 24.987C7.54277 24.7746 7.15207 24.5208 6.74191 24.1106C6.33176 23.7004 6.07793 23.3108 5.865 22.7637C5.65004 22.3511 5.4593 21.7313 5.4075 20.5888C5.3516 19.3539 5.33844 18.9828 5.33844 15.8553C5.33844 12.7278 5.35148 12.3567 5.4075 11.1216C5.45977 9.97885 5.65051 9.35892 5.865 8.94619C6.07781 8.39916 6.33164 8.00932 6.74191 7.59907C7.15195 7.18903 7.54265 6.93497 8.08957 6.72251C8.50242 6.5613 9.12316 6.37056 10.2657 6.31838C11.501 6.26225 11.8719 6.25009 14.9996 6.25009L15.0011 6.251ZM15.0011 9.06416C17.2008 9.06416 18.9833 10.8468 18.9833 13.0464C18.9833 15.2461 17.2008 17.0287 15.0011 17.0287C12.8013 17.0287 11.0187 15.2461 11.0187 13.0464C11.0187 10.8468 12.8013 9.06416 15.0011 9.06416ZM15.0011 10.5605C13.6276 10.5605 12.515 11.6732 12.515 13.0467C12.515 14.4201 13.6276 15.5327 15.0011 15.5327C16.3745 15.5327 17.4871 14.4201 17.4871 13.0467C17.4871 11.6732 16.3745 10.5605 15.0011 10.5605ZM19.6107 7.70009C20.1291 7.70009 20.5505 8.12144 20.5505 8.63984C20.5505 9.15824 20.1291 9.57959 19.6107 9.57959C19.0923 9.57959 18.6709 9.15824 18.6709 8.63984C18.6709 8.12144 19.0923 7.70009 19.6107 7.70009Z" fill="white" />
                  </g>
                  <defs>
                    <radialGradient id="paint0_radial_IG" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(7.96875 33.1685) rotate(-90) scale(29.7322 27.6533)">
                      <stop stopColor="#FFDD55" />
                      <stop offset="0.1" stopColor="#FFDD55" />
                      <stop offset="0.5" stopColor="#FF543E" />
                      <stop offset="1" stopColor="#C837AB" />
                    </radialGradient>
                    <radialGradient id="paint1_radial_IG" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(-5.02512 3.01896) rotate(78.681) scale(13.2905 54.7837)">
                      <stop stopColor="#3771C8" />
                      <stop offset="0.128" stopColor="#3771C8" />
                      <stop offset="1" stopColor="#6600FF" stopOpacity="0" />
                    </radialGradient>
                    <clipPath id="clipIG">
                      <rect width="30" height="30" fill="white" transform="translate(0 0.85791)" />
                    </clipPath>
                  </defs>
                </svg>
              </a>
              <a href="/home" aria-label="LinkedIn">
                <svg xmlns="http://www.w3.org/2000/svg" width="30" height="31" viewBox="0 0 16 16" fill="none">
                  <g clipPath="url(#clipLI2)">
                    <path d="M12.25 0H3.75C1.67893 0 0 1.67893 0 3.75V12.25C0 14.3211 1.67893 16 3.75 16H12.25C14.3211 16 16 14.3211 16 12.25V3.75C16 1.67893 14.3211 0 12.25 0Z" fill="white" />
                    <path d="M12.25 0H3.75C1.67893 0 0 1.67893 0 3.75V12.25C0 14.3211 1.67893 16 3.75 16H12.25C14.3211 16 16 14.3211 16 12.25V3.75C16 1.67893 14.3211 0 12.25 0Z" fill="#0A66C2" />
                    <path d="M11.5447 13.6053H13.3741C13.4404 13.6053 13.5039 13.579 13.5508 13.5321C13.5977 13.4852 13.624 13.4217 13.6241 13.3554L13.625 9.49025C13.625 7.47006 13.1897 5.91725 10.8289 5.91725C9.93144 5.88388 9.08512 6.3465 8.62844 7.119C8.6262 7.12275 8.62281 7.12567 8.61876 7.12731C8.61471 7.12895 8.61024 7.12922 8.60603 7.12808C8.60181 7.12694 8.59808 7.12445 8.59542 7.12099C8.59275 7.11754 8.59129 7.1133 8.59125 7.10894V6.35375C8.59125 6.28745 8.56491 6.22386 8.51803 6.17697C8.47114 6.13009 8.40755 6.10375 8.34125 6.10375H6.60519C6.53888 6.10375 6.4753 6.13009 6.42841 6.17697C6.38153 6.22386 6.35519 6.28745 6.35519 6.35375V13.355C6.35519 13.4213 6.38153 13.4849 6.42841 13.5318C6.4753 13.5787 6.53888 13.605 6.60519 13.605H8.43444C8.50074 13.605 8.56433 13.5787 8.61121 13.5318C8.6581 13.4849 8.68444 13.4213 8.68444 13.355V9.89419C8.68444 8.91563 8.87006 7.96794 10.0833 7.96794C11.2792 7.96794 11.2947 9.08769 11.2947 9.95756V13.3553C11.2947 13.4216 11.321 13.4852 11.3679 13.5321C11.4148 13.579 11.4784 13.6053 11.5447 13.6053ZM2.375 3.72675C2.375 4.46825 2.98544 5.07837 3.727 5.07837C4.46838 5.07831 5.07844 4.46781 5.07844 3.72644C5.07831 2.98506 4.46819 2.375 3.72675 2.375C2.98512 2.375 2.375 2.98525 2.375 3.72675ZM2.80994 13.6053H4.64162C4.70793 13.6053 4.77152 13.579 4.8184 13.5321C4.86529 13.4852 4.89162 13.4216 4.89162 13.3553V6.35375C4.89162 6.28745 4.86529 6.22386 4.8184 6.17697C4.77152 6.13009 4.70793 6.10375 4.64162 6.10375H2.80994C2.74363 6.10375 2.68004 6.13009 2.63316 6.17697C2.58628 6.22386 2.55994 6.28745 2.55994 6.35375V13.3553C2.55994 13.4216 2.58628 13.4852 2.63316 13.5321C2.68004 13.579 2.74363 13.6053 2.80994 13.6053Z" fill="white" />
                  </g>
                  <defs>
                    <clipPath id="clipLI2">
                      <rect width="16" height="16" fill="white" />
                    </clipPath>
                  </defs>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>

      <div className="footer-bottom-text">
        <div className="copy-right">&copy; 2025-2026 All Rights Reserved.</div>
      </div>
    </div>
  );
};

export default LandingLayout;
