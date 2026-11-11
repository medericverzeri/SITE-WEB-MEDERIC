import { and, asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { blocks, contentRevisions, pages, sites } from "@/db/schema";
import {
  contactRoutingData, MAIN_NAVIGATION, MULTIPAGE_SECTIONS, polishPublicContent,
} from "@/lib/site-content";

/**
 * Déplace les blocs existants au lieu de les recréer.
 * Les anciens doublons de contact sont conservés masqués, sans perte de données.
 */
export async function applyMultipageUpdate(): Promise<void> {
  const allSites = await db.select().from(sites).orderBy(asc(sites.id));
  for (const site of allSites) {
    await db.transaction(async (tx) => {
      const claimed = await tx.insert(contentRevisions)
        .values({ key: `${site.key}:multipage-contact-routing-proofreading-v3` })
        .onConflictDoNothing().returning({ key: contentRevisions.key });
      if (claimed.length === 0) return;

      const allPages = await tx.select().from(pages).where(eq(pages.siteId, site.id)).orderBy(asc(pages.position), asc(pages.id));
      const home = allPages.find((page) => page.isHome);
      if (!home) return;
      let maxPagePosition = Math.max(0, ...allPages.map((page) => page.position));
      const destinations = new Map<string, number>();
      for (const section of MULTIPAGE_SECTIONS) {
        let target = allPages.find((page) => page.slug === section.slug);
        if (!target) {
          const created = await tx.insert(pages).values({
            siteId: site.id, slug: section.slug, title: section.title, navLabel: section.title,
            seoTitle: `${section.title} — ${site.shortName || site.name}`,
            seoDescription: section.description, isHome: false, inNav: true,
            published: true, position: ++maxPagePosition,
          }).returning();
          target = created[0];
          if (target) allPages.push(target);
        }
        if (!target) continue;
        destinations.set(section.slug, target.id);
        await tx.update(pages).set({ inNav: true, published: true, updatedAt: new Date() }).where(eq(pages.id, target.id));
      }

      const homeBlocks = await tx.select().from(blocks).where(eq(blocks.pageId, home.id)).orderBy(asc(blocks.position), asc(blocks.id));
      const nextPositions = new Map<number, number>();
      for (const id of destinations.values()) {
        const existing = await tx.select({ position: blocks.position }).from(blocks).where(eq(blocks.pageId, id));
        nextPositions.set(id, Math.max(-1, ...existing.map((block) => block.position)) + 1);
      }
      const contactId = destinations.get("contact");
      const existingContact = contactId
        ? await tx.select({ id: blocks.id }).from(blocks).where(and(eq(blocks.pageId, contactId), eq(blocks.type, "contactHub"), eq(blocks.visible, true)))
        : [];

      for (const block of homeBlocks) {
        if (block.type === "homeHero" || block.type === "hero") continue;
        const section = MULTIPAGE_SECTIONS.find((entry) => entry.types.includes(block.type));
        const targetId = destinations.get(section?.slug || "a-propos");
        if (!targetId) continue;
        const position = nextPositions.get(targetId) ?? 0;
        nextPositions.set(targetId, position + 1);
        await tx.update(blocks).set({
          pageId: targetId, position,
          visible: block.type === "contactHub" && existingContact.length > 0 ? false : block.visible,
          updatedAt: new Date(),
        }).where(eq(blocks.id, block.id));
      }

      const storedBlocks = await tx.select({ block: blocks }).from(blocks).innerJoin(pages, eq(blocks.pageId, pages.id)).where(eq(pages.siteId, site.id));
      for (const { block } of storedBlocks) {
        let data = polishPublicContent(block.data);
        if (block.type === "contactHub") data = contactRoutingData(data, site.key, { email: site.contactEmail, phone: site.contactPhone });
        if (JSON.stringify(data) !== JSON.stringify(block.data)) {
          await tx.update(blocks).set({ data, updatedAt: new Date() }).where(eq(blocks.id, block.id));
        }
      }

      const priority = [home.slug, "a-propos", "nos-entreprises", "galerie", "contact"];
      allPages.sort((a, b) => {
        const aIndex = priority.indexOf(a.slug), bIndex = priority.indexOf(b.slug);
        return (aIndex < 0 ? 20 : aIndex) - (bIndex < 0 ? 20 : bIndex) || a.position - b.position;
      });
      for (const [position, page] of allPages.entries()) {
        const corrected = polishPublicContent(page);
        await tx.update(pages).set({
          title: page.slug === "contact" ? "Contactez-nous" : corrected.title,
          navLabel: page.slug === "contact" ? "Contactez-nous" : corrected.navLabel,
          seoTitle: corrected.seoTitle, seoDescription: corrected.seoDescription,
          position, updatedAt: new Date(),
        }).where(eq(pages.id, page.id));
      }
      const correctedSite = polishPublicContent(site);
      await tx.update(sites).set({
        name: correctedSite.name, shortName: correctedSite.shortName, role: correctedSite.role,
        tagline: correctedSite.tagline, openingHours: correctedSite.openingHours,
        schedule: correctedSite.schedule, marqueeText: correctedSite.marqueeText,
        statusNoteOpen: correctedSite.statusNoteOpen, statusNoteClosed: correctedSite.statusNoteClosed,
        photoName: correctedSite.photoName, photoRole: correctedSite.photoRole, photoAlt: correctedSite.photoAlt,
        footerNote: correctedSite.footerNote, legalNote: correctedSite.legalNote,
        ctaLabel: correctedSite.ctaLabel, ctaHref: correctedSite.ctaHref,
        bannerText: correctedSite.bannerText, bannerHref: correctedSite.bannerHref,
        seoTitle: correctedSite.seoTitle, seoDescription: correctedSite.seoDescription,
        navLinks: correctedSite.navLinks.length ? correctedSite.navLinks : MAIN_NAVIGATION.map((link) => ({ ...link })),
        updatedAt: new Date(),
      }).where(eq(sites.id, site.id));
    });
  }
}
