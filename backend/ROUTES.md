# Documentation des Routes API - Trainlytics

## 📋 Vue d'ensemble

L'API Trainlytics est organisée en 5 modules principaux :

1. **Authentication** (`/api/auth`)
2. **Provider Connections** (`/api/providers`)
3. **OAuth** (`/api/oauth`)
4. **Activities** (`/api/activities`)
5. **Workouts** (`/api/workouts`)

---

## 🔐 Authentication Routes (`/api/auth`)

### POST `/api/auth/signup`
- **Description** : Créer un nouveau compte utilisateur
- **Body** : `{ email, password, full_name, user_type }`
- **Response** : Token JWT + User Profile

### POST `/api/auth/login`
- **Description** : Se connecter avec email/password
- **Body** : `{ email, password }`
- **Response** : Token JWT + User Profile

### POST `/api/auth/refresh`
- **Description** : Rafraîchir le token JWT
- **Body** : `{ refresh_token }`
- **Response** : Nouveau token JWT

### POST `/api/auth/logout`
- **Description** : Déconnexion de l'utilisateur
- **Auth** : Requis
- **Response** : Message de confirmation

### GET `/api/auth/me`
- **Description** : Obtenir le profil de l'utilisateur connecté
- **Auth** : Requis
- **Response** : User Profile

### PATCH `/api/auth/me`
- **Description** : Mettre à jour le profil utilisateur
- **Auth** : Requis
- **Body** : `{ full_name?, timezone?, preferred_language? }`
- **Response** : User Profile mis à jour

### DELETE `/api/auth/me`
- **Description** : Supprimer le compte utilisateur
- **Auth** : Requis
- **Response** : Message de confirmation

---

## 🔗 Provider Connections Routes (`/api/providers`)

### GET `/api/providers/connections`
- **Description** : Lister toutes les connexions de l'utilisateur
- **Auth** : Requis
- **Query** : `active_only` (boolean)
- **Response** : Liste des connexions

### GET `/api/providers/connections/{connection_id}`
- **Description** : Détails d'une connexion spécifique
- **Auth** : Requis
- **Response** : Connection details

### GET `/api/providers/connections/provider/{provider}`
- **Description** : Obtenir la connexion pour un provider spécifique
- **Auth** : Requis
- **Params** : `provider` (strava, garmin, polar, coros, wahoo, fitbit)
- **Response** : Connection ou null

### DELETE `/api/providers/connections/{connection_id}`
- **Description** : Déconnecter un provider
- **Auth** : Requis
- **Response** : Message de confirmation

### PATCH `/api/providers/connections/{connection_id}/toggle`
- **Description** : Activer/désactiver une connexion
- **Auth** : Requis
- **Query** : `is_active` (boolean)
- **Response** : Connection mise à jour

### POST `/api/providers/connections/{connection_id}/sync`
- **Description** : Déclencher manuellement une synchronisation
- **Auth** : Requis
- **Response** : Message de confirmation + Sync ID

### GET `/api/providers/connections/{connection_id}/sync-history`
- **Description** : Historique des synchronisations
- **Auth** : Requis
- **Query** : `limit` (default: 10)
- **Response** : Liste des sync operations

### GET `/api/providers/connections/{connection_id}/sync-status`
- **Description** : Statut actuel de la synchronisation
- **Auth** : Requis
- **Response** : Sync status details

### GET `/api/providers/summary`
- **Description** : Résumé de toutes les connexions
- **Auth** : Requis
- **Response** : Summary avec statistiques

### GET `/api/providers/available-providers`
- **Description** : Liste des providers supportés
- **Auth** : Non requis
- **Response** : Liste des providers avec leur statut d'implémentation

---

## 🔑 OAuth Routes (`/api/oauth`)

### POST `/api/oauth/init`
- **Description** : Initialiser le flow OAuth pour un provider
- **Auth** : Requis
- **Body** : `{ provider }`
- **Response** : `{ authorization_url, state }`
- **Providers supportés** :
  - ✅ Strava (OAuth 2.0)
  - ⏳ Garmin (OAuth 1.0a - partial)
  - ❌ Polar (non implémenté)
  - ❌ Coros (non implémenté)
  - ❌ Wahoo (non implémenté)
  - ❌ Fitbit (non implémenté)

### GET `/api/oauth/callback`
- **Description** : Callback OAuth après autorisation
- **Query** : `code, state, provider`
- **Response** : Connection créée/mise à jour

---

## 🏃 Activities Routes (`/api/activities`)

### GET `/api/activities`
- **Description** : Lister toutes les activités de l'utilisateur
- **Auth** : Requis
- **Query** :
  - `skip` (pagination)
  - `limit` (max 100)
  - `activity_type` (run, ride, swim, etc.)
  - `start_date`
  - `end_date`
- **Response** : Liste des activités

### GET `/api/activities/{activity_id}`
- **Description** : Détails d'une activité
- **Auth** : Requis
- **Response** : Activity details

### POST `/api/activities`
- **Description** : Créer une activité manuellement
- **Auth** : Requis
- **Body** : Activity data
- **Response** : Activity créée

### PATCH `/api/activities/{activity_id}`
- **Description** : Mettre à jour une activité
- **Auth** : Requis
- **Body** : Champs à mettre à jour
- **Response** : Activity mise à jour

### DELETE `/api/activities/{activity_id}`
- **Description** : Supprimer une activité
- **Auth** : Requis
- **Response** : Message de confirmation

---

## 💪 Workouts Routes (`/api/workouts`)

### GET `/api/workouts`
- **Description** : Lister tous les workouts planifiés
- **Auth** : Requis
- **Query** :
  - `skip` (pagination)
  - `limit` (max 100)
  - `workout_type`
  - `scheduled_date`
  - `completed` (boolean)
- **Response** : Liste des workouts

### GET `/api/workouts/{workout_id}`
- **Description** : Détails d'un workout
- **Auth** : Requis
- **Response** : Workout details

### POST `/api/workouts`
- **Description** : Créer un nouveau workout
- **Auth** : Requis
- **Body** : Workout data
- **Response** : Workout créé

### PATCH `/api/workouts/{workout_id}`
- **Description** : Mettre à jour un workout
- **Auth** : Requis
- **Body** : Champs à mettre à jour
- **Response** : Workout mis à jour

### DELETE `/api/workouts/{workout_id}`
- **Description** : Supprimer un workout
- **Auth** : Requis
- **Response** : Message de confirmation

---

## 🏥 Health Routes

### GET `/health`
- **Description** : Health check endpoint
- **Auth** : Non requis
- **Response** : `{ status: "healthy", service: "Trainlytics API", environment: "development" }`

### GET `/`
- **Description** : Root endpoint avec informations API
- **Auth** : Non requis
- **Response** : API info + liens documentation

---

## 📝 Notes d'implémentation

### Providers Status
- **Strava** : ✅ Complètement implémenté
- **Garmin** : ⚠️ Partiellement implémenté (OAuth 1.0a complexe)
- **Polar, Coros, Wahoo, Fitbit** : ❌ Non implémentés

### Authentication
- JWT tokens avec refresh tokens
- Expiration par défaut : 24h
- Support de multiples types d'utilisateurs : athlete, coach, pro, lab

### Synchronization
- Sync history tracking avec statistiques détaillées
- Support de sync manuel et automatique
- Gestion d'erreurs avec error logging

### Base de données
- Supabase/PostgreSQL
- Tables principales : users, provider_connections, activities, workouts, sync_history
