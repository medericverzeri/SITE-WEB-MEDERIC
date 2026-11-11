import { and, asc, desc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import {
  blocks,
  messages,
  pages,
  sites,
  type ContentBlock,
  type Page,
  type Site,
} from "@/db/schema";
import { ensureSeeded } from "@/db/seed";

export const PRIMARY_SITE_KEY = process.env.PRIMARY_SITE_KEY?.trim() || "encadrant";

export type SiteBundle = {
  site: Site;
  pages: Page[];
  nav: Page[];
  home: Page | undefined;
};

export async function listSites(): Promise<Site[]> {
  await ensureSeeded();
  return db.select().from(sites).orderBy(asc(sites.id));
}

export async function getSiteByKey(key: string): Promise<Site | null> {
  await ensureSeeded();
  const rows = await db.select().from(sites).where(eq(sites.key, key)).limit(1);
  return rows[0] ?? null;
}

export async function getPublishedPages(siteId: number): Promise<Page[]> {
  return db
    .select()
    .from(pages)
    .where(and(eq(pages.siteId, siteId), eq(pages.published, true)))
    .orderBy(asc(pages.position), asc(pages.id));
}

export async function getAllPages(siteId: number): Promise<Page[]> {
  return db
    .select()
    .from(pages)
    .where(eq(pages.siteId, siteId))
    .orderBy(asc(pages.position), asc(pages.id));
}

export async function getSiteBundle(key: string): Promise<SiteBundle | null> {
  const site = await getSiteByKey(key);
  if (!site) return null;
  const allPages = await getPublishedPages(site.id);
  return {
    site,
    pages: allPages,
    nav: allPages.filter((page) => page.inNav),
    home: allPages.find((page) => page.isHome) ?? allPages[0],
  };
}

export async function getPageWithBlocks(
  siteId: number,
  slug: string,
): Promise<{ page: Page; blocks: ContentBlock[] } | null> {
  const found = await db
    .select()
    .from(pages)
    .where(and(eq(pages.siteId, siteId), eq(pages.slug, slug), eq(pages.published, true)))
    .limit(1);
  const page = found[0];
  if (!page) return null;
  const rows = await db
    .select()
    .from(blocks)
    .where(and(eq(blocks.pageId, page.id), eq(blocks.visible, true)))
    .orderBy(asc(blocks.position), asc(blocks.id));
  return { page, blocks: rows };
}

export async function getPageById(pageId: number) {
  const found = await db.select().from(pages).where(eq(pages.id, pageId)).limit(1);
  return found[0] ?? null;
}

export async function getPageBlocks(pageId: number): Promise<ContentBlock[]> {
  return db
    .select()
    .from(blocks)
    .where(eq(blocks.pageId, pageId))
    .orderBy(asc(blocks.position), asc(blocks.id));
}

export async function getMessages(siteId?: number) {
  const base = db.select().from(messages);
  const query = siteId ? base.where(eq(messages.siteId, siteId)) : base;
  return query.orderBy(desc(messages.createdAt), desc(messages.id)).limit(300);
}

export async function getAdminOverview() {
  await ensureSeeded();
  const siteRows = await db.select().from(sites).orderBy(asc(sites.id));
  const pageCounts = await db
    .select({ siteId: pages.siteId, count: sql<number>`count(*)::int` })
    .from(pages)
    .groupBy(pages.siteId);
  const unreadCounts = await db
    .select({ siteId: messages.siteId, count: sql<number>`count(*)::int` })
    .from(messages)
    .where(eq(messages.isRead, false))
    .groupBy(messages.siteId);
  const totalMessages = await db.select({ count: sql<number>`count(*)::int` }).from(messages);
  const recent = await db
    .select()
    .from(messages)
    .orderBy(desc(messages.createdAt), desc(messages.id))
    .limit(6);

  return {
    sites: siteRows.map((site) => ({
      ...site,
      pageCount: pageCounts.find((row) => row.siteId === site.id)?.count ?? 0,
      unread: unreadCounts.find((row) => row.siteId === site.id)?.count ?? 0,
    })),
    totalMessages: totalMessages[0]?.count ?? 0,
    recent,
  };
}

export async function getSitemapEntries() {
  await ensureSeeded();
  const rows = await db
    .select({
      siteKey: sites.key,
      slug: pages.slug,
      isHome: pages.isHome,
      updatedAt: pages.updatedAt,
    })
    .from(pages)
    .innerJoin(sites, eq(pages.siteId, sites.id))
    .where(eq(pages.published, true));
  return rows;
}
