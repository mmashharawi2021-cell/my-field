# Phase 06 — Offline workspace and synchronization

Phase 06 adds a user-isolated IndexedDB workspace to the React client. Projects,
layers and feature collections read successfully from the local FastAPI server
are retained for field use when the connection disappears.

Feature creates, edits and deletes made offline are applied immediately to the
local map and appended to an ordered synchronization queue. The queue resumes
when the browser emits an online event or the user selects **Sync now**.

Each offline create receives a client UUID. FastAPI accepts that UUID and treats
a repeated create by the same user in the same layer as the same operation,
making retries safe if a response is lost. Updates and deletes continue to use
the server feature version. HTTP 409 responses are retained as conflicts and are
never overwritten automatically.

The map and dashboard expose connection, pending, failed and conflict state.
Cached feature details identify pending records and defer remote history until
the operation has synchronized. All IndexedDB keys include the authenticated
user id so cached work cannot be mixed between accounts.

The GitHub Pages preview continues to use its synthetic in-memory dataset and
does not connect to or cache data from a local My Field server.

