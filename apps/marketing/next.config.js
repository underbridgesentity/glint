/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@glint/design-tokens'],
  // The customer web app (Expo, in public/app) is an SPA. Real files under
  // /app are served first; any client route falls back to its index.html.
  async rewrites() {
    return {
      afterFiles: [
        { source: '/app', destination: '/app/index.html' },
        { source: '/app/:path*', destination: '/app/index.html' },
      ],
    };
  },
};

module.exports = nextConfig;
