# My Field

Local-first Web GIS platform designed for a future offline Android field application.

## Phase 1 implemented

- React + TypeScript + Vite shell
- RTL professional dashboard
- Initial MapLibre workspace
- FastAPI backend
- PostgreSQL/PostGIS Docker service
- UUID feature model
- Feature versioning model
- Change log model
- Health endpoint
- Projects endpoint
- Docker Compose production skeleton

## Local run (target machine)

```bash
cp .env.example .env
docker compose up -d --build
```

Open:

- Web: http://localhost:8080
- API docs: http://localhost:8000/docs
- API health: http://localhost:8000/api/health

## Development web

```bash
cd web
npm install
npm run dev
```

## Important

PostgreSQL must remain private. Do not expose port 5432 to the public internet.

## Preview deployment

The `main` branch automatically builds the `web/` frontend and deploys it to GitHub Pages in preview mode. The preview uses demo data only; PostgreSQL/PostGIS remains on the local My Field server.
