import { readFileSync } from "node:fs";
import { join } from "node:path";
import { sql } from "drizzle-orm";
import { db } from "@/db";

const TABLES = ["sites", "pages", "blocks", "messages", "content_revisions"];
let initialization: Promise<void> | undefined;

/**
 * Première installation uniquement. N’altère et ne supprime aucune table existante.
 * Le verrou transactionnel protège les premiers appels concurrents de Vercel.
 */
export async function initializeDatabaseTables(client: typeof db = db): Promise<void> {
  await client.transaction(async (tx) => {
    await tx.execute(sql`select pg_advisory_xact_lock(894211734)`);
    const result = await tx.execute<{ tablename: string }>(sql`
      select tablename from pg_catalog.pg_tables
      where schemaname = current_schema()
        and tablename in ('sites', 'pages', 'blocks', 'messages', 'content_revisions')
    `);
    const existing = new Set(result.rows.map((row) => row.tablename));
    if (TABLES.every((table) => existing.has(table))) return;
    if (existing.size > 0) {
      throw new Error("Schéma PostgreSQL partiel : aucune table n’a été modifiée. Vérifiez le schéma existant avant de poursuivre.");
    }
    const ddl = readFileSync(join(process.cwd(), "src", "db", "bootstrap.sql"), "utf8");
    await tx.execute(sql.raw(ddl));
  });
}

export async function ensureDatabaseTables(): Promise<void> {
  if (!initialization) {
    initialization = initializeDatabaseTables().catch((error) => {
      initialization = undefined;
      throw error;
    });
  }
  await initialization;
}
