import { PREVIEW_MODE } from './api'
import { featureRemote } from './featureRemote'
import { managementPreview } from './managementPreview'
import { offlineDatabase } from './offlineDatabase'
import { enqueue } from './syncEngine'
import { session } from './session'
import type { GeoJsonGeometry, MapFeature } from '../types/feature'
import type { SyncOperation } from '../types/sync'

const now = () => new Date().toISOString()
const uuid = () => crypto.randomUUID()
const currentUser = () => session.getUser()?.id ?? 'anonymous'
const isOffline = () => typeof navigator !== 'undefined' && !navigator.onLine
const networkError = (error: unknown) => error instanceof TypeError

async function cacheLayer(layerId: string, features: MapFeature[]) {
  await offlineDatabase.putLayer({ userId: currentUser(), layerId, features, savedAt: now() })
}
async function cachedFeatures(layerId: string) { return (await offlineDatabase.getLayer(currentUser(), layerId))?.features ?? [] }
async function cacheFeature(feature: MapFeature | null, layerId: string, id: string) {
  const features = (await cachedFeatures(layerId)).filter((item) => item.id !== id)
  if (feature) features.push(feature)
  await cacheLayer(layerId, features)
}
function operation(input: Omit<SyncOperation, 'id' | 'userId' | 'createdAt' | 'attempts' | 'status'>): SyncOperation {
  return { ...input, id: uuid(), userId: currentUser(), createdAt: now(), attempts: 0, status: 'pending' }
}
async function offlineCreate(layerId: string, id: string, geometry: GeoJsonGeometry, properties: Record<string, unknown>) {
  const timestamp = now()
  const feature: MapFeature = { id, project_id: '', layer_id: layerId, geometry, properties, version: 1, created_by: currentUser(), updated_by: currentUser(), created_at: timestamp, updated_at: timestamp, sync_status: 'pending' }
  await cacheFeature(feature, layerId, id)
  await enqueue(operation({ kind: 'create', layerId, featureId: id, version: 0, geometry, properties }))
  return feature
}

export const featuresApi = {
  async list(layerId: string): Promise<MapFeature[]> {
    if (PREVIEW_MODE) return managementPreview.features(layerId)
    if (isOffline()) return cachedFeatures(layerId)
    try { const features = await featureRemote.list(layerId); await cacheLayer(layerId, features); return features }
    catch (error) { const cached = await cachedFeatures(layerId); if (networkError(error) && cached.length) return cached; throw error }
  },
  async create(layerId: string, geometry: GeoJsonGeometry, properties: Record<string, unknown> = {}) {
    if (PREVIEW_MODE) return managementPreview.createFeature(layerId, geometry, properties)
    const id = uuid()
    if (isOffline()) return offlineCreate(layerId, id, geometry, properties)
    try { const feature = await featureRemote.create(id, layerId, geometry, properties); await cacheFeature(feature, layerId, id); return feature }
    catch (error) { if (networkError(error)) return offlineCreate(layerId, id, geometry, properties); throw error }
  },
  async update(feature: MapFeature, input: { geometry?: GeoJsonGeometry; properties?: Record<string, unknown> }) {
    if (PREVIEW_MODE) return managementPreview.updateFeature(feature.id, { version: feature.version, ...input })
    const pending = { ...feature, ...input, version: feature.version + 1, updated_at: now(), updated_by: currentUser(), sync_status: 'pending' as const }
    const queueUpdate = async () => { await cacheFeature(pending, feature.layer_id, feature.id); await enqueue(operation({ kind: 'update', layerId: feature.layer_id, featureId: feature.id, version: feature.version, ...input })); return pending }
    if (isOffline()) return queueUpdate()
    try { const updated = await featureRemote.update(feature.id, feature.version, input); await cacheFeature(updated, feature.layer_id, feature.id); return updated }
    catch (error) { if (networkError(error)) return queueUpdate(); throw error }
  },
  async archive(feature: MapFeature) {
    if (PREVIEW_MODE) return managementPreview.archiveFeature(feature.id, feature.version)
    const queueDelete = async () => { await cacheFeature(null, feature.layer_id, feature.id); await enqueue(operation({ kind: 'delete', layerId: feature.layer_id, featureId: feature.id, version: feature.version })) }
    if (isOffline()) return queueDelete()
    try { await featureRemote.archive(feature.id, feature.version); await cacheFeature(null, feature.layer_id, feature.id) }
    catch (error) { if (networkError(error)) return queueDelete(); throw error }
  },
  versions: (featureId: string) => PREVIEW_MODE ? managementPreview.featureVersions(featureId) : featureRemote.versions(featureId),
  changes: (featureId: string) => PREVIEW_MODE ? managementPreview.featureChanges(featureId) : featureRemote.changes(featureId),
}

