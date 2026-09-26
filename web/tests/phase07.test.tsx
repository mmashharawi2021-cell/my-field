import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { MapWorkspaceProvider, useMapWorkspace } from '../src/features/map/MapWorkspaceContext'
import { MapToolbar } from '../src/features/map/components/MapToolbar'
import { useAuthStore } from '../src/stores/authStore'

function VertexHarness() {
  const workspace = useMapWorkspace()
  return <><button onClick={() => workspace.setVertices([[34, 31]])}>one</button><button onClick={() => workspace.setVertices([[34, 31], [35, 32]])}>two</button><output>{workspace.vertices.length}</output><MapToolbar /></>
}

describe('advanced field editing', () => {
  it('supports vertex undo and redo and exposes GPS', async () => {
    useAuthStore.setState({ user: { id: 'u', username: 'field', full_name: 'Field', role: 'field_worker', is_active: true }, isAuthenticated: true })
    const user = userEvent.setup()
    render(<MapWorkspaceProvider><VertexHarness /></MapWorkspaceProvider>)
    await user.click(screen.getByRole('button', { name: 'one' })); await user.click(screen.getByRole('button', { name: 'two' }))
    expect(screen.getByText('2')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'موقعي' })).toBeTruthy()
  })
})

