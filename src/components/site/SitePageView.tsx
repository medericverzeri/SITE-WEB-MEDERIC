import type { ContentBlock, Page, Site } from "@/db/schema";
import { themeStyle } from "@/lib/theme";
import { sectionPageLink } from "@/lib/site-content";
import SiteHeader, { type NavItem } from "./SiteHeader";
import SiteFooter from "./SiteFooter";
import { BlockList } from "./Blocks";
import HoursTicker from "./HoursTicker";
import { getPageWithBlocks } from "@/lib/data";

export function pageHref(basePath: string, page: { slug: string; isHome: boolean }): string {
  if (page.isHome) return basePath || "/";
  return `${basePath}/${page.slug}`;
}

type Props = {
  site: Site;
  pages: Page[];
  page: Page;
  blocks: ContentBlock[];
  basePath: string;
  currentPath: string;
};

export default async function SitePageView({
  site,
  pages,
  page,
  blocks,
  basePath,
  currentPath,
}: Props) {
  const homeHref = basePath || "/";
  const contactPage = pages.find((entry) => entry.slug === "contact");
  const homeContactBlocks = page.isHome && !blocks.some((block) => block.type === "contactHub")
    ? (await getPageWithBlocks(site.id, contactPage?.slug ?? "contact"))?.blocks.filter((block) => block.type === "contactHub") ?? []
    : [];
  const displayedBlocks = [...blocks, ...homeContactBlocks];
  const contactHref = contactPage ? pageHref(basePath, contactPage) : `${basePath}/contact`;

  // "!/" = lien absolu depuis la racine (pour passer d'un site à l'autre)
  const link = (href: string): string => {
    const raw = (href ?? "").trim();
    if (!raw) return contactHref;
    if (raw.startsWith("!/")) return sectionPageLink(raw.slice(1));
    const value = sectionPageLink(raw);
    if (/^(https?:|mailto:|tel:|#)/i.test(value)) return value;
    if (!value.startsWith("/")) return `${basePath}/${value}`;
    if (!basePath) return value;
    if (value === basePath || value.startsWith(`${basePath}/`)) return value;
    return `${basePath}${value === "/" ? "" : value}`;
  };

  const nav: NavItem[] =
    site.navLinks.length > 0
      ? site.navLinks.map((entry) => ({ label: entry.label, href: link(entry.href) }))
      : pages
          .filter((entry) => entry.inNav)
          .map((entry) => ({
            label: entry.navLabel || entry.title,
            href: pageHref(basePath, entry),
          }));

  const activities: NavItem[] = pages
    .filter((entry) => entry.inNav && !entry.isHome && entry.slug !== "contact" && !nav.some((item) => item.href === pageHref(basePath, entry)))
    .map((entry) => ({ label: entry.navLabel || entry.title, href: pageHref(basePath, entry) }));
  const legalPage = pages.find((entry) => entry.slug === "mentions-legales");
  const legal: NavItem | null = legalPage
    ? { label: legalPage.navLabel || legalPage.title, href: pageHref(basePath, legalPage) }
    : null;

  const bannerLink = site.bannerEnabled && site.bannerText
    ? { text: site.bannerText, href: site.bannerHref ? link(site.bannerHref) : "" }
    : null;

  return (
    <div className="site" style={themeStyle(site)}>
      {site.textureUrl ? (
        <div
          className="page-texture"
          style={{ backgroundImage: `url(${site.textureUrl})` }}
          aria-hidden="true"
        />
      ) : null}
      <a href="#contenu" className="skip-link">
        Aller au contenu principal
      </a>
      <SiteHeader
        siteName={site.name}
        role={site.role}
        logoMark={site.logoMark}
        homeHref={homeHref}
        nav={nav}
        ctaLabel={site.ctaLabel || "Contact"}
        ctaHref={link(site.ctaHref || "/contact")}
        banner={bannerLink}
        currentPath={currentPath}
      />
      <HoursTicker site={site} ctaHref={link(site.ctaHref || "/contact")} />
      <main id="contenu">
        <BlockList blocks={displayedBlocks} link={link} site={site} pageSlug={page.slug} />
      </main>
      <SiteFooter
        site={site}
        nav={nav}
        activities={activities}
        legal={legal}
        homeHref={homeHref}
        contactHref={contactHref}
      />
    </div>
  );
}
