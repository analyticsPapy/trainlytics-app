"""
User connections management for third-party integrations.

This module handles user connections to external services like Garmin, Strava, etc.
It ensures that users don't duplicate their connections and manages OAuth tokens.
"""
from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from app.schemas import (
    ConnectionPublic,
    ConnectionUpdate,
    MessageResponse,
    ProviderType
)
from app.supabase import supabase
from app.security import get_current_user_id


router = APIRouter(prefix="/connections", tags=["Connections"])


@router.get("", response_model=List[ConnectionPublic])
async def get_user_connections(user_id: str = Depends(get_current_user_id)):
    """
    Get all connections for the current user.

    Returns a list of all third-party app connections without exposing sensitive tokens.
    """
    try:
        sb = supabase()

        # Query user connections
        response = sb.table("user_connections").select(
            "id, provider, provider_email, is_active, last_sync_at, created_at"
        ).eq("user_id", user_id).execute()

        return response.data

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch connections: {str(e)}"
        )


@router.get("/{connection_id}", response_model=ConnectionPublic)
async def get_connection(
    connection_id: str,
    user_id: str = Depends(get_current_user_id)
):
    """
    Get a specific connection by ID.

    Only returns the connection if it belongs to the current user.
    """
    try:
        sb = supabase()

        response = sb.table("user_connections").select(
            "id, provider, provider_email, is_active, last_sync_at, created_at"
        ).eq("id", connection_id).eq("user_id", user_id).execute()

        if not response.data or len(response.data) == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Connection not found"
            )

        return response.data[0]

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch connection: {str(e)}"
        )


@router.get("/provider/{provider}", response_model=Optional[ConnectionPublic])
async def get_connection_by_provider(
    provider: ProviderType,
    user_id: str = Depends(get_current_user_id)
):
    """
    Get a connection by provider type.

    Returns the connection for the specified provider, or None if not connected.
    This ensures only one connection per user per provider.
    """
    try:
        sb = supabase()

        response = sb.table("user_connections").select(
            "id, provider, provider_email, is_active, last_sync_at, created_at"
        ).eq("user_id", user_id).eq("provider", provider.value).execute()

        if not response.data or len(response.data) == 0:
            return None

        return response.data[0]

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch connection: {str(e)}"
        )


@router.patch("/{connection_id}", response_model=ConnectionPublic)
async def update_connection(
    connection_id: str,
    connection_update: ConnectionUpdate,
    user_id: str = Depends(get_current_user_id)
):
    """
    Update a connection (e.g., toggle active status, update metadata).

    This does not update OAuth tokens - those are managed by the OAuth flow.
    """
    try:
        sb = supabase()

        # First verify the connection belongs to the user
        check_response = sb.table("user_connections").select("id").eq(
            "id", connection_id
        ).eq("user_id", user_id).execute()

        if not check_response.data or len(check_response.data) == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Connection not found"
            )

        # Prepare update data
        update_data = connection_update.model_dump(exclude_none=True)

        if not update_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No fields to update"
            )

        # Update the connection
        response = sb.table("user_connections").update(update_data).eq(
            "id", connection_id
        ).eq("user_id", user_id).execute()

        if not response.data or len(response.data) == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Connection not found"
            )

        # Return public view
        return ConnectionPublic(**response.data[0])

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update connection: {str(e)}"
        )


@router.delete("/{connection_id}", response_model=MessageResponse)
async def delete_connection(
    connection_id: str,
    user_id: str = Depends(get_current_user_id)
):
    """
    Delete a connection.

    This removes the connection and allows the user to reconnect later.
    Activities synced from this connection are preserved.
    """
    try:
        sb = supabase()

        # Verify and delete
        response = sb.table("user_connections").delete().eq(
            "id", connection_id
        ).eq("user_id", user_id).execute()

        if not response.data or len(response.data) == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Connection not found"
            )

        return MessageResponse(message=f"Connection deleted successfully")

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete connection: {str(e)}"
        )


@router.post("/{connection_id}/sync", response_model=MessageResponse)
async def sync_connection(
    connection_id: str,
    user_id: str = Depends(get_current_user_id)
):
    """
    Manually trigger a sync for a connection.

    This fetches new activities from the third-party service.
    """
    try:
        sb = supabase()

        # Verify connection exists and belongs to user
        response = sb.table("user_connections").select("*").eq(
            "id", connection_id
        ).eq("user_id", user_id).execute()

        if not response.data or len(response.data) == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Connection not found"
            )

        connection = response.data[0]

        if not connection.get("is_active"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Connection is not active"
            )

        # Update last_sync_at
        sb.table("user_connections").update({
            "last_sync_at": datetime.utcnow().isoformat()
        }).eq("id", connection_id).execute()

        # TODO: Implement actual sync logic based on provider
        # This would call the respective provider's API to fetch activities
        # and create/update records in the activities table

        return MessageResponse(message="Sync initiated successfully")

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to sync connection: {str(e)}"
        )


async def get_or_create_connection(
    user_id: str,
    provider: ProviderType,
    provider_user_id: str,
    provider_email: Optional[str],
    access_token: str,
    refresh_token: Optional[str],
    token_expires_at: Optional[datetime],
    scopes: List[str],
    metadata: dict
) -> dict:
    """
    Get an existing connection or create a new one.

    This prevents user duplication by checking if a connection already exists.
    If it exists, updates the tokens. If not, creates a new connection.

    Args:
        user_id: The user's ID
        provider: The provider type (garmin, strava, etc.)
        provider_user_id: The user's ID on the provider's platform
        provider_email: The user's email on the provider's platform
        access_token: OAuth access token
        refresh_token: OAuth refresh token
        token_expires_at: Token expiration datetime
        scopes: List of OAuth scopes granted
        metadata: Additional connection metadata

    Returns:
        The connection record (existing or newly created)
    """
    try:
        sb = supabase()

        # Check if connection already exists for this user and provider
        existing_response = sb.table("user_connections").select("*").eq(
            "user_id", user_id
        ).eq("provider", provider.value).execute()

        connection_data = {
            "provider_user_id": provider_user_id,
            "provider_email": provider_email,
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_expires_at": token_expires_at.isoformat() if token_expires_at else None,
            "scopes": scopes,
            "connection_metadata": metadata,
            "is_active": True,
            "last_sync_at": datetime.utcnow().isoformat()
        }

        if existing_response.data and len(existing_response.data) > 0:
            # Update existing connection
            existing_connection = existing_response.data[0]
            response = sb.table("user_connections").update(connection_data).eq(
                "id", existing_connection["id"]
            ).execute()

            return response.data[0]
        else:
            # Create new connection
            connection_data["user_id"] = user_id
            connection_data["provider"] = provider.value

            response = sb.table("user_connections").insert(connection_data).execute()

            return response.data[0]

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create/update connection: {str(e)}"
        )
