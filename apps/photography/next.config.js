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
    // Next 16 rejects any /_next/image request whose `q` isn't on this list
    // (default is [75] only). The gallery textures (q=78), the modal's
    // full-res view (q=80) and blur-up thumb (q=30), and the OG card (q=72)
    // all need to be allowed here.
    qualities: [30, 50, 72, 75, 78, 80, 90],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.photography.adammyoung.com",
      },
    ],
  },
};
