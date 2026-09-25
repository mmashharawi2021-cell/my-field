from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def _auth_headers() -> dict[str, str]:
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
    headers = _auth_headers()

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
