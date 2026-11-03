import DetailedPage from '../../components/pages/DetailedPage';

const SITE_URL = 'https://avisaexperts.com';

const TITLE = 'Detailed Page — Technical & Deployment Reference';
const DESCRIPTION =
  'Developer and DevOps reference for the A Visa Experts platform: applications, hosting, routing, API, database, SEO infrastructure and deployment steps.';

export const metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: `${SITE_URL}/detailed-page` },
  openGraph: {
    type: 'website',
    title: TITLE,
    description: DESCRIPTION,
    url: `${SITE_URL}/detailed-page`,
    siteName: 'A Visa Experts',
  },
  // Internal reference for the dev team — not meant for search engines.
  robots: { index: false, follow: true },
};

export default function Page() {
  return <DetailedPage />;
}
