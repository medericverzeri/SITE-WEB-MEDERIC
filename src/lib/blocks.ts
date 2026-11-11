/**
 * Registre des types de blocs.
 *
 * Chaque bloc décrit :
 *  - ses champs simples (text, textarea, image, couleur, liste de lignes, select)
 *  - ses champs répétables (cartes, étapes, questions, témoignages…)
 *
 * Le site public ET l'espace admin lisent ce registre : en ajouter un ici
 * ajoute automatiquement son formulaire d'édition.
 */

export type FieldType =
  | "text"
  | "textarea"
  | "image"
  | "color"
  | "lines"
  | "select";

export type FieldDef = {
  name: string;
  label: string;
  type: FieldType;
  help?: string;
  placeholder?: string;
  options?: { value: string; label: string }[];
  full?: boolean;
};

export type ListDef = {
  key: string;
  label: string;
  titleField?: string;
  fields: FieldDef[];
};

export type BlockDef = {
  type: string;
  label: string;
  icon: string;
  description: string;
  fields: FieldDef[];
  itemLabel?: string;
  itemFields?: FieldDef[];
  itemTitleField?: string;
  /** Listes supplémentaires (en plus de `items`). */
  lists?: ListDef[];
};

/** Toutes les listes répétables d'un bloc (la liste `items` d'abord). */
export function listsOf(def: BlockDef): ListDef[] {
  const out: ListDef[] = [];
  if (def.itemFields) {
    out.push({
      key: "items",
      label: def.itemLabel ?? "Élément",
      titleField: def.itemTitleField,
      fields: def.itemFields,
    });
  }
  return [...out, ...(def.lists ?? [])];
}

const heading: FieldDef[] = [
  { name: "eyebrow", label: "Sur-titre", type: "text", placeholder: "Ex : Notre métier" },
  { name: "title", label: "Titre", type: "text", full: true },
  { name: "subtitle", label: "Introduction", type: "textarea", full: true },
];

const itemsTitle = (label = "Titre") => label;

export const BLOCK_DEFS: BlockDef[] = [
  {
    type: "hero",
    label: "Bandeau d'accueil",
    icon: "★",
    description: "Le grand bloc d'ouverture avec titre, accroche et boutons.",
    fields: [
      { name: "eyebrow", label: "Sur-titre", type: "text" },
      { name: "title", label: "Titre principal", type: "text", full: true },
      { name: "subtitle", label: "Accroche", type: "textarea", full: true },
      { name: "imageUrl", label: "Image (URL)", type: "image", full: true },
      { name: "imageAlt", label: "Description de l'image", type: "text", full: true },
      { name: "primaryLabel", label: "Bouton principal — texte", type: "text" },
      { name: "primaryHref", label: "Bouton principal — lien", type: "text" },
      { name: "secondaryLabel", label: "Bouton secondaire — texte", type: "text" },
      { name: "secondaryHref", label: "Bouton secondaire — lien", type: "text" },
      { name: "badges", label: "Petits points forts (une ligne = un point)", type: "lines", full: true },
    ],
  },
  {
    type: "statusCard",
    label: "Photo + disponibilité",
    icon: "◉",
    description:
      "Votre photo avec un statut vert (ouvert) ou rouge (fermé) calculé depuis les horaires.",
    fields: [
      { name: "eyebrow", label: "Sur-titre", type: "text" },
      { name: "title", label: "Titre", type: "text" },
      { name: "subtitle", label: "Texte d'introduction", type: "textarea", full: true },
      { name: "photoUrl", label: "Photo (URL)", type: "image", help: "Laissez vide pour utiliser la photo définie dans les réglages du site." },
      { name: "photoAlt", label: "Description de la photo", type: "text" },
      { name: "photoName", label: "Nom affiché", type: "text" },
      { name: "photoRole", label: "Fonction affichée", type: "text" },
      { name: "openNote", label: "Message quand c'est ouvert", type: "text" },
      { name: "closedNote", label: "Message quand c'est fermé", type: "text" },
      { name: "emailLabel", label: "Bouton e-mail — texte", type: "text" },
      { name: "phoneLabel", label: "Bouton téléphone — texte", type: "text" },
      { name: "showSchedule", label: "Afficher les horaires détaillés", type: "select", options: [
        { value: "yes", label: "Oui" },
        { value: "no", label: "Non" },
      ] },
    ],
  },
  {
    type: "homeHero",
    label: "Accueil — logo, titre & portrait",
    icon: "◉",
    description:
      "Grand bloc d'ouverture : titre, logo, boutons, portrait avec code couleur vert/rouge et bandeau d'horaires.",
    fields: [
      { name: "anchor", label: "Ancre du menu (ex : apropos)", type: "text", help: "Identifiant local dans cette page, sans espace ni majuscule. Les onglets du menu pointent vers des pages distinctes." },
      { name: "eyebrow", label: "Sur-titre", type: "text" },
      { name: "title", label: "Titre (1re ligne)", type: "text", full: true },
      { name: "accent", label: "2e ligne (en italique coloré)", type: "text", full: true },
      { name: "logoUrl", label: "Logo affiché sous le titre", type: "image", full: true },
      { name: "logoAlt", label: "Description du logo", type: "text" },
      { name: "primaryLabel", label: "Bouton principal — texte", type: "text" },
      { name: "primaryHref", label: "Bouton principal — lien", type: "text" },
      { name: "secondaryLabel", label: "Lien secondaire — texte", type: "text" },
      { name: "secondaryHref", label: "Lien secondaire — lien", type: "text" },
      { name: "portraitUrl", label: "Portrait (sinon : photo des réglages du site)", type: "image", full: true },
      { name: "portraitAlt", label: "Description du portrait", type: "text" },
      { name: "signatureName", label: "Nom sur le portrait", type: "text" },
      { name: "sideLabel", label: "Texte vertical sur le côté", type: "text" },
      { name: "showHours", label: "Afficher le bandeau d'horaires", type: "select", options: [
        { value: "yes", label: "Oui" },
        { value: "no", label: "Non" },
      ] },
      { name: "hoursTitle", label: "Titre du bandeau d'horaires", type: "text" },
    ],
  },
  {
    type: "aboutMe",
    label: "À propos de moi",
    icon: "☺",
    description: "Présentation, missions numérotées et deux photos.",
    fields: [
      { name: "anchor", label: "Ancre du menu (ex : apropos)", type: "text", help: "Identifiant local dans cette page, sans espace ni majuscule. Les onglets du menu pointent vers des pages distinctes." },
      { name: "number", label: "Numéro du chapitre", type: "text", placeholder: "01" },
      { name: "title", label: "Titre du chapitre", type: "text", full: true },
      { name: "introTitle", label: "Titre de la présentation", type: "text", full: true },
      { name: "introduction", label: "Présentation", type: "textarea", full: true, help: "Une ligne vide entre deux paragraphes." },
      { name: "missionsTitle", label: "Titre de la liste de missions", type: "text" },
      { name: "missions", label: "Missions (une ligne = une mission)", type: "lines", full: true },
      { name: "image1Url", label: "Photo 1", type: "image", full: true },
      { name: "image1Alt", label: "Description photo 1", type: "text" },
      { name: "image2Url", label: "Photo 2", type: "image", full: true },
      { name: "image2Alt", label: "Description photo 2", type: "text" },
    ],
  },
  {
    type: "activities",
    label: "Mes missions (grandes cartes photo)",
    icon: "▣",
    description: "Vos terrains d'encadrement : déchèterie, dépose préservante, formation…",
    fields: [
      { name: "anchor", label: "Ancre du menu (ex : apropos)", type: "text", help: "Identifiant local dans cette page, sans espace ni majuscule. Les onglets du menu pointent vers des pages distinctes." },
      { name: "number", label: "Numéro du chapitre", type: "text" },
      { name: "title", label: "Titre", type: "text", full: true },
      { name: "subtitle", label: "Introduction", type: "textarea", full: true },
    ],
    itemLabel: "Mission",
    itemTitleField: "title",
    itemFields: [
      { name: "title", label: "Titre", type: "text" },
      { name: "kicker", label: "Étiquette (ex : Déchèterie pro)", type: "text" },
      { name: "imageUrl", label: "Photo", type: "image", full: true },
      { name: "description", label: "Description", type: "textarea", full: true },
      { name: "bullets", label: "Points clés (une ligne = un point)", type: "lines", full: true },
      { name: "href", label: "Lien", type: "text" },
      { name: "linkLabel", label: "Texte du lien", type: "text" },
    ],
  },
  {
    type: "companies",
    label: "Nos entreprises (carrousel)",
    icon: "◫",
    description: "Cartes avec photo, logos, catégorie et lien vers chaque entreprise.",
    fields: [
      { name: "anchor", label: "Ancre du menu (ex : apropos)", type: "text", help: "Identifiant local dans cette page, sans espace ni majuscule. Les onglets du menu pointent vers des pages distinctes." },
      { name: "number", label: "Numéro du chapitre", type: "text" },
      { name: "title", label: "Titre", type: "text", full: true },
      { name: "subtitle", label: "Introduction", type: "textarea", full: true },
      { name: "groupName", label: "Nom du groupe affiché", type: "text" },
      { name: "groupLogoUrl", label: "Logo du groupe", type: "image", full: true },
      { name: "groupUrl", label: "Lien du logo / du groupe", type: "text" },
      { name: "groupIntro", label: "Texte de présentation du groupe", type: "textarea", full: true },
    ],
    itemLabel: "Entreprise",
    itemTitleField: "name",
    itemFields: [
      { name: "name", label: "Nom", type: "text" },
      { name: "category", label: "Catégorie", type: "text" },
      { name: "href", label: "Lien du site", type: "text", full: true },
      { name: "imageUrl", label: "Photo de la carte", type: "image", full: true },
      { name: "imageFit", label: "Cadrage de la photo", type: "select", options: [
        { value: "cover", label: "Remplir la carte" },
        { value: "contain", label: "Image entière (logo)" },
      ] },
      { name: "logo1", label: "Logo 1", type: "image", full: true },
      { name: "logo2", label: "Logo 2 (optionnel)", type: "image", full: true },
    ],
  },
  {
    type: "albums",
    label: "Galerie d'albums photo",
    icon: "❏",
    description: "Mosaïque de couvertures ; chaque couverture ouvre un album avec visionneuse.",
    fields: [
      { name: "anchor", label: "Ancre du menu (ex : apropos)", type: "text", help: "Identifiant local dans cette page, sans espace ni majuscule. Les onglets du menu pointent vers des pages distinctes." },
      { name: "number", label: "Numéro du chapitre", type: "text" },
      { name: "title", label: "Titre", type: "text", full: true },
      { name: "subtitle", label: "Introduction", type: "textarea", full: true },
    ],
    lists: [
      {
        key: "tiles",
        label: "Couverture de la mosaïque",
        titleField: "title",
        fields: [
          { name: "title", label: "Titre affiché", type: "text" },
          { name: "imageUrl", label: "Image de couverture", type: "image", full: true },
          { name: "albumId", label: "Album ouvert (identifiant)", type: "text", help: "Doit correspondre à l'identifiant d'un album ci-dessous. Vide = pas de clic." },
          { name: "span", label: "Largeur", type: "select", options: [
            { value: "1", label: "Étroite (1 colonne)" },
            { value: "2", label: "Large (2 colonnes)" },
          ] },
        ],
      },
      {
        key: "albums",
        label: "Album",
        titleField: "title",
        fields: [
          { name: "id", label: "Identifiant (sans espace)", type: "text", placeholder: "depose-preservante" },
          { name: "title", label: "Titre de l'album", type: "text" },
        ],
      },
      {
        key: "photos",
        label: "Photo d'album",
        titleField: "caption",
        fields: [
          { name: "albumId", label: "Album (identifiant)", type: "text" },
          { name: "imageUrl", label: "Photo", type: "image", full: true },
          { name: "caption", label: "Légende (optionnelle)", type: "text" },
          { name: "ratio", label: "Format (largeur ÷ hauteur)", type: "text", help: "1.33 = paysage, 0.75 = portrait, 1 = carré." },
        ],
      },
    ],
  },
  {
    type: "contactHub",
    label: "Contactez-nous (orientation, sujets et formulaire)",
    icon: "✉",
    description: "Orientation des demandes, coordonnées des interlocuteurs, informations pratiques et formulaire.",
    fields: [
      { name: "anchor", label: "Ancre du menu (ex : apropos)", type: "text", help: "Identifiant local dans cette page, sans espace ni majuscule. Les onglets du menu pointent vers des pages distinctes." },
      { name: "number", label: "Numéro du chapitre", type: "text" },
      { name: "title", label: "Titre du chapitre", type: "text", full: true },
      { name: "portraitUrl", label: "Photo ronde (sinon : photo des réglages)", type: "image", full: true },
      { name: "welcome", label: "Petit texte d'accueil", type: "text" },
      { name: "lead", label: "Phrase d'accroche", type: "textarea", full: true },
      { name: "question", label: "Question (1re ligne)", type: "text", full: true },
      { name: "subject", label: "Question (2e ligne, italique)", type: "text", full: true },
      { name: "choice", label: "Texte au-dessus des moyens de contact", type: "text", full: true },
      { name: "invitation", label: "Titre de l'invitation", type: "text" },
      { name: "routingTitle", label: "Titre de l’orientation des demandes", type: "text" },
      { name: "formIntro", label: "À qui le formulaire est-il adressé ?", type: "textarea", full: true },
      { name: "formTitle", label: "Titre du formulaire", type: "text" },
      { name: "successMessage", label: "Message de confirmation", type: "textarea", full: true },
    ],
    lists: [
      {
        key: "topics",
        label: "Sujet",
        titleField: "title",
        fields: [
          { name: "id", label: "Identifiant du sujet", type: "text" },
          { name: "icon", label: "Icône (symbole)", type: "text" },
          { name: "title", label: "Intitulé", type: "text" },
          { name: "action", label: "Au clic", type: "select", options: [
            { value: "info", label: "Afficher la fiche d’information" },
            { value: "link", label: "Ouvrir directement le lien" },
            { value: "form", label: "Aller au formulaire de contact" },
          ] },
          { name: "body", label: "Explications", type: "textarea", full: true },
          { name: "bullets", label: "Étapes / points clés (un par ligne)", type: "lines", full: true },
          { name: "noticeTitle", label: "Titre de l’avertissement", type: "text", full: true },
          { name: "notice", label: "Avertissement / précision importante", type: "textarea", full: true },
          { name: "noticeSteps", label: "Démarches dans l’avertissement (une étape par ligne)", type: "lines", full: true, help: "Présentation en liste numérotée. Exemple : Demande préalable : faites une demande sur ValoDépôt." },
          { name: "price1Label", label: "Tarif 1 — matière", type: "text" },
          { name: "price1", label: "Tarif 1 — montant et unité", type: "text" },
          { name: "price2Label", label: "Tarif 2 — matière", type: "text" },
          { name: "price2", label: "Tarif 2 — montant et unité", type: "text" },
          { name: "href", label: "Lien associé", type: "text", full: true },
          { name: "linkLabel", label: "Texte du lien", type: "text" },
        ],
      },
      {
        key: "channels",
        label: "Moyen de contact",
        titleField: "title",
        fields: [
          { name: "kind", label: "Type", type: "select", options: [
            { value: "web", label: "Site web" },
            { value: "phone", label: "Téléphone" },
            { value: "mail", label: "E-mail" },
          ] },
          { name: "title", label: "Titre", type: "text" },
          { name: "text", label: "Texte affiché", type: "text" },
          { name: "href", label: "Lien", type: "text", help: "tel:0610508783, mailto:…, https://…" },
          { name: "button", label: "Texte du bouton", type: "text" },
          { name: "text2", label: "2e numéro / lien — texte", type: "text" },
          { name: "href2", label: "2e numéro / lien — adresse", type: "text" },
          { name: "button2", label: "2e bouton", type: "text" },
        ],
      },
      {
        key: "contacts",
        label: "Contact d’orientation",
        titleField: "name",
        fields: [
          { name: "scope", label: "Domaine (exploitation, développement…)", type: "text", full: true },
          { name: "name", label: "Nom de l’interlocuteur", type: "text" },
          { name: "description", label: "Pour quelles questions le contacter ?", type: "textarea", full: true },
          { name: "email", label: "E-mail", type: "text" },
          { name: "phone", label: "Téléphone", type: "text" },
        ],
      },
    ],
  },
  {
    type: "stats",
    label: "Chiffres clés",
    icon: "▦",
    description: "Une rangée de chiffres marquants.",
    fields: [...heading, { name: "variant", label: "Fond", type: "select", options: [
      { value: "plain", label: "Clair" },
      { value: "brand", label: "Couleur de la structure" },
    ] }],
    itemLabel: "Chiffre",
    itemTitleField: "value",
    itemFields: [
      { name: "value", label: "Chiffre", type: "text" },
      { name: "label", label: "Légende", type: "text" },
    ],
  },
  {
    type: "features",
    label: "Cartes / prestations",
    icon: "▤",
    description: "Grille de cartes avec icône, titre et description.",
    fields: [
      ...heading,
      { name: "columns", label: "Colonnes", type: "select", options: [
        { value: "2", label: "2 colonnes" },
        { value: "3", label: "3 colonnes" },
        { value: "4", label: "4 colonnes" },
      ] },
    ],
    itemLabel: "Carte",
    itemTitleField: "title",
    itemFields: [
      { name: "icon", label: "Icône (emoji ou symbole)", type: "text" },
      { name: "title", label: "Titre", type: "text" },
      { name: "description", label: "Description", type: "textarea", full: true },
      { name: "linkLabel", label: "Lien — texte", type: "text" },
      { name: "linkHref", label: "Lien — adresse", type: "text" },
    ],
  },
  {
    type: "imageText",
    label: "Texte + image",
    icon: "◧",
    description: "Un texte argumenté à côté d'une photo.",
    fields: [
      ...heading,
      { name: "body", label: "Paragraphe", type: "textarea", full: true },
      { name: "bullets", label: "Points clés (une ligne = un point)", type: "lines", full: true },
      { name: "imageUrl", label: "Image (URL)", type: "image", full: true },
      { name: "imageAlt", label: "Description de l'image", type: "text", full: true },
      { name: "imagePosition", label: "Position de l'image", type: "select", options: [
        { value: "right", label: "À droite" },
        { value: "left", label: "À gauche" },
      ] },
      { name: "ctaLabel", label: "Bouton — texte", type: "text" },
      { name: "ctaHref", label: "Bouton — lien", type: "text" },
    ],
  },
  {
    type: "steps",
    label: "Étapes / parcours",
    icon: "①",
    description: "Un déroulé numéroté.",
    fields: [...heading],
    itemLabel: "Étape",
    itemTitleField: "title",
    itemFields: [
      { name: "title", label: "Titre de l'étape", type: "text" },
      { name: "description", label: "Description", type: "textarea", full: true },
    ],
  },
  {
    type: "gallery",
    label: "Galerie",
    icon: "❏",
    description: "Photos des ateliers, chantiers ou réalisations.",
    fields: [...heading],
    itemLabel: "Photo",
    itemTitleField: "caption",
    itemFields: [
      { name: "imageUrl", label: "Image (URL)", type: "image", full: true },
      { name: "caption", label: "Légende", type: "text" },
      { name: "detail", label: "Détail", type: "text" },
    ],
  },
  {
    type: "testimonials",
    label: "Témoignages",
    icon: "❝",
    description: "Paroles de participants, de clients ou de partenaires.",
    fields: [...heading],
    itemLabel: "Témoignage",
    itemTitleField: "author",
    itemFields: [
      { name: "quote", label: "Citation", type: "textarea", full: true },
      { name: "author", label: "Auteur", type: "text" },
      { name: "role", label: "Fonction / contexte", type: "text" },
    ],
  },
  {
    type: "offers",
    label: "Offres détaillées",
    icon: "◈",
    description: "Prestations avec tarif, liste d'inclusions et bouton.",
    fields: [...heading],
    itemLabel: "Offre",
    itemTitleField: "title",
    itemFields: [
      { name: "title", label: "Nom de l'offre", type: "text" },
      { name: "price", label: "Tarif / mention", type: "text" },
      { name: "description", label: "Description", type: "textarea", full: true },
      { name: "features", label: "Inclus (une ligne = un point)", type: "lines", full: true },
      { name: "ctaLabel", label: "Bouton — texte", type: "text" },
      { name: "ctaHref", label: "Bouton — lien", type: "text" },
    ],
  },
  {
    type: "team",
    label: "Équipe",
    icon: "☺",
    description: "Les personnes qui accompagnent.",
    fields: [...heading],
    itemLabel: "Personne",
    itemTitleField: "name",
    itemFields: [
      { name: "name", label: "Nom", type: "text" },
      { name: "role", label: "Fonction", type: "text" },
      { name: "bio", label: "Présentation", type: "textarea", full: true },
      { name: "imageUrl", label: "Photo (URL)", type: "image", full: true },
    ],
  },
  {
    type: "faq",
    label: "Questions fréquentes",
    icon: "?",
    description: "Réponses aux questions les plus posées.",
    fields: [...heading],
    itemLabel: "Question",
    itemTitleField: "question",
    itemFields: [
      { name: "question", label: "Question", type: "text", full: true },
      { name: "answer", label: "Réponse", type: "textarea", full: true },
    ],
  },
  {
    type: "prose",
    label: "Texte libre",
    icon: "¶",
    description: "Un contenu rédactionnel, paragraphe par paragraphe.",
    fields: [...heading, { name: "body", label: "Contenu", type: "textarea", full: true, help: "Laissez une ligne vide entre deux paragraphes." }],
  },
  {
    type: "partners",
    label: "Partenaires",
    icon: "◎",
    description: "Les structures qui soutiennent le projet.",
    fields: [...heading],
    itemLabel: "Partenaire",
    itemTitleField: "name",
    itemFields: [
      { name: "name", label: "Nom", type: "text" },
      { name: "detail", label: "Précision", type: "text" },
    ],
  },
  {
    type: "cta",
    label: "Appel à l'action",
    icon: "➜",
    description: "Une bande colorée pour pousser au contact.",
    fields: [
      { name: "title", label: "Titre", type: "text", full: true },
      { name: "body", label: "Texte", type: "textarea", full: true },
      { name: "buttonLabel", label: "Bouton — texte", type: "text" },
      { name: "buttonHref", label: "Bouton — lien", type: "text" },
      { name: "secondaryLabel", label: "Second bouton — texte", type: "text" },
      { name: "secondaryHref", label: "Second bouton — lien", type: "text" },
    ],
  },
  {
    type: "contact",
    label: "Contact",
    icon: "✉",
    description: "Formulaire (enregistré dans l'admin) et coordonnées.",
    fields: [
      { name: "title", label: "Titre", type: "text", full: true },
      { name: "subtitle", label: "Introduction", type: "textarea", full: true },
      { name: "email", label: "E-mail de contact", type: "text" },
      { name: "phone", label: "Téléphone", type: "text" },
      { name: "address", label: "Adresse", type: "textarea" },
      { name: "hours", label: "Horaires / disponibilité", type: "text" },
      { name: "formTitle", label: "Titre du formulaire", type: "text" },
      { name: "subject", label: "Sujet par défaut", type: "text" },
      { name: "successMessage", label: "Message de confirmation", type: "textarea", full: true },
      { name: "sideNote", label: "Encart latéral", type: "textarea", full: true },
      { name: "showForm", label: "Afficher le formulaire", type: "select", options: [
        { value: "yes", label: "Oui" },
        { value: "no", label: "Non" },
      ] },
    ],
  },
];

export const blockDef = (type: string): BlockDef | undefined =>
  BLOCK_DEFS.find((def) => def.type === type);

export const blockLabel = (type: string) => blockDef(type)?.label ?? type;

/* ------------------------------------------------------------------ */
/* Lecture tolérante des données JSON des blocs                        */
/* ------------------------------------------------------------------ */

export type Item = Record<string, string>;

export const str = (data: Record<string, unknown>, key: string): string => {
  const value = data?.[key];
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  return "";
};

export const lines = (data: Record<string, unknown>, key: string): string[] => {
  const value = data?.[key];
  if (Array.isArray(value)) {
    return value.map((entry) => (typeof entry === "string" ? entry : "")).filter(Boolean);
  }
  if (typeof value === "string") {
    return value
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
  }
  return [];
};

export const items = (data: Record<string, unknown>, key = "items"): Item[] => {
  const value = data?.[key];
  if (!Array.isArray(value)) return [];
  return value
    .filter((entry): entry is Record<string, unknown> => !!entry && typeof entry === "object")
    .map((entry) => {
      const out: Item = {};
      for (const [k, v] of Object.entries(entry)) {
        if (typeof v === "string") out[k] = v;
        else if (typeof v === "number") out[k] = String(v);
        else if (Array.isArray(v)) out[k] = v.map((x) => String(x)).join("\n");
      }
      return out;
    });
};

export const paragraphs = (text: string): string[] =>
  text
    .split(/\n\s*\n/)
    .map((chunk) => chunk.trim())
    .filter(Boolean);
