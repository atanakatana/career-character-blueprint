/** @type {import('next').NextConfig} */
const nextConfig = {
  // Required for Docker standalone deployment
  output: 'standalone',
  // Remove X-Powered-By header
  poweredByHeader: false,
  // Image optimization config (expand in Sprint 3+)
  images: {
    remotePatterns: [],
  },
};

export default nextConfig;