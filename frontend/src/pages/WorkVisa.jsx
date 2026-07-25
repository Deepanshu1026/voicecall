import { useNavigate } from 'react-router-dom';
import LandingLayout from '../components/user/LandingLayout';
import SEO from '../components/common/SEO';
import '../styles/visaPages.css';

const WorkVisa = () => {
  const navigate = useNavigate();

  const slides = [
    { country: 'Canada', img: '/images/user/canada 1.webp' },
    { country: 'UK', img: '/images/user/uk 1.webp' },
    { country: 'Japan', img: '/images/user/japan 1.webp' },
    { country: 'Canada', img: '/images/user/canada 1.webp' },
    { country: 'UK', img: '/images/user/uk 1.webp' },
    { country: 'Japan', img: '/images/user/japan 1.webp' },
  ];

  const destinations = [
    {
      name: 'Canada',
      img: '/images/user/canada 1.webp',
      text: 'As the Best Visa Immigration Company, our Visa Immigration Experts provide Canada visa guidance. Trust us for chat, video, or call support on your immigration journey.',
    },
    {
      name: 'United Kingdom',
      img: '/images/user/bigben 1.webp',
      text: 'Our Visa Immigration Experts offer UK visa guidance. Trust the No.1 Visa Immigration Company for expert support via chat, video, or calls.',
    },
    {
      name: 'Europe',
      img: '/images/user/europe 1.webp',
      text: 'Welcome to A Visa Experts, the Best Visa Immigration Company. Our experts offer full support for European visas through chat, video, or call help.',
    },
  ];

  const visaTypes = [
    { title: 'Skilled Worker Visa', text: 'For individuals with in-demand professional skills.' },
    { title: 'Temporary Work Visa', text: 'For seasonal or contract-based employment.' },
    { title: 'Employer-Sponsored Visa', text: 'Issued when a company sponsors a foreign employee.' },
    { title: 'Working Holiday Visa', text: 'Allows travel and short-term work, mostly for young adults.' },
  ];

  const documents = [
    'Valid passport and photographs',
    'Employment offer letter or contract',
    'Educational and professional certificates',
    'Proof of work experience',
    'Medical and police clearance (if required)',
    'Employer sponsorship documents',
  ];

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: 'Work Visa Services',
    provider: {
      '@type': 'Organization',
      name: 'A Visa Experts',
      url: 'https://avisaexperts.com',
    },
    description:
      'Expert work visa assistance for Canada, UK, Australia, Europe, and Hong Kong. A Visa Experts helps professionals build careers abroad.',
    serviceType: 'Work Visa Consulting',
    areaServed: ['CA', 'GB', 'AU', 'HK', 'EU'],
  };

  return (
    <LandingLayout>
      <SEO
        title="Work Visa Services | A Visa Experts"
        description="Apply for a work visa with expert guidance from A Visa Experts. We assist professionals with Canada, UK, Australia, Europe, and Hong Kong work visas."
        keywords="work visa, work permit, Canada work visa, UK skilled worker visa, Australia work visa, Hong Kong work visa, employment visa"
        canonicalPath="/work-visa"
        ogImage="/images/user/workvisa_full 1.webp"
        jsonLd={jsonLd}
      />
      <div className="visa-page">
        <section className="visa-hero">
          <div className="visa-hero-bg">
            {slides.map((slide, idx) => (
              <div
                key={idx}
                className="visa-hero-slide"
                style={{ backgroundImage: `url('${slide.img}')`, animationDelay: `${idx * 4}s` }}
              >
                <span className="visa-hero-slide-label">{slide.country}</span>
              </div>
            ))}
          </div>
          <div className="visa-hero-content">
            <span className="visa-hero-badge">Work Visa</span>
            <h1>Build Your Career Abroad</h1>
            <p>
              A work visa allows foreign nationals to live and work in another country for a specific period. We guide
              employers and employees through every step with clarity and professionalism.
            </p>
            <div className="visa-hero-buttons">
              <button className="visa-hero-primary" onClick={() => navigate('/appointment')}>
                Book Consultation
              </button>
              <button className="visa-hero-secondary" onClick={() => navigate('/consultants')}>
                Talk to an Expert
              </button>
            </div>
          </div>
        </section>

        <section className="visa-section visa-white">
          <div className="visa-container">
            <div className="visa-about">
              <div className="visa-about-image">
                <img src="/images/user/workvisa_full 1.webp" alt="About Work Visa" />
              </div>
              <div className="visa-about-content">
                <span className="visa-label">About Work Visa</span>
                <h2>Your Path to International Employment</h2>
                <p>
                  A work visa is an official document that permits a foreign national to live and work in another country for a
                  specific period. It\u2019s typically issued for skilled employment, contract jobs, or sponsored roles. Our
                  experienced Visa Immigration Experts guide applicants through every step of the process with clarity and
                  professionalism.
                </p>
                <div className="visa-types">
                  {visaTypes.map((type, idx) => (
                    <div className="visa-type" key={idx}>
                      <strong>{type.title}</strong>
                      <span>{type.text}</span>
                    </div>
                  ))}
                </div>
                <p className="visa-about-closing">
                  Trust the No.1 Visa Immigration Company to help you secure the right visa and simplify your international
                  employment journey. We make sure your application meets every requirement.
                </p>
                <button className="visa-about-button" onClick={() => navigate('/consultants')}>
                  Consult Now
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="visa-section visa-primary">
          <div className="visa-container">
            <div className="visa-section-header">
              <span className="visa-label">Popular Destinations</span>
              <h2>Countries for Work Opportunities</h2>
              <p>Explore top work destinations with our tailored visa support for each country.</p>
            </div>
            <div className="visa-destinations">
              {destinations.map((dest, idx) => (
                <div className="visa-destination" key={idx}>
                  <div className="visa-destination-img" style={{ backgroundImage: `url('${dest.img}')` }}>
                    <div className="visa-destination-overlay" />
                    <h3>{dest.name}</h3>
                  </div>
                  <p>{dest.text}</p>
                  <button className="visa-destination-btn" onClick={() => navigate('/consultants')}>
                    Talk To Consultant
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="visa-section visa-light">
          <div className="visa-container">
            <div className="visa-section-header">
              <span className="visa-label">Documents</span>
              <h2>Work Visa Document Requirements</h2>
              <p>Typical documents needed for a work visa application.</p>
            </div>
            <div className="visa-doc-list">
              {documents.map((doc, idx) => (
                <div className="visa-doc-item" key={idx}>
                  <span className="visa-doc-check">✓</span>
                  <span>{doc}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="visa-cta">
          <div className="visa-cta-inner">
            <h2>Ready to Start Your Work Visa Journey?</h2>
            <p>Book a free consultation and get personalized guidance from our experts.</p>
            <div className="visa-cta-buttons">
              <button className="visa-cta-primary" onClick={() => navigate('/appointment')}>
                Schedule Appointment
              </button>
              <button className="visa-cta-secondary" onClick={() => navigate('/consultants')}>
                Talk to a Consultant
              </button>
            </div>
          </div>
        </section>
      </div>
    </LandingLayout>
  );
};

export default WorkVisa;
