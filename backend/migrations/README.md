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

## Future Migrations

Additional migrations will be numbered sequentially:
- `002_*.sql`
- `003_*.sql`
- etc.
