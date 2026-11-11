export type DirectEmailInput = {
  recipient: string;
  siteName?: string;
  pageSlug?: string;
  name: string;
  email: string;
  phone?: string;
  organisation?: string;
  subject?: string;
  body: string;
};

/** Prépare un e-mail réel dans la messagerie du visiteur, sans serveur d’envoi. */
export function buildDirectEmail(input: DirectEmailInput): { href: string; text: string; subject: string; body: string } {
  const subject = `[${input.siteName || "Site"}] ${input.subject?.trim() || "Question via le site"}`;
  const details = [
    "Bonjour,",
    "",
    input.body.trim(),
    "",
    "— Coordonnées de l’expéditeur —",
    `Nom : ${input.name.trim()}`,
    `E-mail : ${input.email.trim()}`,
    input.phone?.trim() ? `Téléphone : ${input.phone.trim()}` : "",
    input.organisation?.trim() ? `Structure : ${input.organisation.trim()}` : "",
    input.pageSlug ? `Page du site : ${input.pageSlug}` : "",
  ].filter(Boolean);
  const body = details.join("\n");
  return {
    subject,
    body,
    text: `À : ${input.recipient}\nObjet : ${subject}\n\n${body}`,
    href: `mailto:${input.recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`,
  };
}
