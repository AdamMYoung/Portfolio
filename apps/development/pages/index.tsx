/* eslint-disable react/jsx-no-target-blank */
import { IconLink } from "../src/components/icon-link";
import Image from "next/image";

import blurdle from "../src/images/blurdle.png";
import hike from "../src/images/hike.png";
import photography from "../src/images/photography.png";

import React from "../src/svg/react.svg";
import NineFin from "../src/svg/9fin.png";
import TrailWise from "../src/svg/trailwise.png";
import Head from "next/head";
import Link from "next/link";

export default function Home() {
  return (
    <>
      <Head>
        <title>Adam Young | Development</title>
        <meta name="description" content="Development portfolio of Software Engineer, Adam Young" />
      </Head>
      <div className="container mx-auto flex max-w-2xl flex-col gap-16 px-4 py-12 text-gray-300 md:px-0">
        <nav>
          <span className="text-2xl font-semibold">Adam M. Young</span>
        </nav>

        <div className="flex flex-col gap-12">
          <div className="flex flex-col gap-4">
            <h1 className="text-3xl font-semibold text-white">Hi! 👋</h1>
            <p>
              I&apos;m Adam Young, a software developer, photographer, hiker, and <i>occasional</i> runner. I currently
              work as a Software Engineer at{" "}
              <IconLink
                href="https://checkout.com"
                target="_blank"
                rel="noreferrer"
                icon={<Image height="12" width="12" src={NineFin} alt="" />}
              >
                9fin
              </IconLink>{" "}
              where I&apos;m working on a bunch of incredible tools and sites built in{" "}
              <IconLink href="https://react.dev/" target="_blank" rel="noreferrer" icon={<React />}>
                React
              </IconLink>
              .
            </p>
            <p>
              In my spare time, I&apos;m also working on{" "}
              <IconLink
                href="https://trailwise.io"
                target="_blank"
                icon={<Image height="12" width="12" src={TrailWise} alt="" />}
              >
                TrailWise
              </IconLink>
              , which you can read about below!
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <h2 className="text-xl font-semibold text-white">Projects</h2>
          <div className="flex flex-col gap-12">
            <section className="flex flex-col gap-2">
              <Image
                alt="Screenshot of the trailwise.io dashboard, with a map in centre and lists of hill groups to the side."
                src={hike}
                className="rounded-lg border border-gray-700"
                priority
                quality={50}
                placeholder="blur"
                sizes="(max-width: 1024px) 90vw, 50vw"
              />
              <div className="flex flex-col gap-3 p-2">
                <a
                  className="text-xl text-white underline hover:no-underline"
                  target="_blank"
                  href="https://trailwise.io"
                >
                  trailwise.io
                </a>
                <p>
                  TrailWise is a hiking, gear, and social platform used to track mountain peak summits and trail routes
                  worldwide. Features historical timeline tracking, gear management, trip planning, social integrations
                  and much more!
                </p>
                <p>The site is built with Next.js Server Components, backed by fly.io, Redis, and Vercel.</p>
              </div>
            </section>
            <section className="flex flex-col gap-2">
              <Image
                alt="Screenshot of the photography.adammyoung.com site, with a collage of images filling the screen."
                src={photography}
                className="rounded-lg border border-gray-700"
                quality={50}
                priority
                placeholder="blur"
                sizes="(max-width: 1024px) 90vw, 50vw"
              />
              <div className="flex flex-col gap-3 p-2">
                <a
                  className="text-xl text-white underline hover:no-underline"
                  target="_blank"
                  href="https://photography.adammyoung.com"
                >
                  photography.adammyoung.com
                </a>
                <p>My personal photography site, serving images from Cloudflare R2 and built on Next.js.</p>
              </div>
            </section>
            <section className="flex flex-col gap-2">
              <Image
                alt="Screenshot of the blurdle.adammyoung.com site, with a blurred out picture in the middle of the screen."
                src={blurdle}
                className="rounded-lg border border-gray-700"
                quality={50}
                placeholder="blur"
                sizes="(max-width: 1024px) 90vw, 50vw"
              />
              <div className="flex flex-col gap-3 p-2">
                <a
                  className="text-xl text-white underline hover:no-underline"
                  target="_blank"
                  href="https://blurdle.adammyoung.com"
                >
                  blurdle.adammyoung.com
                </a>
                <p>
                  Blurdle is a daily browser-based game based on Wordle, in which players try and guess a daily blurred
                  picture within 5 guesses. The site features score tracking and achievements, and was built using
                  server-side rendering features provided by Next.js.
                </p>
              </div>
            </section>
          </div>
        </div>
        <div>
          <h2 className="text-xl font-semibold text-white">Links</h2>
          <div className="flex gap-2">
            <Link className="underline hover:no-underline" href="/links">
              My Links
            </Link>
            <a
              className="underline hover:no-underline"
              target="_blank"
              rel="noreferrer"
              href="https://github.com/AdamMYoung"
            >
              GitHub
            </a>
            <a
              className="underline hover:no-underline"
              target="_blank"
              rel="noreferrer"
              href="https://twitter.com/AdamMYoung_"
            >
              Twitter
            </a>
            <a
              className="underline hover:no-underline"
              target="_blank"
              rel="noreferrer"
              href="mailto:adam@adammyoung.com"
            >
              Email
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
