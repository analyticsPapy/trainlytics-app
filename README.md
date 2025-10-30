# Trainlytics

<div align="center">

**Plateforme complète d'analyse d'entraînement sportif avec intégrations multi-appareils**

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=flat&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=flat&logo=supabase&logoColor=white)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

[Fonctionnalités](#-fonctionnalités) •
[Installation](#-installation-rapide) •
[Documentation](#-documentation) •
[Déploiement](#-déploiement)

</div>

---

## 🎯 Fonctionnalités

### Pour les Athlètes
- 🏃 **Dashboard Personnalisé**: Vue d'ensemble de vos entraînements avec statistiques en temps réel
- 📈 **Suivi des Performances**: Distance, durée, calories, fréquence cardiaque, puissance
- 🎯 **Objectifs Hebdomadaires**: Définissez et suivez vos objectifs (distance, durée, nombre de séances)
- 📊 **Historique Complet**: Accès à tout votre historique d'entraînements
- 🔗 **Synchronisation Automatique**: Connexion avec vos appareils et applications préférés

### Pour les Coachs
- 👥 **Gestion d'Athlètes**: Suivez et gérez plusieurs athlètes depuis un seul dashboard
- 📅 **Planification**: Créez et assignez des programmes d'entraînement personnalisés
- 📊 **Analyse de Groupe**: Comparez les performances entre athlètes
- 📝 **Notes et Feedback**: Commentez et guidez vos athlètes

### Intégrations
- 🔗 **Multi-Appareils**: Garmin, Strava, Polar, Wahoo, Coros, Fitbit
- 🔄 **Synchronisation Automatique**: Vos activités sont importées en temps réel
- 🔐 **OAuth 2.0 Sécurisé**: Connexions sûres via protocoles standards

### Technique
- 🔐 **Authentification Complète**: JWT + Supabase Auth avec refresh automatique
- 🛡️ **Sécurité Renforcée**: RLS (Row Level Security) sur toutes les données
- 🌐 **API RESTful**: Backend FastAPI avec documentation Swagger interactive
- ⚡ **Performance**: React optimisé avec Vite, TypeScript strict
- 📱 **Responsive Design**: Interface adaptée mobile, tablette et desktop

## 📁 Structure du Projet

```
trainlytics-app/
├── frontend/                      # Application React + Vite
│   ├── src/
│   │   ├── components/           # Composants réutilisables
│   │   │   ├── AuthGuard.tsx    # Protection des routes
│   │   │   ├── RootLayout.tsx   # Layout principal avec AuthProvider
│   │   │   ├── Layout.tsx       # Layout des pages
│   │   │   ├── Button.tsx       # Composant bouton
│   │   │   ├── Badge.tsx        # Badges de statut
│   │   │   └── card.tsx         # Composants de cartes
│   │   ├── hooks/               # Custom React Hooks
│   │   │   └── useAuth.tsx      # Hook d'authentification + Context
│   │   ├── services/            # Services API
│   │   │   └── api.ts           # Client API complet (auth, activities, etc.)
│   │   ├── types/               # Définitions TypeScript
│   │   │   └── api.ts           # Types correspondant au backend
│   │   ├── pages/               # Pages de l'application
│   │   │   ├── Login.tsx        # Page de connexion/inscription
│   │   │   ├── LandingPage.tsx  # Page d'accueil publique
│   │   │   ├── AthleteDashboard.tsx    # Dashboard athlète
│   │   │   ├── CoachDashboard.tsx      # Dashboard coach
│   │   │   ├── ConnectPage.tsx  # Gestion des connexions OAuth
│   │   │   ├── ProPage.tsx      # Page Pro
│   │   │   └── LabPage.tsx      # Page Lab
│   │   ├── App.tsx              # Composant principal
│   │   ├── Main.tsx             # Point d'entrée
│   │   ├── router.tsx           # Configuration du routing + guards
│   │   └── index.css            # Styles globaux Tailwind
│   ├── .env                     # Variables d'environnement (local)
│   ├── .env.production          # Variables d'environnement (prod)
│   ├── .env.example             # Template des variables
│   ├── package.json             # Dépendances frontend
│   ├── vite.config.ts           # Configuration Vite
│   └── tailwind.config.js       # Configuration Tailwind CSS
│
├── backend/                      # API Python FastAPI
│   ├── app/
│   │   ├── main.py              # Point d'entrée FastAPI + middleware
│   │   ├── config.py            # Configuration avec validation
│   │   ├── security.py          # JWT, authentification
│   │   ├── schemas.py           # Schémas Pydantic (requêtes/réponses)
│   │   ├── supabase.py          # Client Supabase
│   │   ├── auth.py              # Routes d'authentification
│   │   ├── connections.py       # Routes de gestion des connexions
│   │   ├── oauth.py             # Flow OAuth (init, callback)
│   │   ├── activities.py        # CRUD activités
│   │   ├── workout.py           # CRUD entraînements
│   │   └── garmin.py            # Intégration Garmin spécifique
│   ├── migrations/              # Scripts de migration SQL
│   │   ├── 001_adapt_schema.sql # Migration principale
│   │   └── README.md            # Documentation migrations
│   ├── .env                     # Variables d'environnement (non versionné)
│   ├── test_env.py              # Script de test de configuration
│   ├── test_connection.py       # Test de connexion Supabase
│   ├── apply_migration.py       # Application automatique migrations
│   ├── requirements.txt         # Dépendances Python
│   └── Dockerfile               # Configuration Docker backend
│
├── DEPLOYMENT.md                 # 📘 Guide complet de déploiement
├── README.md                     # 📖 Documentation principale (ce fichier)
├── wrangler.toml                 # Configuration Cloudflare Pages
├── docker-compose.yml            # Orchestration Docker complète
└── package.json                  # Scripts workspace
```

## 🚀 Installation Rapide

### Prérequis

- **Node.js** 18+ et npm
- **Python** 3.11+
- **Compte Supabase** (gratuit sur https://supabase.com)
- Docker et Docker Compose (optionnel)

### 1️⃣ Cloner le Projet

```bash
git clone https://github.com/analyticsPapy/trainlytics-app.git
cd trainlytics-app
```

### 2️⃣ Configuration Supabase

1. **Créez un projet Supabase** sur https://supabase.com
2. **Notez vos credentials** (URL, Anon Key, Service Role Key)
3. **Appliquez la migration SQL**:
   - Allez dans SQL Editor
   - Copiez/collez le contenu de `backend/migrations/001_adapt_schema.sql`
   - Exécutez le script

### 3️⃣ Configuration des Variables d'Environnement

**Backend** (`backend/.env`):

```bash
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Database
DATABASE_URL=postgresql://postgres:password@db.your-project.supabase.co:5432/postgres

# JWT (utilisez celui de Supabase ou générez-en un)
JWT_SECRET=your-jwt-secret-min-32-characters-long

# CORS
CORS_ORIGINS=["http://localhost:5173"]
```

**Frontend** (`frontend/.env`):

```bash
VITE_API_URL=http://localhost:8000/api
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
```

**Tester la configuration**:
```bash
cd backend
python test_env.py  # Doit afficher ✅ pour toutes les variables
```

### 4️⃣ Lancer l'Application

#### Option A: Sans Docker (Recommandé pour le développement)

**Terminal 1 - Backend:**
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm install
npm run dev
```

#### Option B: Avec Docker

```bash
docker-compose up
```

### 5️⃣ Accéder à l'Application

- 🌐 **Frontend**: http://localhost:5173
- 🔌 **Backend API**: http://localhost:8000
- 📚 **API Docs**: http://localhost:8000/api/docs
- 🔍 **Health Check**: http://localhost:8000/health

### 6️⃣ Créer Votre Premier Compte

1. Ouvrez http://localhost:5173
2. Cliquez sur "Sign up"
3. Remplissez le formulaire (email, password, nom)
4. Sélectionnez votre type de compte (Athlete, Coach, Pro, Lab)
5. Vous serez automatiquement connecté et redirigé vers votre dashboard!

## ⚙️ Scripts Disponibles

### À la Racine du Projet

```bash
npm run dev:frontend       # Démarrer le frontend en mode développement
npm run dev:backend        # Démarrer le backend avec Docker
npm run build:frontend     # Build de production du frontend
npm run docker:up          # Lancer tous les services avec Docker
npm run docker:down        # Arrêter tous les services Docker
npm run install:frontend   # Installer les dépendances frontend
```

### Backend

```bash
cd backend
uvicorn app.main:app --reload              # Démarrer en mode développement
uvicorn app.main:app --host 0.0.0.0        # Démarrer en mode production
python test_env.py                          # Tester la configuration
python test_connection.py                   # Tester la connexion Supabase
python apply_migration.py                   # Appliquer les migrations
```

### Frontend

```bash
cd frontend
npm run dev         # Développement avec hot-reload
npm run build       # Build pour la production
npm run preview     # Preview du build de production
npm run lint        # Linter TypeScript/ESLint
```

## 🏗️ Architecture & Technologies

### Frontend Stack

| Technologie | Version | Usage |
|------------|---------|-------|
| **React** | 18.2+ | Framework UI principal |
| **TypeScript** | 5.2+ | Typage statique |
| **Vite** | 6.0+ | Build tool ultra-rapide |
| **React Router** | 6.20+ | Routing côté client |
| **Tailwind CSS** | 3.3+ | Framework CSS utility-first |
| **Framer Motion** | 12+ | Animations fluides |
| **Lucide React** | - | Bibliothèque d'icônes |
| **Supabase JS** | 2.38+ | Client Supabase |
| **Recharts** | 3.3+ | Graphiques et visualisations |

### Backend Stack

| Technologie | Version | Usage |
|------------|---------|-------|
| **Python** | 3.11+ | Langage backend |
| **FastAPI** | 0.109+ | Framework API moderne |
| **Pydantic** | 2.5+ | Validation de données |
| **Supabase** | 2.3+ | BaaS (Auth + Database) |
| **PostgreSQL** | 15+ | Base de données |
| **python-jose** | 3.3+ | JWT tokens |
| **httpx** | 0.26+ | Client HTTP async |
| **Uvicorn** | 0.27+ | Serveur ASGI |

### Infrastructure

- **Database**: Supabase PostgreSQL avec Row Level Security
- **Authentication**: Supabase Auth + JWT
- **Hosting Frontend**: Cloudflare Pages
- **Hosting Backend**: Railway / Render / Heroku
- **CDN**: Cloudflare
- **CI/CD**: GitHub Actions (auto-deploy)

## 📊 Schéma de Base de Données

La migration SQL `backend/migrations/001_adapt_schema.sql` crée et configure:

### Tables Principales

- **users** - Profils utilisateurs avec authentification Supabase
- **device_connections** - Connexions OAuth aux appareils (Garmin, Strava, etc.)
- **activities** - Activités sportives importées ou manuelles
- **workouts** - Entraînements planifiés par les coachs
- **athletes** - Relations coach-athlète

### Sécurité

- **Row Level Security (RLS)** activé sur toutes les tables
- Les utilisateurs ne peuvent accéder qu'à leurs propres données
- Les coachs peuvent accéder aux données de leurs athlètes
- Triggers automatiques pour `updated_at`
- Indexes optimisés pour les performances

## 🔗 Intégrations Disponibles

### Appareils et Plateformes Supportés

| Provider | Status | Type | Documentation |
|----------|--------|------|---------------|
| **Garmin Connect** | ✅ Prêt | Montre GPS | [developer.garmin.com](https://developer.garmin.com) |
| **Strava** | ✅ Prêt | Plateforme sociale | [developers.strava.com](https://developers.strava.com) |
| **Polar Flow** | ✅ Prêt | Montre GPS | [polar.com/accesslink-api](https://www.polar.com/accesslink-api) |
| **Wahoo** | ✅ Prêt | Capteurs | [api.wahooligan.com](https://api.wahooligan.com) |
| **Coros** | ✅ Prêt | Montre GPS | [open.coros.com](https://open.coros.com) |
| **Fitbit** | ✅ Prêt | Tracker | [dev.fitbit.com](https://dev.fitbit.com) |

### Comment Connecter un Appareil

1. Accédez à la page **Connexions** dans votre dashboard
2. Cliquez sur **Connect** pour le provider de votre choix
3. Autorisez l'accès dans la fenêtre OAuth qui s'ouvre
4. Vos activités seront automatiquement synchronisées!

### Configuration OAuth (Pour Développeurs)

Pour activer les intégrations, ajoutez dans `backend/.env`:

```bash
# Garmin
GARMIN_CLIENT_ID=your_client_id
GARMIN_CLIENT_SECRET=your_client_secret

# Strava
STRAVA_CLIENT_ID=your_client_id
STRAVA_CLIENT_SECRET=your_client_secret

# Etc...
```

Voir [DEPLOYMENT.md](./DEPLOYMENT.md) pour les instructions détaillées.

## 📖 Documentation

| Document | Description |
|----------|-------------|
| **[DEPLOYMENT.md](./DEPLOYMENT.md)** | 📘 Guide complet de déploiement en production (Cloudflare, Railway, etc.) |
| **[backend/migrations/README.md](./backend/migrations/README.md)** | 🗄️ Documentation des migrations SQL |
| **[API Docs (Swagger)](http://localhost:8000/api/docs)** | 📚 Documentation interactive de l'API (après démarrage) |
| **[API Docs (ReDoc)](http://localhost:8000/api/redoc)** | 📖 Documentation alternative de l'API |

## 🚢 Déploiement en Production

### Option Recommandée

**Frontend**: Cloudflare Pages
- Gratuit
- CDN global
- Déploiement automatique sur push
- SSL gratuit

**Backend**: Railway
- $5/mois pour débuter
- PostgreSQL inclus (ou utilisez Supabase)
- Déploiement automatique
- Logs en temps réel

**Database**: Supabase
- Gratuit jusqu'à 500MB
- PostgreSQL managé
- Authentification incluse
- Row Level Security

### Guide Détaillé

Consultez **[DEPLOYMENT.md](./DEPLOYMENT.md)** pour:
- Instructions pas à pas pour chaque plateforme
- Configuration des variables d'environnement
- Configuration des domaines personnalisés
- Configuration OAuth pour les intégrations
- Troubleshooting

## 🛡️ Sécurité

### Mesures Implémentées

- ✅ **JWT Tokens**: Validation stricte avec minimum 32 caractères
- ✅ **Row Level Security**: Isolation des données par utilisateur dans PostgreSQL
- ✅ **OAuth 2.0**: Authentification sécurisée pour les intégrations tierces
- ✅ **CORS**: Configuration stricte des origines autorisées
- ✅ **Password Hashing**: Via Supabase Auth (bcrypt)
- ✅ **API Rate Limiting**: Protection contre les abus
- ✅ **Input Validation**: Pydantic pour la validation côté backend
- ✅ **TypeScript**: Typage strict pour éviter les erreurs

### Vulnérabilités Corrigées

- ✅ Vite mis à jour (5.0.8 → 6.0.5) - CVE esbuild
- ✅ Fonction `verify_password` dangereuse supprimée
- ✅ Validation JWT_SECRET renforcée

## 🐛 Troubleshooting

### Backend ne démarre pas

```bash
# Vérifier la configuration
cd backend
python test_env.py

# Vérifier les dépendances
pip install -r requirements.txt

# Vérifier les logs
uvicorn app.main:app --reload --log-level debug
```

### Frontend ne se connecte pas au backend

1. Vérifiez `VITE_API_URL` dans `frontend/.env`
2. Vérifiez que le backend est démarré sur le bon port
3. Vérifiez CORS dans `backend/.env`: `CORS_ORIGINS`
4. Ouvrez la console du navigateur (F12) pour les erreurs

### Erreurs de migration SQL

1. Vérifiez votre connexion Supabase
2. La migration est idempotente, vous pouvez la réexécuter
3. Vérifiez les logs dans le SQL Editor de Supabase

### OAuth ne fonctionne pas

1. Vérifiez les CLIENT_ID et CLIENT_SECRET
2. Vérifiez l'URL de callback configurée chez le provider
3. Vérifiez `OAUTH_CALLBACK_URL` dans le backend

## 🗺️ Roadmap

### ✅ Complété (v1.0)

- [x] Authentification complète (signup, login, JWT)
- [x] Dashboards Athlète et Coach
- [x] Intégrations OAuth (6 providers)
- [x] CRUD Activités et Workouts
- [x] API RESTful complète
- [x] Documentation Swagger
- [x] Row Level Security
- [x] Déploiement Cloudflare + Railway

### 🚧 En Cours (v1.1)

- [ ] Analytics avancées (graphiques de progression)
- [ ] Notifications en temps réel
- [ ] Export de données (CSV, PDF)
- [ ] Mode sombre

### 📋 Planifié (v2.0)

- [ ] Application mobile (React Native)
- [ ] IA pour recommandations d'entraînement
- [ ] Plans d'entraînement prédéfinis
- [ ] Marketplace pour coachs
- [ ] Intégration Zwift/TrainerRoad
- [ ] Social features (feed, likes, comments)

## 🤝 Contribution

Les contributions sont les bienvenues! Voici comment contribuer:

### Pour les Développeurs

1. **Fork** le projet
2. **Créez une branche**: `git checkout -b feature/ma-feature`
3. **Committez**: `git commit -m 'feat: Ajouter ma feature'`
4. **Pushez**: `git push origin feature/ma-feature`
5. **Ouvrez une Pull Request**

### Règles de Commit

Nous suivons [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: Nouvelle fonctionnalité
fix: Correction de bug
docs: Documentation
style: Formatage
refactor: Refactoring
test: Tests
chore: Maintenance
```

### Code of Conduct

- Soyez respectueux
- Commentez votre code
- Testez avant de soumettre
- Suivez le style existant

## 📝 Licence

MIT License - voir [LICENSE](LICENSE)

## 🙏 Remerciements

- [FastAPI](https://fastapi.tiangolo.com/) - Framework backend moderne
- [React](https://react.dev/) - Bibliothèque UI
- [Supabase](https://supabase.com/) - Backend as a Service
- [Tailwind CSS](https://tailwindcss.com/) - Framework CSS
- [Framer Motion](https://www.framer.com/motion/) - Animations
- [Vite](https://vitejs.dev/) - Build tool ultra-rapide

## 📞 Support & Contact

- 📧 **Email**: support@trainlytics.com
- 🐛 **Issues**: [GitHub Issues](https://github.com/analyticsPapy/trainlytics-app/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/analyticsPapy/trainlytics-app/discussions)
- 📖 **Documentation**: [docs.trainlytics.com](https://docs.trainlytics.com)

## ⭐ Star History

Si ce projet vous aide, n'oubliez pas de lui donner une étoile ⭐!

---

<div align="center">

**Développé avec ❤️ par l'équipe Trainlytics**

🤖 Généré avec [Claude Code](https://claude.com/claude-code)

</div>
