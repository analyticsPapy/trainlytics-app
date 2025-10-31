"""
Provider connections service for multi-provider architecture.

This service manages connections to external fitness providers (Strava, Garmin, Polar, etc.)
and tracks synchronization history.
"""
from typing import List, Optional, Dict, Any
from datetime import datetime
from fastapi import HTTPException, status
from app.schemas import ProviderType
from app.supabase import supabase


class ProviderConnectionService:
    """Service for managing provider connections."""

    @staticmethod
    async def get_user_connections(user_id: int, active_only: bool = False) -> List[Dict[str, Any]]:
        """
        Get all connections for a user.

        Args:
            user_id: The user's ID
            active_only: If True, only return active connections

        Returns:
            List of connection records
        """
        try:
            sb = supabase()
            query = sb.table("provider_connections").select(
                "id, user_id, provider, provider_user_id, provider_username, "
                "provider_email, provider_profile, is_active, last_sync_at, "
                "last_sync_error, created_at, updated_at"
            ).eq("user_id", user_id)

            if active_only:
                query = query.eq("is_active", True)

            response = query.execute()
            return response.data

        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to fetch connections: {str(e)}"
            )

    @staticmethod
    async def get_connection(connection_id: int, user_id: int) -> Optional[Dict[str, Any]]:
        """
        Get a specific connection by ID.

        Args:
            connection_id: The connection ID
            user_id: The user's ID (for authorization)

        Returns:
            Connection record or None
        """
        try:
            sb = supabase()
            response = sb.table("provider_connections").select("*").eq(
                "id", connection_id
            ).eq("user_id", user_id).execute()

            if not response.data or len(response.data) == 0:
                return None

            return response.data[0]

        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to fetch connection: {str(e)}"
            )

    @staticmethod
    async def get_connection_by_provider(
        user_id: int,
        provider: ProviderType
    ) -> Optional[Dict[str, Any]]:
        """
        Get a user's connection for a specific provider.

        Args:
            user_id: The user's ID
            provider: The provider type

        Returns:
            Connection record or None
        """
        try:
            sb = supabase()
            response = sb.table("provider_connections").select("*").eq(
                "user_id", user_id
            ).eq("provider", provider.value).execute()

            if not response.data or len(response.data) == 0:
                return None

            return response.data[0]

        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to fetch connection: {str(e)}"
            )

    @staticmethod
    async def upsert_connection(
        user_id: int,
        provider: ProviderType,
        provider_user_id: str,
        access_token: str,
        refresh_token: str,
        token_expires_at: datetime,
        provider_username: Optional[str] = None,
        provider_email: Optional[str] = None,
        provider_profile: Optional[Dict[str, Any]] = None,
        scopes: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Create or update a provider connection.

        This ensures only one connection per user per provider (UNIQUE constraint).

        Args:
            user_id: The user's ID
            provider: The provider type
            provider_user_id: The user's ID on the provider platform
            access_token: OAuth access token
            refresh_token: OAuth refresh token
            token_expires_at: Token expiration datetime
            provider_username: Username on provider platform
            provider_email: Email on provider platform
            provider_profile: Additional profile data (JSONB)
            scopes: OAuth scopes (comma-separated)

        Returns:
            The created/updated connection record
        """
        try:
            sb = supabase()

            connection_data = {
                "user_id": user_id,
                "provider": provider.value,
                "provider_user_id": provider_user_id,
                "provider_username": provider_username,
                "provider_email": provider_email,
                "provider_profile": provider_profile or {},
                "access_token": access_token,
                "refresh_token": refresh_token,
                "token_expires_at": token_expires_at.isoformat(),
                "scopes": scopes,
                "is_active": True,
                "last_sync_at": datetime.utcnow().isoformat()
            }

            # Check if connection exists
            existing = await ProviderConnectionService.get_connection_by_provider(
                user_id, provider
            )

            if existing:
                # Update existing connection
                response = sb.table("provider_connections").update(
                    connection_data
                ).eq("id", existing["id"]).execute()
            else:
                # Insert new connection
                response = sb.table("provider_connections").insert(
                    connection_data
                ).execute()

            return response.data[0]

        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to upsert connection: {str(e)}"
            )

    @staticmethod
    async def update_connection(
        connection_id: int,
        user_id: int,
        **updates
    ) -> Dict[str, Any]:
        """
        Update specific fields of a connection.

        Args:
            connection_id: The connection ID
            user_id: The user's ID (for authorization)
            **updates: Fields to update

        Returns:
            Updated connection record
        """
        try:
            sb = supabase()

            # Verify ownership
            existing = await ProviderConnectionService.get_connection(connection_id, user_id)
            if not existing:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Connection not found"
                )

            # Update
            response = sb.table("provider_connections").update(updates).eq(
                "id", connection_id
            ).eq("user_id", user_id).execute()

            return response.data[0]

        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to update connection: {str(e)}"
            )

    @staticmethod
    async def delete_connection(connection_id: int, user_id: int) -> bool:
        """
        Delete a provider connection.

        Args:
            connection_id: The connection ID
            user_id: The user's ID (for authorization)

        Returns:
            True if deleted successfully
        """
        try:
            sb = supabase()

            response = sb.table("provider_connections").delete().eq(
                "id", connection_id
            ).eq("user_id", user_id).execute()

            if not response.data or len(response.data) == 0:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Connection not found"
                )

            return True

        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to delete connection: {str(e)}"
            )

    @staticmethod
    async def update_last_sync(
        connection_id: int,
        error: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Update the last sync timestamp for a connection.

        Args:
            connection_id: The connection ID
            error: Error message if sync failed

        Returns:
            Updated connection record
        """
        try:
            sb = supabase()

            update_data = {
                "last_sync_at": datetime.utcnow().isoformat()
            }

            if error:
                update_data["last_sync_error"] = error
            else:
                update_data["last_sync_error"] = None

            response = sb.table("provider_connections").update(update_data).eq(
                "id", connection_id
            ).execute()

            return response.data[0]

        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to update last sync: {str(e)}"
            )


class SyncHistoryService:
    """Service for managing synchronization history."""

    @staticmethod
    async def start_sync(connection_id: int) -> int:
        """
        Create a new sync history record with status 'running'.

        Args:
            connection_id: The provider connection ID

        Returns:
            The sync history ID
        """
        try:
            sb = supabase()

            response = sb.table("sync_history").insert({
                "connection_id": connection_id,
                "sync_started_at": datetime.utcnow().isoformat(),
                "sync_status": "running",
                "activities_fetched": 0,
                "activities_created": 0,
                "activities_updated": 0,
                "activities_skipped": 0
            }).execute()

            return response.data[0]["id"]

        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to start sync: {str(e)}"
            )

    @staticmethod
    async def complete_sync(
        sync_id: int,
        status: str,
        activities_fetched: int = 0,
        activities_created: int = 0,
        activities_updated: int = 0,
        activities_skipped: int = 0,
        error_message: Optional[str] = None,
        error_details: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Complete a sync operation.

        Args:
            sync_id: The sync history ID
            status: 'success', 'failed', or 'partial'
            activities_fetched: Number of activities fetched
            activities_created: Number of activities created
            activities_updated: Number of activities updated
            activities_skipped: Number of activities skipped
            error_message: Error message if failed
            error_details: Detailed error information (JSONB)

        Returns:
            Updated sync history record
        """
        try:
            sb = supabase()

            update_data = {
                "sync_completed_at": datetime.utcnow().isoformat(),
                "sync_status": status,
                "activities_fetched": activities_fetched,
                "activities_created": activities_created,
                "activities_updated": activities_updated,
                "activities_skipped": activities_skipped
            }

            if error_message:
                update_data["error_message"] = error_message
            if error_details:
                update_data["error_details"] = error_details

            response = sb.table("sync_history").update(update_data).eq(
                "id", sync_id
            ).execute()

            return response.data[0]

        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to complete sync: {str(e)}"
            )

    @staticmethod
    async def get_sync_history(
        connection_id: int,
        limit: int = 10
    ) -> List[Dict[str, Any]]:
        """
        Get sync history for a connection.

        Args:
            connection_id: The provider connection ID
            limit: Maximum number of records to return

        Returns:
            List of sync history records
        """
        try:
            sb = supabase()

            response = sb.table("sync_history").select("*").eq(
                "connection_id", connection_id
            ).order("sync_started_at", desc=True).limit(limit).execute()

            return response.data

        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to fetch sync history: {str(e)}"
            )

    @staticmethod
    async def get_latest_sync(connection_id: int) -> Optional[Dict[str, Any]]:
        """
        Get the most recent sync for a connection.

        Args:
            connection_id: The provider connection ID

        Returns:
            Latest sync record or None
        """
        try:
            sb = supabase()

            response = sb.table("sync_history").select("*").eq(
                "connection_id", connection_id
            ).order("sync_started_at", desc=True).limit(1).execute()

            if not response.data or len(response.data) == 0:
                return None

            return response.data[0]

        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to fetch latest sync: {str(e)}"
            )
