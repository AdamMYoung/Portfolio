import { motionHeadScript } from "@portfolio/crt/head";
import { Analytics } from "@vercel/analytics/next";
import type { Metadata, Viewport } from "next";
import { IBM_Plex_Mono, VT323 } from "next/font/google";
import type { ReactNode } from "react";
import "./globals.css";

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

const SITE = "https://development.adammyoung.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: {
    default: "Adam Young — Software Engineer",
    template: "%s — Adam Young",
  },
  description:
    "The development portfolio of Adam Young, Senior Software Engineer. An interactive CRT desktop: about, projects, contact — plus a couple of easter eggs.",
  openGraph: {
    type: "website",
    url: SITE,
    title: "Adam Young — Software Engineer",
    description: "An interactive CRT-desktop portfolio. Synthwave optional.",
    siteName: "Adam Young",
  },
  twitter: { card: "summary_large_image", creator: "@AdamMYoung_" },
  robots: { index: true, follow: true },
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
    <html lang="en" className={`${plexMono.variable} ${vt323.variable}`} suppressHydrationWarning>
      <head>
        {/* Set data-motion before paint so the animated backdrop never flashes. */}
        {/* biome-ignore lint/security/noDangerouslySetInnerHtml: static, self-authored guard script */}
        <script dangerouslySetInnerHTML={{ __html: motionHeadScript }} />
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
