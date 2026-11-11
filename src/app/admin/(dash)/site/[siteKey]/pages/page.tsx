import Link from "next/link";
import { notFound } from "next/navigation";
import ConfirmSubmit from "@/components/admin/ConfirmSubmit";
import { createPageAction, pageCommandFormAction } from "@/app/admin/actions";
import { getAllPages, getSiteByKey, PRIMARY_SITE_KEY } from "@/lib/data";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ siteKey: string }> };

export default async function PagesListPage({ params }: Props) {
  const { siteKey } = await params;
  const site = await getSiteByKey(siteKey);
  if (!site) notFound();
  const pages = await getAllPages(site.id);

  const publicHref = (slug: string, isHome: boolean) => {
    if (isHome) return site.key === PRIMARY_SITE_KEY ? "/" : `/${site.key}`;
    return site.key === PRIMARY_SITE_KEY ? `/${slug}` : `/${site.key}/${slug}`;
  };

  return (
    <div>
      <div className="admin-topbar">
        <div>
          <p className="admin-sub" style={{ marginBottom: "0.2rem" }}>
            <Link href="/admin">Vue d&apos;ensemble</Link> /{" "}
            <Link href={`/admin/site/${site.key}`}>{site.name}</Link>
          </p>
          <h1 className="admin-title">Pages & contenus</h1>
          <p className="admin-sub">
            Chaque page est composée de sections modulables. Ajoutez, masquez, réordonnez ou
            supprimez librement.
          </p>
        </div>
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          <Link href={`/admin/site/${site.key}`} className="a-btn">
            Réglages du site
          </Link>
          <a
            href={site.key === PRIMARY_SITE_KEY ? "/" : `/${site.key}`}
            className="a-btn a-btn--ghost"
            target="_blank"
            rel="noreferrer"
          >
            Voir le site ↗
          </a>
        </div>
      </div>

      <section className="admin-card" style={{ marginBottom: "1rem" }}>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Ordre</th>
              <th>Page</th>
              <th>Adresse</th>
              <th>État</th>
              <th style={{ textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {pages.map((page, index) => (
              <tr key={page.id}>
                <td style={{ whiteSpace: "nowrap" }}>
                  <span className="pill pill--muted">{index + 1}</span>
                </td>
                <td>
                  <strong>{page.title}</strong>
                  <br />
                  <span style={{ fontSize: "0.78rem", color: "#5b6678" }}>
                    Menu : {page.navLabel || page.title}
                  </span>
                </td>
                <td>
                  <code style={{ fontSize: "0.78rem" }}>{publicHref(page.slug, page.isHome)}</code>
                </td>
                <td>
                  <div style={{ display: "flex", gap: "0.25rem", flexWrap: "wrap" }}>
                    <span className={`pill ${page.published ? "pill--ok" : "pill--muted"}`}>
                      {page.published ? "Publiée" : "Brouillon"}
                    </span>
                    {page.isHome ? <span className="pill">Accueil</span> : null}
                    {page.inNav ? <span className="pill pill--muted">Dans le menu</span> : null}
                  </div>
                </td>
                <td>
                  <div style={{ display: "flex", gap: "0.3rem", justifyContent: "flex-end", flexWrap: "wrap" }}>
                    <form action={pageCommandFormAction} style={{ display: "flex", gap: "0.25rem" }}>
                      <input type="hidden" name="pageId" value={page.id} />
                      <input type="hidden" name="siteKey" value={site.key} />
                      <button type="submit" name="command" value="up" className="a-btn a-btn--sm" title="Monter">
                        ↑
                      </button>
                      <button type="submit" name="command" value="down" className="a-btn a-btn--sm" title="Descendre">
                        ↓
                      </button>
                      {page.isHome ? null : (
                        <ConfirmSubmit
                          name="command"
                          value="delete"
                          message={`Supprimer la page « ${page.title} » et tous ses contenus ?`}
                        >
                          Supprimer
                        </ConfirmSubmit>
                      )}
                    </form>
                    <a
                      href={publicHref(page.slug, page.isHome)}
                      className="a-btn a-btn--sm a-btn--ghost"
                      target="_blank"
                      rel="noreferrer"
                    >
                      Voir
                    </a>
                    <Link
                      href={`/admin/site/${site.key}/pages/${page.id}`}
                      className="a-btn a-btn--sm a-btn--primary"
                    >
                      Éditer
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="admin-card">
        <h2>Créer une nouvelle page</h2>
        <p className="admin-sub" style={{ marginBottom: "0.8rem" }}>
          La page est créée en brouillon avec une première section « bandeau d&apos;accueil ». Vous
          pourrez la publier quand elle sera prête.
        </p>
        <form action={createPageAction.bind(null, site.id, site.key)}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "0 0.9rem",
            }}
          >
            <div className="field">
              <label htmlFor="new-title">Titre de la page</label>
              <input id="new-title" name="title" className="input" required placeholder="Ex : Nos partenaires" />
            </div>
            <div className="field">
              <label htmlFor="new-nav">Libellé dans le menu</label>
              <input id="new-nav" name="navLabel" className="input" placeholder="Ex : Partenaires" />
            </div>
            <div className="field">
              <label htmlFor="new-slug">Adresse (slug)</label>
              <input id="new-slug" name="slug" className="input" placeholder="partenaires" />
            </div>
          </div>
          <button type="submit" className="a-btn a-btn--primary">
            Créer la page
          </button>
        </form>
      </section>
    </div>
  );
}
