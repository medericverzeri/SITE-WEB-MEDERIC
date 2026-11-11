"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updatePageAction, type ActionResult } from "@/app/admin/actions";

export type PageMetaValues = {
  id: number;
  slug: string;
  title: string;
  navLabel: string;
  seoTitle: string;
  seoDescription: string;
  inNav: boolean;
  isHome: boolean;
  published: boolean;
};

export default function PageMetaForm({
  page,
  siteKey,
}: {
  page: PageMetaValues;
  siteKey: string;
}) {
  const router = useRouter();
  const [values, setValues] = useState({
    title: page.title,
    navLabel: page.navLabel,
    slug: page.slug,
    seoTitle: page.seoTitle,
    seoDescription: page.seoDescription,
    inNav: page.inNav,
    isHome: page.isHome,
    published: page.published,
  });
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<ActionResult | null>(null);

  const set = (name: string, value: string | boolean) =>
    setValues((current) => ({ ...current, [name]: value }));

  const handleSave = () => {
    setResult(null);
    startTransition(async () => {
      const answer = await updatePageAction(page.id, siteKey, JSON.stringify(values));
      setResult(answer);
      router.refresh();
    });
  };

  return (
    <div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
          gap: "0 0.9rem",
        }}
      >
        <div className="field">
          <label>Titre de la page</label>
          <input className="input" value={values.title} onChange={(e) => set("title", e.target.value)} />
        </div>
        <div className="field">
          <label>Libellé dans le menu</label>
          <input className="input" value={values.navLabel} onChange={(e) => set("navLabel", e.target.value)} />
        </div>
        <div className="field">
          <label>Adresse (slug)</label>
          <input className="input" value={values.slug} onChange={(e) => set("slug", e.target.value)} />
          <span className="hint">
            Adresse publique : /{siteKey === "encadrant" ? "" : `${siteKey}/`}
            {values.slug}
          </span>
        </div>
        <div className="field">
          <label>Titre SEO</label>
          <input className="input" value={values.seoTitle} onChange={(e) => set("seoTitle", e.target.value)} />
        </div>
        <div className="field" style={{ gridColumn: "1 / -1" }}>
          <label>Description SEO</label>
          <textarea
            className="textarea"
            style={{ minHeight: 70 }}
            value={values.seoDescription}
            onChange={(e) => set("seoDescription", e.target.value)}
          />
        </div>
      </div>

      <div style={{ display: "flex", gap: "1.1rem", flexWrap: "wrap", margin: "0.2rem 0 1rem" }}>
        <label style={{ display: "flex", gap: "0.45rem", alignItems: "center", fontSize: "0.85rem" }}>
          <input type="checkbox" checked={values.inNav} onChange={(e) => set("inNav", e.target.checked)} />
          Afficher dans le menu
        </label>
        <label style={{ display: "flex", gap: "0.45rem", alignItems: "center", fontSize: "0.85rem" }}>
          <input type="checkbox" checked={values.isHome} onChange={(e) => set("isHome", e.target.checked)} />
          Page d&apos;accueil du site
        </label>
        <label style={{ display: "flex", gap: "0.45rem", alignItems: "center", fontSize: "0.85rem" }}>
          <input type="checkbox" checked={values.published} onChange={(e) => set("published", e.target.checked)} />
          Page publiée
        </label>
      </div>

      <div style={{ display: "flex", gap: "0.7rem", alignItems: "center", flexWrap: "wrap" }}>
        <button type="button" className="a-btn a-btn--primary" onClick={handleSave} disabled={pending}>
          {pending ? "Enregistrement…" : "Enregistrer la page"}
        </button>
        {result ? (
          <span className={`pill ${result.ok ? "pill--ok" : "pill--warn"}`} role="status">
            {result.message}
          </span>
        ) : null}
      </div>
    </div>
  );
}
