import { Jost } from "next/font/google";
import type { AppProps } from "next/app";

import "../styles/globals.css";
import { twMerge } from "tailwind-merge";

const jost = Jost({ subsets: ["latin"], variable: "--font-jost" });

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <div className={twMerge(jost.className, "h-full bg-gray-950 text-white")}>
      <div className="container mx-auto flex min-h-screen max-w-2xl flex-col gap-16 px-4 py-12 leading-8 text-gray-300 md:px-0">
        <nav>
          <span className="text-2xl">
            <span className="font-semibold">aydev</span>
            <span className="font-light">.uk</span>
          </span>
        </nav>

        <main className="grow">
          <Component {...pageProps} />
        </main>
        <div>
          <h2 className="text-xl font-semibold text-white">Links</h2>
          <div className="flex gap-2">
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
            <a className="underline hover:no-underline" target="_blank" rel="noreferrer" href="mailto:adam@aydev.uk">
              Email
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
