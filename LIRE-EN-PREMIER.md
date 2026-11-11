# Livraison complète — site de Médéric Verzeri

Ce dossier est un projet Next.js complet pour Vercel : sources, configurations, images,
interface d’administration et initialisation d’une base PostgreSQL neuve.
Aucun workflow, copie Base64 ou outil de récupération dans l’aperçu n’est nécessaire.

## 1. Mettre le dossier complet sur GitHub

- Décompresser le ZIP.
- Ouvrir le dossier `dechet-lab-vercel` : `package.json` doit être directement à l’intérieur.
- Avec GitHub Desktop, cloner ou ouvrir le dépôt `SITE-WEB-MEDERIC`.
- Remplacer les anciens fichiers du site par **tout le contenu** de ce dossier.
- Conserver le dossier `.git` du dépôt et vos éventuels fichiers `.env` privés ; ne pas les publier.
- Vérifier la présence de `src`, `public`, `scripts`, `tsconfig.json`, `package-lock.json`,
  `next.config.ts`, `postcss.config.mjs` et `vercel.json`.
- Faire **Commit to main**, puis **Push origin**.

Les photos sont déjà dans `public/images`. Le code n’a pas besoin de les récupérer depuis
un ancien site. Les anciennes actions de préparation ne sont pas nécessaires à cette livraison.

## 2. Paramétrer le projet Vercel

Dans le projet relié à ce dépôt :

- Framework : **Next.js**.
- Root Directory : le dossier contenant `package.json` et `tsconfig.json`, normalement la racine.
- Build Command : conserver celle du fichier `vercel.json`.
- Output Directory : valeur par défaut.
- Node.js : **22.x** si la version est à choisir.

Dans **Settings → Environment Variables**, pour **Production** :

| Nom exact | Valeur |
| --- | --- |
| `DATABASE_URL` | La connexion à votre base PostgreSQL distante reliée au projet Vercel |
| `ADMIN_PASSWORD` | Votre mot de passe admin robuste et unique |
| `ADMIN_SESSION_SECRET` | Un secret aléatoire long, d’au moins 32 caractères |
| `PRIMARY_SITE_KEY` | `encadrant` |

Les valeurs privées ne sont pas dans cette archive. Ne pas utiliser `localhost` ou `127.0.0.1`
comme serveur PostgreSQL dans Vercel. La base peut être reliée via Storage / Marketplace.

## 3. Déployer

Après le push, ouvrir le **nouveau déploiement de main**, pas l’ancien commit `24a2979`.
Si vous venez d’ajouter des variables, lancer **Redeploy** sur la version courante.

À la première ouverture, une base neuve reçoit automatiquement les cinq tables nécessaires,
puis les contenus du site. Il n’est pas nécessaire de créer ces tables depuis un terminal.
Une base complète existante est conservée ; un schéma partiel déclenche une erreur sans suppression.

Ouvrir les pages puis `/admin`, se connecter avec votre `ADMIN_PASSWORD` et vérifier les contenus.
`/api/health` doit répondre `ok: true`.

## E-mails

Les messages sont enregistrés dans l’admin. Pour activer leur notification par e-mail, ajouter
`RESEND_API_KEY` et `CONTACT_FROM_EMAIL` (domaine d’envoi vérifié), puis redéployer.
Sans ce paramétrage, aucun envoi automatique vers votre boîte ne doit être considéré comme acquis.

## Inclus et exclus

Inclus : textes intégrés au code, pages, contacts d’orientation, procédure ValoDépôt, tarifs HT,
calendrier, entreprises, albums, images et modèles PostgreSQL.
Exclus : fichiers `.env`, clés privées, mots de passe personnels, messages reçus, données d’une
ancienne base, `node_modules`, résultats `.next` et anciens outils de transfert.

L’hébergement du site reste Vercel. Son offre gratuite Hobby est limitée aux usages personnels
non commerciaux ; vérifier les conditions de votre usage professionnel avant publication.
