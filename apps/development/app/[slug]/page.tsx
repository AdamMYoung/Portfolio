import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DesktopPage } from "../panels";
import { ROUTES } from "../routes";

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
  return {
    title: route.title,
    description: route.description,
    alternates: { canonical: route.path },
    openGraph: { url: route.path, title: route.title, description: route.description },
  };
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  const route = ROUTES.find((r) => r.path === `/${slug}`);
  if (!route) notFound();
  return <DesktopPage defaultOpen={route.id} />;
}
