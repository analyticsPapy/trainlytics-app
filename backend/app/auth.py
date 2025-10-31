"""
Authentication router with signup, login, and user management endpoints.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from app.schemas import (
    UserSignup,
    UserLogin,
    TokenResponse,
    RefreshTokenRequest,
    UserProfile,
    UserProfileUpdate,
    MessageResponse
)
from app.supabase import supabase, supabase_admin
from app.security import get_current_user, get_current_user_id


router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/signup", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def signup(user_data: UserSignup):
    """
    Register a new user with email and password.

    Creates both an auth user and a user profile in the database.
    """
    try:
        sb = supabase()
        sb_admin = supabase_admin()

        # Sign up the user with Supabase Auth
        # Note: email_confirm is set to False to allow immediate login without email verification
        # In production, you may want to enable email confirmation for security
        auth_response = sb.auth.sign_up({
            "email": user_data.email,
            "password": user_data.password,
            "options": {
                "email_confirm": False,
                "data": {
                    "full_name": user_data.full_name,
                    "user_type": user_data.user_type.value
                }
            }
        })

        if not auth_response.user or not auth_response.session:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to create user account or session"
            )

        # Create user profile in public.users table (using admin client to bypass RLS)
        # Note: user_profiles is a view, we need to insert into the underlying users table
        profile_data = {
            "id": auth_response.user.id,
            "email": user_data.email,
            "full_name": user_data.full_name,
            "user_type": user_data.user_type.value,
            "preferences": {}
        }

        profile_response = sb_admin.table("users").insert(profile_data).execute()

        if not profile_response.data:
            # If profile creation fails, we should ideally clean up the auth user
            # But Supabase doesn't provide easy user deletion, so we log this
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create user profile"
            )

        # Return token response
        return TokenResponse(
            access_token=auth_response.session.access_token,
            token_type="bearer",
            expires_in=auth_response.session.expires_in,
            refresh_token=auth_response.session.refresh_token,
            user={
                "id": auth_response.user.id,
                "email": auth_response.user.email,
                "full_name": user_data.full_name,
                "user_type": user_data.user_type.value
            }
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Signup failed: {str(e)}"
        )


@router.post("/login", response_model=TokenResponse)
async def login(credentials: UserLogin):
    """
    Authenticate user with email and password.

    Returns access token and refresh token for authenticated requests.
    """
    try:
        sb = supabase()

        # Sign in with Supabase Auth
        auth_response = sb.auth.sign_in_with_password({
            "email": credentials.email,
            "password": credentials.password
        })

        if not auth_response.user or not auth_response.session:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )

        # Fetch user profile
        profile_response = sb.table("user_profiles").select("*").eq("id", auth_response.user.id).execute()

        user_profile = None
        if profile_response.data and len(profile_response.data) > 0:
            user_profile = profile_response.data[0]

        return TokenResponse(
            access_token=auth_response.session.access_token,
            token_type="bearer",
            expires_in=auth_response.session.expires_in,
            refresh_token=auth_response.session.refresh_token,
            user=user_profile
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Login failed: {str(e)}"
        )


@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(token_data: RefreshTokenRequest):
    """
    Refresh an expired access token using a refresh token.
    """
    try:
        sb = supabase()

        # Refresh the session
        auth_response = sb.auth.refresh_session(token_data.refresh_token)

        if not auth_response.session:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid refresh token"
            )

        return TokenResponse(
            access_token=auth_response.session.access_token,
            token_type="bearer",
            expires_in=auth_response.session.expires_in,
            refresh_token=auth_response.session.refresh_token
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Token refresh failed: {str(e)}"
        )


@router.post("/logout", response_model=MessageResponse)
async def logout(current_user: dict = Depends(get_current_user)):
    """
    Logout the current user by invalidating their session.
    """
    try:
        sb = supabase()
        sb.auth.sign_out()

        return MessageResponse(message="Successfully logged out")

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Logout failed: {str(e)}"
        )


@router.get("/me", response_model=UserProfile)
async def get_current_user_profile(current_user: dict = Depends(get_current_user)):
    """
    Get the current authenticated user's profile.
    """
    try:
        sb = supabase()
        user_id = current_user["id"]

        # Fetch user profile
        response = sb.table("user_profiles").select("*").eq("id", user_id).execute()

        if not response.data or len(response.data) == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User profile not found"
            )

        return response.data[0]

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch user profile: {str(e)}"
        )


@router.patch("/me", response_model=UserProfile)
async def update_current_user_profile(
    profile_update: UserProfileUpdate,
    current_user: dict = Depends(get_current_user)
):
    """
    Update the current authenticated user's profile.
    """
    try:
        sb = supabase()
        user_id = current_user["id"]

        # Prepare update data (only include non-None fields)
        update_data = profile_update.model_dump(exclude_none=True)

        if not update_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No fields to update"
            )

        # Update user profile
        response = sb.table("user_profiles").update(update_data).eq("id", user_id).execute()

        if not response.data or len(response.data) == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User profile not found"
            )

        return response.data[0]

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update user profile: {str(e)}"
        )


@router.delete("/me", response_model=MessageResponse)
async def delete_current_user(current_user: dict = Depends(get_current_user)):
    """
    Delete the current authenticated user's account.

    This will cascade delete all associated data due to foreign key constraints.
    """
    try:
        sb = supabase()
        user_id = current_user["id"]

        # Delete user profile (this will cascade to connections, activities, etc.)
        sb.table("user_profiles").delete().eq("id", user_id).execute()

        # Note: Supabase auth user deletion requires admin privileges
        # You may need to implement this via a cloud function or admin endpoint

        return MessageResponse(message="User account deleted successfully")

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete user: {str(e)}"
        )
