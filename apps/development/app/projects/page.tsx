import Image from "next/image";
import { Link } from "../client-components";

import blurdle from "../../src/images/blurdle.png";
import biscuit from "../../src/images/biscuit-sog-index.png";
import photography from "../../src/images/photography.png";

export default function Projects() {
  return (
    <div className="flex flex-col gap-16">
      <div className="flex flex-col gap-8">
        <h1 className="text-3xl font-bold">Projects</h1>
        <p>Here&apos;s some of the projects I&apos;ve made in the past.</p>
      </div>
      <div className="flex flex-col gap-16">
        {/* Photography Portfolio */}
        <section className="grid gap-8 md:grid-cols-2">
          <Image
            priority
            alt="Screenshot of the photography homepage"
            className="order-1 rounded border shadow"
            src={photography}
          />
          <div className="order-2 flex flex-col gap-8">
            <h2 className="text-3xl">Photography Portfolio</h2>
            <p>
              I recently decided to revamp my development and photography portfolio, making use of Next.js 13 features
              such as the <code className="rounded bg-gray-800 px-1">app</code> directory, a monorepo structure with a
              shared component library, and yarn 3 package management.
            </p>
            <Link type="external" href="https://photography.aydev.uk">
              photography.aydev.uk
            </Link>
          </div>
        </section>

        {/* Blurdle */}
        <section className="grid gap-8 md:grid-cols-2">
          <div className="order-2 flex flex-col gap-8 md:order-1">
            <h2 className="text-3xl">Blurdle</h2>
            <p>
              Blurdle is a daily browser-based game based on <a>Wordle</a>, in which players try and guess a daily
              blurred picture within 5 guesses. The site features score tracking and achievements, and was built using
              server-side rendering features provided by Next.js.
            </p>
            <Link type="external" href="https://blurdle.aydev.uk">
              blurdle.aydev.uk
            </Link>
          </div>

          <Image
            priority
            alt="Screenshot of the blurdle homepage"
            className="order-1 rounded border shadow md:order-2"
            src={blurdle}
          />
        </section>

        {/* Biscuit Sog */}
        <section className="grid gap-8 md:grid-cols-2">
          <Image
            priority
            alt="Screenshot of the biscuit sog index homepage"
            className="order-1 rounded border shadow md:order-1"
            src={biscuit}
          />
          <div className="order-2 flex flex-col gap-8 md:order-2">
            <h2 className="text-3xl">Biscuit Sog Index</h2>
            <p>
              Have you ever wondered how long it takes for a biscuit to go soggy in a cup of tea, maximizing soakage
              without it all falling apart in your cup? If so, this is the site for you! Initially made as a joke for a
              friend, the site is built using Next.js and backed by a CMS for easy editing.
            </p>
            <Link type="external" href="https://biscuit.aydev.uk/">
              biscuit.aydev.uk
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
