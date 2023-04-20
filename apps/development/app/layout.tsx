import React from "react";
import Script from "next/script";
import { Jost } from "next/font/google";

import Link from "next/link";
import { twMerge } from "tailwind-merge";
import { ChevronRightSquare } from "lucide-react";

import "../styles/globals.css";

const jost = Jost({ subsets: ["latin"], variable: "--font-jost" });

type PageLayoutProps = {
  children: React.ReactNode;
};

export default async function PageLayout({ children }: PageLayoutProps) {
  return (
    <html lang="en-gb">
      <body className={twMerge("flex flex-col pt-16 font-sans", jost.variable)}>
        <div className="flex flex-col gap-12">
          <nav className="section-container grid grid-cols-[1.5fr_1fr] items-center justify-between gap-4 text-3xl lg:text-4xl">
            <ChevronRightSquare className="h-12 w-12" />
            <div className="flex gap-6">
              <Link href="/">About</Link>
              <Link className="text-gray-500" href="/blog">
                Blog
              </Link>
              <Link className="text-gray-500" href="/contact">
                Contact
              </Link>
            </div>
          </nav>
          <main>{children}</main>
        </div>
        <footer className="bg-gray-100 py-16">
          <div className="section-container">
            <Link href="/">Home</Link>
          </div>
        </footer>
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
