import type { AppProps } from "next/app";
import { Baskervville } from "next/font/google";
import { useRouter } from "next/router";

import "../styles/globals.css";

import { Analytics } from "@vercel/analytics/react";
import Script from "next/script";
import { twMerge } from "tailwind-merge";

import { Header } from "../src/components/header";

const baskerville = Baskervville({
  weight: ["400"],
  subsets: ["latin"],
  variable: "--font-baskerville",
});

export default function MyApp({ Component, pageProps }: AppProps) {
  const { pathname } = useRouter();
  const isGallery = pathname === "/gallery";

  return (
    <div
      className={twMerge(baskerville.variable, "font-sans", isGallery && "h-dvh overflow-hidden")}
    >
      <Header transparent={isGallery} />
      <main className={isGallery ? "h-full" : "mx-auto max-w-6xl px-6 pb-16 pt-24"}>
        <Component {...pageProps} />
      </main>

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
