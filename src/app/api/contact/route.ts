import { createContactRequest } from "@/lib/contact";

export const dynamic = "force-dynamic";

/**
 * Endpoint public pour les formulaires (site statique, formulaire externe,
 * automatisation…). Le formulaire intégré utilise la même logique via une
 * action serveur.
 */
export async function POST(request: Request) {
  let payload: Record<string, unknown> = {};
  const contentType = request.headers.get("content-type") ?? "";

  try {
    if (contentType.includes("application/json")) {
      payload = (await request.json()) as Record<string, unknown>;
    } else {
      const form = await request.formData();
      payload = Object.fromEntries(form.entries());
    }
  } catch {
    return Response.json({ ok: false, error: "Requête illisible." }, { status: 400 });
  }

  const asText = (key: string) => (typeof payload[key] === "string" ? String(payload[key]) : "");

  const result = await createContactRequest({
    siteId: Number(payload.siteId),
    pageSlug: asText("pageSlug"),
    name: asText("name"),
    email: asText("email"),
    phone: asText("phone"),
    organisation: asText("organisation"),
    subject: asText("subject"),
    body: asText("body"),
  });

  return Response.json(result, { status: result.ok ? 201 : 400 });
}
