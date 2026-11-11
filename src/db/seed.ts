import { eq } from "drizzle-orm";
import { db } from "@/db";
import { blocks, pages, sites } from "@/db/schema";
import { DEFAULT_SCHEDULE_AFTERNOON, normalizeSchedule } from "@/lib/hours";
import { DEFAULT_SITES, type SeedSite } from "./default-content";
import { applyContentUpdates } from "./content-updates";
import { applyMultipageUpdate } from "./multipage-update";
import { ensureDatabaseTables } from "./bootstrap";

let seedPromise: Promise<void> | null = null;

async function insertSite(site: SeedSite): Promise<void> {
  await db.transaction(async (tx) => {
  const inserted = await tx
    .insert(sites)
    .values({
      key: site.key,
      name: site.name,
      shortName: site.shortName,
      role: site.role,
      tagline: site.tagline,
      logoMark: site.logoMark,
      primaryColor: site.primaryColor,
      accentColor: site.accentColor,
      heroImageUrl: site.heroImageUrl,
      contactEmail: site.contactEmail,
      contactPhone: site.contactPhone,
      notificationEmail: site.notificationEmail ?? site.contactEmail,
      address: site.address,
      openingHours: site.openingHours,
      schedule: normalizeSchedule(site.schedule ?? DEFAULT_SCHEDULE_AFTERNOON),
      statusOverride: site.statusOverride ?? "auto",
      statusNoteOpen: site.statusNoteOpen ?? "",
      statusNoteClosed: site.statusNoteClosed ?? "",
      photoUrl: site.photoUrl ?? "",
      photoAlt: site.photoAlt ?? "",
      photoName: site.photoName ?? "",
      photoRole: site.photoRole ?? "",
      marqueeEnabled: site.marqueeEnabled ?? true,
      marqueeText: site.marqueeText ?? "",
      marqueeSpeed: site.marqueeSpeed ?? "normal",
      navLinks: site.navLinks ?? [],
      textureUrl: site.textureUrl ?? "",
      footerNote: site.footerNote,
      legalNote: site.legalNote,
      ctaLabel: site.ctaLabel,
      ctaHref: site.ctaHref,
      bannerEnabled: site.bannerEnabled,
      bannerText: site.bannerText,
      bannerHref: site.bannerHref,
      seoTitle: site.seoTitle,
      seoDescription: site.seoDescription,
    })
    .onConflictDoNothing({ target: sites.key })
    .returning({ id: sites.id });

  const siteRow = inserted[0];
  if (!siteRow) return;

  let pagePosition = 0;
  for (const page of site.pages) {
    const [pageRow] = await tx
      .insert(pages)
      .values({
        siteId: siteRow.id,
        slug: page.slug,
        title: page.title,
        navLabel: page.navLabel || page.title,
        seoTitle: page.seoTitle ?? "",
        seoDescription: page.seoDescription ?? "",
        isHome: page.isHome ?? false,
        inNav: page.inNav ?? true,
        position: pagePosition++,
        published: true,
      })
      .returning({ id: pages.id });

    if (!pageRow) continue;

    if (page.blocks.length > 0) {
      await tx.insert(blocks).values(
        page.blocks.map((block, index) => ({
          pageId: pageRow.id,
          type: block.type,
          position: index,
          visible: true,
          data: block.data,
        })),
      );
    }
  }
  });
}

/** Crée les sites manquants au premier chargement (idempotent). */
export async function ensureSeeded(): Promise<void> {
  if (!seedPromise) {
    seedPromise = (async () => {
      await ensureDatabaseTables();
      for (const site of DEFAULT_SITES) {
        await insertSite(site);
      }
      await applyContentUpdates();
      await applyMultipageUpdate();
    })().catch((error) => {
      seedPromise = null;
      throw error;
    });
  }
  return seedPromise;
}

/** Restaure les contenus d'origine d'un site (suppression puis recréation). */
export async function reseedSite(key: string): Promise<void> {
  const seed = DEFAULT_SITES.find((site) => site.key === key);
  if (!seed) return;
  await db.delete(sites).where(eq(sites.key, key));
  await insertSite(seed);
  seedPromise = Promise.resolve();
}
