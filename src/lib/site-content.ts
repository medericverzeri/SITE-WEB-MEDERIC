import type { BlockData } from "@/db/schema";
import { DECHETLAB_TOPICS } from "@/lib/dechetlab-info";

export type RequestContact = {
  scope: string;
  name: string;
  description: string;
  email: string;
  phone: string;
};

export const REQUEST_CONTACTS: RequestContact[] = [
  {
    scope: "Exploitation, déchets et inscription",
    name: "Médéric Verzeri",
    description: "Pour toute question relative à l’exploitation du Déchèt’Lab, à la gestion de vos déchets ou aux modalités d’inscription, contactez Médéric.",
    email: "m.verzeri@eco-solidaire.fr",
    phone: "06 10 50 87 83",
  },
  {
    scope: "Développement",
    name: "Lydia Charpentier",
    description: "Pour toute question concernant le développement, contactez Lydia.",
    email: "l.charpentier@eco-solidaire.fr",
    phone: "06 09 88 36 47",
  },
];

export const MAIN_NAVIGATION = [
  { label: "Accueil", href: "/" },
  { label: "À propos de moi", href: "/a-propos" },
  { label: "Nos entreprises", href: "/nos-entreprises" },
  { label: "Galerie", href: "/galerie" },
  { label: "Contactez-nous", href: "/contact" },
];

export const MULTIPAGE_SECTIONS = [
  { slug: "a-propos", title: "À propos de moi", types: ["aboutMe", "activities"], description: "Présentation et missions : encadrement, économie circulaire, réemploi et formation." },
  { slug: "nos-entreprises", title: "Nos entreprises", types: ["companies"], description: "Découvrez les entreprises du groupe, leurs activités et leurs sites officiels." },
  { slug: "galerie", title: "Galerie", types: ["albums"], description: "Parcourez les albums photo du Déchèt’Lab et des chantiers de dépose préservante." },
  { slug: "contact", title: "Contactez-nous", types: ["contactHub"], description: "Choisissez le bon interlocuteur et consultez les informations pratiques du Déchèt’Lab." },
];

const SECTION_LINKS: Record<string, string> = {
  accueil: "/",
  apropos: "/a-propos",
  missions: "/a-propos#missions",
  entreprises: "/nos-entreprises",
  galerie: "/galerie",
  contact: "/contact",
};

/** Compatibilité des anciens liens de section avec les nouvelles pages. */
export function sectionPageLink(href: string): string {
  const match = /^(?:\/)?#([a-z-]+)$/.exec(href);
  return match && SECTION_LINKS[match[1]] ? SECTION_LINKS[match[1]] : href;
}

/** Corrections rédactionnelles ciblées, sans modifier les noms de fichiers ni les adresses. */
export function correctFrenchCopy(value: string): string {
  if (/^(?:https?:|mailto:|tel:|\/images\/|data:)/i.test(value)) return value;
  return value
    .replace(/\bA propos de moi\b/g, "À propos de moi")
    .replace(/\bA propos\b/g, "À propos")
    .replace(/\bValodépôt\b/g, "ValoDépôt")
    .replace(/\bvalodépôt\b/g, "ValoDépôt")
    .replace(/\bContrast\b/g, "Contraste")
    .replace(/Pays de bray service/g, "Pays de Bray Service")
    .replace(/Les sens du bray/g, "Les Sens du Bray")
    .replace(/La maison d’économie solidaire/g, "La Maison d’économie solidaire")
    .replace(/Lachapelle-Aux-Pots/g, "Lachapelle-aux-Pots")
    .replace(/Contribuez vous aussi/g, "Contribuez, vous aussi,")
    .replace(/avant travaux ou démolition/g, "avant travaux ou avant démolition");
}

export function polishPublicContent<T>(value: T): T {
  if (typeof value === "string") return sectionPageLink(correctFrenchCopy(value)) as T;
  if (Array.isArray(value)) return value.map((entry) => polishPublicContent(entry)) as T;
  if (value && typeof value === "object" && !(value instanceof Date)) {
    return Object.fromEntries(Object.entries(value).map(([key, entry]) => [key, polishPublicContent(entry)])) as T;
  }
  return value;
}

const records = (value: unknown): Record<string, unknown>[] => Array.isArray(value)
  ? value.filter((entry): entry is Record<string, unknown> => Boolean(entry) && typeof entry === "object" && !Array.isArray(entry))
  : [];
const text = (value: unknown) => typeof value === "string" ? value : "";

/** Nouvelle orientation des demandes, en conservant les coordonnées déjà personnalisées. */
export function contactRoutingData(
  data: BlockData,
  siteKey: string,
  owner?: { email: string; phone: string },
): BlockData {
  const previousContacts = [...records(data.contacts), ...records(data.colleagues)];
  const contacts = REQUEST_CONTACTS.map((contact) => {
    const firstName = contact.name.split(" ")[0].toLocaleLowerCase("fr");
    const previous = previousContacts.find((entry) => text(entry.name).toLocaleLowerCase("fr").includes(firstName));
    const ownContact = (siteKey === "encadrant" && firstName === "médéric") || (siteKey === "developpement" && firstName === "lydia");
    return {
      ...contact,
      email: ownContact && owner?.email ? owner.email : text(previous?.email) || contact.email,
      phone: ownContact && owner?.phone ? owner.phone : text(previous?.phone) || contact.phone,
    };
  });
  const topics = records(data.topics).map((topic) => {
    const title = text(topic.title).replace(/\s+/g, " ");
    if (topic.id === "horaires" || /Horaires.*fonctionnement/i.test(title)) {
      return { ...topic, ...DECHETLAB_TOPICS.find((entry) => entry.id === "horaires") };
    }
    return topic;
  });
  const result = { ...data };
  delete result.colleagues;
  delete result.colleaguesTitle;
  const development = siteKey === "developpement";
  return polishPublicContent({
    ...result,
    routingTitle: "Le bon contact pour votre demande",
    contacts,
    topics,
    formTitle: development ? "Écrivez à Lydia" : "Écrivez à Médéric",
    formIntro: development
      ? "Ce formulaire est adressé à Lydia pour les questions de développement. Pour l’exploitation, la gestion des déchets ou les modalités d’inscription, utilisez les coordonnées de Médéric ci-dessus."
      : "Ce formulaire est adressé à Médéric pour les questions d’exploitation, de gestion des déchets et d’inscription. Pour le développement, utilisez les coordonnées de Lydia ci-dessus.",
  });
}
