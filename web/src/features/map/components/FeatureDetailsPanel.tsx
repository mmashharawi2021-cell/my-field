import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ActionButton } from '../../../components/ui/ActionButton'
import { ConfirmDialog } from '../../../components/ui/ConfirmDialog'
import { Notice } from '../../../components/ui/Notice'
import { canEditFeatures } from '../../../config/permissions'
import { featuresApi } from '../../../services/features'
import { useAuthStore } from '../../../stores/authStore'
import { useMapWorkspace } from '../MapWorkspaceContext'

export function FeatureDetailsPanel() {
  const workspace = useMapWorkspace()
  const feature = workspace.selectedFeature
  const canEdit = canEditFeatures(useAuthStore((state) => state.user?.role))
  const cache = useQueryClient()
  const [properties, setProperties] = useState('{}')
  const [editing, setEditing] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [error, setError] = useState<string | null>(null)
  useEffect(() => { setProperties(JSON.stringify(feature?.properties ?? {}, null, 2)); setEditing(false); setError(null) }, [feature])
  const versions = useQuery({ queryKey: ['feature-versions', feature?.id], queryFn: () => featuresApi.versions(feature!.id), enabled: !!feature })
  const changes = useQuery({ queryKey: ['feature-changes', feature?.id], queryFn: () => featuresApi.changes(feature!.id), enabled: !!feature })
  const update = useMutation({
    mutationFn: async () => {
      if (!feature) throw new Error('لم يتم تحديد معلم')
      const value: unknown = JSON.parse(properties)
      if (!value || Array.isArray(value) || typeof value !== 'object') throw new Error('الخصائص يجب أن تكون كائن JSON')
      return featuresApi.update(feature, { properties: value as Record<string, unknown> })
    },
    onSuccess: async (updated) => {
      workspace.setSelectedFeature(updated); setEditing(false); setError(null)
      await Promise.all([cache.invalidateQueries({ queryKey: ['features', updated.layer_id] }), cache.invalidateQueries({ queryKey: ['feature-versions', updated.id] }), cache.invalidateQueries({ queryKey: ['feature-changes', updated.id] })])
    },
    onError: (reason) => setError(reason instanceof SyntaxError ? 'صيغة JSON غير صحيحة' : reason instanceof Error ? reason.message : 'تعذر الحفظ'),
  })
  const remove = useMutation({
    mutationFn: () => featuresApi.archive(feature!),
    onSuccess: async () => {
      const layerId = feature!.layer_id; workspace.setSelectedFeature(null); setConfirmDelete(false)
      await Promise.all([cache.invalidateQueries({ queryKey: ['features', layerId] }), cache.invalidateQueries({ queryKey: ['projects'] })])
    },
    onError: (reason) => setError(reason instanceof Error ? reason.message : 'تعذر الحذف'),
  })

  if (!feature) return <aside className="details-panel">
    <div className="details-empty-icon">◎</div><span className="eyebrow">التفاصيل</span>
    <h3>لم يتم تحديد معلم</h3><p>اختر معلمًا من الخريطة لعرض خصائصه وسجل نسخه.</p>
  </aside>

  return <aside className="details-panel feature-details">
    <span className="eyebrow">تفاصيل المعلم</span>
    <h3>{String(feature.properties.name ?? 'معلم بدون اسم')}</h3>
    <div className="details-meta">
      <div><span>UUID</span><b title={feature.id}>{feature.id.slice(0, 8)}…</b></div>
      <div><span>Version</span><b>{feature.version}</b></div>
      <div><span>Geometry</span><b>{feature.geometry.type}</b></div>
    </div>
    {error && <Notice>{error}</Notice>}
    <label className="properties-editor">الخصائص (JSON)
      <textarea dir="ltr" rows={8} value={properties} readOnly={!editing} onChange={(event) => setProperties(event.target.value)} />
    </label>
    {canEdit && <div className="feature-actions">
      {!editing ? <ActionButton onClick={() => setEditing(true)}>تعديل الخصائص</ActionButton> : <>
        <ActionButton variant="primary" disabled={update.isPending} onClick={() => update.mutate()}>حفظ</ActionButton>
        <ActionButton onClick={() => { setEditing(false); setProperties(JSON.stringify(feature.properties, null, 2)) }}>إلغاء</ActionButton>
      </>}
      <ActionButton onClick={() => { workspace.setRedrawFeature(feature); workspace.setVertices([]); workspace.setDrawing(true) }}>إعادة رسم</ActionButton>
      <ActionButton onClick={() => setConfirmDelete(true)}>حذف</ActionButton>
    </div>}
    <section className="history-section"><h4>سجل التغييرات</h4>
      {changes.isPending ? <small>جارِ التحميل…</small> : changes.data?.map((change) => <div key={change.id}><b>{change.operation}</b><span>v{change.version} · {new Date(change.changed_at).toLocaleString('ar')}</span></div>)}
      {versions.error && <small>تعذر تحميل النسخ</small>}
    </section>
    <ConfirmDialog open={confirmDelete} title="حذف المعلم" message="سيتم إخفاء المعلم مع الاحتفاظ بنسخه وسجل التغييرات." confirmLabel="حذف" confirming={remove.isPending} onCancel={() => setConfirmDelete(false)} onConfirm={async () => { try { await remove.mutateAsync() } catch { /* shown above */ } }} />
  </aside>
}
