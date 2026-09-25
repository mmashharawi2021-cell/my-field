import uuid
from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

ProjectStatus = Literal["draft", "active", "archived"]


class ProjectCreate(BaseModel):
    name: str = Field(min_length=2, max_length=180)
    description: str | None = Field(default=None, max_length=4000)
    status: ProjectStatus = "draft"


class ProjectUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=2, max_length=180)
    description: str | None = Field(default=None, max_length=4000)
    status: ProjectStatus | None = None


class ProjectSummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    name: str
    description: str | None = None
    status: str
    feature_count: int = 0
    layer_count: int = 0
    created_at: datetime
    updated_at: datetime
