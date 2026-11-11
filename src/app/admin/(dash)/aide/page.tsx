import Link from "next/link";

export const dynamic = "force-dynamic";

const STEPS = [
  {
    title: "1. Décompresser la livraison complète",
    body: "Décompressez le ZIP livré. Le dossier dechet-lab-vercel doit contenir package.json, package-lock.json, tsconfig.json, next.config.ts, vercel.json, scripts, src et public. Toutes les photos et les configurations sont déjà incluses. Aucun outil de récupération dans l’aperçu n’est nécessaire.",
  },
  {
    title: "2. Publier le code sur GitHub",
    body: "Avec GitHub Desktop : File → Add local repository, sélectionnez le dossier du projet, créez le dépôt si l’application le propose, puis Publish repository en conservant Keep this code private. Ne publiez aucun fichier .env. Le fichier package.json doit être à la racine du dépôt.",
  },
  {
    title: "3. Importer dans Vercel",
    body: "Dans Vercel : Add New → Project, importez le dépôt. Gardez Next.js, la commande du fichier vercel.json (contrôle du projet puis compilation) et le dossier de sortie par défaut. Si le premier build échoue avec DATABASE_URL is required, le projet a tout de même été créé : poursuivez la configuration puis redéployez.",
  },
  {
    title: "4. Relier PostgreSQL et renseigner les variables",
    body: "Dans Storage / Marketplace du projet, connectez une nouvelle base PostgreSQL via Neon pour Production. Vérifiez DATABASE_URL dans Settings → Environment Variables, puis ajoutez un ADMIN_PASSWORD robuste, un ADMIN_SESSION_SECRET aléatoire d’au moins 32 caractères et PRIMARY_SITE_KEY=encadrant. Ne mettez jamais une URL localhost dans Vercel.",
  },
  {
    title: "5. Laisser la première installation se préparer",
    body: "Sur une base PostgreSQL neuve, les tables sont créées automatiquement au premier accès, puis les contenus sont installés à l’ouverture de l’accueil. Une base complète existante est conservée. Si le schéma est partiel, l’installation s’arrête sans supprimer de table pour permettre une vérification.",
  },
  {
    title: "6. Redéployer et vérifier",
    body: "Dans Vercel → Deployments, choisissez le déploiement de Production puis … → Redeploy. Attendez Ready. Ouvrez l’adresse vercel.app et testez les onglets, la galerie, /admin, l’enregistrement d’un texte et un formulaire. /api/health doit indiquer ok: true. Les contenus initiaux s’installent au premier chargement de l’accueil.",
  },
  {
    title: "7. Activer les e-mails si souhaité",
    body: "Pour recevoir les demandes dans votre boîte, configurez Resend avec un domaine d’envoi vérifié, puis ajoutez RESEND_API_KEY et CONTACT_FROM_EMAIL dans Vercel et redéployez. Sans cette configuration, les messages restent dans l’admin, mais aucune notification par e-mail n’est garantie.",
  },
];

const ENV_VARS = [
  {
    name: "DATABASE_URL",
    detail: "Obligatoire. Chaîne de connexion PostgreSQL de l’intégration reliée dans Storage / Marketplace du projet Vercel.",
  },
  {
    name: "ADMIN_PASSWORD",
    detail: "Obligatoire pour la publication. Choisissez un mot de passe robuste, différent de celui de démonstration.",
  },
  {
    name: "ADMIN_SESSION_SECRET",
    detail: "Obligatoire pour la publication. Secret aléatoire long utilisé pour signer le cookie de connexion.",
  },
  {
    name: "PRIMARY_SITE_KEY",
    detail: "Site affiché à la racine. « encadrant » par défaut, « developpement » pour l'autre.",
  },
  {
    name: "RESEND_API_KEY",
    detail:
      "Optionnel mais recommandé : clé gratuite resend.com pour recevoir chaque demande par e-mail. Sans clé, les messages restent dans l'admin et le visiteur peut vous écrire directement.",
  },
  {
    name: "CONTACT_FROM_EMAIL",
    detail:
      "Adresse d'expédition des notifications, par exemple « Déchet'Lab <contact@eco-solidaire.fr> » après vérification du domaine sur Resend.",
  },
];

export default function AdminHelpPage() {
  return (
    <div>
      <div className="admin-topbar">
        <div>
          <h1 className="admin-title">Déploiement sur Vercel</h1>
          <p className="admin-sub">
            Préparer et publier le site et son espace admin sur Vercel, la seule plateforme de déploiement retenue.
          </p>
        </div>
        <Link href="/admin" className="a-btn">
          ← Vue d&apos;ensemble
        </Link>
      </div>

      <div style={{ display: "grid", gap: "1rem" }}>
        <section className="admin-card" style={{ borderColor: "#bfdbfe", background: "#eff6ff" }}>
          <p className="pill" style={{ marginBottom: "0.6rem" }}>Projet préparé pour Vercel</p>
          <h2>Une seule plateforme de publication : Vercel</h2>
          <p className="admin-sub" style={{ marginTop: "0.5rem" }}>
            Les pages, les images du projet et l’espace admin sont servis par le même déploiement
            Next.js. La base PostgreSQL, nécessaire pour conserver les modifications et les messages,
            se relie depuis le tableau de bord Vercel via Storage / Marketplace. La configuration
            fournie ne crée pas automatiquement un compte ou un projet dans votre compte Vercel.
          </p>
        </section>
        <section className="admin-card" style={{ borderColor: "#fde68a", background: "#fffbeb" }}>
          <h2>À vérifier avant de choisir l’offre Vercel</h2>
          <p className="admin-sub" style={{ marginTop: "0.5rem" }}>
            L’offre gratuite Hobby est réservée aux usages personnels non commerciaux. Un site
            présentant des prestations professionnelles et des tarifs peut nécessiter Pro. Les
            quotas et tarifs de la base et du service d’e-mail sont distincts. Vérifiez les{" "}
            <a href="https://vercel.com/docs/limits/fair-use-guidelines" target="_blank" rel="noopener noreferrer">
              conditions officielles de Vercel
            </a>{" "}
            avant publication : la gratuité n’est pas garantie pour un usage commercial.
          </p>
        </section>
        <section className="admin-card">
          <h2>Architecture : deux sites, une seule application</h2>
          <p className="admin-sub" style={{ marginTop: "0.4rem" }}>
            La même application sert les deux sites avec des contenus totalement séparés :
          </p>
          <ul style={{ margin: "0.7rem 0 0", paddingLeft: "1.1rem", fontSize: "0.9rem", display: "grid", gap: "0.4rem" }}>
            <li>
              <strong>Votre site (encadrant technique)</strong> : accessible à la racine{" "}
              <code>/</code> et à <code>/encadrant</code>.
            </li>
            <li>
              <strong>Le site de votre collègue (développement de l&apos;entreprise)</strong> :
              accessible à <code>/developpement</code>, avec ses propres pages, textes, couleurs et
              messages.
            </li>
            <li>
              Chaque site possède ses réglages, ses pages et des sections réutilisables entièrement
              modifiables depuis cet espace.
            </li>
          </ul>
          <p className="note" style={{ fontSize: "0.85rem" }}>
            Pour donner à votre collègue une adresse totalement séparée : dupliquez ce projet sur un
            second projet Vercel, avec une offre adaptée à votre usage, connectez-le à la même base et définissez{" "}
            <code>PRIMARY_SITE_KEY=developpement</code>. Son site s&apos;affichera alors à la racine
            de son domaine, sans jamais toucher à votre contenu.
          </p>
        </section>

        <section className="admin-card">
          <h2>Navigation par pages et gestion des contenus</h2>
          <p className="admin-sub" style={{ marginTop: "0.4rem" }}>
            Chaque onglet du menu ouvre sa propre page. Les textes, les photos et les liens se
            modifient toujours dans « Pages &amp; contenus » :
          </p>
          <ol style={{ margin: "0.7rem 0 0", paddingLeft: "1.1rem", fontSize: "0.9rem", display: "grid", gap: "0.4rem" }}>
            <li><strong>Accueil — logo, titre &amp; portrait</strong> : titre, logo, boutons, portrait avec anneau vert/rouge et bandeau d&apos;horaires.</li>
            <li><strong>À propos de moi</strong> (<code>/a-propos</code>) : présentation, missions et photos.</li>
            <li><strong>Mes missions</strong> : déchèterie, dépose préservante, formation (cartes photo avec lien vers une page dédiée).</li>
            <li><strong>Nos entreprises</strong> (<code>/nos-entreprises</code>) : carrousel de cartes avec photos, logos et liens.</li>
            <li><strong>Galerie</strong> (<code>/galerie</code>) : albums photo et visionneuse, avec tous les visuels conservés.</li>
            <li><strong>Contactez-nous</strong> (<code>/contact</code>) : deux contacts d’orientation (Médéric pour l’exploitation, les déchets et l’inscription ; Lydia pour le développement). Chaque sujet possède une action (fiche, lien direct ou formulaire), un texte, des étapes, un avertissement et jusqu’à deux tarifs. « Inscription &amp; compte » mène directement au site officiel.</li>
            <li><strong>Horaires</strong> : dans les réglages du site, choisissez pour chaque jour « Ouverture normale », « Sur rendez-vous uniquement » ou « Fermé », puis précisez les conditions d’accueil. Un jour sur rendez-vous ne déclenche pas automatiquement le voyant vert.</li>
          </ol>
          <p className="note" style={{ fontSize: "0.85rem" }}>
            Le menu se règle dans <strong>Réglages → Menu du site</strong> : une ligne par lien, au
            format « Libellé | adresse ». <code>/a-propos</code> ouvre la page « À propos de moi » ;
            <code>!/developpement</code> mène à l&apos;autre site. Les images de la bibliothèque
            (vos photos, logos et visuels des entreprises) sont proposées dans chaque champ image.
          </p>
        </section>

        <section className="admin-card">
          <h2>Installation guidée : 7 étapes</h2>
          <div style={{ display: "grid", gap: "0.7rem", marginTop: "0.75rem" }}>
            {STEPS.map((step) => (
              <div
                key={step.title}
                style={{
                  border: "1px solid #e2e8f0",
                  borderRadius: 12,
                  padding: "0.85rem 1rem",
                  background: "#fbfcfe",
                }}
              >
                <strong style={{ fontSize: "0.92rem" }}>{step.title}</strong>
                <p style={{ fontSize: "0.87rem", color: "#3d4859", marginTop: "0.3rem" }}>{step.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="admin-card">
          <h2>Variables d&apos;environnement</h2>
          <table className="admin-table" style={{ marginTop: "0.6rem" }}>
            <thead>
              <tr>
                <th>Nom</th>
                <th>Rôle</th>
              </tr>
            </thead>
            <tbody>
              {ENV_VARS.map((variable) => (
                <tr key={variable.name}>
                  <td>
                    <code>{variable.name}</code>
                  </td>
                  <td>{variable.detail}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="admin-sub" style={{ marginTop: "0.7rem" }}>
            Sur Vercel : Project → Settings → Environment Variables. Après une modification,
            relancez un déploiement pour que la valeur soit prise en compte.
          </p>
        </section>

        <section className="admin-card">
          <h2>Recevoir les demandes à m.verzeri@eco-solidaire.fr</h2>
          <ol style={{ margin: "0.6rem 0 0", paddingLeft: "1.1rem", fontSize: "0.9rem", display: "grid", gap: "0.45rem" }}>
            <li>
              Créez un compte sur <strong>resend.com</strong>, vérifiez votre domaine d’envoi et
              générez une clé API. Les quotas dépendent de l’offre choisie.
            </li>
            <li>
              Sur Vercel, ajoutez <code>RESEND_API_KEY</code> et <code>CONTACT_FROM_EMAIL</code>
              (une adresse du domaine vérifié), puis redéployez.
            </li>
            <li>
              Chaque demande du formulaire part alors automatiquement vers l&apos;adresse de
              réception définie dans les réglages du site (par défaut{" "}
              <code>m.verzeri@eco-solidaire.fr</code>), qui sert aussi d&apos;adresse de réponse.
            </li>
            <li>
              Sans clé API, rien n&apos;est perdu : les demandes sont dans « Messages » et le bouton
              « Écrire directement » ouvre la messagerie du visiteur avec le message pré-rempli.
            </li>
          </ol>
        </section>

        <section className="admin-card">
          <h2>Sécurité & sauvegarde</h2>
          <ul style={{ margin: "0.6rem 0 0", paddingLeft: "1.1rem", fontSize: "0.9rem", display: "grid", gap: "0.45rem" }}>
            <li>
              Changez le mot de passe de démonstration en définissant <code>ADMIN_PASSWORD</code>.
              L&apos;espace admin n&apos;est accessible qu&apos;avec ce mot de passe.
            </li>
            <li>
              Le cookie de session est signé, valable 12 heures et inaccessible au JavaScript du
              navigateur.
            </li>
            <li>
              Les pages du site public n&apos;utilisent que des cookies techniques : pas de bandeau
              de consentement, pas de traqueur publicitaire.
            </li>
            <li>
              Sauvegardez régulièrement la base PostgreSQL. Les possibilités de restauration et leur
              durée de conservation dépendent du fournisseur et de l’offre choisis dans le projet Vercel.
            </li>
            <li>
              La « Zone sensible » de chaque site permet de revenir aux contenus d&apos;origine si une
              manipulation a abîmé une page.
            </li>
          </ul>
        </section>

        <section className="admin-card">
          <h2>Bonnes pratiques de rédaction</h2>
          <ul style={{ margin: "0.6rem 0 0", paddingLeft: "1.1rem", fontSize: "0.9rem", display: "grid", gap: "0.45rem" }}>
            <li>Gardez des paragraphes courts (3 à 4 lignes) et un seul message par section.</li>
            <li>
              Écrivez les titres de sections en phrases lisibles : c&apos;est ce que liront en premier
              les personnes qui arrivent sur le site.
            </li>
            <li>
              Chaque image doit avoir une description : elle est lue par les personnes malvoyantes
              et améliore le référencement.
            </li>
            <li>
              Utilisez le bouton « A+ / Contraste » en haut du site pour vérifier la lisibilité de vos
              couleurs.
            </li>
            <li>
              Les liens internes commencent par <code>/</code> (exemple : <code>/contact</code>) :
              ils s&apos;adaptent automatiquement au site concerné.
            </li>
          </ul>
          <p className="note" style={{ fontSize: "0.85rem" }}>
            Les photos et logos du projet se trouvent dans <code>public/images</code> : ils sont
            servis par le déploiement Vercel. Vous pouvez les remplacer dans l’admin par une adresse
            d’image ou ajouter vos photos au projet puis indiquer leur chemin, par exemple{" "}
            <code>/images/ma-photo.jpg</code>.
          </p>
        </section>
      </div>
    </div>
  );
}
