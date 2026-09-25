from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.models.core import Feature, Layer, Project
from app.schemas.project import ProjectSummary

router = APIRouter(prefix="/projects", tags=["projects"])


@router.get("", response_model=list[ProjectSummary])
async def list_projects(db: AsyncSession = Depends(get_db)) -> list[ProjectSummary]:
    result = await db.execute(select(Project).order_by(Project.created_at.desc()))
    projects = result.scalars().all()
    response: list[ProjectSummary] = []
    for project in projects:
        layer_count = await db.scalar(select(func.count(Layer.id)).where(Layer.project_id == project.id)) or 0
        feature_count = await db.scalar(
            select(func.count(Feature.id)).where(Feature.project_id == project.id, Feature.deleted_at.is_(None))
        ) or 0
        response.append(
            ProjectSummary(
                id=project.id,
                name=project.name,
                description=project.description,
                status=project.status,
                layer_count=layer_count,
                feature_count=feature_count,
            )
        )
    return response
