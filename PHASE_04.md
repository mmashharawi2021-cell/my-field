# Phase 04 — Users, roles and project layers

The existing React/TypeScript/Vite and FastAPI architecture is preserved. All
real records stay in the local PostgreSQL/PostGIS database. No new schema is
required: this phase uses the users, roles, layers and features tables created
by migration 0001.

## Users and RBAC

- `GET /api/roles`: authenticated role catalogue.
- `GET /api/users`, `POST /api/users`, `PATCH /api/users/{id}` and
  `PATCH /api/users/{id}/status`: administrator-only account management.
- Super administrators manage all accounts. Administrators manage only
  non-administrator accounts and cannot assign admin or super_admin.
- Users cannot disable themselves or change their own role. Account updates
  lock actor/target rows in a stable order and recheck the current actor.
- Usernames normalize to lowercase, duplicates return 409, passwords are
  Argon2-hashed and never included in profiles. New passwords require 12–256
  characters and preserve whitespace exactly.
- Disabled accounts fail login, refresh and authenticated requests. Every
  authenticated request reads the current database role. The UI refreshes its
  profile periodically, hides unauthorized actions and clears cached records
  when account/role/session changes. Backend checks remain authoritative.

## Layers

- `GET/POST /api/projects/{project_id}/layers`
- `GET/PATCH/DELETE /api/layers/{id}`
- All active authenticated accounts can read shared project layers. There is
  no project membership model in this phase. Writes require super_admin,
  admin or gis_manager.
- Point, LineString (Line in the UI), Polygon; PostGIS-registered SRIDs;
  draft/active status; object-valued style JSON; trimmed nonblank names.
- DELETE archives instead of removing rows. Archived layers are excluded from
  lists and project counts. Archived projects reject layer access and writes.
- Geometry type/SRID cannot change when a layer already contains features,
  including soft-deleted features. Style JSON is metadata and is not executed.
- Map sidebar loads layers for the selected project. Project cards open that
  project's map. Create/edit/archive dialogs and the sidebar work on mobile.
- Feature geometry rendering, editing, versioning and synchronization are
  explicitly the next phase. This is local-server-first, not a completed
  offline browser synchronization implementation. Basemap tiles still require
  an internet connection.

## Public preview

GitHub Pages builds with `VITE_PREVIEW_MODE=true`, using synthetic in-memory
users/layers/projects without contacting the API. Demo passwords are never
retained. Reloading resets demo edits. No database credentials or local data
are included. The local deployment builds without this flag.

## Verification

```sh
cd server
pip install -e '.[dev]'
pytest -q tests/test_security.py tests/test_app.py tests/test_phase04.py
# With an isolated, seeded local PostGIS database:
alembic upgrade head
python -m app.db.seed
pytest -q tests/test_integration.py

cd ../web
npm ci
npm test
npm run build
VITE_PREVIEW_MODE=true npm run build
```

Backend CI covers auth, RBAC, validation, real PostGIS layer persistence,
archival, populated-layer protections, user lifecycle, privilege escalation,
and current-role enforcement with already-issued tokens. Frontend CI tests
forms, route guards, project switching, revoked sessions and preview network
isolation, then builds both modes. Pages tests before deploying.

Integration tests create synthetic records and should only run against a
dedicated test database with the CI administrator fixture.
