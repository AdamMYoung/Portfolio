import About, { meta as about } from "@/content/about.mdx";
import Careers, { meta as careers } from "@/content/careers.mdx";
import Contact, { meta as contact } from "@/content/contact.mdx";
import { Desktop, type Panel } from "./desktop";
import { Jukebox } from "./jukebox";
import { ProjectsPanel } from "./projects-panel";
import { JUKEBOX_ENABLED } from "./routes";

const ALL: Panel[] = [
  {
    id: "about",
    title: about.title,
    icon: about.icon ?? "👤",
    node: <About />,
    width: 520,
    height: 460,
  },
  {
    id: "projects",
    title: "Projects",
    icon: "🗂️",
    node: <ProjectsPanel />,
    width: 560,
    height: 520,
  },
  {
    id: "careers",
    title: careers.title,
    icon: careers.icon ?? "💼",
    node: <Careers />,
    width: 560,
    height: 520,
  },
  {
    id: "contact",
    title: contact.title,
    icon: contact.icon ?? "✉️",
    node: <Contact />,
    width: 480,
    height: 420,
  },
  {
    id: "jukebox",
    title: "Jukebox",
    icon: "📻",
    node: <Jukebox />,
    side: "right",
    width: 380,
    height: 460,
  },
  {
    id: "snake",
    title: "Neon Snake",
    icon: "🐍",
    app: "snake",
    side: "right",
    width: 430,
    height: 540,
    disableOnTouch: true,
  },
  {
    id: "invaders",
    title: "Vector Invaders",
    icon: "👾",
    app: "invaders",
    side: "right",
    width: 520,
    height: 540,
    disableOnTouch: true,
  },
  {
    id: "matrix",
    title: "Matrix",
    icon: "🟩",
    app: "matrix",
    side: "right",
    width: 540,
    height: 420,
  },
  {
    id: "hacker",
    title: "H4CK.EXE",
    icon: "💾",
    app: "hacker",
    side: "right",
    width: 640,
    height: 460,
  },
];

const panels = ALL.filter((p) => p.id !== "jukebox" || JUKEBOX_ENABLED);

/** Every route renders the same desktop; only which window starts open (and so
 *  which content is in the server-rendered HTML) differs. */
export function DesktopPage({ defaultOpen }: { defaultOpen: string }) {
  return (
    <main>
      <h1 className="sr-only">
        Adam Young — software engineer. Interactive CRT desktop portfolio.
      </h1>
      <Desktop panels={panels} defaultOpen={defaultOpen} />

      {/* No-JS / crawler fallback: the same content as plain flow. */}
      <noscript>
        <div className="noscript-fallback">
          <About />
          <hr />
          <ProjectsPanel />
          <hr />
          <Careers />
          <hr />
          <Contact />
        </div>
      </noscript>
    </main>
  );
}
