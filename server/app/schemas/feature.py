import uuid
import math
from datetime import datetime
from typing import Any, Literal

from pydantic import BaseModel, ConfigDict, Field, JsonValue, model_validator

GeometryType = Literal['Point', 'LineString', 'Polygon']


class GeoJsonGeometry(BaseModel):
    model_config = ConfigDict(extra='forbid')
    type: GeometryType
    coordinates: list[Any]

    @model_validator(mode='after')
    def validate_shape(self):
        coordinates = self.coordinates
        def position(value):
            if not isinstance(value, list) or len(value) != 2:
                raise ValueError('Every position requires longitude and latitude')
            if not all(isinstance(item, (int, float)) and not isinstance(item, bool) and math.isfinite(item) for item in value[:2]):
                raise ValueError('Coordinates must be finite numbers')
            if not -180 <= value[0] <= 180 or not -90 <= value[1] <= 90:
                raise ValueError('Coordinates must use WGS84 longitude and latitude')
        if self.type == 'Point':
            position(coordinates)
        elif self.type == 'LineString':
            if len(coordinates) < 2 or len(coordinates) > 10000:
                raise ValueError('LineString requires at least two positions')
            for item in coordinates:
                position(item)
        elif self.type == 'Polygon':
            if not coordinates:
                raise ValueError('Polygon requires at least one ring')
            for ring in coordinates:
                if not isinstance(ring, list) or len(ring) < 4 or len(ring) > 10001 or ring[0] != ring[-1]:
                    raise ValueError('Every polygon ring must contain four positions and be closed')
                for item in ring:
                    position(item)
        return self


class FeatureCreate(BaseModel):
    model_config = ConfigDict(extra='forbid')
    id: uuid.UUID | None = None
    geometry: GeoJsonGeometry
    properties: dict[str, JsonValue] = Field(default_factory=dict, max_length=500)


class FeatureUpdate(BaseModel):
    model_config = ConfigDict(extra='forbid')
    version: int = Field(ge=1, strict=True)
    geometry: GeoJsonGeometry | None = None
    properties: dict[str, JsonValue] | None = Field(default=None, max_length=500)

    @model_validator(mode='after')
    def require_change(self):
        if self.geometry is None and self.properties is None:
            raise ValueError('Geometry or properties are required')
        return self


class FeatureSummary(BaseModel):
    id: uuid.UUID
    project_id: uuid.UUID
    layer_id: uuid.UUID
    geometry: dict[str, Any]
    properties: dict[str, JsonValue]
    version: int
    created_by: uuid.UUID | None
    updated_by: uuid.UUID | None
    created_at: datetime
    updated_at: datetime


class FeatureVersionSummary(BaseModel):
    version: int
    geometry: dict[str, Any]
    properties: dict[str, JsonValue]
    changed_by: uuid.UUID | None
    changed_at: datetime


class ChangeSummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    operation: str
    version: int
    payload: dict[str, JsonValue]
    changed_by: uuid.UUID | None
    changed_at: datetime

