import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DesktopPage } from "../panels";
import { ROUTES } from "../routes";
import { SITE_NAME } from "../site";

// Unknown slugs 404 rather than rendering an empty desktop.
export const dynamicParams = false;

export function generateStaticParams() {
  return ROUTES.filter((r) => r.path !== "/").map((r) => ({ slug: r.path.slice(1) }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const route = ROUTES.find((r) => r.path === `/${slug}`);
  if (!route) return {};
  // A page's openGraph replaces the root one wholesale, file-based
  // opengraph-image included, so the card image and site fields are repeated.
  const social = { title: `${route.title} — Adam Young`, description: route.description };
  return {
    title: route.title,
    description: route.description,
    alternates: { canonical: route.path },
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      locale: "en_GB",
      url: route.path,
      images: [{ url: "/opengraph-image", width: 1200, height: 630 }],
      ...social,
    },
    twitter: { card: "summary_large_image", ...social },
    // The games are linkable but aren't content (see app/routes.ts): keep
    // them out of results, as they're already out of the sitemap.
    ...(route.index ? {} : { robots: { index: false, follow: true } }),
  };
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  const route = ROUTES.find((r) => r.path === `/${slug}`);
  if (!route) notFound();
  return <DesktopPage defaultOpen={route.id} />;
}
