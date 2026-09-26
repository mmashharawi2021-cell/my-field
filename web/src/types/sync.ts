import type { GeoJsonGeometry, MapFeature } from './feature'

export type SyncOperation = {
  id: string
  userId: string
  kind: 'create' | 'update' | 'delete'
  layerId: string
  featureId: string
  version: number
  geometry?: GeoJsonGeometry
  properties?: Record<string, unknown>
  createdAt: string
  attempts: number
  status: 'pending' | 'failed' | 'conflict'
  error?: string
}

export type CachedLayer = { userId: string; layerId: string; features: MapFeature[]; savedAt: string }

export type SyncSnapshot = {
  online: boolean
  syncing: boolean
  pending: number
  failed: number
  conflicts: number
  lastSyncedAt: string | null
}

