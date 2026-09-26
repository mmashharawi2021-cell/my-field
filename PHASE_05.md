# Phase 05 — Spatial features, editing and history

Phase 05 turns project layers into editable GIS datasets while preserving the
local-first boundary: real geometries and attributes live in the local
PostgreSQL/PostGIS database and are accessed only through FastAPI.

## Feature API

- `GET/POST /api/layers/{layer_id}/features`
- `GET/PATCH/DELETE /api/features/{feature_id}`
- `GET /api/features/{feature_id}/versions`
- `GET /api/features/{feature_id}/changes`

All geometry exchanged with clients is GeoJSON in WGS84 (EPSG:4326). The API
validates coordinate bounds, geometry shape, PostGIS validity and compatibility
with the owning layer. Only active projects and layers are accessible.

Authenticated users can read features. `super_admin`, `admin`, `gis_manager`,
`supervisor` and `field_worker` can create, update and soft-delete them.
`reviewer` and `viewer` are read-only.

PATCH and DELETE require the version last read by the client. A stale version
returns HTTP 409 with the current version, preventing silent overwrites.
Every successful mutation writes a complete `FeatureVersion` snapshot and a
`ChangeLog` entry in the same database transaction. DELETE increments the
version and sets `deleted_at`; geometry and history remain stored locally.

## Map workflow

- Choose a project and active layer.
- Display Point, LineString and Polygon features from PostGIS through a GeoJSON
  map source, using the layer color when present in `style_json`.
- Draw points with one click. Draw lines and polygons with successive clicks,
  then use **Finish drawing**.
- Select a map feature to inspect its properties, version and change history.
- Edit JSON properties, redraw geometry, or soft-delete the selected feature.
- The workflow remains usable on mobile; feature details appear below the map.

The Pages preview uses synthetic, in-memory features. Preview changes reset on
reload and never contact the local API or retain real field data.

## Verification

Backend unit tests cover authentication, RBAC and strict geometry payloads.
PostGIS integration CI covers create/read/update/delete, geometry type checks,
history snapshots, change logs and stale-version conflicts. Frontend tests cover
preview lifecycle and editor/viewer controls, followed by normal and preview
production builds.
