# Supabase PostgreSQL Connection Setup

This document describes how the Supabase PostgreSQL database has been configured for the Trainlytics application.

## Database Connection Details

- **Host**: `db.zclkfguqdwayztxvpcpn.supabase.co`
- **Port**: `5432`
- **Database**: `postgres`
- **User**: `postgres`
- **Connection String**: Configured in `.env` files

## Environment Files Created

### 1. Backend Configuration (`backend/app/.env`)
Contains the main application configuration including:
- Database connection URL
- Supabase API credentials
- JWT settings
- OAuth provider settings

### 2. Frontend Configuration (`frontend/.env`)
Contains Vite environment variables:
- `VITE_SUPABASE_URL`: Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Your Supabase anon key

### 3. Root Configuration (`.env`)
Contains docker-compose environment variables.

## Required Credentials

To complete the setup, you need to add the following to your environment files:

1. **Supabase Anon Key** (SUPABASE_KEY / VITE_SUPABASE_ANON_KEY)
   - Find in: Supabase Dashboard → Settings → API → Project API keys → anon public

2. **Supabase Service Role Key** (SUPABASE_SERVICE_ROLE_KEY)
   - Find in: Supabase Dashboard → Settings → API → Project API keys → service_role
   - ⚠️ **CAUTION**: This key has full database access. Keep it secret!

3. **JWT Secret** (JWT_SECRET)
   - Generate with: `openssl rand -hex 32`

## Testing the Connection

A test script has been created to verify your database connection:

```bash
cd backend
pip install -r requirements.txt  # Install dependencies first
python test_db_connection.py
```

This will:
- Test the PostgreSQL connection
- Display the database version
- List existing tables
- Verify your credentials are correct

## Security Notes

- ✅ All `.env` files are in `.gitignore` and will NOT be committed to git
- ✅ Password special characters are properly URL-encoded in connection strings
- ⚠️ Never commit or share your service role key
- ⚠️ Ensure your Supabase project has IP restrictions enabled if needed

## Next Steps

1. **Add your Supabase API keys** to the environment files:
   - Update `SUPABASE_KEY` and `SUPABASE_SERVICE_ROLE_KEY` in `backend/app/.env`
   - Update `VITE_SUPABASE_ANON_KEY` in `frontend/.env`
   - Update `SUPABASE_KEY` in root `.env`

2. **Generate a JWT secret**:
   ```bash
   openssl rand -hex 32
   ```
   Add it to `JWT_SECRET` in `backend/app/.env`

3. **Test the connection**:
   ```bash
   cd backend
   python test_db_connection.py
   ```

4. **Verify Supabase Dashboard settings**:
   - Go to Settings → Database → Connection Info
   - Check that your IP is allowed (or disable IP restrictions for development)
   - Verify SSL mode if required

5. **Set up database schema** (if needed):
   - Create tables for users, workouts, metrics, etc.
   - Set up Row Level Security (RLS) policies
   - Create necessary indexes

## Connection String Format

The database URL follows this format:
```
postgresql://[user]:[password]@[host]:[port]/[database]
```

Note: Special characters in passwords must be URL-encoded (e.g., `%` becomes `%25`)

## Troubleshooting

If you encounter connection issues:

1. **Check your credentials** - Verify password is correct
2. **Check IP allowlist** - Add your IP in Supabase Dashboard → Settings → Database → Connection Pooling
3. **Check SSL requirements** - Some connections require `?sslmode=require` parameter
4. **Check firewall** - Ensure port 5432 is not blocked
5. **Verify Supabase status** - Check https://status.supabase.com/

## Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Python Client](https://github.com/supabase-community/supabase-py)
- [SQLAlchemy Documentation](https://docs.sqlalchemy.org/)
