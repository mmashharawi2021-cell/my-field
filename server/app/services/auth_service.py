import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import verify_password
from app.models.auth import Role, User


async def get_user_by_username(db: AsyncSession, username: str) -> User | None:
    result = await db.execute(
        select(User)
        .join(Role, User.role_id == Role.id)
        .where(User.username == username)
    )
    return result.scalar_one_or_none()


async def get_user_by_id(db: AsyncSession, user_id: uuid.UUID) -> User | None:
    result = await db.execute(
        select(User)
        .join(Role, User.role_id == Role.id)
        .where(User.id == user_id)
    )
    return result.scalar_one_or_none()


async def authenticate_user(db: AsyncSession, username: str, password: str) -> User | None:
    user = await get_user_by_username(db, username)
    if user is None or not user.is_active:
        return None
    if not verify_password(password, user.password_hash):
        return None
    return user
