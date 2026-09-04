import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LandingLayout from '../components/user/LandingLayout';
import SEO from '../components/common/SEO';
import toast from 'react-hot-toast';
import api from '../services/api';
import '../styles/about.css';

const DEFAULT_CONTACT = {
  email: 'Support@avisaexperts.com',
  phone: '+91 120-4502750',
  whatsapp: '+91 9711000022',
};

const checkSvg = (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="12" fill="#001e74" />
    <path d="M7 12L10.5 15.5L17 9" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const refundSvg = (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="12" fill="#001e74" />
    <path d="M12 6V12L15 15" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M7 9H4V6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const personSvg = (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="12" fill="#001e74" />
    <path d="M12 12C14.2091 12 16 10.2091 16 8C16 5.79086 14.2091 4 12 4C9.79086 4 8 5.79086 8 8C8 10.2091 9.79086 12 12 12Z" stroke="white" strokeWidth="1.5" />
    <path d="M6 20C6 16.6863 8.68629 14 12 14C15.3137 14 18 16.6863 18 20" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const instagramSvg = (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none">
    <rect x="2" y="2" width="20" height="20" rx="5" stroke="white" strokeWidth="2" />
    <circle cx="12" cy="12" r="4" stroke="white" strokeWidth="2" />
    <circle cx="18" cy="6" r="1" fill="white" />
  </svg>
);

const About = () => {
  const navigate = useNavigate();
  const [contact, setContact] = useState(DEFAULT_CONTACT);

  useEffect(() => {
    api.get('/settings/contact')
      .then((res) => {
        const s = res.data?.data?.settings;
        if (s) setContact((prev) => ({ ...prev, ...s }));
      })
      .catch(() => {});
  }, []);

  const achievements = [
    { icon: '/images/user/expsvg1.svg', text: '2 Lakh+', sub: 'Followers' },
    { icon: '/images/user/expsvg2.svg', text: '7+ Years', sub: 'of Experience' },
    { icon: '/images/user/expsvg3.svg', text: '40+', sub: 'Immigration Lawyers' },
    { icon: '/images/user/expsvg4.svg', text: '100%', sub: 'Success Rate*' },
  ];

  const team = [
    { img: '/images/user/sirpic 1.webp', name: 'Kaveesh Kapoor', role: 'Chairman/Owner' },
    { img: '/images/user/karansir 1.webp', name: 'Karan Kapoor', role: 'Managing Director and B2B Consultant' },
    { img: '/images/user/akshita.webp', name: 'Akshita Bhandari', role: 'Europe Visa Expert' },
    { img: '/images/user/isha nagpal.webp', name: 'Isha Nagpal', role: 'Canada immigration Expert' },
    { img: '/images/user/shivalikamam.webp', name: 'Shivalika Bharti', role: 'UK immigration Expert' },
  ];

  const blogs = [
    {
      img: '/images/user/blog1 1.webp',
      title: 'UK Visitor Visa Guide',
      text: 'Step-by-step guidance to apply for a UK visitor visa with expert tips and document checklist.',
    },
    {
      img: '/images/user/blog2 1.webp',
      title: 'Work Visa for Europe',
      text: 'Learn how to secure a Europe work visa, eligibility criteria, and required paperwork.',
    },
    {
      img: '/images/user/blog3 1.webp',
      title: 'Transit Visa Essentials',
      text: 'Everything you need to know about transit visas for smooth international travel.',
    },
  ];

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    name: 'About A Visa Experts',
    description:
      'Learn about A Visa Experts, a trusted visa and immigration company led by Kaveesh Kapoor, helping clients achieve their global dreams.',
    url: 'https://avisaexperts.com/about',
    mainEntity: {
      '@type': 'Organization',
      name: 'A Visa Experts',
      url: 'https://avisaexperts.com',
      founder: {
        '@type': 'Person',
        name: 'Kaveesh Kapoor',
      },
    },
  };

  return (
    <LandingLayout>
      <SEO
        title="About Us | A Visa Experts - Visa & Immigration Experts"
        description="Learn about A Visa Experts, India's trusted visa and immigration company led by Kaveesh Kapoor. We help clients with tourist, work, and transit visas."
        keywords="about A Visa Experts, Kaveesh Kapoor, visa immigration company, visa consultants, immigration experts"
        canonicalPath="/about"
        ogImage="/images/user/sirpic 1.webp"
        jsonLd={jsonLd}
      />
      <div className="about-page">
        <section className="about-hero">
          <div className="about-background-blur" />
          <h1>About Us</h1>
        </section>

        <section className="about-intro-section">
          <div className="about-section-container">
            <div className="about-image-container">
              <img src="/images/user/aboutus_full 1.webp" alt="About A Visa Experts" />
            </div>
            <div className="about-content-container">
              <h4>A VISA EXPERTS</h4>
              <h1>Global Visa Solutions for Every Journey With Experts</h1>
              <p>
                Your trusted partner in navigating the complexities of visa applications, from work visas to tourist
                and transit permits. We make the process seamless and stress-free.
              </p>
              <div className="about-features">
                <div className="about-feature-item">
                  {checkSvg}
                  <span>100% Success Rate*</span>
                </div>
                <div className="about-feature-item">
                  {refundSvg}
                  <span>Easy Refund Policy</span>
                </div>
                <div className="about-feature-item">
                  {personSvg}
                  <span>Expert Guidance</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="about-achievements">
          <div className="about-achievement-bg">
            <div className="about-achievement-list">
              {achievements.map((item, idx) => (
                <div className="about-achievement-item" key={idx}>
                  <div className="about-icon">
                    <img src={item.icon} alt={item.text} />
                  </div>
                  <div className="about-text-exp">
                    {item.text}
                    <br />
                    {item.sub}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="about-team-section">
          <div className="about-header">
            <div className="about-header-subtitle">Meet Our Highly Professional Team</div>
          </div>
          <div className="about-team-gallery">
            {team.map((member, idx) => (
              <div className="about-team-member" key={idx}>
                <img src={member.img} alt={member.name} />
                <div className="about-overlay">
                  <div className="about-overlay-content">
                    <div className="about-flex-bottom-profile">
                      <div className="about-name">{member.name}</div>
                      <div className="about-role">{member.role}</div>
                    </div>
                    <div className="about-social-icons">
                      <div className="about-icon-social">
                        <a href="https://www.instagram.com/avisaexpert" target="_blank" rel="noopener noreferrer">
                          {instagramSvg}
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="about-blog-section">
          <div className="about-blog-container">
            <h2 className="about-blog-header">Recent Articles</h2>
            <div className="about-blog-cards">
              {blogs.map((blog, idx) => (
                <div className="about-blog-card" key={idx}>
                  <img src={blog.img} alt={blog.title} />
                  <div className="about-blog-content">
                    <h3>{blog.title}</h3>
                    <p>{blog.text}</p>
                    <button>Read More</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="about-contact-section">
          <div className="about-contact-container">
            <div className="about-contact-header">
              <h2>
                Let&apos;s Connect <span>With Our Team</span>
              </h2>
              <p>Have a question about your visa? We&apos;re here to help you every step of the way.</p>
            </div>
            <div className="about-contact-grid">
              <div className="about-contact-methods">
                <h3>Get In Touch</h3>
                <p>Choose your preferred way to connect</p>
                <a href={`mailto:${contact.email}`} className="about-contact-link">
                  <div className="about-contact-card">
                    <h4>Email</h4>
                    <span>{contact.email}</span>
                  </div>
                </a>
                <a href={`tel:${contact.phone.replace(/\D/g,'')}`} className="about-contact-link">
                  <div className="about-contact-card">
                    <h4>Phone</h4>
                    <span>{contact.phone}</span>
                  </div>
                </a>
                <a href={`https://wa.me/${contact.whatsapp.replace(/\D/g,'')}`} className="about-contact-link">
                  <div className="about-contact-card">
                    <h4>WhatsApp Only</h4>
                    <span>{contact.whatsapp}</span>
                  </div>
                </a>
                <a href="/consultants" className="about-contact-link">
                  <div className="about-contact-card">
                    <h4>Talk to Consultant</h4>
                    <span>Now</span>
                  </div>
                </a>
              </div>
              <div className="about-contact-form">
                <h3>Send a Message</h3>
                <p>Submit your query below.</p>
                <form onSubmit={async (e) => {
                    e.preventDefault();
                    const form = e.target;
                    const data = {
                      name: form[0].value.trim(),
                      email: form[1].value.trim(),
                      phone: form[2].value.trim(),
                      message: form[3].value.trim(),
                      page: 'about',
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
                  <div className="about-form-row">
                    <input type="text" placeholder="Full Name" required />
                    <input type="email" placeholder="Email Address" required />
                  </div>
                  <input type="tel" placeholder="Phone Number" required />
                  <textarea rows="5" placeholder="Message" required></textarea>
                  <button type="submit">Send Message</button>
                </form>
              </div>
            </div>
          </div>
        </section>

        <section className="about-bottom-cta">
          <div className="about-parent-btn">
            <button className="about-herobtn" onClick={() => navigate('/appointment')}>
              Schedule An Appointment Now!
            </button>
            <button className="about-herobtn about-outlined-herobtn" onClick={() => navigate('/consultants')}>
              Talk To A Consultant Now!
            </button>
          </div>
        </section>
      </div>
    </LandingLayout>
  );
};

export default About;
