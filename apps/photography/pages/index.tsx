import Head from "next/head";

import { Link } from "../src/components/link";

export default function Home() {
  return (
    <>
      <Head>
        <title>Adam Young | Photography</title>
        <meta name="description" content="Photography portfolio of Photographer, Adam Young" />
      </Head>

      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-6 p-6 text-center">
        <h1 className="text-4xl font-bold tracking-tight">Adam Young</h1>
        <p className="text-lg font-light">How would you like to look around?</p>
        <div className="flex w-full max-w-md flex-col gap-4 sm:flex-row">
          <Link
            href="/gallery"
            className="flex flex-1 flex-col gap-1 rounded-lg border-2 border-black px-6 py-8 hover:bg-black hover:text-white"
          >
            <span className="text-2xl font-bold">Art Gallery</span>
            <span className="text-sm font-light">Walk through a 3D gallery</span>
          </Link>
          <Link
            href="/list"
            className="flex flex-1 flex-col gap-1 rounded-lg border-2 border-black px-6 py-8 hover:bg-black hover:text-white"
          >
            <span className="text-2xl font-bold">Easy List</span>
            <span className="text-sm font-light">Browse a simple image grid</span>
          </Link>
        </div>
      </div>
    </>
  );
}
