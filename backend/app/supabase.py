"""
Supabase client initialization and helper functions.
"""
from supabase import create_client, Client
from app.config import settings


# Initialize Supabase clients
def get_supabase_client() -> Client:
    """
    Get Supabase client with anon key for user-level operations.
    Use this for operations that respect RLS policies.
    """
    return create_client(settings.supabase_url, settings.supabase_key)


def get_supabase_admin_client() -> Client:
    """
    Get Supabase client with service role key for admin operations.
    Use this for operations that bypass RLS policies.
    CAUTION: This client has full database access.
    """
    return create_client(settings.supabase_url, settings.supabase_service_role_key)


# Global client instances (lazy initialization)
_supabase_client: Client | None = None
_supabase_admin_client: Client | None = None


def supabase() -> Client:
    """Get or create the global Supabase client instance."""
    global _supabase_client
    if _supabase_client is None:
        _supabase_client = get_supabase_client()
    return _supabase_client


def supabase_admin() -> Client:
    """Get or create the global Supabase admin client instance."""
    global _supabase_admin_client
    if _supabase_admin_client is None:
        _supabase_admin_client = get_supabase_admin_client()
    return _supabase_admin_client
