import uuid
from types import SimpleNamespace

import pytest
from fastapi import HTTPException
from fastapi.testclient import TestClient
from pydantic import ValidationError

from app.api.deps import get_current_user
from app.main import app
from app.schemas.layer import LayerCreate, LayerUpdate
from app.schemas.user import UserCreate, UserUpdate
from app.services.user_service import check_management


@pytest.mark.parametrize('path', ['/api/users', '/api/roles', f'/api/projects/{uuid.uuid4()}/layers', f'/api/layers/{uuid.uuid4()}'])
def test_management_requires_auth(path):
    assert TestClient(app).get(path).status_code == 401


@pytest.mark.parametrize('role', ['gis_manager', 'supervisor', 'reviewer', 'field_worker', 'viewer'])
def test_user_management_rbac(role):
    app.dependency_overrides[get_current_user] = lambda: SimpleNamespace(role=SimpleNamespace(code=role))
    try:
        client = TestClient(app)
        assert client.get('/api/users').status_code == 403
        assert client.post('/api/users', json={'username': 'testing', 'full_name': 'Test User', 'password': 'test-password-123'}).status_code == 403
        assert client.patch(f'/api/users/{uuid.uuid4()}', json={'role': 'admin'}).status_code == 403
        assert client.patch(f'/api/users/{uuid.uuid4()}/status', json={'is_active': False}).status_code == 403
    finally:
        app.dependency_overrides.clear()


@pytest.mark.parametrize('role', ['supervisor', 'reviewer', 'field_worker', 'viewer'])
def test_layer_writes_require_manager(role):
    app.dependency_overrides[get_current_user] = lambda: SimpleNamespace(role=SimpleNamespace(code=role))
    try:
        client = TestClient(app)
        assert client.post(f'/api/projects/{uuid.uuid4()}/layers', json={'name': 'Test', 'geometry_type': 'Point'}).status_code == 403
        assert client.patch(f'/api/layers/{uuid.uuid4()}', json={'name': 'Changed'}).status_code == 403
        assert client.delete(f'/api/layers/{uuid.uuid4()}').status_code == 403
    finally:
        app.dependency_overrides.clear()


@pytest.mark.parametrize('role', ['admin', 'super_admin'])
def test_admin_cannot_manage_privileged_accounts(role):
    actor = SimpleNamespace(role=SimpleNamespace(code='admin'))
    target = SimpleNamespace(role=SimpleNamespace(code=role))
    with pytest.raises(HTTPException) as error:
        check_management(actor, target)
    assert error.value.status_code == 403
    with pytest.raises(HTTPException):
        check_management(actor, role=role)


@pytest.mark.parametrize('payload', [{'name': None}, {'srid': None}, {'style_json': None}, {'geometry_type': None}, {'status': None}, {'name': '  '}, {'srid': 0}, {'srid': True}, {'geometry_type': 'Circle'}, {'style_json': []}, {'project_id': str(uuid.uuid4())}])
def test_layer_patch_rejects_invalid_values(payload):
    with pytest.raises(ValidationError):
        LayerUpdate(**payload)


@pytest.mark.parametrize('payload', [{'full_name': None}, {'role': None}, {'role': 'owner'}, {'password_hash': 'unsafe'}, {'full_name': '   '}])
def test_user_patch_rejects_invalid_values(payload):
    with pytest.raises(ValidationError):
        UserUpdate(**payload)


def test_create_normalization_preserves_password():
    user = UserCreate(username=' Mixed.Case ', full_name=' Test User ', password='  password-123  ')
    assert user.username == 'mixed.case'
    assert user.full_name == 'Test User'
    assert user.password == '  password-123  '
    assert LayerCreate(name=' Layer ', geometry_type='Point').name == 'Layer'
    assert LayerUpdate().model_dump(exclude_unset=True) == {}
