import type { ScheduleData } from "@/db/schema";

/** Informations de fonctionnement communiquées par l'exploitant. */
export type ContactTopic = {
  id?: string;
  icon: string;
  title: string;
  action?: string;
  body?: string;
  bullets?: string;
  noticeTitle?: string;
  notice?: string;
  noticeSteps?: string;
  href?: string;
  linkLabel?: string;
  price1Label?: string;
  price1?: string;
  price2Label?: string;
  price2?: string;
};

export const DECHETLAB_WEBSITE = "https://eco-solidaire.fr/dechetlab";

export const VALODEPOT_PROCEDURE_TITLE = "Nouvelles démarches obligatoires (Procédure ValoDépôt)";
export const VALODEPOT_PROCEDURE_INTRO =
  "Depuis octobre 2026, une procédure stricte est imposée avant tout dépôt de menuiseries vitrées en déchèterie ou point de reprise. Elle concerne tous les types de menuiseries vitrées.";
export const VALODEPOT_PROCEDURE_STEPS = [
  "Demande préalable : faites une demande sur l’application ou la plateforme ValoDépôt.",
  "Justificatif d’absence d’amiante : fournissez un justificatif, comme un repérage amiante avant travaux ou avant démolition (RAAT/RAAD), un permis de construire ou une facture de pose postérieure à 1997, ou un marquage de fabrication.",
  "Validation et code : attendez la validation du dossier (sous 48 h) pour recevoir un code de dépôt.",
  "Marquage : inscrivez visiblement ce code sur chaque menuiserie avant de vous présenter au point de reprise Valobat.",
];
export const VALODEPOT_PROCEDURE_TEXT = [
  VALODEPOT_PROCEDURE_INTRO,
  ...VALODEPOT_PROCEDURE_STEPS.map((step, index) => `${index + 1}. ${step}`),
].join("\n\n");
export const VALODEPOT_PROCEDURE_SUMMARY =
  "Menuiseries vitrées : demande ValoDépôt, justificatif d’absence d’amiante, validation sous 48 h, puis code à inscrire sur chaque menuiserie avant le dépôt au point de reprise Valobat.";

export const DECHETLAB_OPENING_HOURS =
  "Lundi, mercredi et vendredi : 08h15–12h15 et 13h30–17h15. Mardi et jeudi : sur rendez-vous uniquement, plus de 500 kg, sous réserve de créneaux disponibles et avec 48 h de préavis.";

export const DECHETLAB_DEPOSIT_CONDITION =
  "Inscription au Déchèt’Lab et déclaration du dépôt dans l’application ValoDépôt obligatoires avant tout passage.";
export const DECHETLAB_APPOINTMENT_CONDITION =
  "Plus de 500 kg de déchets uniquement, selon les créneaux disponibles. Prévenir au moins 48 heures à l’avance. Rendez-vous à confirmer avant votre venue.";

const normalDay = () => ({
  closed: false,
  ranges: [{ start: "08:15", end: "12:15" }, { start: "13:30", end: "17:15" }],
  note: DECHETLAB_DEPOSIT_CONDITION,
});
const appointmentDay = () => ({
  closed: false,
  appointmentOnly: true,
  ranges: [],
  note: DECHETLAB_APPOINTMENT_CONDITION,
});

export const DECHETLAB_SCHEDULE: ScheduleData = {
  mon: normalDay(),
  tue: appointmentDay(),
  wed: normalDay(),
  thu: appointmentDay(),
  fri: normalDay(),
  sat: { closed: true, ranges: [] },
  sun: { closed: true, ranges: [] },
};

export const DECHETLAB_TOPICS: ContactTopic[] = [
  {
    id: "dechets",
    icon: "♻",
    title: "Déchets\nacceptés",
    action: "info",
    body: "Le Déchèt’Lab fonctionne sur le principe de la REP PMCB (Responsabilité élargie du producteur pour les produits et matériaux de construction du bâtiment). La reprise dans ce cadre concerne uniquement les déchets triés et éligibles à la REP PMCB.",
    bullets: "Triez vos déchets avant leur dépôt.\nDéclarez dans ValoDépôt la liste des déchets que vous prévoyez d’apporter, avant tout passage.\nUn doute sur l’éligibilité d’un matériau ? Contactez-nous avant de vous déplacer.",
    noticeTitle: VALODEPOT_PROCEDURE_TITLE,
    notice: VALODEPOT_PROCEDURE_INTRO,
    noticeSteps: VALODEPOT_PROCEDURE_STEPS.join("\n"),
  },
  {
    id: "inscription",
    icon: "+",
    title: "Inscription\n& compte",
    action: "link",
    href: DECHETLAB_WEBSITE,
    linkLabel: "S’inscrire au Déchèt’Lab",
    body: "Accédez directement au site officiel du Déchèt’Lab pour votre inscription et les informations de compte professionnel.",
  },
  {
    id: "depot",
    icon: "▣",
    title: "Modalités\nde dépôt",
    action: "info",
    body: "Avant tout passage en déchèterie, vous devez être inscrit au Déchèt’Lab et utiliser l’application ValoDépôt pour nous transmettre la liste des déchets que vous allez déposer.",
    bullets: "Être inscrit au Déchèt’Lab.\nDéclarer votre dépôt dans ValoDépôt et transmettre la liste des déchets avant de venir.\nPrésenter des déchets triés : la reprise REP PMCB concerne uniquement les déchets éligibles à cette filière.",
    noticeTitle: VALODEPOT_PROCEDURE_TITLE,
    notice: VALODEPOT_PROCEDURE_INTRO,
    noticeSteps: VALODEPOT_PROCEDURE_STEPS.join("\n"),
    href: DECHETLAB_WEBSITE,
    linkLabel: "Inscription & accès à ValoDépôt",
  },
  {
    id: "horaires",
    icon: "◷",
    title: "Horaires &\nfonctionnement",
    action: "info",
    body: "Retrouvez ci-dessous les créneaux d’accueil. Les mardis et jeudis ne sont pas des jours d’ouverture libre.",
    bullets: "Lundis, mercredis et vendredis : 08h15–12h15 et 13h30–17h15.\nMardis et jeudis : uniquement sur rendez-vous confirmé pour plus de 500 kg, selon les créneaux disponibles et en prévenant au moins 48 heures à l’avance.\nSamedis et dimanches : fermé.",
    noticeTitle: "À faire avant de vous déplacer",
    notice: DECHETLAB_DEPOSIT_CONDITION,
  },
  {
    id: "tarifs",
    icon: "◆",
    title: "Tarifs",
    action: "info",
    body: "Le fonctionnement repose sur la REP PMCB pour les déchets triés et éligibles à cette filière. Les tarifs indiqués ci-dessous sont exprimés hors taxes (HT) par kilogramme.",
    price1Label: "D.I.B. / Tout-venant",
    price1: "0,32 € HT / kg",
    price2Label: "Bois",
    price2: "0,10 € HT / kg",
    noticeTitle: "Tri et déclaration préalables",
    notice: "La reprise REP PMCB est réservée aux déchets triés et couverts par la filière. Déclarez votre dépôt dans ValoDépôt avant de venir.",
  },
  {
    id: "reemploi",
    icon: "↻",
    title: "Réemploi",
    action: "info",
    body: "Le Déchèt’Lab n’est pas une simple déchèterie : c’est aussi un point de réemploi. Vous pouvez y déposer des objets et matériaux encore utilisables et valorisables pour leur donner une seconde vie.",
    bullets: "Déposez des objets ou matériaux encore utilisables et valorisables.\nEn étant inscrit au Déchèt’Lab, vous bénéficiez d’une priorité sur notre catalogue de matériaux et d’objets de réemploi.\nContribuez, vous aussi, au catalogue : restes de chantier, surstocks ou matériaux dormants dont vous ne savez que faire.",
    noticeTitle: "Un catalogue qui vit grâce à vous",
    notice: "La priorité d’accès s’accompagne d’une démarche solidaire : nous vous invitons également à alimenter le catalogue avec vos matériaux et objets réemployables.",
  },
  { id: "autre", icon: "…", title: "Autre\nquestion", action: "form" },
];

export const DECHETLAB_STEPS = [
  { title: "S’inscrire au Déchèt’Lab", description: "Rendez-vous sur eco-solidaire.fr/dechetlab pour l’inscription et les informations de compte professionnel." },
  { title: "Déclarer le dépôt dans ValoDépôt", description: "Avant tout passage, utilisez l’application ValoDépôt pour transmettre la liste des déchets que vous allez déposer. Ils doivent être triés ; la reprise REP PMCB est limitée aux déchets éligibles." },
  { title: "Appliquer la procédure ValoDépôt pour les menuiseries vitrées", description: VALODEPOT_PROCEDURE_SUMMARY },
  { title: "Venir au bon créneau", description: "Lundi, mercredi, vendredi : 08h15–12h15 et 13h30–17h15. Mardi et jeudi : rendez-vous confirmé uniquement pour plus de 500 kg, selon disponibilité, en prévenant 48 heures à l’avance." },
];

export const DECHETLAB_FAQ = [
  { question: "Quels déchets sont repris dans le cadre de la REP PMCB ?", answer: "Uniquement les déchets triés et éligibles à la REP PMCB. Déclarez la liste des déchets dans ValoDépôt avant tout passage. En cas de doute sur un flux, contactez-nous avant de venir." },
  { question: "Comment s’inscrire et préparer son dépôt ?", answer: "Inscrivez-vous au Déchèt’Lab via eco-solidaire.fr/dechetlab. Utilisez ensuite l’application ValoDépôt pour transmettre la liste des déchets que vous allez apporter, avant tout passage en déchèterie." },
  { question: "Quelles conditions pour les menuiseries vitrées ?", answer: VALODEPOT_PROCEDURE_TEXT },
  { question: "Quels sont les tarifs ?", answer: "D.I.B. / tout-venant : 0,32 € HT par kilogramme. Bois : 0,10 € HT par kilogramme. La reprise REP PMCB concerne uniquement les déchets triés et éligibles à cette filière." },
  { question: "Quels sont les horaires ?", answer: `${DECHETLAB_OPENING_HOURS}\n\n${DECHETLAB_DEPOSIT_CONDITION}` },
  { question: "Comment participer au réemploi ?", answer: "Déposez des objets et matériaux encore utilisables et valorisables. En étant inscrit au Déchèt’Lab, vous avez une priorité sur notre catalogue de réemploi. Nous vous demandons aussi de l’alimenter avec vos restes de chantier, surstocks ou matériaux dormants." },
];
