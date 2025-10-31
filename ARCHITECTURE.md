# 🏗️ Architecture du Projet Trainlytics

**Date de révision** : 31 Octobre 2025
**Version** : 1.0.0

---

## 📁 Structure du Projet

```
trainlytics-app/
├── backend/                      # Backend FastAPI
│   ├── app/
│   │   ├── routes/               # Routes API organisées
│   │   │   └── provider_routes.py    # Routes de gestion des providers
│   │   ├── services/             # Services métier
│   │   │   └── provider_service.py   # Service de gestion des connexions
│   │   ├── activities.py         # Routes des activités
│   │   ├── auth.py               # Routes d'authentification
│   │   ├── config.py             # Configuration de l'application
│   │   ├── garmin.py             # Client Garmin (en développement)
│   │   ├── main.py               # Point d'entrée FastAPI
│   │   ├── oauth.py              # Routes OAuth
│   │   ├── schemas.py            # Schémas Pydantic
│   │   ├── security.py           # Utilitaires de sécurité (JWT)
│   │   ├── supabase.py           # Client Supabase
│   │   ├── workout.py            # Routes des workouts
│   │   ├── .env                  # Configuration backend (EXPOSÉ)
│   │   └── .env.example          # Template de configuration
│   ├── migrations/               # Migrations SQL
│   │   ├── 001_adapt_schema.sql
│   │   ├── 002_new_schema_migration.sql
│   │   ├── initial_schemas.sql
│   │   ├── new_schema.sql
│   │   └── README.md
│   ├── tests/                    # Tests unitaires et d'intégration
│   │   ├── test_connection.py
│   │   ├── test_db_connection.py
│   │   ├── test_env.py
│   │   ├── test_provider_service.py
│   │   └── test_signup.py
│   ├── apply_migration.py        # Script d'application des migrations
│   ├── requirements.txt          # Dépendances Python
│   └── ROUTES.md                 # Documentation des routes API
│
├── frontend/                     # Frontend React + TypeScript
│   ├── public/                   # Assets statiques
│   ├── src/
│   │   ├── components/           # Composants React réutilisables
│   │   │   ├── AuthGuard.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Button.tsx
│   │   │   ├── Layout.tsx
│   │   │   ├── RootLayout.tsx
│   │   │   └── card.tsx
│   │   ├── hooks/                # Custom React hooks
│   │   │   └── useAuth.tsx       # Hook d'authentification
│   │   ├── lib/                  # Bibliothèques et utilitaires
│   │   │   ├── supabase.ts       # Client Supabase
│   │   │   └── utils.ts          # Fonctions utilitaires
│   │   ├── pages/                # Pages de l'application
│   │   │   ├── AthleteDashboard.tsx
│   │   │   ├── AthleteLayout.tsx
│   │   │   ├── CoachDashboard.tsx
│   │   │   ├── ConnectPage.tsx
│   │   │   ├── LabPage.tsx
│   │   │   ├── LandingPage.tsx
│   │   │   ├── Login.tsx
│   │   │   └── ProPage.tsx
│   │   ├── services/             # Services API
│   │   │   └── api.ts            # Client API
│   │   ├── types/                # Types TypeScript
│   │   │   └── api.ts
│   │   ├── App.tsx               # Composant racine
│   │   ├── Main.tsx              # Point d'entrée React
│   │   ├── router.tsx            # Configuration du routeur
│   │   └── vite-env.d.ts
│   ├── .env.example              # Template de configuration
│   ├── .env.production           # Configuration production (EXPOSÉ)
│   ├── index.html                # Template HTML
│   ├── package.json              # Dépendances Node.js
│   ├── tsconfig.json             # Configuration TypeScript
│   ├── tsconfig.node.json
│   └── vite.config.ts            # Configuration Vite
│
├── infrastructure/               # Configuration infrastructure
│
├── .env.example                  # Template configuration racine
├── .gitignore                    # Fichiers ignorés par Git
├── docker-compose.yml            # Configuration Docker
├── package.json                  # Dépendances du projet
├── package-lock.json
├── wrangler.toml                 # Configuration Cloudflare Workers
│
├── ARCHITECTURE.md               # ← Ce fichier
├── CLOUDFLARE_PAGES_SETUP.md     # Guide déploiement Cloudflare Pages
├── DEPLOYMENT.md                 # Guide de déploiement général
├── PULL_REQUEST_DESCRIPTION.md   # Template PR
├── README.md                     # Documentation principale
├── SETUP.md                      # Guide de configuration
├── SUPABASE_CONFIG_CHECKLIST.md  # Checklist configuration Supabase
└── SUPABASE_SETUP.md             # Guide setup Supabase
```

---

## 🔧 Technologies Utilisées

### Backend
- **Framework** : FastAPI 0.104+
- **Base de données** : PostgreSQL (via Supabase)
- **ORM/Client** : Supabase Python Client
- **Authentification** : JWT (PyJWT)
- **Validation** : Pydantic v2
- **Server ASGI** : Uvicorn

### Frontend
- **Framework** : React 18
- **Language** : TypeScript
- **Build Tool** : Vite
- **Routing** : React Router v6
- **UI** : Tailwind CSS (probable)
- **State Management** : React Context API
- **HTTP Client** : Fetch API

### Infrastructure
- **BaaS** : Supabase (Auth, Database, Storage)
- **Hosting** : Cloudflare Pages (frontend)
- **Container** : Docker (développement)

---

## 🔐 Configuration et Variables d'Environnement

### Backend (`/backend/app/.env`)
```env
# Application
APP_NAME=Trainlytics API
APP_ENV=development
DEBUG=True
API_PREFIX=/api
HOST=0.0.0.0
PORT=8000

# Supabase
SUPABASE_URL=https://zclkfguqdwayztxvpcpn.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=[À configurer]

# Database
DATABASE_URL=postgresql://postgres:postgres@db.zclkfguqdwayztxvpcpn.supabase.co:5432/postgres

# JWT
JWT_SECRET=dev_secret_key_for_testing_only_change_in_production_12345
JWT_ALGORITHM=HS256
JWT_EXPIRATION_HOURS=24

# OAuth Providers
GARMIN_CLIENT_ID=[À configurer]
GARMIN_CLIENT_SECRET=[À configurer]
STRAVA_CLIENT_ID=[À configurer]
STRAVA_CLIENT_SECRET=[À configurer]
POLAR_CLIENT_ID=[À configurer]
POLAR_CLIENT_SECRET=[À configurer]
COROS_CLIENT_ID=[À configurer]
COROS_CLIENT_SECRET=[À configurer]
WAHOO_CLIENT_ID=[À configurer]
WAHOO_CLIENT_SECRET=[À configurer]
FITBIT_CLIENT_ID=[À configurer]
FITBIT_CLIENT_SECRET=[À configurer]

# OAuth Settings
OAUTH_CALLBACK_URL=http://localhost:8000/api/oauth/callback
OAUTH_STATE_EXPIRATION_MINUTES=10

# CORS
CORS_ORIGINS=http://localhost:5173,http://localhost:3000,http://localhost:8000
```

### Frontend (`/frontend/.env.production`)
```env
# API Backend
VITE_API_URL=https://api.trainlytics.com/api

# Supabase
VITE_SUPABASE_URL=https://zclkfguqdwayztxvpcpn.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Environment
VITE_APP_ENV=production
```

---

## 🗄️ Architecture de Base de Données

### Tables Principales

#### `users`
- Profils utilisateurs (géré par Supabase Auth)
- Types : athlete, coach, pro, lab

#### `provider_connections`
- Connexions OAuth vers providers externes
- UNIQUE constraint : (user_id, provider)
- Champs : access_token, refresh_token, scopes, metadata

#### `activities`
- Activités sportives synchronisées ou créées manuellement
- Relations : user_id, provider_connection_id

#### `workouts`
- Workouts planifiés et entraînements
- Statut : scheduled, completed, skipped

#### `sync_history`
- Historique des synchronisations avec les providers
- Statistiques : activities_fetched, created, updated, skipped
- Status tracking : running, success, failed, partial

#### `oauth_states`
- États OAuth temporaires pour prévenir CSRF
- Expiration automatique

---

## 🔄 Flux de Données

### 1. Authentification
```
User → Frontend → /api/auth/signup ou /api/auth/login
                → Supabase Auth
                → Backend génère JWT
                → Frontend stocke token
                → Redirects vers dashboard
```

### 2. Connexion Provider (OAuth)
```
User → Frontend → /api/oauth/init
                → Backend génère state + URL
                → Redirect vers provider (Strava, etc.)
                → User autorise
                → Provider callback → /api/oauth/callback
                → Backend échange code pour tokens
                → Stockage dans provider_connections
                → Sync initiale
```

### 3. Synchronisation d'Activités
```
Trigger (manuel/automatique) → /api/providers/connections/{id}/sync
                             → Backend récupère connection
                             → Crée sync_history (status: running)
                             → Appel API provider
                             → Traitement des activités
                             → Mise à jour sync_history
                             → Notification utilisateur
```

---

## 🚀 Points d'Amélioration Identifiés

### ✅ Complété lors de cette révision
1. ✅ Suppression des fichiers vides
2. ✅ Réorganisation des tests dans `/backend/tests/`
3. ✅ Migration des fichiers SQL vers `/backend/migrations/`
4. ✅ Remplacement de `connections.py` par architecture modulaire avec services
5. ✅ Utilisation de `provider_routes.py` pour routes des providers
6. ✅ Documentation des routes API créée

### 🔄 En cours / À faire
1. ⏳ **Implémentation complète OAuth Garmin** (OAuth 1.0a complexe)
2. ⏳ **Implémentation autres providers** (Polar, Coros, Wahoo, Fitbit)
3. ⏳ **Tests automatisés** des routes API
4. ⏳ **CI/CD Pipeline** (GitHub Actions)
5. ⏳ **Logging et Monitoring** (Sentry, CloudWatch)
6. ⏳ **Rate limiting** sur les endpoints publics
7. ⏳ **Cache** pour les requêtes fréquentes
8. ⏳ **Webhooks** pour sync temps réel depuis providers

---

## 📊 Métriques et KPIs

### Performance
- Temps de réponse API : < 200ms (p95)
- Temps de sync : < 30s pour 100 activités
- Disponibilité : 99.9%

### Sécurité
- Tokens JWT avec expiration
- OAuth state validation (CSRF protection)
- CORS configuré
- Rate limiting (à implémenter)

---

## 🧪 Tests

### Backend
- Tests unitaires : `/backend/tests/`
- Coverage cible : > 80%
- Tests des endpoints principaux

### Frontend
- Tests à implémenter
- E2E tests (Playwright/Cypress)

---

## 📚 Documentation Associée

- [ROUTES.md](backend/ROUTES.md) - Documentation détaillée des routes API
- [README.md](README.md) - Documentation générale du projet
- [DEPLOYMENT.md](DEPLOYMENT.md) - Guide de déploiement
- [SUPABASE_SETUP.md](SUPABASE_SETUP.md) - Configuration Supabase

---

## 👥 Conventions de Code

### Backend (Python)
- Style : PEP 8
- Type hints obligatoires
- Docstrings pour toutes les fonctions publiques
- Async/await pour les I/O

### Frontend (TypeScript)
- Style : ESLint + Prettier
- Types stricts (no `any`)
- Composants fonctionnels
- Hooks pour state management

---

## 🔒 Sécurité

### Best Practices Appliquées
- ✅ JWT avec expiration
- ✅ OAuth state validation
- ✅ Environment variables pour secrets
- ✅ CORS configuré
- ✅ Input validation avec Pydantic
- ⚠️ Rate limiting (à implémenter)
- ⚠️ SQL injection protection (via Supabase ORM)

### Secrets Management
- Development : `.env` files (git-ignored)
- Production : Environment variables (Cloudflare, Supabase)
- Ne JAMAIS committer les `.env` en production

---

**Dernière mise à jour** : 31 Octobre 2025 par Claude
**Prochaine révision** : Après implémentation OAuth providers
