/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    appDir: true,
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: '/api/:path*',
      },
      {
        source: '/',
        destination: '/',
      },
      {
        source: '/admin',
        destination: '/admin',
      },
      {
        source: '/segments',
        destination: '/segments',
      },
      {
        source: '/bookmarklet',
        destination: '/bookmarklet',
      }
    ];
  },
  async redirects() {
    return [
      {
        source: '/index',
        destination: '/',
        permanent: true,
      }
    ];
  }
};

module.exports = nextConfig; 