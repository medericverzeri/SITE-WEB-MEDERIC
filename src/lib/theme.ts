import type { CSSProperties } from "react";

type ColorSite = { primaryColor: string; accentColor: string };

const HEX = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i;

export function normalizeHex(input: string, fallback: string): string {
  const value = (input ?? "").trim();
  if (!HEX.test(value)) return fallback;
  const raw = value.replace("#", "");
  if (raw.length === 3) {
    return `#${raw
      .split("")
      .map((c) => c + c)
      .join("")}`.toLowerCase();
  }
  return `#${raw.toLowerCase()}`;
}

function toRgb(hex: string): [number, number, number] {
  const clean = normalizeHex(hex, "#000000").replace("#", "");
  return [
    parseInt(clean.slice(0, 2), 16),
    parseInt(clean.slice(2, 4), 16),
    parseInt(clean.slice(4, 6), 16),
  ];
}

function toHex(rgb: [number, number, number]): string {
  return `#${rgb
    .map((channel) => Math.max(0, Math.min(255, Math.round(channel))).toString(16).padStart(2, "0"))
    .join("")}`;
}

export function mix(color: string, target: string, weight: number): string {
  const a = toRgb(color);
  const b = toRgb(target);
  const w = Math.max(0, Math.min(1, weight));
  return toHex([
    a[0] * (1 - w) + b[0] * w,
    a[1] * (1 - w) + b[1] * w,
    a[2] * (1 - w) + b[2] * w,
  ]);
}

function luminance(hex: string): number {
  const [r, g, b] = toRgb(hex).map((channel) => {
    const c = channel / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrastRatio(a: string, b: string): number {
  const la = luminance(a);
  const lb = luminance(b);
  const lighter = Math.max(la, lb);
  const darker = Math.min(la, lb);
  return (lighter + 0.05) / (darker + 0.05);
}

/** Choisit un texte blanc ou encre selon le contraste réel (WCAG AA). */
export function readableOn(background: string): string {
  const white = "#ffffff";
  const ink = "#0b1220";
  return contrastRatio(background, white) >= contrastRatio(background, ink) ? white : ink;
}

/**
 * Variables CSS injectées par site : les couleurs choisies dans l'admin
 * pilotent réellement le site, avec des teintes calculées pour rester lisibles.
 */
export function themeStyle(site: ColorSite): CSSProperties {
  const brand = normalizeHex(site.primaryColor, "#0f766e");
  const accent = normalizeHex(site.accentColor, "#f59e0b");
  // On assombrit la couleur si elle est trop claire pour du texte.
  const brandInk = contrastRatio(brand, "#ffffff") >= 4.5 ? brand : mix(brand, "#0b1220", 0.55);
  return {
    "--brand": brand,
    "--brand-ink": brandInk,
    "--brand-soft": mix(brand, "#ffffff", 0.9),
    "--brand-softer": mix(brand, "#ffffff", 0.95),
    "--brand-deep": mix(brand, "#04110f", 0.55),
    "--on-brand": readableOn(brand),
    "--accent": accent,
    "--accent-ink": contrastRatio(accent, "#ffffff") >= 4.5 ? accent : mix(accent, "#0b1220", 0.6),
    "--accent-soft": mix(accent, "#ffffff", 0.86),
    "--on-accent": readableOn(accent),
  } as CSSProperties;
}

/** Préfixe les liens internes pour un site hébergé sur /un-sous-dossier. */
export function siteLinker(basePath: string) {
  return (href: string): string => {
    const value = (href ?? "").trim();
    if (!value) return basePath || "/";
    if (/^(https?:|mailto:|tel:|#)/i.test(value)) return value;
    if (!value.startsWith("/")) return `${basePath}/${value}` || "/";
    if (!basePath) return value;
    if (value === basePath || value.startsWith(`${basePath}/`)) return value;
    return `${basePath}${value === "/" ? "" : value}`;
  };
}
