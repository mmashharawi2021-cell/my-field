import type { UserProfile } from '../types/auth'
import type { Layer, LayerInput } from '../types/layer'
import type { Role, UserInput, UserUpdate } from '../types/user'

// Ephemeral, synthetic records only. Passwords are never retained in preview.
const roles: Role[] = ['super_admin', 'admin', 'gis_manager', 'supervisor', 'reviewer', 'field_worker', 'viewer']
  .map((code) => ({ code: code as Role['code'], name: code, description: null }))
let users: UserProfile[] = [
  { id: 'preview-user', username: 'preview@myfield.local', full_name: 'My Field Preview', role: 'super_admin', is_active: true },
  { id: 'demo-viewer', username: 'demo.viewer', full_name: 'مستخدم تجريبي', role: 'viewer', is_active: true },
]
let layers: Layer[] = [{ id: 'demo-layer', project_id: 'p-1', name: 'مواقع تجريبية', geometry_type: 'Point', srid: 4326, status: 'active', style_json: {}, created_at: new Date().toISOString() }]

export const managementPreview = {
  roles: async () => structuredClone(roles),
  users: async () => structuredClone(users),
  createUser: async ({ username, full_name, role }: UserInput) => {
    if (users.some((user) => user.username === username.trim().toLowerCase())) throw new Error('اسم المستخدم موجود بالفعل')
    const user = { id: crypto.randomUUID(), username: username.trim().toLowerCase(), full_name, role, is_active: true }
    users = [...users, user]
    return structuredClone(user)
  },
  updateUser: async (id: string, input: UserUpdate | { is_active: boolean }) => {
    const user = users.find((item) => item.id === id)
    if (!user) throw new Error('المستخدم غير موجود')
    if (id === 'preview-user' && (('is_active' in input && !input.is_active) || ('role' in input && input.role !== user.role))) throw new Error('لا يمكنك تعطيل حسابك أو تغيير دورك')
    Object.assign(user, input)
    return structuredClone(user)
  },
  layers: async (projectId: string) => structuredClone(layers.filter((layer) => layer.project_id === projectId && layer.status !== 'archived')),
  createLayer: async (projectId: string, input: LayerInput) => {
    const layer: Layer = { ...input, id: crypto.randomUUID(), project_id: projectId, created_at: new Date().toISOString() }
    layers = [...layers, layer]
    return structuredClone(layer)
  },
  updateLayer: async (id: string, input: Partial<Layer>) => {
    const layer = layers.find((item) => item.id === id)
    if (!layer) throw new Error('الطبقة غير موجودة')
    Object.assign(layer, input)
    return structuredClone(layer)
  },
}
