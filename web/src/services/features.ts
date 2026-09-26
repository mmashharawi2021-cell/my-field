import { authorizedRequest, PREVIEW_MODE } from './api'
import { managementPreview } from './managementPreview'
import type { GeoJsonGeometry, MapFeature, FeatureChange, FeatureVersion } from '../types/feature'

export const featuresApi = {
  list: (layerId: string) => PREVIEW_MODE ? managementPreview.features(layerId) : authorizedRequest<MapFeature[]>('/layers/' + layerId + '/features'),
  create: (layerId: string, geometry: GeoJsonGeometry, properties: Record<string, unknown> = {}) =>
    PREVIEW_MODE ? managementPreview.createFeature(layerId, geometry, properties) : authorizedRequest<MapFeature>('/layers/' + layerId + '/features', { method: 'POST', body: JSON.stringify({ geometry, properties }) }),
  update: (feature: MapFeature, input: { geometry?: GeoJsonGeometry; properties?: Record<string, unknown> }) =>
    PREVIEW_MODE ? managementPreview.updateFeature(feature.id, { version: feature.version, ...input }) : authorizedRequest<MapFeature>('/features/' + feature.id, { method: 'PATCH', body: JSON.stringify({ version: feature.version, ...input }) }),
  archive: async (feature: MapFeature) => {
    if (PREVIEW_MODE) return managementPreview.archiveFeature(feature.id, feature.version)
    await authorizedRequest<void>('/features/' + feature.id + '?version=' + feature.version, { method: 'DELETE' })
  },
  versions: (featureId: string) => PREVIEW_MODE ? managementPreview.featureVersions(featureId) : authorizedRequest<FeatureVersion[]>('/features/' + featureId + '/versions'),
  changes: (featureId: string) => PREVIEW_MODE ? managementPreview.featureChanges(featureId) : authorizedRequest<FeatureChange[]>('/features/' + featureId + '/changes'),
}
