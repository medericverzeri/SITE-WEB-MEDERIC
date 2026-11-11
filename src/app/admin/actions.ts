"use server";

import { and, eq, gt, lt, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { blocks, messages, pages, sites } from "@/db/schema";
import { reseedSite } from "@/db/seed";
import { checkPassword, endAdminSession, isAdmin, startAdminSession } from "@/lib/auth";
import { BLOCK_DEFS, blockDef, listsOf, type BlockDef, type FieldDef } from "@/lib/blocks";
import { normalizeSchedule } from "@/lib/hours";
import { normalizeHex } from "@/lib/theme";

export type ActionResult = { ok: boolean; message: string };

async function requireAdmin(): Promise<void> {
  if (!(await isAdmin())) redirect("/admin/login");
}

function refreshAdmin(siteKey?: string): void {
  revalidatePath("/admin");
  revalidatePath("/admin/messages");
  revalidatePath("/admin/aide");
  if (siteKey) {
    revalidatePath(`/admin/site/${siteKey}`);
    revalidatePath(`/admin/site/${siteKey}/pages`);
  }
  revalidatePath("/", "layout");
}

const getString = (value: unknown, fallback = ""): string =>
  typeof value === "string" ? value : fallback;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

function safeJson(raw: string): Record<string, unknown> {
  try {
    const parsed: unknown = JSON.parse(raw);
    return isRecord(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

/* ------------------------------------------------------------------ */
/* Authentification                                                   */
/* ------------------------------------------------------------------ */

export async function loginAction(formData: FormData): Promise<void> {
  const candidate = getString(formData.get("password"));
  if (!checkPassword(candidate)) {
    redirect("/admin/login?error=1");
  }
  await startAdminSession();
  redirect("/admin");
}

export async function logoutAction(): Promise<void> {
  await endAdminSession();
  redirect("/admin/login");
}

/* ------------------------------------------------------------------ */
/* Réglages du site                                                   */
/* ------------------------------------------------------------------ */

const SITE_TEXT_FIELDS = [
  "name",
  "shortName",
  "role",
  "tagline",
  "logoMark",
  "heroImageUrl",
  "contactEmail",
  "contactPhone",
  "notificationEmail",
  "address",
  "openingHours",
  "statusNoteOpen",
  "statusNoteClosed",
  "photoUrl",
  "photoAlt",
  "photoName",
  "photoRole",
  "marqueeText",
  "marqueeSpeed",
  "textureUrl",
  "footerNote",
  "legalNote",
  "ctaLabel",
  "ctaHref",
  "bannerText",
  "bannerHref",
  "seoTitle",
  "seoDescription",
] as const;

export async function saveSiteSettingsAction(
  siteId: number,
  payload: string,
): Promise<ActionResult> {
  await requireAdmin();
  const data = safeJson(payload);

  const update: Record<string, unknown> = { updatedAt: new Date() };
  for (const field of SITE_TEXT_FIELDS) {
    if (field in data) update[field] = getString(data[field]).slice(0, 4000);
  }
  if ("primaryColor" in data) {
    update.primaryColor = normalizeHex(getString(data.primaryColor), "#0f766e");
  }
  if ("accentColor" in data) {
    update.accentColor = normalizeHex(getString(data.accentColor), "#f59e0b");
  }
  if ("bannerEnabled" in data) {
    update.bannerEnabled = data.bannerEnabled === true || data.bannerEnabled === "true";
  }
  if ("marqueeEnabled" in data) {
    update.marqueeEnabled = data.marqueeEnabled === true || data.marqueeEnabled === "true";
  }
  if ("marqueeSpeed" in data) {
    const speed = getString(data.marqueeSpeed);
    update.marqueeSpeed = ["slow", "normal", "fast"].includes(speed) ? speed : "normal";
  }
  if ("statusOverride" in data) {
    const value = getString(data.statusOverride);
    update.statusOverride = ["auto", "open", "closed"].includes(value) ? value : "auto";
  }
  if ("schedule" in data) {
    update.schedule = normalizeSchedule(data.schedule);
  }
  if ("navLinksText" in data) {
    update.navLinks = getString(data.navLinksText)
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .slice(0, 12)
      .map((line) => {
        const [label, ...rest] = line.split("|");
        return { label: (label ?? "").trim().slice(0, 60), href: rest.join("|").trim().slice(0, 300) };
      })
      .filter((entry) => entry.label && entry.href);
  }

  const rows = await db
    .update(sites)
    .set(update)
    .where(eq(sites.id, siteId))
    .returning({ key: sites.key });

  refreshAdmin(rows[0]?.key);
  return { ok: true, message: "Réglages enregistrés. Le site public est à jour." };
}

/* ------------------------------------------------------------------ */
/* Pages                                                              */
/* ------------------------------------------------------------------ */

export async function createPageAction(
  siteId: number,
  siteKey: string,
  formData: FormData,
): Promise<void> {
  await requireAdmin();
  const title = getString(formData.get("title")).trim() || "Nouvelle page";
  const requested = getString(formData.get("slug")).trim();
  const navLabel = getString(formData.get("navLabel")).trim() || title;
  let slug = slugify(requested || title) || `page-${Date.now()}`;

  const existing = await db
    .select({ slug: pages.slug })
    .from(pages)
    .where(eq(pages.siteId, siteId));
  const taken = new Set(existing.map((row) => row.slug));
  if (taken.has(slug)) {
    let index = 2;
    while (taken.has(`${slug}-${index}`)) index += 1;
    slug = `${slug}-${index}`;
  }

  const maxPosition = await db
    .select({ value: sql<number>`coalesce(max(${pages.position}), 0)::int` })
    .from(pages)
    .where(eq(pages.siteId, siteId));

  const [created] = await db
    .insert(pages)
    .values({
      siteId,
      slug,
      title,
      navLabel,
      inNav: true,
      isHome: false,
      published: false,
      position: (maxPosition[0]?.value ?? 0) + 1,
    })
    .returning({ id: pages.id });

  if (created) {
    await db.insert(blocks).values({
      pageId: created.id,
      type: "hero",
      position: 0,
      visible: true,
      data: {
        eyebrow: "",
        title,
        subtitle: "Décrivez ici l'objet de cette page en une phrase claire.",
        imageUrl: "",
        imageAlt: "",
        primaryLabel: "Nous contacter",
        primaryHref: "/contact",
        secondaryLabel: "",
        secondaryHref: "",
        badges: [],
      },
    });
    refreshAdmin(siteKey);
    redirect(`/admin/site/${siteKey}/pages/${created.id}`);
  }
  refreshAdmin(siteKey);
}

export async function updatePageAction(
  pageId: number,
  siteKey: string,
  payload: string,
): Promise<ActionResult> {
  await requireAdmin();
  const data = safeJson(payload);
  const current = await db.select().from(pages).where(eq(pages.id, pageId)).limit(1);
  const page = current[0];
  if (!page) return { ok: false, message: "Page introuvable." };

  const slug = slugify(getString(data.slug) || page.slug) || page.slug;
  const duplicated = await db
    .select({ id: pages.id })
    .from(pages)
    .where(and(eq(pages.siteId, page.siteId), eq(pages.slug, slug)));
  if (duplicated.some((row) => row.id !== pageId)) {
    return { ok: false, message: "Cette adresse (slug) est déjà utilisée par une autre page." };
  }

  const isHome = data.isHome === true || data.isHome === "true";

  if (isHome) {
    await db
      .update(pages)
      .set({ isHome: false, updatedAt: new Date() })
      .where(and(eq(pages.siteId, page.siteId), eq(pages.isHome, true)));
  }

  await db
    .update(pages)
    .set({
      title: getString(data.title, page.title).slice(0, 200) || page.title,
      navLabel: getString(data.navLabel, page.navLabel).slice(0, 120),
      slug,
      seoTitle: getString(data.seoTitle).slice(0, 200),
      seoDescription: getString(data.seoDescription).slice(0, 400),
      inNav: data.inNav === true || data.inNav === "true",
      isHome,
      published: data.published === true || data.published === "true",
      updatedAt: new Date(),
    })
    .where(eq(pages.id, pageId));

  refreshAdmin(siteKey);
  return { ok: true, message: "Page mise à jour." };
}

export async function deletePageAction(pageId: number, siteKey: string): Promise<void> {
  await requireAdmin();
  const current = await db.select().from(pages).where(eq(pages.id, pageId)).limit(1);
  const page = current[0];
  if (page && !page.isHome) {
    await db.delete(pages).where(eq(pages.id, pageId));
  }
  refreshAdmin(siteKey);
  redirect(`/admin/site/${siteKey}/pages`);
}

export async function movePageAction(
  pageId: number,
  siteKey: string,
  direction: "up" | "down",
): Promise<void> {
  await requireAdmin();
  const current = await db.select().from(pages).where(eq(pages.id, pageId)).limit(1);
  const page = current[0];
  if (!page) return;
  const neighbour = await db
    .select()
    .from(pages)
    .where(
      and(
        eq(pages.siteId, page.siteId),
        direction === "up" ? lt(pages.position, page.position) : gt(pages.position, page.position),
      ),
    )
    .orderBy(direction === "up" ? sql`${pages.position} desc` : pages.position)
    .limit(1);

  const other = neighbour[0];
  if (other) {
    await db.update(pages).set({ position: other.position }).where(eq(pages.id, page.id));
    await db.update(pages).set({ position: page.position }).where(eq(pages.id, other.id));
  }
  refreshAdmin(siteKey);
}

/* ------------------------------------------------------------------ */
/* Blocs                                                              */
/* ------------------------------------------------------------------ */

const emptyFieldValue = (field: FieldDef): string =>
  field.type === "select" ? (field.options?.[0]?.value ?? "") : "";

function defaultData(def: BlockDef): Record<string, unknown> {
  const data: Record<string, unknown> = {};
  for (const field of def.fields) {
    data[field.name] = field.type === "lines" ? [] : emptyFieldValue(field);
  }
  for (const list of listsOf(def)) {
    const emptyItem: Record<string, unknown> = {};
    for (const field of list.fields) {
      emptyItem[field.name] = field.type === "lines" ? [] : emptyFieldValue(field);
    }
    data[list.key] = [emptyItem];
  }
  return data;
}

const toLines = (value: unknown, max: number): string[] => {
  if (Array.isArray(value)) return value.map((entry) => String(entry)).filter(Boolean).slice(0, max);
  return getString(value)
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, max);
};

function cleanData(def: BlockDef, raw: Record<string, unknown>): Record<string, unknown> {
  const clean: Record<string, unknown> = {};

  for (const field of def.fields) {
    const value = raw[field.name];
    clean[field.name] =
      field.type === "lines" ? toLines(value, 40) : getString(value).slice(0, 6000);
  }

  for (const list of listsOf(def)) {
    const rawItems = Array.isArray(raw[list.key]) ? (raw[list.key] as unknown[]) : [];
    clean[list.key] = rawItems
      .filter(isRecord)
      .slice(0, 80)
      .map((entry) => {
        const item: Record<string, unknown> = {};
        for (const field of list.fields) {
          item[field.name] =
            field.type === "lines"
              ? toLines(entry[field.name], 20)
              : getString(entry[field.name]).slice(0, 4000);
        }
        return item;
      });
  }

  return clean;
}

export async function addBlockAction(pageId: number, type: string): Promise<void> {
  await requireAdmin();
  const def = blockDef(type) ?? BLOCK_DEFS[0];
  const pageRows = await db.select({ siteId: pages.siteId }).from(pages).where(eq(pages.id, pageId));
  if (!pageRows[0]) return;

  const maxPosition = await db
    .select({ value: sql<number>`coalesce(max(${blocks.position}), -1)::int` })
    .from(blocks)
    .where(eq(blocks.pageId, pageId));

  await db.insert(blocks).values({
    pageId,
    type: def.type,
    position: (maxPosition[0]?.value ?? -1) + 1,
    visible: true,
    data: defaultData(def),
  });

  const siteRows = await db
    .select({ key: sites.key })
    .from(sites)
    .where(eq(sites.id, pageRows[0].siteId));
  refreshAdmin(siteRows[0]?.key);
}

export async function saveBlockAction(blockId: number, payload: string): Promise<ActionResult> {
  await requireAdmin();
  const current = await db.select().from(blocks).where(eq(blocks.id, blockId)).limit(1);
  const block = current[0];
  if (!block) return { ok: false, message: "Bloc introuvable." };
  const def = blockDef(block.type);
  if (!def) return { ok: false, message: "Type de bloc inconnu." };

  const data = cleanData(def, safeJson(payload));
  await db
    .update(blocks)
    .set({ data, updatedAt: new Date() })
    .where(eq(blocks.id, blockId));

  const pageRows = await db.select({ siteId: pages.siteId }).from(pages).where(eq(pages.id, block.pageId));
  const siteRows = pageRows[0]
    ? await db.select({ key: sites.key }).from(sites).where(eq(sites.id, pageRows[0].siteId))
    : [];
  refreshAdmin(siteRows[0]?.key);
  return { ok: true, message: "Bloc enregistré." };
}

export async function deleteBlockAction(blockId: number): Promise<void> {
  await requireAdmin();
  const current = await db.select().from(blocks).where(eq(blocks.id, blockId)).limit(1);
  if (!current[0]) return;
  await db.delete(blocks).where(eq(blocks.id, blockId));
  refreshAdmin();
}

export async function toggleBlockAction(blockId: number): Promise<void> {
  await requireAdmin();
  const current = await db.select().from(blocks).where(eq(blocks.id, blockId)).limit(1);
  if (!current[0]) return;
  await db
    .update(blocks)
    .set({ visible: !current[0].visible, updatedAt: new Date() })
    .where(eq(blocks.id, blockId));
  refreshAdmin();
}

export async function moveBlockAction(
  blockId: number,
  direction: "up" | "down",
): Promise<void> {
  await requireAdmin();
  const current = await db.select().from(blocks).where(eq(blocks.id, blockId)).limit(1);
  const block = current[0];
  if (!block) return;
  const neighbour = await db
    .select()
    .from(blocks)
    .where(
      and(
        eq(blocks.pageId, block.pageId),
        direction === "up"
          ? lt(blocks.position, block.position)
          : gt(blocks.position, block.position),
      ),
    )
    .orderBy(direction === "up" ? sql`${blocks.position} desc` : blocks.position)
    .limit(1);

  const other = neighbour[0];
  if (other) {
    await db.update(blocks).set({ position: other.position }).where(eq(blocks.id, block.id));
    await db.update(blocks).set({ position: block.position }).where(eq(blocks.id, other.id));
  }
  refreshAdmin();
}

export async function duplicateBlockAction(blockId: number): Promise<void> {
  await requireAdmin();
  const current = await db.select().from(blocks).where(eq(blocks.id, blockId)).limit(1);
  const block = current[0];
  if (!block) return;
  await db.insert(blocks).values({
    pageId: block.pageId,
    type: block.type,
    position: block.position + 1,
    visible: block.visible,
    data: block.data,
  });
  await db
    .update(blocks)
    .set({ position: sql`${blocks.position} + 1` })
    .where(and(eq(blocks.pageId, block.pageId), gt(blocks.position, block.position)));
  refreshAdmin();
}

/* ------------------------------------------------------------------ */
/* Messages                                                           */
/* ------------------------------------------------------------------ */

export async function setMessageReadAction(messageId: number, read: boolean): Promise<void> {
  await requireAdmin();
  await db.update(messages).set({ isRead: read }).where(eq(messages.id, messageId));
  refreshAdmin();
}

export async function deleteMessageAction(messageId: number): Promise<void> {
  await requireAdmin();
  await db.delete(messages).where(eq(messages.id, messageId));
  refreshAdmin();
}

export async function markAllReadAction(): Promise<void> {
  await requireAdmin();
  await db.update(messages).set({ isRead: true }).where(eq(messages.isRead, false));
  refreshAdmin();
}

/* ------------------------------------------------------------------ */
/* Maintenance                                                        */
/* ------------------------------------------------------------------ */

export async function resetSiteAction(siteId: number, siteKey: string): Promise<void> {
  await requireAdmin();
  await reseedSite(siteKey);
  refreshAdmin(siteKey);
  redirect(`/admin/site/${siteKey}?reset=1`);
}

/* ------------------------------------------------------------------ */
/* Actions compatibles avec les formulaires (progressive enhancement)  */
/* ------------------------------------------------------------------ */

export async function addBlockFormAction(pageId: number, formData: FormData): Promise<void> {
  const type = getString(formData.get("type"), "features");
  await addBlockAction(pageId, type);
}

export async function blockCommandFormAction(formData: FormData): Promise<void> {
  const blockId = Number(formData.get("blockId"));
  const command = getString(formData.get("command"));
  if (!Number.isFinite(blockId) || blockId <= 0) return;
  switch (command) {
    case "up":
      await moveBlockAction(blockId, "up");
      break;
    case "down":
      await moveBlockAction(blockId, "down");
      break;
    case "toggle":
      await toggleBlockAction(blockId);
      break;
    case "duplicate":
      await duplicateBlockAction(blockId);
      break;
    case "delete":
      await deleteBlockAction(blockId);
      break;
    default:
      break;
  }
}

export async function pageCommandFormAction(formData: FormData): Promise<void> {
  const pageId = Number(formData.get("pageId"));
  const siteKey = getString(formData.get("siteKey"));
  const command = getString(formData.get("command"));
  if (!Number.isFinite(pageId) || pageId <= 0 || !siteKey) return;
  switch (command) {
    case "up":
      await movePageAction(pageId, siteKey, "up");
      break;
    case "down":
      await movePageAction(pageId, siteKey, "down");
      break;
    case "delete":
      await deletePageAction(pageId, siteKey);
      break;
    default:
      break;
  }
}

export async function messageCommandFormAction(formData: FormData): Promise<void> {
  const messageId = Number(formData.get("messageId"));
  const command = getString(formData.get("command"));
  if (command === "all-read") {
    await markAllReadAction();
    return;
  }
  if (!Number.isFinite(messageId) || messageId <= 0) return;
  switch (command) {
    case "read":
      await setMessageReadAction(messageId, true);
      break;
    case "unread":
      await setMessageReadAction(messageId, false);
      break;
    case "delete":
      await deleteMessageAction(messageId);
      break;
    default:
      break;
  }
}
