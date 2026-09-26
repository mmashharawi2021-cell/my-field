import { authorizedRequest } from './api'
import type { GeoJsonGeometry, MapFeature, FeatureChange, FeatureVersion } from '../types/feature'

export const featureRemote = {
  list: (layerId: string) => authorizedRequest<MapFeature[]>('/layers/' + layerId + '/features'),
  create: (id: string, layerId: string, geometry: GeoJsonGeometry, properties: Record<string, unknown>) =>
    authorizedRequest<MapFeature>('/layers/' + layerId + '/features', { method: 'POST', body: JSON.stringify({ id, geometry, properties }) }),
  update: (id: string, version: number, input: { geometry?: GeoJsonGeometry; properties?: Record<string, unknown> }) =>
    authorizedRequest<MapFeature>('/features/' + id, { method: 'PATCH', body: JSON.stringify({ version, ...input }) }),
  archive: (id: string, version: number) => authorizedRequest<void>('/features/' + id + '?version=' + version, { method: 'DELETE' }),
  versions: (id: string) => authorizedRequest<FeatureVersion[]>('/features/' + id + '/versions'),
  changes: (id: string) => authorizedRequest<FeatureChange[]>('/features/' + id + '/changes'),
}

