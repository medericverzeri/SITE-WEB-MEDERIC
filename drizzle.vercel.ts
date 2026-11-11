import "dotenv/config";
import { defineConfig } from "drizzle-kit";

/** Configuration de publication : aucune adresse de base ou clé dans le dépôt. */
const databaseUrl = process.env.DATABASE_URL?.trim();
if (!databaseUrl) {
  throw new Error("Définissez DATABASE_URL pour préparer la base PostgreSQL du projet Vercel.");
}

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema.ts",
  dbCredentials: { url: databaseUrl },
});
