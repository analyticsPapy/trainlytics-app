"""
API routes for provider connections and sync management.

These routes allow users to:
- View all their provider connections
- Get connection status and sync history
- Manually trigger synchronization
- Disconnect providers
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from app.schemas import ConnectionPublic, ProviderType, MessageResponse
from app.security import get_current_user_id
from app.services.provider_service import ProviderConnectionService, SyncHistoryService


router = APIRouter(prefix="/providers", tags=["Provider Connections"])


# ============================================================================
# CONNECTION MANAGEMENT ROUTES
# ============================================================================

@router.get("/connections", response_model=List[ConnectionPublic])
async def list_user_connections(
    active_only: bool = Query(False, description="Only return active connections"),
    user_id: int = Depends(get_current_user_id)
):
    """
    Get all provider connections for the authenticated user.

    Returns a list of all third-party connections (Strava, Garmin, etc.)
    without exposing sensitive tokens.

    Query parameters:
    - active_only: If true, only return connections where is_active=true
    """
    connections = await ProviderConnectionService.get_user_connections(
        user_id=user_id,
        active_only=active_only
    )

    # Convert to public schema (exclude sensitive fields)
    return [
        ConnectionPublic(
            id=str(conn["id"]),
            provider=ProviderType(conn["provider"]),
            provider_email=conn.get("provider_email"),
            is_active=conn["is_active"],
            last_sync_at=conn.get("last_sync_at"),
            created_at=conn["created_at"]
        )
        for conn in connections
    ]


@router.get("/connections/{connection_id}", response_model=ConnectionPublic)
async def get_connection_details(
    connection_id: int,
    user_id: int = Depends(get_current_user_id)
):
    """
    Get details for a specific provider connection.

    Only returns the connection if it belongs to the authenticated user.
    """
    connection = await ProviderConnectionService.get_connection(
        connection_id=connection_id,
        user_id=user_id
    )

    if not connection:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Connection not found"
        )

    return ConnectionPublic(
        id=str(connection["id"]),
        provider=ProviderType(connection["provider"]),
        provider_email=connection.get("provider_email"),
        is_active=connection["is_active"],
        last_sync_at=connection.get("last_sync_at"),
        created_at=connection["created_at"]
    )


@router.get("/connections/provider/{provider}", response_model=Optional[ConnectionPublic])
async def get_connection_by_provider(
    provider: ProviderType,
    user_id: int = Depends(get_current_user_id)
):
    """
    Get the user's connection for a specific provider.

    Returns None if the user hasn't connected this provider yet.
    This ensures only one connection per user per provider.
    """
    connection = await ProviderConnectionService.get_connection_by_provider(
        user_id=user_id,
        provider=provider
    )

    if not connection:
        return None

    return ConnectionPublic(
        id=str(connection["id"]),
        provider=ProviderType(connection["provider"]),
        provider_email=connection.get("provider_email"),
        is_active=connection["is_active"],
        last_sync_at=connection.get("last_sync_at"),
        created_at=connection["created_at"]
    )


@router.delete("/connections/{connection_id}", response_model=MessageResponse)
async def disconnect_provider(
    connection_id: int,
    user_id: int = Depends(get_current_user_id)
):
    """
    Disconnect a provider by deleting the connection.

    This removes the OAuth tokens and stops future synchronization.
    Activities already synced from this provider are preserved.
    """
    success = await ProviderConnectionService.delete_connection(
        connection_id=connection_id,
        user_id=user_id
    )

    if success:
        return MessageResponse(message="Provider disconnected successfully")

    raise HTTPException(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail="Failed to disconnect provider"
    )


@router.patch("/connections/{connection_id}/toggle", response_model=ConnectionPublic)
async def toggle_connection_status(
    connection_id: int,
    is_active: bool = Query(..., description="Set connection active status"),
    user_id: int = Depends(get_current_user_id)
):
    """
    Toggle a connection's active status.

    Inactive connections won't be synchronized automatically.
    """
    connection = await ProviderConnectionService.update_connection(
        connection_id=connection_id,
        user_id=user_id,
        is_active=is_active
    )

    return ConnectionPublic(
        id=str(connection["id"]),
        provider=ProviderType(connection["provider"]),
        provider_email=connection.get("provider_email"),
        is_active=connection["is_active"],
        last_sync_at=connection.get("last_sync_at"),
        created_at=connection["created_at"]
    )


# ============================================================================
# SYNCHRONIZATION ROUTES
# ============================================================================

@router.post("/connections/{connection_id}/sync", response_model=MessageResponse)
async def trigger_manual_sync(
    connection_id: int,
    user_id: int = Depends(get_current_user_id)
):
    """
    Manually trigger a synchronization for a specific provider connection.

    This fetches new activities from the provider's API.
    """
    # Verify connection exists and belongs to user
    connection = await ProviderConnectionService.get_connection(
        connection_id=connection_id,
        user_id=user_id
    )

    if not connection:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Connection not found"
        )

    if not connection["is_active"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Connection is not active. Please re-authenticate."
        )

    # Start sync
    sync_id = await SyncHistoryService.start_sync(connection_id=connection_id)

    try:
        # TODO: Implement actual sync logic based on provider
        # For now, just update last_sync_at
        await ProviderConnectionService.update_last_sync(connection_id=connection_id)

        # Complete sync successfully
        await SyncHistoryService.complete_sync(
            sync_id=sync_id,
            status="success",
            activities_fetched=0,
            activities_created=0,
            activities_updated=0,
            activities_skipped=0
        )

        return MessageResponse(
            message=f"Sync started successfully for {connection['provider']}"
        )

    except Exception as e:
        # Record sync failure
        await SyncHistoryService.complete_sync(
            sync_id=sync_id,
            status="failed",
            error_message=str(e)
        )

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Sync failed: {str(e)}"
        )


@router.get("/connections/{connection_id}/sync-history")
async def get_sync_history(
    connection_id: int,
    limit: int = Query(10, ge=1, le=100, description="Number of records to return"),
    user_id: int = Depends(get_current_user_id)
):
    """
    Get synchronization history for a connection.

    Shows the last N sync operations with their status and statistics.
    """
    # Verify connection belongs to user
    connection = await ProviderConnectionService.get_connection(
        connection_id=connection_id,
        user_id=user_id
    )

    if not connection:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Connection not found"
        )

    history = await SyncHistoryService.get_sync_history(
        connection_id=connection_id,
        limit=limit
    )

    return {
        "connection_id": connection_id,
        "provider": connection["provider"],
        "total_records": len(history),
        "history": history
    }


@router.get("/connections/{connection_id}/sync-status")
async def get_sync_status(
    connection_id: int,
    user_id: int = Depends(get_current_user_id)
):
    """
    Get the current sync status for a connection.

    Returns information about the most recent sync operation.
    """
    # Verify connection belongs to user
    connection = await ProviderConnectionService.get_connection(
        connection_id=connection_id,
        user_id=user_id
    )

    if not connection:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Connection not found"
        )

    latest_sync = await SyncHistoryService.get_latest_sync(connection_id=connection_id)

    return {
        "connection_id": connection_id,
        "provider": connection["provider"],
        "is_active": connection["is_active"],
        "last_sync_at": connection.get("last_sync_at"),
        "last_sync_error": connection.get("last_sync_error"),
        "latest_sync": latest_sync
    }


# ============================================================================
# DASHBOARD / SUMMARY ROUTES
# ============================================================================

@router.get("/summary")
async def get_connections_summary(user_id: int = Depends(get_current_user_id)):
    """
    Get a summary of all provider connections and their status.

    Useful for dashboard displays.
    """
    connections = await ProviderConnectionService.get_user_connections(
        user_id=user_id,
        active_only=False
    )

    summary = {
        "total_connections": len(connections),
        "active_connections": sum(1 for c in connections if c["is_active"]),
        "inactive_connections": sum(1 for c in connections if not c["is_active"]),
        "providers": [c["provider"] for c in connections],
        "connections": [
            {
                "id": c["id"],
                "provider": c["provider"],
                "is_active": c["is_active"],
                "last_sync_at": c.get("last_sync_at"),
                "has_error": c.get("last_sync_error") is not None
            }
            for c in connections
        ]
    }

    return summary


@router.get("/available-providers")
async def get_available_providers():
    """
    Get a list of all supported providers.

    Returns information about which providers can be connected.
    """
    providers = [
        {
            "id": "strava",
            "name": "Strava",
            "description": "Running, cycling, and swimming activities",
            "oauth_type": "OAuth 2.0",
            "implemented": True
        },
        {
            "id": "garmin",
            "name": "Garmin Connect",
            "description": "All Garmin device activities",
            "oauth_type": "OAuth 1.0a",
            "implemented": False  # TODO: Implement
        },
        {
            "id": "polar",
            "name": "Polar Flow",
            "description": "Polar device activities",
            "oauth_type": "OAuth 2.0",
            "implemented": False  # TODO: Implement
        },
        {
            "id": "coros",
            "name": "COROS",
            "description": "COROS device activities",
            "oauth_type": "OAuth 2.0",
            "implemented": False  # TODO: Implement
        },
        {
            "id": "wahoo",
            "name": "Wahoo",
            "description": "Wahoo device activities",
            "oauth_type": "OAuth 2.0",
            "implemented": False  # TODO: Implement
        },
        {
            "id": "fitbit",
            "name": "Fitbit",
            "description": "Fitbit device activities",
            "oauth_type": "OAuth 2.0",
            "implemented": False  # TODO: Implement
        }
    ]

    return {
        "total_providers": len(providers),
        "implemented_providers": sum(1 for p in providers if p["implemented"]),
        "providers": providers
    }
