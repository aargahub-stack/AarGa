/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typescript: {
    // Speed up Cloudflare build by trusting local TypeScript checks
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig;
