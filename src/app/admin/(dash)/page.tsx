import Link from "next/link";
import { getAdminOverview, PRIMARY_SITE_KEY } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const overview = await getAdminOverview();

  return (
    <div>
      <div className="admin-topbar">
        <div>
          <h1 className="admin-title">Vue d&apos;ensemble</h1>
          <p className="admin-sub">
            Tout le contenu des deux sites se modifie ici. Aucune ligne de code n&apos;est nécessaire.
          </p>
        </div>
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          <Link href="/admin/messages" className="a-btn">
            Messages{overview.totalMessages ? ` (${overview.totalMessages})` : ""}
          </Link>
          <Link href="/admin/aide" className="a-btn a-btn--primary">
            Guide Vercel
          </Link>
        </div>
      </div>

      <div className="admin-grid" style={{ marginBottom: "1rem" }}>
        {overview.sites.map((site) => (
          <article className="admin-card" key={site.id}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.7rem" }}>
              <span
                style={{
                  display: "grid",
                  placeItems: "center",
                  width: 42,
                  height: 42,
                  borderRadius: 12,
                  background: site.primaryColor,
                  color: "#fff",
                  fontWeight: 800,
                  fontSize: "0.85rem",
                }}
              >
                {site.logoMark}
              </span>
              <div>
                <h2 style={{ fontSize: "1rem" }}>{site.name}</h2>
                <p className="admin-sub" style={{ marginTop: 0 }}>
                  {site.role}
                </p>
              </div>
            </div>

            <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", margin: "0.9rem 0" }}>
              <span className="pill pill--muted">{site.pageCount} pages</span>
              <span className={`pill ${site.unread ? "pill--warn" : "pill--ok"}`}>
                {site.unread} message{site.unread > 1 ? "s" : ""} non lu{site.unread > 1 ? "s" : ""}
              </span>
              <span className="pill">{site.key === PRIMARY_SITE_KEY ? "Site principal" : "Site secondaire"}</span>
            </div>

            <div style={{ display: "grid", gap: "0.4rem" }}>
              <Link href={`/admin/site/${site.key}`} className="a-btn a-btn--primary">
                Réglages & identité
              </Link>
              <Link href={`/admin/site/${site.key}/pages`} className="a-btn">
                Pages & contenus
              </Link>
              <a
                href={site.key === PRIMARY_SITE_KEY ? "/" : `/${site.key}`}
                className="a-btn a-btn--ghost"
                target="_blank"
                rel="noreferrer"
              >
                Voir le site public ↗
              </a>
            </div>
          </article>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.35fr) minmax(0, 1fr)", gap: "1rem" }}>
        <section className="admin-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "0.5rem" }}>
            <h2>Derniers messages</h2>
            <Link href="/admin/messages" className="a-btn a-btn--sm">
              Tout voir
            </Link>
          </div>
          {overview.recent.length === 0 ? (
            <p className="admin-sub" style={{ marginTop: "0.6rem" }}>
              Aucun message pour l&apos;instant. Les demandes envoyées via les formulaires des sites
              apparaîtront ici.
            </p>
          ) : (
            <table className="admin-table" style={{ marginTop: "0.6rem" }}>
              <thead>
                <tr>
                  <th>De</th>
                  <th>Objet</th>
                  <th>Site</th>
                  <th>État</th>
                </tr>
              </thead>
              <tbody>
                {overview.recent.map((message) => {
                  const site = overview.sites.find((entry) => entry.id === message.siteId);
                  return (
                    <tr key={message.id}>
                      <td>
                        <strong>{message.name}</strong>
                        <br />
                        <span style={{ color: "#5b6678", fontSize: "0.78rem" }}>{message.email}</span>
                      </td>
                      <td>
                        {message.subject || "Sans objet"}
                        <br />
                        <span style={{ color: "#5b6678", fontSize: "0.78rem" }}>
                          {message.createdAt.toLocaleDateString("fr-FR", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </td>
                      <td>{site?.shortName || site?.name || "—"}</td>
                      <td>
                        <span className={`pill ${message.isRead ? "pill--muted" : "pill--warn"}`}>
                          {message.isRead ? "Lu" : "Nouveau"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </section>

        <section className="admin-card">
          <h2>Par où commencer ?</h2>
          <ol style={{ paddingLeft: "1.1rem", fontSize: "0.88rem", color: "#3d4859", marginTop: "0.6rem", display: "grid", gap: "0.55rem" }}>
            <li>
              <strong>Réglages & identité</strong> : nom, rôle, couleurs, coordonnées, bandeau
              d&apos;annonce, SEO.
            </li>
            <li>
              <strong>Pages & contenus</strong> : ajoutez, réordonnez ou masquez des sections, page
              par page.
            </li>
            <li>
              <strong>Messages</strong> : les formulaires de contact enregistrent chaque demande en
              base.
            </li>
            <li>
              <strong>Guide</strong> : déploiement sur Vercel, sauvegarde et bonnes
              pratiques.
            </li>
          </ol>
          <p className="note" style={{ fontSize: "0.82rem" }}>
            Chaque site possède son propre contenu : modifier le site « entreprise » ne change rien
            au site « encadrant ».
          </p>
        </section>
      </div>
    </div>
  );
}
