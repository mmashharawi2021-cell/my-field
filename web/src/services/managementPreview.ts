import type { UserProfile } from '../types/auth'
import type { Layer, LayerInput } from '../types/layer'
import type { Role, UserInput, UserUpdate } from '../types/user'
import type { FeatureChange, FeatureVersion, GeoJsonGeometry, MapFeature } from '../types/feature'

// Ephemeral, synthetic records only. Passwords are never retained in preview.
const roles: Role[] = ['super_admin', 'admin', 'gis_manager', 'supervisor', 'reviewer', 'field_worker', 'viewer']
  .map((code) => ({ code: code as Role['code'], name: code, description: null }))
let users: UserProfile[] = [
  { id: 'preview-user', username: 'preview@myfield.local', full_name: 'My Field Preview', role: 'super_admin', is_active: true },
  { id: 'demo-viewer', username: 'demo.viewer', full_name: 'مستخدم تجريبي', role: 'viewer', is_active: true },
]
let layers: Layer[] = [{ id: 'demo-layer', project_id: 'p-1', name: 'مواقع تجريبية', geometry_type: 'Point', srid: 4326, status: 'active', style_json: {}, created_at: new Date().toISOString() }]
const now = new Date().toISOString()
let features: MapFeature[] = [
  { id: 'demo-feature-1', project_id: 'p-1', layer_id: 'demo-layer', geometry: { type: 'Point', coordinates: [34.466, 31.51] }, properties: { name: 'نقطة تجريبية', status: 'new' }, version: 1, created_by: 'preview-user', updated_by: 'preview-user', created_at: now, updated_at: now },
]
const versions = new Map<string, FeatureVersion[]>([['demo-feature-1', [{ version: 1, geometry: features[0].geometry, properties: features[0].properties, changed_by: 'preview-user', changed_at: now }]]])
const changes = new Map<string, FeatureChange[]>([['demo-feature-1', [{ id: 1, operation: 'create', version: 1, payload: { layer_id: 'demo-layer' }, changed_by: 'preview-user', changed_at: now }]]])

function recordPreview(feature: MapFeature, operation: FeatureChange['operation']) {
  const changed_at = new Date().toISOString()
  versions.set(feature.id, [{ version: feature.version, geometry: structuredClone(feature.geometry), properties: structuredClone(feature.properties), changed_by: 'preview-user', changed_at }, ...(versions.get(feature.id) ?? [])])
  changes.set(feature.id, [{ id: Date.now(), operation, version: feature.version, payload: { layer_id: feature.layer_id }, changed_by: 'preview-user', changed_at }, ...(changes.get(feature.id) ?? [])])
}

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
  features: async (layerId: string) => structuredClone(features.filter((feature) => feature.layer_id === layerId)),
  createFeature: async (layerId: string, geometry: GeoJsonGeometry, properties: Record<string, unknown>) => {
    const layer = layers.find((item) => item.id === layerId)
    if (!layer) throw new Error('الطبقة غير موجودة')
    const timestamp = new Date().toISOString()
    const feature: MapFeature = { id: crypto.randomUUID(), project_id: layer.project_id, layer_id: layerId, geometry, properties, version: 1, created_by: 'preview-user', updated_by: 'preview-user', created_at: timestamp, updated_at: timestamp }
    features = [...features, feature]; recordPreview(feature, 'create'); return structuredClone(feature)
  },
  updateFeature: async (id: string, input: { version: number; geometry?: GeoJsonGeometry; properties?: Record<string, unknown> }) => {
    const feature = features.find((item) => item.id === id)
    if (!feature) throw new Error('المعلم غير موجود')
    if (feature.version !== input.version) throw new Error('المعلم يحتوي على نسخة أحدث')
    if (input.geometry) feature.geometry = input.geometry
    if (input.properties) feature.properties = input.properties
    feature.version += 1; feature.updated_at = new Date().toISOString(); recordPreview(feature, 'update')
    return structuredClone(feature)
  },
  archiveFeature: async (id: string, version: number) => {
    const feature = features.find((item) => item.id === id)
    if (!feature || feature.version !== version) throw new Error('المعلم غير موجود أو يحتوي على نسخة أحدث')
    feature.version += 1; recordPreview(feature, 'delete'); features = features.filter((item) => item.id !== id)
  },
  featureVersions: async (id: string) => structuredClone(versions.get(id) ?? []),
  featureChanges: async (id: string) => structuredClone(changes.get(id) ?? []),
}
