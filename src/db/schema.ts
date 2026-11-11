import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

/**
 * Un "site" = une identité complète (celle de l'encadrant technique,
 * celle de la chargée de développement de l'entreprise, etc.).
 * Toutes les valeurs affichées sur le site public vivent ici ou dans les blocs.
 */
export const sites = pgTable(
  "sites",
  {
    id: serial("id").primaryKey(),
    key: text("key").notNull(),
    name: text("name").notNull(),
    shortName: text("short_name").notNull().default(""),
    role: text("role").notNull().default(""),
    tagline: text("tagline").notNull().default(""),
    logoMark: text("logo_mark").notNull().default("HI"),
    primaryColor: text("primary_color").notNull().default("#0f766e"),
    accentColor: text("accent_color").notNull().default("#f59e0b"),
    heroImageUrl: text("hero_image_url").notNull().default(""),
    contactEmail: text("contact_email").notNull().default(""),
    contactPhone: text("contact_phone").notNull().default(""),
    notificationEmail: text("notification_email").notNull().default(""),
    address: text("address").notNull().default(""),
    openingHours: text("opening_hours").notNull().default(""),
    schedule: jsonb("schedule").$type<ScheduleData>().notNull().default({}),
    statusOverride: text("status_override").notNull().default("auto"),
    statusNoteOpen: text("status_note_open").notNull().default(""),
    statusNoteClosed: text("status_note_closed").notNull().default(""),
    photoUrl: text("photo_url").notNull().default(""),
    photoAlt: text("photo_alt").notNull().default(""),
    photoName: text("photo_name").notNull().default(""),
    photoRole: text("photo_role").notNull().default(""),
    marqueeEnabled: boolean("marquee_enabled").notNull().default(true),
    marqueeText: text("marquee_text").notNull().default(""),
    marqueeSpeed: text("marquee_speed").notNull().default("normal"),
    navLinks: jsonb("nav_links").$type<NavLink[]>().notNull().default([]),
    textureUrl: text("texture_url").notNull().default(""),
    footerNote: text("footer_note").notNull().default(""),
    legalNote: text("legal_note").notNull().default(""),
    ctaLabel: text("cta_label").notNull().default("Nous contacter"),
    ctaHref: text("cta_href").notNull().default("/contact"),
    bannerEnabled: boolean("banner_enabled").notNull().default(false),
    bannerText: text("banner_text").notNull().default(""),
    bannerHref: text("banner_href").notNull().default(""),
    seoTitle: text("seo_title").notNull().default(""),
    seoDescription: text("seo_description").notNull().default(""),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex("sites_key_unique").on(table.key)],
);

export const pages = pgTable(
  "pages",
  {
    id: serial("id").primaryKey(),
    siteId: integer("site_id")
      .notNull()
      .references(() => sites.id, { onDelete: "cascade" }),
    slug: text("slug").notNull(),
    title: text("title").notNull(),
    navLabel: text("nav_label").notNull().default(""),
    seoTitle: text("seo_title").notNull().default(""),
    seoDescription: text("seo_description").notNull().default(""),
    isHome: boolean("is_home").notNull().default(false),
    inNav: boolean("in_nav").notNull().default(true),
    position: integer("position").notNull().default(0),
    published: boolean("published").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("pages_site_slug_unique").on(table.siteId, table.slug),
    index("pages_site_idx").on(table.siteId),
  ],
);

export type BlockData = Record<string, unknown>;

export const blocks = pgTable(
  "blocks",
  {
    id: serial("id").primaryKey(),
    pageId: integer("page_id")
      .notNull()
      .references(() => pages.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    position: integer("position").notNull().default(0),
    visible: boolean("visible").notNull().default(true),
    data: jsonb("data").$type<BlockData>().notNull().default({}),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("blocks_page_idx").on(table.pageId)],
);

export const messages = pgTable(
  "messages",
  {
    id: serial("id").primaryKey(),
    siteId: integer("site_id")
      .notNull()
      .references(() => sites.id, { onDelete: "cascade" }),
    pageSlug: text("page_slug").notNull().default("accueil"),
    name: text("name").notNull(),
    email: text("email").notNull().default(""),
    phone: text("phone").notNull().default(""),
    organisation: text("organisation").notNull().default(""),
    subject: text("subject").notNull().default(""),
    body: text("body").notNull(),
    isRead: boolean("is_read").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("messages_site_idx").on(table.siteId)],
);

/** Historique des mises à jour de contenu : appliquées une seule fois sans effacer les personnalisations. */
export const contentRevisions = pgTable("content_revisions", {
  key: text("key").primaryKey(),
  appliedAt: timestamp("applied_at", { withTimezone: true }).notNull().defaultNow(),
});

export type NavLink = { label: string; href: string };
export type DaySchedule = {
  closed: boolean;
  ranges: { start: string; end: string }[];
  appointmentOnly?: boolean;
  note?: string;
};
export type ScheduleData = Record<string, DaySchedule>;

export type Site = typeof sites.$inferSelect;
export type Page = typeof pages.$inferSelect;
export type ContentBlock = typeof blocks.$inferSelect;
export type ContactMessage = typeof messages.$inferSelect;
