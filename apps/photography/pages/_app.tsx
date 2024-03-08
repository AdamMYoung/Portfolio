import { Baskervville } from "next/font/google";
import type { AppProps } from "next/app";

import "../styles/globals.css";
import { twMerge } from "tailwind-merge";
import {
  LayoutDesktop,
  LayoutDesktopSidebar,
  Link,
  LayoutDesktopTitle,
  LayoutDesktopHeading,
  LayoutDesktopSubheading,
  LayoutDesktopNavigation,
  IconList,
  LayoutDesktopBody,
  LayoutMobile,
  LayoutMobileNavigation,
  LayoutMobileTitle,
  LayoutMobileHeading,
  LayoutMobileSubheading,
  LayoutMobileDrawerButton,
  LayoutMobileDrawer,
  LayoutMobileDrawerItem,
  LayoutMobileBody,
} from "components";
import Script from "next/script";
import { FiInstagram, FiTwitter, FiMenu } from "react-icons/fi";

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
          <Link href="/">
            <LayoutDesktopTitle role="button">
              <LayoutDesktopHeading>Adam Young</LayoutDesktopHeading>
              <LayoutDesktopSubheading>Photography</LayoutDesktopSubheading>
            </LayoutDesktopTitle>
          </Link>
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
        <LayoutMobileNavigation className="bg-white">
          <LayoutMobileTitle role="button">
            <LayoutMobileHeading>Adam Young</LayoutMobileHeading>
            <LayoutMobileSubheading>Photography</LayoutMobileSubheading>
          </LayoutMobileTitle>
          <LayoutMobileDrawerButton aria-label="Open menu">
            <FiMenu className="h-8 w-8" />
          </LayoutMobileDrawerButton>
          <LayoutMobileDrawer className="bg-white">
            <LayoutMobileDrawerItem className="hover:bg-slate-100" href="/">
              Home
            </LayoutMobileDrawerItem>
            <LayoutMobileDrawerItem className="hover:bg-slate-100" href="/contact">
              Contact
            </LayoutMobileDrawerItem>
          </LayoutMobileDrawer>
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
    </div>
  );
}
