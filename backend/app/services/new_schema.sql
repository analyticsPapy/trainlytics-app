-- ============================================================================
-- TRAINLYTICS DATABASE SCHEMA - COMPLETE & SCALABLE
-- ============================================================================
-- This schema combines local authentication with multi-provider connections
-- Designed for scalability and future growth
-- ============================================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 1. AUTHENTICATION & USERS
-- ============================================================================

-- User roles enum
CREATE TYPE user_role AS ENUM ('athlete', 'coach', 'admin');

-- Activity types enum
CREATE TYPE activity_type AS ENUM (
    'run', 'ride', 'swim', 'walk', 'hike',
    'workout', 'yoga', 'crossfit', 'other'
);

-- Provider types enum (extensible without schema changes)
CREATE TYPE provider_type AS ENUM (
    'strava', 'garmin', 'polar', 'coros', 'wahoo', 'fitbit'
);

-- Main users table - Local authentication
CREATE TABLE public.users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,

    -- Profile information
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    avatar_url TEXT,

    -- User type and status
    role user_role NOT NULL DEFAULT 'athlete',
    is_active BOOLEAN NOT NULL DEFAULT true,
    is_verified BOOLEAN NOT NULL DEFAULT false,

    -- Additional settings
    preferences JSONB DEFAULT '{}',

    -- Timestamps
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
    last_login_at TIMESTAMP WITHOUT TIME ZONE
);

-- ============================================================================
-- 2. PROVIDER CONNECTIONS (Multi-provider support)
-- ============================================================================

-- Provider connections table - Links users to external services
CREATE TABLE public.provider_connections (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,

    -- Provider information
    provider provider_type NOT NULL,
    provider_user_id VARCHAR(255) NOT NULL, -- External user ID (e.g., Strava athlete ID)
    provider_username VARCHAR(255),
    provider_email VARCHAR(255),

    -- Provider profile data
    provider_profile JSONB DEFAULT '{}', -- firstname, lastname, profile_url, profile_picture, etc.

    -- OAuth tokens
    access_token TEXT NOT NULL,
    refresh_token TEXT NOT NULL,
    token_expires_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    scopes VARCHAR(500), -- Comma-separated list of scopes

    -- Connection status
    is_active BOOLEAN NOT NULL DEFAULT true,
    last_sync_at TIMESTAMP WITHOUT TIME ZONE,
    last_sync_error TEXT, -- Store last error for debugging

    -- Timestamps
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),

    -- Constraints: One connection per user per provider
    UNIQUE(user_id, provider),
    -- Ensure provider_user_id is unique per provider
    UNIQUE(provider, provider_user_id)
);

-- ============================================================================
-- 3. ACTIVITIES (Unified from all providers)
-- ============================================================================

CREATE TABLE public.activities (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    connection_id INTEGER REFERENCES public.provider_connections(id) ON DELETE SET NULL,

    -- External reference
    external_id VARCHAR(255), -- Provider's activity ID

    -- Activity basic info
    name VARCHAR(255) NOT NULL,
    description TEXT,
    activity_type activity_type NOT NULL,

    -- Timing
    start_date TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    timezone VARCHAR(50),

    -- Duration
    moving_time INTEGER, -- in seconds
    elapsed_time INTEGER, -- in seconds

    -- Distance & Speed
    distance DOUBLE PRECISION, -- in meters
    average_speed DOUBLE PRECISION, -- in m/s
    max_speed DOUBLE PRECISION, -- in m/s
    average_pace DOUBLE PRECISION, -- in min/km

    -- Heart Rate
    average_heartrate DOUBLE PRECISION,
    max_heartrate DOUBLE PRECISION,

    -- Power
    average_watts DOUBLE PRECISION,
    max_watts DOUBLE PRECISION,
    weighted_average_watts DOUBLE PRECISION,

    -- Cadence
    average_cadence DOUBLE PRECISION,

    -- Elevation
    total_elevation_gain DOUBLE PRECISION, -- in meters

    -- Energy
    calories DOUBLE PRECISION,
    suffer_score INTEGER, -- Strava-specific

    -- Location data
    start_latlng VARCHAR(100), -- "lat,lng"
    end_latlng VARCHAR(100), -- "lat,lng"
    map_polyline TEXT, -- Encoded polyline

    -- Flags
    is_manual BOOLEAN NOT NULL DEFAULT false,
    is_private BOOLEAN NOT NULL DEFAULT false,

    -- Additional data from provider (extensible)
    activity_data JSONB DEFAULT '{}',

    -- Timestamps
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),

    -- Prevent duplicate activities from same provider
    UNIQUE(connection_id, external_id)
);

-- ============================================================================
-- 4. PASSWORD RESET TOKENS
-- ============================================================================

CREATE TABLE public.password_reset_tokens (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    token VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    is_used BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 5. WORKOUTS (Optional - for planned workouts)
-- ============================================================================

CREATE TABLE public.workouts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,

    -- Workout information
    name VARCHAR(255) NOT NULL,
    description TEXT,
    workout_type activity_type,

    -- Scheduling
    scheduled_date DATE,
    completed_at TIMESTAMP WITHOUT TIME ZONE,

    -- Link to actual activity (if completed)
    activity_id INTEGER REFERENCES public.activities(id) ON DELETE SET NULL,

    -- Workout plan data (intervals, targets, etc.)
    workout_data JSONB DEFAULT '{}',

    -- Timestamps
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 6. SYNC HISTORY (Track synchronization with providers)
-- ============================================================================

CREATE TABLE public.sync_history (
    id SERIAL PRIMARY KEY,
    connection_id INTEGER NOT NULL REFERENCES public.provider_connections(id) ON DELETE CASCADE,

    -- Sync information
    sync_started_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
    sync_completed_at TIMESTAMP WITHOUT TIME ZONE,
    sync_status VARCHAR(50) NOT NULL, -- 'running', 'success', 'failed', 'partial'

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
-- 7. INDEXES FOR PERFORMANCE
-- ============================================================================

-- Users indexes
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_role ON public.users(role);
CREATE INDEX idx_users_is_active ON public.users(is_active);

-- Provider connections indexes
CREATE INDEX idx_provider_connections_user_id ON public.provider_connections(user_id);
CREATE INDEX idx_provider_connections_provider ON public.provider_connections(provider);
CREATE INDEX idx_provider_connections_is_active ON public.provider_connections(is_active);
CREATE INDEX idx_provider_connections_last_sync ON public.provider_connections(last_sync_at DESC);

-- Activities indexes
CREATE INDEX idx_activities_user_id ON public.activities(user_id);
CREATE INDEX idx_activities_connection_id ON public.activities(connection_id);
CREATE INDEX idx_activities_start_date ON public.activities(start_date DESC);
CREATE INDEX idx_activities_activity_type ON public.activities(activity_type);
CREATE INDEX idx_activities_external_id ON public.activities(external_id);

-- Password reset tokens indexes
CREATE INDEX idx_password_reset_tokens_user_id ON public.password_reset_tokens(user_id);
CREATE INDEX idx_password_reset_tokens_token ON public.password_reset_tokens(token);
CREATE INDEX idx_password_reset_tokens_expires_at ON public.password_reset_tokens(expires_at);

-- Workouts indexes
CREATE INDEX idx_workouts_user_id ON public.workouts(user_id);
CREATE INDEX idx_workouts_scheduled_date ON public.workouts(scheduled_date);
CREATE INDEX idx_workouts_activity_id ON public.workouts(activity_id);

-- Sync history indexes
CREATE INDEX idx_sync_history_connection_id ON public.sync_history(connection_id);
CREATE INDEX idx_sync_history_sync_started_at ON public.sync_history(sync_started_at DESC);
CREATE INDEX idx_sync_history_sync_status ON public.sync_history(sync_status);

-- ============================================================================
-- 8. TRIGGERS FOR AUTO-UPDATE TIMESTAMPS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers to all tables with updated_at
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_provider_connections_updated_at
    BEFORE UPDATE ON public.provider_connections
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_activities_updated_at
    BEFORE UPDATE ON public.activities
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_password_reset_tokens_updated_at
    BEFORE UPDATE ON public.password_reset_tokens
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workouts_updated_at
    BEFORE UPDATE ON public.workouts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 9. HELPER FUNCTIONS
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
CREATE OR REPLACE FUNCTION get_user_full_name(user_id INTEGER)
RETURNS TEXT AS $$
DECLARE
    full_name TEXT;
BEGIN
    SELECT CONCAT_WS(' ', first_name, last_name) INTO full_name
    FROM public.users
    WHERE id = user_id;

    RETURN COALESCE(full_name, 'Unknown User');
END;
$$ LANGUAGE plpgsql;

-- Function to check if token is expired
CREATE OR REPLACE FUNCTION is_token_expired(connection_id INTEGER)
RETURNS BOOLEAN AS $$
DECLARE
    expires_at TIMESTAMP;
BEGIN
    SELECT token_expires_at INTO expires_at
    FROM public.provider_connections
    WHERE id = connection_id;

    RETURN expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 10. VIEWS FOR COMMON QUERIES
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
-- 11. COMMENTS FOR DOCUMENTATION
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
-- SCHEMA COMPLETE
-- ============================================================================
