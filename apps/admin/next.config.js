/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Transpile workspace packages (TS source shipped uncompiled).
  transpilePackages: ['@glint/design-tokens', '@glint/types'],
};

module.exports = nextConfig;
