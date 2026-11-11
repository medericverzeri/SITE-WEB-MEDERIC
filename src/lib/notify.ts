/**
 * Notification e-mail des demandes de contact.
 *
 * - Si `RESEND_API_KEY` est défini (offre gratuite Resend : 3 000 mails/mois),
 *   le message est envoyé directement à l'adresse de réception du site.
 * - Sinon, la demande reste enregistrée dans l'espace admin et un lien
 *   `mailto:` pré-rempli est proposé pour envoyer le message depuis sa
 *   messagerie habituelle.
 */

export type NotifyInput = {
  to: string;
  fromName: string;
  siteName: string;
  name: string;
  email: string;
  phone: string;
  organisation: string;
  subject: string;
  body: string;
  pageSlug: string;
};

export type NotifyResult = {
  sent: boolean;
  reason?: "no-api-key" | "error" | "no-recipient";
};

export const isMailerConfigured = (): boolean => Boolean(process.env.RESEND_API_KEY?.trim());

function fromAddress(): string {
  return (
    process.env.CONTACT_FROM_EMAIL?.trim() ||
    "Déchet'Lab <onboarding@resend.dev>"
  );
}

export async function sendContactNotification(input: NotifyInput): Promise<NotifyResult> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) return { sent: false, reason: "no-api-key" };
  if (!input.to) return { sent: false, reason: "no-recipient" };

  const lines = [
    `Nouvelle demande reçue depuis le site ${input.siteName}.`,
    "",
    `Nom : ${input.name}`,
    `E-mail : ${input.email}`,
    input.phone ? `Téléphone : ${input.phone}` : "",
    input.organisation ? `Structure : ${input.organisation}` : "",
    `Page : ${input.pageSlug}`,
    "",
    input.body,
    "",
    "— Message enregistré dans l'espace d'administration.",
  ].filter(Boolean);

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromAddress(),
        to: [input.to],
        reply_to: input.email,
        subject: `[${input.siteName}] ${input.subject || "Nouvelle demande"}`,
        text: lines.join("\n"),
      }),
    });
    if (!response.ok) return { sent: false, reason: "error" };
    return { sent: true };
  } catch {
    return { sent: false, reason: "error" };
  }
}

export function mailtoLink(input: {
  to: string;
  subject: string;
  body: string;
}): string {
  const subject = encodeURIComponent(input.subject || "Demande via le site");
  const body = encodeURIComponent(input.body);
  return `mailto:${input.to}?subject=${subject}&body=${body}`;
}
