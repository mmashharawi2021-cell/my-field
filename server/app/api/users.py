import uuid

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, require_roles
from app.db.session import get_db
from app.models.auth import Role, User
from app.schemas.auth import UserProfile
from app.schemas.user import RoleSummary, UserCreate, UserStatus, UserUpdate
from app.services import user_service

router = APIRouter(tags=['users'])
manage_users = require_roles('super_admin', 'admin')


@router.get('/roles', response_model=list[RoleSummary])
async def roles(db: AsyncSession = Depends(get_db), _user: User = Depends(get_current_user)):
    return (await db.scalars(select(Role).order_by(Role.code))).all()


@router.get('/users', response_model=list[UserProfile])
async def users(db: AsyncSession = Depends(get_db), _user: User = Depends(manage_users)):
    return await user_service.list_users(db)


@router.post('/users', response_model=UserProfile, status_code=201)
async def create(payload: UserCreate, db: AsyncSession = Depends(get_db),
                 user: User = Depends(manage_users)):
    return await user_service.create_user(db, user, payload)


@router.patch('/users/{user_id}', response_model=UserProfile)
async def update(user_id: uuid.UUID, payload: UserUpdate, db: AsyncSession = Depends(get_db),
                 user: User = Depends(manage_users)):
    return await user_service.update_user(db, user, user_id, payload)


@router.patch('/users/{user_id}/status', response_model=UserProfile)
async def status(user_id: uuid.UUID, payload: UserStatus, db: AsyncSession = Depends(get_db),
                 user: User = Depends(manage_users)):
    return await user_service.update_user(db, user, user_id, is_active=payload.is_active)
