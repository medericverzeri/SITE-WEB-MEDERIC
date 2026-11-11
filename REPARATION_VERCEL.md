# Éviter le build « Can't resolve @/… »

Le journal transmis utilisait le commit `24a2979`, dans lequel les configurations racine
étaient absentes. Les nombreux imports échouaient pour une même raison : la résolution de `@/`.

Cette archive contient les sources, les images, les fichiers racine et le verrouillage npm.
Copier tout le dossier dans le dépôt existant, puis faire un nouveau commit et Push origin.
Vérifier dans Vercel que le déploiement utilise ce nouveau commit, et non un Redeploy de `24a2979`.
Root Directory doit contenir à la fois `package.json` et `tsconfig.json`.

Les avertissements npm concernant des dépendances obsolètes ne sont pas la cause du message
d’import affiché dans ce journal. Le contrôle `scripts/check-deployment.mjs` vérifie les
fichiers nécessaires, les alias et les photos avant la compilation.

Pour installer cette livraison, suivre `LIRE-EN-PREMIER.md`. Les tables d’une nouvelle base
PostgreSQL sont créées automatiquement au premier accès. Les anciennes méthodes de transfert
dans l’aperçu ou via des actions GitHub ne sont plus nécessaires.
