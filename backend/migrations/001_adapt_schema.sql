-- Migration Script: Adapt existing schema to Trainlytics API
-- This script adds missing columns and creates compatibility views
-- Safe to run: Only adds, never deletes existing data

-- ============================================================================
-- 1. EXTEND USERS TABLE
-- ============================================================================

-- Add missing columns to users table
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS full_name TEXT,
ADD COLUMN IF NOT EXISTS avatar_url TEXT,
ADD COLUMN IF NOT EXISTS user_type TEXT DEFAULT 'athlete' CHECK (user_type IN ('athlete', 'coach', 'pro', 'lab')),
ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Update existing role values to match user_type
UPDATE public.users
SET user_type = role
WHERE user_type IS NULL;

-- Create user_profiles view for backward compatibility
CREATE OR REPLACE VIEW public.user_profiles AS
SELECT
    id,
    email,
    full_name,
    avatar_url,
    user_type,
    preferences,
    created_at,
    updated_at
FROM public.users;

-- ============================================================================
-- 2. RENAME/EXTEND DEVICE_CONNECTIONS TO CONNECTIONS
-- ============================================================================

-- Rename device_connections to connections (if needed)
-- Or create a view for compatibility
CREATE OR REPLACE VIEW public.connections AS
SELECT
    id,
    user_id,
    provider,
    access_token,
    refresh_token,
    expires_at as token_expires_at,
    status = 'connected' as is_active,
    last_sync as last_sync_at,
    created_at,
    created_at as updated_at,
    NULL::TEXT as provider_user_id,
    NULL::TEXT as provider_email,
    ARRAY[]::TEXT[] as scopes,
    '{}'::JSONB as connection_metadata
FROM public.device_connections;

-- Add missing columns to device_connections
ALTER TABLE public.device_connections
ADD COLUMN IF NOT EXISTS provider_user_id TEXT,
ADD COLUMN IF NOT EXISTS provider_email TEXT,
ADD COLUMN IF NOT EXISTS scopes TEXT[],
ADD COLUMN IF NOT EXISTS connection_metadata JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- ============================================================================
-- 3. EXTEND ACTIVITIES TABLE
-- ============================================================================

-- Add missing columns to activities
ALTER TABLE public.activities
ADD COLUMN IF NOT EXISTS connection_id UUID REFERENCES public.device_connections(id),
ADD COLUMN IF NOT EXISTS external_id TEXT, -- Same as source_id
ADD COLUMN IF NOT EXISTS activity_name TEXT, -- Same as title
ADD COLUMN IF NOT EXISTS end_time TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS elevation_gain NUMERIC, -- Same as elevation
ADD COLUMN IF NOT EXISTS avg_power INTEGER,
ADD COLUMN IF NOT EXISTS max_power INTEGER,
ADD COLUMN IF NOT EXISTS avg_speed NUMERIC,
ADD COLUMN IF NOT EXISTS activity_data JSONB DEFAULT '{}'::jsonb, -- Same as metrics
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Sync external_id with source_id
UPDATE public.activities
SET external_id = source_id
WHERE external_id IS NULL AND source_id IS NOT NULL;

-- Sync activity_name with title
UPDATE public.activities
SET activity_name = title
WHERE activity_name IS NULL AND title IS NOT NULL;

-- Sync elevation_gain with elevation
UPDATE public.activities
SET elevation_gain = elevation
WHERE elevation_gain IS NULL AND elevation IS NOT NULL;

-- Sync activity_data with metrics
UPDATE public.activities
SET activity_data = metrics
WHERE activity_data = '{}'::jsonb AND metrics IS NOT NULL;

-- Map source to connection_id (if device_connections exist)
UPDATE public.activities a
SET connection_id = dc.id
FROM public.device_connections dc
WHERE a.connection_id IS NULL
  AND a.source = dc.provider
  AND a.user_id = dc.user_id
  AND dc.status = 'connected';

-- ============================================================================
-- 4. EXTEND WORKOUTS TABLE
-- ============================================================================

-- Add missing columns to workouts
ALTER TABLE public.workouts
ADD COLUMN IF NOT EXISTS workout_name TEXT, -- Same as title
ADD COLUMN IF NOT EXISTS workout_type TEXT, -- Same as type
ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS activity_id UUID REFERENCES public.activities(id),
ADD COLUMN IF NOT EXISTS workout_data JSONB DEFAULT '{}'::jsonb;

-- Sync workout_name with title
UPDATE public.workouts
SET workout_name = title
WHERE workout_name IS NULL;

-- Sync workout_type with type
UPDATE public.workouts
SET workout_type = type
WHERE workout_type IS NULL;

-- Mark completed workouts
UPDATE public.workouts
SET completed_at = updated_at
WHERE status = 'completed' AND completed_at IS NULL;

-- Link workouts to activities (reverse direction)
UPDATE public.workouts w
SET activity_id = a.id
FROM public.activities a
WHERE w.activity_id IS NULL
  AND a.workout_id = w.id;

-- ============================================================================
-- 5. CREATE INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_user_type ON public.users(user_type);
CREATE INDEX IF NOT EXISTS idx_device_connections_user_id ON public.device_connections(user_id);
CREATE INDEX IF NOT EXISTS idx_device_connections_provider ON public.device_connections(provider);
CREATE INDEX IF NOT EXISTS idx_activities_user_id ON public.activities(user_id);
CREATE INDEX IF NOT EXISTS idx_activities_connection_id ON public.activities(connection_id);
CREATE INDEX IF NOT EXISTS idx_activities_start_time ON public.activities(start_time);
CREATE INDEX IF NOT EXISTS idx_workouts_user_id ON public.workouts(user_id);
CREATE INDEX IF NOT EXISTS idx_workouts_scheduled_date ON public.workouts(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_athletes_user_id ON public.athletes(user_id);
CREATE INDEX IF NOT EXISTS idx_athletes_coach_id ON public.athletes(coach_id);

-- ============================================================================
-- 6. CREATE TRIGGERS FOR UPDATED_AT
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to tables
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_device_connections_updated_at ON public.device_connections;
CREATE TRIGGER update_device_connections_updated_at
    BEFORE UPDATE ON public.device_connections
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_activities_updated_at ON public.activities;
CREATE TRIGGER update_activities_updated_at
    BEFORE UPDATE ON public.activities
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_workouts_updated_at ON public.workouts;
CREATE TRIGGER update_workouts_updated_at
    BEFORE UPDATE ON public.workouts
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- 7. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.device_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.athletes ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile
CREATE POLICY IF NOT EXISTS "Users can view own profile"
    ON public.users FOR SELECT
    USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY IF NOT EXISTS "Users can update own profile"
    ON public.users FOR UPDATE
    USING (auth.uid() = id);

-- Users can view their own connections
CREATE POLICY IF NOT EXISTS "Users can view own connections"
    ON public.device_connections FOR SELECT
    USING (auth.uid() = user_id);

-- Users can manage their own connections
CREATE POLICY IF NOT EXISTS "Users can manage own connections"
    ON public.device_connections FOR ALL
    USING (auth.uid() = user_id);

-- Users can view their own activities
CREATE POLICY IF NOT EXISTS "Users can view own activities"
    ON public.activities FOR SELECT
    USING (auth.uid() = user_id);

-- Users can manage their own activities
CREATE POLICY IF NOT EXISTS "Users can manage own activities"
    ON public.activities FOR ALL
    USING (auth.uid() = user_id);

-- Users can view their own workouts
CREATE POLICY IF NOT EXISTS "Users can view own workouts"
    ON public.workouts FOR SELECT
    USING (auth.uid() = user_id);

-- Users can manage their own workouts
CREATE POLICY IF NOT EXISTS "Users can manage own workouts"
    ON public.workouts FOR ALL
    USING (auth.uid() = user_id);

-- Athletes: users can view if they are the athlete or the coach
CREATE POLICY IF NOT EXISTS "Athletes can view own records"
    ON public.athletes FOR SELECT
    USING (auth.uid() = user_id OR auth.uid() = coach_id);

-- Coaches can manage their athletes
CREATE POLICY IF NOT EXISTS "Coaches can manage athletes"
    ON public.athletes FOR ALL
    USING (auth.uid() = coach_id);

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

-- Log migration
DO $$
BEGIN
    RAISE NOTICE 'Migration 001_adapt_schema.sql completed successfully';
    RAISE NOTICE 'Added columns to users, device_connections, activities, workouts';
    RAISE NOTICE 'Created user_profiles and connections views for compatibility';
    RAISE NOTICE 'Added indexes and triggers';
    RAISE NOTICE 'Configured Row Level Security policies';
END $$;
