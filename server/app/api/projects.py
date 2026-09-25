import uuid

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, require_roles
from app.db.session import get_db
from app.models.auth import User
from app.schemas.project import ProjectCreate, ProjectSummary, ProjectUpdate
from app.services import project_service

router = APIRouter(prefix="/projects", tags=["projects"])

PROJECT_MANAGER_ROLES = ("super_admin", "admin", "gis_manager")


@router.get("", response_model=list[ProjectSummary])
async def list_projects(
    db: AsyncSession = Depends(get_db),
    _current_user: User = Depends(get_current_user),
) -> list[ProjectSummary]:
    return await project_service.list_projects(db)


@router.post("", response_model=ProjectSummary, status_code=status.HTTP_201_CREATED)
async def create_project(
    payload: ProjectCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles(*PROJECT_MANAGER_ROLES)),
) -> ProjectSummary:
    return await project_service.create_project(db, payload, current_user)


@router.get("/{project_id}", response_model=ProjectSummary)
async def get_project(
    project_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    _current_user: User = Depends(get_current_user),
) -> ProjectSummary:
    project = await project_service.get_project(db, project_id)
    if project is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    return project


@router.patch("/{project_id}", response_model=ProjectSummary)
async def update_project(
    project_id: uuid.UUID,
    payload: ProjectUpdate,
    db: AsyncSession = Depends(get_db),
    _current_user: User = Depends(require_roles(*PROJECT_MANAGER_ROLES)),
) -> ProjectSummary:
    project = await project_service.update_project(db, project_id, payload)
    if project is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    return project


@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
async def archive_project(
    project_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    _current_user: User = Depends(require_roles(*PROJECT_MANAGER_ROLES)),
) -> Response:
    archived = await project_service.archive_project(db, project_id)
    if not archived:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    return Response(status_code=status.HTTP_204_NO_CONTENT)
