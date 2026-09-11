import type { MetadataRoute } from "next";
import { ROUTES } from "./routes";
import { SITE_URL } from "./site";

// One URL per content panel (app/routes.ts). Each renders the desktop with
// that window already open, so every entry has real content behind it; the
// games are linkable but deliberately not listed.
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return ROUTES.filter((r) => r.index).map((r) => ({
    url: `${SITE_URL}${r.path}`,
    lastModified,
    changeFrequency: "monthly",
    priority: r.path === "/" ? 1 : 0.8,
  }));
}
