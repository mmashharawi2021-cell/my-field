import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ActionButton } from '../../../components/ui/ActionButton'
import { ConfirmDialog } from '../../../components/ui/ConfirmDialog'
import { Notice } from '../../../components/ui/Notice'
import { canEditFeatures } from '../../../config/permissions'
import { featuresApi } from '../../../services/features'
import { useAuthStore } from '../../../stores/authStore'
import { useMapWorkspace } from '../MapWorkspaceContext'
import { useSyncStore } from '../../../stores/syncStore'

type FormField = { key: string; label: string; type: 'text' | 'number' | 'date' | 'select'; required?: boolean; options?: string[] }
type PhotoAttachment = { id: string; name: string; type: string; data: string }

export function FeatureDetailsPanel() {
  const workspace = useMapWorkspace()
  const feature = workspace.selectedFeature
  const canEdit = canEditFeatures(useAuthStore((state) => state.user?.role))
  const online = useSyncStore((state) => state.online)
  const cache = useQueryClient()
  const [properties, setProperties] = useState('{}')
  const [editing, setEditing] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const formFields = Array.isArray(workspace.activeLayer?.style_json.form_fields) ? workspace.activeLayer.style_json.form_fields as FormField[] : []
  useEffect(() => { setProperties(JSON.stringify(feature?.properties ?? {}, null, 2)); setEditing(false); setError(null) }, [feature])
  const versions = useQuery({ queryKey: ['feature-versions', feature?.id], queryFn: () => featuresApi.versions(feature!.id), enabled: !!feature && online && feature?.sync_status !== 'pending' })
  const changes = useQuery({ queryKey: ['feature-changes', feature?.id], queryFn: () => featuresApi.changes(feature!.id), enabled: !!feature && online && feature?.sync_status !== 'pending' })
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
  const attachments = Array.isArray(feature?.properties.__attachments) ? feature.properties.__attachments as PhotoAttachment[] : []
  const saveAttachments = async (next: PhotoAttachment[]) => {
    if (!feature) return
    try {
      const updated = await featuresApi.update(feature, { properties: { ...feature.properties, __attachments: next } })
      workspace.setSelectedFeature(updated); setProperties(JSON.stringify(updated.properties, null, 2)); setError(null)
      await cache.invalidateQueries({ queryKey: ['features', updated.layer_id] })
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'تعذر حفظ المرفق') }
  }
  const addPhotos = async (files: FileList | null) => {
    if (!files) return
    const selected = [...files].slice(0, Math.max(0, 3 - attachments.length))
    if (selected.some((file) => !file.type.startsWith('image/') || file.size > 1_500_000)) { setError('يسمح بصور حتى 1.5 MB وبحد أقصى 3 صور'); return }
    const added = await Promise.all(selected.map((file) => new Promise<PhotoAttachment>((resolve, reject) => {
      const reader = new FileReader(); reader.onerror = () => reject(new Error('تعذر قراءة الصورة'))
      reader.onload = () => resolve({ id: crypto.randomUUID(), name: file.name, type: file.type, data: String(reader.result) }); reader.readAsDataURL(file)
    })))
    await saveAttachments([...attachments, ...added])
  }

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
      <div><span>Sync</span><b>{feature.sync_status === 'pending' ? 'معلّق' : 'متزامن'}</b></div>
    </div>
    {error && <Notice>{error}</Notice>}
    {formFields.length > 0 ? <div className="feature-form-fields">{formFields.map((field) => {
      const values = JSON.parse(properties) as Record<string, unknown>
      const value = String(values[field.key] ?? '')
      const change = (next: string) => setProperties(JSON.stringify({ ...values, [field.key]: field.type === 'number' && next !== '' ? Number(next) : next }, null, 2))
      return <label key={field.key}>{field.label}{field.type === 'select' ? <select disabled={!editing} required={field.required} value={value} onChange={(event) => change(event.target.value)}><option value="">اختر…</option>{field.options?.map((option) => <option key={option}>{option}</option>)}</select> : <input disabled={!editing} required={field.required} type={field.type} value={value} onChange={(event) => change(event.target.value)} />}</label>
    })}</div> : <label className="properties-editor">الخصائص (JSON)
      <textarea dir="ltr" rows={8} value={properties} readOnly={!editing} onChange={(event) => setProperties(event.target.value)} />
    </label>}
    {canEdit && <div className="feature-actions">
      {!editing ? <ActionButton onClick={() => setEditing(true)}>تعديل الخصائص</ActionButton> : <>
        <ActionButton variant="primary" disabled={update.isPending} onClick={() => update.mutate()}>حفظ</ActionButton>
        <ActionButton onClick={() => { setEditing(false); setProperties(JSON.stringify(feature.properties, null, 2)) }}>إلغاء</ActionButton>
      </>}
      <ActionButton onClick={() => { workspace.setRedrawFeature(feature); workspace.setVertices(feature.geometry.type === 'Point' ? [feature.geometry.coordinates] : feature.geometry.type === 'LineString' ? feature.geometry.coordinates : feature.geometry.coordinates[0].slice(0, -1)); workspace.setDrawing(true) }}>تحرير الهندسة</ActionButton>
      <ActionButton onClick={() => setConfirmDelete(true)}>حذف</ActionButton>
    </div>}
    <section className="attachments-section"><h4>الصور المرفقة</h4>
      <div className="attachment-grid">{attachments.map((item) => <figure key={item.id}><img src={item.data} alt={item.name} /><figcaption>{item.name}</figcaption>{canEdit && <button type="button" onClick={() => void saveAttachments(attachments.filter((photo) => photo.id !== item.id))}>حذف</button>}</figure>)}</div>
      {canEdit && attachments.length < 3 && <label className="attachment-picker">إضافة صورة<input type="file" accept="image/*" multiple onChange={(event) => void addPhotos(event.target.files)} /></label>}
      <small>تُحفظ الصور محليًا وتدخل ضمن مزامنة المعلم.</small>
    </section>
    <section className="history-section"><h4>سجل التغييرات</h4>
      {(!online || feature.sync_status === 'pending') && <small>سيُحدّث السجل بعد المزامنة.</small>}
      {changes.isPending ? <small>جارِ التحميل…</small> : changes.data?.map((change) => <div key={change.id}><b>{change.operation}</b><span>v{change.version} · {new Date(change.changed_at).toLocaleString('ar')}</span></div>)}
      {versions.error && <small>تعذر تحميل النسخ</small>}
    </section>
    <ConfirmDialog open={confirmDelete} title="حذف المعلم" message="سيتم إخفاء المعلم مع الاحتفاظ بنسخه وسجل التغييرات." confirmLabel="حذف" confirming={remove.isPending} onCancel={() => setConfirmDelete(false)} onConfirm={async () => { try { await remove.mutateAsync() } catch { /* shown above */ } }} />
  </aside>
}


