"use server";

import { revalidatePath } from "next/cache";
import { createContactRequest } from "@/lib/contact";
import { mailtoLink } from "@/lib/notify";

export type ContactState = {
  status: "idle" | "success" | "error";
  message: string;
  emailSent?: boolean;
  emailConfigured?: boolean;
  recipient?: string;
  mailtoHref?: string;
};

function text(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export async function submitContactAction(
  _prev: ContactState,
  formData: FormData,
): Promise<ContactState> {
  const siteId = Number(formData.get("siteId"));
  const name = text(formData, "name");
  const email = text(formData, "email");
  const body = text(formData, "body");
  const phone = text(formData, "phone");
  const organisation = text(formData, "organisation");
  const subject = text(formData, "subject") || "Demande via le site";
  const pageSlug = text(formData, "pageSlug") || "accueil";
  const honeypot = text(formData, "website");

  if (honeypot) {
    return { status: "success", message: "Merci, votre message a bien été pris en compte." };
  }

  const outcome = await createContactRequest({
    siteId,
    pageSlug,
    name,
    email,
    phone,
    organisation,
    subject,
    body,
  });

  if (!outcome.ok) {
    return { status: "error", message: outcome.error ?? "L'envoi a échoué." };
  }

  revalidatePath("/admin");
  revalidatePath("/admin/messages");

  const directBody = `Bonjour,\n\n${body}\n\n${name}\n${organisation ? `${organisation}\n` : ""}${email}${phone ? `\n${phone}` : ""}`;

  return {
    status: "success",
    message: outcome.emailSent
      ? `Votre message a été envoyé à ${outcome.recipient}. Une réponse vous sera apportée rapidement.`
      : "Votre message est bien enregistré et sera traité rapidement.",
    emailSent: outcome.emailSent,
    emailConfigured: outcome.mailerConfigured,
    recipient: outcome.recipient,
    mailtoHref: outcome.recipient
      ? mailtoLink({ to: outcome.recipient, subject: `[Site] ${subject}`, body: directBody })
      : undefined,
  };
}
