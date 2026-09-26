import { authorizedRequest, PREVIEW_MODE } from './api'
import { managementPreview } from './managementPreview'
import type { Layer, LayerInput } from '../types/layer'

export const layersApi = {
  list: (projectId: string) => PREVIEW_MODE ? managementPreview.layers(projectId) : authorizedRequest<Layer[]>('/projects/' + projectId + '/layers'),
  create: (projectId: string, input: LayerInput) => PREVIEW_MODE ? managementPreview.createLayer(projectId, input) : authorizedRequest<Layer>('/projects/' + projectId + '/layers', { method: 'POST', body: JSON.stringify(input) }),
  update: (id: string, input: LayerInput) => PREVIEW_MODE ? managementPreview.updateLayer(id, input) : authorizedRequest<Layer>('/layers/' + id, { method: 'PATCH', body: JSON.stringify(input) }),
  archive: async (id: string): Promise<void> => {
    if (PREVIEW_MODE) { await managementPreview.updateLayer(id, { status: 'archived' }); return }
    await authorizedRequest<void>('/layers/' + id, { method: 'DELETE' })
  },
}
