# 🏗️ Trainlytics Database Architecture

## Vue d'ensemble

Cette architecture combine **authentification locale** (email/password) avec **connexions multi-providers** (Strava, Garmin, Polar, etc.) pour créer une plateforme d'analyse d'entraînement scalable et évolutive.

## 📊 Schéma de données

### 1. Table `users` - Authentification principale

**Objectif:** Gérer les utilisateurs avec authentification locale

```
users
├── id (SERIAL PRIMARY KEY)
├── email (UNIQUE)
├── password_hash
├── first_name / last_name / avatar_url
├── role (athlete / coach / admin)
├── is_active / is_verified
└── preferences (JSONB)
```

**Points clés:**
- ✅ Authentification indépendante des providers
- ✅ Un seul compte = un seul email
- ✅ Gestion des rôles (athlète, coach, admin)

### 2. Table `provider_connections` - Connexions multi-providers

**Objectif:** Relier les utilisateurs aux services externes (Strava, Garmin, etc.)

```
provider_connections
├── id (SERIAL PRIMARY KEY)
├── user_id → users(id)
├── provider (strava, garmin, polar, coros, wahoo, fitbit)
├── provider_user_id (ID externe)
├── provider_profile (JSONB - nom, photo, etc.)
├── access_token / refresh_token
├── token_expires_at
├── is_active
└── last_sync_at
```

**Points clés:**
- ✅ **Un utilisateur peut avoir PLUSIEURS connexions** (ex: Strava + Garmin)
- ✅ Contrainte: `UNIQUE(user_id, provider)` → 1 seule connexion par provider
- ✅ Stockage sécurisé des tokens OAuth
- ✅ Suivi de la dernière synchronisation

### 3. Table `activities` - Activités unifiées

**Objectif:** Centraliser toutes les activités, quelle que soit leur source

```
activities
├── id (SERIAL PRIMARY KEY)
├── user_id → users(id)
├── connection_id → provider_connections(id)
├── external_id (ID du provider)
├── name / description / activity_type
├── start_date / timezone
├── distance / speed / pace
├── heartrate / power / cadence
├── elevation / calories
├── is_manual / is_private
└── activity_data (JSONB - données additionnelles)
```

**Points clés:**
- ✅ Données normalisées de tous les providers
- ✅ Contrainte: `UNIQUE(connection_id, external_id)` → pas de doublons
- ✅ Champ JSONB pour données spécifiques au provider

### 4. Table `sync_history` - Historique de synchronisation

**Objectif:** Tracer toutes les synchronisations avec les providers

```
sync_history
├── id (SERIAL PRIMARY KEY)
├── connection_id → provider_connections(id)
├── sync_started_at / sync_completed_at
├── sync_status (running, success, failed, partial)
├── activities_fetched / created / updated / skipped
└── error_message / error_details (JSONB)
```

**Points clés:**
- ✅ Debugging facilité
- ✅ Statistiques de synchronisation
- ✅ Détection des erreurs récurrentes

### 5. Tables secondaires

**`password_reset_tokens`** - Réinitialisation de mot de passe
**`workouts`** - Entraînements planifiés (optionnel)

## 🔄 Flux de données

### Scénario 1: Nouvel utilisateur se connecte via Strava

```
1. Utilisateur s'inscrit → Création dans `users`
   ├── email: "john@example.com"
   ├── password_hash: "..."
   └── id: 1

2. Utilisateur connecte Strava → Création dans `provider_connections`
   ├── user_id: 1
   ├── provider: 'strava'
   ├── provider_user_id: "12345678"
   ├── access_token: "..."
   └── refresh_token: "..."

3. Synchronisation Strava → Création dans `activities`
   ├── user_id: 1
   ├── connection_id: 1
   ├── external_id: "9876543210"
   ├── name: "Morning Run"
   └── distance: 5000
```

### Scénario 2: Utilisateur connecte aussi Garmin

```
1. Même utilisateur connecte Garmin → Nouvelle ligne dans `provider_connections`
   ├── user_id: 1 (même user!)
   ├── provider: 'garmin'
   ├── provider_user_id: "garmin-uuid-123"
   └── ...

2. Les activités Garmin sont aussi ajoutées → `activities`
   ├── user_id: 1
   ├── connection_id: 2 (nouvelle connexion Garmin)
   ├── external_id: "garmin-activity-456"
   └── ...
```

**Résultat:** L'utilisateur voit TOUTES ses activités (Strava + Garmin) dans un seul tableau de bord !

## 🎯 Avantages de cette architecture

### 1. Scalabilité
- ✅ Ajouter un nouveau provider (Polar, Coros) = **AUCUN changement de schéma**
- ✅ Juste ajouter la valeur à l'enum `provider_type`

### 2. Flexibilité
- ✅ Un utilisateur peut utiliser plusieurs services simultanément
- ✅ Peut déconnecter/reconnecter un service sans perdre les données

### 3. Sécurité
- ✅ Tokens isolés dans une table dédiée
- ✅ RLS (Row Level Security) possible sur Supabase
- ✅ Historique des connexions pour audit

### 4. Performance
- ✅ Indexes optimisés sur les colonnes les plus utilisées
- ✅ Requêtes rapides grâce aux foreign keys
- ✅ Views pré-calculées pour les statistiques

### 5. Maintenance
- ✅ Un seul code pour gérer toutes les connexions
- ✅ Facile à tester et à débugger
- ✅ Documentation claire avec COMMENTs SQL

## 📝 Exemples de requêtes

### Récupérer toutes les activités d'un utilisateur (tous providers)

```sql
SELECT
    a.id,
    a.name,
    a.activity_type,
    a.start_date,
    a.distance,
    pc.provider,
    pc.provider_username
FROM activities a
JOIN provider_connections pc ON a.connection_id = pc.id
WHERE a.user_id = 1
ORDER BY a.start_date DESC;
```

### Vérifier quels providers un utilisateur a connecté

```sql
SELECT
    u.email,
    pc.provider,
    pc.is_active,
    pc.last_sync_at
FROM users u
LEFT JOIN provider_connections pc ON u.id = pc.user_id
WHERE u.id = 1;
```

### Statistiques de synchronisation par provider

```sql
SELECT
    pc.provider,
    sh.sync_status,
    SUM(sh.activities_created) as total_created,
    COUNT(*) as sync_count
FROM sync_history sh
JOIN provider_connections pc ON sh.connection_id = pc.id
GROUP BY pc.provider, sh.sync_status;
```

## 🚀 Migration depuis l'ancien schéma

### Comparaison

| Ancien schéma | Nouveau schéma | Changement |
|---------------|----------------|------------|
| `strava_connections` | `provider_connections` | Généralisé pour tous les providers |
| Spécifique Strava | Colonnes génériques | Plus flexible |
| Pas d'historique sync | `sync_history` | Ajouté |
| Types en VARCHAR | ENUMs SQL | Plus strict et performant |

### Script de migration

Voir `/home/user/trainlytics-app/backend/migrations/002_new_schema.sql`

## 🔧 Configuration

### Variables d'environnement requises

```env
# Database
DATABASE_URL=postgresql://user:password@host:5432/dbname

# OAuth Providers
STRAVA_CLIENT_ID=your-client-id
STRAVA_CLIENT_SECRET=your-secret
STRAVA_REDIRECT_URI=http://localhost:8000/oauth/strava/callback

GARMIN_CLIENT_ID=...
GARMIN_CLIENT_SECRET=...
# etc.
```

## 📚 Ressources

- [PostgreSQL ENUMs](https://www.postgresql.org/docs/current/datatype-enum.html)
- [JSONB Performance](https://www.postgresql.org/docs/current/datatype-json.html)
- [Indexing Best Practices](https://www.postgresql.org/docs/current/indexes.html)

---

**Auteur:** Trainlytics Team
**Version:** 2.0
**Dernière mise à jour:** 2025-10-31
