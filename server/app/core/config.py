from functools import lru_cache

from pydantic import model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "My Field API"
    app_version: str = "0.2.0"
    environment: str = "development"

    database_url: str = "postgresql+asyncpg://myfield:myfield@db:5432/myfield"
    cors_origins: str = "http://localhost:5173,http://localhost:8080"

    jwt_secret: str = "dev-only-change-this-secret-before-production"
    jwt_algorithm: str = "HS256"
    jwt_issuer: str = "my-field"
    jwt_audience: str = "my-field-clients"
    access_token_minutes: int = 30
    refresh_token_days: int = 14

    initial_admin_username: str = "admin"
    initial_admin_full_name: str = "My Field Administrator"
    initial_admin_password: str | None = None

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    @property
    def cors_origin_list(self) -> list[str]:
        return [item.strip() for item in self.cors_origins.split(",") if item.strip()]

    @model_validator(mode="after")
    def validate_production_security(self) -> "Settings":
        if self.environment == "production" and self.jwt_secret.startswith("dev-only-"):
            raise ValueError("JWT_SECRET must be changed before production")
        return self


@lru_cache
def get_settings() -> Settings:
    return Settings()
