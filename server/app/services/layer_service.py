import uuid

from fastapi import HTTPException
from sqlalchemy import select, text
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.core import Feature, Layer, Project
from app.schemas.layer import LayerCreate, LayerUpdate


async def require_project(db: AsyncSession, project_id: uuid.UUID) -> Project:
    project = await db.scalar(select(Project).where(Project.id == project_id).with_for_update())
    if project is None or project.status == 'archived':
        raise HTTPException(404, 'Project not found')
    return project


async def validate_srid(db: AsyncSession, srid: int) -> None:
    if not await db.scalar(text('SELECT EXISTS (SELECT 1 FROM spatial_ref_sys WHERE srid = :srid)'), {'srid': srid}):
        raise HTTPException(422, 'SRID is not registered in PostGIS')


async def list_layers(db: AsyncSession, project_id: uuid.UUID):
    await require_project(db, project_id)
    return (await db.scalars(select(Layer).where(Layer.project_id == project_id,
                                                Layer.status != 'archived')
                            .order_by(Layer.created_at, Layer.id))).all()


async def get_layer(db: AsyncSession, layer_id: uuid.UUID) -> Layer:
    layer = await db.get(Layer, layer_id)
    if layer is None or layer.status == 'archived':
        raise HTTPException(404, 'Layer not found')
    await require_project(db, layer.project_id)
    return layer


async def create_layer(db: AsyncSession, project_id: uuid.UUID, payload: LayerCreate) -> Layer:
    await require_project(db, project_id)
    await validate_srid(db, payload.srid)
    layer = Layer(project_id=project_id, **payload.model_dump())
    db.add(layer)
    await db.commit()
    await db.refresh(layer)
    return layer


async def update_layer(db: AsyncSession, layer_id: uuid.UUID, payload: LayerUpdate) -> Layer:
    layer = await get_layer(db, layer_id)
    await db.refresh(layer)  # Refresh after the project lock was acquired.
    if layer.status == 'archived':
        raise HTTPException(404, 'Layer not found')
    changes = payload.model_dump(exclude_unset=True)
    if 'srid' in changes:
        await validate_srid(db, changes['srid'])
    if any(key in changes and changes[key] != getattr(layer, key) for key in ('srid', 'geometry_type')):
        if await db.scalar(select(Feature.id).where(Feature.layer_id == layer.id).limit(1)):
            raise HTTPException(409, 'Cannot change geometry type or SRID on a populated layer')
    for key, value in changes.items():
        setattr(layer, key, value)
    await db.commit()
    await db.refresh(layer)
    return layer
