import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { blocks, contentRevisions, pages, sites, type BlockData } from "@/db/schema";
import {
  DECHETLAB_FAQ,
  DECHETLAB_STEPS,
  DECHETLAB_TOPICS,
  VALODEPOT_PROCEDURE_SUMMARY,
  VALODEPOT_PROCEDURE_TEXT,
  VALODEPOT_PROCEDURE_TITLE,
} from "@/lib/dechetlab-info";

const revision = "encadrant:valodepot-procedure-and-ht-tariffs-v2";
const text = (value: unknown): string => typeof value === "string" ? value : "";
const fold = (value: unknown) => text(value).normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, " ").trim().toLowerCase();
const isRecord = (value: unknown): value is Record<string, unknown> => Boolean(value) && typeof value === "object" && !Array.isArray(value);
const records = (value: unknown): Record<string, unknown>[] => Array.isArray(value) ? value.filter(isRecord) : [];
const isWindow = (value: unknown) => /menuiserie.*vitre/.test(fold(value));
const isDib = (value: unknown) => /d\.?i\.?b\.?|tout[- ]venant/.test(fold(value));

/** Version unique : conserve les personnalisations qui ne concernent pas cette demande. */
export async function applyValodepotProcedureUpdate(): Promise<void> {
  const [site] = await db.select({ id: sites.id, marqueeText: sites.marqueeText }).from(sites).where(eq(sites.key, "encadrant")).limit(1);
  if (!site) return;

  await db.transaction(async (tx) => {
    const claimed = await tx.insert(contentRevisions).values({ key: revision }).onConflictDoNothing().returning({ key: contentRevisions.key });
    if (claimed.length === 0) return;

    const contacts = await tx.select({ block: blocks }).from(blocks).innerJoin(pages, eq(pages.id, blocks.pageId))
      .where(and(eq(pages.siteId, site.id), eq(blocks.type, "contactHub")));
    const touchedPages = new Set<number>();
    for (const { block } of contacts) {
      const topics = records(block.data.topics).map((topic) => {
        const source = DECHETLAB_TOPICS.find((item) => item.id === topic.id || fold(item.title) === fold(topic.title));
        if (source?.id === "depot" || source?.id === "dechets") {
          return { ...topic, noticeTitle: source.noticeTitle, notice: source.notice, noticeSteps: source.noticeSteps };
        }
        if (source?.id === "tarifs") {
          return {
            ...topic, body: source.body,
            price1Label: source.price1Label, price1: source.price1,
            price2Label: source.price2Label, price2: source.price2,
          };
        }
        return topic;
      });
      await tx.update(blocks).set({ data: { ...block.data, topics }, updatedAt: new Date() }).where(eq(blocks.id, block.id));
      touchedPages.add(block.pageId);
    }

    const [page] = await tx.select({ id: pages.id }).from(pages).where(and(eq(pages.siteId, site.id), eq(pages.slug, "dechet-lab"))).limit(1);
    if (page) {
      const current = await tx.select().from(blocks).where(eq(blocks.pageId, page.id));
      for (const block of current) {
        const data: BlockData = { ...block.data };
        if (block.type === "hero" && Array.isArray(data.badges)) {
          data.badges = data.badges.map((badge) => isWindow(badge) ? "Menuiseries vitrées : validation sous 48 h et code de dépôt" : badge);
        }
        if (block.type === "features") {
          data.items = records(data.items).map((item) => isWindow(item.title) ? { ...item, description: VALODEPOT_PROCEDURE_SUMMARY } : item);
        }
        if (block.type === "steps") {
          const description = DECHETLAB_STEPS.find((step) => isWindow(step.title))?.description || VALODEPOT_PROCEDURE_SUMMARY;
          data.items = records(data.items).map((item) => isWindow(item.title) ? { ...item, description } : item);
        }
        if (block.type === "faq") {
          data.items = records(data.items).map((item) => {
            if (isWindow(item.question)) return { ...item, answer: VALODEPOT_PROCEDURE_TEXT };
            if (/tarifs?/.test(fold(item.question))) return { ...item, answer: DECHETLAB_FAQ.find((entry) => /tarifs?/.test(fold(entry.question)))?.answer || item.answer };
            return item;
          });
        }
        if (block.type === "prose" && (isWindow(data.title) || data.title === VALODEPOT_PROCEDURE_TITLE)) {
          data.eyebrow = "Procédure ValoDépôt · depuis octobre 2026";
          data.title = VALODEPOT_PROCEDURE_TITLE;
          data.body = VALODEPOT_PROCEDURE_TEXT;
        }
        if (block.type === "offers") {
          let tariffs = false;
          data.items = records(data.items).map((item) => {
            if (isDib(item.title)) {
              tariffs = true;
              return { ...item, price: "0,32 € HT / kg", description: text(item.description).replace(/\bTTC\b/g, "HT") || "Tarif hors taxes par kilogramme." };
            }
            if (fold(item.title) === "bois") {
              tariffs = true;
              return { ...item, price: "0,10 € HT / kg", description: text(item.description).replace(/\bTTC\b/g, "HT") || "Tarif hors taxes par kilogramme." };
            }
            return item;
          });
          if (tariffs) data.eyebrow = "Tarifs HT au kilogramme";
        }
        if (JSON.stringify(data) !== JSON.stringify(block.data)) {
          await tx.update(blocks).set({ data, updatedAt: new Date() }).where(eq(blocks.id, block.id));
          touchedPages.add(block.pageId);
        }
      }
    }

    const marqueeText = site.marqueeText.replace(
      /Menuiseries vitrées\s*:\s*(?:validation préalable,|décision préalable,)\s*48\s*h\s*minimum/gi,
      "Menuiseries vitrées : validation sous 48 h et code de dépôt",
    );
    if (marqueeText !== site.marqueeText) await tx.update(sites).set({ marqueeText, updatedAt: new Date() }).where(eq(sites.id, site.id));
    for (const id of touchedPages) await tx.update(pages).set({ updatedAt: new Date() }).where(eq(pages.id, id));
  });
}
