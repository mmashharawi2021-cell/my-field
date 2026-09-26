import uuid

from fastapi import APIRouter, Depends, Response
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, require_roles
from app.db.session import get_db
from app.models.auth import User
from app.schemas.layer import LayerCreate, LayerSummary, LayerUpdate
from app.services import layer_service

router = APIRouter(tags=['layers'])
manage_layers = require_roles('super_admin', 'admin', 'gis_manager')


@router.get('/projects/{project_id}/layers', response_model=list[LayerSummary])
async def list_layers(project_id: uuid.UUID, db: AsyncSession = Depends(get_db),
                      _user: User = Depends(get_current_user)):
    return await layer_service.list_layers(db, project_id)


@router.post('/projects/{project_id}/layers', response_model=LayerSummary, status_code=201)
async def create(project_id: uuid.UUID, payload: LayerCreate, db: AsyncSession = Depends(get_db),
                 _user: User = Depends(manage_layers)):
    return await layer_service.create_layer(db, project_id, payload)


@router.get('/layers/{layer_id}', response_model=LayerSummary)
async def get(layer_id: uuid.UUID, db: AsyncSession = Depends(get_db),
              _user: User = Depends(get_current_user)):
    return await layer_service.get_layer(db, layer_id)


@router.patch('/layers/{layer_id}', response_model=LayerSummary)
async def update(layer_id: uuid.UUID, payload: LayerUpdate, db: AsyncSession = Depends(get_db),
                 _user: User = Depends(manage_layers)):
    return await layer_service.update_layer(db, layer_id, payload)


@router.delete('/layers/{layer_id}', status_code=204)
async def archive(layer_id: uuid.UUID, db: AsyncSession = Depends(get_db),
                  _user: User = Depends(manage_layers)):
    await layer_service.update_layer(db, layer_id, LayerUpdate(status='archived'))
    return Response(status_code=204)
