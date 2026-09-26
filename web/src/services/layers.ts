import { authorizedRequest, PREVIEW_MODE } from './api'
import { managementPreview } from './managementPreview'
import type { Layer, LayerInput } from '../types/layer'
import { offlineDatabase } from './offlineDatabase'
import { session } from './session'

const catalogKey = (projectId: string) => `${session.getUser()?.id ?? 'anonymous'}:layers:${projectId}`

async function listLayers(projectId: string) {
  if (PREVIEW_MODE) return managementPreview.layers(projectId)
  const key = catalogKey(projectId)
  if (!navigator.onLine) return (await offlineDatabase.getCatalog<Layer[]>(key)) ?? []
  try { const layers = await authorizedRequest<Layer[]>('/projects/' + projectId + '/layers'); await offlineDatabase.putCatalog(key, layers); return layers }
  catch (error) { if (error instanceof TypeError) return (await offlineDatabase.getCatalog<Layer[]>(key)) ?? []; throw error }
}

export const layersApi = {
  list: listLayers,
  create: (projectId: string, input: LayerInput) => PREVIEW_MODE ? managementPreview.createLayer(projectId, input) : authorizedRequest<Layer>('/projects/' + projectId + '/layers', { method: 'POST', body: JSON.stringify(input) }),
  update: (id: string, input: LayerInput) => PREVIEW_MODE ? managementPreview.updateLayer(id, input) : authorizedRequest<Layer>('/layers/' + id, { method: 'PATCH', body: JSON.stringify(input) }),
  archive: async (id: string): Promise<void> => {
    if (PREVIEW_MODE) { await managementPreview.updateLayer(id, { status: 'archived' }); return }
    await authorizedRequest<void>('/layers/' + id, { method: 'DELETE' })
  },
}

