// next.config.js

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['images.unsplash.com'],
  },
  eslint: {
    // Allow production builds to successfully complete even if
    // there are ESLint errors. This is useful while iterating.
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;
