/** @type {import('next').NextConfig} */
module.exports = {
  // react-three-fiber's Canvas manages a real WebGL context and isn't
  // safe under StrictMode's dev-only double-invoke of effects — it leaves
  // the canvas orphaned (never sized, nothing rendered) after the
  // mount/unmount/remount cycle. Off site-wide since this is the only page
  // using a WebGL canvas.
  reactStrictMode: false,
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
