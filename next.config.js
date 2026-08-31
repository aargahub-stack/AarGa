/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typescript: {
    // Speed up Cloudflare build by trusting local TypeScript checks
    ignoreBuildErrors: true,
  },
  eslint: {
    // Speed up Cloudflare build by skipping linting step during bundling
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;
