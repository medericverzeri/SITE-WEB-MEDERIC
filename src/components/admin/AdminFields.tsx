"use client";

import { useState } from "react";
import { IMAGE_LIBRARY } from "@/lib/images";

export function ImagePicker({
  value,
  onChange,
  label,
  hint,
}: {
  value: string;
  onChange: (next: string) => void;
  label: string;
  hint?: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="field">
      <label>{label}</label>
      <input
        className="input"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="https://… ou /images/photo.jpg"
      />
      {value ? (
        <img src={value} alt="Aperçu" className="image-preview" style={{ marginTop: "0.35rem" }} />
      ) : null}
      <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
        <button type="button" className="a-btn a-btn--sm" onClick={() => setOpen((prev) => !prev)}>
          {open ? "Masquer la bibliothèque" : "Choisir une image"}
        </button>
        {value ? (
          <button type="button" className="a-btn a-btn--sm a-btn--ghost" onClick={() => onChange("")}>
            Retirer
          </button>
        ) : null}
      </div>
      {open ? (
        <div className="image-library">
          {IMAGE_LIBRARY.map((image) => (
            <button
              key={image.url}
              type="button"
              title={image.label}
              onClick={() => {
                onChange(image.url);
                setOpen(false);
              }}
            >
              <img src={image.url} alt={image.label} />
            </button>
          ))}
        </div>
      ) : null}
      {hint ? <span className="hint">{hint}</span> : null}
    </div>
  );
}

export function ColorField({
  label,
  value,
  onChange,
  hint,
}: {
  label: string;
  value: string;
  onChange: (next: string) => void;
  hint?: string;
}) {
  return (
    <div className="field">
      <label>{label}</label>
      <div className="color-input">
        <input
          type="color"
          aria-label={`${label} — sélecteur`}
          value={/^#[0-9a-f]{6}$/i.test(value) ? value : "#0f766e"}
          onChange={(event) => onChange(event.target.value)}
        />
        <input
          className="input"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="#0f766e"
        />
      </div>
      {hint ? <span className="hint">{hint}</span> : null}
    </div>
  );
}
