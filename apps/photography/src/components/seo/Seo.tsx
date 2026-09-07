import Head from "next/head";
import type { ReactNode } from "react";

import { absolute, DEFAULT_DESCRIPTION, SITE_NAME, SITE_URL, TWITTER } from "./site";

type SeoProps = {
  /** Full <title>, already including the site name. */
  title: string;
  description?: string;
  /** Route path, e.g. "/list". Drives canonical + og:url. */
  path: string;
  /** Absolute or site-relative image URL. Defaults to the generated OG card. */
  image?: string;
  /** og:type — "website" for landings, "profile" for the home page. */
  type?: "website" | "profile";
  noindex?: boolean;
  children?: ReactNode;
};

// One place that emits every head tag a shareable page needs, with the
// canonical / og:url / twitter fields guaranteed to agree.
export const Seo = ({
  title,
  description = DEFAULT_DESCRIPTION,
  path,
  image,
  type = "website",
  noindex = false,
  children,
}: SeoProps) => {
  const url = absolute(path);
  const ogImage = absolute(
    image ?? `/api/og?title=${encodeURIComponent(title.replace(` — ${SITE_NAME}`, ""))}`
  );

  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      {noindex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <meta name="robots" content="index, follow, max-image-preview:large" />
      )}

      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:locale" content="en_GB" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content={TWITTER} />
      <meta name="twitter:creator" content={TWITTER} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

      {children}
    </Head>
  );
};

export { SITE_URL };
