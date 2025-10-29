"""
Pydantic schemas for API request/response models.
"""
from datetime import datetime
from typing import Optional, Any
from enum import Enum
from pydantic import BaseModel, EmailStr, Field, ConfigDict


# Enums
class UserType(str, Enum):
    """User type enumeration."""
    ATHLETE = "athlete"
    COACH = "coach"
    PRO = "pro"
    LAB = "lab"


class ProviderType(str, Enum):
    """Third-party provider enumeration."""
    GARMIN = "garmin"
    STRAVA = "strava"
    POLAR = "polar"
    COROS = "coros"
    WAHOO = "wahoo"
    FITBIT = "fitbit"


# Auth schemas
class UserSignup(BaseModel):
    """User signup request schema."""
    email: EmailStr
    password: str = Field(..., min_length=8)
    full_name: Optional[str] = None
    user_type: UserType = UserType.ATHLETE


class UserLogin(BaseModel):
    """User login request schema."""
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    """Authentication token response."""
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    refresh_token: Optional[str] = None
    user: Optional[dict] = None


class RefreshTokenRequest(BaseModel):
    """Refresh token request."""
    refresh_token: str


# User profile schemas
class UserProfileBase(BaseModel):
    """Base user profile schema."""
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None
    user_type: UserType = UserType.ATHLETE
    preferences: dict[str, Any] = Field(default_factory=dict)


class UserProfileCreate(UserProfileBase):
    """User profile creation schema."""
    id: str  # UUID from Supabase auth
    email: EmailStr


class UserProfileUpdate(BaseModel):
    """User profile update schema."""
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None
    user_type: Optional[UserType] = None
    preferences: Optional[dict[str, Any]] = None


class UserProfile(UserProfileBase):
    """User profile response schema."""
    id: str
    email: EmailStr
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


# Connection schemas
class ConnectionBase(BaseModel):
    """Base connection schema."""
    provider: ProviderType
    provider_user_id: str
    provider_email: Optional[str] = None
    scopes: list[str] = Field(default_factory=list)
    connection_metadata: dict[str, Any] = Field(default_factory=dict)


class ConnectionCreate(ConnectionBase):
    """Connection creation schema (used internally)."""
    user_id: str
    access_token: str
    refresh_token: Optional[str] = None
    token_expires_at: Optional[datetime] = None


class ConnectionUpdate(BaseModel):
    """Connection update schema."""
    access_token: Optional[str] = None
    refresh_token: Optional[str] = None
    token_expires_at: Optional[datetime] = None
    is_active: Optional[bool] = None
    last_sync_at: Optional[datetime] = None
    connection_metadata: Optional[dict[str, Any]] = None


class Connection(ConnectionBase):
    """Connection response schema."""
    id: str
    user_id: str
    is_active: bool
    last_sync_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ConnectionPublic(BaseModel):
    """Public connection schema (without sensitive tokens)."""
    id: str
    provider: ProviderType
    provider_email: Optional[str] = None
    is_active: bool
    last_sync_at: Optional[datetime] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# OAuth schemas
class OAuthInitRequest(BaseModel):
    """OAuth initialization request."""
    provider: ProviderType
    redirect_uri: Optional[str] = None


class OAuthInitResponse(BaseModel):
    """OAuth initialization response."""
    authorization_url: str
    state: str


class OAuthCallbackRequest(BaseModel):
    """OAuth callback request."""
    code: str
    state: str
    provider: Optional[ProviderType] = None


class OAuthCallbackResponse(BaseModel):
    """OAuth callback response."""
    success: bool
    message: str
    connection: Optional[ConnectionPublic] = None


# Activity schemas
class ActivityBase(BaseModel):
    """Base activity schema."""
    activity_type: str
    activity_name: Optional[str] = None
    start_time: datetime
    end_time: Optional[datetime] = None
    duration: Optional[int] = None  # seconds
    distance: Optional[float] = None  # meters
    elevation_gain: Optional[float] = None  # meters
    calories: Optional[int] = None
    avg_heart_rate: Optional[int] = None
    max_heart_rate: Optional[int] = None
    avg_power: Optional[int] = None
    max_power: Optional[int] = None
    avg_pace: Optional[float] = None  # seconds per km
    avg_speed: Optional[float] = None  # km/h
    activity_data: dict[str, Any] = Field(default_factory=dict)


class ActivityCreate(ActivityBase):
    """Activity creation schema."""
    connection_id: Optional[str] = None
    external_id: Optional[str] = None


class ActivityUpdate(BaseModel):
    """Activity update schema."""
    activity_name: Optional[str] = None
    activity_data: Optional[dict[str, Any]] = None


class Activity(ActivityBase):
    """Activity response schema."""
    id: str
    user_id: str
    connection_id: Optional[str] = None
    external_id: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


# Workout schemas
class WorkoutBase(BaseModel):
    """Base workout schema."""
    workout_name: str
    workout_type: Optional[str] = None
    description: Optional[str] = None
    scheduled_date: Optional[datetime] = None
    workout_data: dict[str, Any] = Field(default_factory=dict)


class WorkoutCreate(WorkoutBase):
    """Workout creation schema."""
    pass


class WorkoutUpdate(BaseModel):
    """Workout update schema."""
    workout_name: Optional[str] = None
    workout_type: Optional[str] = None
    description: Optional[str] = None
    scheduled_date: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    activity_id: Optional[str] = None
    workout_data: Optional[dict[str, Any]] = None


class Workout(WorkoutBase):
    """Workout response schema."""
    id: str
    user_id: str
    completed_at: Optional[datetime] = None
    activity_id: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


# Generic responses
class MessageResponse(BaseModel):
    """Generic message response."""
    message: str


class ErrorResponse(BaseModel):
    """Error response schema."""
    error: str
    detail: Optional[str] = None
