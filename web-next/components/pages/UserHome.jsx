'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import LandingLayout from '../LandingLayout';
import AgentChatWidget from '../AgentChatWidget';
import HomeAboutSection from '../HomeAboutSection';
import { SEMINAR_VIDEO_URL, SEMINAR_VIDEO_IS_EMBED } from '../../config/seminarVideo';
import toast from 'react-hot-toast';
import api from '../../lib/api';
import { resolveImageUrl } from '../../lib/imageUrl';

const DEFAULT_CONTACT = {
  email: 'Support@avisaexperts.com',
  phone: '+91 120-4502750',
  whatsapp: '+91 9711000022',
  emailResponseTime: 'Response within 2-4 hours',
  phoneHours: 'Mon-Sat, 11AM-6PM EST',
  whatsappHours: 'Mon-Sat, 11AM-6PM EST',
};

const UserHome = () => {
  const navigate = (p) => window.location.assign(p);
  const [reviews, setReviews] = useState([]);
  const [contactSettings, setContactSettings] = useState(DEFAULT_CONTACT);

  const applyReviews = useCallback((list) => {
    setReviews(list);
  }, []);

  useEffect(() => {
    api.get('/app/reviews')
      .then((res) => {
        const list = res.data?.data;
        if (Array.isArray(list) && list.length > 0) {
          applyReviews(list.map((r, i) => ({
            id: r.id || r._id || i,
            img: resolveImageUrl(r.user_image),
            name: r.user_name || '',
            visa: r.visa_type || '',
            text: r.story || '',
            stars: Number(r.rating) || 5,
          })));
        } else {
          applyReviews(fallbackReviews);
        }
      })
      .catch(() => applyReviews(fallbackReviews));
  }, [applyReviews]);

  useEffect(() => {
    api.get('/settings/contact')
      .then((res) => {
        const s = res.data?.data?.settings;
        if (s) setContactSettings((prev) => ({ ...prev, ...s }));
      })
      .catch(() => { /* use defaults */ });
  }, []);

  const heroCards = [
    {
      title: 'Tourist Visa',
      text: 'Expert Advisors: Free Calls, Chat, and Video for tourist Visa Guidance.',
      img: '/images/user/touristvisa_circle 1.webp',
      href: '/tourist-visa',
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
      title: 'Europe Visa Approved',
      text: 'Europe Visa Approved! I am so happy! A big thank you to AvisaExpert Team and especially to Mr. Kaveesh ji for always being there to help and support us. Truly a great professional!',
      stars: 4,
    },
    {
      img: '/images/user/neta 1.webp',
      title: 'UK Visa Approved',
      text: 'UK Visa Approved! I am so happy! A big thank you to AvisaExpert Team and especially to Mr. Kaveesh ji for always being there to help and support us. Truly a great professional!',
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

  const trackReviews = useMemo(
    () => (reviews.length > 1 ? [...reviews, ...reviews] : reviews),
    [reviews]
  );

  const marqueeDuration = Math.max(30, reviews.length * 6);

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 0; i < 5; i++) {
      stars.push(<span key={i}>{i < rating ? '★' : '☆'}</span>);
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
      'Trusted as the No.1 Visa Immigration Company, our Visa Immigration Experts help with tourist and transit visas globally.',
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
  }, {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: 'A Visa Experts Seminar - Kaveesh Kapoor',
    description:
      'A Visa Experts seminar by Kaveesh Kapoor sharing expert guidance on tourist, transit and PR visas for the USA, UK, Canada, Australia and Europe.',
    thumbnailUrl: [
      'https://res.cloudinary.com/fniv4k20/image/upload/v1788775413/seminaar_lipjbc.jpg',
    ],
    uploadDate: '2026-01-15T10:00:00+05:30',
    contentUrl: SEMINAR_VIDEO_URL,
    embedUrl: 'https://avisaexperts.com/',
    publisher: {
      '@type': 'Organization',
      name: 'A Visa Experts',
      logo: {
        '@type': 'ImageObject',
        url: 'https://avisaexperts.com/images/user/tmlogo 1.webp',
      },
    },
  }];

  return (
    <LandingLayout>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
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

      <HomeAboutSection variant="short" />


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
      <section className="reviews-section" aria-labelledby="reviews-heading">
        <div className="reviews-header">
          <span className="reviews-badge">
            <span className="reviews-badge-stars" aria-hidden="true">★★★★★</span>
            4.9 Rating
          </span>
          <h2 id="reviews-heading">What Our Clients Say</h2>
          <p className="reviews-subtitle">Real stories from real people we&apos;ve helped</p>
        </div>

        <div className="reviews-wrapper">
          <div
            className="reviews-track"
            style={reviews.length > 1 ? { animationDuration: `${marqueeDuration}s` } : { animation: 'none' }}
          >
            {trackReviews.map((review, idx) => {
              const visa = review.visa || review.title;
              const name = review.name;
              const label = name || visa || 'Client';
              const isDuplicate = reviews.length > 1 && idx >= reviews.length;
              return (
                <article
                  className="review-card"
                  key={`${review.id ?? idx}-${idx}`}
                  aria-hidden={isDuplicate || undefined}
                >
                  <div
                    className="review-media"
                    style={review.img ? { backgroundImage: `url("${review.img}")` } : undefined}
                  >
                    {review.img ? (
                      <img
                        className="review-photo"
                        src={review.img}
                        alt={label}
                        onError={(e) => { e.currentTarget.style.visibility = 'hidden'; }}
                      />
                    ) : (
                      <div className="review-photo review-photo-fallback" aria-hidden="true">
                        {label.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="review-body">
                    <div className="review-stars" aria-label={`Rated ${review.stars} out of 5`}>
                      {renderStars(review.stars)}
                    </div>
                    <p className="review-text">{review.text}</p>
                    <div className="review-footer">
                      <div className="review-meta">
                        {name && <h3 className="review-name">{name}</h3>}
                        {visa && <span className="review-visa">{visa}</span>}
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

    </LandingLayout>
  );
};

export default UserHome;
