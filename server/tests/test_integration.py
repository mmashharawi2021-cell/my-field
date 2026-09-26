from fastapi.testclient import TestClient

from app.main import app


def _auth_headers(client: TestClient) -> dict[str, str]:
    response = client.post(
        "/api/auth/login",
        json={
            "username": "admin",
            "password": "Test-Admin-Password-123!",
        },
    )
    assert response.status_code == 200, response.text
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def test_auth_and_project_crud() -> None:
    with TestClient(app) as client:
        headers = _auth_headers(client)

        me = client.get("/api/auth/me", headers=headers)
        assert me.status_code == 200
        assert me.json()["role"] == "super_admin"

        created = client.post(
            "/api/projects",
            headers=headers,
            json={
                "name": "Integration Project",
                "description": "Created by CI integration test",
                "status": "active",
            },
        )
        assert created.status_code == 201, created.text
        project = created.json()
        project_id = project["id"]
        assert project["name"] == "Integration Project"
        assert project["layer_count"] == 0
        assert project["feature_count"] == 0

        fetched = client.get(f"/api/projects/{project_id}", headers=headers)
        assert fetched.status_code == 200
        assert fetched.json()["id"] == project_id

        updated = client.patch(
            f"/api/projects/{project_id}",
            headers=headers,
            json={"name": "Integration Project Updated"},
        )
        assert updated.status_code == 200
        assert updated.json()["name"] == "Integration Project Updated"

        archived = client.delete(f"/api/projects/{project_id}", headers=headers)
        assert archived.status_code == 204

        projects = client.get("/api/projects", headers=headers)
        assert projects.status_code == 200
        assert all(item["id"] != project_id for item in projects.json())

        # Phase 04 runs within this client/event loop so pooled async connections
        # are not reused across TestClient loops.
        from uuid import uuid4
        suffix = uuid4().hex[:10]
        password = '  Test-User-Password-123!  '

        def new_user(role):
            response = client.post('/api/users', headers=headers, json={
                'username': f'{role}-{suffix}', 'full_name': 'Integration User',
                'password': password, 'role': role,
            })
            assert response.status_code == 201, response.text
            assert 'password_hash' not in response.text and 'password' not in response.json()
            login = client.post('/api/auth/login', json={'username': f'{role}-{suffix}', 'password': password})
            assert login.status_code == 200, login.text
            return response.json(), login.json()

        viewer, viewer_tokens = new_user('viewer')
        manager, manager_tokens = new_user('gis_manager')
        admin, admin_tokens = new_user('admin')
        viewer_headers = {'Authorization': 'Bearer ' + viewer_tokens['access_token']}
        manager_headers = {'Authorization': 'Bearer ' + manager_tokens['access_token']}
        admin_headers = {'Authorization': 'Bearer ' + admin_tokens['access_token']}
        assert len(client.get('/api/roles', headers=viewer_headers).json()) == 7
        assert client.get('/api/users', headers=viewer_headers).status_code == 403
        assert client.get('/api/users', headers=manager_headers).status_code == 403
        assert client.get('/api/users', headers=admin_headers).status_code == 200
        assert client.patch('/api/users/' + viewer['id'], headers=admin_headers, json={'role': 'super_admin'}).status_code == 403
        assert client.patch('/api/users/' + admin['id'], headers=admin_headers, json={'full_name': 'No'}).status_code == 403
        assert client.post('/api/users', headers=admin_headers, json={'username': 'escalation', 'full_name': 'Blocked', 'password': password, 'role': 'admin'}).status_code == 403
        assert client.post('/api/users', headers=headers, json={'username': viewer['username'].upper(), 'full_name': 'Duplicate', 'password': password}).status_code == 409
        assert client.patch('/api/users/' + me.json()['id'] + '/status', headers=headers, json={'is_active': False}).status_code == 409
        assert client.patch('/api/users/' + me.json()['id'], headers=headers, json={'role': 'viewer'}).status_code == 409
        renamed = client.patch('/api/users/' + viewer['id'], headers=admin_headers, json={'full_name': 'Renamed Viewer'})
        assert renamed.status_code == 200 and renamed.json()['full_name'] == 'Renamed Viewer'

        project = client.post('/api/projects', headers=headers, json={'name': 'Layer Project', 'status': 'active'}).json()
        path = '/api/projects/' + project['id'] + '/layers'
        assert client.get(path, headers=viewer_headers).json() == []
        for geometry in ('Point', 'LineString', 'Polygon'):
            created_layer = client.post(path, headers=manager_headers, json={'name': geometry + ' Layer', 'geometry_type': geometry, 'style_json': {'color': '#008877'}})
            assert created_layer.status_code == 201, created_layer.text
        layer = created_layer.json()
        layer_path = '/api/layers/' + layer['id']
        assert len(client.get(path, headers=viewer_headers).json()) == 3
        assert client.get('/api/projects/' + project['id'], headers=headers).json()['layer_count'] == 3
        assert client.get(layer_path, headers=viewer_headers).json()['style_json'] == {'color': '#008877'}
        assert client.post(path, headers=viewer_headers, json={'name': 'Denied', 'geometry_type': 'Point'}).status_code == 403
        assert client.patch(layer_path, headers=viewer_headers, json={'name': 'Denied'}).status_code == 403
        assert client.delete(layer_path, headers=viewer_headers).status_code == 403
        assert client.patch(layer_path, headers=manager_headers, json={'name': 'Edited', 'srid': 3857, 'status': 'draft'}).status_code == 200
        for invalid in ({'name': None}, {'srid': 999999}, {'srid': 998998}, {'geometry_type': 'Circle'}, {'style_json': None}):
            assert client.patch(layer_path, headers=headers, json=invalid).status_code == 422
        assert client.post('/api/projects/' + str(uuid4()) + '/layers', headers=headers, json={'name': 'Missing project', 'geometry_type': 'Point'}).status_code == 404
        assert client.delete(layer_path, headers=manager_headers).status_code == 204
        assert client.get(layer_path, headers=headers).status_code == 404
        assert client.get('/api/projects/' + project['id'], headers=headers).json()['layer_count'] == 2
        assert len(client.get(path, headers=headers).json()) == 2

        # Phase 05 feature CRUD, optimistic concurrency and history.
        point_layer = next(item for item in client.get(path, headers=headers).json() if item['geometry_type'] == 'Point')
        feature_path = '/api/layers/' + point_layer['id'] + '/features'
        payload = {'geometry': {'type': 'Point', 'coordinates': [34.466, 31.51]}, 'properties': {'name': 'Valve 1', 'status': 'new'}}
        assert client.post(feature_path, headers=viewer_headers, json=payload).status_code == 403
        created_feature = client.post(feature_path, headers=manager_headers, json=payload)
        assert created_feature.status_code == 201, created_feature.text
        feature = created_feature.json()
        assert feature['version'] == 1 and feature['geometry'] == payload['geometry']
        assert client.get(feature_path, headers=viewer_headers).json()[0]['id'] == feature['id']
        direct_path = '/api/features/' + feature['id']
        updated_feature = client.patch(direct_path, headers=manager_headers, json={'version': 1, 'properties': {'name': 'Valve 1 reviewed'}})
        assert updated_feature.status_code == 200, updated_feature.text
        assert updated_feature.json()['version'] == 2
        assert client.patch(direct_path, headers=manager_headers, json={'version': 1, 'properties': {}}).status_code == 409
        assert client.patch(direct_path, headers=manager_headers, json={'version': 2, 'geometry': {'type': 'Polygon', 'coordinates': [[[0, 0], [1, 0], [0, 1], [0, 0]]]}}).status_code == 422
        assert [item['version'] for item in client.get(direct_path + '/versions', headers=viewer_headers).json()] == [2, 1]
        assert [item['operation'] for item in client.get(direct_path + '/changes', headers=viewer_headers).json()] == ['update', 'create']
        assert client.delete(direct_path + '?version=1', headers=manager_headers).status_code == 409
        assert client.delete(direct_path + '?version=2', headers=manager_headers).status_code == 204
        assert client.get(direct_path, headers=headers).status_code == 404
        assert client.get(feature_path, headers=headers).json() == []
        deleted_versions = client.get(direct_path + '/versions', headers=headers).json()
        assert [item['version'] for item in deleted_versions] == [3, 2, 1]
        assert client.get(direct_path + '/changes', headers=headers).json()[0]['operation'] == 'delete'

        # Existing features (including soft-deleted ones) prevent incompatible
        # layer metadata changes; archiving retains the actual PostGIS row.
        from app.db.session import SessionLocal
        from app.models.core import Feature, Layer
        from sqlalchemy import select, func
        from uuid import UUID
        populated_id = client.get(path, headers=headers).json()[0]['id']

        async def add_feature():
            async with SessionLocal() as db:
                db.add(Feature(project_id=UUID(project['id']), layer_id=UUID(populated_id),
                               geometry='SRID=4326;POINT(34.4 31.5)', properties={}))
                await db.commit()

        client.portal.call(add_feature)
        populated_path = '/api/layers/' + populated_id
        assert client.patch(populated_path, headers=headers, json={'srid': 3857}).status_code == 409
        assert client.patch(populated_path, headers=headers, json={'geometry_type': 'Polygon'}).status_code == 409
        assert client.delete(populated_path, headers=headers).status_code == 204

        async def verify_retained():
            async with SessionLocal() as db:
                assert (await db.get(Layer, UUID(populated_id))).status == 'archived'
                assert await db.scalar(select(func.count(Feature.id)).where(Feature.layer_id == UUID(populated_id))) == 2

        client.portal.call(verify_retained)

        # Existing access tokens use the current database role, not stale claims.
        assert client.patch('/api/users/' + manager['id'], headers=headers, json={'role': 'viewer'}).status_code == 200
        assert client.post(path, headers=manager_headers, json={'name': 'Denied after demotion', 'geometry_type': 'Point'}).status_code == 403
        assert client.patch('/api/users/' + viewer['id'] + '/status', headers=admin_headers, json={'is_active': False}).status_code == 200
        assert client.get('/api/auth/me', headers=viewer_headers).status_code == 401
        assert client.post('/api/auth/refresh', json={'refresh_token': viewer_tokens['refresh_token']}).status_code == 401
        assert client.post('/api/auth/login', json={'username': viewer['username'], 'password': password}).status_code == 401
        assert client.patch('/api/users/' + viewer['id'] + '/status', headers=headers, json={'is_active': True}).status_code == 200
        assert client.post('/api/auth/login', json={'username': viewer['username'], 'password': password}).status_code == 200
        remaining = client.get(path, headers=headers).json()[0]['id']
        assert client.delete('/api/projects/' + project['id'], headers=headers).status_code == 204
        assert client.get(path, headers=headers).status_code == 404
        assert client.patch('/api/layers/' + remaining, headers=headers, json={'name': 'Archived parent'}).status_code == 404

