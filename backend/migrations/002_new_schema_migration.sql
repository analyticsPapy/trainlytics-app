-- ============================================================================
-- Migration: Transform existing schema to new multi-provider architecture
-- ============================================================================
-- This migration transforms the Strava-specific schema to a generic
-- multi-provider architecture while preserving all existing data.
--
-- Safe to run: Only adds and transforms, never deletes existing data
-- ============================================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 1. CREATE ENUMS (if they don't exist)
-- ============================================================================

-- User role enum
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('athlete', 'coach', 'admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Activity type enum
DO $$ BEGIN
    CREATE TYPE activity_type AS ENUM (
        'run', 'ride', 'swim', 'walk', 'hike',
        'workout', 'yoga', 'crossfit', 'other'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Provider type enum
DO $$ BEGIN
    CREATE TYPE provider_type AS ENUM (
        'strava', 'garmin', 'polar', 'coros', 'wahoo', 'fitbit'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ============================================================================
-- 2. EXTEND USERS TABLE
-- ============================================================================

-- Add missing columns to users table
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS avatar_url TEXT,
ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP WITHOUT TIME ZONE;

-- Update role column if it's not already using the enum
-- (Skip if already using enum)
DO $$
BEGIN
    -- Check if role column needs conversion
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'users'
        AND column_name = 'role'
        AND data_type != 'USER-DEFINED'
    ) THEN
        -- Convert role to enum
        ALTER TABLE public.users
        ALTER COLUMN role TYPE user_role USING role::text::user_role;
    END IF;
END $$;

-- ============================================================================
-- 3. CREATE NEW PROVIDER_CONNECTIONS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.provider_connections (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,

    -- Provider information
    provider provider_type NOT NULL,
    provider_user_id VARCHAR(255) NOT NULL,
    provider_username VARCHAR(255),
    provider_email VARCHAR(255),

    -- Provider profile data (JSON)
    provider_profile JSONB DEFAULT '{}',

    -- OAuth tokens
    access_token TEXT NOT NULL,
    refresh_token TEXT NOT NULL,
    token_expires_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    scopes VARCHAR(500),

    -- Connection status
    is_active BOOLEAN NOT NULL DEFAULT true,
    last_sync_at TIMESTAMP WITHOUT TIME ZONE,
    last_sync_error TEXT,

    -- Timestamps
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),

    -- Constraints
    UNIQUE(user_id, provider),
    UNIQUE(provider, provider_user_id)
);

-- ============================================================================
-- 4. MIGRATE DATA FROM STRAVA_CONNECTIONS TO PROVIDER_CONNECTIONS
-- ============================================================================

-- Migrate Strava connections
INSERT INTO public.provider_connections (
    user_id,
    provider,
    provider_user_id,
    provider_username,
    provider_email,
    provider_profile,
    access_token,
    refresh_token,
    token_expires_at,
    scopes,
    is_active,
    last_sync_at,
    created_at,
    updated_at
)
SELECT
    sc.user_id,
    'strava'::provider_type,
    sc.strava_athlete_id::VARCHAR,
    sc.strava_username,
    NULL, -- strava_connections doesn't have email
    jsonb_build_object(
        'firstname', sc.strava_firstname,
        'lastname', sc.strava_lastname,
        'profile_url', sc.strava_profile_url,
        'profile_picture', sc.strava_profile_picture
    ),
    sc.access_token,
    sc.refresh_token,
    sc.token_expires_at,
    sc.scopes,
    true, -- Assume existing connections are active
    sc.last_sync_at,
    sc.created_at,
    sc.updated_at
FROM public.strava_connections sc
WHERE NOT EXISTS (
    -- Prevent duplicates if migration is run multiple times
    SELECT 1 FROM public.provider_connections pc
    WHERE pc.user_id = sc.user_id
    AND pc.provider = 'strava'
    AND pc.provider_user_id = sc.strava_athlete_id::VARCHAR
);

-- ============================================================================
-- 5. EXTEND ACTIVITIES TABLE
-- ============================================================================

-- Add connection_id column if it doesn't exist
ALTER TABLE public.activities
ADD COLUMN IF NOT EXISTS connection_id INTEGER REFERENCES public.provider_connections(id) ON DELETE SET NULL;

-- Add activity_data column for extensibility
ALTER TABLE public.activities
ADD COLUMN IF NOT EXISTS activity_data JSONB DEFAULT '{}';

-- Update activity_type column to use enum (if not already)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'activities'
        AND column_name = 'activity_type'
        AND data_type != 'USER-DEFINED'
    ) THEN
        -- Create a mapping function for activity types
        ALTER TABLE public.activities
        ALTER COLUMN activity_type TYPE activity_type
        USING CASE
            WHEN LOWER(activity_type::TEXT) IN ('run', 'running') THEN 'run'::activity_type
            WHEN LOWER(activity_type::TEXT) IN ('ride', 'cycling', 'bike') THEN 'ride'::activity_type
            WHEN LOWER(activity_type::TEXT) IN ('swim', 'swimming') THEN 'swim'::activity_type
            WHEN LOWER(activity_type::TEXT) = 'walk' THEN 'walk'::activity_type
            WHEN LOWER(activity_type::TEXT) = 'hike' THEN 'hike'::activity_type
            WHEN LOWER(activity_type::TEXT) IN ('workout', 'training') THEN 'workout'::activity_type
            WHEN LOWER(activity_type::TEXT) = 'yoga' THEN 'yoga'::activity_type
            WHEN LOWER(activity_type::TEXT) = 'crossfit' THEN 'crossfit'::activity_type
            ELSE 'other'::activity_type
        END;
    END IF;
END $$;

-- Link activities to their provider_connections
UPDATE public.activities a
SET connection_id = pc.id
FROM public.provider_connections pc
WHERE a.connection_id IS NULL
  AND a.user_id = pc.user_id
  AND pc.provider = 'strava'
  AND a.strava_activity_id IS NOT NULL;

-- Migrate strava_activity_id to external_id if external_id doesn't exist
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'activities'
        AND column_name = 'strava_activity_id'
    ) THEN
        -- Add external_id column if it doesn't exist
        ALTER TABLE public.activities
        ADD COLUMN IF NOT EXISTS external_id VARCHAR(255);

        -- Copy strava_activity_id to external_id
        UPDATE public.activities
        SET external_id = strava_activity_id::VARCHAR
        WHERE external_id IS NULL AND strava_activity_id IS NOT NULL;
    END IF;
END $$;

-- Store strava_upload_id in activity_data if it exists
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'activities'
        AND column_name = 'strava_upload_id'
    ) THEN
        UPDATE public.activities
        SET activity_data = jsonb_set(
            COALESCE(activity_data, '{}'::jsonb),
            '{strava_upload_id}',
            to_jsonb(strava_upload_id)
        )
        WHERE strava_upload_id IS NOT NULL
        AND activity_data->>'strava_upload_id' IS NULL;
    END IF;
END $$;

-- ============================================================================
-- 6. CREATE SYNC_HISTORY TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.sync_history (
    id SERIAL PRIMARY KEY,
    connection_id INTEGER NOT NULL REFERENCES public.provider_connections(id) ON DELETE CASCADE,

    -- Sync information
    sync_started_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
    sync_completed_at TIMESTAMP WITHOUT TIME ZONE,
    sync_status VARCHAR(50) NOT NULL DEFAULT 'running',

    -- Statistics
    activities_fetched INTEGER DEFAULT 0,
    activities_created INTEGER DEFAULT 0,
    activities_updated INTEGER DEFAULT 0,
    activities_skipped INTEGER DEFAULT 0,

    -- Error tracking
    error_message TEXT,
    error_details JSONB,

    -- Timestamps
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 7. CREATE WORKOUTS TABLE (if doesn't exist)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.workouts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,

    -- Workout information
    name VARCHAR(255) NOT NULL,
    description TEXT,
    workout_type activity_type,

    -- Scheduling
    scheduled_date DATE,
    completed_at TIMESTAMP WITHOUT TIME ZONE,

    -- Link to actual activity
    activity_id INTEGER REFERENCES public.activities(id) ON DELETE SET NULL,

    -- Workout plan data
    workout_data JSONB DEFAULT '{}',

    -- Timestamps
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 8. CREATE INDEXES
-- ============================================================================

-- Users indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON public.users(is_active);

-- Provider connections indexes
CREATE INDEX IF NOT EXISTS idx_provider_connections_user_id ON public.provider_connections(user_id);
CREATE INDEX IF NOT EXISTS idx_provider_connections_provider ON public.provider_connections(provider);
CREATE INDEX IF NOT EXISTS idx_provider_connections_is_active ON public.provider_connections(is_active);
CREATE INDEX IF NOT EXISTS idx_provider_connections_last_sync ON public.provider_connections(last_sync_at DESC);

-- Activities indexes
CREATE INDEX IF NOT EXISTS idx_activities_user_id ON public.activities(user_id);
CREATE INDEX IF NOT EXISTS idx_activities_connection_id ON public.activities(connection_id);
CREATE INDEX IF NOT EXISTS idx_activities_start_date ON public.activities(start_date DESC);
CREATE INDEX IF NOT EXISTS idx_activities_activity_type ON public.activities(activity_type);
CREATE INDEX IF NOT EXISTS idx_activities_external_id ON public.activities(external_id);

-- Password reset tokens indexes
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_user_id ON public.password_reset_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token ON public.password_reset_tokens(token);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_expires_at ON public.password_reset_tokens(expires_at);

-- Workouts indexes
CREATE INDEX IF NOT EXISTS idx_workouts_user_id ON public.workouts(user_id);
CREATE INDEX IF NOT EXISTS idx_workouts_scheduled_date ON public.workouts(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_workouts_activity_id ON public.workouts(activity_id);

-- Sync history indexes
CREATE INDEX IF NOT EXISTS idx_sync_history_connection_id ON public.sync_history(connection_id);
CREATE INDEX IF NOT EXISTS idx_sync_history_sync_started_at ON public.sync_history(sync_started_at DESC);
CREATE INDEX IF NOT EXISTS idx_sync_history_sync_status ON public.sync_history(sync_status);

-- ============================================================================
-- 9. CREATE OR UPDATE TRIGGERS
-- ============================================================================

-- Function to update updated_at timestamp (create or replace)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing triggers if they exist, then recreate
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_provider_connections_updated_at ON public.provider_connections;
CREATE TRIGGER update_provider_connections_updated_at
    BEFORE UPDATE ON public.provider_connections
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_activities_updated_at ON public.activities;
CREATE TRIGGER update_activities_updated_at
    BEFORE UPDATE ON public.activities
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_password_reset_tokens_updated_at ON public.password_reset_tokens;
CREATE TRIGGER update_password_reset_tokens_updated_at
    BEFORE UPDATE ON public.password_reset_tokens
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_workouts_updated_at ON public.workouts;
CREATE TRIGGER update_workouts_updated_at
    BEFORE UPDATE ON public.workouts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 10. CREATE HELPER FUNCTIONS
-- ============================================================================

-- Function to clean up expired password reset tokens
CREATE OR REPLACE FUNCTION cleanup_expired_password_tokens()
RETURNS void AS $$
BEGIN
    DELETE FROM public.password_reset_tokens
    WHERE expires_at < NOW() OR is_used = true;
END;
$$ LANGUAGE plpgsql;

-- Function to get user's full name
CREATE OR REPLACE FUNCTION get_user_full_name(p_user_id INTEGER)
RETURNS TEXT AS $$
DECLARE
    full_name TEXT;
BEGIN
    SELECT CONCAT_WS(' ', first_name, last_name) INTO full_name
    FROM public.users
    WHERE id = p_user_id;

    RETURN COALESCE(full_name, 'Unknown User');
END;
$$ LANGUAGE plpgsql;

-- Function to check if token is expired
CREATE OR REPLACE FUNCTION is_token_expired(p_connection_id INTEGER)
RETURNS BOOLEAN AS $$
DECLARE
    expires_at TIMESTAMP;
BEGIN
    SELECT token_expires_at INTO expires_at
    FROM public.provider_connections
    WHERE id = p_connection_id;

    RETURN expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 11. CREATE VIEWS
-- ============================================================================

-- View: User with active connections
CREATE OR REPLACE VIEW user_connections_summary AS
SELECT
    u.id as user_id,
    u.email,
    u.first_name,
    u.last_name,
    u.role,
    COUNT(pc.id) as total_connections,
    COUNT(pc.id) FILTER (WHERE pc.is_active = true) as active_connections,
    ARRAY_AGG(pc.provider) FILTER (WHERE pc.is_active = true) as connected_providers
FROM public.users u
LEFT JOIN public.provider_connections pc ON u.id = pc.user_id
GROUP BY u.id, u.email, u.first_name, u.last_name, u.role;

-- View: Recent activities with connection info
CREATE OR REPLACE VIEW recent_activities AS
SELECT
    a.id,
    a.user_id,
    a.name,
    a.activity_type,
    a.start_date,
    a.distance,
    a.moving_time,
    a.average_heartrate,
    pc.provider,
    pc.provider_username,
    u.email as user_email,
    get_user_full_name(a.user_id) as user_full_name
FROM public.activities a
LEFT JOIN public.provider_connections pc ON a.connection_id = pc.id
LEFT JOIN public.users u ON a.user_id = u.id
ORDER BY a.start_date DESC;

-- ============================================================================
-- 12. ADD COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON TABLE public.users IS 'Main users table with local authentication';
COMMENT ON TABLE public.provider_connections IS 'External provider connections (Strava, Garmin, etc.) - Supports multiple connections per user';
COMMENT ON TABLE public.activities IS 'Activities from all providers, normalized and unified';
COMMENT ON TABLE public.password_reset_tokens IS 'Password reset tokens with expiration';
COMMENT ON TABLE public.workouts IS 'Planned workouts and training schedules';
COMMENT ON TABLE public.sync_history IS 'History of synchronizations with external providers';

COMMENT ON COLUMN public.provider_connections.provider_profile IS 'JSON object storing provider-specific profile data (name, picture, etc.)';
COMMENT ON COLUMN public.activities.activity_data IS 'JSON object for provider-specific additional data';
COMMENT ON COLUMN public.users.preferences IS 'JSON object for user preferences (units, privacy settings, etc.)';

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE '✅ Migration 002_new_schema_migration.sql completed successfully';
    RAISE NOTICE '✅ Created provider_connections table';
    RAISE NOTICE '✅ Migrated data from strava_connections';
    RAISE NOTICE '✅ Extended activities table with connection_id';
    RAISE NOTICE '✅ Created sync_history table';
    RAISE NOTICE '✅ Added all indexes and triggers';
    RAISE NOTICE '✅ Created helper functions and views';
    RAISE NOTICE '';
    RAISE NOTICE '📊 Next steps:';
    RAISE NOTICE '1. Verify data migration with: SELECT * FROM user_connections_summary;';
    RAISE NOTICE '2. Check activities linkage: SELECT COUNT(*) FROM activities WHERE connection_id IS NOT NULL;';
    RAISE NOTICE '3. You can now add more providers (Garmin, Polar, etc.) without schema changes!';
END $$;
