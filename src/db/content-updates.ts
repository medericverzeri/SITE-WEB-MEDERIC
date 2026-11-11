import { and, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { blocks, contentRevisions, pages, sites, type BlockData } from "@/db/schema";
import { DECHETLAB_BLOCK_PATCHES, DECHETLAB_EXTRA_BLOCKS } from "./dechetlab-content";
import { DECHETLAB_OPENING_HOURS, DECHETLAB_SCHEDULE, DECHETLAB_TOPICS } from "@/lib/dechetlab-info";
import { applyValodepotProcedureUpdate } from "./valodepot-update";

const revision = "encadrant:dechetlab-practical-information-v1";
const plain = (value: unknown): string => typeof value === "string" ? value : "";
const normalize = (value: unknown): string => plain(value).normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, " ").trim().toLowerCase();
const isRecord = (value: unknown): value is Record<string, unknown> => !!value && typeof value === "object" && !Array.isArray(value);

/** Remplace les sujets connus et garde les éventuels sujets ajoutés dans l'admin. */
function updateTopics(data: BlockData) {
  const previous = Array.isArray(data.topics) ? data.topics.filter(isRecord) : [];
  const newTopics = DECHETLAB_TOPICS.map((topic) => {
    const old = previous.find((entry) => entry.id === topic.id || normalize(entry.title) === normalize(topic.title));
    return { ...old, ...topic };
  });
  const extraTopics = previous.filter((old) => !DECHETLAB_TOPICS.some((topic) => old.id === topic.id || normalize(old.title) === normalize(topic.title)));
  return [...newTopics, ...extraTopics];
}

/**
 * Migration de contenu non destructive et transactionnelle.
 * L'historique empêche de réécrire les futurs changements effectués dans l'admin.
 */
export async function applyContentUpdates(): Promise<void> {
  const [site] = await db.select({ id: sites.id, marqueeText: sites.marqueeText }).from(sites).where(eq(sites.key, "encadrant")).limit(1);
  if (!site) return;

  await db.transaction(async (tx) => {
    const claimed = await tx.insert(contentRevisions).values({ key: revision }).onConflictDoNothing().returning({ key: contentRevisions.key });
    if (claimed.length === 0) return;

    const extraTicker = "ValoDépôt : déclaration avant tout passage · Menuiseries vitrées : validation sous 48 h et code de dépôt";
    const ticker = /valod[eé]p[oô]t/i.test(site.marqueeText) ? site.marqueeText : `${extraTicker} · ${site.marqueeText}`;
    await tx.update(sites).set({
      schedule: DECHETLAB_SCHEDULE,
      openingHours: DECHETLAB_OPENING_HOURS,
      marqueeText: ticker,
      updatedAt: new Date(),
    }).where(eq(sites.id, site.id));

    const contacts = await tx.select({ block: blocks }).from(blocks).innerJoin(pages, eq(blocks.pageId, pages.id))
      .where(and(eq(pages.siteId, site.id), eq(blocks.type, "contactHub")));
    for (const { block } of contacts) {
      await tx.update(blocks).set({ data: { ...block.data, topics: updateTopics(block.data) }, updatedAt: new Date() }).where(eq(blocks.id, block.id));
    }

    const [page] = await tx.select({ id: pages.id }).from(pages).where(and(eq(pages.siteId, site.id), eq(pages.slug, "dechet-lab"))).limit(1);
    if (!page) return;
    const current = await tx.select().from(blocks).where(eq(blocks.pageId, page.id));
    for (const block of current) {
      const patch = DECHETLAB_BLOCK_PATCHES[block.type];
      if (!patch) continue;
      await tx.update(blocks).set({ data: { ...block.data, ...patch }, updatedAt: new Date() }).where(eq(blocks.id, block.id));
    }

    const additions = DECHETLAB_EXTRA_BLOCKS.filter((addition) => !current.some((block) => block.type === addition.type && block.data.title === addition.data.title));
    if (additions.length > 0) {
      const before = current.find((block) => block.type === "faq");
      const position = before?.position ?? Math.max(-1, ...current.map((block) => block.position)) + 1;
      await tx.update(blocks).set({ position: sql`${blocks.position} + ${additions.length}` }).where(and(eq(blocks.pageId, page.id), sql`${blocks.position} >= ${position}`));
      await tx.insert(blocks).values(additions.map((addition, i) => ({ pageId: page.id, type: addition.type, data: addition.data, position: position + i, visible: true })));
    }
    await tx.update(pages).set({ updatedAt: new Date() }).where(eq(pages.id, page.id));
  });

  await applyValodepotProcedureUpdate();
}
