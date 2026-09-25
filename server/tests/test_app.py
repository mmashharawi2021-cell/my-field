from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def test_root() -> None:
    response = client.get("/")

    assert response.status_code == 200
    body = response.json()
    assert body["name"] == "My Field API"
    assert body["version"] == "0.2.0"


def test_projects_require_authentication() -> None:
    response = client.get("/api/projects")

    assert response.status_code == 401
