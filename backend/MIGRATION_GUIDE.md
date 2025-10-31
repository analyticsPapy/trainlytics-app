# 🚀 Guide de Migration - Architecture Multi-Provider

## Aperçu

Ce guide vous accompagne dans la migration de votre base de données Trainlytics vers une architecture multi-provider évolutive.

## 📋 Table des matières

1. [Avant de commencer](#avant-de-commencer)
2. [Étape 1: Backup](#étape-1-backup)
3. [Étape 2: Appliquer la migration](#étape-2-appliquer-la-migration)
4. [Étape 3: Vérifier les données](#étape-3-vérifier-les-données)
5. [Étape 4: Mettre à jour le code backend](#étape-4-mettre-à-jour-le-code-backend)
6. [FAQ et Dépannage](#faq-et-dépannage)

---

## Avant de commencer

### ⚠️ Prérequis

- [ ] Accès à votre dashboard Supabase
- [ ] Backup de votre base de données (recommandé)
- [ ] Lecture du fichier `ARCHITECTURE.md`

### 📊 Ce que cette migration fait

```
AVANT:                          APRÈS:
---------                       ---------
users                           users
  └── strava_connections          └── provider_connections (multi-provider!)
       └── activities                  ├── Strava
                                       ├── Garmin (prêt!)
                                       ├── Polar (prêt!)
                                       └── ...
                                       └── activities (unifié)
                                       └── sync_history (nouveau!)
```

### ✅ Ce qui est préservé

- ✅ Tous les utilisateurs existants
- ✅ Toutes les connexions Strava
- ✅ Toutes les activités
- ✅ Tous les tokens OAuth
- ✅ Toutes les données de profil

### 🆕 Ce qui est ajouté

- 🆕 Table `provider_connections` (générique)
- 🆕 Table `sync_history` (traçabilité)
- 🆕 ENUMs pour type safety
- 🆕 Indexes de performance
- 🆕 Fonctions helper
- 🆕 Views pour requêtes courantes

---

## Étape 1: Backup

### Option A: Via Supabase Dashboard (Recommandé)

1. Connectez-vous à https://app.supabase.com
2. Sélectionnez votre projet
3. Allez dans **Database** → **Backups**
4. Cliquez sur **Create backup**
5. Attendez la confirmation

### Option B: Via pg_dump

```bash
# Exporter la base complète
pg_dump -h db.XXXXX.supabase.co \
        -p 5432 \
        -U postgres \
        -d postgres \
        -F c \
        -f trainlytics_backup_$(date +%Y%m%d).dump

# Vérifier le backup
ls -lh trainlytics_backup_*.dump
```

---

## Étape 2: Appliquer la migration

### Méthode 1: Supabase Dashboard (Recommandé)

1. Ouvrez https://app.supabase.com
2. Sélectionnez votre projet
3. Allez dans **SQL Editor**
4. Créez une nouvelle query
5. Copiez le contenu de `backend/migrations/002_new_schema_migration.sql`
6. Collez-le dans l'éditeur
7. Cliquez sur **RUN** (ou Cmd/Ctrl + Enter)
8. Attendez le message de succès

**Temps estimé:** 2-5 secondes (selon la taille de vos données)

### Méthode 2: Script Python

```bash
cd backend
python apply_migration.py migrations/002_new_schema_migration.sql
```

### Méthode 3: psql

```bash
cd backend/migrations

psql -h db.XXXXX.supabase.co \
     -p 5432 \
     -d postgres \
     -U postgres \
     -f 002_new_schema_migration.sql
```

---

## Étape 3: Vérifier les données

### 1. Vérifier que la migration a réussi

Dans le **SQL Editor** de Supabase, exécutez:

```sql
-- Vérifier les tables créées
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('provider_connections', 'sync_history', 'workouts')
ORDER BY table_name;
```

**Résultat attendu:**
```
table_name
-------------------
provider_connections
sync_history
workouts
```

### 2. Vérifier la migration des données Strava

```sql
-- Comparer les comptes
SELECT
    'strava_connections' as table,
    COUNT(*) as count
FROM strava_connections
UNION ALL
SELECT
    'provider_connections (strava)' as table,
    COUNT(*) as count
FROM provider_connections
WHERE provider = 'strava';
```

**Résultat attendu:** Les deux counts doivent être identiques.

### 3. Vérifier les activités liées

```sql
-- Vérifier que les activités sont liées aux connections
SELECT
    COUNT(*) as total_activities,
    COUNT(connection_id) as linked_activities,
    COUNT(*) - COUNT(connection_id) as unlinked_activities
FROM activities;
```

**Résultat attendu:** `unlinked_activities` devrait être 0 (ou très faible).

### 4. Tester les views

```sql
-- Vue résumé des connexions
SELECT * FROM user_connections_summary LIMIT 5;

-- Vue activités récentes
SELECT * FROM recent_activities LIMIT 10;
```

### 5. Tester les fonctions helper

```sql
-- Test de get_user_full_name
SELECT id, email, get_user_full_name(id) as full_name
FROM users
LIMIT 5;

-- Test de is_token_expired
SELECT
    id,
    provider,
    token_expires_at,
    is_token_expired(id) as is_expired
FROM provider_connections
LIMIT 5;
```

---

## Étape 4: Mettre à jour le code backend

### 1. Créer un nouveau service pour provider_connections

Créez `backend/app/provider_connections.py`:

```python
from typing import List, Optional
from supabase import Client
from datetime import datetime

class ProviderConnectionService:
    def __init__(self, supabase: Client):
        self.supabase = supabase

    async def get_user_connections(self, user_id: int) -> List[dict]:
        """Récupère toutes les connexions d'un utilisateur"""
        response = self.supabase.table('provider_connections') \
            .select('*') \
            .eq('user_id', user_id) \
            .eq('is_active', True) \
            .execute()
        return response.data

    async def get_connection(self, user_id: int, provider: str) -> Optional[dict]:
        """Récupère une connexion spécifique"""
        response = self.supabase.table('provider_connections') \
            .select('*') \
            .eq('user_id', user_id) \
            .eq('provider', provider) \
            .single() \
            .execute()
        return response.data

    async def upsert_connection(self, connection_data: dict) -> dict:
        """Crée ou met à jour une connexion"""
        response = self.supabase.table('provider_connections') \
            .upsert(connection_data) \
            .execute()
        return response.data[0]

    async def update_last_sync(self, connection_id: int):
        """Met à jour la date de dernière sync"""
        response = self.supabase.table('provider_connections') \
            .update({'last_sync_at': datetime.utcnow().isoformat()}) \
            .eq('id', connection_id) \
            .execute()
        return response.data[0]
```

### 2. Adapter le code Strava existant

Dans `backend/app/oauth.py`, remplacez les références à `strava_connections`:

**AVANT:**
```python
# Ancien code
connection = supabase.table('strava_connections').insert({
    'user_id': user_id,
    'strava_athlete_id': athlete_id,
    'access_token': access_token,
    ...
}).execute()
```

**APRÈS:**
```python
# Nouveau code
connection = supabase.table('provider_connections').upsert({
    'user_id': user_id,
    'provider': 'strava',
    'provider_user_id': str(athlete_id),
    'access_token': access_token,
    'provider_profile': {
        'firstname': athlete_data.get('firstname'),
        'lastname': athlete_data.get('lastname'),
        'profile_url': athlete_data.get('profile'),
        'profile_picture': athlete_data.get('profile_medium')
    },
    ...
}).execute()
```

### 3. Utiliser le service de sync_history

```python
async def sync_activities(connection_id: int):
    """Synchronise les activités avec historique"""

    # Créer l'entrée de sync
    sync = supabase.table('sync_history').insert({
        'connection_id': connection_id,
        'sync_status': 'running'
    }).execute()
    sync_id = sync.data[0]['id']

    try:
        # Synchroniser les activités
        activities_created = 0
        activities_updated = 0

        # ... votre code de sync ...

        # Marquer comme succès
        supabase.table('sync_history').update({
            'sync_completed_at': datetime.utcnow().isoformat(),
            'sync_status': 'success',
            'activities_created': activities_created,
            'activities_updated': activities_updated
        }).eq('id', sync_id).execute()

    except Exception as e:
        # Enregistrer l'erreur
        supabase.table('sync_history').update({
            'sync_completed_at': datetime.utcnow().isoformat(),
            'sync_status': 'failed',
            'error_message': str(e)
        }).eq('id', sync_id).execute()
        raise
```

---

## FAQ et Dépannage

### ❓ La migration échoue avec "relation already exists"

**Cause:** La migration a déjà été exécutée partiellement.

**Solution:** C'est normal ! La migration est idempotente, elle peut être exécutée plusieurs fois sans problème. Continuez jusqu'à la fin.

### ❓ Certaines activités ont `connection_id = NULL`

**Cause:** Ce sont probablement des activités manuelles ou orphelines.

**Solution:**
```sql
-- Identifier les activités non liées
SELECT id, user_id, name, is_manual
FROM activities
WHERE connection_id IS NULL
LIMIT 10;

-- Les lier manuellement si nécessaire
UPDATE activities
SET connection_id = (
    SELECT id FROM provider_connections
    WHERE user_id = activities.user_id
    AND provider = 'strava'
    LIMIT 1
)
WHERE connection_id IS NULL AND is_manual = false;
```

### ❓ Je veux revenir en arrière

**Solution:**

1. Restaurer le backup:
```bash
pg_restore -h db.XXXXX.supabase.co \
           -p 5432 \
           -U postgres \
           -d postgres \
           -c trainlytics_backup_YYYYMMDD.dump
```

OU

2. Supprimer uniquement les nouvelles tables:
```sql
DROP TABLE IF EXISTS sync_history CASCADE;
DROP TABLE IF EXISTS provider_connections CASCADE;
DROP VIEW IF EXISTS user_connections_summary;
DROP VIEW IF EXISTS recent_activities;
```

### ❓ Comment ajouter un nouveau provider (Garmin, Polar, etc.) ?

**Étape 1:** Vérifier que le provider est dans l'enum:
```sql
SELECT enum_range(NULL::provider_type);
```

**Étape 2:** Si absent, l'ajouter:
```sql
ALTER TYPE provider_type ADD VALUE 'nouveau_provider';
```

**Étape 3:** Créer la connexion:
```python
connection = supabase.table('provider_connections').insert({
    'user_id': user_id,
    'provider': 'garmin',  # ou 'polar', etc.
    'provider_user_id': 'garmin-user-id',
    'access_token': 'token',
    'refresh_token': 'refresh',
    'token_expires_at': expires_at.isoformat(),
    'provider_profile': { ... }
}).execute()
```

**C'est tout !** Le reste du système fonctionne automatiquement.

---

## 🎉 Migration Complète !

Félicitations ! Votre base de données est maintenant prête pour le multi-provider.

### Prochaines étapes suggérées:

1. ✅ Tester la connexion Strava existante
2. ✅ Ajouter un nouveau provider (Garmin recommandé)
3. ✅ Implémenter la synchronisation automatique
4. ✅ Créer un dashboard pour voir toutes les connexions
5. ✅ Optionnel: Supprimer l'ancienne table `strava_connections` après tests complets

### Ressources

- 📖 [Architecture complète](./ARCHITECTURE.md)
- 📂 [Schéma SQL complet](./app/services/new_schema.sql)
- 🔄 [Fichier de migration](./migrations/002_new_schema_migration.sql)

---

**Questions ?** Ouvrez une issue sur GitHub ou consultez la documentation Supabase.
