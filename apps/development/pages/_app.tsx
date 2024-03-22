import { Jost } from "next/font/google";
import type { AppProps } from "next/app";

import "../styles/globals.css";
import { twMerge } from "tailwind-merge";
import { Analytics } from "@vercel/analytics/react";
import Script from "next/script";

const jost = Jost({ subsets: ["latin"], variable: "--font-jost" });

export default function App({ Component, pageProps }: AppProps) {
  return (
    <main className={twMerge(jost.className, "h-full min-h-screen bg-black text-white text-lg leading-8")}>
      <Component {...pageProps} />
      {process.env.NODE_ENV === "production" && (
        <>
          <Script src="https://www.googletagmanager.com/gtag/js?id=G-WGNHV27GTK" strategy="afterInteractive" />
          <Script id="google-analytics" strategy="afterInteractive">
            {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){window.dataLayer.push(arguments);}
          gtag('js', new Date());

          gtag('config', 'G-WGNHV27GTK');
        `}
          </Script>
        </>
      )}
      <Analytics />
    </main>
  );
}
