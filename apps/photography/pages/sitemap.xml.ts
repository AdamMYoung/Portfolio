import type { GetServerSideProps } from "next";

import { SITE_URL } from "../src/components/seo";
import { listPhotoUrls } from "../src/utils";

// A real image sitemap — every photograph in the collection, attached to the
// pages that show it. Regenerated on request, edge-cached for a day.
const xmlEscape = (s: string) => s.replace(/[<>&'"]/g, (c) => `&#${c.charCodeAt(0)};`);

const urlEntry = (path: string, priority: string, images: string[] = []) => {
  const imageTags = images
    .map((src) => `\n    <image:image><image:loc>${xmlEscape(src)}</image:loc></image:image>`)
    .join("");
  return `  <url>
    <loc>${SITE_URL}${path}</loc>
    <changefreq>${path === "/" ? "monthly" : "weekly"}</changefreq>
    <priority>${priority}</priority>${imageTags}
  </url>`;
};

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  const photos = await listPhotoUrls().catch(() => []);

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urlEntry("/", "1.0")}
${urlEntry("/list", "0.9", photos)}
${urlEntry("/gallery", "0.8", photos)}
</urlset>`;

  res.setHeader("Content-Type", "application/xml; charset=utf-8");
  res.setHeader("Cache-Control", "public, s-maxage=86400, stale-while-revalidate=43200");
  res.write(xml);
  res.end();

  return { props: {} };
};

export default function Sitemap() {
  return null;
}
