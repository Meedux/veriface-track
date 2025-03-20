/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    // Fix for face-api.js requiring 'fs' module
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        crypto: false,
        path: false,
        os: false
      };
    }
    return config;
  },
  transpilePackages: ['face-api.js']
};

module.exports = nextConfig;