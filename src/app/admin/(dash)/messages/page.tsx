import Link from "next/link";
import { messageCommandFormAction } from "../../actions";
import { getMessages, listSites } from "@/lib/data";

export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<{ site?: string }> };

export default async function AdminMessagesPage({ searchParams }: Props) {
  const { site: siteFilter } = await searchParams;
  const sites = await listSites();
  const activeSite = sites.find((site) => site.key === siteFilter);
  const list = await getMessages(activeSite?.id);

  return (
    <div>
      <div className="admin-topbar">
        <div>
          <h1 className="admin-title">Messages reçus</h1>
          <p className="admin-sub">
            Chaque envoi des formulaires de contact est enregistré ici. Aucun e-mail externe n&apos;est
            nécessaire.
          </p>
        </div>
        <form action={messageCommandFormAction}>
          <input type="hidden" name="command" value="all-read" />
          <button type="submit" className="a-btn">
            Tout marquer comme lu
          </button>
        </form>
      </div>

      <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", marginBottom: "1rem" }}>
        <Link href="/admin/messages" className={`a-btn a-btn--sm ${!activeSite ? "a-btn--primary" : ""}`}>
          Tous les sites
        </Link>
        {sites.map((site) => (
          <Link
            key={site.id}
            href={`/admin/messages?site=${site.key}`}
            className={`a-btn a-btn--sm ${activeSite?.id === site.id ? "a-btn--primary" : ""}`}
          >
            {site.name}
          </Link>
        ))}
      </div>

      {list.length === 0 ? (
        <div className="admin-card">
          <h2>Aucun message</h2>
          <p className="admin-sub" style={{ marginTop: "0.4rem" }}>
            Les messages envoyés depuis les formulaires du site apparaîtront ici automatiquement.
          </p>
        </div>
      ) : (
        <div style={{ display: "grid", gap: "0.75rem" }}>
          {list.map((message) => {
            const site = sites.find((entry) => entry.id === message.siteId);
            return (
              <article className="admin-card" key={message.id}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: "0.75rem",
                    flexWrap: "wrap",
                    alignItems: "flex-start",
                  }}
                >
                  <div>
                    <h2 style={{ fontSize: "0.98rem" }}>
                      {message.subject || "Sans objet"}{" "}
                      <span className={`pill ${message.isRead ? "pill--muted" : "pill--warn"}`}>
                        {message.isRead ? "Lu" : "Nouveau"}
                      </span>
                    </h2>
                    <p className="admin-sub">
                      {message.name}
                      {message.organisation ? ` · ${message.organisation}` : ""} ·{" "}
                      {message.createdAt.toLocaleString("fr-FR", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}{" "}
                      · {site?.name ?? "site"} / {message.pageSlug}
                    </p>
                  </div>
                  <div style={{ display: "flex", gap: "0.35rem", flexWrap: "wrap" }}>
                    <form action={messageCommandFormAction}>
                      <input type="hidden" name="messageId" value={message.id} />
                      <input type="hidden" name="command" value={message.isRead ? "unread" : "read"} />
                      <button type="submit" className="a-btn a-btn--sm">
                        {message.isRead ? "Marquer non lu" : "Marquer lu"}
                      </button>
                    </form>
                    <form action={messageCommandFormAction}>
                      <input type="hidden" name="messageId" value={message.id} />
                      <input type="hidden" name="command" value="delete" />
                      <button type="submit" className="a-btn a-btn--sm a-btn--danger">
                        Supprimer
                      </button>
                    </form>
                  </div>
                </div>

                <div
                  style={{
                    marginTop: "0.7rem",
                    background: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    borderRadius: 10,
                    padding: "0.75rem 0.9rem",
                    whiteSpace: "pre-line",
                    fontSize: "0.9rem",
                    color: "#26303f",
                  }}
                >
                  {message.body}
                </div>

                <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginTop: "0.65rem", fontSize: "0.84rem" }}>
                  {message.email ? (
                    <a href={`mailto:${message.email}?subject=Re : ${encodeURIComponent(message.subject || "votre message")}`}>
                      ✉ Répondre à {message.email}
                    </a>
                  ) : null}
                  {message.phone ? <a href={`tel:${message.phone.replace(/\s/g, "")}`}>☎ {message.phone}</a> : null}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
