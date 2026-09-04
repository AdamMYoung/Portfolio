import Blurdle, { meta as blurdle } from "@/content/projects/blurdle.mdx";
import Photography, { meta as photography } from "@/content/projects/photography.mdx";
import TrailWise, { meta as trailwise } from "@/content/projects/trailwise.mdx";

const PROJECTS = [
  { Body: TrailWise, meta: trailwise },
  { Body: Photography, meta: photography },
  { Body: Blurdle, meta: blurdle },
];

/** Server component — the Projects window body. Renders every project's MDX with
 *  a consistent header. Zero client JS. */
export function ProjectsPanel() {
  return (
    <div className="projects">
      {PROJECTS.map(({ Body, meta }) => (
        <article key={meta.title} className="projects__item">
          <header className="projects__head">
            <h2>
              <a href={meta.url} target="_blank" rel="noopener noreferrer">
                {meta.title}
              </a>
            </h2>
            <p className="projects__year">{meta.year}</p>
          </header>
          {meta.stack ? (
            <ul className="projects__stack" aria-label="Tech stack">
              {meta.stack.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          ) : null}
          <Body />
        </article>
      ))}
    </div>
  );
}
