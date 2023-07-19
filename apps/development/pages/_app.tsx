import { Jost } from "next/font/google";
import type { AppProps } from "next/app";

import "../styles/globals.css";
import { twMerge } from "tailwind-merge";

const jost = Jost({ subsets: ["latin"], variable: "--font-jost" });

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <main className={twMerge(jost.className, "h-full min-h-screen bg-gray-950 text-white")}>
      <Component {...pageProps} />
    </main>
  );
}
