"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { saveBlockAction, type ActionResult } from "@/app/admin/actions";
import { items as readItems, listsOf, type BlockDef, type FieldDef, type Item } from "@/lib/blocks";
import { ColorField, ImagePicker } from "./AdminFields";

type Props = {
  blockId: number;
  def: BlockDef;
  initialData: Record<string, unknown>;
};

function initialValues(def: BlockDef, data: Record<string, unknown>): Record<string, string> {
  const values: Record<string, string> = {};
  for (const field of def.fields) {
    const raw = data?.[field.name];
    if (Array.isArray(raw)) values[field.name] = raw.map((entry) => String(entry)).join("\n");
    else if (typeof raw === "string") values[field.name] = raw;
    else if (typeof raw === "number" || typeof raw === "boolean") values[field.name] = String(raw);
    else values[field.name] = "";
  }
  return values;
}

function emptyItem(fields: FieldDef[]): Item {
  const item: Item = {};
  for (const field of fields) {
    item[field.name] = field.type === "select" ? (field.options?.[0]?.value ?? "") : "";
  }
  return item;
}

export default function BlockEditor({ blockId, def, initialData }: Props) {
  const router = useRouter();
  const lists = listsOf(def);
  const [values, setValues] = useState<Record<string, string>>(() => initialValues(def, initialData));
  const [data, setData] = useState<Record<string, Item[]>>(() =>
    Object.fromEntries(lists.map((list) => [list.key, readItems(initialData, list.key)])),
  );
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<ActionResult | null>(null);

  const set = (name: string, value: string) =>
    setValues((current) => ({ ...current, [name]: value }));

  const updateList = (key: string, updater: (current: Item[]) => Item[]) =>
    setData((current) => ({ ...current, [key]: updater(current[key] ?? []) }));

  const setItem = (key: string, index: number, name: string, value: string) =>
    updateList(key, (current) =>
      current.map((entry, position) => (position === index ? { ...entry, [name]: value } : entry)),
    );

  const moveItem = (key: string, index: number, direction: number) =>
    updateList(key, (current) => {
      const target = index + direction;
      if (target < 0 || target >= current.length) return current;
      const copy = [...current];
      [copy[index], copy[target]] = [copy[target], copy[index]];
      return copy;
    });

  const removeItem = (key: string, index: number) =>
    updateList(key, (current) => current.filter((_, position) => position !== index));

  const handleSave = () => {
    const payload: Record<string, unknown> = { ...values };
    for (const list of lists) payload[list.key] = data[list.key] ?? [];
    setResult(null);
    startTransition(async () => {
      const answer = await saveBlockAction(blockId, JSON.stringify(payload));
      setResult(answer);
      router.refresh();
    });
  };

  const renderField = (field: FieldDef, value: string, onChange: (next: string) => void) => {
    if (field.type === "image") {
      return (
        <div key={field.name} style={{ gridColumn: "1 / -1" }}>
          <ImagePicker label={field.label} value={value} onChange={onChange} hint={field.help} />
        </div>
      );
    }
    if (field.type === "color") {
      return (
        <ColorField
          key={field.name}
          label={field.label}
          value={value}
          onChange={onChange}
          hint={field.help}
        />
      );
    }
    if (field.type === "textarea" || field.type === "lines") {
      return (
        <div className="field" key={field.name} style={{ gridColumn: field.full ? "1 / -1" : undefined }}>
          <label>{field.label}</label>
          <textarea
            className="textarea"
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder={field.placeholder}
          />
          {field.help ? <span className="hint">{field.help}</span> : null}
        </div>
      );
    }
    if (field.type === "select") {
      return (
        <div className="field" key={field.name}>
          <label>{field.label}</label>
          <select className="select" value={value} onChange={(event) => onChange(event.target.value)}>
            {(field.options ?? []).map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {field.help ? <span className="hint">{field.help}</span> : null}
        </div>
      );
    }
    return (
      <div className="field" key={field.name} style={{ gridColumn: field.full ? "1 / -1" : undefined }}>
        <label>{field.label}</label>
        <input
          className="input"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={field.placeholder}
        />
        {field.help ? <span className="hint">{field.help}</span> : null}
      </div>
    );
  };

  return (
    <div className="block-body">
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
          gap: "0 0.9rem",
        }}
      >
        {def.fields.map((field) =>
          renderField(field, values[field.name] ?? "", (next) => set(field.name, next)),
        )}
      </div>

      {lists.map((list) => {
        const entries = data[list.key] ?? [];
        return (
          <div key={list.key} style={{ marginTop: "0.9rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <p style={{ fontSize: "0.82rem", fontWeight: 700, color: "#334155" }}>
                {list.label} ({entries.length})
              </p>
              <button
                type="button"
                className="a-btn a-btn--sm"
                onClick={() => updateList(list.key, (current) => [...current, emptyItem(list.fields)])}
              >
                + Ajouter
              </button>
            </div>

            {entries.map((entry, index) => (
              <div className="item-card" key={`${list.key}-${index}`}>
                <div className="item-head">
                  <span>
                    {list.label} {index + 1}
                    {list.titleField && entry[list.titleField]
                      ? ` — ${entry[list.titleField].replace(/\s+/g, " ").slice(0, 48)}`
                      : ""}
                  </span>
                  <span style={{ display: "flex", gap: "0.25rem" }}>
                    <button
                      type="button"
                      className="a-btn a-btn--sm a-btn--ghost"
                      onClick={() => moveItem(list.key, index, -1)}
                      aria-label="Monter"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      className="a-btn a-btn--sm a-btn--ghost"
                      onClick={() => moveItem(list.key, index, 1)}
                      aria-label="Descendre"
                    >
                      ↓
                    </button>
                    <button
                      type="button"
                      className="a-btn a-btn--sm a-btn--danger"
                      onClick={() => removeItem(list.key, index)}
                      aria-label="Supprimer"
                    >
                      ✕
                    </button>
                  </span>
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
                    gap: "0 0.8rem",
                  }}
                >
                  {list.fields.map((field) =>
                    renderField(field, entry[field.name] ?? "", (next) =>
                      setItem(list.key, index, field.name, next),
                    ),
                  )}
                </div>
              </div>
            ))}
            {entries.length === 0 ? (
              <p className="hint" style={{ margin: "0.4rem 0 0.8rem" }}>
                Aucun élément pour l&apos;instant : ajoutez-en un pour qu&apos;il s&apos;affiche.
              </p>
            ) : null}
          </div>
        );
      })}

      <div
        style={{
          display: "flex",
          gap: "0.6rem",
          alignItems: "center",
          flexWrap: "wrap",
          marginTop: "0.8rem",
        }}
      >
        <button type="button" className="a-btn a-btn--primary" onClick={handleSave} disabled={pending}>
          {pending ? "Enregistrement…" : "Enregistrer ce bloc"}
        </button>
        {result ? (
          <span className={`pill ${result.ok ? "pill--ok" : "pill--warn"}`} role="status">
            {result.message}
          </span>
        ) : (
          <span className="hint">Les modifications sont visibles sur le site dès l&apos;enregistrement.</span>
        )}
      </div>
    </div>
  );
}
