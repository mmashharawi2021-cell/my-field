from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator

RoleCode = Literal['super_admin', 'admin', 'gis_manager', 'supervisor', 'reviewer', 'field_worker', 'viewer']


class UserCreate(BaseModel):
    model_config = ConfigDict(extra='forbid')
    username: str = Field(min_length=3, max_length=80, pattern=r'^[a-zA-Z0-9_.@-]+$')
    full_name: str = Field(min_length=2, max_length=180)
    password: str = Field(min_length=12, max_length=256)
    role: RoleCode = 'viewer'

    @field_validator('username', 'full_name', mode='before')
    @classmethod
    def trim_text(cls, value):
        return value.strip() if isinstance(value, str) else value

    @field_validator('username')
    @classmethod
    def normalize_username(cls, value: str) -> str:
        return value.lower()


class UserUpdate(BaseModel):
    model_config = ConfigDict(extra='forbid', str_strip_whitespace=True)
    full_name: str = Field(default=None, min_length=2, max_length=180)
    role: RoleCode = None


class UserStatus(BaseModel):
    model_config = ConfigDict(extra='forbid', strict=True)
    is_active: bool


class RoleSummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    code: str
    name: str
    description: str | None
