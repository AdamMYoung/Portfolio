import { JOB_TITLE, PERSON_NAME, SAME_AS, SITE_NAME, SITE_URL } from "./site";

// Person + WebSite, as one @graph. Everything here maps to content that is
// actually rendered on the page (the About / Projects / Contact panels, and
// their <noscript> fallback) — no invented ratings, orgs or claims.
const graph = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Person",
      "@id": `${SITE_URL}/#person`,
      name: PERSON_NAME,
      alternateName: "Adam Young",
      url: SITE_URL,
      image: `${SITE_URL}/apple-icon`,
      jobTitle: JOB_TITLE,
      email: "mailto:adam@adammyoung.com",
      worksFor: { "@type": "Organization", name: "9fin" },
      knowsAbout: [
        "Software Engineering",
        "React",
        "Next.js",
        "TypeScript",
        "Python",
        "Web Performance",
        "Accessibility",
      ],
      sameAs: SAME_AS,
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: SITE_NAME,
      description: "Interactive CRT-desktop portfolio of Adam Young, Senior Software Engineer.",
      inLanguage: "en-GB",
      publisher: { "@id": `${SITE_URL}/#person` },
    },
  ],
};

export function JsonLd() {
  return (
    <script
      type="application/ld+json"
      // biome-ignore lint/security/noDangerouslySetInnerHtml: static, self-authored structured data
      dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }}
    />
  );
}
