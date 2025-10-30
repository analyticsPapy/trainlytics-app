# Trainlytics - Guide de Déploiement

Ce guide vous accompagne dans le déploiement de Trainlytics en production.

## 📋 Prérequis

- ✅ Compte Supabase avec projet créé
- ✅ Compte Cloudflare (gratuit OK)
- ✅ Variables d'environnement configurées (voir .env files)
- ✅ Node.js 18+ et Python 3.11+

---

## 🗄️ Étape 1: Configuration de la Base de Données

### 1.1 Appliquer la Migration SQL

1. Allez sur https://app.supabase.com
2. Sélectionnez votre projet
3. Naviguez vers **SQL Editor**
4. Créez une nouvelle query
5. Copiez le contenu de `backend/migrations/001_adapt_schema.sql`
6. Collez et exécutez (Run ou Cmd/Ctrl + Enter)

✅ Vous devriez voir des messages de succès pour chaque étape

### 1.2 Vérifier les Tables

Dans SQL Editor, exécutez:

```sql
-- Vérifier que toutes les tables existent
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

Vous devriez voir:
- `activities`
- `athletes`
- `device_connections`
- `users`
- `workouts`

---

## 🚀 Étape 2: Déploiement Frontend (Cloudflare Pages)

### Option A: Via Dashboard Cloudflare (Recommandé)

1. **Connecter votre repository GitHub**
   - Allez sur https://dash.cloudflare.com
   - Workers & Pages > Create application > Pages
   - Connect to Git > Sélectionnez votre repo
   - Branch: `main` ou votre branche principale

2. **Configuration du Build**
   ```
   Project name: trainlytics
   Production branch: main
   Build command: cd frontend && npm install && npm run build
   Build output directory: frontend/dist
   Root directory: /
   ```

3. **Variables d'Environnement**
   Dans Cloudflare Pages > Settings > Environment variables:

   **Production:**
   ```
   VITE_API_URL=https://your-backend-url.com/api
   VITE_SUPABASE_URL=https://zclkfguqdwayztxvpcpn.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpjbGtmZ3VxZHdheXp0eHZwY3BuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEzMTM2NTgsImV4cCI6MjA3Njg4OTY1OH0.hz4EqFi8AnZO7Lywl03xXtBa1OWMPdiGH1pe9SD9k9k
   VITE_APP_ENV=production
   ```

4. **Déployer**
   - Save and Deploy
   - Cloudflare va builder et déployer automatiquement
   - URL: `https://trainlytics.pages.dev` (ou votre domaine custom)

### Option B: Via Wrangler CLI

```bash
# Installer Wrangler
npm install -g wrangler

# Login à Cloudflare
wrangler login

# Déployer
cd frontend
wrangler pages deploy dist --project-name=trainlytics
```

---

## 🔧 Étape 3: Déploiement Backend

### Option A: Railway (Recommandé pour Python)

1. Allez sur https://railway.app
2. New Project > Deploy from GitHub
3. Sélectionnez votre repo
4. Root directory: `backend`
5. Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

**Variables d'environnement dans Railway:**
```
APP_ENV=production
DEBUG=False
SUPABASE_URL=https://zclkfguqdwayztxvpcpn.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpjbGtmZ3VxZHdheXp0eHZwY3BuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEzMTM2NTgsImV4cCI6MjA3Njg4OTY1OH0.hz4EqFi8AnZO7Lywl03xXtBa1OWMPdiGH1pe9SD9k9k
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpjbGtmZ3VxZHdheXp0eHZwY3BuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTMxMzY1OCwiZXhwIjoyMDc2ODg5NjU4fQ.O6PMimzttJRjgioTbpUew-P1k4ZL1vRG80eQsDTeWXY
DATABASE_URL=postgresql://postgres:T9h7d9ur84%25@db.zclkfguqdwayztxvpcpn.supabase.co:5432/postgres
JWT_SECRET=yQqeH0oaQAV1ObrC+Dh4SViOQ8K7ENhHevl0HXoTbE6UfdL4POQmczz66ZY2kmS/U0FbRCq0PaOuBxkQYb/6Sg==
CORS_ORIGINS=["https://trainlytics.pages.dev"]
OAUTH_CALLBACK_URL=https://trainlytics.pages.dev/connect
```

### Option B: Render

1. Allez sur https://render.com
2. New > Web Service
3. Connect repository
4. Name: trainlytics-api
5. Root Directory: `backend`
6. Build Command: `pip install -r requirements.txt`
7. Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

Ajoutez les mêmes variables d'environnement que Railway.

### Option C: Heroku

```bash
# Créer un Procfile dans backend/
echo "web: uvicorn app.main:app --host 0.0.0.0 --port \$PORT" > backend/Procfile

# Créer un runtime.txt
echo "python-3.11" > backend/runtime.txt

# Déployer
cd backend
heroku create trainlytics-api
git push heroku main
```

---

## 🔐 Étape 4: Configuration OAuth (Optionnel)

Pour activer les connexions Garmin, Strava, etc:

### Garmin Connect

1. Allez sur https://developer.garmin.com
2. Créez une application
3. Callback URL: `https://your-frontend-url.com/connect`
4. Récupérez Client ID et Client Secret
5. Ajoutez dans les variables d'environnement backend:
   ```
   GARMIN_CLIENT_ID=your_client_id
   GARMIN_CLIENT_SECRET=your_client_secret
   ```

### Strava

1. https://www.strava.com/settings/api
2. Create App
3. Authorization Callback Domain: `your-frontend-url.com`
4. Récupérez les credentials

### Autres Providers

Même processus pour:
- Polar: https://flow.polar.com/oauth2
- Wahoo: https://api.wahooligan.com
- Coros: https://open.coros.com
- Fitbit: https://dev.fitbit.com

---

## ✅ Étape 5: Vérification

### 5.1 Tester le Backend

```bash
curl https://your-backend-url.com/health
```

Réponse attendue:
```json
{
  "status": "healthy",
  "service": "Trainlytics API",
  "environment": "production"
}
```

### 5.2 Tester le Frontend

1. Ouvrez https://your-frontend-url.com
2. Cliquez sur "Sign up"
3. Créez un compte test
4. Vérifiez que vous pouvez vous connecter

### 5.3 Tester l'API depuis le Frontend

Ouvrez la console développeur (F12) et vérifiez:
- Aucune erreur CORS
- Les requêtes API passent (onglet Network)
- L'authentification fonctionne

---

## 🌐 Étape 6: Domaine Personnalisé (Optionnel)

### Frontend (Cloudflare Pages)

1. Cloudflare Pages > Custom domains
2. Add domain: `trainlytics.com`
3. Suivez les instructions DNS

### Backend

Dépend de votre hébergeur (Railway/Render/Heroku)
- Ajoutez votre domaine dans les settings
- Configurez les DNS records

---

## 🔄 Mises à Jour Continues

### Déploiement Automatique

Cloudflare Pages se redéploie automatiquement à chaque push sur `main`.

Pour le backend:
- Railway: Auto-deploy sur push
- Render: Auto-deploy sur push
- Heroku: `git push heroku main`

---

## 📊 Monitoring

### Cloudflare Analytics

Disponible dans le dashboard Cloudflare Pages

### Backend Logs

- Railway: Dashboard > Logs
- Render: Dashboard > Logs
- Heroku: `heroku logs --tail`

### Supabase Monitoring

Dashboard Supabase > Reports:
- Nombre d'utilisateurs
- API calls
- Database size

---

## 🆘 Troubleshooting

### Erreur CORS

Vérifiez `CORS_ORIGINS` dans le backend inclut votre frontend URL

### Erreur de connexion BDD

Vérifiez le `DATABASE_URL` et que l'IP est autorisée dans Supabase

### Variables d'environnement manquantes

Relancez le test:
```bash
cd backend
python test_env.py
```

### Erreur de build

Vérifiez les logs de build dans votre plateforme de déploiement

---

## 📞 Support

- Issues GitHub: https://github.com/analyticsPapy/trainlytics-app/issues
- Supabase Support: https://supabase.com/dashboard/support
- Cloudflare Support: https://community.cloudflare.com

---

## ✨ Checklist Finale

- [ ] Migration SQL appliquée
- [ ] Frontend déployé sur Cloudflare Pages
- [ ] Backend déployé (Railway/Render/Heroku)
- [ ] Variables d'environnement configurées
- [ ] CORS configuré correctement
- [ ] OAuth providers configurés (optionnel)
- [ ] Tests de signup/login réussis
- [ ] Domaine personnalisé configuré (optionnel)
- [ ] Monitoring activé

🎉 **Félicitations! Trainlytics est en production!**
