import uuid

from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import hash_password
from app.models.auth import Role, User
from app.schemas.auth import UserProfile
from app.schemas.user import UserCreate, UserUpdate


def profile(user: User) -> UserProfile:
    return UserProfile(id=user.id, username=user.username, full_name=user.full_name,
                       role=user.role.code, is_active=user.is_active)


def check_management(actor: User, target: User | None = None, role: str | None = None) -> None:
    if actor.role.code not in ('super_admin', 'admin'):
        raise HTTPException(403, 'Insufficient permissions')
    if actor.role.code == 'admin' and (
        role in ('super_admin', 'admin') or
        (target is not None and target.role.code in ('super_admin', 'admin'))
    ):
        raise HTTPException(403, 'Only super administrators can manage administrators')


async def get_role(db: AsyncSession, code: str) -> Role:
    role = await db.scalar(select(Role).where(Role.code == code))
    if role is None:
        raise HTTPException(422, 'Unknown role')
    return role


async def list_users(db: AsyncSession) -> list[UserProfile]:
    return [profile(user) for user in (await db.scalars(select(User).order_by(User.username))).all()]


async def create_user(db: AsyncSession, actor: User, payload: UserCreate) -> UserProfile:
    check_management(actor, role=payload.role)
    role = await get_role(db, payload.role)
    user = User(username=payload.username, full_name=payload.full_name,
                password_hash=hash_password(payload.password), role=role, is_active=True)
    db.add(user)
    try:
        await db.commit()
    except IntegrityError:
        await db.rollback()
        raise HTTPException(409, 'Username already exists') from None
    await db.refresh(user)
    return profile(user)


async def update_user(db: AsyncSession, actor: User, user_id: uuid.UUID,
                      payload: UserUpdate | None = None, is_active: bool | None = None) -> UserProfile:
    # Serialize account mutations, including changes to the acting administrator.
    # A stable order prevents deadlocks when administrators edit one another.
    users = (await db.scalars(select(User).where(User.id.in_([actor.id, user_id]))
                             .order_by(User.id).with_for_update(of=User)
                             .execution_options(populate_existing=True))).all()
    target = next((user for user in users if user.id == user_id), None)
    actor = next(user for user in users if user.id == actor.id)
    if not actor.is_active:
        raise HTTPException(401, 'User is inactive')
    if target is None:
        raise HTTPException(404, 'User not found')
    changes = payload.model_dump(exclude_unset=True) if payload else {}
    check_management(actor, target, changes.get('role'))
    if actor.id == target.id and (is_active is False or
                                  ('role' in changes and changes['role'] != actor.role.code)):
        raise HTTPException(409, 'Cannot disable or change your own role')
    if 'full_name' in changes:
        target.full_name = changes['full_name']
    if 'role' in changes:
        target.role = await get_role(db, changes['role'])
    if is_active is not None:
        target.is_active = is_active
    await db.commit()
    await db.refresh(target)
    return profile(target)
