-- Schéma initial généré depuis src/db/schema.ts.
-- Références locales non qualifiées pour respecter le search_path courant.
CREATE TABLE "blocks" (
	"id" serial PRIMARY KEY NOT NULL,
	"page_id" integer NOT NULL,
	"type" text NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"visible" boolean DEFAULT true NOT NULL,
	"data" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "content_revisions" (
	"key" text PRIMARY KEY NOT NULL,
	"applied_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"site_id" integer NOT NULL,
	"page_slug" text DEFAULT 'accueil' NOT NULL,
	"name" text NOT NULL,
	"email" text DEFAULT '' NOT NULL,
	"phone" text DEFAULT '' NOT NULL,
	"organisation" text DEFAULT '' NOT NULL,
	"subject" text DEFAULT '' NOT NULL,
	"body" text NOT NULL,
	"is_read" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "pages" (
	"id" serial PRIMARY KEY NOT NULL,
	"site_id" integer NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"nav_label" text DEFAULT '' NOT NULL,
	"seo_title" text DEFAULT '' NOT NULL,
	"seo_description" text DEFAULT '' NOT NULL,
	"is_home" boolean DEFAULT false NOT NULL,
	"in_nav" boolean DEFAULT true NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"published" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "sites" (
	"id" serial PRIMARY KEY NOT NULL,
	"key" text NOT NULL,
	"name" text NOT NULL,
	"short_name" text DEFAULT '' NOT NULL,
	"role" text DEFAULT '' NOT NULL,
	"tagline" text DEFAULT '' NOT NULL,
	"logo_mark" text DEFAULT 'HI' NOT NULL,
	"primary_color" text DEFAULT '#0f766e' NOT NULL,
	"accent_color" text DEFAULT '#f59e0b' NOT NULL,
	"hero_image_url" text DEFAULT '' NOT NULL,
	"contact_email" text DEFAULT '' NOT NULL,
	"contact_phone" text DEFAULT '' NOT NULL,
	"notification_email" text DEFAULT '' NOT NULL,
	"address" text DEFAULT '' NOT NULL,
	"opening_hours" text DEFAULT '' NOT NULL,
	"schedule" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"status_override" text DEFAULT 'auto' NOT NULL,
	"status_note_open" text DEFAULT '' NOT NULL,
	"status_note_closed" text DEFAULT '' NOT NULL,
	"photo_url" text DEFAULT '' NOT NULL,
	"photo_alt" text DEFAULT '' NOT NULL,
	"photo_name" text DEFAULT '' NOT NULL,
	"photo_role" text DEFAULT '' NOT NULL,
	"marquee_enabled" boolean DEFAULT true NOT NULL,
	"marquee_text" text DEFAULT '' NOT NULL,
	"marquee_speed" text DEFAULT 'normal' NOT NULL,
	"nav_links" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"texture_url" text DEFAULT '' NOT NULL,
	"footer_note" text DEFAULT '' NOT NULL,
	"legal_note" text DEFAULT '' NOT NULL,
	"cta_label" text DEFAULT 'Nous contacter' NOT NULL,
	"cta_href" text DEFAULT '/contact' NOT NULL,
	"banner_enabled" boolean DEFAULT false NOT NULL,
	"banner_text" text DEFAULT '' NOT NULL,
	"banner_href" text DEFAULT '' NOT NULL,
	"seo_title" text DEFAULT '' NOT NULL,
	"seo_description" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE "blocks" ADD CONSTRAINT "blocks_page_id_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "pages"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "messages" ADD CONSTRAINT "messages_site_id_sites_id_fk" FOREIGN KEY ("site_id") REFERENCES "sites"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "pages" ADD CONSTRAINT "pages_site_id_sites_id_fk" FOREIGN KEY ("site_id") REFERENCES "sites"("id") ON DELETE cascade ON UPDATE no action;
CREATE INDEX "blocks_page_idx" ON "blocks" USING btree ("page_id");
CREATE INDEX "messages_site_idx" ON "messages" USING btree ("site_id");
CREATE UNIQUE INDEX "pages_site_slug_unique" ON "pages" USING btree ("site_id","slug");
CREATE INDEX "pages_site_idx" ON "pages" USING btree ("site_id");
CREATE UNIQUE INDEX "sites_key_unique" ON "sites" USING btree ("key");
