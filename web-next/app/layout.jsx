import './globals.css';
import Script from 'next/script';
import GoogleAnalytics from '../components/GoogleAnalytics';
import ScrollLockManager from '../components/ScrollLockManager';
import '../styles/userLanding.css';
import '../styles/services.css';
import '../styles/about.css';
import '../styles/blogs.css';
import '../styles/seminar.css';
import '../styles/visaPages.css';
import '../styles/aboutSection.css';
import '../styles/fonts.css';

const SITE_URL = 'https://avisaexperts.com';

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'A Visa Experts | No.1 Visa Immigration Company in India',
    template: '%s',
  },
  description:
    "A Visa Experts is India's trusted No.1 Visa Immigration Company. We help with tourist, transit and PR visas for USA, UK, Canada, Australia, Europe & NZ. Free consultation with expert immigration consultants.",
  keywords:
    'A Visa Experts, Best Visa Immigration Company, Visa Immigration Experts, No.1 Visa Immigration Company, best immigration consultants, best visa consultants, tourist visa consultants, PR consultants, permanent residency application, visa agent, immigration agent, visa consultancy India',
  authors: [{ name: 'A Visa Experts' }],
  verification: {
    other: { 'msvalidate.01': '1907D46034778900D454338DBF5A543D' },
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
  alternates: { canonical: 'https://avisaexperts.com/', languages: { en: '/', 'en-IN': '/', 'x-default': '/' } },
  icons: {
    icon: [{ url: '/images/user/logo%202.webp', type: 'image/webp' }],
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'A Visa Experts',
    title: 'A Visa Experts | No.1 Visa Immigration Company in India',
    description:
      "India's trusted No.1 Visa Immigration Company. Free consultation for tourist, transit & PR visas for USA, UK, Canada, Australia, Europe & NZ.",
    url: SITE_URL,
    images: [{ url: '/images/user/tmlogo%201.webp', alt: 'A Visa Experts logo' }],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@avisaexperts',
    title: 'A Visa Experts | No.1 Visa Immigration Company in India',
    description:
      "India's trusted No.1 Visa Immigration Company for tourist, transit & PR visas.",
    images: ['/images/user/tmlogo%201.webp'],
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#001e74',
};

const organizationLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'A Visa Experts',
  url: SITE_URL,
  logo: `${SITE_URL}/images/user/tmlogo%201.webp`,
  description:
    "India's trusted No.1 Visa Immigration Company helping individuals and families secure tourist, transit and PR visas.",
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
    'Trusted No.1 Visa Immigration Company for tourist, transit and permanent residency visas.',
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
  description:
    "India's trusted No.1 Visitor Visa & Immigration Company. Expert guidance for UK, USA, Canada, Australia & Europe visitor visas, tourist visas and permanent residency.",
  inLanguage: 'en-IN',
  potentialAction: {
    '@type': 'SearchAction',
    target: `${SITE_URL}/consultants?q={search_term_string}`,
    'query-input': 'required name=search_term_string',
  },
  sameAs: [
    'https://www.instagram.com/avisa.expert/',
    'https://www.facebook.com/profile.php?id=61590985693281',
    'https://www.youtube.com/@avisaexperts',
  ],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-TDW4SCLJRV"
          strategy="lazyOnload"
        />
        <Script id="ga-init" strategy="lazyOnload">
          {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'G-TDW4SCLJRV', { send_page_view: false });`}
        </Script>
        <GoogleAnalytics />
        <ScrollLockManager />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@graph': [organizationLd, localBusinessLd, websiteLd],
            }),
          }}
        />
      </body>
    </html>
  );
}
