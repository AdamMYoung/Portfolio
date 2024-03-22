import { Baskervville } from "next/font/google";
import type { AppProps } from "next/app";

import "../styles/globals.css";

import { twMerge } from "tailwind-merge";

import { FiInstagram, FiTwitter } from "react-icons/fi";

import { IconList } from "../src/components/icon-list";
import {
  LayoutDesktop,
  LayoutDesktopSidebar,
  LayoutDesktopTitle,
  LayoutDesktopHeading,
  LayoutDesktopSubheading,
  LayoutDesktopNavigation,
  LayoutDesktopBody,
} from "../src/components/layout-desktop";
import {
  LayoutMobile,
  LayoutMobileNavigation,
  LayoutMobileTitle,
  LayoutMobileHeading,
  LayoutMobileSubheading,
  LayoutMobileBody,
} from "../src/components/layout-mobile";
import { Link } from "../src/components/link";
import { Analytics } from "@vercel/analytics/react";
import Script from "next/script";

const baskerville = Baskervville({
  weight: ["400"],
  subsets: ["latin"],
  variable: "--font-baskerville",
});

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <div className={twMerge(`${baskerville.variable} font-sans`)}>
      <LayoutDesktop>
        <LayoutDesktopSidebar>
          <LayoutDesktopTitle>
            <LayoutDesktopHeading>Adam Young</LayoutDesktopHeading>
            <LayoutDesktopSubheading>Photography</LayoutDesktopSubheading>
          </LayoutDesktopTitle>
          <LayoutDesktopNavigation>
            <IconList>
              <Link
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                href="https://www.instagram.com/adammyoung_/"
              >
                <FiInstagram />
              </Link>
              <Link target="_blank" rel="noreferrer" aria-label="Twitter" href="https://twitter.com/AdamMYoung_">
                <FiTwitter />
              </Link>
            </IconList>
          </LayoutDesktopNavigation>
        </LayoutDesktopSidebar>
        <LayoutDesktopBody>
          <Component {...pageProps} />
        </LayoutDesktopBody>
      </LayoutDesktop>
      <LayoutMobile>
        <LayoutMobileNavigation className="items-center bg-white">
          <LayoutMobileTitle>
            <LayoutMobileHeading>Adam Young</LayoutMobileHeading>
            <LayoutMobileSubheading>Photography</LayoutMobileSubheading>
          </LayoutMobileTitle>
          <IconList className="px-2">
            <Link target="_blank" rel="noreferrer" aria-label="Instagram" href="https://www.instagram.com/adammyoung_/">
              <FiInstagram className="h-6 w-6" />
            </Link>
            <Link target="_blank" rel="noreferrer" aria-label="Twitter" href="https://twitter.com/AdamMYoung_">
              <FiTwitter className="h-6 w-6" />
            </Link>
          </IconList>
        </LayoutMobileNavigation>
        <LayoutMobileBody>
          <Component {...pageProps} />
        </LayoutMobileBody>
      </LayoutMobile>
      {process.env.NODE_ENV === "production" && (
        <>
          <Script src="https://www.googletagmanager.com/gtag/js?id=G-7PBGQ73SD5" strategy="afterInteractive" />
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
