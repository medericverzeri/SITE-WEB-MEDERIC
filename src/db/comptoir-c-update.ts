import { eq } from "drizzle-orm";
import { db } from "@/db";
import { blocks, contentRevisions } from "@/db/schema";

const COMPTOIR = {
  name: "Comptoir C\nEnsemble de services sur Beauvais",
  category: "Réemploi, réparation et services de proximité",
  href: "https://eco-solidaire.fr/groupe-mes/nos-lieux/comptoir-c",
  imageUrl: "/images/comptoir-c-illustration.webp",
  imageFit: "cover",
  logo1: "/images/comptoir-c-logo.svg",
  logo2: "",
};

/** Remplace uniquement l’ancienne carte Comptoir C, en préservant toutes les autres entreprises. */
export async function applyComptoirCUpdate(database: typeof db = db): Promise<void> {
  await database.transaction(async (tx) => {
    const claimed = await tx
      .insert(contentRevisions)
      .values({ key: "companies:comptoir-c-branding-v1" })
      .onConflictDoNothing()
      .returning({ key: contentRevisions.key });
    if (claimed.length === 0) return;

    const companyBlocks = await tx.select().from(blocks).where(eq(blocks.type, "companies"));
    for (const block of companyBlocks) {
      const entries = Array.isArray(block.data.items) ? block.data.items : [];
      let changed = false;
      const items = entries.map((entry) => {
        if (typeof entry.name !== "string" || !/comptoir/i.test(entry.name)) return entry;
        changed = true;
        return { ...entry, ...COMPTOIR };
      });
      if (changed) {
        await tx.update(blocks).set({ data: { ...block.data, items }, updatedAt: new Date() }).where(eq(blocks.id, block.id));
      }
    }
  });
}
