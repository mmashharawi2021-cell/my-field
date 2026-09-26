import uuid
from types import SimpleNamespace

import pytest
from fastapi.testclient import TestClient
from pydantic import ValidationError

from app.api.deps import get_current_user
from app.main import app
from app.schemas.feature import FeatureCreate, FeatureUpdate, GeoJsonGeometry


@pytest.mark.parametrize('path', [f'/api/layers/{uuid.uuid4()}/features', f'/api/features/{uuid.uuid4()}', f'/api/features/{uuid.uuid4()}/versions', f'/api/features/{uuid.uuid4()}/changes'])
def test_feature_reads_require_authentication(path):
    assert TestClient(app).get(path).status_code == 401


@pytest.mark.parametrize('role', ['reviewer', 'viewer'])
def test_feature_writes_reject_read_only_roles(role):
    app.dependency_overrides[get_current_user] = lambda: SimpleNamespace(role=SimpleNamespace(code=role))
    try:
        client = TestClient(app)
        feature_id = uuid.uuid4()
        assert client.post(f'/api/layers/{uuid.uuid4()}/features', json={'geometry': {'type': 'Point', 'coordinates': [0, 0]}}).status_code == 403
        assert client.patch(f'/api/features/{feature_id}', json={'version': 1, 'properties': {}}).status_code == 403
        assert client.delete(f'/api/features/{feature_id}?version=1').status_code == 403
    finally:
        app.dependency_overrides.clear()


@pytest.mark.parametrize('role', ['super_admin', 'admin', 'gis_manager', 'supervisor', 'field_worker'])
def test_feature_editor_roles_reach_service(role, monkeypatch):
    app.dependency_overrides[get_current_user] = lambda: SimpleNamespace(role=SimpleNamespace(code=role))
    async def fake_create(_db, layer_id, payload, _user):
        return {
            'id': uuid.uuid4(), 'project_id': uuid.uuid4(), 'layer_id': layer_id,
            'geometry': payload.geometry.model_dump(), 'properties': {}, 'version': 1,
            'created_by': None, 'updated_by': None,
            'created_at': '2026-01-01T00:00:00Z', 'updated_at': '2026-01-01T00:00:00Z',
        }
    monkeypatch.setattr('app.services.feature_service.create_feature', fake_create)
    try:
        response = TestClient(app).post(f'/api/layers/{uuid.uuid4()}/features', json={'geometry': {'type': 'Point', 'coordinates': [0, 0]}})
        assert response.status_code != 403
    finally:
        app.dependency_overrides.clear()


@pytest.mark.parametrize('geometry', [
    {'type': 'Point', 'coordinates': [1]},
    {'type': 'Point', 'coordinates': [True, 2]},
    {'type': 'Point', 'coordinates': [1, 2, 3]},
    {'type': 'LineString', 'coordinates': [[1, 2]]},
    {'type': 'LineString', 'coordinates': [[1, 2], ['bad', 3]]},
    {'type': 'LineString', 'coordinates': [[181, 2], [1, 3]]},
    {'type': 'Polygon', 'coordinates': [[[0, 0], [1, 0], [0, 1]]]},
    {'type': 'Polygon', 'coordinates': [[[0, 0], [1, 0], [0, 1], [2, 2]]]},
    {'type': 'Circle', 'coordinates': [1, 2]},
])
def test_geometry_schema_rejects_invalid_shapes(geometry):
    with pytest.raises(ValidationError):
        GeoJsonGeometry(**geometry)


def test_feature_payloads_are_strict_and_updates_require_changes():
    with pytest.raises(ValidationError):
        FeatureCreate(geometry={'type': 'Point', 'coordinates': [1, 2]}, layer_id=str(uuid.uuid4()))
    with pytest.raises(ValidationError):
        FeatureUpdate(version=1)
    with pytest.raises(ValidationError):
        FeatureUpdate(version=True, properties={})
    assert FeatureUpdate(version=2, properties={'name': 'ok'}).version == 2
