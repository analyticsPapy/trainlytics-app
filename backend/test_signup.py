#!/usr/bin/env python3
"""
Test Supabase signup directly to diagnose the 403 error
"""
import os
import sys
from dotenv import load_dotenv
from supabase import create_client, Client

# Load environment from app/.env
load_dotenv('/home/user/trainlytics-app/backend/app/.env')

def test_supabase_signup():
    """Test Supabase signup"""
    print("=" * 80)
    print("Testing Supabase Signup")
    print("=" * 80)

    supabase_url = os.getenv("SUPABASE_URL")
    supabase_key = os.getenv("SUPABASE_KEY")
    supabase_service_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

    print(f"\n✓ URL: {supabase_url}")
    print(f"✓ Anon Key: {supabase_key[:20]}...")
    print(f"✓ Service Key: {supabase_service_key[:20]}...\n")

    # Test 1: Using anon key (client-side signup)
    print("Test 1: Signup with ANON key (normal client flow)")
    print("-" * 80)
    try:
        sb_anon: Client = create_client(supabase_url, supabase_key)

        response = sb_anon.auth.sign_up({
            "email": "test-anon@example.com",
            "password": "testpass123456",
            "options": {
                "email_confirm": False,
                "data": {
                    "full_name": "Test Anon User",
                    "user_type": "athlete"
                }
            }
        })

        if response.user:
            print(f"✅ SUCCESS with ANON key!")
            print(f"   User ID: {response.user.id}")
            print(f"   Email: {response.user.email}")
            if response.session:
                print(f"   Access Token: {response.session.access_token[:20]}...")
        else:
            print("❌ FAILED: No user returned")

    except Exception as e:
        print(f"❌ ERROR with ANON key: {str(e)}")
        print(f"   Error type: {type(e).__name__}")

    print()

    # Test 2: Using service role key (admin signup)
    print("Test 2: Signup with SERVICE ROLE key (admin flow)")
    print("-" * 80)
    try:
        sb_admin: Client = create_client(supabase_url, supabase_service_key)

        response = sb_admin.auth.admin.create_user({
            "email": "test-admin@example.com",
            "password": "testpass123456",
            "email_confirm": True,
            "user_metadata": {
                "full_name": "Test Admin User",
                "user_type": "athlete"
            }
        })

        if response.user:
            print(f"✅ SUCCESS with SERVICE ROLE key!")
            print(f"   User ID: {response.user.id}")
            print(f"   Email: {response.user.email}")
        else:
            print("❌ FAILED: No user returned")

    except Exception as e:
        print(f"❌ ERROR with SERVICE ROLE key: {str(e)}")
        print(f"   Error type: {type(e).__name__}")

    print()
    print("=" * 80)
    print("RECOMMENDATIONS:")
    print("-" * 80)
    print("If Test 1 failed with 403:")
    print("  1. Go to Supabase Dashboard → Authentication → Providers")
    print("  2. Enable 'Email' provider")
    print("  3. Set 'Confirm email' to OFF for development")
    print("  4. Check 'Authentication' → 'Settings' → 'User Signups' is ENABLED")
    print()
    print("If Test 2 succeeded but Test 1 failed:")
    print("  → Use the SERVICE ROLE key approach in auth.py")
    print("=" * 80)

if __name__ == "__main__":
    test_supabase_signup()
