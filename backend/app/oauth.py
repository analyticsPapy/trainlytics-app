"""
OAuth flow handlers for third-party integrations.

This module implements OAuth 2.0 authorization flows for connecting
external services like Garmin, Strava, Polar, etc.
"""
import secrets
import uuid
from datetime import datetime, timedelta
from typing import Optional
from urllib.parse import urlencode
import httpx
from fastapi import APIRouter, Depends, HTTPException, status, Query
from app.schemas import (
    OAuthInitRequest,
    OAuthInitResponse,
    OAuthCallbackResponse,
    ProviderType
)
from app.config import settings
from app.supabase import supabase
from app.security import get_current_user_id
from app.connections import get_or_create_connection


router = APIRouter(prefix="/oauth", tags=["OAuth"])


def generate_oauth_state(user_id: str, provider: ProviderType) -> str:
    """
    Generate and store a secure OAuth state parameter.

    Args:
        user_id: The user's ID
        provider: The OAuth provider

    Returns:
        The generated state string
    """
    state = secrets.token_urlsafe(32)
    sb = supabase()

    # Store state in database with expiration
    expires_at = datetime.utcnow() + timedelta(minutes=settings.oauth_state_expiration_minutes)

    sb.table("oauth_states").insert({
        "user_id": user_id,
        "state": state,
        "provider": provider.value,
        "expires_at": expires_at.isoformat()
    }).execute()

    return state


async def verify_oauth_state(state: str, provider: ProviderType) -> Optional[str]:
    """
    Verify an OAuth state parameter and return the associated user_id.

    Args:
        state: The state parameter to verify
        provider: The OAuth provider

    Returns:
        The user_id if valid, None otherwise
    """
    sb = supabase()

    # Find the state record
    response = sb.table("oauth_states").select("*").eq("state", state).eq(
        "provider", provider.value
    ).execute()

    if not response.data or len(response.data) == 0:
        return None

    state_record = response.data[0]

    # Check if expired
    expires_at = datetime.fromisoformat(state_record["expires_at"].replace('Z', '+00:00'))
    if datetime.utcnow() > expires_at.replace(tzinfo=None):
        # Clean up expired state
        sb.table("oauth_states").delete().eq("id", state_record["id"]).execute()
        return None

    # Delete the used state (one-time use)
    sb.table("oauth_states").delete().eq("id", state_record["id"]).execute()

    return state_record["user_id"]


@router.post("/init", response_model=OAuthInitResponse)
async def init_oauth_flow(
    request: OAuthInitRequest,
    user_id: str = Depends(get_current_user_id)
):
    """
    Initialize OAuth flow for a third-party provider.

    Returns the authorization URL to redirect the user to.
    """
    provider = request.provider
    state = generate_oauth_state(user_id, provider)

    # Build authorization URL based on provider
    if provider == ProviderType.GARMIN:
        params = {
            "oauth_consumer_key": settings.garmin_client_id,
            "oauth_callback": settings.oauth_callback_url,
            "oauth_signature_method": "HMAC-SHA1",
        }
        auth_url = f"{settings.garmin_authorization_url}?{urlencode(params)}"

    elif provider == ProviderType.STRAVA:
        params = {
            "client_id": settings.strava_client_id,
            "redirect_uri": settings.oauth_callback_url,
            "response_type": "code",
            "scope": "read,activity:read_all,profile:read_all",
            "state": state,
            "approval_prompt": "auto"
        }
        auth_url = f"{settings.strava_authorization_url}?{urlencode(params)}"

    elif provider == ProviderType.POLAR:
        # Polar OAuth implementation would go here
        raise HTTPException(
            status_code=status.HTTP_501_NOT_IMPLEMENTED,
            detail=f"OAuth for {provider.value} is not yet implemented"
        )

    elif provider == ProviderType.COROS:
        # Coros OAuth implementation would go here
        raise HTTPException(
            status_code=status.HTTP_501_NOT_IMPLEMENTED,
            detail=f"OAuth for {provider.value} is not yet implemented"
        )

    elif provider == ProviderType.WAHOO:
        # Wahoo OAuth implementation would go here
        raise HTTPException(
            status_code=status.HTTP_501_NOT_IMPLEMENTED,
            detail=f"OAuth for {provider.value} is not yet implemented"
        )

    elif provider == ProviderType.FITBIT:
        # Fitbit OAuth implementation would go here
        raise HTTPException(
            status_code=status.HTTP_501_NOT_IMPLEMENTED,
            detail=f"OAuth for {provider.value} is not yet implemented"
        )

    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unknown provider: {provider.value}"
        )

    return OAuthInitResponse(authorization_url=auth_url, state=state)


@router.get("/callback")
async def oauth_callback(
    code: str = Query(...),
    state: str = Query(...),
    provider: Optional[str] = Query(None)
):
    """
    OAuth callback endpoint.

    This is where the third-party service redirects after user authorization.
    """
    # Determine provider from state or query parameter
    if provider:
        try:
            provider_type = ProviderType(provider)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid provider: {provider}"
            )
    else:
        # Try to get provider from state record
        sb = supabase()
        state_response = sb.table("oauth_states").select("provider").eq("state", state).execute()

        if not state_response.data or len(state_response.data) == 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid or expired state parameter"
            )

        provider_type = ProviderType(state_response.data[0]["provider"])

    # Verify state and get user_id
    user_id = await verify_oauth_state(state, provider_type)

    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired state parameter"
        )

    # Exchange code for access token based on provider
    try:
        if provider_type == ProviderType.GARMIN:
            connection = await handle_garmin_callback(code, user_id)
        elif provider_type == ProviderType.STRAVA:
            connection = await handle_strava_callback(code, user_id)
        else:
            raise HTTPException(
                status_code=status.HTTP_501_NOT_IMPLEMENTED,
                detail=f"OAuth callback for {provider_type.value} is not yet implemented"
            )

        return OAuthCallbackResponse(
            success=True,
            message=f"Successfully connected {provider_type.value}",
            connection={
                "id": connection["id"],
                "provider": connection["provider"],
                "provider_email": connection.get("provider_email"),
                "is_active": connection["is_active"],
                "last_sync_at": connection.get("last_sync_at"),
                "created_at": connection["created_at"]
            }
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"OAuth callback failed: {str(e)}"
        )


async def handle_strava_callback(code: str, user_id: str) -> dict:
    """
    Handle Strava OAuth callback and exchange code for tokens.

    Args:
        code: Authorization code from Strava
        user_id: The user's ID

    Returns:
        The created/updated connection record
    """
    async with httpx.AsyncClient() as client:
        # Exchange code for access token
        token_response = await client.post(
            settings.strava_token_url,
            data={
                "client_id": settings.strava_client_id,
                "client_secret": settings.strava_client_secret,
                "code": code,
                "grant_type": "authorization_code"
            }
        )

        if token_response.status_code != 200:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to exchange authorization code for access token"
            )

        token_data = token_response.json()

        # Extract token information
        access_token = token_data["access_token"]
        refresh_token = token_data["refresh_token"]
        expires_at = datetime.utcfromtimestamp(token_data["expires_at"])

        # Get athlete information
        athlete = token_data.get("athlete", {})
        provider_user_id = str(athlete.get("id"))
        provider_email = athlete.get("email")

        # Create or update connection
        connection = await get_or_create_connection(
            user_id=user_id,
            provider=ProviderType.STRAVA,
            provider_user_id=provider_user_id,
            provider_email=provider_email,
            access_token=access_token,
            refresh_token=refresh_token,
            token_expires_at=expires_at,
            scopes=["read", "activity:read_all", "profile:read_all"],
            metadata={
                "athlete": athlete,
                "token_type": token_data.get("token_type", "Bearer")
            }
        )

        return connection


async def handle_garmin_callback(code: str, user_id: str) -> dict:
    """
    Handle Garmin OAuth callback and exchange code for tokens.

    Note: Garmin uses OAuth 1.0a, which is more complex than OAuth 2.0.
    This is a simplified implementation and may need adjustments.

    Args:
        code: Authorization code from Garmin
        user_id: The user's ID

    Returns:
        The created/updated connection record
    """
    # Garmin OAuth 1.0a implementation
    # This is more complex and requires signing requests
    # For now, return a placeholder implementation

    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Garmin OAuth is not yet fully implemented (requires OAuth 1.0a)"
    )


@router.delete("/disconnect/{provider}", response_model=OAuthCallbackResponse)
async def disconnect_provider(
    provider: ProviderType,
    user_id: str = Depends(get_current_user_id)
):
    """
    Disconnect a provider by deleting the connection.
    """
    try:
        sb = supabase()

        # Find and delete the connection
        response = sb.table("user_connections").delete().eq(
            "user_id", user_id
        ).eq("provider", provider.value).execute()

        if not response.data or len(response.data) == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"No connection found for {provider.value}"
            )

        return OAuthCallbackResponse(
            success=True,
            message=f"Successfully disconnected {provider.value}",
            connection=None
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to disconnect: {str(e)}"
        )
