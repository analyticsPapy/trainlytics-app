#!/usr/bin/env python3
"""
Test Supabase connection and configuration
"""
import os
import sys
from dotenv import load_dotenv
from supabase import create_client, Client

# Load environment variables
load_dotenv()

def test_supabase_connection():
    """Test connection to Supabase"""
    print("=" * 80)
    print("Trainlytics - Supabase Connection Test")
    print("=" * 80)
    print()

    # Check environment variables
    print("1️⃣  Checking environment variables...")
    supabase_url = os.getenv("SUPABASE_URL")
    supabase_key = os.getenv("SUPABASE_KEY")
    supabase_service_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    database_url = os.getenv("DATABASE_URL")
    jwt_secret = os.getenv("JWT_SECRET")

    if not supabase_url:
        print("   ❌ SUPABASE_URL not found")
        return False
    else:
        print(f"   ✅ SUPABASE_URL: {supabase_url}")

    if not supabase_key:
        print("   ❌ SUPABASE_KEY not found")
        return False
    else:
        print(f"   ✅ SUPABASE_KEY: {supabase_key[:20]}...")

    if not supabase_service_key:
        print("   ❌ SUPABASE_SERVICE_ROLE_KEY not found")
        return False
    else:
        print(f"   ✅ SUPABASE_SERVICE_ROLE_KEY: {supabase_service_key[:20]}...")

    if not database_url:
        print("   ⚠️  DATABASE_URL not found (optional for Supabase client)")
    else:
        print(f"   ✅ DATABASE_URL configured")

    if not jwt_secret:
        print("   ❌ JWT_SECRET not found")
        return False
    else:
        print(f"   ✅ JWT_SECRET: {len(jwt_secret)} characters")
        if len(jwt_secret) < 32:
            print(f"   ⚠️  WARNING: JWT_SECRET is too short (min 32 chars)")

    print()

    # Test Supabase connection
    print("2️⃣  Testing Supabase connection...")
    try:
        supabase: Client = create_client(supabase_url, supabase_service_key)
        print("   ✅ Supabase client created successfully")
    except Exception as e:
        print(f"   ❌ Failed to create Supabase client: {e}")
        return False

    print()

    # Test database tables
    print("3️⃣  Checking database tables...")
    tables_to_check = ["users", "device_connections", "activities", "workouts", "athletes"]

    for table in tables_to_check:
        try:
            # Try to query the table
            result = supabase.table(table).select("*").limit(1).execute()
            print(f"   ✅ Table '{table}' exists ({len(result.data)} rows in sample)")
        except Exception as e:
            print(f"   ⚠️  Table '{table}' may not exist or is not accessible: {str(e)[:50]}")

    print()

    # Test authentication
    print("4️⃣  Testing authentication capabilities...")
    try:
        # This will fail but confirms auth API is accessible
        supabase.auth.sign_in_with_password({
            "email": "test@example.com",
            "password": "test123456"
        })
    except Exception as e:
        error_msg = str(e)
        if "Invalid login credentials" in error_msg or "Email not confirmed" in error_msg:
            print("   ✅ Auth API is accessible (test login failed as expected)")
        else:
            print(f"   ⚠️  Auth API response: {error_msg[:100]}")

    print()
    print("=" * 80)
    print("✅ Connection test completed!")
    print()
    print("Next steps:")
    print("1. Apply the database migration: python apply_migration.py")
    print("2. Start the backend server: cd backend && uvicorn app.main:app --reload")
    print("3. Start the frontend: cd frontend && npm run dev")
    print("=" * 80)

    return True

if __name__ == "__main__":
    success = test_supabase_connection()
    sys.exit(0 if success else 1)
