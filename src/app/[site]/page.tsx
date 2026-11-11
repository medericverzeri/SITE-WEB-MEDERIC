import type { Metadata } from "next";
import { notFound } from "next/navigation";
import SitePageView, { pageHref } from "@/components/site/SitePageView";
import { getPageWithBlocks, getSiteBundle, PRIMARY_SITE_KEY } from "@/lib/data";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ site: string }> };

/**
 * Cette route gère deux cas :
 *  1. /developpement (ou /encadrant) → page d'accueil d'un site secondaire
 *  2. /contact, /parcours… → une page du site principal, servie à la racine
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { site: segment } = await params;
  const bundle = await getSiteBundle(segment);
  if (bundle) {
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
  const primary = await getSiteBundle(PRIMARY_SITE_KEY);
  if (!primary) return {};
  const content = await getPageWithBlocks(primary.site.id, segment);
  if (!content) return {};
  return {
    title: content.page.seoTitle || `${content.page.title} — ${primary.site.name}`,
    description: content.page.seoDescription || primary.site.seoDescription,
  };
}

export default async function SiteEntry({ params }: Props) {
  const { site: segment } = await params;

  const asSite = await getSiteBundle(segment);
  if (asSite?.home) {
    const content = await getPageWithBlocks(asSite.site.id, asSite.home.slug);
    if (!content) notFound();
    const basePath = `/${segment}`;
    return (
      <SitePageView
        site={asSite.site}
        pages={asSite.pages}
        page={content.page}
        blocks={content.blocks}
        basePath={basePath}
        currentPath={pageHref(basePath, content.page)}
      />
    );
  }

  const primary = await getSiteBundle(PRIMARY_SITE_KEY);
  if (!primary) notFound();
  const content = await getPageWithBlocks(primary.site.id, segment);
  if (!content) notFound();

  return (
    <SitePageView
      site={primary.site}
      pages={primary.pages}
      page={content.page}
      blocks={content.blocks}
      basePath=""
      currentPath={`/${segment}`}
    />
  );
}
