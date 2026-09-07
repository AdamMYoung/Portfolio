import { Head, Html, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en-GB">
      <Head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/api/icon" />
        <link rel="manifest" href="/manifest.webmanifest" />
        <meta name="theme-color" content="#f5f2ea" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="author" content="Adam M. Young" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
