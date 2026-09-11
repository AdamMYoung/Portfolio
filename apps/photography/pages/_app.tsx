import type { AppProps } from "next/app";
import { Baskervville } from "next/font/google";
import Head from "next/head";
import { useRouter } from "next/router";

import "../styles/globals.css";

import { Analytics } from "@vercel/analytics/react";
import Script from "next/script";
import { twMerge } from "tailwind-merge";

import { CookieBanner } from "../src/components/consent";
import { Header } from "../src/components/header";

const baskerville = Baskervville({
  weight: ["400"],
  subsets: ["latin"],
  variable: "--font-baskerville",
});

export default function MyApp({ Component, pageProps }: AppProps) {
  const { pathname } = useRouter();
  const isGallery = pathname === "/gallery";
  // The landing is a full-bleed dark splash (see pages/index) — like the
  // gallery it floats a transparent header and owns its own layout.
  const isSplash = pathname === "/";

  return (
    <div
      className={twMerge(baskerville.variable, "font-sans", isGallery && "h-dvh overflow-hidden")}
    >
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        {/* Per-route, so Safari's toolbar doesn't tint cream over the dark splash. */}
        <meta name="theme-color" content={isSplash ? "#0d0b0a" : "#f5f2ea"} />
      </Head>
      <Header transparent={isGallery || isSplash} />
      <main className={isGallery ? "h-full" : isSplash ? "" : "mx-auto max-w-6xl px-6 pb-16 pt-24"}>
        <Component {...pageProps} />
      </main>
      <CookieBanner />

      {process.env.NODE_ENV === "production" && (
        <>
          <Script
            src="https://www.googletagmanager.com/gtag/js?id=G-7PBGQ73SD5"
            strategy="afterInteractive"
          />
          <Script id="google-analytics" strategy="afterInteractive">
            {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){window.dataLayer.push(arguments);}
          gtag('js', new Date());

          gtag('config', 'G-7PBGQ73SD5');
        `}
          </Script>
        </>
      )}
      <Analytics />
    </div>
  );
}
