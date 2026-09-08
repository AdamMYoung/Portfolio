import { Link } from "../src/components/link";
import { JsonLd, personAndSite, Seo } from "../src/components/seo";

// Deliberately mirrors the gallery's loading curtain (see GalleryHud): the
// same charcoal ground, Baskerville, a tracked eyebrow over a large serif
// title, a hairline rule, and outline-pill actions.
const SERIF = { fontFamily: "var(--font-baskerville), Georgia, serif" } as const;

const Choice = ({ href, label }: { href: string; label: string }) => (
  <Link
    href={href}
    className="rounded-full border border-white/25 px-7 py-3 text-sm tracking-wide text-white/90 transition-colors hover:border-white/50 hover:bg-white/10"
  >
    <span>{label}</span>
  </Link>
);

export default function Home() {
  return (
    <>
      <Seo
        title="Adam Young — Photography"
        description="The photography portfolio of Adam Young — landscapes, travel and the outdoors. Browse a plain grid or walk through a 3D gallery."
        path="/"
        type="profile"
      />
      <JsonLd data={personAndSite()} />

      <section
        className="flex min-h-dvh flex-col items-center justify-center bg-[#0d0b0a] px-6 text-center text-[#f3efe6]"
        style={SERIF}
      >
        <p className="text-xs uppercase tracking-[0.4em] text-white/50">Adam Young</p>
        <h1 className="mt-3 text-4xl font-normal tracking-wide sm:text-5xl">Photography</h1>
        <p className="mt-4 max-w-sm text-sm text-white/60">
          Landscapes, travel and the outdoors — as a walk-through gallery or a plain grid.
        </p>

        <div className="mt-8 h-px w-48 bg-white/15" />

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Choice href="/gallery" label="Walk the 3D gallery" />
          <Choice href="/list" label="Browse the grid" />
        </div>
      </section>
    </>
  );
}
