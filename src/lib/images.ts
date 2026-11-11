import { REF_IMAGES, REF_LABELS } from "@/lib/media";

export type LibraryImage = { label: string; url: string; group: string };

const mine: LibraryImage[] = Object.entries(REF_IMAGES).map(([id, url]) => {
  const label = REF_LABELS[id] ?? id;
  const isLogo = /^logo|pictogramme/i.test(label) || id === "batire-logo";
  const isAlbum = /^album|dépose|croquis|barrières|Déchèt'Lab —|Matériosol —/i.test(label);
  return {
    label,
    url,
    group: isLogo ? "Mes logos" : isAlbum ? "Mes photos — chantiers & Déchèt'Lab" : "Mes visuels — entreprises du groupe",
  };
});

const pexels = (id: number, label: string, group: string): LibraryImage => ({
  label,
  group,
  url: `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=900&w=1400`,
});

/** Bibliothèque proposée dans l'admin : un clic pour illustrer un bloc. */
export const IMAGE_LIBRARY: LibraryImage[] = [
  ...mine.sort((a, b) => a.group.localeCompare(b.group, "fr")),
  pexels(9051255, "Atelier menuiserie (duo)", "Banque d'images"),
  pexels(7484164, "Atelier bois & outils", "Banque d'images"),
  pexels(6790033, "Travail en atelier", "Banque d'images"),
  pexels(7728706, "Espaces verts — brouette", "Banque d'images"),
  pexels(4920244, "Espaces verts — plantation", "Banque d'images"),
  pexels(7222304, "Rendez-vous professionnel", "Banque d'images"),
  pexels(7108210, "Réunion de travail", "Banque d'images"),
  pexels(34406294, "Tri des déchets / recyclage", "Banque d'images"),
  pexels(5505699, "Contenants & matériaux", "Banque d'images"),
];
