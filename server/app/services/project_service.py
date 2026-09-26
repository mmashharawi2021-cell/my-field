import uuid

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.auth import User
from app.models.core import Feature, Layer, Project
from app.schemas.project import ProjectCreate, ProjectSummary, ProjectUpdate


def _summary(project: Project, layer_count: int, feature_count: int) -> ProjectSummary:
    return ProjectSummary(
        id=project.id,
        name=project.name,
        description=project.description,
        status=project.status,
        layer_count=layer_count,
        feature_count=feature_count,
        created_at=project.created_at,
        updated_at=project.updated_at,
    )


async def list_projects(db: AsyncSession) -> list[ProjectSummary]:
    layer_count = (
        select(func.count(Layer.id))
        .where(Layer.project_id == Project.id, Layer.status != "archived")
        .correlate(Project)
        .scalar_subquery()
    )
    feature_count = (
        select(func.count(Feature.id))
        .where(
            Feature.project_id == Project.id,
            Feature.deleted_at.is_(None),
        )
        .correlate(Project)
        .scalar_subquery()
    )

    result = await db.execute(
        select(
            Project,
            layer_count.label("layer_count"),
            feature_count.label("feature_count"),
        )
        .where(Project.status != "archived")
        .order_by(Project.created_at.desc())
    )

    return [
        _summary(project, int(layer_total or 0), int(feature_total or 0))
        for project, layer_total, feature_total in result.all()
    ]


async def get_project(db: AsyncSession, project_id: uuid.UUID) -> ProjectSummary | None:
    project = await db.get(Project, project_id)
    if project is None:
        return None

    layer_count = await db.scalar(
        select(func.count(Layer.id)).where(Layer.project_id == project.id, Layer.status != "archived")
    ) or 0
    feature_count = await db.scalar(
        select(func.count(Feature.id)).where(
            Feature.project_id == project.id,
            Feature.deleted_at.is_(None),
        )
    ) or 0

    return _summary(project, int(layer_count), int(feature_count))


async def create_project(
    db: AsyncSession,
    payload: ProjectCreate,
    current_user: User,
) -> ProjectSummary:
    project = Project(
        name=payload.name.strip(),
        description=payload.description.strip() if payload.description else None,
        status=payload.status,
        created_by=current_user.id,
    )
    db.add(project)
    await db.commit()
    await db.refresh(project)
    return _summary(project, 0, 0)


async def update_project(
    db: AsyncSession,
    project_id: uuid.UUID,
    payload: ProjectUpdate,
) -> ProjectSummary | None:
    project = await db.get(Project, project_id)
    if project is None:
        return None

    changes = payload.model_dump(exclude_unset=True)

    if "name" in changes and changes["name"] is not None:
        changes["name"] = changes["name"].strip()

    if "description" in changes and changes["description"] is not None:
        changes["description"] = changes["description"].strip()

    for key, value in changes.items():
        setattr(project, key, value)

    await db.commit()
    await db.refresh(project)
    return await get_project(db, project.id)


async def archive_project(db: AsyncSession, project_id: uuid.UUID) -> bool:
    project = await db.get(Project, project_id)
    if project is None:
        return False

    project.status = "archived"
    await db.commit()
    return True
