#!/usr/bin/env python3
"""
Test script to verify database connection to Supabase PostgreSQL.
"""
import sys
import os
from pathlib import Path

# Add the app directory to the Python path
sys.path.insert(0, str(Path(__file__).parent / "app"))

try:
    from sqlalchemy import create_engine, text
    from app.config import settings

    print("=" * 60)
    print("Testing Supabase PostgreSQL Connection")
    print("=" * 60)
    print()

    # Display connection info (without password)
    db_url = settings.database_url
    safe_url = db_url.split('@')[0].split(':')[0] + ':****@' + db_url.split('@')[1] if '@' in db_url else db_url
    print(f"Database URL: {safe_url}")
    print(f"Supabase URL: {settings.supabase_url}")
    print()

    # Test SQLAlchemy connection
    print("Testing SQLAlchemy connection...")
    engine = create_engine(settings.database_url)

    with engine.connect() as conn:
        # Test basic query
        result = conn.execute(text("SELECT version();"))
        version = result.fetchone()[0]
        print(f"✓ Connected successfully!")
        print(f"✓ PostgreSQL version: {version}")

        # Test schema access
        result = conn.execute(text("SELECT current_database(), current_user;"))
        db_info = result.fetchone()
        print(f"✓ Current database: {db_info[0]}")
        print(f"✓ Current user: {db_info[1]}")

        # List tables
        result = conn.execute(text("""
            SELECT table_schema, table_name
            FROM information_schema.tables
            WHERE table_schema NOT IN ('pg_catalog', 'information_schema')
            ORDER BY table_schema, table_name;
        """))
        tables = result.fetchall()

        if tables:
            print(f"\n✓ Found {len(tables)} table(s):")
            for schema, table in tables:
                print(f"  - {schema}.{table}")
        else:
            print("\n⚠ No user tables found yet (this is normal for a new database)")

    print()
    print("=" * 60)
    print("✓ Database connection test PASSED!")
    print("=" * 60)

except ImportError as e:
    print(f"✗ Import error: {e}")
    print("\nPlease install required packages:")
    print("  pip install sqlalchemy psycopg2-binary python-dotenv pydantic-settings")
    sys.exit(1)

except Exception as e:
    print(f"\n✗ Connection test FAILED!")
    print(f"Error: {e}")
    print()
    print("Please check:")
    print("  1. Your .env file has correct DATABASE_URL")
    print("  2. The database credentials are correct")
    print("  3. Your IP is allowed in Supabase dashboard (Settings > Database)")
    sys.exit(1)
