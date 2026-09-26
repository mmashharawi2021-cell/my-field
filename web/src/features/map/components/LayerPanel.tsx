import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useSearchParams } from 'react-router-dom'
import { ActionButton } from '../../../components/ui/ActionButton'
import { Notice } from '../../../components/ui/Notice'
import { ConfirmDialog } from '../../../components/ui/ConfirmDialog'
import { api, PREVIEW_MODE } from '../../../services/api'
import { layersApi } from '../../../services/layers'
import { canManageLayers } from '../../../config/permissions'
import { useAuthStore } from '../../../stores/authStore'
import { LayerForm } from '../../layers/components/LayerForm'
import type { Layer, LayerInput } from '../../../types/layer'
import { useMapWorkspace } from '../MapWorkspaceContext'

export function LayerPanel() {
  const projects = useQuery({ queryKey: ['projects'], queryFn: api.projects.list })
  const [params, setParams] = useSearchParams()
  const selected = params.get('project')
  const projectId = projects.data?.find((project) => project.id === selected)?.id ?? projects.data?.[0]?.id ?? ''
  return <aside className="map-panel">
    <div className="map-panel-heading"><h3>طبقات المشروع</h3></div>
    <label className="project-form">المشروع<select value={projectId} disabled={!projects.data?.length} onChange={(e) => setParams({ project: e.target.value })}>
      {!projects.data?.length && <option value="">لا توجد مشاريع</option>}
      {projects.data?.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}
    </select></label>
    {projects.isPending && <p>جارِ تحميل المشاريع…</p>}
    {projects.error && <Notice>{projects.error.message}</Notice>}
    {projectId && <ProjectLayers key={projectId} projectId={projectId} />}
  </aside>
}

function ProjectLayers({ projectId }: { projectId: string }) {
  const cache = useQueryClient()
  const canManage = canManageLayers(useAuthStore((state) => state.user?.role))
  const [editing, setEditing] = useState<Layer | null | undefined>(undefined)
  const [archiving, setArchiving] = useState<Layer | null>(null)
  const layers = useQuery({ queryKey: ['layers', projectId], queryFn: () => layersApi.list(projectId) })
  const { activeLayer, setActiveLayer, setSelectedFeature, setDrawing, setVertices } = useMapWorkspace()
  useEffect(() => {
    const available = layers.data ?? []
    if (!available.length) { setActiveLayer(null); return }
    if (!activeLayer || activeLayer.project_id !== projectId || !available.some((layer) => layer.id === activeLayer.id)) {
      setActiveLayer(available[0])
    }
  }, [layers.data, projectId, activeLayer, setActiveLayer])

  function chooseLayer(layer: Layer) {
    setActiveLayer(layer); setSelectedFeature(null); setDrawing(false); setVertices([])
  }
  async function invalidate() {
    await Promise.all([cache.invalidateQueries({ queryKey: ['layers', projectId] }), cache.invalidateQueries({ queryKey: ['projects'] })])
  }
  const save = useMutation({
    mutationFn: (input: LayerInput) => editing ? layersApi.update(editing.id, input) : layersApi.create(projectId, input),
    onSuccess: async () => { setEditing(undefined); await invalidate() },
  })
  const archive = useMutation({
    mutationFn: layersApi.archive,
    onSuccess: async () => { setArchiving(null); await invalidate() },
  })
  return <>
    {PREVIEW_MODE && <Notice>طبقات تجريبية مؤقتة داخل المتصفح.</Notice>}
    {layers.isPending && <p>جارِ تحميل الطبقات…</p>}
    {(layers.error || archive.error) && <Notice>{(layers.error || archive.error)?.message}</Notice>}
    {layers.data?.length === 0 && <p>لا توجد طبقات في هذا المشروع بعد.</p>}
    <div className="layer-list">{layers.data?.map((layer) => <article className={`layer-entry${activeLayer?.id === layer.id ? ' layer-entry--active' : ''}`} key={layer.id}>
      <button type="button" className="layer-select" aria-pressed={activeLayer?.id === layer.id} onClick={() => chooseLayer(layer)}><strong>{layer.name}</strong><small>{layer.geometry_type} · EPSG:{layer.srid} · {layer.status === 'active' ? 'نشط' : 'مسودة'}</small></button>
      {canManage && <div className="dialog-actions"><ActionButton onClick={() => setEditing(layer)}>تعديل</ActionButton><ActionButton onClick={() => setArchiving(layer)}>أرشفة</ActionButton></div>}
    </article>)}</div>
    {canManage && <ActionButton variant="primary" fullWidth onClick={() => setEditing(null)}>إضافة طبقة</ActionButton>}
    <p className="layer-note">اختر طبقة نشطة، ثم ارسم المعالم أو حدّدها لتعديل خصائصها وهندستها.</p>
    {editing !== undefined && <LayerForm key={editing?.id ?? 'new'} layer={editing} busy={save.isPending} onClose={() => setEditing(undefined)} onSave={save.mutateAsync} />}
    <ConfirmDialog open={!!archiving} title="أرشفة الطبقة" message={'إخفاء الطبقة «' + (archiving?.name ?? '') + '» مع الاحتفاظ ببياناتها؟'} confirmLabel="أرشفة" confirming={archive.isPending} onCancel={() => { if (!archive.isPending) setArchiving(null) }} onConfirm={async () => { if (archiving) { try { await archive.mutateAsync(archiving.id) } catch { /* Error displayed above. */ } } }} />
  </>
}

