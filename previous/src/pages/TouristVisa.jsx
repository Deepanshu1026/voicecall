import { useNavigate } from 'react-router-dom';
import LandingLayout from '../components/user/LandingLayout';
import SEO from '../components/common/SEO';
import '../styles/visaPages.css';

const TouristVisa = () => {
  const navigate = useNavigate();

  const slides = [
    { country: 'Australia', img: '/images/user/carousel6img 1.webp' },
    { country: 'Italy', img: '/images/user/Italy 1.webp' },
    { country: 'USA', img: '/images/user/carousel3img 1.webp' },
    { country: 'UK', img: '/images/user/uk 1.webp' },
    { country: 'Japan', img: '/images/user/japan1 1.webp' },
  ];

  const destinations = [
    {
      name: 'United States',
      img: '/images/user/popularplace3 1.webp',
      text: 'We provide expert visa and immigration advisory services through chat, video, or calls for a smooth process. Our skilled Visa Immigration Experts help you achieve your global goals.',
    },
    {
      name: 'Canada',
      img: '/images/user/canada 1.webp',
      text: 'We specialize in Canada visa and immigration advisory, offering step-by-step guidance via chat, video, or calls. We are the trusted partner for Canada-bound travelers.',
    },
    {
      name: 'United Kingdom',
      img: '/images/user/bigben 1.webp',
      text: 'We provide expert guidance for UK visas and immigration, offering personalized support via chat, video or calls. We guide you through every requirement with clarity.',
    },
    {
      name: 'Europe',
      img: '/images/user/europe 1.webp',
      text: 'Navigate the complexities of European visas with ease. Our experts offer guidance via chat, video or calls for work, travel, and transit across Europe.',
    },
    {
      name: 'Australia',
      img: '/images/user/australia 1.webp',
      text: 'Explore new opportunities in Australia with expert visa guidance for work and travel, with step-by-step application support.',
    },
    {
      name: 'Japan',
      img: '/images/user/japan 1.webp',
      text: 'Embark on your journey to Japan with expert visa assistance. We handle the details while you focus on exploring.',
    },
  ];

  const visaTypes = [
    { title: 'Single-entry Visa', text: 'Allows one-time entry. Re-entry requires applying for a new visa.' },
    { title: 'Multiple-entry Visa', text: 'Permits multiple entries and exits within a defined time frame.' },
    { title: 'Transit Visa', text: 'Issued for short stops while traveling to another destination.' },
    { title: 'E-Visa', text: 'A convenient electronic visa that can be applied for online, simplifying the process.' },
  ];

  const documents = [
    'Valid passport with at least six months validity',
    'Recent passport-size photographs',
    'Proof of travel itinerary and accommodation',
    'Financial documents showing sufficient funds',
    'Travel insurance (if required by destination)',
    'Return flight tickets or onward journey proof',
  ];

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: 'Tourist Visa Services',
    provider: {
      '@type': 'Organization',
      name: 'A Visa Experts',
      url: 'https://avisaexperts.com',
    },
    description:
      'Get expert tourist visa assistance for USA, UK, Canada, Australia, Europe, and Japan. A Visa Experts simplifies your travel visa application.',
    serviceType: 'Tourist Visa Consulting',
    areaServed: ['US', 'GB', 'CA', 'AU', 'JP', 'EU'],
  };

  return (
    <LandingLayout>
      <SEO
        title="Tourist Visa Services | A Visa Experts"
        description="Apply for a tourist visa with expert guidance from A Visa Experts. We help travelers secure visas for USA, UK, Canada, Australia, Europe, and Japan."
        keywords="tourist visa, visitor visa, travel visa, USA tourist visa, UK tourist visa, Canada tourist visa, Australia tourist visa, Japan visa"
        canonicalPath="/tourist-visa"
        ogImage="/images/user/touristvisa_full 1.webp"
        jsonLd={jsonLd}
      />
      <div className="visa-page">
        {/* Hero */}
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
            <span className="visa-hero-badge">Tourist Visa</span>
            <h1>Explore the World with Confidence</h1>
            <p>
              A tourist visa lets you travel for leisure, sightseeing, visiting family, or attending events. We handle
              the paperwork so you can focus on your journey.
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

        {/* About */}
        <section className="visa-section visa-white">
          <div className="visa-container">
            <div className="visa-about">
              <div className="visa-about-image">
                <img src="/images/user/touristvisa_full 1.webp" alt="About Tourist Visa" />
              </div>
              <div className="visa-about-content">
                <span className="visa-label">About Tourist Visa</span>
                <h2>Your Leisure Travel Permit</h2>
                <p>
                  A tourist visa is an official document that permits travelers to enter, stay, and explore a country for
                  leisure purposes. It is typically granted for a limited duration and is intended for activities like
                  sightseeing, visiting family or friends, or attending events.
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
                  At A Visa Experts, our experienced Visa Immigration Experts offer complete support in choosing the
                  right tourist visa for your needs. We carefully handle your entire application, provide updates, clarity,
                  and confidence—guiding every step of your journey.
                </p>
                <button className="visa-about-button" onClick={() => navigate('/consultants')}>
                  Consult Now
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Destinations */}
        <section className="visa-section visa-primary">
          <div className="visa-container">
            <div className="visa-section-header">
              <span className="visa-label">Popular Destinations</span>
              <h2>Countries We Help You Visit</h2>
              <p>Explore top tourist destinations with our tailored visa support for each country.</p>
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

        {/* Documents */}
        <section className="visa-section visa-light">
          <div className="visa-container">
            <div className="visa-section-header">
              <span className="visa-label">Documents</span>
              <h2>Tourist Visa Document Requirements</h2>
              <p>Typical documents needed for a tourist visa application.</p>
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

        {/* CTA */}
        <section className="visa-cta">
          <div className="visa-cta-inner">
            <h2>Ready to Start Your Tourist Visa Journey?</h2>
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

export default TouristVisa;
