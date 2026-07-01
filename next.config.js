/** @type {import('next').NextConfig} */
const nextConfig = {
  // Exclude merged sub-projects from page routing
  experimental: {
    serverComponentsExternalPackages: ['claritas-app', 'src'],
  },
};

module.exports = nextConfig;
