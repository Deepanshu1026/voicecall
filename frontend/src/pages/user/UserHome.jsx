import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import LandingLayout from '../../components/user/LandingLayout';
import AgentChatWidget from '../../components/user/AgentChatWidget';
import HomeSeminarSections from '../../components/seminar/HomeSeminarSections';
import { SEMINAR_VIDEO_URL, SEMINAR_VIDEO_IS_EMBED } from '../../config/seminarVideo';
import SEO from '../../components/common/SEO';
import toast from 'react-hot-toast';
import api from '../../services/api';
import '../../styles/userLanding.css';

const DEFAULT_CONTACT = {
  email: 'Support@avisaexperts.com',
  phone: '+91 120-4502750',
  whatsapp: '+91 9711000022',
  emailResponseTime: 'Response within 2-4 hours',
  phoneHours: 'Mon-Sat, 11AM-6PM EST',
  whatsappHours: 'Mon-Sat, 11AM-6PM EST',
};

const UserHome = () => {
  const navigate = useNavigate();
  const [reviewIndex, setReviewIndex] = useState(0);
  const [reviews, setReviews] = useState([]);
  const [contactSettings, setContactSettings] = useState(DEFAULT_CONTACT);

  useEffect(() => {
    api.get('/app/reviews')
      .then((res) => {
        const list = res.data?.data;
        if (Array.isArray(list) && list.length > 0) {
          setReviews(list.map((r, i) => ({
            id: r.id || r._id || i,
            img: r.user_image || '',
            name: r.user_name || '',
            visa: r.visa_type || '',
            text: r.story || '',
            stars: Number(r.rating) || 5,
          })));
        } else {
          setReviews(fallbackReviews);
        }
      })
      .catch(() => setReviews(fallbackReviews));
  }, []);

  useEffect(() => {
    api.get('/settings/contact')
      .then((res) => {
        const s = res.data?.data?.settings;
        if (s) setContactSettings((prev) => ({ ...prev, ...s }));
      })
      .catch(() => { /* use defaults */ });
  }, []);
  const reviewsWrapperRef = useRef(null);

  const heroCards = [
    {
      title: 'Tourist Visa',
      text: 'Expert Advisors: Free Calls, Chat, and Video for tourist Visa Guidance.',
      img: '/images/user/touristvisa_circle 1.webp',
      href: '/tourist-visa',
    },
    {
      title: 'Work Visa',
      text: 'Start your work visa process today with our advisers!',
      img: '/images/user/Workvisa_circle 1.webp',
      href: '/work-visa',
    },
    {
      title: 'Via / Transit Visa',
      text: 'Transit visa inquiries? We\'re here to help!',
      img: '/images/user/transitvisa_cirlce 1.webp',
      href: '/transit-visa',
    },
  ];

  const fallbackReviews = [
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

  const [isPaused, setIsPaused] = useState(false);
  const autoPlayRef = useRef(null);

  const scrollReviews = useCallback((dir) => {
    setReviewIndex((prev) => {
      if (dir === 'next') return prev >= reviews.length - 1 ? 0 : prev + 1;
      return prev <= 0 ? reviews.length - 1 : prev - 1;
    });
  }, [reviews.length]);

  const goToReview = useCallback((idx) => {
    setReviewIndex(idx);
  }, []);

  useEffect(() => {
    const position = () => {
      const container = reviewsWrapperRef.current;
      if (!container) return;
      const first = container.children[0];
      const second = container.children[1];
      if (!first) return;
      const step = second ? second.offsetLeft - first.offsetLeft : first.offsetWidth + 24;
      const wrapperWidth = container.parentElement?.offsetWidth || 0;
      const offset = Math.max(0, (wrapperWidth - first.offsetWidth) / 2) - reviewIndex * step;
      container.style.transform = `translateX(${offset}px)`;
    };
    position();
    window.addEventListener('resize', position);
    return () => window.removeEventListener('resize', position);
  }, [reviewIndex, reviews.length]);

  useEffect(() => {
    if (isPaused) return;
    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
    if (reduceMotion) return;
    autoPlayRef.current = setInterval(() => {
      scrollReviews('next');
    }, 5000);
    return () => clearInterval(autoPlayRef.current);
  }, [isPaused, scrollReviews]);

  const renderStars = (count) => {
    const stars = [];
    for (let i = 0; i < 5; i++) {
      stars.push(<span key={i}>{i < count ? '★' : '☆'}</span>);
    }
    return stars;
  };

  const jsonLd = [{
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'A Visa Experts',
    url: 'https://avisaexperts.com',
    logo: 'https://avisaexperts.com/images/user/tmlogo 1.webp',
    description:
      'Trusted as the No.1 Visa Immigration Company, our Visa Immigration Experts help with tourist, work and transit visas globally.',
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+91-120-4502750',
      contactType: 'customer service',
      areaServed: 'IN',
      availableLanguage: ['English', 'Hindi'],
    },
    sameAs: [
      'https://www.instagram.com/avisa.expert/',
      'https://www.facebook.com/profile.php?id=61590985693281',
    ],
    image: [
      'https://ik.imagekit.io/kaveeshkapoor/image_library/image_library_66_kEoLRyiBP.HEIC',
      'https://ik.imagekit.io/kaveeshkapoor/kaveesh-kapoor/kaveesh-kapoor_74_wU1l2Rrwv.JPG',
      'https://ik.imagekit.io/kaveeshkapoor/kaveesh-kapoor/kaveesh-kapoor_75_xgqf4Yn45.JPG',
      'https://ik.imagekit.io/kaveeshkapoor/kaveesh-kapoor/kaveesh-kapoor_76_NShavxym8.JPG',
      'https://ik.imagekit.io/kaveeshkapoor/kaveesh-kapoor/kaveesh-kapoor_77_thDVbAPV0.PNG',
      'https://ik.imagekit.io/kaveeshkapoor/kaveesh-kapoor/kaveesh-kapoor_78_TFFk5GeZv.PNG',
      'https://ik.imagekit.io/kaveeshkapoor/kaveesh-kapoor/kaveesh-kapoor_82_ss3Pf6Vwv.JPG',
      'https://ik.imagekit.io/kaveeshkapoor/kaveesh-kapoor/kaveesh-kapoor_83_Nh2zNphmQ.jpg',
      'https://ik.imagekit.io/kaveeshkapoor/kaveesh-kapoor/kaveesh-kapoor_86_U0JUredyY.jpg',
      'https://ik.imagekit.io/kaveeshkapoor/kaveesh-kapoor/kaveesh-kapoor_87_pB0kAin6A.jpg',
      'https://ik.imagekit.io/kaveeshkapoor/kaveesh-kapoor/kaveesh-kapoor_88_Y1lgfa1bx.jpg',
      'https://ik.imagekit.io/kaveeshkapoor/kaveesh-kapoor/kaveesh-kapoor_89_MGWM0goWW.PNG',
      'https://ik.imagekit.io/kaveeshkapoor/kaveesh-kapoor/kaveesh-kapoor_90_wygtbpgfk.jpg',
      'https://ik.imagekit.io/kaveeshkapoor/kaveesh-kapoor/kaveesh-kapoor_92_B_IbLp9Jr.jpg',
      'https://ik.imagekit.io/kaveeshkapoor/kaveesh-kapoor/kaveesh-kapoor_93_qLn6lCW98.jpg',
      'https://ik.imagekit.io/kaveeshkapoor/kaveesh-kapoor/kaveesh-kapoor_94_-XCq4TgZ_.jpg',
      'https://ik.imagekit.io/kaveeshkapoor/kaveesh-kapoor/kaveesh-kapoor_98_41mY5jHiD.jpg',
      'https://ik.imagekit.io/kaveeshkapoor/kaveesh-kapoor/kaveesh-kapoor_99_QIExGTeEx.jpg',
      'https://ik.imagekit.io/kaveeshkapoor/kaveesh-kapoor/kaveesh-kapoor_100_NJVSmrV0J.jpg',
      'https://ik.imagekit.io/kaveeshkapoor/kaveesh-kapoor/kaveesh-kapoor_102_fTc4_usqE.jpg',
      'https://ik.imagekit.io/kaveeshkapoor/kaveesh-kapoor/kaveesh-kapoor_103_BWPywuaHT.jpg',
      'https://ik.imagekit.io/kaveeshkapoor/kaveesh-kapoor/kaveesh-kapoor_122_kz-Hp3vO_.jpg',
      'https://ik.imagekit.io/kaveeshkapoor/kaveesh-kapoor/kaveesh-kapoor_123_pn_PdugKk.jpg',
      'https://ik.imagekit.io/kaveeshkapoor/kaveesh-kapoor/kaveesh-kapoor_125_pwyQgcEc4.jpg',
      'https://ik.imagekit.io/kaveeshkapoor/kaveesh-kapoor/kaveesh-kapoor_126_LGucb4dnd.jpg',
      'https://ik.imagekit.io/kaveeshkapoor/kaveesh-kapoor/kaveesh-kapoor_127_KWJZo2HQi.jpg',
      'https://ik.imagekit.io/kaveeshkapoor/kaveesh-kapoor/kaveesh-kapoor_129_s5q8KKtZG.jpg',
      'https://ik.imagekit.io/kaveeshkapoor/kaveesh-kapoor/kaveesh-kapoor_130_NHkfmAvNn.jpg',
      'https://ik.imagekit.io/kaveeshkapoor/kaveesh-kapoor/kaveesh-kapoor_132_QnwpfeZLP.jpg',
      'https://ik.imagekit.io/kaveeshkapoor/kaveesh-kapoor/kaveesh-kapoor_134_H6YXU9NvD.jpg',
      'https://ik.imagekit.io/kaveeshkapoor/kaveesh-kapoor/kaveesh-kapoor_135_Nuztto9xt.jpg',
      'https://ik.imagekit.io/kaveeshkapoor/kaveesh-kapoor/kaveesh-kapoor_138_O3NnVPWx2.jpg',
      'https://ik.imagekit.io/kaveeshkapoor/kaveesh-kapoor/kaveesh-kapoor_140_s1VInDH48.jpg',
      'https://ik.imagekit.io/kaveeshkapoor/kaveesh-kapoor/kaveesh-kapoor_142_uoKkwPUmn.jpg',
      'https://ik.imagekit.io/kaveeshkapoor/kaveesh-kapoor/kaveesh-kapoor_143_yPlx7OxnQ.jpg',
      'https://ik.imagekit.io/kaveeshkapoor/kaveesh-kapoor/kaveesh-kapoor_144_mRRBb9OKe.jpg',
      'https://avisaexperts.com/uploads1/kaveesh_kapoor(3).jpg',
      'https://avisaexperts.com/uploads1/kaveesh_kapoor(2).jpg',
      'https://avisaexperts.com/uploads1/kaveesh_kapoor(1).jpg',
    ],
  }, {
    '@context': 'https://schema.org',
    '@type': 'ImageObject',
    contentUrl: 'https://ik.imagekit.io/kaveeshkapoor/kaveesh-kapoor/kaveesh-kapoor_74_wU1l2Rrwv.JPG',
    description: 'Kaveesh Kapoor at his own Seminar.',
    name: 'Kaveesh Kapoor',
  }];

  return (
    <LandingLayout>
      <SEO
        title="A Visa Experts | Trusted Visa & Immigration Consultants"
        description="A Visa Experts helps individuals and families secure tourist, work, transit, and permanent residency visas for the USA, UK, Canada, Australia, and Europe."
        keywords="visa consultants, immigration experts, tourist visa, work visa, Canada visa, UK visa, USA visa, Australia visa, Kaveesh Kapoor"
        canonicalPath="/home"
        ogImage="/images/user/slider4 1.webp"
        jsonLd={jsonLd}
      />

      {/* Hero */}
      <section className="outer-hero-new">
        {SEMINAR_VIDEO_IS_EMBED ? (
          <iframe
            className="background-img"
            src={SEMINAR_VIDEO_URL}
            title="A Visa Experts"
            frameBorder="0"
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <video
            className="background-img"
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            poster="https://res.cloudinary.com/fniv4k20/image/upload/v1788775413/seminaar_lipjbc.jpg"
          >
            <source src={SEMINAR_VIDEO_URL} type="video/mp4" />
          </video>
        )}
        <div className="hero-video-overlay" />
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
                  <img src={card.img} alt={`${card.title} - Visa Services by A Visa Experts`} />
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

      {/* Seminar hero + collage sections */}
      <HomeSeminarSections />

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

      {/* About Us & Founder Leadership Section */}
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
              <div className="founder-quote-card">
                <span className="quote-icon">“</span>
                <p>
                  Our mission is simple: to turn your global aspirations into reality with complete transparency, unwavering dedication, and personalized guidance every step of the way.
                </p>
              </div>

              {/* Description Body */}
              <p className="founder-bio">
                Welcome to <strong>A Visa Experts</strong> — India&apos;s trusted visa &amp; immigration consultancy. Founded by <strong>Kaveesh Kapoor</strong>, we help individuals and families secure tourist, work, and permanent residency visas for the <strong>USA, UK, Canada, Australia, Europe</strong> and beyond — with clear guidance, honest advice, and an exceptional track record of success.
              </p>

              {/* 4 Feature Highlights Grid */}
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

              {/* Social Connect & Actions */}
              <div className="about-actions-row">
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

                <div className="about-buttons-wrapper">
                  <button className="home-about-cta-btn" onClick={() => navigate('/about')}>
                    <span>Meet Kaveesh Kapoor</span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="5" y1="12" x2="19" y2="12" />
                      <polyline points="12 5 19 12 12 19" />
                    </svg>
                  </button>
                  <button className="home-about-outline-btn" onClick={() => navigate('/appointment')}>
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
                <a href={`mailto:${contactSettings.email}`} className="lets_connect_link">
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
                      <span className="lets_connect_contact_detail">{contactSettings.email}</span>
                      <span className="lets_connect_response_time">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <circle cx="12" cy="12" r="10" stroke="#3b82f6" strokeWidth="2" />
                          <path d="M12 6V12L16 14" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                        {contactSettings.emailResponseTime}
                      </span>
                    </div>
                  </div>
                </a>

                <a href={`tel:${contactSettings.phone.replace(/\D/g, '')}`} className="lets_connect_link">
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
                      <span className="lets_connect_contact_detail">{contactSettings.phone}</span>
                      <span className="lets_connect_response_time">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <rect x="3" y="4" width="18" height="18" rx="2" stroke="#3b82f6" strokeWidth="2" />
                          <path d="M16 2V6M8 2V6M3 10H21" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                        {contactSettings.phoneHours}
                      </span>
                    </div>
                  </div>
                </a>

                <a href={`https://wa.me/${contactSettings.whatsapp.replace(/\D/g, '')}`} className="lets_connect_link">
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
                      <span className="lets_connect_contact_detail">{contactSettings.whatsapp}</span>
                      <span className="lets_connect_response_time">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <rect x="3" y="4" width="18" height="18" rx="2" stroke="#3b82f6" strokeWidth="2" />
                          <path d="M16 2V6M8 2V6M3 10H21" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                        {contactSettings.whatsappHours}
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
              <form className="lets_connect_form" onSubmit={async (e) => {
                e.preventDefault();
                const form = e.target;
                const data = {
                  name: form.name.value.trim(),
                  email: form.email.value.trim(),
                  phone: form.phone.value.trim(),
                  message: form.message.value.trim(),
                  page: 'home',
                };
                if (!data.name || !data.email || !data.phone || !data.message) {
                  toast.error('Please fill in all fields');
                  return;
                }
                try {
                  await api.post('/settings/contact/submit', data);
                  toast.success('Message sent! We will get back to you soon.');
                  form.reset();
                } catch {
                  toast.error('Failed to send message. Please try emailing us directly.');
                }
              }}>
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
          <span className="gallery-badge">Popular Destinations</span>
          <h2>Enjoy your dream vacation</h2>
          <p>Discover beautiful countries with our hassle-free tourist visa services.</p>
          <button className="view-button" aria-label="View All Destinations" onClick={() => navigate('/tourist-visa')}>
            View All Destinations
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
        <div className="image-gallery">
          {destinations.map((dest, idx) => (
            <div
              key={idx}
              className={`destination-card ${idx === 0 ? 'first-card' : ''}`}
              style={{ backgroundImage: `url('${dest.img}')` }}
            >
              <div className="destination-overlay" />
              <div className="location-info">
                <div className="location-details">
                  <img className="flag-icon" src={dest.flag} alt={`${dest.name} visa support - A Visa Experts`} />
                  <h3>{dest.name}</h3>
                </div>
                <span className="destination-explore">Explore &rarr;</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Side Agent Chat Widget */}
      <AgentChatWidget />

      {/* Client Reviews */}
      <section
        className="reviews-section"
        aria-labelledby="reviews-heading"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onFocusCapture={() => setIsPaused(true)}
        onBlurCapture={() => setIsPaused(false)}
      >
        <div className="reviews-header">
          <span className="reviews-badge">
            <span className="reviews-badge-stars" aria-hidden="true">★★★★★</span>
            4.9 Rating
          </span>
          <h2 id="reviews-heading">What Our Clients Say</h2>
          <p className="reviews-subtitle">Real stories from real people we&apos;ve helped</p>
        </div>

        <div className="reviews-wrapper">
          <div className="reviews-container" ref={reviewsWrapperRef}>
            {reviews.map((review, idx) => {
              const visa = review.visa || review.title;
              const name = review.name;
              const label = name || visa || 'Client';
              return (
                <article
                  className={`review-card ${idx === reviewIndex ? 'review-active' : ''}`}
                  key={review.id ?? idx}
                >
                  <div className="review-stars" aria-label={`Rated ${review.stars} out of 5`}>
                    {renderStars(review.stars)}
                  </div>
                  <p className="review-text">{review.text}</p>
                  <div className="review-footer">
                    {review.img ? (
                      <img
                        className="review-avatar"
                        src={review.img}
                        alt={label}
                        loading="lazy"
                      />
                    ) : (
                      <div className="review-avatar review-avatar-fallback" aria-hidden="true">
                        {label.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="review-meta">
                      {name && <h3 className="review-name">{name}</h3>}
                      {visa && <span className="review-visa">{visa}</span>}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>

        <div className="reviews-dots" role="tablist" aria-label="Choose a review">
          {reviews.map((_, idx) => (
            <button
              key={idx}
              type="button"
              role="tab"
              className={`review-dot ${idx === reviewIndex ? 'review-dot-active' : ''}`}
              onClick={() => goToReview(idx)}
              aria-label={`Go to review ${idx + 1}`}
              aria-selected={idx === reviewIndex}
            />
          ))}
        </div>

        <div className="reviews-navigation">
          <button type="button" className="nav-button" aria-label="Previous review" onClick={() => scrollReviews('prev')}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button type="button" className="nav-button" aria-label="Next review" onClick={() => scrollReviews('next')}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </section>

    </LandingLayout>
  );
};

export default UserHome;
