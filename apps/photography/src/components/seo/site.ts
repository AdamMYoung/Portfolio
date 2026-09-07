// Single source of truth for photography-site metadata — imported by the
// <Seo> head component, the sitemap route and the OG image route so they
// can never drift.
export const SITE_URL = "https://photography.adammyoung.com";
export const SITE_NAME = "Adam Young Photography";
export const PERSON_NAME = "Adam M. Young";
export const TWITTER = "@AdamMYoung_";

export const DEFAULT_DESCRIPTION =
  "The photography portfolio of Adam Young — landscapes, travel and the outdoors, browsable as a plain grid or a walk-through 3D gallery.";

export const SAME_AS = [
  "https://www.instagram.com/adammyoung_/",
  "https://twitter.com/AdamMYoung_",
  "https://development.adammyoung.com",
];

export const absolute = (path: string) =>
  path.startsWith("http") ? path : `${SITE_URL}${path.startsWith("/") ? "" : "/"}${path}`;

// Run a full-res R2 original through Next's image optimizer so a shared card
// gets a sensibly sized, format-negotiated image instead of a ~9 MB file.
export const ogImageFor = (originalUrl: string) =>
  `${SITE_URL}/_next/image?url=${encodeURIComponent(originalUrl)}&w=1200&q=72`;
