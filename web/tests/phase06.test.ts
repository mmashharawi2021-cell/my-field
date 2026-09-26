import { beforeEach, describe, expect, it, vi } from 'vitest'
import { session } from '../src/services/session'

const user = { id: 'offline-user', username: 'field', full_name: 'Field User', role: 'field_worker', is_active: true }

beforeEach(() => {
  vi.stubEnv('VITE_PREVIEW_MODE', 'false')
  Object.defineProperty(navigator, 'onLine', { configurable: true, value: false })
  session.setTokens('access', 'refresh'); session.setUser(user)
})

describe('offline feature queue', () => {
  it('creates and updates a feature locally while disconnected', async () => {
    const { featuresApi } = await import('../src/services/features')
    const { useSyncStore } = await import('../src/stores/syncStore')
    const created = await featuresApi.create('offline-layer', { type: 'Point', coordinates: [34.4, 31.5] }, { name: 'offline' })
    expect(created.sync_status).toBe('pending')
    const updated = await featuresApi.update(created, { properties: { name: 'edited offline' } })
    expect(updated.version).toBe(2)
    expect((await featuresApi.list('offline-layer'))[0].properties.name).toBe('edited offline')
    expect(useSyncStore.getState().pending).toBe(2)
  })
})

