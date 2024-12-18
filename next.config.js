/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        "punycode": false
      };
    }
    return config;
  },
  // Packages that need transpilation
  transpilePackages: ['katex', 'prismjs'],
};

module.exports = nextConfig;