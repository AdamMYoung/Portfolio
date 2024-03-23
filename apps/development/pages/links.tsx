/* eslint-disable react/jsx-no-target-blank */

import React from "../src/svg/react.svg";
import Head from "next/head";
import Link from "next/link";

export default function Links() {
  return (
    <>
      <Head>
        <title>Adam Young | Links</title>
        <meta name="description" content="Development portfolio of Software Engineer, Adam Young" />
      </Head>
      <div className="container mx-auto flex max-w-2xl flex-col gap-16 px-4 py-12 text-gray-300 md:px-0">
        <nav>
          <span className="text-2xl font-semibold">Adam M. Young</span>
        </nav>

        <div className="flex flex-col gap-12">
          <div className="flex flex-col gap-4">
            <h1 className="text-3xl font-semibold text-white">My Links</h1>
            <div className="flex flex-wrap gap-x-4 gap-y-2 text-2xl font-semibold">
              <a className="underline hover:no-underline" href="https://twitter.com/AdamMYoung_" target="_blank">
                Twitter
              </a>
              <a className="underline hover:no-underline" href="https://www.instagram.com/adammyoung_/" target="_blank">
                Instagram
              </a>
              <a className="underline hover:no-underline" href="https://github.com/AdamMYoung" target="_blank">
                GitHub
              </a>
              <a className="underline hover:no-underline" href="mailto:adam@adammyoung.com" target="_blank">
                Email
              </a>
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <h2 className="text-3xl font-semibold text-white">Projects</h2>
            <div className="flex flex-wrap gap-x-4 gap-y-2 text-2xl font-semibold">
              <Link className="underline hover:no-underline" href="/">
                Software Development
              </Link>
              <a className="underline hover:no-underline" href="https://photography.adammyoung.com" target="_blank">
                Photography
              </a>
              <a className="underline hover:no-underline" href="https://trailwise.io" target="_blank">
                TrailWise
              </a>
              <a className="underline hover:no-underline" href="https://blurdle.adammyoung.com" target="_blank">
                Blurdle
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
