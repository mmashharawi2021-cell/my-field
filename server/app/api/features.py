import uuid

from fastapi import APIRouter, Depends, Query, Response
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, require_roles
from app.db.session import get_db
from app.models.auth import User
from app.schemas.feature import ChangeSummary, FeatureCreate, FeatureSummary, FeatureUpdate, FeatureVersionSummary
from app.services import feature_service

router = APIRouter(tags=['features'])
edit_features = require_roles('super_admin', 'admin', 'gis_manager', 'supervisor', 'field_worker')


@router.get('/layers/{layer_id}/features', response_model=list[FeatureSummary])
async def list_features(layer_id: uuid.UUID, db: AsyncSession = Depends(get_db),
                        _user: User = Depends(get_current_user), limit: int = Query(default=5000, ge=1, le=5000)):
    return await feature_service.list_features(db, layer_id, limit)


@router.post('/layers/{layer_id}/features', response_model=FeatureSummary, status_code=201)
async def create_feature(layer_id: uuid.UUID, payload: FeatureCreate,
                         db: AsyncSession = Depends(get_db), user: User = Depends(edit_features)):
    return await feature_service.create_feature(db, layer_id, payload, user)


@router.get('/features/{feature_id}', response_model=FeatureSummary)
async def get_feature(feature_id: uuid.UUID, db: AsyncSession = Depends(get_db),
                      _user: User = Depends(get_current_user)):
    return await feature_service.get_feature(db, feature_id)


@router.patch('/features/{feature_id}', response_model=FeatureSummary)
async def update_feature(feature_id: uuid.UUID, payload: FeatureUpdate,
                         db: AsyncSession = Depends(get_db), user: User = Depends(edit_features)):
    return await feature_service.update_feature(db, feature_id, payload, user)


@router.delete('/features/{feature_id}', status_code=204)
async def delete_feature(feature_id: uuid.UUID, version: int = Query(ge=1),
                         db: AsyncSession = Depends(get_db), user: User = Depends(edit_features)):
    await feature_service.delete_feature(db, feature_id, version, user)
    return Response(status_code=204)


@router.get('/features/{feature_id}/versions', response_model=list[FeatureVersionSummary])
async def versions(feature_id: uuid.UUID, db: AsyncSession = Depends(get_db),
                   _user: User = Depends(get_current_user)):
    return await feature_service.list_versions(db, feature_id)


@router.get('/features/{feature_id}/changes', response_model=list[ChangeSummary])
async def changes(feature_id: uuid.UUID, db: AsyncSession = Depends(get_db),
                  _user: User = Depends(get_current_user)):
    return await feature_service.list_changes(db, feature_id)
