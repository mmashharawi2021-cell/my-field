# My Field

Local-first Web GIS platform designed for a future offline Android field application.

## Current status

### Phase 01 — UI foundation
- React + TypeScript + Vite
- RTL responsive UI
- Mobile bottom navigation
- MapLibre workspace
- GitHub Pages preview
- Modular component/feature architecture

### Phase 02 — Database, Authentication & Project CRUD
- PostgreSQL + PostGIS
- Alembic migrations
- Roles and users tables
- Seeded RBAC roles
- Argon2 password hashing
- JWT access + refresh tokens
- /api/auth/login
- /api/auth/refresh
- /api/auth/me
- Protected Project CRUD
- Project archive instead of hard delete
- Backend unit tests
- PostGIS integration CI

## Local run

1. Copy the environment template:

```bash
cp .env.example .env
```

2. Edit .env and replace every CHANGE_ME value with a strong secret/password.

3. Build and start:

```bash
docker compose up -d --build
```

The API container automatically runs:

1. alembic upgrade head
2. role seed
3. initial super-admin creation when INITIAL_ADMIN_PASSWORD is set
4. FastAPI startup

Open:

- Web: http://localhost:8080
- API docs: http://localhost:8000/docs
- API health: http://localhost:8000/api/health

## Authentication

Initial administrator values are read only from local environment variables:

- INITIAL_ADMIN_USERNAME
- INITIAL_ADMIN_FULL_NAME
- INITIAL_ADMIN_PASSWORD

Do not commit real passwords, JWT secrets, or database passwords.

## Development web

```bash
cd web
npm install
npm run dev
```

## Security rules

- PostgreSQL stays local/private.
- Never expose port 5432 to the public internet.
- Web and Android communicate with FastAPI only.
- Keep JWT_SECRET outside Git.
- Change every placeholder in .env before real deployment.

## Preview deployment

The main branch automatically builds the web frontend and deploys it to GitHub Pages in preview mode.

The GitHub Pages preview contains demo data only. PostgreSQL/PostGIS, authentication, and real project data remain on the local My Field server.

See:

- PHASE_01.md
- PHASE_02.md
- docs/FRONTEND_ARCHITECTURE.md
