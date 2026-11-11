# Réparation GitHub — 35 fichiers manquants

Votre dépôt a été créé via « Add file → Upload files » de GitHub, limité à 100 fichiers par envoi.
Le premier commit contient exactement 100 fichiers sur les 135 attendus.

1. Décompressez cette archive.
2. Ouvrez votre dépôt sur la branche main.
3. Choisissez Add file → Upload files.
4. Déposez le dossier `src` présent dans cette archive, puis `.gitignore` et `.env.example`.
   Ne déposez pas seulement les fichiers un par un : les chemins doivent rester identiques.
5. Vérifiez que 35 fichiers sont proposés dans le commit, puis validez Commit changes sur main.
6. Vérifiez sur GitHub que `src/db/index.ts`, `src/db/schema.ts`, `src/db/bootstrap.ts`,
   `src/db/bootstrap.sql` et `src/components/site/SitePageView.tsx` sont maintenant présents.
7. Le nouveau déploiement Vercel se déclenche. Attendez le nouveau commit, pas fb388ae.

Le build contrôle ensuite tous les fichiers de l’archive d’origine, puis compile le site.
Les photos déjà présentes n’ont pas besoin d’être renvoyées. Aucun secret n’est inclus.
