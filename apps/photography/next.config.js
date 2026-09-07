/** @type {import('next').NextConfig} */
module.exports = {
  // Don't scatter generated AGENTS.md / CLAUDE.md into the app dir — this
  // repo keeps its agent instructions at the root.
  agentRules: false,
  // react-three-fiber's Canvas manages a real WebGL context and isn't
  // safe under StrictMode's dev-only double-invoke of effects — it leaves
  // the canvas orphaned (never sized, nothing rendered) after the
  // mount/unmount/remount cycle. Off site-wide since this is the only page
  // using a WebGL canvas.
  reactStrictMode: false,
  staticPageGenerationTimeout: 1000,
  pageExtensions: ["ts", "tsx", "js", "jsx", "md", "mdx"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.photography.adammyoung.com",
      },
    ],
  },
};
