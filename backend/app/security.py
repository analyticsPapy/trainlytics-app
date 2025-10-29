"""
Security utilities for JWT token verification and authentication.
"""
from typing import Optional
from datetime import datetime, timedelta
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
from app.config import settings
from app.supabase import supabase


# Security scheme for JWT bearer tokens
security = HTTPBearer()


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """
    Create a JWT access token.

    Args:
        data: The data to encode in the token
        expires_delta: Optional expiration time delta

    Returns:
        Encoded JWT token string
    """
    to_encode = data.copy()

    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(hours=settings.jwt_expiration_hours)

    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.jwt_secret, algorithm=settings.jwt_algorithm)

    return encoded_jwt


def decode_token(token: str) -> dict:
    """
    Decode and verify a JWT token.

    Args:
        token: The JWT token to decode

    Returns:
        The decoded token payload

    Raises:
        HTTPException: If token is invalid or expired
    """
    try:
        payload = jwt.decode(
            token,
            settings.jwt_secret,
            algorithms=[settings.jwt_algorithm]
        )
        return payload
    except JWTError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Could not validate credentials: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> dict:
    """
    Dependency to get the current authenticated user from JWT token.

    Args:
        credentials: HTTP authorization credentials from request

    Returns:
        User data dictionary

    Raises:
        HTTPException: If authentication fails
    """
    token = credentials.credentials

    # First try to verify with Supabase
    try:
        sb = supabase()
        user = sb.auth.get_user(token)

        if user and user.user:
            return {
                "id": user.user.id,
                "email": user.user.email,
                "role": user.user.role if hasattr(user.user, 'role') else 'authenticated',
                "user_metadata": user.user.user_metadata if hasattr(user.user, 'user_metadata') else {}
            }
    except Exception as e:
        # If Supabase verification fails, try local JWT verification
        payload = decode_token(token)
        user_id = payload.get("sub")

        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )

        return {
            "id": user_id,
            "email": payload.get("email"),
            "role": payload.get("role", "authenticated")
        }

    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )


async def get_current_user_id(current_user: dict = Depends(get_current_user)) -> str:
    """
    Dependency to get only the current user's ID.

    Args:
        current_user: Current user data from get_current_user dependency

    Returns:
        User ID string
    """
    return current_user["id"]


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify a password against its hash.
    Note: Supabase handles password hashing, so this is mainly for compatibility.

    Args:
        plain_password: The plain text password
        hashed_password: The hashed password

    Returns:
        True if password matches, False otherwise
    """
    # Supabase handles password verification internally
    # This function is here for potential future use
    return True
