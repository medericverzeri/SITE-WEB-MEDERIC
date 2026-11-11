import type { BlockData, NavLink, ScheduleData } from "@/db/schema";
import { ref } from "@/lib/media";
import { DECHETLAB_OPENING_HOURS, DECHETLAB_SCHEDULE, DECHETLAB_TOPICS } from "@/lib/dechetlab-info";
import { DECHETLAB_BLOCK_PATCHES, DECHETLAB_EXTRA_BLOCKS } from "./dechetlab-content";
import { makeMultipageSite } from "./multipage-defaults";

export type SeedBlock = { type: string; data: BlockData };

export type SeedPage = {
  slug: string;
  title: string;
  navLabel: string;
  isHome?: boolean;
  inNav?: boolean;
  seoTitle?: string;
  seoDescription?: string;
  blocks: SeedBlock[];
};

export type SeedSite = {
  key: string;
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
  notificationEmail?: string;
  address: string;
  openingHours: string;
  schedule?: ScheduleData;
  statusOverride?: string;
  statusNoteOpen?: string;
  statusNoteClosed?: string;
  photoUrl?: string;
  photoAlt?: string;
  photoName?: string;
  photoRole?: string;
  marqueeEnabled?: boolean;
  marqueeText?: string;
  marqueeSpeed?: string;
  navLinks?: NavLink[];
  textureUrl?: string;
  footerNote: string;
  legalNote: string;
  ctaLabel: string;
  ctaHref: string;
  bannerEnabled: boolean;
  bannerText: string;
  bannerHref: string;
  seoTitle: string;
  seoDescription: string;
  pages: SeedPage[];
};

/* ------------------------------------------------------------------ */
/* Briques réutilisables                                               */
/* ------------------------------------------------------------------ */

const hero = (d: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  imageUrl?: string;
  imageAlt?: string;
  primaryLabel?: string;
  primaryHref?: string;
  secondaryLabel?: string;
  secondaryHref?: string;
  badges?: string[];
}): SeedBlock => ({
  type: "hero",
  data: {
    eyebrow: d.eyebrow ?? "",
    title: d.title,
    subtitle: d.subtitle ?? "",
    imageUrl: d.imageUrl ?? "",
    imageAlt: d.imageAlt ?? "",
    primaryLabel: d.primaryLabel ?? "",
    primaryHref: d.primaryHref ?? "",
    secondaryLabel: d.secondaryLabel ?? "",
    secondaryHref: d.secondaryHref ?? "",
    badges: d.badges ?? [],
  },
});

const cta = (title: string, body: string, label: string, href: string): SeedBlock => ({
  type: "cta",
  data: {
    title,
    body,
    buttonLabel: label,
    buttonHref: href,
    secondaryLabel: "",
    secondaryHref: "",
  },
});

const feature = (icon: string, title: string, description: string) => ({ icon, title, description });

const legalPage = (owner: string, siteName: string): SeedPage => ({
  slug: "mentions-legales",
  title: "Mentions légales",
  navLabel: "Mentions légales",
  inNav: false,
  seoTitle: `Mentions légales — ${siteName}`,
  seoDescription: "Éditeur du site, hébergement, données personnelles et accessibilité.",
  blocks: [
    hero({
      eyebrow: "Informations légales",
      title: "Mentions légales & données personnelles",
      subtitle:
        "Transparence sur l’éditeur du site, l’hébergement et l’usage des informations que vous nous confiez.",
    }),
    {
      type: "prose",
      data: {
        eyebrow: "Éditeur",
        title: "Éditeur du site",
        body: `Éditeur : ${owner}.\nStructure : La Maison d’économie solidaire — Groupe Éco-Solidaire (eco-solidaire.fr).\n\nLes textes et images présentés proviennent des supports de l’éditeur. Les logos restent la propriété de leurs détenteurs.`,
      },
    },
    {
      type: "prose",
      data: {
        eyebrow: "Hébergement",
        title: "Hébergement",
        body: "Site hébergé par Vercel Inc. (440 N Barranca Ave #4133, Covina, CA 91723, États-Unis).\n\nAucun outil de suivi publicitaire n’est utilisé. Seul un cookie technique protège l’espace d’administration.",
      },
    },
    {
      type: "prose",
      data: {
        eyebrow: "Données personnelles",
        title: "Vos données, vos droits",
        body: "Les messages adressés depuis le formulaire sont conservés pour permettre une réponse. Ces informations servent uniquement à répondre à votre demande.\n\nVous pouvez demander leur suppression en nous contactant à l’adresse indiquée sur le site.",
      },
    },
    {
      type: "prose",
      data: {
        eyebrow: "Accessibilité",
        title: "Accessibilité & lisibilité",
        body: "Le site propose un agrandissement du texte et un contraste renforcé (boutons « A+ » et « Contraste »), une navigation au clavier, une structure de titres cohérente et des images décrites.\n\nSi vous rencontrez une difficulté, signalez-la via le formulaire de contact : nous corrigerons le contenu concerné.",
      },
    },
  ],
});

/* ------------------------------------------------------------------ */
/* Contenus partagés par les deux sites (repris du site de référence)  */
/* ------------------------------------------------------------------ */

const company = (
  name: string,
  category: string,
  href: string,
  image: string,
  logos: string[],
  fit = "cover",
) => ({
  name,
  category,
  href,
  imageUrl: image,
  imageFit: fit,
  logo1: logos[0] ?? "",
  logo2: logos[1] ?? "",
});

const COMPANIES = [
  company("La Maison d’économie solidaire", "Le siège social", "https://eco-solidaire.fr", ref("MAHP9uxt3lE"), [ref("MAHKtLJ1U8A")]),
  company("Pays de Bray Service", "Service d’aide à la personne", "https://eco-solidaire.fr/groupe-mes/paysdebrayservice", ref("MAGz2E_p3C0"), [ref("MAHP9ro8m9o")]),
  company("Alicias", "Formations et accompagnement", "https://eco-solidaire.fr/groupe-mes/alicias", ref("MAGTteXqos0"), [ref("MAHP9vMI7xA")]),
  company("Les Sens du Bray", "Constructeurs de solutions", "https://eco-solidaire.fr/groupe-mes/sensdubray", ref("MAHP9lNUFnk"), [ref("MAHP9GYeyyw"), ref("MAHP9hnhYoA")]),
  company("La recyclerie\nLachapelle-aux-Pots", "Boutique et réemploi", "https://eco-solidaire.fr/groupe-mes/la-recyclerie-du-pays-de-bray", ref("MAHP9h85zXU"), [ref("MAHP9siL3Fk")]),
  company("La recyclerie\nGournay-en-Bray", "Boutique et réemploi", "https://eco-solidaire.fr/groupe-mes/la-recyclerie-du-pays-de-bray", ref("MAHP9iNqU8w"), [ref("MAHQDnpC0Gc")]),
  company("Solitex Oise", "Le réemploi du textile", "https://www.solitex-oise.com", ref("MAHP9rHSuds"), [ref("MAHP9pCj_7E")]),
  company("Recycl’aide Oise", "Le réemploi des aides techniques", "https://recyclaide.fr/?page=accueil", ref("MAHP9lY8M6A"), [ref("MAHP9pN8tJU")]),
  company("Matériosol", "L’économie circulaire des matériaux", "https://eco-solidaire.fr/materiosol", ref("MAHP90_NSFE"), [ref("MAHHOnURXyw")]),
  company("Le Comptoir C\nBeauvais", "Économie circulaire et communs du Beauvaisis", "https://eco-solidaire.fr/groupe-mes/nos-lieux/comptoir-c", ref("comptoir-c"), []),
  company("Déchèt’Lab", "Déchèterie professionnelle · Beauvais", "https://eco-solidaire.fr/dechetlab", ref("MAHQEPH4wJU"), [ref("MAHQDsk7bis")]),
  company("BatiRE", "Réemploi des matériaux du bâtiment", "https://batire.groupemes.fr/", ref("batire-logo"), [ref("batire-logo")], "contain"),
];

const photo = (albumId: string, id: string, ratio: number, caption = "") => ({
  albumId,
  imageUrl: ref(id),
  caption,
  ratio: String(ratio),
});

const ALBUM_TILES = [
  { title: "Déchèt’Lab déchèterie pro", imageUrl: ref("MAHN9CdUI8c"), albumId: "dechetlab", span: "1" },
  { title: "Dépose préservante", imageUrl: ref("MAHQEXTG_r8"), albumId: "depose-preservante", span: "2" },
  { title: "", imageUrl: ref("MAHQEXO8lMk"), albumId: "depose-preservante", span: "2" },
  { title: "", imageUrl: ref("MAHQEfAT0Q0"), albumId: "", span: "1" },
];

const ALBUMS = [
  { id: "dechetlab", title: "Déchèt’Lab déchèterie pro" },
  { id: "depose-preservante", title: "Dépose préservante" },
];

const ALBUM_PHOTOS = [
  photo("dechetlab", "MAHP90_NSFE", 1.00932),
  photo("dechetlab", "MAHH99XUvjk", 1.33333),
  photo("dechetlab", "MAHH90MKXkY", 1.33333),
  photo("dechetlab", "MAHH9-Xd9q4", 0.75),
  photo("dechetlab", "MAHQEC2uebY", 0.75),
  photo("dechetlab", "MAHQEFBvSms", 0.75),
  photo("dechetlab", "MAHQEOJ-HX0", 0.75),
  photo("dechetlab", "MAHQENEHUPg", 0.75),
  photo("dechetlab", "MAHQEC-_su0", 0.75),
  photo("depose-preservante", "MAHQEL_-oK8", 1.33333),
  photo("depose-preservante", "MAHQEVbADLk", 1.33333),
  photo("depose-preservante", "MAHQEaX6cl8", 1.20441),
  photo("depose-preservante", "MAHQESwwHtM", 0.75),
  photo("depose-preservante", "MAHQEHvk8wY", 0.75),
  photo("depose-preservante", "MAHQECmdgB4", 0.75),
  photo("depose-preservante", "MAHQEKFy2QY", 0.75),
  photo("depose-preservante", "MAHQEFWfofY", 0.75),
];

const companiesBlock = (): SeedBlock => ({
  type: "companies",
  data: {
    anchor: "entreprises",
    number: "03",
    title: "Nos entreprises",
    subtitle:
      "Un réseau de structures d’économie sociale et solidaire réunies autour de l’insertion, du réemploi et du territoire. Cliquez sur une carte pour découvrir chaque entreprise.",
    items: COMPANIES,
  },
});

const albumsBlock = (): SeedBlock => ({
  type: "albums",
  data: {
    anchor: "galerie",
    number: "04",
    title: "Galerie",
    subtitle: "Ouvrez un album pour parcourir les photos du Déchèt’Lab et des chantiers de dépose préservante.",
    tiles: ALBUM_TILES,
    albums: ALBUMS,
    photos: ALBUM_PHOTOS,
  },
});

const gallery = (ids: string[], captions: string[], title: string): SeedBlock => ({
  type: "gallery",
  data: {
    eyebrow: "En images",
    title,
    subtitle: "",
    items: ids.map((id, index) => ({ imageUrl: ref(id), caption: captions[index] ?? "", detail: "" })),
  },
});

const OPEN_RANGES = [
  { start: "08:30", end: "12:15" },
  { start: "13:30", end: "17:30" },
];

/* ------------------------------------------------------------------ */
/* SITE 1 — MÉDÉRIC VERZERI, ENCADRANT TECHNIQUE D'INSERTION           */
/* ------------------------------------------------------------------ */

const encadrant: SeedSite = {
  key: "encadrant",
  name: "Médéric VERZERI",
  shortName: "Médéric Verzeri",
  role: "Encadrant technique d’insertion · Déchèt’Lab",
  tagline: "Encadrant technique d’insertion en économie circulaire",
  logoMark: "MV",
  primaryColor: "#18736c",
  accentColor: "#f97316",
  heroImageUrl: ref("MAHH99XUvjk"),
  contactEmail: "m.verzeri@eco-solidaire.fr",
  contactPhone: "06 10 50 87 83",
  notificationEmail: "m.verzeri@eco-solidaire.fr",
  address: "Déchèt’Lab\nBeauvais (Oise)",
  openingHours: DECHETLAB_OPENING_HOURS,
  schedule: DECHETLAB_SCHEDULE,
  statusNoteOpen: "En poste — disponible pour vos questions",
  statusNoteClosed: "Fermé — laissez un message, je reviens vers vous",
  photoUrl: ref("MAHQDsvF0sc"),
  photoAlt: "Médéric Verzeri, encadrant technique d’insertion au Déchèt’Lab",
  photoName: "Médéric VERZERI",
  photoRole: "Encadrant technique d’insertion",
  marqueeEnabled: true,
  marqueeText:
    "ValoDépôt : déclaration avant tout passage · Menuiseries vitrées : validation sous 48 h et code de dépôt · Dépose préservante · Formation des salariés en insertion",
  marqueeSpeed: "normal",
  navLinks: [
    { label: "Accueil", href: "/#accueil" },
    { label: "À propos de moi", href: "/#apropos" },
    { label: "Nos entreprises", href: "/#entreprises" },
    { label: "Galerie", href: "/#galerie" },
    { label: "Contactez-nous", href: "/#contact" },
  ],
  textureUrl: ref("MAHQDlSEorY"),
  footerNote:
    "Encadrant technique d’insertion en économie circulaire : déchèterie professionnelle Déchèt’Lab, dépose préservante de matériaux de construction et formation des salariés en insertion.",
  legalNote: "La Maison d’économie solidaire · Aucun outil de suivi publicitaire",
  ctaLabel: "Contactez-nous",
  ctaHref: "/#contact",
  bannerEnabled: false,
  bannerText: "Déchèt’Lab : retrouvez les horaires d’ouverture et contactez-nous.",
  bannerHref: "/#contact",
  seoTitle: "Médéric Verzeri — Encadrant technique d’insertion · Déchèt’Lab",
  seoDescription:
    "Encadrant technique d’insertion en économie circulaire chez Déchèt’Lab (Beauvais) : déchèterie professionnelle, dépose préservante, formation des salariés en insertion. Horaires, entreprises du groupe et contact.",
  pages: [
    {
      slug: "accueil",
      title: "Accueil",
      navLabel: "Accueil",
      isHome: true,
      inNav: false,
      seoTitle: "Médéric Verzeri — Encadrant technique d’insertion · Déchèt’Lab",
      seoDescription:
        "Encadrant technique d’insertion en économie circulaire chez Déchèt’Lab : déchèterie professionnelle, dépose préservante, formation.",
      blocks: [
        {
          type: "homeHero",
          data: {
            anchor: "accueil",
            eyebrow: "Économie circulaire · Beauvais",
            title: "Encadrant technique d’insertion",
            accent: "en économie circulaire chez",
            logoUrl: ref("MAHQDsk7bis"),
            logoAlt: "Déchèt’Lab",
            primaryLabel: "Contactez-nous",
            primaryHref: "/#contact",
            secondaryLabel: "À propos de moi",
            secondaryHref: "/#apropos",
            portraitUrl: "",
            portraitAlt: "Médéric Verzeri",
            signatureName: "Médéric VERZERI",
            sideLabel: "Déchèt’Lab · Insertion · Réemploi",
            showHours: "yes",
            hoursTitle: "Horaires d’ouverture",
          },
        },
        {
          type: "aboutMe",
          data: {
            anchor: "apropos",
            number: "01",
            title: "À propos de moi",
            introTitle: "Encadrant technique d’insertion",
            introduction:
              "Mon rôle est d’assurer l’encadrement et l’accompagnement des salariés en insertion dans leur parcours professionnel, tout en garantissant le bon fonctionnement de la déchèterie professionnelle Déchèt’Lab.\n\nJ’allie management de proximité, transmission des savoir-faire et organisation des activités afin de concilier performance opérationnelle et sécurité.\n\nJe suis également en charge de la formation des salariés et des professionnels du bâtiment sur le tri. Je conçois mes propres formations, de l’élaboration des contenus jusqu’à leur animation.\n\nJ’encadre aussi des équipes en extérieur, sur des chantiers de dépose préservante : la récupération de matériaux de construction en vue de leur réemploi.\n\nJe suis enfin intégré au suivi et à la construction du projet Déchèt’Lab.",
            missionsTitle: "Mes principales missions",
            missions: [
              "Encadrer, former et accompagner les salariés en insertion dans le développement de leurs compétences.",
              "Organiser et coordonner les activités de la déchèterie professionnelle.",
              "Accueillir et accompagner les professionnels du bâtiment.",
              "Veiller au respect des consignes de sécurité, des procédures et de la qualité du tri.",
              "Sensibiliser les usagers aux enjeux du réemploi, du recyclage et de l’économie circulaire.",
              "Encadrer des chantiers en extérieur de dépose préservante et la récupération de matériaux de construction.",
              "Concevoir des formations, de l’élaboration des contenus jusqu’à leur animation auprès des salariés en insertion.",
            ],
            image1Url: ref("MAHQEGuUAIw"),
            image1Alt:
              "Deux personnes transportant un vitrage lors d’un chantier de dépose préservante",
            image2Url: ref("MAHQEPH4wJU"),
            image2Alt: "Entrée de la déchèterie professionnelle Déchèt’Lab",
          },
        },
        {
          type: "activities",
          data: {
            anchor: "missions",
            number: "02",
            title: "Trois terrains d’encadrement",
            subtitle:
              "Mon rôle ne se limite pas à la déchèterie : il s’exerce aussi en extérieur, sur les chantiers, et en salle de formation.",
            items: [
              {
                title: "Déchèterie professionnelle Déchèt’Lab",
                kicker: "Déchèterie pro",
                imageUrl: ref("MAHH99XUvjk"),
                description:
                  "Accueil et accompagnement des professionnels du bâtiment, organisation des activités et suivi des salariés en insertion au quotidien.",
                bullets: [
                  "Qualité du tri et consignes de sécurité",
                  "Accueil des professionnels du bâtiment",
                  "Sensibilisation au réemploi et au recyclage",
                ],
                href: "/dechet-lab",
                linkLabel: "Découvrir le Déchèt’Lab",
              },
              {
                title: "Dépose préservante",
                kicker: "Chantiers en extérieur",
                imageUrl: ref("MAHQEXO8lMk"),
                description:
                  "Encadrement d’équipes sur des chantiers de dépose soignée pour récupérer des matériaux de construction destinés au réemploi.",
                bullets: [
                  "Démontage soigné et récupération des matériaux",
                  "Tri, conditionnement et sécurité sur chantier",
                  "Orientation vers le réemploi et le recyclage",
                ],
                href: "/depose-preservante",
                linkLabel: "Voir les chantiers",
              },
              {
                title: "Formation des salariés en insertion",
                kicker: "Formation",
                imageUrl: ref("MAGTteXqos0"),
                description:
                  "Conception de mes propres formations, de l’élaboration des contenus jusqu’à leur animation auprès des salariés en insertion.",
                bullets: [
                  "Analyse des besoins et conception des contenus",
                  "Animation et mise en pratique",
                  "Formations au tri pour les professionnels du bâtiment",
                ],
                href: "/formation",
                linkLabel: "Découvrir la démarche",
              },
            ],
          },
        },
        companiesBlock(),
        albumsBlock(),
        {
          type: "contactHub",
          data: {
            anchor: "contact",
            number: "05",
            title: "Contactez-nous",
            portraitUrl: "",
            welcome: "À votre écoute,",
            lead: "Pour répondre\nà vos besoins.",
            question: "Vous avez une question concernant",
            subject: "le Déchèt’Lab ?",
            choice: "Choisissez le moyen qui vous convient.",
            invitation: "N’hésitez pas à nous contacter",
            colleaguesTitle: "Votre contact développement",
            formTitle: "Ou écrivez-moi directement",
            successMessage: "Merci, votre message a bien été transmis. Je reviens vers vous rapidement.",
            topics: DECHETLAB_TOPICS,
            channels: [
              {
                kind: "web",
                title: "Site web",
                text: "eco-solidaire.fr/dechetlab",
                href: "https://eco-solidaire.fr/dechetlab",
                button: "Visiter le site",
                text2: "",
                href2: "",
                button2: "",
              },
              {
                kind: "phone",
                title: "Téléphone",
                text: "06.10.50.87.83",
                href: "tel:0610508783",
                button: "Appeler",
                text2: "07 69 29 48 12",
                href2: "tel:+33769294812",
                button2: "Appeler",
              },
              {
                kind: "mail",
                title: "E-mail",
                text: "m.verzeri@eco-solidaire.fr",
                href: "mailto:m.verzeri@eco-solidaire.fr",
                button: "Envoyer un e-mail",
                text2: "",
                href2: "",
                button2: "",
              },
            ],
            colleagues: [
              {
                name: "Lydia Charpentier",
                role: "En charge du développement",
                email: "l.charpentier@eco-solidaire.fr",
                phone: "06.09.88.36.47",
                siteHref: "!/developpement",
                imageUrl: "",
              },
            ],
          },
        },
      ],
    },
    {
      slug: "dechet-lab",
      title: "Déchèterie professionnelle Déchèt’Lab",
      navLabel: "Déchèt’Lab",
      inNav: true,
      seoTitle: "Déchèt’Lab — Déchèterie professionnelle à Beauvais | Médéric Verzeri",
      seoDescription:
        "Déchèt’Lab : déchèterie professionnelle à Beauvais pour les professionnels du bâtiment. Tri, réemploi, recyclage, horaires d’ouverture et contact.",
      blocks: [
        hero({
          eyebrow: "Déchèterie professionnelle · Beauvais",
          title: "Déchèt’Lab : la déchèterie pro qui trie, réemploie et forme.",
          subtitle:
            "Le Déchèt’Lab accueille les professionnels du bâtiment et organise le tri de leurs déchets pour favoriser le réemploi et le recyclage. Le site s’appuie sur des salariés en insertion, encadrés au quotidien.",
          imageUrl: ref("MAHH99XUvjk"),
          imageAlt: "Entrée de la déchèterie professionnelle Déchèt’Lab à Beauvais",
          primaryLabel: "Poser une question",
          primaryHref: "/contact",
          secondaryLabel: "Site du Déchèt’Lab",
          secondaryHref: "https://eco-solidaire.fr/dechetlab",
          badges: [
            "Accueil des professionnels du bâtiment",
            "Tri de qualité et consignes de sécurité",
            "Réemploi, recyclage, économie circulaire",
          ],
        }),
        {
          type: "statusCard",
          data: {
            eyebrow: "Horaires & disponibilité",
            title: "Le Déchèt’Lab est-il ouvert ?",
            subtitle:
              "Le voyant se met à jour automatiquement selon les horaires d’ouverture : vert quand je suis en poste, rouge quand le site est fermé. Hors horaires, écrivez-moi : je réponds à la réouverture.",
            photoUrl: "",
            photoAlt: "",
            photoName: "",
            photoRole: "",
            openNote: "",
            closedNote: "",
            emailLabel: "Écrire à l’encadrant",
            phoneLabel: "Appeler le Déchèt’Lab",
            showSchedule: "yes",
          },
        },
        {
          type: "features",
          data: {
            eyebrow: "Le site en bref",
            title: "Ce que propose le Déchèt’Lab",
            subtitle: "Un service aux professionnels, un terrain d’apprentissage pour les salariés en insertion.",
            columns: "4",
            items: [
              feature("♻️", "Tri & valorisation", "Les déchets sont triés par filière pour privilégier le réemploi, puis le recyclage."),
              feature("🏗️", "Professionnels du bâtiment", "Un accueil dédié aux entreprises et aux artisans, avec inscription et compte professionnel."),
              feature("🦺", "Sécurité", "Consignes de sécurité et procédures rappelées à chaque accueil, pour les usagers comme pour l’équipe."),
              feature("🎓", "Insertion & formation", "Les salariés en insertion y développent leurs compétences ; les usagers y sont sensibilisés au tri."),
            ],
          },
        },
        {
          type: "steps",
          data: {
            eyebrow: "Comment ça se passe",
            title: "Déposer vos déchets, étape par étape",
            subtitle: "Un fonctionnement simple, expliqué avant votre venue.",
            items: [
              { title: "1. S’inscrire", description: "Ouvrez votre compte professionnel : contactez-nous pour connaître la démarche et les documents à fournir." },
              { title: "2. Préparer le dépôt", description: "Renseignez-vous sur les déchets acceptés et les modalités de dépôt, puis triez vos matériaux avant de venir." },
              { title: "3. Venir aux horaires d’ouverture", description: "Présentez-vous pendant les horaires affichés sur le site : l’équipe vous accueille et vous oriente." },
              { title: "4. Tri et valorisation", description: "Vos déchets sont orientés vers le réemploi, le recyclage ou la filière adaptée." },
            ],
          },
        },
        gallery(
          ["MAHH90MKXkY", "MAHQEFBvSms", "MAHQENEHUPg"],
          ["Le site du Déchèt’Lab", "Zone de dépôt", "Espace de tri"],
          "Le Déchèt’Lab en images",
        ),
        {
          type: "faq",
          data: {
            eyebrow: "Questions fréquentes",
            title: "Vos questions sur le Déchèt’Lab",
            subtitle: "Pour une réponse précise, écrivez-moi : je vous réponds personnellement.",
            items: [
              { question: "Quels déchets sont acceptés ?", answer: "La liste dépend des filières disponibles. Contactez-nous avant de vous déplacer ou consultez eco-solidaire.fr/dechetlab : nous vous confirmons ce qui peut être déposé." },
              { question: "Comment ouvrir un compte ?", answer: "Écrivez-nous ou appelez-nous : nous vous indiquons les démarches d’inscription et les documents nécessaires." },
              { question: "Quels sont les tarifs ?", answer: "Les tarifs dépendent des déchets et des volumes. Demandez une information tarifaire via le formulaire de contact." },
              { question: "Quels sont les horaires d’ouverture ?", answer: "Ils sont affichés en haut du site, avec un voyant vert quand le Déchèt’Lab est ouvert et rouge quand il est fermé." },
              { question: "Que deviennent les déchets déposés ?", answer: "Le réemploi est privilégié, puis le recyclage. Le tri est assuré par l’équipe, composée de salariés en insertion encadrés." },
            ],
          },
        },
        cta(
          "Une question avant de venir ?",
          "Déchets acceptés, inscription, modalités de dépôt, tarifs : écrivez-moi ou appelez-moi.",
          "Contactez-nous",
          "/contact",
        ),
      ],
    },
    {
      slug: "depose-preservante",
      title: "Dépose préservante",
      navLabel: "Dépose préservante",
      inNav: true,
      seoTitle: "Dépose préservante — récupération de matériaux de construction | Médéric Verzeri",
      seoDescription:
        "Chantiers de dépose préservante encadrés avec des salariés en insertion : démontage soigné et récupération de matériaux de construction pour le réemploi.",
      blocks: [
        hero({
          eyebrow: "Chantiers en extérieur & en bâtiment",
          title: "Dépose préservante : donner une seconde vie aux matériaux.",
          subtitle:
            "J’encadre des équipes de salariés en insertion sur des chantiers où l’on démonte avec soin pour récupérer des matériaux de construction (dalles, plaques, vitrages et autres éléments réutilisables) destinés au réemploi.",
          imageUrl: ref("MAHQEXO8lMk"),
          imageAlt: "Deux salariés en insertion déposant des éléments dans un bâtiment en rénovation",
          primaryLabel: "Parler d’un chantier",
          primaryHref: "/contact",
          secondaryLabel: "Voir les photos",
          secondaryHref: "/#galerie",
          badges: [
            "Démontage soigné, matériaux préservés",
            "Sécurité et tri sur chantier",
            "Réemploi et recyclage en priorité",
          ],
        }),
        {
          type: "imageText",
          data: {
            eyebrow: "Le principe",
            title: "Qu’est-ce que la dépose préservante ?",
            subtitle: "",
            body: "Contrairement à une démolition classique, la dépose préservante consiste à démonter les éléments d’un bâtiment de façon soignée, pour qu’ils restent en bon état et puissent être réutilisés ou recyclés.\n\nCes chantiers allient apprentissage du geste technique, sécurité et sens du travail bien fait : ils offrent aux salariés en insertion une expérience concrète du secteur du bâtiment.",
            bullets: [
              "Dépose soignée pour préserver la qualité des matériaux",
              "Tri, conditionnement et transport des éléments récupérés",
              "Respect strict des consignes de sécurité sur chantier",
              "Orientation vers le réemploi et le recyclage",
            ],
            imageUrl: ref("MAHQEHvk8wY"),
            imageAlt: "Salariés déposant des dalles dans un plateau en cours de rénovation",
            imagePosition: "right",
            ctaLabel: "Découvrir BatiRE, réemploi du bâtiment",
            ctaHref: "/#entreprises",
          },
        },
        {
          type: "steps",
          data: {
            eyebrow: "Le déroulé",
            title: "Un chantier de dépose préservante",
            subtitle: "Du repérage au réemploi, quatre temps clés.",
            items: [
              { title: "1. Repérage", description: "Visite du chantier, identification des matériaux réutilisables et des contraintes de sécurité." },
              { title: "2. Dépose soignée", description: "Démontage méthodique avec les équipements de protection adaptés, sans abîmer les éléments." },
              { title: "3. Tri et conditionnement", description: "Les matériaux sont triés, protégés et stockés pour rester en bon état." },
              { title: "4. Réemploi et valorisation", description: "Les éléments récupérés sont orientés vers le réemploi ; le reste suit les filières de recyclage." },
            ],
          },
        },
        gallery(
          ["MAHQEL_-oK8", "MAHQEVbADLk", "MAHQEKFy2QY", "MAHQEFWfofY"],
          ["Plateau avant dépose", "Dépose des éléments de plafond", "Évacuation des matériaux", "Plaques récupérées"],
          "Sur le terrain",
        ),
        cta(
          "Un chantier de dépose en vue ?",
          "Parlons de votre projet : nature du bâtiment, matériaux concernés, calendrier.",
          "Contactez-nous",
          "/contact",
        ),
      ],
    },
    {
      slug: "formation",
      title: "Formation",
      navLabel: "Formation",
      inNav: true,
      seoTitle: "Formation des salariés en insertion — conception et animation | Médéric Verzeri",
      seoDescription:
        "Conception de formations sur mesure, de l’élaboration des contenus jusqu’à leur animation auprès des salariés en insertion et des professionnels du bâtiment (tri).",
      blocks: [
        hero({
          eyebrow: "Formation",
          title: "De la conception des contenus à leur animation.",
          subtitle:
            "Je conçois mes propres formations et je les anime moi-même auprès des salariés en insertion, ainsi qu’auprès des professionnels du bâtiment sur le tri des déchets.",
          imageUrl: ref("MAGTteXqos0"),
          imageAlt: "Participants à une formation, ordinateurs portables ouverts",
          primaryLabel: "Parler d’une formation",
          primaryHref: "/contact",
          badges: [
            "Contenus conçus sur mesure",
            "Animation en situation réelle de travail",
            "Salariés en insertion et professionnels du bâtiment",
          ],
        }),
        {
          type: "steps",
          data: {
            eyebrow: "Ma démarche",
            title: "Concevoir, animer, vérifier",
            subtitle: "Une formation utile est d’abord une formation construite à partir du terrain.",
            items: [
              { title: "1. Analyse des besoins", description: "Observation de l’activité, repérage des gestes et des consignes à acquérir, échange avec les salariés et l’équipe." },
              { title: "2. Conception des contenus", description: "Création des supports, exercices et mises en situation adaptés au public et aux conditions de travail." },
              { title: "3. Animation", description: "Dispense de la formation sur le lieu d’activité : démonstrations, pratique encadrée, échanges." },
              { title: "4. Suivi des acquis", description: "Vérification de la mise en pratique et ajustement des contenus pour la session suivante." },
            ],
          },
        },
        {
          type: "features",
          data: {
            eyebrow: "Publics & thèmes",
            title: "À qui s’adressent mes formations ?",
            subtitle: "",
            columns: "3",
            items: [
              feature("🧑‍🔧", "Salariés en insertion", "Développer ses compétences techniques, la sécurité et les bons réflexes professionnels."),
              feature("🏗️", "Professionnels du bâtiment", "Formation au tri des déchets de chantier pour faciliter le réemploi et le recyclage."),
              feature("♻️", "Économie circulaire", "Sensibilisation aux enjeux du réemploi, du recyclage et de la réduction des déchets."),
            ],
          },
        },
        cta(
          "Un besoin de formation ?",
          "Décrivez-moi votre public et votre contexte : nous construirons ensemble un contenu adapté.",
          "Contactez-nous",
          "/contact",
        ),
      ],
    },
    {
      slug: "contact",
      title: "Contact",
      navLabel: "Contact",
      inNav: false,
      seoTitle: "Contactez Médéric Verzeri — Déchèt’Lab",
      seoDescription: "Téléphone, e-mail, formulaire de contact et horaires du Déchèt’Lab.",
      blocks: [
        {
          type: "contactHub",
          data: {
            anchor: "contact",
            number: "",
            title: "Contactez-nous",
            portraitUrl: "",
            welcome: "À votre écoute,",
            lead: "Pour répondre\nà vos besoins.",
            question: "Vous avez une question concernant",
            subject: "le Déchèt’Lab ?",
            choice: "Choisissez le moyen qui vous convient.",
            invitation: "N’hésitez pas à nous contacter",
            colleaguesTitle: "Votre contact développement",
            formTitle: "Ou écrivez-moi directement",
            successMessage: "Merci, votre message a bien été transmis. Je reviens vers vous rapidement.",
            topics: DECHETLAB_TOPICS,
            channels: [
              { kind: "web", title: "Site web", text: "eco-solidaire.fr/dechetlab", href: "https://eco-solidaire.fr/dechetlab", button: "Visiter le site", text2: "", href2: "", button2: "" },
              { kind: "phone", title: "Téléphone", text: "06.10.50.87.83", href: "tel:0610508783", button: "Appeler", text2: "07 69 29 48 12", href2: "tel:+33769294812", button2: "Appeler" },
              { kind: "mail", title: "E-mail", text: "m.verzeri@eco-solidaire.fr", href: "mailto:m.verzeri@eco-solidaire.fr", button: "Envoyer un e-mail", text2: "", href2: "", button2: "" },
            ],
            colleagues: [
              { name: "Lydia Charpentier", role: "En charge du développement", email: "l.charpentier@eco-solidaire.fr", phone: "06.09.88.36.47", siteHref: "!/developpement", imageUrl: "" },
            ],
          },
        },
      ],
    },
    legalPage("Médéric Verzeri", "Médéric Verzeri"),
  ],
};

/* ------------------------------------------------------------------ */
/* SITE 2 — LYDIA CHARPENTIER, EN CHARGE DU DÉVELOPPEMENT              */
/* ------------------------------------------------------------------ */

const developpement: SeedSite = {
  key: "developpement",
  name: "Lydia CHARPENTIER",
  shortName: "Lydia Charpentier",
  role: "En charge du développement · Éco-Solidaire",
  tagline: "Développement des partenariats en économie circulaire",
  logoMark: "LC",
  primaryColor: "#1d4ed8",
  accentColor: "#f97316",
  heroImageUrl: ref("MAHP9uxt3lE"),
  contactEmail: "l.charpentier@eco-solidaire.fr",
  contactPhone: "06 09 88 36 47",
  notificationEmail: "l.charpentier@eco-solidaire.fr",
  address: "Groupe Éco-Solidaire\nBeauvais (Oise)",
  openingHours: "Du lundi au vendredi · 9h–12h30 et 14h–17h30",
  schedule: {
    mon: { closed: false, ranges: [{ start: "09:00", end: "12:30" }, { start: "14:00", end: "17:30" }] },
    tue: { closed: false, ranges: [{ start: "09:00", end: "12:30" }, { start: "14:00", end: "17:30" }] },
    wed: { closed: false, ranges: [{ start: "09:00", end: "12:30" }, { start: "14:00", end: "17:30" }] },
    thu: { closed: false, ranges: [{ start: "09:00", end: "12:30" }, { start: "14:00", end: "17:30" }] },
    fri: { closed: false, ranges: [{ start: "09:00", end: "12:30" }, { start: "14:00", end: "17:30" }] },
    sat: { closed: true, ranges: OPEN_RANGES },
    sun: { closed: true, ranges: OPEN_RANGES },
  },
  statusNoteOpen: "Au bureau — disponible pour vos demandes",
  statusNoteClosed: "Bureau fermé — votre message sera traité à la réouverture",
  photoUrl: "",
  photoAlt: "Lydia Charpentier, en charge du développement",
  photoName: "Lydia CHARPENTIER",
  photoRole: "En charge du développement",
  marqueeEnabled: true,
  marqueeText: "Partenariats · Déchèterie pro Déchèt’Lab · Dépose préservante · Formation",
  marqueeSpeed: "normal",
  navLinks: [
    { label: "Accueil", href: "/#accueil" },
    { label: "À propos de moi", href: "/#apropos" },
    { label: "Nos entreprises", href: "/#entreprises" },
    { label: "Galerie", href: "/#galerie" },
    { label: "Contactez-nous", href: "/#contact" },
  ],
  textureUrl: ref("MAHQDlSEorY"),
  footerNote:
    "Développement des partenariats du groupe Éco-Solidaire : déchèterie professionnelle Déchèt’Lab, dépose préservante, formation et réseau d’entreprises d’économie circulaire.",
  legalNote: "La Maison d’économie solidaire · Aucun outil de suivi publicitaire",
  ctaLabel: "Contactez-nous",
  ctaHref: "/#contact",
  bannerEnabled: false,
  bannerText: "Un projet de partenariat ? Parlons-en.",
  bannerHref: "/#contact",
  seoTitle: "Lydia Charpentier — En charge du développement · Éco-Solidaire",
  seoDescription:
    "Développement et partenariats du groupe Éco-Solidaire (Beauvais) : déchèterie professionnelle Déchèt’Lab, dépose préservante, formation, entreprises d’économie circulaire.",
  pages: [
    {
      slug: "accueil",
      title: "Accueil",
      navLabel: "Accueil",
      isHome: true,
      inNav: false,
      seoTitle: "Lydia Charpentier — En charge du développement · Éco-Solidaire",
      seoDescription:
        "Partenariats, déchèterie professionnelle Déchèt’Lab, dépose préservante et formation : le développement du groupe Éco-Solidaire.",
      blocks: [
        {
          type: "homeHero",
          data: {
            anchor: "accueil",
            eyebrow: "Développement · Économie circulaire · Beauvais",
            title: "En charge du développement",
            accent: "au sein du groupe",
            logoUrl: ref("MAHKtLJ1U8A"),
            logoAlt: "La Maison d’économie solidaire",
            primaryLabel: "Contactez-nous",
            primaryHref: "/#contact",
            secondaryLabel: "À propos de moi",
            secondaryHref: "/#apropos",
            portraitUrl: "",
            portraitAlt: "Lydia Charpentier",
            signatureName: "Lydia CHARPENTIER",
            sideLabel: "Développement · Partenariats",
            showHours: "yes",
            hoursTitle: "Horaires de disponibilité",
          },
        },
        {
          type: "aboutMe",
          data: {
            anchor: "apropos",
            number: "01",
            title: "À propos de moi",
            introTitle: "En charge du développement",
            introduction:
              "Je suis en charge du développement au sein du groupe Éco-Solidaire (La Maison d’économie solidaire).\n\nMon rôle est de faire connaître les activités du groupe, de construire des partenariats avec les entreprises, les collectivités et les acteurs du territoire, et d’accompagner leurs demandes.\n\nJe travaille en lien étroit avec Médéric Verzeri, encadrant technique d’insertion au Déchèt’Lab, pour proposer des solutions concrètes : dépôt de déchets professionnels, dépose préservante, formations.",
            missionsTitle: "Mes principales missions",
            missions: [
              "Développer les relations avec les entreprises, collectivités et partenaires du territoire.",
              "Répondre aux demandes d’information, de devis et de prestations.",
              "Faire connaître les activités du groupe : Déchèt’Lab, réemploi, formation.",
              "Assurer le lien avec les équipes d’encadrement technique.",
              "Suivre les partenariats dans la durée.",
            ],
            image1Url: ref("MAHP9uxt3lE"),
            image1Alt: "La Maison d’économie solidaire",
            image2Url: ref("MAHQEPH4wJU"),
            image2Alt: "Entrée de la déchèterie professionnelle Déchèt’Lab",
          },
        },
        {
          type: "activities",
          data: {
            anchor: "missions",
            number: "02",
            title: "Ce que nous pouvons construire ensemble",
            subtitle: "Trois services portés avec l’équipe d’encadrement technique.",
            items: [
              {
                title: "Déchèterie professionnelle Déchèt’Lab",
                kicker: "Déchèterie pro",
                imageUrl: ref("MAHH99XUvjk"),
                description: "Un service de proximité pour les professionnels du bâtiment : dépôt, tri et valorisation de leurs déchets.",
                bullets: ["Inscription et compte professionnel", "Tri et orientation vers le réemploi", "Un site qui forme des salariés en insertion"],
                href: "https://eco-solidaire.fr/dechetlab",
                linkLabel: "Visiter le site du Déchèt’Lab",
              },
              {
                title: "Dépose préservante",
                kicker: "Chantiers",
                imageUrl: ref("MAHQEXO8lMk"),
                description: "Des chantiers de démontage soigné pour récupérer des matériaux de construction en vue de leur réemploi.",
                bullets: ["Interventions encadrées par un professionnel", "Matériaux triés et préservés", "Réemploi et recyclage"],
                href: "!/depose-preservante",
                linkLabel: "Voir les chantiers",
              },
              {
                title: "Formation",
                kicker: "Formation",
                imageUrl: ref("MAGTteXqos0"),
                description: "Des formations conçues sur mesure, de l’élaboration des contenus jusqu’à leur animation.",
                bullets: ["Salariés en insertion", "Professionnels du bâtiment (tri)", "Contenus adaptés à votre contexte"],
                href: "!/formation",
                linkLabel: "Découvrir la démarche",
              },
            ],
          },
        },
        companiesBlock(),
        albumsBlock(),
        {
          type: "contactHub",
          data: {
            anchor: "contact",
            number: "05",
            title: "Contactez-nous",
            portraitUrl: "",
            welcome: "À votre écoute,",
            lead: "Pour construire\nun partenariat.",
            question: "Vous avez un projet ou une question concernant",
            subject: "nos activités ?",
            choice: "Choisissez le moyen qui vous convient.",
            invitation: "N’hésitez pas à nous contacter",
            colleaguesTitle: "Votre contact encadrement technique",
            formTitle: "Ou écrivez-moi directement",
            successMessage: "Merci, votre message a bien été transmis. Je reviens vers vous rapidement.",
            topics: [
              { icon: "♻", title: "Dépôt de\ndéchets pros" },
              { icon: "▣", title: "Dépose\npréservante" },
              { icon: "+", title: "Formation" },
              { icon: "◆", title: "Partenariat" },
              { icon: "◷", title: "Devis" },
              { icon: "…", title: "Autre\nquestion" },
            ],
            channels: [
              { kind: "web", title: "Site web", text: "eco-solidaire.fr", href: "https://eco-solidaire.fr", button: "Visiter le site", text2: "", href2: "", button2: "" },
              { kind: "phone", title: "Téléphone", text: "06.09.88.36.47", href: "tel:0609883647", button: "Appeler", text2: "", href2: "", button2: "" },
              { kind: "mail", title: "E-mail", text: "l.charpentier@eco-solidaire.fr", href: "mailto:l.charpentier@eco-solidaire.fr", button: "Envoyer un e-mail", text2: "", href2: "", button2: "" },
            ],
            colleagues: [
              { name: "Médéric Verzeri", role: "Encadrant technique d’insertion · Déchèt’Lab", email: "m.verzeri@eco-solidaire.fr", phone: "06.10.50.87.83", siteHref: "!/", imageUrl: ref("MAHQDsvF0sc") },
            ],
          },
        },
      ],
    },
    {
      slug: "offres",
      title: "Nos services",
      navLabel: "Nos services",
      inNav: true,
      seoTitle: "Nos services aux entreprises et collectivités — Lydia Charpentier",
      seoDescription:
        "Dépôt de déchets professionnels, dépose préservante, formation et partenariats : ce que le groupe Éco-Solidaire peut vous proposer.",
      blocks: [
        hero({
          eyebrow: "Nos services",
          title: "Des solutions concrètes pour les professionnels.",
          subtitle:
            "Déchets de chantier, matériaux à récupérer, besoin de formation ou envie de partenariat : voici ce que nous pouvons construire ensemble.",
          imageUrl: ref("MAHH99XUvjk"),
          imageAlt: "Déchèterie professionnelle Déchèt’Lab",
          primaryLabel: "Décrire mon besoin",
          primaryHref: "/contact",
        }),
        {
          type: "offers",
          data: {
            eyebrow: "Le détail",
            title: "Quatre manières de travailler ensemble",
            subtitle: "Chaque demande est étudiée avec l’équipe d’encadrement technique.",
            items: [
              {
                title: "Déposer vos déchets au Déchèt’Lab",
                price: "Sur demande",
                description: "La déchèterie professionnelle accueille les professionnels du bâtiment, avec tri et orientation vers le réemploi.",
                features: ["Inscription et compte professionnel", "Modalités de dépôt expliquées avant la venue", "Tri par une équipe en insertion encadrée"],
                ctaLabel: "Poser une question",
                ctaHref: "/contact",
              },
              {
                title: "Dépose préservante",
                price: "Sur étude",
                description: "Démontage soigné d’éléments de bâtiment pour récupérer des matériaux destinés au réemploi.",
                features: ["Chantiers encadrés en extérieur et en bâtiment", "Matériaux triés et préservés", "Orientation vers le réemploi et le recyclage"],
                ctaLabel: "Parler d’un chantier",
                ctaHref: "/contact",
              },
              {
                title: "Formation sur mesure",
                price: "Sur demande",
                description: "Formations conçues puis animées par l’encadrant technique, auprès de salariés en insertion ou de professionnels.",
                features: ["Analyse du besoin", "Contenus et supports conçus sur mesure", "Animation sur le lieu d’activité"],
                ctaLabel: "Parler d’une formation",
                ctaHref: "/contact",
              },
              {
                title: "Partenariat & achats solidaires",
                price: "Échangeons",
                description: "Entreprises, collectivités, structures du territoire : construisons un partenariat utile à l’emploi local.",
                features: ["Mise en relation avec les entreprises du groupe", "Un interlocuteur identifié", "Suivi dans la durée"],
                ctaLabel: "Proposer un partenariat",
                ctaHref: "/contact",
              },
            ],
          },
        },
        cta(
          "Un besoin précis ?",
          "Décrivez-le en quelques lignes : je vous réponds et, si besoin, je vous mets en relation avec l’encadrant technique.",
          "Contactez-nous",
          "/contact",
        ),
      ],
    },
    {
      slug: "contact",
      title: "Contact",
      navLabel: "Contact",
      inNav: false,
      seoTitle: "Contacter Lydia Charpentier — Éco-Solidaire",
      seoDescription: "Téléphone, e-mail, formulaire de contact et horaires de disponibilité.",
      blocks: [
        {
          type: "contactHub",
          data: {
            anchor: "contact",
            number: "",
            title: "Contactez-nous",
            portraitUrl: "",
            welcome: "À votre écoute,",
            lead: "Pour construire\nun partenariat.",
            question: "Vous avez un projet ou une question concernant",
            subject: "nos activités ?",
            choice: "Choisissez le moyen qui vous convient.",
            invitation: "N’hésitez pas à nous contacter",
            colleaguesTitle: "Votre contact encadrement technique",
            formTitle: "Ou écrivez-moi directement",
            successMessage: "Merci, votre message a bien été transmis. Je reviens vers vous rapidement.",
            topics: [
              { icon: "♻", title: "Dépôt de\ndéchets pros" },
              { icon: "▣", title: "Dépose\npréservante" },
              { icon: "+", title: "Formation" },
              { icon: "◆", title: "Partenariat" },
              { icon: "◷", title: "Devis" },
              { icon: "…", title: "Autre\nquestion" },
            ],
            channels: [
              { kind: "web", title: "Site web", text: "eco-solidaire.fr", href: "https://eco-solidaire.fr", button: "Visiter le site", text2: "", href2: "", button2: "" },
              { kind: "phone", title: "Téléphone", text: "06.09.88.36.47", href: "tel:0609883647", button: "Appeler", text2: "", href2: "", button2: "" },
              { kind: "mail", title: "E-mail", text: "l.charpentier@eco-solidaire.fr", href: "mailto:l.charpentier@eco-solidaire.fr", button: "Envoyer un e-mail", text2: "", href2: "", button2: "" },
            ],
            colleagues: [
              { name: "Médéric Verzeri", role: "Encadrant technique d’insertion · Déchèt’Lab", email: "m.verzeri@eco-solidaire.fr", phone: "06.10.50.87.83", siteHref: "!/", imageUrl: ref("MAHQDsvF0sc") },
            ],
          },
        },
      ],
    },
    legalPage("Lydia Charpentier", "Lydia Charpentier"),
  ],
};

// Les informations opérationnelles sont partagées avec les fiches « Contactez-nous ».
const encadrantWithCurrentRules: SeedSite = {
  ...encadrant,
  pages: encadrant.pages.map((page) => {
    if (page.slug !== "dechet-lab") return page;
    const updated = page.blocks.map((block) => ({
      ...block,
      data: { ...block.data, ...(DECHETLAB_BLOCK_PATCHES[block.type] ?? {}) },
    }));
    const faqIndex = updated.findIndex((block) => block.type === "faq");
    updated.splice(faqIndex < 0 ? updated.length : faqIndex, 0, ...DECHETLAB_EXTRA_BLOCKS);
    return { ...page, blocks: updated };
  }),
};

export const DEFAULT_SITES: SeedSite[] = [encadrantWithCurrentRules, developpement].map(makeMultipageSite);
