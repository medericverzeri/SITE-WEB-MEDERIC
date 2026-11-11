import type { BlockData } from "@/db/schema";
import {
  DECHETLAB_DEPOSIT_CONDITION,
  DECHETLAB_FAQ,
  DECHETLAB_STEPS,
  DECHETLAB_WEBSITE,
  VALODEPOT_PROCEDURE_SUMMARY,
  VALODEPOT_PROCEDURE_TEXT,
  VALODEPOT_PROCEDURE_TITLE,
} from "@/lib/dechetlab-info";
import { ref } from "@/lib/media";

/** Seuls ces champs changent : les titres et photos personnalisés restent en place. */
export const DECHETLAB_BLOCK_PATCHES: Record<string, BlockData> = {
  hero: {
    subtitle: "Une déchèterie professionnelle et un point de réemploi pour les professionnels du bâtiment. Inscription au Déchèt’Lab et déclaration du dépôt dans ValoDépôt obligatoires avant tout passage. La reprise REP PMCB concerne uniquement les déchets triés et éligibles à cette filière.",
    primaryLabel: "S’inscrire au Déchèt’Lab",
    primaryHref: DECHETLAB_WEBSITE,
    badges: ["Compte Déchèt’Lab et déclaration ValoDépôt avant passage", "Menuiseries vitrées : validation sous 48 h et code de dépôt", "Déchets triés et éligibles à la REP PMCB"],
  },
  statusCard: {
    subtitle: "Ouverture normale les lundis, mercredis et vendredis : 08h15–12h15 et 13h30–17h15. Mardi et jeudi : uniquement sur rendez-vous confirmé, pour plus de 500 kg, selon disponibilité et avec 48 h de préavis. Déclaration ValoDépôt obligatoire avant tout passage. Les jours sur rendez-vous ne déclenchent pas automatiquement le voyant vert.",
  },
  features: {
    subtitle: "Des déchets triés, une déclaration anticipée et une place donnée au réemploi.",
    items: [
      { icon: "♻️", title: "REP PMCB", description: "Fonctionnement sur le principe de la REP PMCB : uniquement les déchets triés et éligibles à cette filière sont repris dans ce cadre." },
      { icon: "📱", title: "ValoDépôt avant passage", description: "Inscrivez-vous au Déchèt’Lab et transmettez la liste de vos déchets dans l’application ValoDépôt avant toute venue." },
      { icon: "🪟", title: "Menuiseries vitrées", description: VALODEPOT_PROCEDURE_SUMMARY },
      { icon: "↻", title: "Un point de réemploi", description: "Objets et matériaux utilisables, restes de chantier, surstocks et matériaux dormants : alimentez avec nous le catalogue de réemploi." },
    ],
  },
  steps: { subtitle: "Les démarches indispensables avant de vous déplacer.", items: DECHETLAB_STEPS },
  faq: { subtitle: "Les règles de fonctionnement à connaître avant votre passage.", items: DECHETLAB_FAQ },
  cta: {
    body: "Inscription, déclaration ValoDépôt, justificatifs pour les menuiseries vitrées ou rendez-vous pour plus de 500 kg : contactez-nous avant de venir.",
  },
};

export const DECHETLAB_EXTRA_BLOCKS: { type: string; data: BlockData }[] = [
  {
    type: "prose",
    data: {
      eyebrow: "Procédure ValoDépôt · depuis octobre 2026",
      title: VALODEPOT_PROCEDURE_TITLE,
      body: VALODEPOT_PROCEDURE_TEXT,
    },
  },
  {
    type: "offers",
    data: {
      eyebrow: "Tarifs HT au kilogramme",
      title: "Des tarifs clairement affichés",
      subtitle: "Le Déchèt’Lab fonctionne sur le principe de la REP PMCB pour les déchets triés et éligibles à cette filière. Voici les tarifs communiqués pour le D.I.B. / tout-venant et le bois.",
      items: [
        { title: "D.I.B. / Tout-venant", price: "0,32 € HT / kg", description: "Tarif hors taxes par kilogramme.", features: [DECHETLAB_DEPOSIT_CONDITION], ctaLabel: "Une question sur mon dépôt", ctaHref: "/contact" },
        { title: "Bois", price: "0,10 € HT / kg", description: "Tarif hors taxes par kilogramme.", features: [DECHETLAB_DEPOSIT_CONDITION], ctaLabel: "Préparer mon dépôt", ctaHref: "/contact" },
      ],
    },
  },
  {
    type: "imageText",
    data: {
      eyebrow: "Le réemploi, ensemble",
      title: "Bien plus qu’une déchèterie : un point de réemploi",
      subtitle: "Ce qui peut encore servir mérite une seconde vie.",
      body: "Vous pouvez déposer au Déchèt’Lab tout objet ou matériau encore utilisable et valorisable.\n\nEn étant inscrit, vous bénéficiez d’une priorité sur notre catalogue de matériaux et d’objets de réemploi. Nous vous demandons également de contribuer à ce catalogue : vos restes de chantier, vos surstocks ou vos matériaux dormants peuvent être utiles à d’autres.",
      bullets: ["Objets et matériaux encore utilisables et valorisables", "Priorité sur le catalogue de réemploi pour les inscrits", "Restes de chantier, surstocks et matériaux dormants bienvenus"],
      imageUrl: ref("MAHQEC-_su0"),
      imageAlt: "Menuiseries et matériaux récupérés, stockés pour être valorisés",
      imagePosition: "right",
      ctaLabel: "Proposer des matériaux au réemploi",
      ctaHref: "/contact",
    },
  },
];
