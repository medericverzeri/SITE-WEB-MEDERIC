import Link from "next/link";
import { notFound } from "next/navigation";
import BlockEditor from "@/components/admin/BlockEditor";
import ConfirmSubmit from "@/components/admin/ConfirmSubmit";
import PageMetaForm from "@/components/admin/PageMetaForm";
import { addBlockFormAction, blockCommandFormAction } from "@/app/admin/actions";
import { BLOCK_DEFS, blockDef } from "@/lib/blocks";
import { getAllPages, getPageBlocks, getPageById, getSiteByKey, PRIMARY_SITE_KEY } from "@/lib/data";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ siteKey: string; pageId: string }> };

export default async function PageEditor({ params }: Props) {
  const { siteKey, pageId } = await params;
  const site = await getSiteByKey(siteKey);
  if (!site) notFound();
  const page = await getPageById(Number(pageId));
  if (!page || page.siteId !== site.id) notFound();

  const blocks = await getPageBlocks(page.id);
  const pages = await getAllPages(site.id);
  const otherPages = pages.filter((entry) => entry.id !== page.id);

  const publicHref = page.isHome
    ? site.key === PRIMARY_SITE_KEY
      ? "/"
      : `/${site.key}`
    : site.key === PRIMARY_SITE_KEY
      ? `/${page.slug}`
      : `/${site.key}/${page.slug}`;

  return (
    <div>
      <div className="admin-topbar">
        <div>
          <p className="admin-sub" style={{ marginBottom: "0.2rem" }}>
            <Link href="/admin">Vue d&apos;ensemble</Link> /{" "}
            <Link href={`/admin/site/${site.key}`}>{site.name}</Link> /{" "}
            <Link href={`/admin/site/${site.key}/pages`}>Pages</Link>
          </p>
          <h1 className="admin-title">{page.title}</h1>
          <p className="admin-sub">
            {blocks.length} section{blocks.length > 1 ? "s" : ""} ·{" "}
            {page.published ? "publiée" : "brouillon"} · <code>{publicHref}</code>
          </p>
        </div>
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          <a href={publicHref} className="a-btn" target="_blank" rel="noreferrer">
            Voir la page ↗
          </a>
          <Link href={`/admin/site/${site.key}/pages`} className="a-btn a-btn--ghost">
            Toutes les pages
          </Link>
        </div>
      </div>

      <section className="admin-card" style={{ marginBottom: "1.25rem" }}>
        <h2 style={{ marginBottom: "0.2rem" }}>Réglages de la page</h2>
        <p className="admin-sub" style={{ marginBottom: "0.9rem" }}>
          Titre, adresse, présence dans le menu et référencement.
        </p>
        <PageMetaForm
          page={{
            id: page.id,
            slug: page.slug,
            title: page.title,
            navLabel: page.navLabel,
            seoTitle: page.seoTitle,
            seoDescription: page.seoDescription,
            inNav: page.inNav,
            isHome: page.isHome,
            published: page.published,
          }}
          siteKey={site.key}
        />
      </section>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "0.75rem", flexWrap: "wrap", marginBottom: "0.75rem" }}>
        <div>
          <h2 style={{ fontSize: "1.1rem", fontWeight: 750 }}>Sections de la page</h2>
          <p className="admin-sub">
            L&apos;ordre affiché ici est l&apos;ordre du site public. Une section masquée reste
            éditable mais n&apos;apparaît plus.
          </p>
        </div>
        <span className="pill pill--muted">{blocks.length} sections</span>
      </div>

      <div style={{ display: "grid", gap: "0.85rem" }}>
        {blocks.map((block, index) => {
          const def = blockDef(block.type);
          return (
            <article className="block-card" key={block.id}>
              <div className="block-head">
                <div style={{ display: "flex", alignItems: "center", gap: "0.55rem", flexWrap: "wrap" }}>
                  <span className="pill pill--muted">{index + 1}</span>
                  <strong>
                    {def?.icon ?? "◻"} {def?.label ?? block.type}
                  </strong>
                  <span className={`pill ${block.visible ? "pill--ok" : "pill--warn"}`}>
                    {block.visible ? "Visible" : "Masquée"}
                  </span>
                </div>
                <form action={blockCommandFormAction} style={{ display: "flex", gap: "0.25rem", flexWrap: "wrap" }}>
                  <input type="hidden" name="blockId" value={block.id} />
                  <button type="submit" name="command" value="up" className="a-btn a-btn--sm" title="Monter la section">
                    ↑
                  </button>
                  <button type="submit" name="command" value="down" className="a-btn a-btn--sm" title="Descendre la section">
                    ↓
                  </button>
                  <button type="submit" name="command" value="toggle" className="a-btn a-btn--sm">
                    {block.visible ? "Masquer" : "Afficher"}
                  </button>
                  <button type="submit" name="command" value="duplicate" className="a-btn a-btn--sm">
                    Dupliquer
                  </button>
                  <ConfirmSubmit
                    name="command"
                    value="delete"
                    message="Supprimer définitivement cette section ?"
                  >
                    Supprimer
                  </ConfirmSubmit>
                </form>
              </div>
              {def ? (
                <BlockEditor blockId={block.id} def={def} initialData={block.data} />
              ) : (
                <div className="block-body">
                  <p className="admin-sub">
                    Type de section inconnu ({block.type}). Vous pouvez la supprimer.
                  </p>
                </div>
              )}
            </article>
          );
        })}
      </div>

      <section className="admin-card" style={{ marginTop: "1.25rem" }}>
        <h2>Ajouter une section</h2>
        <p className="admin-sub" style={{ marginBottom: "0.8rem" }}>
          La section est ajoutée en bas de page, prête à être remplie.
        </p>
        <form action={addBlockFormAction.bind(null, page.id)} style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          <select name="type" className="select" style={{ maxWidth: 340 }} defaultValue="features">
            {BLOCK_DEFS.map((def) => (
              <option key={def.type} value={def.type}>
                {def.icon} {def.label} — {def.description}
              </option>
            ))}
          </select>
          <button type="submit" className="a-btn a-btn--primary">
            + Ajouter la section
          </button>
        </form>
      </section>

      {otherPages.length > 0 ? (
        <section className="admin-card" style={{ marginTop: "1rem" }}>
          <h2>Éditer une autre page</h2>
          <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", marginTop: "0.6rem" }}>
            {otherPages.map((entry) => (
              <Link
                key={entry.id}
                href={`/admin/site/${site.key}/pages/${entry.id}`}
                className="a-btn a-btn--sm"
              >
                {entry.title}
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
