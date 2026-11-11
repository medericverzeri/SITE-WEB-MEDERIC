import type { Metadata } from "next";
import SitePageView, { pageHref } from "@/components/site/SitePageView";
import { getPageWithBlocks, getSiteBundle, PRIMARY_SITE_KEY } from "@/lib/data";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const bundle = await getSiteBundle(PRIMARY_SITE_KEY);
  if (!bundle) return {};
  return {
    title: bundle.site.seoTitle || bundle.site.name,
    description: bundle.site.seoDescription,
    openGraph: {
      title: bundle.site.seoTitle || bundle.site.name,
      description: bundle.site.seoDescription,
      type: "website",
      locale: "fr_FR",
      images: bundle.site.heroImageUrl ? [bundle.site.heroImageUrl] : undefined,
    },
  };
}

export default async function HomePage() {
  const bundle = await getSiteBundle(PRIMARY_SITE_KEY);
  if (!bundle || !bundle.home) notFound();

  const content = await getPageWithBlocks(bundle.site.id, bundle.home.slug);
  if (!content) notFound();

  return (
    <SitePageView
      site={bundle.site}
      pages={bundle.pages}
      page={content.page}
      blocks={content.blocks}
      basePath=""
      currentPath={pageHref("", content.page)}
    />
  );
}
