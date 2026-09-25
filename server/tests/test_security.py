import uuid

import pytest

from app.core.security import (
    TokenError,
    create_access_token,
    create_refresh_token,
    decode_token,
    hash_password,
    verify_password,
)


def test_password_hash_round_trip() -> None:
    password = "Correct-Horse-Battery-123"
    hashed = hash_password(password)

    assert hashed != password
    assert verify_password(password, hashed)
    assert not verify_password("wrong-password", hashed)


def test_access_token_round_trip() -> None:
    subject = str(uuid.uuid4())
    token = create_access_token(subject)
    payload = decode_token(token, expected_type="access")

    assert payload["sub"] == subject
    assert payload["type"] == "access"


def test_refresh_token_rejected_as_access_token() -> None:
    token = create_refresh_token(str(uuid.uuid4()))

    with pytest.raises(TokenError):
        decode_token(token, expected_type="access")
