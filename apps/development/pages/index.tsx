/* eslint-disable react/jsx-no-target-blank */

import Image from "next/image";
import Head from "next/head";

import { IconLink } from "../src/components/icon-link";

import blurdle from "../src/images/blurdle.png";
import hike from "../src/images/hike.png";
import photography from "../src/images/photography.png";

import React from "../src/svg/react.svg";
import Checkout from "../src/svg/checkout.svg";
import Next from "../src/svg/next.svg";
import Link from "next/link";

export default function Home() {
  return (
    <>
      <Head>
        <title>Adam Young | Development</title>
        <meta name="description" content="Development portfolio of Software Engineer, Adam Young" />
      </Head>
      <div className="flex flex-col gap-12">
        <h1 className="text-2xl font-semibold text-white">Hi! I&apos;m Adam Young👋</h1>
        <p>
          I&apos;m a frontend developer, photographer, hiker, and occasional blogger. I currently work as a Software
          Engineer at{" "}
          <IconLink href="https://checkout.com" target="_blank" rel="noreferrer" icon={<Checkout />}>
            Checkout.com
          </IconLink>{" "}
          where I&apos;ve been building our marketing and documentation platforms in{" "}
          <IconLink href="https://nextjs.org/" target="_blank" rel="noreferrer" icon={<Next />}>
            Next.js
          </IconLink>
          , a powerful web-framework built with{" "}
          <IconLink href="https://react.dev/" target="_blank" rel="noreferrer" icon={<React />}>
            React
          </IconLink>
          .
        </p>

        <div className="flex flex-col gap-6">
          <h2 className="text-xl font-semibold text-white">Blog</h2>
          <div className="flex flex-col gap-12 leading-6">
            <Link legacyBehavior href="/blog/building-a-production-ready-app-on-the-cheap">
              <button className="flex w-full flex-col gap-1 rounded-lg bg-gray-800 p-4 transition-colors hover:bg-gray-700 focus:bg-gray-700 active:bg-gray-600 ">
                <h2 className="text-lg">Building a production-ready app on the cheap</h2>
                <p className="text-xs text-white/50">{new Date("2023/08/11").toLocaleDateString()}</p>
              </button>
            </Link>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <h2 className="text-xl font-semibold text-white">Projects</h2>
          <div className="flex flex-col gap-12 leading-6">
            <section className="flex flex-col gap-2">
              <Image
                alt="Screenshot of the hike.aydev.uk platform"
                src={hike}
                className="rounded-lg border border-gray-700"
                priority
                quality={50}
                placeholder="blur"
              />
              <div className="flex flex-col gap-3 p-2">
                <a
                  className="text-lg text-white underline hover:no-underline"
                  target="_blank"
                  href="https://hike.aydev.uk"
                >
                  hike.aydev.uk
                </a>
                <p>
                  Hike is a UK-based hiking and gear platform used to track fell completion across the Lake District and
                  Scotland. Features include Strava integration and tracking, interactive 3D maps, timeline playback,
                  and gear management and sharing.
                </p>
                <p>The site is built with Next.js Server Components, backed by Planetscale, Redis, and Vercel.</p>
              </div>
            </section>
            <section className="flex flex-col gap-2">
              <Image
                alt="Screenshot of the photography.aydev.uk site"
                src={photography}
                className="rounded-lg border border-gray-700"
                quality={50}
                priority
                placeholder="blur"
              />
              <div className="flex flex-col gap-3 p-2">
                <a
                  className="text-lg text-white underline hover:no-underline"
                  target="_blank"
                  href="https://photography.aydev.uk"
                >
                  photography.aydev.uk
                </a>
                <p>My personal photography site, serving images from an AWS S3 bucket and built on Next.js.</p>
              </div>
            </section>
            <section className="flex flex-col gap-2">
              <Image
                alt="Screenshot of the blurdle.aydev.uk site"
                src={blurdle}
                className="rounded-lg border border-gray-700"
                quality={50}
                placeholder="blur"
              />
              <div className="flex flex-col gap-3 p-2">
                <a
                  className="text-lg text-white underline hover:no-underline"
                  target="_blank"
                  href="https://blurdle.aydev.uk"
                >
                  blurdle.aydev.uk
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
      </div>
    </>
  );
}
