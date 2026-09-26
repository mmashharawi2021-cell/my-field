import uuid
from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, JsonValue

GeometryType = Literal['Point', 'LineString', 'Polygon']
LayerStatus = Literal['active', 'draft', 'archived']


class LayerCreate(BaseModel):
    model_config = ConfigDict(extra='forbid', str_strip_whitespace=True)
    name: str = Field(min_length=2, max_length=180)
    geometry_type: GeometryType
    srid: int = Field(default=4326, ge=1, le=998999, strict=True)
    status: Literal['active', 'draft'] = 'active'
    style_json: dict[str, JsonValue] = Field(default_factory=dict)


class LayerUpdate(BaseModel):
    model_config = ConfigDict(extra='forbid', str_strip_whitespace=True)
    name: str = Field(default=None, min_length=2, max_length=180)
    geometry_type: GeometryType = None
    srid: int = Field(default=None, ge=1, le=998999, strict=True)
    status: LayerStatus = None
    style_json: dict[str, JsonValue] = None


class LayerSummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    project_id: uuid.UUID
    name: str
    geometry_type: str
    srid: int
    status: str
    style_json: dict[str, JsonValue]
    created_at: datetime
