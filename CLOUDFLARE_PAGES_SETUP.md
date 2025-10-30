# Configuration Cloudflare Pages pour Trainlytics

## Configuration dans le Dashboard Cloudflare Pages

### 1. Paramètres de Build

Lors de la configuration de votre projet dans Cloudflare Pages, utilisez les paramètres suivants :

**Framework preset:** Vite

**Build command:**
```bash
cd frontend && npm install && npm run build
```

**Build output directory:**
```
frontend/dist
```

**Root directory:** (laisser vide ou utiliser `/`)

**Node version:** 18.x ou supérieur

### 2. Variables d'Environnement

Configurez les variables d'environnement suivantes dans le dashboard Cloudflare Pages :

#### Variables Requises :
- `VITE_APP_ENV` = `production`
- `VITE_SUPABASE_URL` = Votre URL Supabase
- `VITE_SUPABASE_ANON_KEY` = Votre clé anonyme Supabase
- `VITE_API_URL` = URL de votre API backend

### 3. Configuration Git

- **Branch de production:** `main` (ou votre branche principale)
- **Branches de preview:** Toutes les branches (recommandé pour tester les PRs)

### 4. Notes Importantes

1. **wrangler.toml:** Le fichier `wrangler.toml` à la racine du projet ne doit PAS contenir de section `[build]`. Cette section n'est pas supportée par Cloudflare Pages.

2. **Build automatique:** Cloudflare Pages build automatiquement à chaque push sur les branches configurées.

3. **Preview deployments:** Chaque Pull Request génère automatiquement un déploiement de preview.

### 5. Vérification du Déploiement

Après avoir configuré votre projet, le build devrait :
1. Cloner le repository
2. Installer les dépendances avec `npm install`
3. Compiler TypeScript
4. Builder avec Vite
5. Déployer le contenu du répertoire `frontend/dist`

### 6. Troubleshooting

Si vous rencontrez des erreurs :

**Erreur "Configuration file for Pages projects does not support 'build'"**
- Solution : Assurez-vous que `wrangler.toml` ne contient pas de section `[build]`

**Erreur de build**
- Vérifiez que toutes les variables d'environnement sont correctement configurées
- Testez la build localement : `cd frontend && npm install && npm run build`

**Erreur TypeScript**
- Vérifiez que Node.js est en version 18.x ou supérieure
- Assurez-vous que toutes les dépendances sont installées

### 7. Test Local

Pour tester la build localement avant de déployer :

```bash
# Installer les dépendances
cd frontend && npm install

# Builder l'application
npm run build

# Prévisualiser la build
npm run preview
```

## Commandes Git

Pour pousser vos changements :

```bash
git add .
git commit -m "Fix: Configuration Cloudflare Pages"
git push -u origin claude/cloudflare-pages-tests-011CUdfsRqQ9X3eM4k4AFyC5
```
