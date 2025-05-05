/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  webpack: (config) => {
    // Exclude storybook files from the build
    config.module.rules.push({
      test: /\.stories\.(js|jsx|ts|tsx)$/,
      loader: 'ignore-loader',
    });
    
    return config;
  },
};

module.exports = nextConfig; 