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

// Change this line from CommonJS to ES Module syntax
export default nextConfig;