import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MapWorkspaceProvider, useMapWorkspace } from '../src/features/map/MapWorkspaceContext'
import { MapToolbar } from '../src/features/map/components/MapToolbar'
import { useAuthStore } from '../src/stores/authStore'

const editor = { id: 'editor', username: 'field', full_name: 'Field User', role: 'field_worker', is_active: true }

function WorkspaceSetup() {
  const workspace = useMapWorkspace()
  return <><button onClick={() => workspace.setActiveLayer({ id: 'layer', project_id: 'p-1', name: 'Points', geometry_type: 'Point', srid: 4326, status: 'active', style_json: {}, created_at: new Date().toISOString() })}>setup</button><MapToolbar /></>
}

beforeEach(() => {
  vi.unstubAllEnvs(); vi.resetModules()
  useAuthStore.setState({ user: editor, isAuthenticated: true })
})

describe('feature preview lifecycle', () => {
  it('creates, versions, updates and archives without network access', async () => {
    vi.stubEnv('VITE_PREVIEW_MODE', 'true')
    const fetch = vi.fn(); vi.stubGlobal('fetch', fetch)
    const { featuresApi } = await import('../src/services/features')
    const feature = await featuresApi.create('demo-layer', { type: 'Point', coordinates: [34.47, 31.52] }, { name: 'New point' })
    expect(feature.version).toBe(1)
    const updated = await featuresApi.update(feature, { properties: { name: 'Updated point' } })
    expect(updated.version).toBe(2)
    expect((await featuresApi.versions(feature.id)).map((item) => item.version)).toEqual([2, 1])
    expect((await featuresApi.changes(feature.id)).map((item) => item.operation)).toEqual(['update', 'create'])
    await featuresApi.archive(updated)
    expect((await featuresApi.list('demo-layer')).some((item) => item.id === feature.id)).toBe(false)
    expect(fetch).not.toHaveBeenCalled()
  })
})

it('shows drawing controls only to feature editors with an active layer', async () => {
  const user = userEvent.setup()
  render(<MapWorkspaceProvider><WorkspaceSetup /></MapWorkspaceProvider>)
  expect(screen.getByRole('button', { name: /رسم/ }).hasAttribute('disabled')).toBe(true)
  await user.click(screen.getByRole('button', { name: 'setup' }))
  expect(screen.getByRole('button', { name: 'رسم نقطة' }).hasAttribute('disabled')).toBe(false)
  await user.click(screen.getByRole('button', { name: 'رسم نقطة' }))
  expect(screen.getByText('انقر لتحديد الموقع')).toBeTruthy()
  expect(screen.getByRole('button', { name: 'إلغاء' })).toBeTruthy()
})

it('keeps drawing controls hidden from viewers', async () => {
  useAuthStore.setState({ user: { ...editor, role: 'viewer' } })
  render(<MapWorkspaceProvider><WorkspaceSetup /></MapWorkspaceProvider>)
  await userEvent.click(screen.getByRole('button', { name: 'setup' }))
  expect(screen.queryByRole('button', { name: /رسم نقطة/ })).toBeNull()
})
