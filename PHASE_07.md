# Phase 07 — Advanced field tools

Phase 07 improves geometry editing for touch and desktop field work. Existing
geometry opens as editable vertices. Vertices can be dragged, added with a map
click, removed with a double click, and restored through undo and redo before
the geometry is saved through the normal versioned feature API.

The map can request a high-accuracy device position, display its accuracy and
center on it. When drawing a point, the GPS position can be used directly.
Browser permission remains under the user's control.

Layer style configuration can contain `form_fields`, turning raw JSON attributes
into validated text, number, date and select controls. Image attachments are
limited to three files of 1.5 MB each and live in the feature properties, so
they use the existing per-user offline cache, version history and sync queue.

The web client now ships a manifest, maskable icon and same-origin service
worker. This makes the workspace installable and retains the application shell
for offline startup. Real data remains confined to IndexedDB and the local
FastAPI/PostGIS deployment; the Pages build still contains demo data only.

