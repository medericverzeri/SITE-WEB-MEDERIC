import { eq } from "drizzle-orm";
import { db } from "@/db";
import { messages, sites } from "@/db/schema";
import { sendContactNotification } from "@/lib/notify";

export type ContactInput = {
  siteId: number;
  pageSlug?: string;
  name: string;
  email: string;
  phone?: string;
  organisation?: string;
  subject?: string;
  body: string;
};

export type ContactOutcome = {
  ok: boolean;
  error?: string;
  recipient?: string;
  emailSent?: boolean;
  mailerConfigured?: boolean;
};

export function validateContact(input: ContactInput): string | null {
  if (!Number.isFinite(input.siteId) || input.siteId <= 0) {
    return "Une erreur technique est survenue. Merci de réessayer.";
  }
  if (!input.name || input.name.trim().length < 2) {
    return "Merci d'indiquer votre nom (2 caractères minimum).";
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(input.email ?? "")) {
    return "Merci de saisir une adresse e-mail valide.";
  }
  if (!input.body || input.body.trim().length < 10) {
    return "Merci de détailler un peu votre demande (10 caractères minimum).";
  }
  return null;
}

/** Enregistre la demande puis tente la notification e-mail. */
export async function createContactRequest(input: ContactInput): Promise<ContactOutcome> {
  const invalid = validateContact(input);
  if (invalid) return { ok: false, error: invalid };

  try {
    const rows = await db
      .select({
        name: sites.name,
        contactEmail: sites.contactEmail,
        notificationEmail: sites.notificationEmail,
      })
      .from(sites)
      .where(eq(sites.id, input.siteId))
      .limit(1);
    const site = rows[0];
    if (!site) return { ok: false, error: "Site inconnu." };

    const subject = (input.subject ?? "").trim() || "Demande via le site";
    const pageSlug = (input.pageSlug ?? "").trim() || "accueil";

    await db.insert(messages).values({
      siteId: input.siteId,
      pageSlug,
      name: input.name.trim(),
      email: input.email.trim(),
      phone: (input.phone ?? "").trim(),
      organisation: (input.organisation ?? "").trim(),
      subject,
      body: input.body.trim(),
    });

    const recipient = (site.notificationEmail || site.contactEmail || "").trim();
    const notification = await sendContactNotification({
      to: recipient,
      fromName: input.name,
      siteName: site.name,
      name: input.name,
      email: input.email,
      phone: input.phone ?? "",
      organisation: input.organisation ?? "",
      subject,
      body: input.body,
      pageSlug,
    });

    return {
      ok: true,
      recipient,
      emailSent: notification.sent,
      mailerConfigured: notification.reason !== "no-api-key",
    };
  } catch {
    return {
      ok: false,
      error: "L'envoi a échoué. Merci de réessayer ou de nous appeler directement.",
    };
  }
}
