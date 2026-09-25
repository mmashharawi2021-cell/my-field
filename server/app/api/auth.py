import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.core.security import (
    TokenError,
    create_access_token,
    create_refresh_token,
    decode_token,
)
from app.db.session import get_db
from app.models.auth import User
from app.schemas.auth import LoginRequest, RefreshRequest, TokenPair, UserProfile
from app.services.auth_service import authenticate_user, get_user_by_id

router = APIRouter(prefix="/auth", tags=["auth"])


def _profile(user: User) -> UserProfile:
    return UserProfile(
        id=user.id,
        username=user.username,
        full_name=user.full_name,
        role=user.role.code,
        is_active=user.is_active,
    )


@router.post("/login", response_model=TokenPair)
async def login(payload: LoginRequest, db: AsyncSession = Depends(get_db)) -> TokenPair:
    user = await authenticate_user(db, payload.username.strip().lower(), payload.password)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password",
        )

    subject = str(user.id)
    return TokenPair(
        access_token=create_access_token(subject),
        refresh_token=create_refresh_token(subject),
    )


@router.post("/refresh", response_model=TokenPair)
async def refresh(payload: RefreshRequest, db: AsyncSession = Depends(get_db)) -> TokenPair:
    try:
        token_payload = decode_token(payload.refresh_token, expected_type="refresh")
        user_id = uuid.UUID(token_payload["sub"])
    except (TokenError, ValueError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token",
        ) from None

    user = await get_user_by_id(db, user_id)
    if user is None or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User is inactive or unavailable",
        )

    subject = str(user.id)
    return TokenPair(
        access_token=create_access_token(subject),
        refresh_token=create_refresh_token(subject),
    )


@router.get("/me", response_model=UserProfile)
async def me(current_user: User = Depends(get_current_user)) -> UserProfile:
    return _profile(current_user)
