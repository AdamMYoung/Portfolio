import { Jost } from "next/font/google";
import type { AppProps } from "next/app";

import "../styles/globals.css";
import { twMerge } from "tailwind-merge";

const jost = Jost({ subsets: ["latin"], variable: "--font-jost" });

export default function App({ Component, pageProps }: AppProps) {
  return (
    <main className={twMerge(jost.className, "h-full min-h-screen bg-black text-white text-lg leading-8")}>
      {/* @ts-ignore */}
      <Component {...pageProps} />
    </main>
  );
}
