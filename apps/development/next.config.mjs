import bundleAnalyzer from "@next/bundle-analyzer";
import createMDX from "@next/mdx";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // We keep repo-level AI guidance in the root, not per-app generated files.
  agentRules: false,
  pageExtensions: ["ts", "tsx", "mdx"],
  transpilePackages: [
    "@portfolio/design-tokens",
    "@portfolio/crt",
    "@portfolio/ui",
    "@portfolio/games",
  ],
  experimental: {
    // Keep barrel imports from dragging whole packages into a route.
    optimizePackageImports: ["@portfolio/ui", "@portfolio/crt"],
  },
  images: {
    formats: ["image/avif", "image/webp"],
  },
  // Strip the console in prod except errors — smaller client bundles.
  compiler: {
    removeConsole: { exclude: ["error", "warn"] },
  },
  async rewrites() {
    return [
      {
        source: "/ingest/static/:path*",
        destination: `${process.env.NEXT_PUBLIC_POSTHOG_HOST?.replace("eu.i.", "eu-assets.i.")}/static/:path*`,
      },
      {
        source: "/ingest/array/:path*",
        destination: `${process.env.NEXT_PUBLIC_POSTHOG_HOST?.replace("eu.i.", "eu-assets.i.")}/array/:path*`,
      },
      {
        source: "/ingest/:path*",
        destination: `${process.env.NEXT_PUBLIC_POSTHOG_HOST}/:path*`,
      },
    ];
  },
  // Required to support PostHog trailing slash API requests
  skipTrailingSlashRedirect: true,
};

const withMDX = createMDX({
  // Turbopack requires serializable plugin entries — reference plugins by name.
  options: {
    remarkPlugins: [["remark-gfm", {}]],
    rehypePlugins: [["rehype-slug", {}]],
  },
});

const withAnalyzer = bundleAnalyzer({ enabled: process.env.ANALYZE === "true" });

export default withAnalyzer(withMDX(nextConfig));
