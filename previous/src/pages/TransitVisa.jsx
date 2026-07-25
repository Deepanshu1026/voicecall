import { useNavigate } from 'react-router-dom';
import LandingLayout from '../components/user/LandingLayout';
import SEO from '../components/common/SEO';
import '../styles/visaPages.css';

const TransitVisa = () => {
  const navigate = useNavigate();

  const features = [
    {
      title: 'Short Duration',
      text: 'Valid typically for 24 to 72 hours, depending on the country’s rules.',
    },
    {
      title: 'Limited Access',
      text: 'Usually permits stay within the airport transit area, with some visas allowing brief exits.',
    },
    {
      title: 'Purpose',
      text: 'Meant only for passing through a country—not for tourism or business.',
    },
    {
      title: 'Requirements',
      text: 'Applicants must show proof of onward travel, a valid visa for the final destination if needed, and adequate funds.',
    },
  ];

  const whenNeeded = [
    {
      title: 'Airport Layovers',
      text: 'When a layover in a country requires leaving the international transit zone.',
    },
    {
      title: 'Connecting Flights',
      text: 'When switching airports within the same country during a layover.',
    },
    {
      title: 'Land Travel',
      text: 'When traveling through one country to reach another by land, such as driving through a country to reach the final destination.',
    },
  ];

  const documents = [
    'Valid passport',
    'Confirmed onward travel ticket',
    'Valid visa for final destination (if required)',
    'Proof of sufficient funds for the layover',
    'Travel itinerary showing connecting flights',
    'Accommodation details if leaving the airport',
  ];

  const highlights = [
    {
      title: '100% Success Rate',
      text: 'With years of experience and a commitment to excellence, we have achieved a strong success rate. Our experts carefully examine each application, ensuring every detail is correct and every requirement is met.',
    },
    {
      title: 'One Stop Solution',
      text: 'From consultation to documentation and filing, we provide complete visa support under one roof. Our Visa Immigration Experts handle every step with attention to detail.',
    },
    {
      title: 'Expert Services',
      text: 'We thoroughly examine every application, ensuring accuracy and completeness. As the Best Visa Immigration Company, we work diligently to meet all requirements for successful approval.',
    },
  ];

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: 'Transit Visa Services',
    provider: {
      '@type': 'Organization',
      name: 'A Visa Experts',
      url: 'https://avisaexperts.com',
    },
    description:
      'Get transit visa guidance for smooth airport layovers and connecting flights. A Visa Experts helps you understand transit visa requirements.',
    serviceType: 'Transit Visa Consulting',
  };

  return (
    <LandingLayout>
      <SEO
        title="Transit Visa Services | A Visa Experts"
        description="Understand transit visa requirements and get expert guidance for smooth airport layovers. A Visa Experts helps with transit visas for international travel."
        keywords="transit visa, airport transit visa, layover visa, connecting flights visa, transit visa requirements"
        canonicalPath="/transit-visa"
        ogImage="/images/user/transitimg 1.webp"
        jsonLd={jsonLd}
      />
      <div className="visa-page">
        {/* Hero */}
        <section className="visa-hero">
          <div className="visa-hero-bg">
            <div
              className="visa-hero-slide active"
              style={{ backgroundImage: "url('/images/user/transitimg 1.webp')", opacity: 1, animation: 'none' }}
            >
              <span className="visa-hero-slide-label">Transit</span>
            </div>
          </div>
          <div className="visa-hero-content">
            <span className="visa-hero-badge">Transit Visa</span>
            <h1>Travel Without Delays</h1>
            <p>
              Begin your journey with a single step—transit smoothly and explore the world with ease. Our experts help you
              navigate global airports with confidence.
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

        {/* What is Transit Visa */}
        <section className="visa-section visa-white">
          <div className="visa-container">
            <div className="visa-about">
              <div className="visa-about-image">
                <img src="/images/user/transitimg 1.webp" alt="What is Transit Visa" />
              </div>
              <div className="visa-about-content">
                <span className="visa-label">What is a Transit Visa?</span>
                <h2>Pass Through Countries Smoothly</h2>
                <p>
                  A transit visa allows travelers to pass through a country on their way to another destination. It’s typically
                  required for short stays, even if you’re only in the airport for a few hours. At A Visa Experts, the Best Visa
                  Immigration Company, our Visa Immigration Experts provide clear guidance on transit visa requirements for
                  different countries.
                </p>
                <p>
                  Whether you need airport transit or short-term entry, we help you understand the rules and avoid delays.
                  Trust the No.1 Visa Immigration Company to ensure your journey continues smoothly without unexpected
                  complications.
                </p>
                <button className="visa-about-button" onClick={() => navigate('/consultants')}>
                  Consult Now
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Key Features */}
        <section className="visa-section visa-light">
          <div className="visa-container">
            <div className="visa-section-header">
              <span className="visa-label">Key Features</span>
              <h2>Key Features of a Transit Visa</h2>
              <p>At A Visa Experts, our Visa Immigration Experts help travelers understand the essentials of a transit visa.</p>
            </div>
            <div className="visa-features-grid">
              {features.map((feature, idx) => (
                <div className="visa-feature" key={idx}>
                  <div className="visa-feature-number">0{idx + 1}</div>
                  <h3>{feature.title}</h3>
                  <p>{feature.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* When Needed */}
        <section className="visa-section visa-primary">
          <div className="visa-container">
            <div className="visa-section-header">
              <span className="visa-label">When Needed</span>
              <h2>When Is a Transit Visa Needed?</h2>
              <p>Common situations where a transit visa becomes essential.</p>
            </div>
            <div className="visa-need-cards">
              {whenNeeded.map((item, idx) => (
                <div className="visa-need-card" key={idx}>
                  <div className="visa-need-icon">✈</div>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Documents */}
        <section className="visa-section visa-light">
          <div className="visa-container">
            <div className="visa-section-header">
              <span className="visa-label">Documents</span>
              <h2>Transit Visa Document Requirements</h2>
              <p>Typical documents needed for a transit visa application.</p>
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

        {/* Highlights */}
        <section className="visa-section visa-dark">
          <div className="visa-container">
            <div className="visa-section-header">
              <span className="visa-label">Why Us</span>
              <h2>Why Choose A Visa Experts</h2>
            </div>
            <div className="visa-highlights-grid">
              {highlights.map((highlight, idx) => (
                <div className="visa-highlight" key={idx}>
                  <h3>{highlight.title}</h3>
                  <p>{highlight.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="visa-cta">
          <div className="visa-cta-inner">
            <h2>Ready for Smooth Transit?</h2>
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

export default TransitVisa;
