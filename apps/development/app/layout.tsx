/* eslint-disable @next/next/no-before-interactive-script-outside-document */
import React from "react";
import Script from "next/script";

import "../styles/globals.css";
import Link from "next/link";

type PageLayoutProps = {
  children: React.ReactNode;
};

export default async function PageLayout({ children }: PageLayoutProps) {
  return (
    <html lang="en-gb">
      <body className="py-16 flex flex-col gap-12">
        <nav className="grid grid-cols-[1.5fr_1fr] gap-4 justify-between text-3xl md:text-4xl section-container">
          <div>Some Logo</div>

          <div className="flex gap-6 ">
            <Link href="/">About</Link>
            <Link href="/blog">Blog</Link>
            <Link href="/contact">Contact</Link>
          </div>
        </nav>
        <main>{children}</main>
      </body>
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
    </html>
  );
}
