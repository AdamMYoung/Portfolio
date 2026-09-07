import { motionHeadScript } from "@portfolio/crt/head";
import { Analytics } from "@vercel/analytics/next";
import type { Metadata, Viewport } from "next";
import { IBM_Plex_Mono, VT323 } from "next/font/google";
import type { ReactNode } from "react";
import "./globals.css";
import { JsonLd } from "./json-ld";
import { DESCRIPTION, SITE_NAME, SITE_URL } from "./site";

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-plex-mono",
  display: "swap",
});

const vt323 = VT323({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-vt323",
  display: "swap",
});

const TITLE = "Adam Young — Software Engineer";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: TITLE,
    template: "%s — Adam Young",
  },
  description: DESCRIPTION,
  applicationName: SITE_NAME,
  authors: [{ name: "Adam M. Young", url: SITE_URL }],
  creator: "Adam M. Young",
  publisher: "Adam M. Young",
  alternates: { canonical: "/" },
  formatDetection: { telephone: false, email: false, address: false },
  openGraph: {
    type: "website",
    url: SITE_URL,
    title: TITLE,
    description: DESCRIPTION,
    siteName: SITE_NAME,
    locale: "en_GB",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    creator: "@AdamMYoung_",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
};

export const viewport: Viewport = {
  themeColor: "#05010f",
  colorScheme: "dark",
  // The CRT handles its own scroll/pan internally — stop the page itself
  // from pinch-zooming or scrolling on touch devices.
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en-GB"
      className={`${plexMono.variable} ${vt323.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* Set data-motion before paint so the animated backdrop never flashes. */}
        {/* biome-ignore lint/security/noDangerouslySetInnerHtml: static, self-authored guard script */}
        <script dangerouslySetInnerHTML={{ __html: motionHeadScript }} />
        <JsonLd />
      </head>
      <body>
        <a href="#screen-content" className="skip-link">
          Skip to portfolio content
        </a>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
