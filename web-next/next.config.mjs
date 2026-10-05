/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: { ignoreDuringBuilds: true },
  images: { unoptimized: true },
  async redirects() {
    return [
      { source: '/home', destination: '/', permanent: true },
      { source: '/work-visa', destination: '/services', permanent: true },
      { source: '/usa-visitor-visa', destination: '/usa-visa', permanent: true },
      { source: '/canada-visitor-visa', destination: '/canada-visa', permanent: true },
      { source: '/uk-visitor-visa', destination: '/uk-visa', permanent: true },
    ];
  },
};

export default nextConfig;
