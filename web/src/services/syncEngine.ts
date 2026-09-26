import { ApiError } from './api'
import { featureRemote } from './featureRemote'
import { offlineDatabase } from './offlineDatabase'
import { session } from './session'
import { registerSyncController, setSyncSnapshot } from '../stores/syncStore'
import type { MapFeature } from '../types/feature'
import type { SyncOperation } from '../types/sync'

let running: Promise<void> | null = null
const userId = () => session.getUser()?.id ?? null
const notify = () => typeof window !== 'undefined' && window.dispatchEvent(new Event('myfield:sync-change'))

async function replaceCachedFeature(user: string, layerId: string, feature: MapFeature | null, id: string) {
  const cached = await offlineDatabase.getLayer(user, layerId)
  if (!cached) return
  const features = feature ? [...cached.features.filter((item) => item.id !== id), feature] : cached.features.filter((item) => item.id !== id)
  await offlineDatabase.putLayer({ ...cached, features, savedAt: new Date().toISOString() })
}

export async function refreshSyncStatus() {
  const user = userId()
  const queue = user ? await offlineDatabase.listQueue(user) : []
  setSyncSnapshot({
    online: typeof navigator === 'undefined' ? true : navigator.onLine,
    pending: queue.filter((item) => item.status === 'pending').length,
    failed: queue.filter((item) => item.status === 'failed').length,
    conflicts: queue.filter((item) => item.status === 'conflict').length,
  })
}

async function runSync() {
  const user = userId()
  if (!user || (typeof navigator !== 'undefined' && !navigator.onLine)) { await refreshSyncStatus(); return }
  setSyncSnapshot({ syncing: true, online: true })
  const queue = await offlineDatabase.listQueue(user)
  for (const operation of queue.filter((item) => item.status !== 'conflict')) {
    try {
      let feature: MapFeature | null = null
      if (operation.kind === 'create') feature = await featureRemote.create(operation.featureId, operation.layerId, operation.geometry!, operation.properties ?? {})
      if (operation.kind === 'update') feature = await featureRemote.update(operation.featureId, operation.version, { geometry: operation.geometry, properties: operation.properties })
      if (operation.kind === 'delete') await featureRemote.archive(operation.featureId, operation.version)
      await replaceCachedFeature(user, operation.layerId, feature, operation.featureId)
      await offlineDatabase.deleteOperation(operation.id)
    } catch (error) {
      const conflict = error instanceof ApiError && error.status === 409
      await offlineDatabase.putOperation({ ...operation, attempts: operation.attempts + 1, status: conflict ? 'conflict' : 'failed', error: error instanceof Error ? error.message : 'تعذرت المزامنة' })
      if (!conflict && error instanceof TypeError) break
    }
  }
  setSyncSnapshot({ syncing: false, lastSyncedAt: new Date().toISOString() })
  await refreshSyncStatus(); notify()
}

export function syncNow() {
  if (!running) running = runSync().finally(() => { running = null })
  return running
}

export async function enqueue(operation: SyncOperation) {
  await offlineDatabase.putOperation(operation)
  await refreshSyncStatus(); notify()
}

registerSyncController({ refresh: refreshSyncStatus, syncNow })

export function startSyncEngine() {
  if (typeof window === 'undefined') return () => {}
  const online = () => { setSyncSnapshot({ online: true }); void syncNow() }
  const offline = () => { setSyncSnapshot({ online: false }) }
  window.addEventListener('online', online); window.addEventListener('offline', offline)
  void refreshSyncStatus(); if (navigator.onLine) void syncNow()
  return () => { window.removeEventListener('online', online); window.removeEventListener('offline', offline) }
}

