import type { Metadata } from "next";
import { notFound } from "next/navigation";
import SitePageView, { pageHref } from "@/components/site/SitePageView";
import { getPageWithBlocks, getSiteBundle } from "@/lib/data";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ site: string; slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { site: siteKey, slug } = await params;
  const bundle = await getSiteBundle(siteKey);
  if (!bundle) return {};
  const content = await getPageWithBlocks(bundle.site.id, slug);
  if (!content) return { title: bundle.site.name };
  const title = content.page.seoTitle || `${content.page.title} — ${bundle.site.name}`;
  const description = content.page.seoDescription || bundle.site.seoDescription;
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      locale: "fr_FR",
      images: bundle.site.heroImageUrl ? [bundle.site.heroImageUrl] : undefined,
    },
  };
}

export default async function SiteSubPage({ params }: Props) {
  const { site: siteKey, slug } = await params;
  const bundle = await getSiteBundle(siteKey);
  if (!bundle) notFound();

  const content = await getPageWithBlocks(bundle.site.id, slug);
  if (!content) notFound();

  const basePath = `/${siteKey}`;

  return (
    <SitePageView
      site={bundle.site}
      pages={bundle.pages}
      page={content.page}
      blocks={content.blocks}
      basePath={basePath}
      currentPath={pageHref(basePath, content.page)}
    />
  );
}
