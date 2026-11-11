import Link from "next/link";
import { notFound } from "next/navigation";
import ConfirmSubmit from "@/components/admin/ConfirmSubmit";
import SettingsForm from "@/components/admin/SettingsForm";
import { resetSiteAction } from "@/app/admin/actions";
import { getSiteByKey, PRIMARY_SITE_KEY } from "@/lib/data";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ siteKey: string }>;
  searchParams: Promise<{ reset?: string }>;
};

export default async function SiteSettingsPage({ params, searchParams }: Props) {
  const { siteKey } = await params;
  const { reset } = await searchParams;
  const site = await getSiteByKey(siteKey);
  if (!site) notFound();

  const publicHref = site.key === PRIMARY_SITE_KEY ? "/" : `/${site.key}`;
  const mailerReady = Boolean(process.env.RESEND_API_KEY?.trim());

  return (
    <div>
      <div className="admin-topbar">
        <div>
          <p className="admin-sub" style={{ marginBottom: "0.2rem" }}>
            <Link href="/admin">Vue d&apos;ensemble</Link> / {site.name}
          </p>
          <h1 className="admin-title">Réglages & identité</h1>
          <p className="admin-sub">
            {site.tagline || "Nom, couleurs, coordonnées, bandeau, bouton principal et référencement."}
          </p>
        </div>
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          <a href={publicHref} className="a-btn" target="_blank" rel="noreferrer">
            Voir le site ↗
          </a>
          <Link href={`/admin/site/${site.key}/pages`} className="a-btn a-btn--primary">
            Pages & contenus
          </Link>
        </div>
      </div>

      {reset ? (
        <p className="pill pill--ok" style={{ marginBottom: "1rem" }}>
          Les contenus d&apos;origine de ce site ont été restaurés.
        </p>
      ) : null}

      <section
        className="admin-card"
        style={{
          marginBottom: "1rem",
          borderColor: mailerReady ? "#bbf7d0" : "#fde68a",
          background: mailerReady ? "#f0fdf4" : "#fffbeb",
        }}
      >
        <h2 style={{ fontSize: "0.98rem" }}>
          {mailerReady ? "✅ Envoi d'e-mails activé" : "✉ Recevoir les demandes par e-mail"}
        </h2>
        <p className="admin-sub" style={{ marginTop: "0.35rem" }}>
          {mailerReady
            ? `Chaque message du formulaire est envoyé à ${site.notificationEmail || site.contactEmail}.`
            : `Les demandes sont enregistrées et visibles dans « Messages ». Pour les recevoir aussi par e-mail à ${site.notificationEmail || site.contactEmail}, ajoutez une clé Resend gratuite (variable RESEND_API_KEY) sur Vercel. Le bouton « Écrire directement » du site fonctionne déjà sans configuration.`}
        </p>
      </section>

      <SettingsForm
        site={{
          ...site,
          navLinksText: site.navLinks.map((entry) => `${entry.label} | ${entry.href}`).join("\n"),
        }}
      />

      <section className="admin-card" style={{ marginTop: "1.5rem", borderColor: "#fecaca" }}>
        <h2 style={{ color: "#b91c1c" }}>Zone sensible</h2>
        <p className="admin-sub" style={{ marginBottom: "0.8rem" }}>
          Restaurer les contenus d&apos;origine supprime toutes les personnalisations de ce site
          (pages, textes, images). Les messages reçus sont également supprimés. Cette action est
          irréversible.
        </p>
        <form action={resetSiteAction.bind(null, site.id, site.key)}>
          <ConfirmSubmit
            message={`Restaurer le site « ${site.name} » ? Toutes vos modifications seront perdues.`}
            className="a-btn a-btn--danger"
          >
            Restaurer les contenus d&apos;origine
          </ConfirmSubmit>
        </form>
      </section>
    </div>
  );
}
