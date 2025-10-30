#!/usr/bin/env python3
"""
Apply database migrations to Supabase
"""
import os
import sys
from pathlib import Path
from supabase import create_client, Client
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def apply_migration(migration_file: str):
    """Apply a migration file to Supabase"""

    # Get Supabase credentials
    supabase_url = os.getenv("SUPABASE_URL")
    supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

    if not supabase_url or not supabase_key:
        print("❌ Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env")
        sys.exit(1)

    # Create Supabase client
    print(f"🔌 Connecting to Supabase: {supabase_url}")
    supabase: Client = create_client(supabase_url, supabase_key)

    # Read migration file
    migration_path = Path(__file__).parent / "migrations" / migration_file
    if not migration_path.exists():
        print(f"❌ Error: Migration file not found: {migration_path}")
        sys.exit(1)

    print(f"📄 Reading migration: {migration_file}")
    with open(migration_path, 'r') as f:
        sql = f.read()

    # Apply migration
    print(f"🚀 Applying migration...")
    try:
        # Note: Supabase Python client doesn't support raw SQL execution
        # You need to use the REST API or psycopg2 for this
        print("\n" + "="*80)
        print("⚠️  IMPORTANT: The Supabase Python client doesn't support raw SQL.")
        print("Please apply the migration using one of these methods:")
        print("\n1. Supabase Dashboard (Recommended):")
        print("   - Go to: https://app.supabase.com")
        print("   - Navigate to SQL Editor")
        print(f"   - Copy the content of: {migration_path}")
        print("   - Paste and run it")
        print("\n2. psql command line:")
        print("   psql -h db.zclkfguqdwayztxvpcpn.supabase.co \\")
        print("        -p 5432 -d postgres -U postgres \\")
        print(f"        -f {migration_path}")
        print("\n3. Use psycopg2 (install first: pip install psycopg2-binary)")
        print("="*80)

        # Show preview of SQL
        print("\n📝 Migration SQL Preview:")
        print("-" * 80)
        lines = sql.split('\n')[:30]  # Show first 30 lines
        for line in lines:
            print(line)
        if len(sql.split('\n')) > 30:
            print(f"... ({len(sql.split('\n')) - 30} more lines)")
        print("-" * 80)

    except Exception as e:
        print(f"❌ Error applying migration: {e}")
        sys.exit(1)

def apply_with_psycopg2(migration_file: str):
    """Apply migration using psycopg2"""
    try:
        import psycopg2
    except ImportError:
        print("❌ psycopg2 not installed. Install it with: pip install psycopg2-binary")
        sys.exit(1)

    database_url = os.getenv("DATABASE_URL")
    if not database_url:
        print("❌ Error: DATABASE_URL must be set in .env")
        sys.exit(1)

    # Read migration file
    migration_path = Path(__file__).parent / "migrations" / migration_file
    with open(migration_path, 'r') as f:
        sql = f.read()

    print(f"🔌 Connecting to database...")
    try:
        conn = psycopg2.connect(database_url)
        cursor = conn.cursor()

        print(f"🚀 Executing migration...")
        cursor.execute(sql)
        conn.commit()

        print("✅ Migration applied successfully!")

        cursor.close()
        conn.close()

    except Exception as e:
        print(f"❌ Error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    print("=" * 80)
    print("Trainlytics Database Migration Tool")
    print("=" * 80)

    # Check if psycopg2 is available
    try:
        import psycopg2
        use_psycopg2 = True
        print("✅ psycopg2 detected, will use direct database connection")
    except ImportError:
        use_psycopg2 = False
        print("⚠️  psycopg2 not available, showing manual instructions")

    print()

    # Get migration file
    migration_file = "001_adapt_schema.sql"
    if len(sys.argv) > 1:
        migration_file = sys.argv[1]

    if use_psycopg2:
        response = input(f"Apply migration {migration_file}? [y/N]: ")
        if response.lower() == 'y':
            apply_with_psycopg2(migration_file)
        else:
            print("Migration cancelled")
    else:
        apply_migration(migration_file)
