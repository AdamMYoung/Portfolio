import About, { meta as about } from "@/content/about.mdx";
import Contact, { meta as contact } from "@/content/contact.mdx";
import { Desktop, type Panel } from "./desktop";
import { ProjectsPanel } from "./projects-panel";

const panels: Panel[] = [
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
    id: "contact",
    title: contact.title,
    icon: contact.icon ?? "✉️",
    node: <Contact />,
    width: 480,
    height: 420,
  },
  {
    id: "snake",
    title: "Neon Snake",
    icon: "🐍",
    app: "snake",
    side: "right",
    width: 430,
    height: 540,
  },
  {
    id: "invaders",
    title: "Vector Invaders",
    icon: "👾",
    app: "invaders",
    side: "right",
    width: 520,
    height: 540,
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

export default function Page() {
  return (
    <main>
      <h1 className="sr-only">
        Adam Young — software engineer. Interactive CRT desktop portfolio.
      </h1>
      <Desktop panels={panels} defaultOpen="about" />

      {/* No-JS / crawler fallback: the same content as plain flow. */}
      <noscript>
        <div className="noscript-fallback">
          <About />
          <hr />
          <ProjectsPanel />
          <hr />
          <Contact />
        </div>
      </noscript>
    </main>
  );
}
