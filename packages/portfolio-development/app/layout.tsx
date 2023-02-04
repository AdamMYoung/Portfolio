/* eslint-disable @next/next/no-before-interactive-script-outside-document */
import React from "react";
import { Roboto_Mono } from "@next/font/google";
import { FiMenu, FiGithub, FiTwitter } from "react-icons/fi";
import Script from "next/script";

import "../styles/globals.css";

import {
  LayoutDesktop,
  LayoutDesktopBody,
  LayoutDesktopNavigation,
  LayoutDesktopSidebar,
  LayoutDesktopHeading,
  LayoutDesktopSubheading,
  LayoutDesktopTitle,
  Link,
  IconList,
  LayoutMobile,
  LayoutMobileBody,
  LayoutMobileDrawer,
  LayoutMobileDrawerButton,
  LayoutMobileDrawerItem,
  LayoutMobileNavigation,
  LayoutMobileTitle,
  LayoutMobileHeading,
  LayoutMobileSubheading,
} from "./client-components";

const robotoMono = Roboto_Mono({
  weight: ["300", "400", "700"],
  subsets: ["latin"],
  variable: "--font-roboto-mono",
});

type PageLayoutProps = {
  children: React.ReactNode;
};

export default async function PageLayout({ children }: PageLayoutProps) {
  return (
    <html lang="en-gb">
      <body className={`${robotoMono.variable} bg-gray-900 font-sans  text-white`}>
        <LayoutDesktop>
          <LayoutDesktopSidebar>
            <Link href="/">
              <LayoutDesktopTitle role="button">
                <LayoutDesktopHeading>Adam Young</LayoutDesktopHeading>
                <LayoutDesktopSubheading>Development</LayoutDesktopSubheading>
              </LayoutDesktopTitle>
            </Link>
            <LayoutDesktopNavigation>
              {/* <Link className="hover:underline" href="/history">
                History
              </Link> */}
              <Link href="/projects">Projects</Link>
              <Link href="/contact">Contact</Link>
              <IconList>
                <Link type="external" href="https://github.com/AdamMYoung">
                  <FiGithub />
                </Link>
                <Link type="external" href="https://twitter.com/AdamMYoung_">
                  <FiTwitter />
                </Link>
              </IconList>
            </LayoutDesktopNavigation>
          </LayoutDesktopSidebar>
          <LayoutDesktopBody className="mx-auto mb-4 flex w-full pr-8">
            <div className="mx-auto max-w-4xl md:pt-12">{children}</div>
          </LayoutDesktopBody>
        </LayoutDesktop>
        <LayoutMobile>
          <LayoutMobileNavigation className="bg-gray-900">
            <Link href="/">
              <LayoutMobileTitle role="button">
                <LayoutMobileHeading>Adam Young</LayoutMobileHeading>
                <LayoutMobileSubheading>Development</LayoutMobileSubheading>
              </LayoutMobileTitle>
            </Link>
            <LayoutMobileDrawerButton aria-label="Open menu">
              <FiMenu className="h-8 w-8" />
            </LayoutMobileDrawerButton>
            <LayoutMobileDrawer className=" bg-gray-900">
              <LayoutMobileDrawerItem className="py-2 hover:bg-gray-700" href="/">
                Home
              </LayoutMobileDrawerItem>
              {/* <LayoutMobileDrawerItem className="py-2 px-4 hover:bg-gray-700" href="/history">
                History
              </LayoutMobileDrawerItem> */}
              <LayoutMobileDrawerItem className="py-2 hover:bg-gray-700" href="/projects">
                Projects
              </LayoutMobileDrawerItem>
              <LayoutMobileDrawerItem className="py-2 hover:bg-gray-700" href="/contact">
                Contact
              </LayoutMobileDrawerItem>
              <LayoutMobileDrawerItem
                className="flex items-center gap-2 py-2 hover:bg-gray-700"
                target="_blank"
                rel="noreferrer"
                href="https://github.com/AdamMYoung"
              >
                <FiGithub /> GitHub
              </LayoutMobileDrawerItem>
              <LayoutMobileDrawerItem
                className="flex items-center gap-2 py-2 hover:bg-gray-700"
                target="_blank"
                rel="noreferrer"
                href="https://twitter.com/AdamMYoung_"
              >
                <FiTwitter /> Twitter
              </LayoutMobileDrawerItem>
            </LayoutMobileDrawer>
          </LayoutMobileNavigation>
          <LayoutMobileBody className="p-8">{children}</LayoutMobileBody>
        </LayoutMobile>
      </body>
      {process.env.NODE_ENV === "production" && (
        <>
          <Script src="https://www.googletagmanager.com/gtag/js?id=G-WGNHV27GTK" strategy="beforeInteractive" />
          <Script id="google-analytics" strategy="beforeInteractive">
            {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){window.dataLayer.push(arguments);}
          gtag('js', new Date());

          gtag('config', 'G-WGNHV27GTK');
        `}
          </Script>
        </>
      )}
    </html>
  );
}
