"""
Application configuration using Pydantic Settings.
"""
from typing import Optional
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # App settings
    app_name: str = "Trainlytics API"
    app_env: str = "development"
    debug: bool = True
    api_prefix: str = "/api"

    # Supabase settings
    supabase_url: str
    supabase_key: str  # anon key for client
    supabase_service_role_key: str  # service role key for admin operations

    # Database
    database_url: str

    # JWT settings
    jwt_secret: str
    jwt_algorithm: str = "HS256"
    jwt_expiration_hours: int = 24

    # OAuth providers - Garmin
    garmin_client_id: Optional[str] = None
    garmin_client_secret: Optional[str] = None
    garmin_authorization_url: str = "https://connect.garmin.com/oauthConfirm"
    garmin_token_url: str = "https://connectapi.garmin.com/oauth-service/oauth/access_token"
    garmin_api_base_url: str = "https://apis.garmin.com/wellness-api/rest"

    # OAuth providers - Strava
    strava_client_id: Optional[str] = None
    strava_client_secret: Optional[str] = None
    strava_authorization_url: str = "https://www.strava.com/oauth/authorize"
    strava_token_url: str = "https://www.strava.com/oauth/token"
    strava_api_base_url: str = "https://www.strava.com/api/v3"

    # OAuth providers - Polar
    polar_client_id: Optional[str] = None
    polar_client_secret: Optional[str] = None

    # OAuth providers - Coros
    coros_client_id: Optional[str] = None
    coros_client_secret: Optional[str] = None

    # OAuth providers - Wahoo
    wahoo_client_id: Optional[str] = None
    wahoo_client_secret: Optional[str] = None

    # OAuth providers - Fitbit
    fitbit_client_id: Optional[str] = None
    fitbit_client_secret: Optional[str] = None

    # OAuth callback settings
    oauth_callback_url: str = "http://localhost:8000/api/oauth/callback"
    oauth_state_expiration_minutes: int = 10

    # CORS settings
    cors_origins: list[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://localhost:8000",
    ]

    # Server settings
    host: str = "0.0.0.0"
    port: int = 8000

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore"
    )


# Global settings instance
settings = Settings()
