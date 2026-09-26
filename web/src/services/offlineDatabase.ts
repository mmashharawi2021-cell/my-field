import type { CachedLayer, SyncOperation } from '../types/sync'

const DB_NAME = 'my-field-offline-v1'
const DB_VERSION = 2
const memoryLayers = new Map<string, CachedLayer>()
const memoryQueue = new Map<string, SyncOperation>()
const memoryCatalog = new Map<string, unknown>()

function supported() { return typeof indexedDB !== 'undefined' }
function layerKey(userId: string, layerId: string) { return `${userId}:${layerId}` }

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)
    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains('layers')) db.createObjectStore('layers', { keyPath: 'key' })
      if (!db.objectStoreNames.contains('catalog')) db.createObjectStore('catalog', { keyPath: 'key' })
      if (!db.objectStoreNames.contains('queue')) {
        const store = db.createObjectStore('queue', { keyPath: 'id' })
        store.createIndex('userId', 'userId')
      }
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

async function transact<T>(storeName: 'layers' | 'queue' | 'catalog', mode: IDBTransactionMode, run: (store: IDBObjectStore, done: (value: T) => void) => void): Promise<T> {
  const db = await openDatabase()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, mode)
    let value: T
    run(tx.objectStore(storeName), (result) => { value = result })
    tx.onerror = () => reject(tx.error)
    tx.oncomplete = () => { db.close(); resolve(value) }
  })
}

export const offlineDatabase = {
  async getCatalog<T>(key: string): Promise<T | null> {
    if (!supported()) return (memoryCatalog.get(key) as T | undefined) ?? null
    return transact('catalog', 'readonly', (store, done) => { const request = store.get(key); request.onsuccess = () => done(request.result?.value ?? null) })
  },
  async putCatalog<T>(key: string, value: T) {
    if (!supported()) { memoryCatalog.set(key, value); return }
    await transact<void>('catalog', 'readwrite', (store, done) => { store.put({ key, value }); done() })
  },
  async getLayer(userId: string, layerId: string): Promise<CachedLayer | null> {
    const key = layerKey(userId, layerId)
    if (!supported()) return memoryLayers.get(key) ?? null
    return transact('layers', 'readonly', (store, done) => {
      const request = store.get(key); request.onsuccess = () => done(request.result?.value ?? null)
    })
  },
  async putLayer(value: CachedLayer) {
    const key = layerKey(value.userId, value.layerId)
    if (!supported()) { memoryLayers.set(key, value); return }
    await transact<void>('layers', 'readwrite', (store, done) => { store.put({ key, value }); done() })
  },
  async listQueue(userId: string): Promise<SyncOperation[]> {
    if (!supported()) return [...memoryQueue.values()].filter((item) => item.userId === userId).sort((a, b) => a.createdAt.localeCompare(b.createdAt))
    return transact('queue', 'readonly', (store, done) => {
      const request = store.index('userId').getAll(userId)
      request.onsuccess = () => done((request.result as SyncOperation[]).sort((a, b) => a.createdAt.localeCompare(b.createdAt)))
    })
  },
  async putOperation(value: SyncOperation) {
    if (!supported()) { memoryQueue.set(value.id, value); return }
    await transact<void>('queue', 'readwrite', (store, done) => { store.put(value); done() })
  },
  async deleteOperation(id: string) {
    if (!supported()) { memoryQueue.delete(id); return }
    await transact<void>('queue', 'readwrite', (store, done) => { store.delete(id); done() })
  },
}

