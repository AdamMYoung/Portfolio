/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  swcMinify: true,
  transpilePackages: ["components"],
  staticPageGenerationTimeout: 1000,
  pageExtensions: ["ts", "tsx", "js", "jsx", "md", "mdx"],
  experimental: {
    optimizePackageImports: ["components"],
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.photography.adammyoung.com",
      },
    ],
  },
};
