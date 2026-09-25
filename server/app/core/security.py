from datetime import datetime, timedelta, timezone
from typing import Any

import jwt
from pwdlib import PasswordHash

from app.core.config import get_settings

password_hasher = PasswordHash.recommended()


class TokenError(ValueError):
    pass


def hash_password(password: str) -> str:
    return password_hasher.hash(password)


def verify_password(password: str, password_hash: str) -> bool:
    return password_hasher.verify(password, password_hash)


def _create_token(subject: str, token_type: str, expires_delta: timedelta) -> str:
    settings = get_settings()
    now = datetime.now(timezone.utc)
    payload: dict[str, Any] = {
        "sub": subject,
        "type": token_type,
        "iat": now,
        "nbf": now,
        "exp": now + expires_delta,
        "iss": settings.jwt_issuer,
        "aud": settings.jwt_audience,
    }
    return jwt.encode(payload, settings.jwt_secret, algorithm=settings.jwt_algorithm)


def create_access_token(subject: str) -> str:
    settings = get_settings()
    return _create_token(
        subject=subject,
        token_type="access",
        expires_delta=timedelta(minutes=settings.access_token_minutes),
    )


def create_refresh_token(subject: str) -> str:
    settings = get_settings()
    return _create_token(
        subject=subject,
        token_type="refresh",
        expires_delta=timedelta(days=settings.refresh_token_days),
    )


def decode_token(token: str, expected_type: str) -> dict[str, Any]:
    settings = get_settings()
    try:
        payload = jwt.decode(
            token,
            settings.jwt_secret,
            algorithms=[settings.jwt_algorithm],
            issuer=settings.jwt_issuer,
            audience=settings.jwt_audience,
        )
    except jwt.PyJWTError as exc:
        raise TokenError("Invalid or expired token") from exc

    if payload.get("type") != expected_type:
        raise TokenError("Unexpected token type")

    if not payload.get("sub"):
        raise TokenError("Missing token subject")

    return payload
