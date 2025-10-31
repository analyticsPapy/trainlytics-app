# 🔄 Backend Changes - Multi-Provider Architecture

## Vue d'ensemble

Ce document détaille tous les changements apportés au backend pour supporter l'architecture multi-provider.

## 📁 Nouveaux fichiers créés

### 1. Services

#### `app/services/provider_service.py`
**Nouveaux services pour gérer les connexions et l'historique de synchronisation**

- **`ProviderConnectionService`** : Service principal pour gérer les connexions provider
  - `get_user_connections()` : Récupère toutes les connexions d'un utilisateur
  - `get_connection()` : Récupère une connexion spécifique
  - `get_connection_by_provider()` : Récupère la connexion d'un provider spécifique
  - `upsert_connection()` : Crée ou met à jour une connexion (gère la déduplication)
  - `update_connection()` : Met à jour des champs spécifiques
  - `delete_connection()` : Supprime une connexion
  - `update_last_sync()` : Met à jour la dernière date de synchronisation

- **`SyncHistoryService`** : Service pour tracer les synchronisations
  - `start_sync()` : Démarre une nouvelle synchronisation
  - `complete_sync()` : Complète une synchronisation (succès/échec)
  - `get_sync_history()` : Récupère l'historique des syncs
  - `get_latest_sync()` : Récupère la dernière synchronisation

**Utilisation:**
```python
from app.services.provider_service import ProviderConnectionService, SyncHistoryService

# Créer ou mettre à jour une connexion
connection = await ProviderConnectionService.upsert_connection(
    user_id=1,
    provider=ProviderType.STRAVA,
    provider_user_id="12345",
    access_token="token",
    refresh_token="refresh",
    token_expires_at=datetime.now() + timedelta(hours=6),
    provider_profile={"firstname": "John", "lastname": "Doe"}
)

# Démarrer une synchronisation
sync_id = await SyncHistoryService.start_sync(connection_id=connection["id"])

# ... synchroniser les activités ...

# Terminer la synchronisation
await SyncHistoryService.complete_sync(
    sync_id=sync_id,
    status="success",
    activities_created=10
)
```

### 2. Routes API

#### `app/routes/provider_routes.py`
**Nouvelles routes API pour gérer les connexions multi-provider**

**Routes de gestion des connexions:**
- `GET /providers/connections` : Liste toutes les connexions de l'utilisateur
- `GET /providers/connections/{id}` : Détails d'une connexion
- `GET /providers/connections/provider/{provider}` : Connexion pour un provider spécifique
- `DELETE /providers/connections/{id}` : Déconnecter un provider
- `PATCH /providers/connections/{id}/toggle` : Activer/désactiver une connexion

**Routes de synchronisation:**
- `POST /providers/connections/{id}/sync` : Déclencher une synchronisation manuelle
- `GET /providers/connections/{id}/sync-history` : Historique des synchronisations
- `GET /providers/connections/{id}/sync-status` : Statut de la dernière synchronisation

**Routes de dashboard:**
- `GET /providers/summary` : Résumé de toutes les connexions
- `GET /providers/available-providers` : Liste des providers supportés

**Exemples:**
```bash
# Lister toutes les connexions
curl -X GET "http://localhost:8000/api/providers/connections" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Déclencher une synchronisation
curl -X POST "http://localhost:8000/api/providers/connections/1/sync" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Voir l'historique
curl -X GET "http://localhost:8000/api/providers/connections/1/sync-history?limit=5" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 3. Documentation

- **`QUICK_MIGRATION_STEPS.md`** : Guide rapide de migration (3 minutes)
- **`BACKEND_CHANGES.md`** : Ce fichier - documentation des changements

## 📝 Fichiers modifiés

### 1. `app/connections.py`
**Changements:**
- Remplacé toutes les références `user_connections` → `provider_connections`
- Le code reste compatible, seul le nom de table a changé

**Avant:**
```python
response = sb.table("user_connections").select("*")...
```

**Après:**
```python
response = sb.table("provider_connections").select("*")...
```

### 2. `app/oauth.py`
**Changements:**
- Remplacé `user_connections` → `provider_connections` (ligne 334)
- Compatible avec le nouveau schéma multi-provider

## 🔧 Configuration requise

### Variables d'environnement

Aucune nouvelle variable d'environnement requise ! Les variables existantes dans `.env.example` fonctionnent déjà:

```env
# Supabase Configuration
SUPABASE_URL=your_supabase_url_here
SUPABASE_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# Database
DATABASE_URL=postgresql://user:password@host:port/database

# OAuth Providers (déjà configurés!)
STRAVA_CLIENT_ID=your_strava_client_id
STRAVA_CLIENT_SECRET=your_strava_client_secret
# ... Garmin, Polar, Coros, Wahoo, Fitbit
```

## 🚀 Intégration dans main.py

Pour activer les nouvelles routes, ajoutez dans `app/main.py`:

```python
from app.routes import provider_routes

# ...

app.include_router(provider_routes.router, prefix="/api")
```

## 🧪 Tests

### Test de connexion Strava (exemple)

```python
import asyncio
from datetime import datetime, timedelta
from app.services.provider_service import ProviderConnectionService
from app.schemas import ProviderType

async def test_strava_connection():
    # Créer une connexion Strava
    connection = await ProviderConnectionService.upsert_connection(
        user_id=1,
        provider=ProviderType.STRAVA,
        provider_user_id="12345678",
        access_token="test_access_token",
        refresh_token="test_refresh_token",
        token_expires_at=datetime.utcnow() + timedelta(hours=6),
        provider_username="john_doe",
        provider_email="john@example.com",
        provider_profile={
            "firstname": "John",
            "lastname": "Doe",
            "profile": "https://strava.com/athletes/12345678",
            "profile_medium": "https://strava.com/athletes/12345678/medium.jpg"
        },
        scopes="read,activity:read_all,profile:read_all"
    )

    print(f"✅ Connection created: {connection['id']}")
    print(f"   Provider: {connection['provider']}")
    print(f"   User ID on provider: {connection['provider_user_id']}")

    # Récupérer la connexion
    fetched = await ProviderConnectionService.get_connection_by_provider(
        user_id=1,
        provider=ProviderType.STRAVA
    )

    print(f"✅ Connection fetched: {fetched['id']}")

if __name__ == "__main__":
    asyncio.run(test_strava_connection())
```

### Test de synchronisation

```python
from app.services.provider_service import SyncHistoryService

async def test_sync():
    # Démarrer une sync
    sync_id = await SyncHistoryService.start_sync(connection_id=1)
    print(f"🔄 Sync started: {sync_id}")

    # ... faire la synchronisation ...

    # Terminer avec succès
    await SyncHistoryService.complete_sync(
        sync_id=sync_id,
        status="success",
        activities_fetched=25,
        activities_created=20,
        activities_updated=5,
        activities_skipped=0
    )
    print(f"✅ Sync completed successfully")

    # Voir l'historique
    history = await SyncHistoryService.get_sync_history(connection_id=1, limit=5)
    print(f"📊 Sync history: {len(history)} records")
    for record in history:
        print(f"   - {record['sync_status']}: {record['activities_created']} created")
```

## 📊 Comparaison Avant/Après

### Avant (user_connections - Supabase Auth)
```python
# Requête pour lister les connexions
connections = sb.table("user_connections").select("*").eq("user_id", uuid_user_id).execute()

# Champs disponibles:
# - id (UUID)
# - user_id (UUID - référence à auth.users)
# - provider (text)
# - access_token (text)
# - ...
```

### Après (provider_connections - Multi-provider)
```python
# Même requête, nouveau nom de table
connections = sb.table("provider_connections").select("*").eq("user_id", int_user_id).execute()

# Nouveaux champs disponibles:
# - id (SERIAL - integer auto-incrémenté)
# - user_id (INTEGER - référence à public.users)
# - provider (provider_type ENUM - type safe!)
# - provider_profile (JSONB - extensible!)
# - last_sync_error (TEXT - debugging!)
# - ...
```

## ✨ Avantages de la nouvelle architecture

### 1. Type Safety avec ENUMs
```sql
-- Avant: Texte libre (risque d'erreurs)
provider VARCHAR(50)  -- 'strava', 'straav', 'STRAVA', etc.

-- Après: ENUM strict
provider provider_type  -- 'strava', 'garmin', 'polar', etc. (validé!)
```

### 2. Extensibilité avec JSONB
```python
# Stocker des données spécifiques au provider
provider_profile = {
    # Strava
    "firstname": "John",
    "lastname": "Doe",
    "profile": "https://strava.com/athletes/123",
    "profile_medium": "https://...",
    "premium": True,  # Strava-specific!
    "city": "Paris"
}

# Garmin (structure différente, pas de problème!)
provider_profile = {
    "displayName": "John Doe",
    "profileImageUrlLarge": "https://...",
    "garmin_guid": "abc-def-123",
    "locale": "fr_FR"  # Garmin-specific!
}
```

### 3. Traçabilité complète
```python
# Voir l'historique complet des syncs
history = await SyncHistoryService.get_sync_history(connection_id=1)

# Exemple de résultat:
[
    {
        "sync_started_at": "2025-10-31 10:00:00",
        "sync_completed_at": "2025-10-31 10:00:15",
        "sync_status": "success",
        "activities_created": 25,
        "activities_updated": 5
    },
    {
        "sync_started_at": "2025-10-30 08:00:00",
        "sync_completed_at": "2025-10-30 08:00:05",
        "sync_status": "failed",
        "error_message": "Token expired"
    }
]
```

## 🔄 Migration Checklist

- [x] Nouveau schéma SQL créé (`new_schema.sql`)
- [x] Script de migration créé (`002_new_schema_migration.sql`)
- [x] Service provider_connections créé
- [x] Service sync_history créé
- [x] Routes API créées
- [x] Fichiers existants adaptés (connections.py, oauth.py)
- [ ] Migration appliquée sur Supabase (à faire par l'utilisateur)
- [ ] Routes intégrées dans main.py
- [ ] Tests écrits et validés
- [ ] Documentation utilisateur créée

## 📚 Prochaines étapes

1. **Appliquer la migration SQL** sur Supabase (voir `QUICK_MIGRATION_STEPS.md`)
2. **Intégrer les nouvelles routes** dans `main.py`
3. **Tester avec Strava** (provider déjà implémenté)
4. **Implémenter Garmin** (OAuth 1.0a)
5. **Implémenter Polar, Coros, Wahoo, Fitbit** (OAuth 2.0)
6. **Créer le frontend** pour visualiser les connexions multi-provider

## 🐛 Débogage

### Vérifier les connexions
```sql
-- Voir toutes les connexions
SELECT * FROM provider_connections;

-- Connexions par provider
SELECT provider, COUNT(*) as count
FROM provider_connections
GROUP BY provider;
```

### Vérifier les syncs
```sql
-- Dernières synchronisations
SELECT
    pc.provider,
    sh.sync_status,
    sh.activities_created,
    sh.sync_started_at
FROM sync_history sh
JOIN provider_connections pc ON sh.connection_id = pc.id
ORDER BY sh.sync_started_at DESC
LIMIT 10;
```

---

**Auteur:** Claude
**Version:** 1.0
**Date:** 2025-10-31
