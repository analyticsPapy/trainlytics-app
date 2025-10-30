# Trainlytics

Plateforme complète d'analyse d'entraînement sportif avec intégrations multi-appareils.

## 🎯 Fonctionnalités

- 🏃 **Dashboard Athlète**: Suivi des entraînements, statistiques, objectifs hebdomadaires
- 👨‍🏫 **Dashboard Coach**: Gestion des athlètes, planification d'entraînements
- 🔗 **Connexions Multi-Appareils**: Garmin, Strava, Polar, Wahoo, Coros, Fitbit
- 📊 **Analytics Avancées**: Métriques détaillées, tendances, analyse de performance
- 🔐 **Authentification Sécurisée**: JWT + Supabase Auth avec refresh automatique
- 🌐 **API RESTful**: Backend FastAPI complet avec documentation Swagger

## 📁 Structure du Projet

```
trainlytics-app/
├── frontend/                 # Application React + Vite
│   ├── src/
│   │   ├── components/      # Composants réutilisables
│   │   ├── hooks/           # Hooks personnalisés
│   │   ├── lib/             # Bibliothèques et utilitaires
│   │   ├── pages/           # Pages de l'application
│   │   ├── App.tsx          # Composant principal
│   │   ├── Main.tsx         # Point d'entrée
│   │   ├── router.tsx       # Configuration du routing
│   │   └── index.css        # Styles globaux
│   ├── Dockerfile           # Configuration Docker frontend
│   ├── package.json         # Dépendances frontend
│   ├── tsconfig.json        # Configuration TypeScript
│   ├── vite.config.ts       # Configuration Vite
│   ├── tailwind.config.js   # Configuration Tailwind CSS
│   └── postcss.config.js    # Configuration PostCSS
│
├── backend/                 # API Python FastAPI
│   ├── app/
│   │   ├── services/        # Services métier
│   │   ├── activities.py    # Gestion des activités
│   │   ├── auth.py          # Authentification
│   │   ├── config.py        # Configuration
│   │   ├── garmin.py        # Intégration Garmin
│   │   ├── main.py          # Point d'entrée FastAPI
│   │   ├── schemas.py       # Schémas Pydantic
│   │   ├── security.py      # Sécurité
│   │   ├── supabase.py      # Client Supabase
│   │   ├── workout.py       # Gestion des entraînements
│   │   └── .env.example     # Variables d'environnement
│   ├── Dockerfile           # Configuration Docker backend
│   ├── docker-compose.yml   # Orchestration backend seul
│   └── requirements.txt     # Dépendances Python
│
├── infrastructure/          # Scripts et documentation infrastructure
│   └── Readme.md
│
├── docker-compose.yml       # Orchestration complète (frontend + backend)
├── package.json             # Configuration workspace
├── .env.example             # Variables d'environnement racine
├── .gitignore               # Fichiers ignorés par Git
├── projectsummary.md        # Résumé du projet
└── quickstart.md            # Guide de démarrage rapide

```

## 🚀 Démarrage Rapide

### Prérequis

- Node.js 18+ et npm
- Python 3.11+
- Compte Supabase (gratuit sur https://supabase.com)
- Docker et Docker Compose (optionnel)

### Installation

#### Avec Docker (Recommandé)

```bash
# Cloner le dépôt
git clone https://github.com/analyticsPapy/trainlytics-app.git
cd trainlytics-app

# Copier et configurer les variables d'environnement
cp .env.example .env
cp backend/app/.env.example backend/app/.env
# Éditer les fichiers .env avec vos valeurs

# Lancer l'application complète
docker-compose up
```

L'application sera accessible sur :
- Frontend : http://localhost:5173
- Backend API : http://localhost:8000
- API Docs : http://localhost:8000/docs

#### Sans Docker

**Backend**

```bash
cd backend

# Créer un environnement virtuel
python -m venv venv
source venv/bin/activate  # Sur Windows: venv\Scripts\activate

# Installer les dépendances
pip install -r requirements.txt

# Configurer les variables d'environnement
cp app/.env.example app/.env
# Éditer app/.env avec vos valeurs

# Lancer le serveur
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Frontend**

```bash
cd frontend

# Installer les dépendances
npm install

# Lancer le serveur de développement
npm run dev
```

## 🔧 Configuration

### Variables d'Environnement

#### Backend (`backend/app/.env`)

```env
SUPABASE_URL=votre_url_supabase
SUPABASE_KEY=votre_cle_supabase
DATABASE_URL=postgresql://user:password@host:port/database
GARMIN_CLIENT_ID=votre_client_id_garmin
GARMIN_CLIENT_SECRET=votre_client_secret_garmin
JWT_SECRET=votre_secret_jwt
```

### Scripts Disponibles

À la racine :
- `npm run dev:frontend` - Démarrer le frontend en mode dev
- `npm run dev:backend` - Démarrer le backend avec Docker
- `npm run build:frontend` - Build de production du frontend
- `npm run docker:up` - Lancer tous les services avec Docker
- `npm run docker:down` - Arrêter tous les services Docker

## 📚 Technologies

### Frontend
- React 18
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Supabase Client

### Backend
- Python 3.11
- FastAPI
- Supabase
- Garmin Connect API
- Pydantic

## 🔐 Configuration Supabase

### 1. Créer un Projet Supabase

1. Allez sur https://supabase.com et créez un compte
2. Créez un nouveau projet
3. Notez votre URL et vos clés API

### 2. Appliquer la Migration

Voir `backend/migrations/001_adapt_schema.sql` pour le schéma complet.

1. Allez dans le **SQL Editor** de Supabase
2. Copiez et exécutez le fichier de migration
3. Vérifiez que les tables sont créées

### 3. Configurer les Variables d'Environnement

Utilisez les fichiers .env créés avec les valeurs de votre projet Supabase.

**Pour tester la configuration:**
```bash
cd backend
python test_env.py
```

## 🔗 Intégrations OAuth

| Provider | Status | Docs |
|----------|--------|------|
| Garmin | ✅ | [developer.garmin.com](https://developer.garmin.com) |
| Strava | ✅ | [developers.strava.com](https://developers.strava.com) |
| Polar | ✅ | [polar.com/accesslink-api](https://www.polar.com/accesslink-api) |
| Wahoo | ✅ | [api.wahooligan.com](https://api.wahooligan.com) |
| Coros | ✅ | [open.coros.com](https://open.coros.com) |
| Fitbit | ✅ | [dev.fitbit.com](https://dev.fitbit.com) |

## 📖 Documentation

- [Deployment Guide](./DEPLOYMENT.md) - Guide complet de déploiement en production
- [Project Summary](./projectsummary.md) - Vue d'ensemble du projet
- [Quick Start](./quickstart.md) - Guide de démarrage rapide
- [Infrastructure](./infrastructure/Readme.md) - Documentation infrastructure
- [API Docs](http://localhost:8000/api/docs) - Documentation Swagger (après démarrage du backend)

## 🚢 Déploiement

Consultez [DEPLOYMENT.md](./DEPLOYMENT.md) pour déployer en production:
- Frontend: Cloudflare Pages
- Backend: Railway / Render / Heroku
- Database: Supabase PostgreSQL

## 🛡️ Sécurité

- ✅ JWT avec validation stricte (min 32 caractères)
- ✅ Row Level Security (RLS) sur toutes les tables
- ✅ OAuth 2.0 pour les intégrations tierces
- ✅ CORS configuré
- ✅ Mots de passe hashés via Supabase Auth

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à ouvrir une issue ou une pull request.

## 📝 Licence

MIT

---

🤖 Généré avec [Claude Code](https://claude.com/claude-code)
