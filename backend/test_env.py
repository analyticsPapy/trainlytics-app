#!/usr/bin/env python3
"""
Test environment variables without heavy dependencies
"""
import os
import sys
from pathlib import Path

# Load .env manually
env_file = Path(__file__).parent / ".env"
if env_file.exists():
    print("Loading .env file...")
    with open(env_file) as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith('#') and '=' in line:
                key, value = line.split('=', 1)
                os.environ[key] = value

def test_environment():
    """Test environment configuration"""
    print("=" * 80)
    print("Trainlytics - Environment Configuration Test")
    print("=" * 80)
    print()

    # Required variables
    required_vars = {
        "SUPABASE_URL": "Supabase project URL",
        "SUPABASE_KEY": "Supabase anon/public key",
        "SUPABASE_SERVICE_ROLE_KEY": "Supabase service role key",
        "DATABASE_URL": "PostgreSQL connection string",
        "JWT_SECRET": "JWT signing secret",
    }

    # Optional variables
    optional_vars = {
        "GARMIN_CLIENT_ID": "Garmin OAuth client ID",
        "STRAVA_CLIENT_ID": "Strava OAuth client ID",
        "POLAR_CLIENT_ID": "Polar OAuth client ID",
    }

    all_good = True

    print("📋 Required Configuration:")
    print("-" * 80)
    for var, description in required_vars.items():
        value = os.getenv(var)
        if not value:
            print(f"  ❌ {var:<30} - MISSING")
            print(f"     {description}")
            all_good = False
        else:
            # Show partial value for security
            if len(value) > 50:
                display_value = f"{value[:20]}...{value[-10:]}"
            else:
                display_value = f"{value[:10]}..."

            print(f"  ✅ {var:<30} - {display_value}")

            # Check JWT_SECRET length
            if var == "JWT_SECRET" and len(value) < 32:
                print(f"     ⚠️  WARNING: Too short ({len(value)} chars, min 32)")
                all_good = False

    print()
    print("🔧 Optional Configuration (for OAuth):")
    print("-" * 80)
    for var, description in optional_vars.items():
        value = os.getenv(var)
        if value:
            print(f"  ✅ {var:<30} - Configured")
        else:
            print(f"  ⚪ {var:<30} - Not configured")

    print()
    print("=" * 80)

    if all_good:
        print("✅ All required environment variables are configured!")
        print()
        print("Next steps:")
        print("1. Apply database migration:")
        print("   - Go to: https://app.supabase.com")
        print("   - Navigate to SQL Editor")
        print("   - Copy and run: backend/migrations/001_adapt_schema.sql")
        print()
        print("2. Start the backend server:")
        print("   cd backend && uvicorn app.main:app --reload")
        print()
        print("3. Start the frontend:")
        print("   cd frontend && npm run dev")
    else:
        print("❌ Some required variables are missing or invalid!")
        print()
        print("Please check your .env file")

    print("=" * 80)

    return all_good

if __name__ == "__main__":
    success = test_environment()
    sys.exit(0 if success else 1)
