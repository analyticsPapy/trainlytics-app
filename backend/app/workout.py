"""
Workout management endpoints.

This module handles CRUD operations for user workouts and training plans.
"""
from typing import List, Optional
from datetime import datetime, date
from fastapi import APIRouter, Depends, HTTPException, status, Query
from app.schemas import (
    Workout,
    WorkoutCreate,
    WorkoutUpdate,
    MessageResponse
)
from app.supabase import supabase
from app.security import get_current_user_id


router = APIRouter(prefix="/workouts", tags=["Workouts"])


@router.get("", response_model=List[Workout])
async def get_workouts(
    user_id: str = Depends(get_current_user_id),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    workout_type: Optional[str] = None,
    scheduled_date: Optional[date] = None,
    completed: Optional[bool] = None
):
    """
    Get all workouts for the current user with optional filtering.

    Query parameters:
    - skip: Number of records to skip (pagination)
    - limit: Maximum number of records to return
    - workout_type: Filter by workout type
    - scheduled_date: Filter by scheduled date
    - completed: Filter by completion status (True for completed, False for pending)
    """
    try:
        sb = supabase()

        # Build query
        query = sb.table("workouts").select("*").eq("user_id", user_id)

        # Apply filters
        if workout_type:
            query = query.eq("workout_type", workout_type)

        if scheduled_date:
            query = query.eq("scheduled_date", scheduled_date.isoformat())

        if completed is not None:
            if completed:
                query = query.not_.is_("completed_at", "null")
            else:
                query = query.is_("completed_at", "null")

        # Order by scheduled_date and apply pagination
        query = query.order("scheduled_date", desc=False).range(skip, skip + limit - 1)

        response = query.execute()

        return response.data

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch workouts: {str(e)}"
        )


@router.get("/{workout_id}", response_model=Workout)
async def get_workout(
    workout_id: str,
    user_id: str = Depends(get_current_user_id)
):
    """
    Get a specific workout by ID.

    Only returns the workout if it belongs to the current user.
    """
    try:
        sb = supabase()

        response = sb.table("workouts").select("*").eq(
            "id", workout_id
        ).eq("user_id", user_id).execute()

        if not response.data or len(response.data) == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Workout not found"
            )

        return response.data[0]

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch workout: {str(e)}"
        )


@router.post("", response_model=Workout, status_code=status.HTTP_201_CREATED)
async def create_workout(
    workout: WorkoutCreate,
    user_id: str = Depends(get_current_user_id)
):
    """
    Create a new workout.

    This can be used to plan workouts or create training plans.
    """
    try:
        sb = supabase()

        # Prepare workout data
        workout_data = workout.model_dump()
        workout_data["user_id"] = user_id

        # Convert datetime objects to ISO format strings
        if isinstance(workout_data.get("scheduled_date"), datetime):
            workout_data["scheduled_date"] = workout_data["scheduled_date"].date().isoformat()
        elif isinstance(workout_data.get("scheduled_date"), date):
            workout_data["scheduled_date"] = workout_data["scheduled_date"].isoformat()

        # Insert workout
        response = sb.table("workouts").insert(workout_data).execute()

        if not response.data or len(response.data) == 0:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create workout"
            )

        return response.data[0]

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create workout: {str(e)}"
        )


@router.patch("/{workout_id}", response_model=Workout)
async def update_workout(
    workout_id: str,
    workout_update: WorkoutUpdate,
    user_id: str = Depends(get_current_user_id)
):
    """
    Update a workout.

    Only the workout owner can update it.
    """
    try:
        sb = supabase()

        # Verify workout belongs to user
        check_response = sb.table("workouts").select("id").eq(
            "id", workout_id
        ).eq("user_id", user_id).execute()

        if not check_response.data or len(check_response.data) == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Workout not found"
            )

        # Prepare update data
        update_data = workout_update.model_dump(exclude_none=True)

        if not update_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No fields to update"
            )

        # Convert datetime objects to ISO format strings
        if "scheduled_date" in update_data:
            if isinstance(update_data["scheduled_date"], datetime):
                update_data["scheduled_date"] = update_data["scheduled_date"].date().isoformat()
            elif isinstance(update_data["scheduled_date"], date):
                update_data["scheduled_date"] = update_data["scheduled_date"].isoformat()

        if "completed_at" in update_data and isinstance(update_data["completed_at"], datetime):
            update_data["completed_at"] = update_data["completed_at"].isoformat()

        # Update workout
        response = sb.table("workouts").update(update_data).eq(
            "id", workout_id
        ).eq("user_id", user_id).execute()

        if not response.data or len(response.data) == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Workout not found"
            )

        return response.data[0]

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update workout: {str(e)}"
        )


@router.delete("/{workout_id}", response_model=MessageResponse)
async def delete_workout(
    workout_id: str,
    user_id: str = Depends(get_current_user_id)
):
    """
    Delete a workout.

    Only the workout owner can delete it.
    """
    try:
        sb = supabase()

        # Verify and delete
        response = sb.table("workouts").delete().eq(
            "id", workout_id
        ).eq("user_id", user_id).execute()

        if not response.data or len(response.data) == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Workout not found"
            )

        return MessageResponse(message="Workout deleted successfully")

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete workout: {str(e)}"
        )


@router.post("/{workout_id}/complete", response_model=Workout)
async def complete_workout(
    workout_id: str,
    activity_id: Optional[str] = None,
    user_id: str = Depends(get_current_user_id)
):
    """
    Mark a workout as completed.

    Optionally link it to an activity.
    """
    try:
        sb = supabase()

        # Verify workout belongs to user
        check_response = sb.table("workouts").select("id").eq(
            "id", workout_id
        ).eq("user_id", user_id).execute()

        if not check_response.data or len(check_response.data) == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Workout not found"
            )

        # Mark as completed
        update_data = {
            "completed_at": datetime.utcnow().isoformat()
        }

        if activity_id:
            # Verify activity belongs to user
            activity_response = sb.table("activities").select("id").eq(
                "id", activity_id
            ).eq("user_id", user_id).execute()

            if not activity_response.data or len(activity_response.data) == 0:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Activity not found"
                )

            update_data["activity_id"] = activity_id

        # Update workout
        response = sb.table("workouts").update(update_data).eq(
            "id", workout_id
        ).eq("user_id", user_id).execute()

        if not response.data or len(response.data) == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Workout not found"
            )

        return response.data[0]

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to complete workout: {str(e)}"
        )
