import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import LandingLayout from '../../components/user/LandingLayout';
import '../../styles/userLanding.css';

const UserHome = () => {
  const navigate = useNavigate();
  const [reviewIndex, setReviewIndex] = useState(0);
  const [stats, setStats] = useState({ clients: 0, consultants: 0, years: 0 });

  const reviewsWrapperRef = useRef(null);
  const statsRef = useRef(null);
  const animatedStats = useRef(false);

  const heroCards = [
    {
      title: 'Tourist Visa',
      text: 'Expert Advisors: Free Calls, Chat, and Video for tourist Visa Guidance.',
      img: '/images/user/touristvisa_circle 1.webp',
      href: '/home',
    },
    {
      title: 'Work Visa',
      text: 'Start your work visa process today with our advisers!',
      img: '/images/user/Workvisa_circle 1.webp',
      href: '/home',
    },
    {
      title: 'Via / Transit Visa',
      text: 'Transit visa inquiries? We\'re here to help!',
      img: '/images/user/transitvisa_cirlce 1.webp',
      href: '/home',
    },
  ];

  const reviews = [
    {
      img: '/images/user/review1.webp',
      title: 'Uk Visitor Visa Approved',
      text: 'We are truly grateful! We got our visit visa approved smoothly, all thanks to your amazing support. Sitting in Africa, we saw your Instagram videos, contacted your team, and within days we had our visas—without even stepping out.',
      stars: 4,
    },
    {
      img: '/images/user/review2.webp',
      title: 'Tourist Visa to Uk',
      text: 'After countless rejections and setbacks, I was losing hope—until I saw a video by Avisa Experts on Instagram. Reaching out to them was the best decision I made. My dream finally came true, thanks to their guidance.',
      stars: 5,
    },
    {
      img: '/images/user/sher 1.webp',
      title: 'Europe Work Visa Approved',
      text: 'Work Visa Approved! I am so happy! A big thank you to AvisaExpert Team and especially to Mr. Kaveesh ji for always being there to help and support us. Truly a great professional!',
      stars: 4,
    },
    {
      img: '/images/user/neta 1.webp',
      title: 'Uk Work Visa Approved',
      text: 'Uk Work Visa Approved! I am so happy! A big thank you to AvisaExpert Team and especially to Mr. Kaveesh ji for always being there to help and support us. Truly a great professional!',
      stars: 4,
    },
    {
      img: '/images/user/miss manpreet khandelwal 1.webp',
      title: 'UK Visa Approved,special case',
      text: 'UK Visa Approved! I am extremely happy! A big thanks to AvisaExpert Team and especially to Mr. Kaveesh ji for his unwavering support and expert guidance. Truly outstanding service!',
      stars: 4,
    },
    {
      img: '/images/user/feedback.webp',
      title: 'Our Senior Team Europe Visa Approved',
      text: 'Our Senior Team\'s Europe Visa Approved! A huge thanks to AvisaExpert Team and especially to Mr. Kaveesh ji for their incredible support and guidance. Truly commendable service!',
      stars: 4,
    },
    {
      img: '/images/user/feedback3.webp',
      title: 'UK Visa Approved',
      text: 'UK Visa Approved! I am thrilled! A big thank you to AvisaExpert Team and especially to Mr. Kaveesh ji for their continuous support and guidance. Truly excellent service!',
      stars: 4,
    },
    {
      img: '/images/user/feedback4.webp',
      title: 'Two UK Visa Approved',
      text: 'Two UK Visas Approved! I am delighted! A huge thank you to AvisaExpert Team and especially to Mr. Kaveesh ji for their outstanding support and guidance. Truly remarkable service!',
      stars: 4,
    },
  ];

  const destinations = [
    {
      name: 'Statue of Liberty (UNITED STATE)',
      img: '/images/user/statueofliberty 1.webp',
      flag: '/images/user/US.jpg',
    },
    {
      name: 'Niagara Falls (CANADA)',
      img: '/images/user/stratch2 1.webp',
      flag: '/images/user/CA 1.webp',
    },
    {
      name: 'Big Ben (UNITED KINGDOM)',
      img: '/images/user/bigben 1.webp',
      flag: '/images/user/ukk.webp',
    },
    {
      name: 'Eiffel Tower (EUROPE)',
      img: '/images/user/stretch4 1.webp',
      flag: '/images/user/EU 1.webp',
    },
    {
      name: 'Sydney Opera House (AUSTRALIA)',
      img: '/images/user/stretch5 1.webp',
      flag: '/images/user/aus.webp',
    },
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !animatedStats.current) {
            animatedStats.current = true;
            animateNumber('clients', 20, 1500);
            animateNumber('consultants', 40, 1500);
            animateNumber('years', 5, 1500);
          }
        });
      },
      { threshold: 0.5 }
    );
    if (statsRef.current) observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, []);

  const animateNumber = (key, target, duration) => {
    let start = 0;
    const startTime = performance.now();
    const step = (now) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const current = Math.floor(progress * target);
      setStats((prev) => ({ ...prev, [key]: current }));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  const scrollReviews = (dir) => {
    setReviewIndex((prev) => {
      if (dir === 'next') return prev >= reviews.length - 1 ? 0 : prev + 1;
      return prev <= 0 ? reviews.length - 1 : prev - 1;
    });
  };

  useEffect(() => {
    if (reviewsWrapperRef.current) {
      const cardWidth = reviewsWrapperRef.current.children[0]?.offsetWidth || 350;
      const gap = 100;
      reviewsWrapperRef.current.style.transform = `translateX(-${reviewIndex * (cardWidth + gap)}px)`;
    }
  }, [reviewIndex]);

  const renderStars = (count) => {
    const stars = [];
    for (let i = 0; i < 5; i++) {
      stars.push(<span key={i}>{i < count ? '★' : '☆'}</span>);
    }
    return stars;
  };

  return (
    <LandingLayout>
      {/* Hero */}
      <section className="outer-hero-new">
        <img src="/images/user/slider4 1.webp" className="background-img" alt="slider" />
        <div className="new-hero-sec">
          <div className="new-hero-left">
            <h1>
              <span>Navigate your visa journey effortlessly!</span>
            </h1>
            <div className="parent_btn">
              <button className="herobtn" onClick={() => navigate('/appointment')}>
                Schedule An Appointment Now!
              </button>
              <button className="herobtn outlined-herobtn" onClick={() => navigate('/consultants')}>
                Talk To A Consultant Now!
              </button>
            </div>
          </div>
          <div className="new-hero-right">
            {heroCards.map((card, idx) => (
              <a href={card.href || '/home'} className="new-hero-card-wrapper" key={idx} aria-label={`Learn more about ${card.title}`}>
                <div className="new-hero-card">
                  <img src={card.img} alt={card.title} />
                  <div className="new-hero-card-content">
                    <h3>{card.title}</h3>
                    <p>{card.text}</p>
                  </div>
                  <button className="new-hero-arrow-btn" aria-label={`Navigate to ${card.title}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="34" height="34" viewBox="0 0 34 34" fill="none">
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M13.4167 7.7487C13.8316 7.33377 14.5043 7.33377 14.9193 7.7487L23.4193 16.2487C23.8342 16.6636 23.8342 17.3364 23.4193 17.7513L14.9193 26.2513C14.5043 26.6662 13.8316 26.6662 13.4167 26.2513C13.0017 25.8364 13.0017 25.1636 13.4167 24.7487L21.1654 17L13.4167 9.2513C13.0017 8.83637 13.0017 8.16363 13.4167 7.7487Z"
                        fill="#030D45"
                      />
                    </svg>
                  </button>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Highlights strip */}
      <section className="outer-strip-sec">
        <div className="highlights-container">
          <div className="highlight-item">
            <div className="highlight-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="60" height="37" viewBox="0 0 71 37" fill="none">
                <path
                  d="M35.5 1C19.5 1 10 5.5 3 12C5.5 18 12 25 35.5 25C59 25 65.5 18 68 12C61.5 5.5 51.5 1 35.5 1Z"
                  fill="white"
                />
                <path
                  d="M35.5 27C22 27 12 30 6 34C10 36 18 37 35.5 37C53 37 61 36 65 34C59 30 49 27 35.5 27Z"
                  fill="white"
                />
                <circle cx="35.5" cy="14" r="6" fill="#001e74" />
              </svg>
            </div>
            <div>High Success Rate</div>
          </div>

          <div className="highlight-item">
            <div className="highlight-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none">
                <path
                  d="M26.9993 26.9992L26.9998 27.0004L26.9995 27.0002L21.4676 24.9884C17.9355 23.7039 14.0639 23.7038 10.5318 24.9881L5 26.9995L5.00013 26.9992L15.9997 5.00007L26.9993 26.9992Z"
                  stroke="white"
                  strokeWidth="1.5"
                />
              </svg>
            </div>
            <div>Expert Guidance</div>
          </div>

          <div className="highlight-item">
            <div className="highlight-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M10.0002 12V12.5C10.0002 13.0304 9.78944 13.5391 9.41437 13.9142C9.03929 14.2893 8.53059 14.5 8.00015 14.5C7.46972 14.5 6.96101 14.2893 6.58594 13.9142C6.21087 13.5391 6.00015 13.0304 6.00015 12.5V12M13.3652 10.9822C12.5627 10 11.9961 9.5 11.9961 6.79219C11.9961 4.3125 10.7298 3.42906 9.68765 3C9.54922 2.94312 9.4189 2.8125 9.37672 2.67031C9.1939 2.04812 8.6814 1.5 8.00015 1.5C7.3189 1.5 6.80609 2.04844 6.62515 2.67094C6.58297 2.81469 6.45265 2.94312 6.31422 3C5.27078 3.42969 4.00578 4.31 4.00578 6.79219C4.00422 9.5 3.43765 10 2.63515 10.9822C2.30265 11.3891 2.5939 12 3.17547 12H12.828C13.4064 12 13.6958 11.3872 13.3652 10.9822Z"
                  stroke="white"
                  strokeWidth="0.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path d="M4 2C2.5 2.5 1.5 5.5 2.09462 7" stroke="white" strokeWidth="0.5" strokeLinecap="round" />
                <path d="M12 2C13.5 2.5 14.5 5.5 13.9054 7" stroke="white" strokeWidth="0.5" strokeLinecap="round" />
              </svg>
            </div>
            <div>Regular Updates</div>
          </div>

          <div className="highlight-item">
            <div className="highlight-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="54" height="53" viewBox="0 0 54 53" fill="none">
                <path
                  d="M36.1252 0C35.0939 0.133548 35.1418 1.62622 36.207 1.65625C44.9023 1.65625 51.9414 8.71704 51.9414 17.3862C51.9414 26.0642 44.9023 33.1205 36.207 33.1205H35.724L36.7936 32.0553C37.324 31.5378 36.9361 30.6106 36.177 30.6406C35.961 30.6496 35.7668 30.7314 35.6204 30.8822L33.1361 33.3665C32.8127 33.6899 32.8127 34.2164 33.1361 34.5397L35.6204 37.0196C36.4141 37.7787 37.5572 36.6445 36.7936 35.8554L35.715 34.7768H36.207C45.7995 34.7768 53.5977 26.992 53.5977 17.3862C53.5977 7.7937 45.8167 0 36.207 0C36.177 0 36.1508 0 36.1252 0ZM36.207 5.79688C29.7935 5.79688 24.6178 10.9899 24.6178 17.3862C24.6178 23.7786 29.7846 28.9844 36.207 28.9844C42.625 28.9844 47.8008 23.7786 47.8008 17.3862C47.8008 10.9899 42.6205 5.79688 36.207 5.79688ZM36.207 7.45312C41.6889 7.45312 46.1445 11.887 46.1445 17.3862C46.1445 22.8859 41.6934 27.3237 36.207 27.3237C30.7207 27.3237 26.2651 22.8859 26.2651 17.3862C26.2651 11.887 30.7207 7.45312 36.207 7.45312Z"
                  fill="white"
                />
              </svg>
            </div>
            <div>Easy Refund Policy</div>
          </div>

          <div className="highlight-item">
            <div className="highlight-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="51" height="53" viewBox="0 0 51 53" fill="none">
                <mask id="mask0_2889_11428" maskType="luminance" maskUnits="userSpaceOnUse" x="3" y="3" width="46" height="48">
                  <path d="M3.95312 3.16138H48.4737V50.4695H3.95312V3.16138Z" fill="white" />
                </mask>
                <g mask="url(#mask0_2889_11428)">
                  <path fillRule="evenodd" clipRule="evenodd"
                    d="M21.9892 5.8276C21.1543 4.97628 20 4.44935 18.7249 4.44935C17.4499 4.44935 16.2955 4.97628 15.4601 5.8276C14.6252 6.67893 14.1081 7.8558 14.1081 9.15567C14.1081 10.455 14.6252 11.6318 15.4601 12.4832C16.2955 13.3345 17.4499 13.8614 18.7249 13.8614C20 13.8614 21.1543 13.3345 21.9892 12.4832C22.8246 11.6318 23.3417 10.455 23.3417 9.15567C23.3417 7.8558 22.8246 6.67893 21.9892 5.8276ZM41.7072 20.493C40.0167 18.7697 37.6805 17.7038 35.1007 17.7038C32.5208 17.7038 30.1846 18.7697 28.4941 20.493C26.8036 22.2162 25.7582 24.5974 25.7582 27.2275C25.7582 29.857 26.8036 32.2382 28.4941 33.962C30.1846 35.6852 32.5208 36.7511 35.1007 36.7511C37.6805 36.7511 40.0167 35.6852 41.7072 33.962C43.3977 32.2382 44.4431 29.8575 44.4431 27.2275C44.4431 24.5974 43.3977 22.2162 41.7072 20.493ZM35.1007 16.4469C38.0207 16.4469 40.6646 17.6535 42.5786 19.6044C44.4926 21.5554 45.6761 24.2507 45.6761 27.2275C45.6761 30.2042 44.4926 32.899 42.5786 34.8499C40.6646 36.8009 38.0207 38.0075 35.1007 38.0075C32.1806 38.0075 29.5367 36.8009 27.6227 34.8499C25.7088 32.899 24.5252 30.2042 24.5252 27.2275C24.5252 24.2507 25.7088 21.5554 27.6227 19.6044C29.5367 17.6535 32.1806 16.4469 35.1007 16.4469ZM36.0686 25.879C36.1595 26.1072 36.3678 26.2508 36.5935 26.2674L39.1408 26.4614L37.1892 28.144C36.9967 28.3099 36.9293 28.5708 36.9972 28.802L37.5991 31.3044L35.4235 29.9308C35.2152 29.7998 34.9609 29.8106 34.7683 29.9371L32.6022 31.3044L33.2119 28.7699C33.2687 28.5319 33.1833 28.2928 33.0121 28.144L31.061 26.4614L33.6078 26.2697C33.8677 26.2508 34.0788 26.0701 34.1524 25.8309L35.1007 23.464L36.0692 25.879H36.0686Z"
                    fill="white"
                  />
                </g>
              </svg>
            </div>
            <div>Dedicated Case Manager</div>
          </div>
        </div>
      </section>

      {/* About us */}
      <section className="hero">
        <div className="about-us">
          <h2>About us</h2>
          <div className="content">
            <div className="image-placeholder" />
            <div className="text">
              <h2>Kaveesh Kapoor</h2>
              <p>
                Welcome to A Visa Experts, your trusted name in visa Immigration Industry. We are proud to be
                recognized as the Best Visa Immigration Company, helping people with their plans to work, travel, or
                transit abroad. Founded by Kaveesh Kapoor, our company focuses on providing clear, step-by-step
                support for all types of visa needs.
                As Visa Immigration Experts, we offer help with work visas, tourist visas and transit visas.
                Whether you are applying for the first time or renewing an old visa, we guide you through the process.
                Our goal is to make your experience simple and stress-free.
                Every case is handled with attention and care. We understand how important your plans are and our team
                is always ready to support you. Being the No.1 Visa Immigration Company, we focus on doing the job
                right and on time.
                Let the Visa Immigration Experts at A Visa Experts manage the details so you don’t have to worry.
                Choose the Best Visa Immigration Company for honest service and reliable results. We’re proud to be the
                No.1 Visa Immigration Company for individuals and families looking to go abroad.
                Start your journey with A Visa Experts — where your travel plans begin with confidence.
              </p>
              <div className="social-icons">
                <a href="/home" aria-label="Linkedin">
                  <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 16 16" fill="none">
                    <g clipPath="url(#clipLinkedin)">
                      <path d="M12.25 0H3.75C1.67893 0 0 1.67893 0 3.75V12.25C0 14.3211 1.67893 16 3.75 16H12.25C14.3211 16 16 14.3211 16 12.25V3.75C16 1.67893 14.3211 0 12.25 0Z" fill="white" />
                      <path d="M12.25 0H3.75C1.67893 0 0 1.67893 0 3.75V12.25C0 14.3211 1.67893 16 3.75 16H12.25C14.3211 16 16 14.3211 16 12.25V3.75C16 1.67893 14.3211 0 12.25 0Z" fill="#0A66C2" />
                      <path d="M11.5447 13.6053H13.3741C13.4404 13.6053 13.5039 13.579 13.5508 13.5321C13.5977 13.4852 13.624 13.4217 13.6241 13.3554L13.625 9.49025C13.625 7.47006 13.1897 5.91725 10.8289 5.91725C9.93144 5.88388 9.08512 6.3465 8.62844 7.119C8.6262 7.12275 8.62281 7.12567 8.61876 7.12731C8.61471 7.12895 8.61024 7.12922 8.60603 7.12808C8.60181 7.12694 8.59808 7.12445 8.59542 7.12099C8.59275 7.11754 8.59129 7.1133 8.59125 7.10894V6.35375C8.59125 6.28745 8.56491 6.22386 8.51803 6.17697C8.47114 6.13009 8.40755 6.10375 8.34125 6.10375H6.60519C6.53888 6.10375 6.4753 6.13009 6.42841 6.17697C6.38153 6.22386 6.35519 6.28745 6.35519 6.35375V13.355C6.35519 13.4213 6.38153 13.4849 6.42841 13.5318C6.4753 13.5787 6.53888 13.605 6.60519 13.605H8.43444C8.50074 13.605 8.56433 13.5787 8.61121 13.5318C8.6581 13.4849 8.68444 13.4213 8.68444 13.355V9.89419C8.68444 8.91563 8.87006 7.96794 10.0833 7.96794C11.2792 7.96794 11.2947 9.08769 11.2947 9.95756V13.3553C11.2947 13.4216 11.321 13.4852 11.3679 13.5321C11.4148 13.579 11.4784 13.6053 11.5447 13.6053ZM2.375 3.72675C2.375 4.46825 2.98544 5.07837 3.727 5.07837C4.46838 5.07831 5.07844 4.46781 5.07844 3.72644C5.07831 2.98506 4.46819 2.375 3.72675 2.375C2.98512 2.375 2.375 2.98525 2.375 3.72675ZM2.80994 13.6053H4.64162C4.70793 13.6053 4.77152 13.579 4.8184 13.5321C4.86529 13.4852 4.89162 13.4216 4.89162 13.3553V6.35375C4.89162 6.28745 4.86529 6.22386 4.8184 6.17697C4.77152 6.13009 4.70793 6.10375 4.64162 6.10375H2.80994C2.74363 6.10375 2.68004 6.13009 2.63316 6.17697C2.58628 6.22386 2.55994 6.28745 2.55994 6.35375V13.3553C2.55994 13.4216 2.58628 13.4852 2.63316 13.5321C2.68004 13.579 2.74363 13.6053 2.80994 13.6053Z" fill="white" />
                    </g>
                    <defs>
                      <clipPath id="clipLinkedin">
                        <rect width="16" height="16" fill="white" />
                      </clipPath>
                    </defs>
                  </svg>
                </a>
                <a href="/home" aria-label="instagram">
                  <img src="/images/user/instagram 1.webp" alt="instagram" />
                </a>
                <a href="/home" aria-label="facebook">
                  <img src="/images/user/logos_facebook 1.webp" alt="facebook" />
                </a>
                <a href="/home" aria-label="you-tube">
                  <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 64 45" fill="none">
                    <g clipPath="url(#clipYoutube)">
                      <path d="M62.5865 7.01875C62.2195 5.66214 61.5034 4.42536 60.5096 3.43157C59.5159 2.43778 58.2791 1.72165 56.9226 1.3545C51.9561 0 31.9675 0 31.9675 0C31.9675 0 11.978 0.0409999 7.01155 1.3955C5.65492 1.76267 4.41816 2.47884 3.42441 3.47268C2.43066 4.46651 1.7146 5.70334 1.34755 7.06C-0.154702 15.8845 -0.737452 29.331 1.3888 37.8025C1.75589 39.1591 2.47196 40.3959 3.46571 41.3897C4.45946 42.3835 5.6962 43.0996 7.0528 43.4668C12.0193 44.8213 32.0083 44.8213 32.0083 44.8213C32.0083 44.8213 51.997 44.8213 56.9633 43.4668C58.3199 43.0996 59.5567 42.3835 60.5505 41.3897C61.5443 40.3959 62.2604 39.1591 62.6275 37.8025C64.212 28.9655 64.7003 15.5273 62.5865 7.01875Z" fill="#FF0000" />
                      <path d="M25.6055 32.0137L42.1875 22.4092L25.6055 12.8047V32.0137Z" fill="white" />
                    </g>
                    <defs>
                      <clipPath id="clipYoutube">
                        <rect width="64" height="45" fill="white" />
                      </clipPath>
                    </defs>
                  </svg>
                </a>
                <a href="/home" aria-label="Twitter">
                  <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none">
                    <path fillRule="evenodd" clipRule="evenodd" d="M5 1C3.93913 1 2.92172 1.42143 2.17157 2.17157C1.42143 2.92172 1 3.93913 1 5V19C1 20.0609 1.42143 21.0783 2.17157 21.8284C2.92172 22.5786 3.93913 23 5 23H19C20.0609 23 21.0783 22.5786 21.8284 21.8284C22.5786 21.0783 23 20.0609 23 19V5C23 3.93913 22.5786 2.92172 21.8284 2.17157C21.0783 1.42143 20.0609 1 19 1H5ZM4.666 4.5C4.55653 4.54068 4.45808 4.60637 4.37848 4.69182C4.29887 4.77727 4.24033 4.88013 4.2075 4.99221C4.17468 5.10428 4.16848 5.22248 4.1894 5.33737C4.21032 5.45227 4.25778 5.56069 4.328 5.654L9.942 13.104L4.027 19.449L3.983 19.5H6.03L10.86 14.321L14.572 19.249C14.6581 19.3631 14.775 19.4502 14.909 19.5H19.331C19.4403 19.4591 19.5386 19.3933 19.6179 19.3077C19.6973 19.2222 19.7556 19.1193 19.7883 19.0072C19.8209 18.8952 19.8269 18.7771 19.8059 18.6623C19.7848 18.5475 19.7373 18.4392 19.667 18.346L14.053 10.896L20.017 4.5H17.967L13.137 9.68L9.423 4.752C9.33702 4.63756 9.22008 4.55012 9.086 4.5H4.666ZM15.546 18.048L6.431 5.952H8.45L17.564 18.047L15.546 18.048Z" fill="black" />
                  </svg>
                </a>
                <a href="/home" aria-label="kaveesh-kapoor">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <g clipPath="url(#clipPodcast)">
                      <path d="M9 1.5C9 2.32969 9.67031 3 10.5 3C16.2984 3 21 7.70156 21 13.5C21 14.3297 21.6703 15 22.5 15C23.3297 15 24 14.3297 24 13.5C24 6.04219 17.9578 0 10.5 0C9.67031 0 9 0.670312 9 1.5ZM9 6C9 6.82969 9.67031 7.5 10.5 7.5C13.8141 7.5 16.5 10.1859 16.5 13.5C16.5 14.3297 17.1703 15 18 15C18.8297 15 19.5 14.3297 19.5 13.5C19.5 8.53125 15.4688 4.5 10.5 4.5C9.67031 4.5 9 5.17031 9 6ZM4.5 6.75C4.5 5.50781 3.49219 4.5 2.25 4.5C1.00781 4.5 0 5.50781 0 6.75V17.25C0 20.9766 3.02344 24 6.75 24C10.4766 24 13.5 20.9766 13.5 17.25C13.5 13.5234 10.4766 10.5 6.75 10.5H6V15H6.75C7.99219 15 9 16.0078 9 17.25C9 18.4922 7.99219 19.5 6.75 19.5C5.50781 19.5 4.5 18.4922 4.5 17.25V6.75Z" fill="#001E74" />
                    </g>
                    <defs>
                      <clipPath id="clipPodcast">
                        <rect width="24" height="24" fill="white" />
                      </clipPath>
                    </defs>
                  </svg>
                </a>
              </div>
            </div>
          </div>
          <div className="mainstats" ref={statsRef}>
            <div className="stats">
              <div className="stat-item">
                <div className="number">{stats.clients} Lakh</div>
                <div className="business-text">Happy Clients</div>
              </div>
              <div className="stat-item">
                <div className="number">{stats.consultants}+</div>
                <div className="business-text">Our Consultant</div>
              </div>
              <div className="stat-item" style={{ border: 'none' }}>
                <div className="number">{stats.years}+</div>
                <div className="business-text">Years In Business</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact / Send us a message */}
      <section className="lets_connect_section">
        <div className="lets_connect_container">
          <div className="lets_connect_header">
            <div className="lets_connect_badge">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="#3b82f6" strokeWidth="2" />
                <path d="M12 16V12M12 8H12.01" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" />
              </svg>
              Get in Touch
            </div>
            <h2 className="lets_connect_title">
              Let&apos;s Connect <span className="lets_connect_highlight">With Our Team</span>
            </h2>
            <p className="lets_connect_subtitle">
              Have a question about your visa? We&apos;re here to help you every step of the way.
            </p>
          </div>

          <div className="lets_connect_main_grid">
            <div className="lets_connect_contact_section">
              <div className="lets_connect_section_header">
                <h3>Get In Touch</h3>
                <p>Choose your preferred way to connect</p>
              </div>
              <div className="lets_connect_methods">
                <a href="mailto:Support@avisaexperts.com" className="lets_connect_link">
                  <div className="lets_connect_card lets_connect_primary">
                    <div className="lets_connect_card_header">
                      <div className="lets_connect_icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M20 4H4C2.89543 4 2 4.89543 2 6V18C2 19.1046 2.89543 20 4 20H20C21.1046 20 22 19.1046 22 18V6C22 4.89543 21.1046 4 20 4Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          <path d="M22 7L13.03 12.7C12.7213 12.8934 12.3659 12.9963 12.0034 12.9963C11.6409 12.9963 11.2855 12.8934 10.9768 12.7L2 7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                      <div className="lets_connect_status_indicator lets_connect_active"></div>
                    </div>
                    <div className="lets_connect_info">
                      <h4>Email</h4>
                      <span className="lets_connect_contact_detail">Support@avisaexperts.com</span>
                      <span className="lets_connect_response_time">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <circle cx="12" cy="12" r="10" stroke="#3b82f6" strokeWidth="2" />
                          <path d="M12 6V12L16 14" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                        Response within 2-4 hours
                      </span>
                    </div>
                  </div>
                </a>

                <a href="tel:+911204502750" className="lets_connect_link">
                  <div className="lets_connect_card">
                    <div className="lets_connect_card_header">
                      <div className="lets_connect_icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M22 16.92V19.92C22 20.4704 21.7893 20.9997 21.4142 21.3748C21.0391 21.7499 20.5098 21.9606 19.96 21.9606C15.5918 21.6098 11.5316 19.8575 8.36003 16.64C5.14253 13.4684 3.39022 9.40816 3.04 5.04C3.04 4.4902 3.25067 3.96091 3.62577 3.58582C4.00087 3.21072 4.53017 3 5.08 3H8.08C8.85236 3 9.49725 3.55289 9.62 4.316C9.81974 5.71163 10.2737 7.05567 10.96 8.28C11.24 8.78 11.12 9.42 10.68 9.78L8.8 11.28C10.6169 14.3857 13.1143 16.8831 16.22 18.7L17.72 16.82C18.08 16.38 18.72 16.26 19.22 16.54C20.4443 17.2263 21.7884 17.6803 23.184 17.88C23.9471 18.0028 24.5 18.6476 24.5 19.42V22.42" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                      <div className="lets_connect_status_indicator lets_connect_active"></div>
                    </div>
                    <div className="lets_connect_info">
                      <h4>Phone</h4>
                      <span className="lets_connect_contact_detail">+91 120-4502750</span>
                      <span className="lets_connect_response_time">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <rect x="3" y="4" width="18" height="18" rx="2" stroke="#3b82f6" strokeWidth="2" />
                          <path d="M16 2V6M8 2V6M3 10H21" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                        Mon-Sat, 11AM-6PM EST
                      </span>
                    </div>
                  </div>
                </a>

                <a href="https://wa.me/919711000022" className="lets_connect_link">
                  <div className="lets_connect_card">
                    <div className="lets_connect_card_header">
                      <div className="lets_connect_icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M17.6 13.8C17.4 13.7 16.2 13.1 15.9 13C15.6 12.9 15.4 12.9 15.1 13.2C14.9 13.5 14.3 14.1 14.1 14.3C13.9 14.5 13.7 14.5 13.4 14.4C12.4 13.9 11.5 13.2 10.8 12.4C10.2 11.7 9.7 10.9 9.3 10.1C9.2 9.8 9.3 9.6 9.5 9.4C9.7 9.2 9.9 9 10.1 8.8C10.3 8.6 10.4 8.5 10.5 8.2C10.6 8 10.5 7.7 10.4 7.5C10.3 7.3 9.8 6.1 9.6 5.6C9.4 5 9.2 5 8.9 5H8.5C8.2 5 7.8 5.1 7.5 5.4C6.5 6.4 6 7.7 6 9.1C6 9.8 6.2 10.5 6.5 11.2C7.2 12.7 8.2 14.1 9.5 15.2C10.9 16.4 12.6 17.2 14.5 17.7C15.2 17.9 15.9 18 16.6 18C17.8 18 18.9 17.5 19.8 16.7C20.1 16.4 20.2 16.1 20.2 15.7C20.2 15.5 20.2 15.4 20.1 15.3C20 15.1 19.8 14.9 17.6 13.8Z" fill="white" />
                          <path d="M12 2C6.5 2 2 6.5 2 12C2 13.8 2.5 15.5 3.4 17L2.6 20.4L6.1 19.6C7.5 20.4 9.2 20.9 11 20.9C16.5 20.9 21 16.4 21 10.9C21 8.2 19.9 5.8 18.1 4C16.2 2.2 13.7 1.2 11 1.2" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                      <div className="lets_connect_status_indicator lets_connect_active"></div>
                    </div>
                    <div className="lets_connect_info">
                      <h4>WhatsApp Only</h4>
                      <span className="lets_connect_contact_detail">+91 9711000022</span>
                      <span className="lets_connect_response_time">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <rect x="3" y="4" width="18" height="18" rx="2" stroke="#3b82f6" strokeWidth="2" />
                          <path d="M16 2V6M8 2V6M3 10H21" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                        Mon-Sat, 11AM-6PM EST
                      </span>
                    </div>
                  </div>
                </a>

                <a href="/consultants" className="lets_connect_link">
                  <div className="lets_connect_card">
                    <div className="lets_connect_card_header">
                      <div className="lets_connect_icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12 2C9.5 2 7.4 4.1 7.4 6.6C7.4 9.1 9.5 11.2 12 11.2C14.5 11.2 16.6 9.1 16.6 6.6C16.6 4.1 14.5 2 12 2Z" stroke="white" strokeWidth="2" />
                          <path d="M20 22C20 17.6 16.4 14 12 14C7.6 14 4 17.6 4 22" stroke="white" strokeWidth="2" strokeLinecap="round" />
                          <path d="M17 18C17 18 18 19 20 18" stroke="white" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                      </div>
                      <div className="lets_connect_status_indicator lets_connect_active"></div>
                    </div>
                    <div className="lets_connect_info">
                      <h4>Talk to Consultant</h4>
                      <span className="lets_connect_contact_detail">Now</span>
                      <span className="lets_connect_response_time">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          <path d="M9 11C11.2091 11 13 9.20914 13 7C13 4.79086 11.2091 3 9 3C6.79086 3 5 4.79086 5 7C5 9.20914 6.79086 11 9 11Z" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          <path d="M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          <path d="M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89318 18.7122 8.75608 18.1676 9.45769C17.623 10.1593 16.8604 10.6597 16 10.88" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        Perfect for detailed discussions
                      </span>
                    </div>
                  </div>
                </a>
              </div>
            </div>

            <div className="lets_connect_form_section">
              <div className="lets_connect_form_header">
                <h3>Send a Message</h3>
                <p>Submit your query below.</p>
              </div>
              <form className="lets_connect_form" onSubmit={(e) => e.preventDefault()}>
                <div className="form_row">
                  <div className="lets_connect_form_group half_width">
                    <label htmlFor="lets_connect_name">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      Full Name
                    </label>
                    <input type="text" id="lets_connect_name" name="name" placeholder="Enter your full name" required />
                  </div>
                  <div className="lets_connect_form_group half_width">
                    <label htmlFor="lets_connect_email">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M20 4H4C2.89543 4 2 4.89543 2 6V18C2 19.1046 2.89543 20 4 20H20C21.1046 20 22 19.1046 22 18V6C22 4.89543 21.1046 4 20 4Z" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M22 7L13.03 12.7C12.7213 12.8934 12.3659 12.9963 12.0034 12.9963C11.6409 12.9963 11.2855 12.8934 10.9768 12.7L2 7" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      Email Address
                    </label>
                    <input type="email" id="lets_connect_email" name="email" placeholder="Enter your email address" required />
                  </div>
                </div>
                <div className="lets_connect_form_group">
                  <label htmlFor="lets_connect_phone">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M22 16.92V19.92C22 20.4704 21.7893 20.9997 21.4142 21.3748C21.0391 21.7499 20.5098 21.9606 19.96 21.9606C15.5918 21.6098 11.5316 19.8575 8.36003 16.64C5.14253 13.4684 3.39022 9.40816 3.04 5.04C3.04 4.4902 3.25067 3.96091 3.62577 3.58582C4.00087 3.21072 4.53017 3 5.08 3H8.08C8.85236 3 9.49725 3.55289 9.62 4.316C9.81974 5.71163 10.2737 7.05567 10.96 8.28C11.24 8.78 11.12 9.42 10.68 9.78L8.8 11.28C10.6169 14.3857 13.1143 16.8831 16.22 18.7L17.72 16.82C18.08 16.38 18.72 16.26 19.22 16.54C20.4443 17.2263 21.7884 17.6803 23.184 17.88C23.9471 18.0028 24.5 18.6476 24.5 19.42V22.42" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Phone Number
                  </label>
                  <input type="tel" id="lets_connect_phone" name="phone" placeholder="Enter your phone number" required />
                </div>
                <div className="lets_connect_form_group">
                  <label htmlFor="lets_connect_message">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Message
                  </label>
                  <textarea id="lets_connect_message" name="message" rows="5" placeholder="Enter your message" required></textarea>
                </div>
                <div className="lets_connect_form_footer">
                  <div className="lets_connect_privacy_note">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="#10b981" strokeWidth="2" />
                      <path d="M9 12L11 14L15 10" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span>Your information is secure and will never be shared</span>
                  </div>
                  <button type="submit" className="lets_connect_submit_btn">
                    <span className="lets_connect_btn_text">Send Message</span>
                    <span className="lets_connect_btn_icon">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M22 2L11 13" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Destination gallery */}
      <section className="destination-gallery">
        <div className="gallery-content">
          <h2>Enjoy your dream vacation</h2>
          <p>Discover beautiful countries with our hassle-free tourist visa services.</p>
          <button className="view-button" aria-label="View All Destinations">View All</button>
        </div>
        <div className="image-gallery">
          {destinations.map((dest, idx) => (
            <div
              key={idx}
              className={`destination-card ${idx === 0 ? 'first-card' : ''}`}
              style={{ backgroundImage: `url('${dest.img}')` }}
            >
              <div className="location-info">
                <h3>{dest.name}</h3>
                <img className="flag-icon" src={dest.flag} alt="flag" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Client Reviews */}
      <section className="reviews-section">
        <h2>Clients Reviews</h2>
        <div className="reviews-wrapper">
          <div className="reviews-container" ref={reviewsWrapperRef}>
            {reviews.map((review, idx) => (
              <div className="review-card" key={idx}>
                <div className="review-image" style={{ backgroundImage: `url('${review.img}')` }} />
                <div className="review-content">
                  <h3>{review.title}</h3>
                  <p className="firstperagraph"></p>
                  <p className="secondreviewdiv">{review.text}</p>
                  <div className="review-stars">{renderStars(review.stars)}</div>
                </div>
                <div className="review-tag">WHAT OUR CLIENT SAY ABOUT US?</div>
              </div>
            ))}
          </div>
        </div>
        <div className="quote-background">“</div>
        <div className="reviews-navigation">
          <button className="nav-button" aria-label="Previous Review" onClick={() => scrollReviews('prev')}>❮</button>
          <button className="nav-button" aria-label="Next Review" onClick={() => scrollReviews('next')}>❯</button>
        </div>
        <div className="background-decor">
          <div className="background-shape"></div>
          <div className="background-shape"></div>
        </div>
      </section>

    </LandingLayout>
  );
};

export default UserHome;
