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
  LayoutMobileBody,
} from "components";
import { FiInstagram, FiTwitter } from "react-icons/fi";

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
        <LayoutMobileNavigation className="items-center bg-white">
          <LayoutMobileTitle>
            <LayoutMobileHeading>Adam Young</LayoutMobileHeading>
            <LayoutMobileSubheading>Photography</LayoutMobileSubheading>
          </LayoutMobileTitle>
          <IconList>
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
    </div>
  );
}
