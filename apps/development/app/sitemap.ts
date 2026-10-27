import type { MetadataRoute } from "next";
import { ROUTES } from "./routes";
import { SITE_URL } from "./site";

// One URL per content panel (app/routes.ts). Each renders the desktop with
// that window already open, so every entry has real content behind it; the
// games are linkable but deliberately not listed.
// No lastModified: it was `new Date()`, so every fetch claimed every page had
// just changed, and a lastmod that's always "now" teaches crawlers to ignore it.
export default function sitemap(): MetadataRoute.Sitemap {
  return ROUTES.filter((r) => r.index).map((r) => ({
    url: `${SITE_URL}${r.path}`,
    changeFrequency: "monthly",
    priority: r.path === "/" ? 1 : 0.8,
  }));
}
