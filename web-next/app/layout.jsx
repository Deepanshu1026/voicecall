import './globals.css';
import { Toaster } from 'react-hot-toast';
import '../styles/userLanding.css';
import '../styles/services.css';
import '../styles/about.css';
import '../styles/blogs.css';
import '../styles/seminar.css';
import '../styles/visaPages.css';

const SITE_URL = 'https://avisaexperts.com';

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'A Visa Experts | No.1 Visa Immigration Company in India',
    template: '%s',
  },
  description:
    "A Visa Experts is India's trusted No.1 Visa Immigration Company. We help with tourist, work, transit and PR visas for USA, UK, Canada, Australia, Europe & NZ. Free consultation with expert immigration consultants.",
  keywords:
    'A Visa Experts, Best Visa Immigration Company, Visa Immigration Experts, No.1 Visa Immigration Company, best immigration consultants, best visa consultants, tourist visa consultants, work visa consultants, PR consultants, permanent residency application, visa agent, immigration agent, visa consultancy India',
  authors: [{ name: 'A Visa Experts' }],
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
  alternates: { canonical: '/' },
  icons: {
    icon: [{ url: '/images/user/logo%202.webp', type: 'image/webp' }],
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'A Visa Experts',
    title: 'A Visa Experts | No.1 Visa Immigration Company in India',
    description:
      "India's trusted No.1 Visa Immigration Company. Free consultation for tourist, work, transit & PR visas for USA, UK, Canada, Australia, Europe & NZ.",
    url: SITE_URL,
    images: [{ url: '/images/user/tmlogo%201.webp', alt: 'A Visa Experts logo' }],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@avisaexperts',
    title: 'A Visa Experts | No.1 Visa Immigration Company in India',
    description:
      "India's trusted No.1 Visa Immigration Company for tourist, work, transit & PR visas.",
    images: ['/images/user/tmlogo%201.webp'],
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#050505',
};

const organizationLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'A Visa Experts',
  url: SITE_URL,
  logo: `${SITE_URL}/images/user/tmlogo%201.webp`,
  description:
    "India's trusted No.1 Visa Immigration Company helping individuals and families secure tourist, work, transit and PR visas.",
  foundingDate: '2018',
  founder: { '@type': 'Person', name: 'Kaveesh Kapoor' },
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: '+91-120-4502750',
    contactType: 'customer service',
    areaServed: ['IN', 'US', 'GB', 'CA', 'AU', 'NZ'],
    availableLanguage: ['English', 'Hindi'],
  },
  sameAs: [
    'https://www.instagram.com/avisa.expert/',
    'https://www.facebook.com/profile.php?id=61590985693281',
    'https://www.youtube.com/@avisaexperts',
    'https://www.linkedin.com/company/a-visa-experts',
  ],
};

const localBusinessLd = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  name: 'A Visa Experts',
  image: `${SITE_URL}/images/user/tmlogo%201.webp`,
  url: SITE_URL,
  telephone: '+91-120-4502750',
  priceRange: '₹₹',
  description:
    'Trusted No.1 Visa Immigration Company for tourist, work, transit and permanent residency visas.',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'B Block, Sector 2',
    addressLocality: 'Noida',
    addressRegion: 'Uttar Pradesh',
    postalCode: '201301',
    addressCountry: 'IN',
  },
  geo: { '@type': 'GeoCoordinates', latitude: 28.5695, longitude: 77.321 },
  openingHours: 'Mo-Sa 11:00-18:00',
  sameAs: [
    'https://www.instagram.com/avisa.expert/',
    'https://www.facebook.com/profile.php?id=61590985693281',
    'https://www.youtube.com/@avisaexperts',
  ],
};

const websiteLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'A Visa Experts',
  url: SITE_URL,
  potentialAction: {
    '@type': 'SearchAction',
    target: `${SITE_URL}/consultants?q={search_term_string}`,
    'query-input': 'required name=search_term_string',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Open+Sans:wght@300;400;500;600;700&family=Caveat:wght@500;600;700&family=Alex+Brush&family=Mrs+Saint+Delafield&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css"
          rel="stylesheet"
        />
        <link
          href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css"
          rel="stylesheet"
        />
      </head>
      <body>
        {children}
        <Toaster position="top-right" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteLd) }}
        />
      </body>
    </html>
  );
}
