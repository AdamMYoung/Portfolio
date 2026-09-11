/** The panels that have a URL. One level deep, all statically generated —
 *  `/` is the About panel, so About has no second URL of its own.
 *  `index` marks the ones worth putting in the sitemap; the diversions are
 *  linkable but not content. */
export type Route = {
  id: string;
  path: string;
  title: string;
  description: string;
  index?: boolean;
};

/** Built, not launched — flip to true to bring back the panel and its URL. */
export const JUKEBOX_ENABLED = false;

const ALL: Route[] = [
  {
    id: "about",
    path: "/",
    title: "About",
    description:
      "Adam Young, Senior Software Engineer at 9fin. React, Next.js and Python, on an interactive CRT desktop.",
    index: true,
  },
  {
    id: "careers",
    path: "/careers",
    title: "Careers",
    description:
      "Seven years of product engineering — 9fin, Checkout.com, Curve and TerraQuest. React, Next.js, TypeScript and Python.",
    index: true,
  },
  {
    id: "projects",
    path: "/projects",
    title: "Projects",
    description:
      "Side projects by Adam Young — TrailWise, a photography site on Cloudflare R2, and Blurdle.",
    index: true,
  },
  {
    id: "contact",
    path: "/contact",
    title: "Contact",
    description: "Get in touch with Adam Young — email, GitHub, X and LinkedIn.",
    index: true,
  },
  { id: "jukebox", path: "/jukebox", title: "Jukebox", description: "Synthwave on the desktop." },
  { id: "snake", path: "/snake", title: "Neon Snake", description: "Snake, in neon." },
  {
    id: "invaders",
    path: "/invaders",
    title: "Vector Invaders",
    description: "Vector space invaders.",
  },
  { id: "matrix", path: "/matrix", title: "Matrix", description: "Digital rain." },
  {
    id: "hacker",
    path: "/hacker",
    title: "H4CK.EXE",
    description: "Hollywood hacking, on a loop.",
  },
];

export const ROUTES = ALL.filter((r) => r.id !== "jukebox" || JUKEBOX_ENABLED);

export const pathOf = (id: string) => ROUTES.find((r) => r.id === id)?.path ?? "/";
export const routeOf = (path: string) => ROUTES.find((r) => r.path === path);

/** Matches the `title.template` in app/layout.tsx — shallow URL changes don't
 *  re-run `generateMetadata`, so the client sets the document title itself. */
export const titleOf = (id: string) => {
  const route = ROUTES.find((r) => r.id === id);
  return !route || route.path === "/"
    ? "Adam Young — Software Engineer"
    : `${route.title} — Adam Young`;
};
