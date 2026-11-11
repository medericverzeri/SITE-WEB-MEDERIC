import type { SeedBlock, SeedPage, SeedSite } from "./default-content";
import { contactRoutingData, MAIN_NAVIGATION, MULTIPAGE_SECTIONS, polishPublicContent } from "@/lib/site-content";

/** Même contenu, mais une page par onglet ; aucun média n'est remplacé. */
export function makeMultipageSite(input: SeedSite): SeedSite {
  const site = polishPublicContent(structuredClone(input));
  const home = site.pages.find((page) => page.isHome);
  if (!home) return site;

  const sourceBlocks = [...home.blocks];
  home.blocks = sourceBlocks.filter((block) => block.type === "homeHero" || block.type === "hero");
  const usedTypes = new Set<string>(["homeHero", "hero"]);
  for (const section of MULTIPAGE_SECTIONS) {
    section.types.forEach((type) => usedTypes.add(type));
    const moved = sourceBlocks.filter((block) => section.types.includes(block.type));
    let target = site.pages.find((page) => page.slug === section.slug);
    if (!target) {
      target = {
        slug: section.slug,
        title: section.title,
        navLabel: section.title,
        inNav: true,
        seoTitle: `${section.title} — ${site.shortName || site.name}`,
        seoDescription: section.description,
        blocks: [],
      };
      site.pages.push(target);
    }
    target.inNav = true;
    if (section.slug === "contact") {
      if (!target.blocks.some((block) => block.type === "contactHub")) target.blocks.push(...moved);
    } else {
      target.blocks.push(...moved);
    }
  }
  const about = site.pages.find((page) => page.slug === "a-propos");
  about?.blocks.push(...sourceBlocks.filter((block) => !usedTypes.has(block.type)));

  for (const page of site.pages) {
    page.blocks = page.blocks.map((block): SeedBlock => block.type === "contactHub"
      ? { ...block, data: contactRoutingData(block.data, site.key, { email: site.contactEmail, phone: site.contactPhone }) }
      : block);
  }
  site.navLinks = site.navLinks?.length ? site.navLinks : MAIN_NAVIGATION.map((link) => ({ ...link }));
  const priority = [home.slug, "a-propos", "nos-entreprises", "galerie", "contact"];
  const order = (page: SeedPage) => priority.includes(page.slug) ? priority.indexOf(page.slug) : 10;
  site.pages.sort((a, b) => order(a) - order(b));
  return site;
}
