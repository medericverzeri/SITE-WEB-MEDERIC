# Déployer la livraison complète sur Vercel

## Dépôt GitHub

1. Extraire le ZIP et ouvrir `dechet-lab-vercel`.
2. Ouvrir le dépôt existant dans GitHub Desktop (ou le cloner depuis votre compte).
3. Copier tout le contenu du dossier extrait dans ce dépôt, sans remplacer son dossier `.git`
   ni publier un fichier `.env` privé.
4. Vérifier que `package.json`, `tsconfig.json`, `vercel.json`, `scripts`, `src` et `public`
   sont à la racine et que `public/images` contient les photos.
5. Commit to main, puis Push origin.

Ne pas envoyer uniquement `src` : cela omettrait la configuration des imports et les photos.
Les anciens workflows de préparation ne sont pas nécessaires à cette livraison.

## Projet Vercel

- Importer le dépôt ou conserver sa connexion actuelle.
- Framework : Next.js ; Node.js 22.x si demandé.
- Root Directory : racine contenant `package.json` et `tsconfig.json`.
- Conserver la commande du fichier `vercel.json` et le dossier de sortie par défaut.
- Relier PostgreSQL depuis Storage / Marketplace du projet.
- Pour Production, configurer `DATABASE_URL`, `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET`
  et `PRIMARY_SITE_KEY=encadrant`.
- Ne jamais mettre une URL PostgreSQL localhost ou 127.0.0.1 dans Vercel.

Déployer le nouveau commit. Après une modification des variables, effectuer un Redeploy.

## Tables et contenus : installation automatique

Sur une base vide, le premier accès crée automatiquement les tables depuis le schéma initial
inclus, puis installe les contenus à l’ouverture de l’accueil. Aucun terminal n’est nécessaire
pour cette première création.

Si toutes les tables existent déjà, elles sont conservées. Si seules certaines existent,
l’initialisation s’arrête sans supprimer de table : vérifier ce schéma avant de continuer.
L’utilisateur PostgreSQL doit être autorisé à créer des tables dans le schéma utilisé.

## Vérifier

- `/api/health` : `ok: true`.
- Pages et photos visibles ; albums ouvrables.
- `/admin` accessible avec votre mot de passe de publication.
- Modification d’un texte enregistrée et visible.
- Formulaire enregistré dans Admin → Messages.

Les données de prévisualisation et les messages ne sont pas transférés par le ZIP.

## E-mails

Ajouter `RESEND_API_KEY` et `CONTACT_FROM_EMAIL`, avec un domaine d’envoi vérifié,
puis redéployer pour les notifications à m.verzeri@eco-solidaire.fr. Sans cette configuration,
les messages restent dans l’admin mais aucun e-mail automatique n’est garanti.

## Offre et domaine

L’offre gratuite Hobby est réservée aux usages personnels non commerciaux. Vérifier les
conditions de l’offre adaptée au site professionnel. Tester d’abord l’adresse vercel.app ;
ne pas modifier le domaine principal de la structure pour cet essai.

## Erreurs courantes

- `Can't resolve @/…` : fichiers racine manquants, mauvais Root Directory ou ancien commit déployé.
- `DATABASE_URL is required` : variable de Production absente ; l’ajouter et redéployer.
- `Schéma PostgreSQL partiel` : la base n’est ni vide ni conforme ; aucune table n’a été effacée.
- Échec d’accès PostgreSQL : vérifier la connexion distante, TLS et les permissions du rôle.

Références : https://vercel.com/docs/project-configuration et https://vercel.com/docs/postgres
