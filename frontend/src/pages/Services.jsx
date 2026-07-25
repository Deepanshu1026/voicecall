import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LandingLayout from '../components/user/LandingLayout';
import SEO from '../components/common/SEO';
import '../styles/services.css';

const Services = () => {
  const navigate = useNavigate();
  const [activeDocTab, setActiveDocTab] = useState('tourist');

  const heroSlides = [
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
      text: 'Expert visa and immigration advisory services through chat, video, or calls for a smooth process. Our skilled Visa Immigration Experts help you achieve your global goals.',
    },
    {
      name: 'Canada',
      img: '/images/user/canada 1.webp',
      text: 'Step-by-step Canada visa guidance via chat, video, or calls. We are the trusted partner for Canada-bound travelers and professionals.',
    },
    {
      name: 'United Kingdom',
      img: '/images/user/bigben 1.webp',
      text: 'Personalized UK visa and immigration support. We guide you through every requirement with clarity and confidence.',
    },
    {
      name: 'Europe',
      img: '/images/user/europe 1.webp',
      text: 'Navigate European visa complexities with ease. Our experts offer full support for work, travel, and transit across Europe.',
    },
    {
      name: 'Australia',
      img: '/images/user/australia 1.webp',
      text: 'Explore opportunities in Australia with expert visa guidance for work and travel, with step-by-step application support.',
    },
    {
      name: 'Japan',
      img: '/images/user/japan 1.webp',
      text: 'Embark on your journey to Japan with expert visa assistance. We handle the details while you focus on exploring.',
    },
  ];

  const visaServices = [
    {
      id: 'tourist',
      title: 'Tourist Visa',
      shortText: 'Travel for leisure, sightseeing, visiting family, or attending events with a limited-duration permit.',
      fullImg: '/images/user/touristvisa_full 1.webp',
      intro: 'A tourist visa is an official document that permits travelers to enter, stay, and explore a country for leisure purposes. It is typically granted for a limited duration and is intended for activities like sightseeing, visiting family or friends, or attending events.',
      types: [
        { title: 'Single-entry Visa', text: 'Allows one-time entry. Re-entry requires applying for a new visa.' },
        { title: 'Multiple-entry Visa', text: 'Permits multiple entries and exits within a defined time frame.' },
        { title: 'Transit Visa', text: 'Issued for short stops while traveling to another destination.' },
        { title: 'E-Visa', text: 'A convenient electronic visa that can be applied for online, simplifying the process.' },
      ],
      closing: 'At A Visa Experts, our experienced Visa Immigration Experts offer complete support in choosing the right tourist visa for your needs. We carefully handle your entire application, provide updates, clarity, and confidence—because we guide every step of your journey.',
      docs: [
        'Valid passport with at least six months validity',
        'Recent passport-size photographs',
        'Proof of travel itinerary and accommodation',
        'Financial documents showing sufficient funds',
        'Travel insurance (if required by destination)',
        'Return flight tickets or onward journey proof',
      ],
    },
    {
      id: 'work',
      title: 'Work Visa',
      shortText: 'Live and work abroad with a permit for skilled employment, contract jobs, or sponsored roles.',
      fullImg: '/images/user/workvisa_full 1.webp',
      intro: 'A work visa is an official document that permits a foreign national to live and work in another country for a specific period. It\u2019s typically issued for skilled employment, contract jobs, or sponsored roles. Our experienced Visa Immigration Experts guide applicants through every step of the process with clarity and professionalism.',
      types: [
        { title: 'Skilled Worker Visa', text: 'For individuals with in-demand professional skills.' },
        { title: 'Temporary Work Visa', text: 'For seasonal or contract-based employment.' },
        { title: 'Employer-Sponsored Visa', text: 'Issued when a company sponsors a foreign employee.' },
        { title: 'Working Holiday Visa', text: 'Allows travel and short-term work, mostly for young adults.' },
      ],
      closing: 'Trust the No.1 Visa Immigration Company to help you secure the right visa and simplify your international employment journey. We make sure your application meets every requirement.',
      docs: [
        'Valid passport and photographs',
        'Employment offer letter or contract',
        'Educational and professional certificates',
        'Proof of work experience',
        'Medical and police clearance (if required)',
        'Employer sponsorship documents',
      ],
    },
    {
      id: 'transit',
      title: 'Transit Visa',
      shortText: 'Pass through a country smoothly during airport layovers, connecting flights, or land travel.',
      fullImg: '/images/user/transitimg 1.webp',
      intro: 'A transit visa allows travelers to pass through a country on their way to another destination. It\u2019s typically required for short stays, even if you\'re only in the airport for a few hours. Our Visa Immigration Experts provide clear guidance on transit visa requirements for different countries.',
      types: [
        { title: 'Short Duration', text: 'Valid typically for 24 to 72 hours, depending on the country\u2019s rules.' },
        { title: 'Limited Access', text: 'Usually permits stay within the airport transit area, with some visas allowing brief exits.' },
        { title: 'Purpose', text: 'Meant only for passing through a country\u2014not for tourism or business.' },
        { title: 'Requirements', text: 'Applicants must show proof of onward travel, a valid visa for the final destination if needed, and adequate funds.' },
      ],
      closing: 'Trust the No.1 Visa Immigration Company to ensure your journey continues smoothly without unexpected complications. We handle every detail with care.',
      docs: [
        'Valid passport',
        'Confirmed onward travel ticket',
        'Valid visa for final destination (if required)',
        'Proof of sufficient funds for the layover',
        'Travel itinerary showing connecting flights',
        'Accommodation details if leaving the airport',
      ],
    },
  ];

  const features = [
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

  const activeService = visaServices.find((s) => s.id === activeDocTab);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: 'A Visa Experts Immigration Services',
    provider: {
      '@type': 'Organization',
      name: 'A Visa Experts',
      url: 'https://avisaexperts.com',
    },
    description:
      'Expert visa and immigration services for tourist, work, and transit visas. Serving clients across India, USA, UK, and Europe.',
    serviceType: 'Visa and Immigration Consulting',
    areaServed: ['IN', 'US', 'GB', 'CA', 'AU', 'EU'],
  };

  return (
    <LandingLayout>
      <SEO
        title="Visa & Immigration Services | A Visa Experts"
        description="Explore expert visa and immigration services for tourist, work, and transit visas. Trusted consultants for USA, UK, Canada, Australia, and Europe."
        keywords="visa services, immigration services, tourist visa, work visa, transit visa, visa consultant, immigration expert"
        canonicalPath="/services"
        ogImage="/images/user/touristvisa_full 1.webp"
        jsonLd={jsonLd}
      />
      <div className="services-page">
        <section className="services-hero">
          <div className="services-hero-bg">
            {heroSlides.map((slide, idx) => (
              <div
                key={idx}
                className="services-hero-slide"
                style={{ backgroundImage: `url('${slide.img}')`, animationDelay: `${idx * 4}s` }}
              >
                <span className="services-hero-slide-label">{slide.country}</span>
              </div>
            ))}
          </div>
          <div className="services-hero-overlay" />
          <div className="services-hero-content">
            <span className="services-hero-badge">Visa Immigration Services</span>
            <h1>Your Gateway to Global Opportunities</h1>
            <p>
              Tourist, work, or transit — we simplify every visa journey with expert guidance, clear documentation, and
              dedicated support.
            </p>
            <div className="services-hero-buttons">
              <button className="services-hero-primary" onClick={() => navigate('/appointment')}>
                Book Consultation
              </button>
              <button className="services-hero-secondary" onClick={() => navigate('/consultants')}>
                Talk to an Expert
              </button>
            </div>
          </div>
        </section>

        <section className="services-section services-light">
          <div className="services-container">
            <div className="services-section-header">
              <span className="services-label">What We Offer</span>
              <h2>Visa Services for Every Traveler</h2>
              <p>Choose the visa type that matches your goal and let our experts handle the rest.</p>
            </div>
            <div className="services-grid">
              {visaServices.map((service) => (
                <div className="services-card" key={service.id}>
                  <div className="services-card-image">
                    <img src={service.fullImg} alt={service.title} />
                  </div>
                  <div className="services-card-body">
                    <h3>{service.title}</h3>
                    <p>{service.shortText}</p>
                    <button
                      className="services-card-link"
                      onClick={() => navigate(`/${service.id}-visa`)}
                    >
                      Explore details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="services-section services-dark">
          <div className="services-container">
            <div className="services-section-header">
              <span className="services-label">Popular Destinations</span>
              <h2>Places We Help You Visit</h2>
              <p>Explore top destinations with our tailored visa support for each country.</p>
            </div>
            <div className="services-destinations">
              {destinations.map((dest, idx) => (
                <div className="services-destination" key={idx}>
                  <div className="services-destination-img" style={{ backgroundImage: `url('${dest.img}')` }}>
                    <div className="services-destination-overlay" />
                    <h3>{dest.name}</h3>
                  </div>
                  <p>{dest.text}</p>
                  <button className="services-destination-btn" onClick={() => navigate('/consultants')}>
                    Talk To Consultant
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="services-section services-white">
          <div className="services-container">
            <div className="services-section-header">
              <span className="services-label">Details</span>
              <h2>Everything You Need to Know</h2>
            </div>
            <div className="services-detail-list">
              {visaServices.map((service, idx) => (
                <div
                  className={`services-detail-block ${idx % 2 === 1 ? 'reverse' : ''}`}
                  id={`visa-${service.id}`}
                  key={service.id}
                >
                  <div className="services-detail-image">
                    <img src={service.fullImg} alt={service.title} />
                  </div>
                  <div className="services-detail-content">
                    <span className="services-detail-tag">{service.id} Visa</span>
                    <h2>About {service.title}</h2>
                    <p>{service.intro}</p>
                    <h4>Common Types</h4>
                    <div className="services-types">
                      {service.types.map((type, tidx) => (
                        <div className="services-type" key={tidx}>
                          <strong>{type.title}</strong>
                          <span>{type.text}</span>
                        </div>
                      ))}
                    </div>
                    <p className="services-detail-closing">{service.closing}</p>
                    <button className="services-detail-button" onClick={() => navigate('/consultants')}>
                      Consult Now
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="services-section services-light">
          <div className="services-container">
            <div className="services-section-header">
              <span className="services-label">Documents</span>
              <h2>Document Requirements</h2>
              <p>Select a visa type to see the typical documents needed for your application.</p>
            </div>
            <div className="services-doc-tabs">
              <div className="services-doc-menu">
                {visaServices.map((service) => (
                  <button
                    key={service.id}
                    className={activeDocTab === service.id ? 'active' : ''}
                    onClick={() => setActiveDocTab(service.id)}
                  >
                    {service.title}
                  </button>
                ))}
              </div>
              <div className="services-doc-content">
                <h3>{activeService.title} Documents</h3>
                <ul>
                  {activeService.docs.map((doc, idx) => (
                    <li key={idx}>{doc}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section className="services-section services-primary">
          <div className="services-container">
            <div className="services-section-header">
              <span className="services-label">Why Us</span>
              <h2>Why Choose A Visa Experts</h2>
            </div>
            <div className="services-features-grid">
              {features.map((feature, idx) => (
                <div className="services-feature" key={idx}>
                  <div className="services-feature-number">0{idx + 1}</div>
                  <h3>{feature.title}</h3>
                  <p>{feature.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="services-cta">
          <div className="services-cta-inner">
            <h2>Ready to Start Your Visa Journey?</h2>
            <p>Book a free consultation and get personalized guidance from our experts.</p>
            <div className="services-cta-buttons">
              <button className="services-cta-primary" onClick={() => navigate('/appointment')}>
                Schedule Appointment
              </button>
              <button className="services-cta-secondary" onClick={() => navigate('/consultants')}>
                Talk to a Consultant
              </button>
            </div>
          </div>
        </section>
      </div>
    </LandingLayout>
  );
};

export default Services;
