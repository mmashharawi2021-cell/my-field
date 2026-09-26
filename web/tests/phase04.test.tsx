import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { LayerForm } from '../src/features/layers/components/LayerForm'
import { UserForm } from '../src/features/users/components/UserForm'
import UsersPage from '../src/pages/UsersPage'
import { LayerPanel } from '../src/features/map/components/LayerPanel'
import { useAuthStore } from '../src/stores/authStore'
import { session } from '../src/services/session'
import { MapWorkspaceProvider } from '../src/features/map/MapWorkspaceContext'

const actor = { id: 'actor', username: 'admin', full_name: 'Test Admin', role: 'super_admin', is_active: true }

beforeEach(() => {
  vi.unstubAllEnvs(); vi.unstubAllGlobals(); vi.resetModules()
  useAuthStore.setState({ user: actor, isAuthenticated: true })
})

describe('forms', () => {
  it('rejects invalid style JSON and submits a valid layer', async () => {
    const save = vi.fn().mockResolvedValue(undefined)
    const user = userEvent.setup()
    render(<LayerForm layer={null} busy={false} onClose={() => {}} onSave={save} />)
    await user.type(screen.getByLabelText('اسم الطبقة'), 'Water points')
    const style = screen.getByLabelText('نمط الطبقة (JSON)')
    await user.clear(style); await user.type(style, '[[]')
    await user.click(screen.getByRole('button', { name: 'حفظ' }))
    expect(screen.getByRole('alert').textContent).toContain('JSON')
    expect(save).not.toHaveBeenCalled()
    await user.clear(style); await user.type(style, '{{"color":"green"}')
    await user.click(screen.getByRole('button', { name: 'حفظ' }))
    expect(save).toHaveBeenCalledWith(expect.objectContaining({ geometry_type: 'Point', srid: 4326, style_json: { color: 'green' } }))
  })

  it('does not offer privileged roles to an administrator', () => {
    render(<UserForm user={null} actor={{ ...actor, role: 'admin' }} roles={[
      { code: 'super_admin', name: 'Super Admin', description: null },
      { code: 'admin', name: 'Admin', description: null },
      { code: 'viewer', name: 'Viewer', description: null },
    ]} busy={false} onClose={() => {}} onSave={vi.fn()} />)
    expect(screen.queryByRole('option', { name: 'Super Admin' })).toBeNull()
    expect(screen.queryByRole('option', { name: 'Admin' })).toBeNull()
    expect(screen.getByRole('option', { name: 'Viewer' })).toBeTruthy()
  })
})

it('redirects a viewer away from users without fetching user records', async () => {
  useAuthStore.setState({ user: { ...actor, role: 'viewer' } })
  const fetch = vi.fn(); vi.stubGlobal('fetch', fetch)
  render(<QueryClientProvider client={new QueryClient()}><MemoryRouter initialEntries={['/users']}><Routes><Route path="/users" element={<UsersPage />} /><Route path="/" element={<p>Home</p>} /></Routes></MemoryRouter></QueryClientProvider>)
  expect(await screen.findByText('Home')).toBeTruthy()
  expect(fetch).not.toHaveBeenCalled()
})

it('switches project layer queries and hides writes for viewers', async () => {
  useAuthStore.setState({ user: { ...actor, role: 'viewer' } })
  const fetch = vi.fn(async (url: string) => new Response(JSON.stringify(
    url.endsWith('/projects') ? [{ id: 'one', name: 'Project One' }, { id: 'two', name: 'Project Two' }] :
    [{ id: url, name: url.includes('/one/') ? 'Layer One' : 'Layer Two', geometry_type: 'Point', srid: 4326, status: 'active' }]
  ), { status: 200 }))
  vi.stubGlobal('fetch', fetch)
  render(<QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}><MemoryRouter><MapWorkspaceProvider><LayerPanel /></MapWorkspaceProvider></MemoryRouter></QueryClientProvider>)
  expect(await screen.findByText('Layer One')).toBeTruthy()
  expect(screen.queryByRole('button', { name: 'إضافة طبقة' })).toBeNull()
  await userEvent.selectOptions(screen.getByRole('combobox'), 'two')
  expect(await screen.findByText('Layer Two')).toBeTruthy()
  expect(screen.queryByText('Layer One')).toBeNull()
})

it('preview mutations never send credentials or data to a server', async () => {
  vi.stubEnv('VITE_PREVIEW_MODE', 'true')
  const fetch = vi.fn(); vi.stubGlobal('fetch', fetch)
  const { usersApi } = await import('../src/services/users')
  const { layersApi } = await import('../src/services/layers')
  const created = await usersApi.create({ username: 'test.preview', full_name: 'Preview Test', role: 'viewer', password: 'not-retained-123' })
  expect(created).not.toHaveProperty('password')
  await usersApi.status(created.id, false)
  expect((await usersApi.list()).find((user) => user.id === created.id)?.is_active).toBe(false)
  const layer = await layersApi.create('p-2', { name: 'Preview Layer', geometry_type: 'Polygon', srid: 4326, status: 'active', style_json: {} })
  expect(await layersApi.list('p-1')).not.toContainEqual(layer)
  await layersApi.archive(layer.id)
  expect(await layersApi.list('p-2')).toHaveLength(0)
  expect(fetch).not.toHaveBeenCalled()
})

it('clearing a revoked session clears the authenticated UI state', async () => {
  session.clear()
  await waitFor(() => expect(useAuthStore.getState().isAuthenticated).toBe(false))
})
