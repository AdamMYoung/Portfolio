/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  swcMinify: true,
  transpilePackages: ["components"],
  pageExtensions: ["ts", "tsx", "js", "jsx", "md", "mdx"],
  experimental: {
    optimizePackageImports: ["components"],
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: process.env.AWS_S3_BUCKET_HOSTNAME,
        port: "",
        pathname: `/${process.env.AWS_S3_BUCKET_NAME}/**`,
      },
    ],
  },
};
