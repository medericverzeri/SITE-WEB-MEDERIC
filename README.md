# Site Médéric Verzeri — Déchèt’Lab

Projet Next.js (App Router), TypeScript, PostgreSQL et Drizzle ORM, destiné à **Vercel**.

**Installation : lire [LIRE-EN-PREMIER.md](LIRE-EN-PREMIER.md).**
Cette livraison contient directement le code et les photos. Aucun téléchargement depuis
la prévisualisation ni action GitHub de récupération n’est nécessaire.

## Fonctionnalités

- Pages distinctes : Accueil, À propos de moi, Nos entreprises, Galerie et Contactez-nous.
- Encadrement : Déchèt’Lab, dépose préservante et formation.
- 12 cartes d’entreprises, logos et liens ; albums avec visionneuse et photos intégrées.
- Photo de l’encadrant avec disponibilité vert/rouge et horaires en heure de Paris.
- Jours sur rendez-vous distincts des ouvertures normales.
- Informations de dépôt, procédure ValoDépôt en quatre étapes et tarifs HT.
- Orientation des demandes : Médéric pour l’exploitation, les déchets et l’inscription ; Lydia pour le développement.
- Admin protégé pour modifier contenus, pages, blocs, photos, couleurs, horaires et coordonnées.
- Messages enregistrés dans PostgreSQL ; notification e-mail optionnelle.
- Textes agrandissables, contraste renforcé et navigation clavier.

Les contenus du site principal et de l’espace développement sont indépendants. `PRIMARY_SITE_KEY`
choisit le site à la racine (`encadrant` par défaut).

## Première installation PostgreSQL

Le schéma initial `src/db/bootstrap.sql` est généré depuis `src/db/schema.ts` et inclus dans
les fonctions Vercel. L’application crée les cinq tables uniquement si elles sont toutes absentes.
Un verrou et une transaction protègent les appels concurrents. Si les cinq tables existent,
aucune DDL n’est exécutée. Un schéma partiel est refusé sans suppression.
Les sites manquants et leurs pages sont insérés par transaction ; les données existantes ne
sont pas effacées. Les mises à jour de contenu sont versionnées.

L’évolution future d’un schéma déjà installé reste une opération de maintenance Drizzle,
pas une modification destructive automatique.

## Configuration serveur

| Variable | Rôle |
| --- | --- |
| `DATABASE_URL` | Connexion PostgreSQL distante obligatoire |
| `ADMIN_PASSWORD` | Mot de passe admin à définir avant publication |
| `ADMIN_SESSION_SECRET` | Secret aléatoire long de signature des sessions |
| `PRIMARY_SITE_KEY` | `encadrant` ou `developpement` |
| `RESEND_API_KEY` | Optionnel, notifications e-mail |
| `CONTACT_FROM_EMAIL` | Expéditeur autorisé du domaine vérifié |

Le fichier `.env.example` ne contient aucun secret. Les vraies valeurs restent dans Vercel
ou dans un `.env` local ignoré par Git. Le mot de passe de démonstration `admin1234` n’est pas
un mot de passe de publication.

## Vérifications locales

- `node scripts/check-deployment.mjs` : contrôle de complétude, alias et images.
- `npx next typegen` : types Next.js.
- `npm exec tsc -- --noEmit` : TypeScript.
- `npm run build` : compilation de production.
- `npm run dev` : développement local avec `DATABASE_URL` configurée.

## Créer une livraison

`python3 scripts/export-vercel.py` prépare `exports/site-mederic-vercel-complet.zip` à partir
d’une liste contrôlée. Les secrets, données PostgreSQL, dépendances et caches sont exclus.
Le manifeste contient les empreintes des fichiers livrés. Une base neuve reçoit les contenus
intégrés au code, pas les messages ou personnalisations d’une autre base.

Vercel est la seule plateforme d’hébergement du site. Les conditions de Vercel Hobby réservent
l’offre gratuite aux usages personnels non commerciaux ; les usages professionnels doivent
choisir une offre compatible.
