import type { MetadataRoute } from "next";
import { SITE_URL } from "./site";

// The portfolio is a single route — everything (about, projects, contact,
// the games) lives in panels on "/".
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: `${SITE_URL}/`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
  ];
}
