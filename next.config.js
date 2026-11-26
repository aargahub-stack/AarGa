/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typescript: {
    // Speed up Cloudflare build by trusting local TypeScript checks
    ignoreBuildErrors: true,
  },
<<<<<<< HEAD
=======
  eslint: {
    // Speed up Cloudflare build by skipping linting step during bundling
    ignoreDuringBuilds: true,
  },
>>>>>>> 949a6bd32e64e675d969963250b774cb8a07b549
};

module.exports = nextConfig;
