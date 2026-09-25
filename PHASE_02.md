# Phase 02 — Database, Authentication & Project CRUD

## Scope

This phase turns the My Field backend from a structural prototype into an authenticated local API.

## Implemented

- Alembic migration foundation.
- Initial PostGIS database migration.
- Roles and users tables.
- Seven seeded roles.
- Optional first super-admin seed from environment variables.
- Argon2 password hashing.
- JWT access tokens.
- JWT refresh tokens.
- Bearer authentication dependency.
- Role-based route guard.
- /api/auth/login.
- /api/auth/refresh.
- /api/auth/me.
- Protected Projects API.
- Project create/read/update/archive.
- Project service layer separated from route layer.
- Backend CI workflow.
- Security and route smoke tests.
- Docker startup runs migrations and seed before FastAPI.

## Roles

- super_admin
- admin
- gis_manager
- supervisor
- reviewer
- field_worker
- viewer

## First local run

Create .env from .env.example and replace every placeholder secret.

Then run:

docker compose up -d --build

The server automatically:

1. waits for PostGIS;
2. runs alembic upgrade head;
3. seeds roles;
4. creates the first super-admin when INITIAL_ADMIN_PASSWORD is set;
5. starts FastAPI.

## API endpoints

POST   /api/auth/login
POST   /api/auth/refresh
GET    /api/auth/me

GET    /api/projects
POST   /api/projects
GET    /api/projects/{id}
PATCH  /api/projects/{id}
DELETE /api/projects/{id}

DELETE archives a project instead of physically deleting it.

## Next

- Frontend Login/session flow.
- Users management.
- Layer CRUD.
- Feature CRUD.
- Automatic FeatureVersion snapshots.
- ChangeLog writes.
