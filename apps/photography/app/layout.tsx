/* eslint-disable @next/next/no-before-interactive-script-outside-document */
import React from "react";
import { Baskervville } from "next/font/google";
import { FiMenu, FiInstagram, FiTwitter } from "react-icons/fi";
import Script from "next/script";

import "../styles/globals.css";

import {
  LayoutMobile,
  LayoutMobileBody,
  LayoutMobileDrawer,
  LayoutMobileDrawerButton,
  LayoutMobileDrawerItem,
  LayoutMobileNavigation,
  LayoutMobileTitle,
  LayoutMobileHeading,
  LayoutMobileSubheading,
  LayoutDesktop,
  LayoutDesktopBody,
  LayoutDesktopNavigation,
  LayoutDesktopSidebar,
  LayoutDesktopHeading,
  LayoutDesktopSubheading,
  LayoutDesktopTitle,
  Link,
  IconList,
} from "./client-components";

const baskerville = Baskervville({
  weight: ["400"],
  subsets: ["latin"],
  variable: "--font-baskerville",
});

type PageLayoutProps = {
  children: React.ReactNode;
};

export default async function PageLayout({ children }: PageLayoutProps) {
  return (
    <html lang="en-gb">
      <body className={`${baskerville.variable} font-sans`}>
        <LayoutDesktop>
          <LayoutDesktopSidebar>
            <Link href="/">
              <LayoutDesktopTitle role="button">
                <LayoutDesktopHeading>Adam Young</LayoutDesktopHeading>
                <LayoutDesktopSubheading>Photography</LayoutDesktopSubheading>
              </LayoutDesktopTitle>
            </Link>
            <LayoutDesktopNavigation>
              <Link href="/contact">Contact</Link>
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
          <LayoutDesktopBody>{children}</LayoutDesktopBody>
        </LayoutDesktop>
        <LayoutMobile>
          <LayoutMobileNavigation className="bg-white">
            <Link href="/">
              <LayoutMobileTitle role="button">
                <LayoutMobileHeading>Adam Young</LayoutMobileHeading>
                <LayoutMobileSubheading>Photography</LayoutMobileSubheading>
              </LayoutMobileTitle>
            </Link>
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
          <LayoutMobileBody>{children}</LayoutMobileBody>
        </LayoutMobile>
      </body>
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
    </html>
  );
}
