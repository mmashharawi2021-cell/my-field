import json
import uuid
from datetime import datetime, timezone

from fastapi import HTTPException
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.auth import User
from app.models.core import ChangeLog, Feature, FeatureVersion, Layer, Project
from app.schemas.feature import FeatureCreate, FeatureSummary, FeatureUpdate, FeatureVersionSummary


async def _active_layer(db: AsyncSession, layer_id: uuid.UUID) -> Layer:
    layer = await db.scalar(
        select(Layer).join(Project, Project.id == Layer.project_id).where(
            Layer.id == layer_id, Layer.status != 'archived', Project.status != 'archived'
        )
    )
    if layer is None:
        raise HTTPException(404, 'Layer not found')
    return layer


def _require_editable(layer: Layer) -> None:
    if layer.status != 'active':
        raise HTTPException(409, 'Features can only be edited in an active layer')


def _geometry_expression(geometry: dict):
    return func.ST_SetSRID(func.ST_GeomFromGeoJSON(json.dumps(geometry)), 4326)


async def _validate_geometry(db: AsyncSession, layer: Layer, geometry: dict) -> None:
    if geometry['type'] != layer.geometry_type:
        raise HTTPException(422, f'Geometry must be {layer.geometry_type}')
    expression = _geometry_expression(geometry)
    valid, empty = (await db.execute(select(func.ST_IsValid(expression), func.ST_IsEmpty(expression)))).one()
    if not valid or empty:
        raise HTTPException(422, 'Geometry is empty or invalid')


def _summary(row) -> FeatureSummary:
    feature, geometry = row
    return FeatureSummary(
        id=feature.id, project_id=feature.project_id, layer_id=feature.layer_id,
        geometry=json.loads(geometry), properties=feature.properties, version=feature.version,
        created_by=feature.created_by, updated_by=feature.updated_by,
        created_at=feature.created_at, updated_at=feature.updated_at,
    )


async def _feature_row(db: AsyncSession, feature_id: uuid.UUID, *, lock: bool = False):
    query = select(Feature, func.ST_AsGeoJSON(Feature.geometry)).where(
        Feature.id == feature_id, Feature.deleted_at.is_(None)
    )
    if lock:
        query = query.with_for_update(of=Feature)
    row = (await db.execute(query)).one_or_none()
    if row is None:
        raise HTTPException(404, 'Feature not found')
    await _active_layer(db, row[0].layer_id)
    return row


async def list_features(db: AsyncSession, layer_id: uuid.UUID, limit: int = 5000) -> list[FeatureSummary]:
    await _active_layer(db, layer_id)
    rows = (await db.execute(
        select(Feature, func.ST_AsGeoJSON(Feature.geometry)).where(
            Feature.layer_id == layer_id, Feature.deleted_at.is_(None)
        ).order_by(Feature.created_at, Feature.id).limit(limit)
    )).all()
    return [_summary(row) for row in rows]


async def get_feature(db: AsyncSession, feature_id: uuid.UUID) -> FeatureSummary:
    return _summary(await _feature_row(db, feature_id))


async def _record_version(db: AsyncSession, feature: Feature, geometry, actor: User) -> None:
    db.add(FeatureVersion(
        feature_id=feature.id, version=feature.version, geometry=geometry,
        properties=feature.properties, changed_by=actor.id,
    ))


def _record_change(db: AsyncSession, feature: Feature, operation: str, actor: User) -> None:
    db.add(ChangeLog(
        entity_type='feature', entity_id=feature.id, operation=operation,
        version=feature.version, payload={'layer_id': str(feature.layer_id)}, changed_by=actor.id,
    ))


async def create_feature(db: AsyncSession, layer_id: uuid.UUID, payload: FeatureCreate, actor: User) -> FeatureSummary:
    layer = await _active_layer(db, layer_id)
    _require_editable(layer)
    geometry = payload.geometry.model_dump()
    await _validate_geometry(db, layer, geometry)
    expression = _geometry_expression(geometry)
    feature = Feature(
        project_id=layer.project_id, layer_id=layer.id, geometry=expression,
        properties=payload.properties, version=1, created_by=actor.id, updated_by=actor.id,
    )
    db.add(feature)
    await db.flush()
    await _record_version(db, feature, expression, actor)
    _record_change(db, feature, 'create', actor)
    await db.commit()
    return await get_feature(db, feature.id)


async def update_feature(db: AsyncSession, feature_id: uuid.UUID, payload: FeatureUpdate, actor: User) -> FeatureSummary:
    feature, _ = await _feature_row(db, feature_id, lock=True)
    if feature.version != payload.version:
        raise HTTPException(409, {'message': 'Feature has a newer version', 'current_version': feature.version})
    layer = await _active_layer(db, feature.layer_id)
    _require_editable(layer)
    geometry_expression = feature.geometry
    if payload.geometry is not None:
        geometry = payload.geometry.model_dump()
        await _validate_geometry(db, layer, geometry)
        geometry_expression = _geometry_expression(geometry)
        feature.geometry = geometry_expression
    if payload.properties is not None:
        feature.properties = payload.properties
    feature.version += 1
    feature.updated_by = actor.id
    feature.updated_at = datetime.now(timezone.utc)
    await _record_version(db, feature, geometry_expression, actor)
    _record_change(db, feature, 'update', actor)
    await db.commit()
    return await get_feature(db, feature.id)


async def delete_feature(db: AsyncSession, feature_id: uuid.UUID, version: int, actor: User) -> None:
    feature, _ = await _feature_row(db, feature_id, lock=True)
    _require_editable(await _active_layer(db, feature.layer_id))
    if feature.version != version:
        raise HTTPException(409, {'message': 'Feature has a newer version', 'current_version': feature.version})
    feature.version += 1
    feature.updated_by = actor.id
    feature.updated_at = datetime.now(timezone.utc)
    feature.deleted_at = feature.updated_at
    await _record_version(db, feature, feature.geometry, actor)
    _record_change(db, feature, 'delete', actor)
    await db.commit()


async def list_versions(db: AsyncSession, feature_id: uuid.UUID) -> list[FeatureVersionSummary]:
    feature = await db.get(Feature, feature_id)
    if feature is None:
        raise HTTPException(404, 'Feature not found')
    await _active_layer(db, feature.layer_id)
    rows = (await db.execute(
        select(FeatureVersion, func.ST_AsGeoJSON(FeatureVersion.geometry)).where(
            FeatureVersion.feature_id == feature_id
        ).order_by(FeatureVersion.version.desc())
    )).all()
    return [FeatureVersionSummary(
        version=item.version, geometry=json.loads(geometry), properties=item.properties,
        changed_by=item.changed_by, changed_at=item.changed_at,
    ) for item, geometry in rows]


async def list_changes(db: AsyncSession, feature_id: uuid.UUID) -> list[ChangeLog]:
    feature = await db.get(Feature, feature_id)
    if feature is None:
        raise HTTPException(404, 'Feature not found')
    await _active_layer(db, feature.layer_id)
    return (await db.scalars(select(ChangeLog).where(
        ChangeLog.entity_type == 'feature', ChangeLog.entity_id == feature_id
    ).order_by(ChangeLog.version.desc()))).all()
