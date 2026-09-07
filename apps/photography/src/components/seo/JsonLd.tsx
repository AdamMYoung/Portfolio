import { absolute, PERSON_NAME, SAME_AS, SITE_NAME, SITE_URL } from "./site";

// biome-ignore lint/suspicious/noExplicitAny: JSON-LD is loosely typed by nature
type Json = Record<string, any>;

export const JsonLd = ({ data }: { data: Json | Json[] }) => (
  <script
    type="application/ld+json"
    // biome-ignore lint/security/noDangerouslySetInnerHtml: static, self-authored structured data
    dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
  />
);

// The photographer + the site. Everything maps to rendered content (the
// header, the About copy, the social links).
export const personAndSite = (): Json => ({
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Person",
      "@id": `${SITE_URL}/#person`,
      name: PERSON_NAME,
      alternateName: "Adam Young",
      url: SITE_URL,
      jobTitle: "Photographer",
      image: `${SITE_URL}/api/icon`,
      sameAs: SAME_AS,
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: SITE_NAME,
      inLanguage: "en-GB",
      about: { "@id": `${SITE_URL}/#person` },
      publisher: { "@id": `${SITE_URL}/#person` },
    },
  ],
});

// An ImageGallery for the /list and /gallery routes. `images` are absolute
// URLs of photographs that are actually on the page.
export const imageGallery = ({
  name,
  description,
  path,
  images,
}: {
  name: string;
  description: string;
  path: string;
  images: string[];
}): Json => ({
  "@context": "https://schema.org",
  "@type": "ImageGallery",
  "@id": `${absolute(path)}#gallery`,
  name,
  description,
  url: absolute(path),
  inLanguage: "en-GB",
  isPartOf: { "@id": `${SITE_URL}/#website` },
  author: { "@id": `${SITE_URL}/#person` },
  numberOfItems: images.length,
  associatedMedia: images.slice(0, 60).map((url) => ({
    "@type": "ImageObject",
    contentUrl: url,
    creator: { "@id": `${SITE_URL}/#person` },
  })),
});
