import { create } from 'zustand'
import type { SyncSnapshot } from '../types/sync'

type SyncState = SyncSnapshot & { refresh: () => Promise<void>; syncNow: () => Promise<void> }
type Controller = { refresh: () => Promise<void>; syncNow: () => Promise<void> }
let controller: Controller = { refresh: async () => {}, syncNow: async () => {} }

export function registerSyncController(value: Controller) { controller = value }

export const useSyncStore = create<SyncState>((set) => ({
  online: typeof navigator === 'undefined' ? true : navigator.onLine,
  syncing: false,
  pending: 0,
  failed: 0,
  conflicts: 0,
  lastSyncedAt: null,
  refresh: () => controller.refresh(),
  syncNow: () => controller.syncNow(),
}))

export function setSyncSnapshot(value: Partial<SyncSnapshot>) { useSyncStore.setState(value) }

