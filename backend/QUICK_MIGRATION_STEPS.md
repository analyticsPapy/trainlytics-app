# 🚀 Migration Rapide - 3 Minutes Chrono

## Étape 1: Appliquer la migration SQL (2 minutes)

### Option A: Supabase Dashboard (RECOMMANDÉ - Le plus simple!)

1. **Ouvrir Supabase Dashboard**
   - Allez sur: https://app.supabase.com
   - Sélectionnez votre projet Trainlytics

2. **Ouvrir SQL Editor**
   - Dans le menu de gauche, cliquez sur **SQL Editor**
   - Cliquez sur **New query**

3. **Copier-Coller la migration**
   - Ouvrez le fichier: `backend/migrations/002_new_schema_migration.sql`
   - Sélectionnez TOUT le contenu (Ctrl+A / Cmd+A)
   - Copiez (Ctrl+C / Cmd+C)
   - Collez dans l'éditeur SQL de Supabase (Ctrl+V / Cmd+V)

4. **Exécuter**
   - Cliquez sur **RUN** (ou appuyez sur Ctrl+Enter / Cmd+Enter)
   - Attendez ~2-5 secondes
   - ✅ Vous devriez voir des messages de succès

### Option B: Via psql (Si vous avez psql installé)

```bash
cd backend/migrations

# Remplacez YOUR_SUPABASE_URL par votre URL Supabase
psql -h db.XXXXX.supabase.co \
     -p 5432 \
     -d postgres \
     -U postgres \
     -f 002_new_schema_migration.sql
```

## Étape 2: Vérifier que ça a marché (30 secondes)

Dans le **SQL Editor** de Supabase, exécutez:

```sql
-- Vérifier les nouvelles tables
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('provider_connections', 'sync_history')
ORDER BY table_name;
```

**Résultat attendu:**
```
table_name
-------------------
provider_connections
sync_history
```

Si vous voyez ces deux tables → ✅ **Migration réussie !**

## Étape 3: Vérifier les données migrées (30 secondes)

```sql
-- Vérifier que les données Strava ont été migrées
SELECT
    COUNT(*) as strava_connections_migrated
FROM provider_connections
WHERE provider = 'strava';
```

Si le count est > 0 → ✅ **Vos données Strava sont migrées !**

## 🎉 C'est tout !

Votre base de données est maintenant prête pour le multi-provider !

### Prochaines étapes:
- [ ] Redémarrer le backend pour utiliser le nouveau schéma
- [ ] Tester la connexion Strava existante
- [ ] Ajouter un nouveau provider (Garmin, Polar, etc.)

---

**Besoin d'aide ?** Consultez `MIGRATION_GUIDE.md` pour plus de détails.
