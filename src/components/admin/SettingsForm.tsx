"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { saveSiteSettingsAction, type ActionResult } from "@/app/admin/actions";
import { ColorField, ImagePicker } from "./AdminFields";
import ScheduleEditor from "./ScheduleEditor";
import type { ScheduleData } from "@/db/schema";

export type SiteSettingsValues = {
  id: number;
  name: string;
  shortName: string;
  role: string;
  tagline: string;
  logoMark: string;
  primaryColor: string;
  accentColor: string;
  heroImageUrl: string;
  contactEmail: string;
  contactPhone: string;
  notificationEmail: string;
  address: string;
  openingHours: string;
  schedule: unknown;
  statusOverride: string;
  statusNoteOpen: string;
  statusNoteClosed: string;
  photoUrl: string;
  photoAlt: string;
  photoName: string;
  photoRole: string;
  marqueeEnabled: boolean;
  marqueeText: string;
  marqueeSpeed: string;
  navLinksText: string;
  textureUrl: string;
  footerNote: string;
  legalNote: string;
  ctaLabel: string;
  ctaHref: string;
  bannerEnabled: boolean;
  bannerText: string;
  bannerHref: string;
  seoTitle: string;
  seoDescription: string;
};

type FieldCfg = {
  name: keyof SiteSettingsValues;
  label: string;
  type: "text" | "textarea" | "image" | "color" | "bool" | "select" | "schedule";
  options?: { value: string; label: string }[];
  hint?: string;
  full?: boolean;
  placeholder?: string;
};

const SECTIONS: { title: string; description: string; fields: FieldCfg[] }[] = [
  {
    title: "Identité de la structure",
    description:
      "Le nom, le rôle et la signature affichés dans l'en-tête, le pied de page et les onglets du navigateur.",
    fields: [
      { name: "name", label: "Nom du site / de la structure", type: "text", placeholder: "Horizon Insertion" },
      { name: "shortName", label: "Nom court", type: "text" },
      { name: "role", label: "Sous-titre (votre fonction)", type: "text", placeholder: "Encadrant technique en insertion" },
      { name: "logoMark", label: "Monogramme du logo", type: "text", hint: "2 à 3 lettres, affichées dans le carré coloré.", placeholder: "HI" },
      { name: "tagline", label: "Slogan", type: "text", full: true },
      { name: "primaryColor", label: "Couleur principale", type: "color", hint: "Le contraste du texte est calculé automatiquement pour rester lisible." },
      { name: "accentColor", label: "Couleur d'accent", type: "color" },
      { name: "heroImageUrl", label: "Image de partage / par défaut", type: "image", full: true },
    ],
  },
  {
    title: "Contact & réception des demandes",
    description:
      "L'e-mail de réception reçoit chaque message envoyé depuis le site. Le formulaire enregistre aussi la demande dans l'espace admin.",
    fields: [
      { name: "notificationEmail", label: "E-mail de réception des demandes", type: "text", hint: "Ex : m.verzeri@eco-solidaire.fr", full: true },
      { name: "contactEmail", label: "E-mail affiché sur le site", type: "text" },
      { name: "contactPhone", label: "Téléphone", type: "text" },
      { name: "openingHours", label: "Horaires (texte affiché)", type: "text", full: true },
      { name: "address", label: "Adresse", type: "textarea", full: true },
    ],
  },
  {
    title: "Photo & disponibilité (vert / rouge)",
    description:
      "Votre photo sur la page d'accueil porte un statut vert quand vous êtes disponible et rouge quand c'est fermé.",
    fields: [
      { name: "photoUrl", label: "Votre photo", type: "image", full: true },
      { name: "photoAlt", label: "Description de la photo", type: "text", full: true },
      { name: "photoName", label: "Nom affiché sous la photo", type: "text" },
      { name: "photoRole", label: "Fonction affichée", type: "text" },
      { name: "statusOverride", label: "Statut", type: "select", options: [
        { value: "auto", label: "Automatique (selon les horaires)" },
        { value: "open", label: "Forcer vert — ouvert" },
        { value: "closed", label: "Forcer rouge — fermé" },
      ] },
      { name: "statusNoteOpen", label: "Message quand c'est ouvert", type: "text" },
      { name: "statusNoteClosed", label: "Message quand c'est fermé", type: "text" },
      { name: "schedule", label: "Horaires d'ouverture", type: "schedule", full: true },
    ],
  },
  {
    title: "Bandeau défilant",
    description:
      "Le bandeau qui défile sous l'en-tête affiche toujours le statut et les horaires. Ajoutez ici vos messages (séparés par « · »).",
    fields: [
      { name: "marqueeEnabled", label: "Afficher le bandeau", type: "bool" },
      { name: "marqueeSpeed", label: "Vitesse de défilement", type: "select", options: [
        { value: "slow", label: "Lente (lisible)" },
        { value: "normal", label: "Normale" },
        { value: "fast", label: "Rapide" },
      ] },
      { name: "marqueeText", label: "Messages additionnels", type: "text", full: true, hint: "Ex : Dépôts pros sur rendez-vous · Fermeture exceptionnelle le 15 août" },
    ],
  },
  {
    title: "Menu du site & fond",
    description:
      "Un lien par ligne, au format « Libellé | adresse ». Chaque onglet mène à une page : /a-propos, /nos-entreprises, /galerie ou /contact. Pour pointer vers l'autre site, commencez par !/ (ex : !/developpement).",
    fields: [
      { name: "navLinksText", label: "Liens du menu", type: "textarea", full: true, hint: "Laissez vide pour générer le menu automatiquement à partir des pages." },
      { name: "textureUrl", label: "Texture de fond (optionnelle)", type: "image", full: true },
    ],
  },
  {
    title: "Bandeau d'information",
    description: "Une annonce affichée en haut de toutes les pages (recrutement, événement…).",
    fields: [
      { name: "bannerEnabled", label: "Afficher le bandeau", type: "bool" },
      { name: "bannerText", label: "Texte de l'annonce", type: "text", full: true },
      { name: "bannerHref", label: "Lien de l'annonce", type: "text", hint: "Ex : /contact" },
    ],
  },
  {
    title: "Bouton principal & pied de page",
    description: "L'appel à l'action présent dans l'en-tête et les mentions affichées en bas de page.",
    fields: [
      { name: "ctaLabel", label: "Bouton d'en-tête — texte", type: "text" },
      { name: "ctaHref", label: "Bouton d'en-tête — lien", type: "text" },
      { name: "footerNote", label: "Texte de présentation du pied de page", type: "textarea", full: true },
      { name: "legalNote", label: "Mention légale courte (pied de page)", type: "text", full: true },
    ],
  },
  {
    title: "Référencement (SEO) & partage",
    description: "Titre et description affichés dans Google et lors du partage du lien.",
    fields: [
      { name: "seoTitle", label: "Titre SEO", type: "text", full: true },
      { name: "seoDescription", label: "Description SEO", type: "textarea", full: true },
    ],
  },
];

export default function SettingsForm({ site }: { site: SiteSettingsValues }) {
  const router = useRouter();
  const [values, setValues] = useState<Record<string, string | boolean>>(() => {
    const initial: Record<string, string | boolean> = {};
    for (const field of SECTIONS.flatMap((section) => section.fields)) {
      const raw = site[field.name];
      initial[field.name] = typeof raw === "boolean" ? raw : String(raw ?? "");
    }
    return initial;
  });
  const [schedule, setSchedule] = useState<ScheduleData | null>(
    (site.schedule as ScheduleData | null) ?? null,
  );
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<ActionResult | null>(null);

  const set = (name: string, value: string | boolean) =>
    setValues((current) => ({ ...current, [name]: value }));

  const handleSave = () => {
    setResult(null);
    startTransition(async () => {
      const answer = await saveSiteSettingsAction(
        site.id,
        JSON.stringify({ ...values, schedule }),
      );
      setResult(answer);
      router.refresh();
    });
  };

  const primary = String(values.primaryColor ?? "#0f766e");
  const accent = String(values.accentColor ?? "#f59e0b");

  return (
    <div>
      <div
        className="admin-card"
        style={{ display: "flex", gap: "1rem", alignItems: "center", flexWrap: "wrap", marginBottom: "1rem" }}
      >
        <span
          style={{
            display: "grid",
            placeItems: "center",
            width: 54,
            height: 54,
            borderRadius: 15,
            background: primary,
            color: "#fff",
            fontWeight: 800,
            flex: "none",
          }}
        >
          {String(values.logoMark ?? "HI") || "HI"}
        </span>
        <div style={{ minWidth: 0 }}>
          <strong style={{ display: "block" }}>{String(values.name ?? "")}</strong>
          <span style={{ fontSize: "0.85rem", color: "#5b6678" }}>
            {String(values.role ?? "")} · aperçu du thème
          </span>
        </div>
        <div style={{ display: "flex", gap: "0.4rem", marginLeft: "auto" }}>
          <span style={{ width: 26, height: 26, borderRadius: 999, background: primary }} title="Couleur principale" />
          <span style={{ width: 26, height: 26, borderRadius: 999, background: accent }} title="Couleur d'accent" />
        </div>
      </div>

      {SECTIONS.map((section) => (
        <section className="admin-card" key={section.title} style={{ marginBottom: "1rem" }}>
          <h2 style={{ marginBottom: "0.2rem" }}>{section.title}</h2>
          <p className="admin-sub" style={{ marginBottom: "0.9rem" }}>
            {section.description}
          </p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "0 0.9rem",
            }}
          >
            {section.fields.map((field) => {
              const value = values[field.name];
              const full = field.full ? { gridColumn: "1 / -1" } : undefined;

              if (field.type === "bool") {
                return (
                  <div className="field" key={field.name} style={full}>
                    <label style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                      <input
                        type="checkbox"
                        checked={value === true}
                        onChange={(event) => set(field.name, event.target.checked)}
                      />
                      {field.label}
                    </label>
                  </div>
                );
              }

              if (field.type === "image") {
                return (
                  <div key={field.name} style={full}>
                    <ImagePicker
                      label={field.label}
                      value={String(value ?? "")}
                      onChange={(next) => set(field.name, next)}
                      hint={field.hint}
                    />
                  </div>
                );
              }

              if (field.type === "color") {
                return (
                  <ColorField
                    key={field.name}
                    label={field.label}
                    value={String(value ?? "")}
                    onChange={(next) => set(field.name, next)}
                    hint={field.hint}
                  />
                );
              }

              if (field.type === "schedule") {
                return (
                  <div key={field.name} style={full}>
                    <ScheduleEditor value={schedule} onChange={setSchedule} />
                  </div>
                );
              }

              if (field.type === "select") {
                return (
                  <div className="field" key={field.name} style={full}>
                    <label>{field.label}</label>
                    <select
                      className="select"
                      value={String(value ?? "")}
                      onChange={(event) => set(field.name, event.target.value)}
                    >
                      {(field.options ?? []).map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    {field.hint ? <span className="hint">{field.hint}</span> : null}
                  </div>
                );
              }

              if (field.type === "textarea") {
                return (
                  <div className="field" key={field.name} style={full}>
                    <label>{field.label}</label>
                    <textarea
                      className="textarea"
                      value={String(value ?? "")}
                      onChange={(event) => set(field.name, event.target.value)}
                    />
                    {field.hint ? <span className="hint">{field.hint}</span> : null}
                  </div>
                );
              }

              return (
                <div className="field" key={field.name} style={full}>
                  <label>{field.label}</label>
                  <input
                    className="input"
                    value={String(value ?? "")}
                    placeholder={field.placeholder}
                    onChange={(event) => set(field.name, event.target.value)}
                  />
                  {field.hint ? <span className="hint">{field.hint}</span> : null}
                </div>
              );
            })}
          </div>
        </section>
      ))}

      <div
        style={{
          position: "sticky",
          bottom: 0,
          background: "#f6f7fb",
          padding: "0.85rem 0",
          display: "flex",
          gap: "0.7rem",
          alignItems: "center",
          flexWrap: "wrap",
          borderTop: "1px solid #e2e8f0",
        }}
      >
        <button type="button" className="a-btn a-btn--primary" onClick={handleSave} disabled={pending}>
          {pending ? "Enregistrement…" : "Enregistrer les réglages"}
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
