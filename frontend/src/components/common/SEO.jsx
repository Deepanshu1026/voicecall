import { Helmet } from 'react-helmet-async';

const SEO = ({ title, description, keywords, ogImage, ogType = 'website', canonicalPath, jsonLd }) => {
  const baseUrl = 'https://avisaexperts.com';
  const canonical = canonicalPath ? `${baseUrl}${canonicalPath}` : baseUrl;
  const image = ogImage || `${baseUrl}/images/user/tmlogo 1.webp`;
  const defaultKeywords = 'A Visa Experts, Best Visa Immigration Company, Visa Immigration Experts, No.1 Visa Immigration Company, best immigration consultants, best visa consultants, top immigration consultants, PR consultants, tourist visa consultants, immigration agents, apply for PR visa, best immigration services, permanent residency application, PR visa, permanent resident Visa, visa consultant, immigration experts, visa agent, visa immigration consultants, immigration agent';

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords || defaultKeywords} />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta name="robots" content="index,follow" />
      <meta name="YahooSeeker" content="index,follow" />
      <meta name="msnbot" content="index,follow" />
      <meta name="googlebot" content="index,follow" />
      <meta name="language" content="English, Hindi" />
      <meta name="author" content="A Visa Experts" />
      <meta name="format-detection" content="telephone=no" />
      <meta name="geo.region" content="IN" />
      <meta name="geo.placename" content="India" />
      <link rel="canonical" href={canonical} />
      <meta property="og:locale" content="en_US" />
      <meta property="og:type" content={ogType} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonical} />
      <meta property="og:image" content={image} />
      <meta property="og:image:alt" content="A Visa Experts" />
      <meta property="og:site_name" content="A Visa Experts" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@avisaexperts" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      {(Array.isArray(jsonLd) ? jsonLd : jsonLd ? [jsonLd] : []).map((schema, i) => (
        <script key={i} type="application/ld+json">{JSON.stringify(schema)}</script>
      ))}
    </Helmet>
  );
};

export default SEO;
