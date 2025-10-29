"""
Activities management endpoints.

This module handles CRUD operations for user activities.
"""
from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status, Query
from app.schemas import (
    Activity,
    ActivityCreate,
    ActivityUpdate,
    MessageResponse
)
from app.supabase import supabase
from app.security import get_current_user_id


router = APIRouter(prefix="/activities", tags=["Activities"])


@router.get("", response_model=List[Activity])
async def get_activities(
    user_id: str = Depends(get_current_user_id),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    activity_type: Optional[str] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None
):
    """
    Get all activities for the current user with optional filtering.

    Query parameters:
    - skip: Number of records to skip (pagination)
    - limit: Maximum number of records to return
    - activity_type: Filter by activity type (e.g., 'run', 'ride', 'swim')
    - start_date: Filter activities after this date
    - end_date: Filter activities before this date
    """
    try:
        sb = supabase()

        # Build query
        query = sb.table("activities").select("*").eq("user_id", user_id)

        # Apply filters
        if activity_type:
            query = query.eq("activity_type", activity_type)

        if start_date:
            query = query.gte("start_time", start_date.isoformat())

        if end_date:
            query = query.lte("start_time", end_date.isoformat())

        # Order by start_time descending and apply pagination
        query = query.order("start_time", desc=True).range(skip, skip + limit - 1)

        response = query.execute()

        return response.data

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch activities: {str(e)}"
        )


@router.get("/{activity_id}", response_model=Activity)
async def get_activity(
    activity_id: str,
    user_id: str = Depends(get_current_user_id)
):
    """
    Get a specific activity by ID.

    Only returns the activity if it belongs to the current user.
    """
    try:
        sb = supabase()

        response = sb.table("activities").select("*").eq(
            "id", activity_id
        ).eq("user_id", user_id).execute()

        if not response.data or len(response.data) == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Activity not found"
            )

        return response.data[0]

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch activity: {str(e)}"
        )


@router.post("", response_model=Activity, status_code=status.HTTP_201_CREATED)
async def create_activity(
    activity: ActivityCreate,
    user_id: str = Depends(get_current_user_id)
):
    """
    Create a new activity.

    This can be used to manually log activities or for syncing from external sources.
    """
    try:
        sb = supabase()

        # Prepare activity data
        activity_data = activity.model_dump()
        activity_data["user_id"] = user_id

        # Convert datetime objects to ISO format strings
        if isinstance(activity_data.get("start_time"), datetime):
            activity_data["start_time"] = activity_data["start_time"].isoformat()
        if isinstance(activity_data.get("end_time"), datetime):
            activity_data["end_time"] = activity_data["end_time"].isoformat()

        # Insert activity
        response = sb.table("activities").insert(activity_data).execute()

        if not response.data or len(response.data) == 0:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create activity"
            )

        return response.data[0]

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create activity: {str(e)}"
        )


@router.patch("/{activity_id}", response_model=Activity)
async def update_activity(
    activity_id: str,
    activity_update: ActivityUpdate,
    user_id: str = Depends(get_current_user_id)
):
    """
    Update an activity.

    Only the activity owner can update it.
    """
    try:
        sb = supabase()

        # Verify activity belongs to user
        check_response = sb.table("activities").select("id").eq(
            "id", activity_id
        ).eq("user_id", user_id).execute()

        if not check_response.data or len(check_response.data) == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Activity not found"
            )

        # Prepare update data
        update_data = activity_update.model_dump(exclude_none=True)

        if not update_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No fields to update"
            )

        # Update activity
        response = sb.table("activities").update(update_data).eq(
            "id", activity_id
        ).eq("user_id", user_id).execute()

        if not response.data or len(response.data) == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Activity not found"
            )

        return response.data[0]

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update activity: {str(e)}"
        )


@router.delete("/{activity_id}", response_model=MessageResponse)
async def delete_activity(
    activity_id: str,
    user_id: str = Depends(get_current_user_id)
):
    """
    Delete an activity.

    Only the activity owner can delete it.
    """
    try:
        sb = supabase()

        # Verify and delete
        response = sb.table("activities").delete().eq(
            "id", activity_id
        ).eq("user_id", user_id).execute()

        if not response.data or len(response.data) == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Activity not found"
            )

        return MessageResponse(message="Activity deleted successfully")

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete activity: {str(e)}"
        )


@router.get("/stats/summary")
async def get_activity_stats(
    user_id: str = Depends(get_current_user_id),
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None
):
    """
    Get activity statistics summary for the user.

    Returns aggregated data like total distance, duration, calories, etc.
    """
    try:
        sb = supabase()

        # Build query
        query = sb.table("activities").select("*").eq("user_id", user_id)

        if start_date:
            query = query.gte("start_time", start_date.isoformat())

        if end_date:
            query = query.lte("start_time", end_date.isoformat())

        response = query.execute()

        activities = response.data

        # Calculate statistics
        total_activities = len(activities)
        total_distance = sum(a.get("distance", 0) or 0 for a in activities)
        total_duration = sum(a.get("duration", 0) or 0 for a in activities)
        total_calories = sum(a.get("calories", 0) or 0 for a in activities)
        total_elevation = sum(a.get("elevation_gain", 0) or 0 for a in activities)

        # Group by activity type
        activities_by_type = {}
        for activity in activities:
            activity_type = activity.get("activity_type", "unknown")
            if activity_type not in activities_by_type:
                activities_by_type[activity_type] = {
                    "count": 0,
                    "distance": 0,
                    "duration": 0
                }
            activities_by_type[activity_type]["count"] += 1
            activities_by_type[activity_type]["distance"] += activity.get("distance", 0) or 0
            activities_by_type[activity_type]["duration"] += activity.get("duration", 0) or 0

        return {
            "total_activities": total_activities,
            "total_distance_meters": total_distance,
            "total_duration_seconds": total_duration,
            "total_calories": total_calories,
            "total_elevation_meters": total_elevation,
            "activities_by_type": activities_by_type
        }

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to calculate statistics: {str(e)}"
        )
