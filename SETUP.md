# Trainlytics - Configuration Setup

## Fichiers d'environnement créés

Les fichiers `.env` suivants ont été créés basés sur les templates `.env.example`:

### 1. `.env` (Racine - Docker Compose)
- `SUPABASE_URL` et `SUPABASE_KEY`
- `DATABASE_URL`
- `GARMIN_CLIENT_ID` et `GARMIN_CLIENT_SECRET`

### 2. `backend/app/.env` (Backend FastAPI)
Configuration complète incluant:
- Application settings (APP_NAME, APP_ENV, DEBUG)
- Server settings (HOST, PORT)
- Supabase configuration
- Database connection
- JWT configuration (générer avec `openssl rand -hex 32`)
- OAuth providers (Garmin, Strava, Polar, Coros, Wahoo, Fitbit)
- CORS settings

### 3. `frontend/.env` (Frontend Vite/React)
- `VITE_API_URL=http://localhost:8000/api`
- `VITE_APP_ENV=development`

## Important

Ces fichiers `.env` contiennent des valeurs placeholder et doivent être configurés avec vos vraies credentials avant de lancer l'application.

Les fichiers `.env` sont exclus de Git pour des raisons de sécurité.
