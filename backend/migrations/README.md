# Database Migrations

This directory contains SQL migration scripts to adapt your existing Supabase schema to work with the Trainlytics API.

## Migration 001: Schema Adaptation

**File:** `001_adapt_schema.sql`

This migration adapts your existing database schema to be compatible with the Trainlytics API code. It:

- ✅ Adds missing columns to existing tables (never deletes data)
- ✅ Creates compatibility views (`user_profiles`, `connections`)
- ✅ Adds indexes for better performance
- ✅ Creates triggers for auto-updating timestamps
- ✅ Configures Row Level Security (RLS) policies

### How to Apply

#### Option 1: Supabase Dashboard (Recommended)

1. Go to your Supabase project: https://app.supabase.com
2. Navigate to **SQL Editor**
3. Copy the entire content of `001_adapt_schema.sql`
4. Paste it into a new query
5. Click **Run** (or press Cmd/Ctrl + Enter)

#### Option 2: psql Command Line

```bash
# From the backend/migrations directory
psql -h db.zclkfguqdwayztxvpcpn.supabase.co \
     -p 5432 \
     -d postgres \
     -U postgres \
     -f 001_adapt_schema.sql
```

When prompted, enter your password: `T9h7d9ur84%`

#### Option 3: Python Script

```bash
# From the backend directory
python apply_migration.py
```

### What This Migration Does

#### 1. Users Table Extensions
- Adds: `full_name`, `avatar_url`, `user_type`, `preferences`, `updated_at`
- Creates `user_profiles` view for API compatibility

#### 2. Device Connections Extensions
- Adds: `provider_user_id`, `provider_email`, `scopes`, `connection_metadata`, `updated_at`
- Creates `connections` view for API compatibility

#### 3. Activities Table Extensions
- Adds: `connection_id`, `activity_name`, `end_time`, `elevation_gain`, `avg_power`, `max_power`, `avg_speed`, `activity_data`, `updated_at`
- Links activities to device connections

#### 4. Workouts Table Extensions
- Adds: `workout_name`, `workout_type`, `completed_at`, `activity_id`, `workout_data`
- Links workouts to activities

#### 5. Performance Indexes
- Adds indexes on frequently queried columns

#### 6. Auto-Update Triggers
- Automatically updates `updated_at` on row changes

#### 7. Row Level Security
- Enables RLS on all tables
- Users can only access their own data
- Coaches can access their athletes' data

### Safety

This migration is **safe** to run:
- ✅ Only adds columns (never removes)
- ✅ Only creates views and indexes
- ✅ Never deletes existing data
- ✅ Can be run multiple times (idempotent)

### Rollback

If you need to rollback, you can:

```sql
-- Drop views
DROP VIEW IF EXISTS public.user_profiles;
DROP VIEW IF EXISTS public.connections;

-- Drop added columns (optional, only if needed)
ALTER TABLE public.users DROP COLUMN IF EXISTS full_name CASCADE;
-- ... etc
```

### Verification

After running the migration, verify it worked:

```sql
-- Check if columns were added
SELECT column_name
FROM information_schema.columns
WHERE table_name = 'users'
AND table_schema = 'public';

-- Check if views were created
SELECT viewname
FROM pg_views
WHERE schemaname = 'public';
```

## Migration 002: Multi-Provider Architecture

**File:** `002_new_schema_migration.sql`

This migration transforms the Strava-specific schema into a **scalable multi-provider architecture** that supports Garmin, Polar, Coros, Wahoo, and Fitbit.

### Key Changes

#### 🔄 Transform `strava_connections` → `provider_connections`
- Generalizes the connections table to support ANY provider
- One user can have MULTIPLE connections (Strava + Garmin + etc.)
- All existing Strava data is automatically migrated

#### 📊 Add ENUMs for Type Safety
- `user_role`: athlete, coach, admin
- `activity_type`: run, ride, swim, walk, hike, workout, yoga, crossfit, other
- `provider_type`: strava, garmin, polar, coros, wahoo, fitbit

#### 🆕 New Tables
- **`provider_connections`**: Generic connections table (replaces strava_connections)
- **`sync_history`**: Track all sync operations with providers
- **`workouts`**: Planned workouts and training schedules

#### ✨ Enhanced Features
- **JSONB fields** for extensibility (provider_profile, activity_data, preferences)
- **Helper functions** (get_user_full_name, is_token_expired, cleanup_expired_password_tokens)
- **Views** (user_connections_summary, recent_activities)
- **Full indexing** for optimal performance

### How to Apply

#### Option 1: Supabase Dashboard (Recommended)

1. Go to your Supabase project: https://app.supabase.com
2. Navigate to **SQL Editor**
3. Copy the entire content of `002_new_schema_migration.sql`
4. Paste it into a new query
5. Click **Run** (or press Cmd/Ctrl + Enter)

#### Option 2: Python Script

```bash
# From the backend directory
python apply_migration.py migrations/002_new_schema_migration.sql
```

#### Option 3: psql Command Line

```bash
# From the backend/migrations directory
psql -h db.zclkfguqdwayztxvpcpn.supabase.co \
     -p 5432 \
     -d postgres \
     -U postgres \
     -f 002_new_schema_migration.sql
```

### What Gets Migrated

```
BEFORE (Strava-only):
users (id, email, password_hash, ...)
  └── strava_connections (user_id, strava_athlete_id, access_token, ...)
       └── activities (user_id, strava_activity_id, ...)

AFTER (Multi-provider):
users (id, email, password_hash, role, preferences, ...)
  └── provider_connections (user_id, provider, provider_user_id, ...)
       ├── provider: 'strava' (migrated from strava_connections)
       ├── provider: 'garmin' (ready to add!)
       ├── provider: 'polar' (ready to add!)
       └── ...
       └── activities (user_id, connection_id, external_id, ...)
       └── sync_history (connection_id, sync_status, activities_created, ...)
```

### Data Migration Details

1. **All Strava connections** are automatically copied to `provider_connections` with `provider = 'strava'`
2. **All activities** are linked to their `provider_connections` via `connection_id`
3. **Strava-specific fields** (strava_athlete_id, strava_username, etc.) are mapped to generic fields
4. **Profile data** (firstname, lastname, picture) is stored in `provider_profile` JSONB
5. **Old tables remain intact** - no data loss!

### Verification

After migration, verify the data:

```sql
-- Check migrated connections
SELECT * FROM user_connections_summary;

-- Verify activities are linked
SELECT
    COUNT(*) as total_activities,
    COUNT(connection_id) as linked_activities
FROM activities;

-- Check provider distribution
SELECT
    provider,
    COUNT(*) as connection_count,
    COUNT(*) FILTER (WHERE is_active = true) as active_count
FROM provider_connections
GROUP BY provider;
```

### Benefits

✅ **Scalable**: Add new providers without schema changes
✅ **Flexible**: Users can connect multiple services
✅ **Maintainable**: Single codebase for all providers
✅ **Traceable**: Full sync history and error tracking
✅ **Performant**: Optimized indexes on all key columns

### Safety

This migration is **safe** to run:
- ✅ Creates new tables alongside existing ones
- ✅ Copies data (never moves or deletes)
- ✅ Can be run multiple times (idempotent)
- ✅ Old `strava_connections` table remains untouched

### Next Steps

After migration:

1. **Test the new structure:**
   ```sql
   SELECT * FROM recent_activities LIMIT 10;
   ```

2. **Add a new provider** (example: Garmin):
   ```sql
   INSERT INTO provider_connections (user_id, provider, provider_user_id, ...)
   VALUES (1, 'garmin', 'garmin-uuid-123', ...);
   ```

3. **Update your backend code** to use `provider_connections` instead of `strava_connections`

4. **Optional: Drop old table** (only after confirming everything works):
   ```sql
   -- Only run this after extensive testing!
   DROP TABLE IF EXISTS public.strava_connections;
   ```

## Future Migrations

Additional migrations will be numbered sequentially:
- `003_*.sql`
- `004_*.sql`
- etc.
