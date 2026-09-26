import { useState, type FormEvent } from 'react'
import { FormDialog } from '../../../components/ui/FormDialog'
import { ActionButton } from '../../../components/ui/ActionButton'
import type { Layer, LayerInput } from '../../../types/layer'

export function LayerForm({ layer, busy, onClose, onSave }: {
  layer: Layer | null; busy: boolean; onClose: () => void; onSave: (input: LayerInput) => Promise<unknown>
}) {
  const [name, setName] = useState(layer?.name ?? '')
  const [geometry, setGeometry] = useState<LayerInput['geometry_type']>(layer?.geometry_type ?? 'Point')
  const [srid, setSrid] = useState(layer?.srid ?? 4326)
  const [status, setStatus] = useState<LayerInput['status']>(layer?.status === 'draft' ? 'draft' : 'active')
  const [style, setStyle] = useState(JSON.stringify(layer?.style_json ?? {}, null, 2))
  const [fields, setFields] = useState(JSON.stringify(layer?.style_json.form_fields ?? [], null, 2))
  const [error, setError] = useState('')
  async function submit(event: FormEvent) {
    event.preventDefault(); setError('')
    try {
      const style_json: unknown = JSON.parse(style)
      const form_fields: unknown = JSON.parse(fields)
      if (!style_json || Array.isArray(style_json) || typeof style_json !== 'object') throw new Error('النمط يجب أن يكون كائن JSON')
      if (!Array.isArray(form_fields)) throw new Error('حقول النموذج يجب أن تكون قائمة JSON')
      await onSave({ name: name.trim(), geometry_type: geometry, srid, status, style_json: { ...(style_json as Record<string, unknown>), ...(form_fields.length ? { form_fields } : {}) } })
    } catch (err) { setError(err instanceof SyntaxError ? 'صيغة JSON غير صحيحة' : err instanceof Error ? err.message : 'تعذر الحفظ') }
  }
  return <FormDialog title={layer ? 'تعديل الطبقة' : 'إنشاء طبقة'} onClose={onClose} busy={busy}>
    <form className="project-form" onSubmit={submit}>
      <label>اسم الطبقة<input required minLength={2} maxLength={180} value={name} onChange={(e) => setName(e.target.value)} /></label>
      <label>نوع الشكل<select value={geometry} onChange={(e) => setGeometry(e.target.value as LayerInput['geometry_type'])}><option value="Point">نقطة · Point</option><option value="LineString">خط · Line</option><option value="Polygon">مضلع · Polygon</option></select></label>
      <label>نظام الإحداثيات (SRID)<input required type="number" min={1} max={998999} step={1} value={srid} onChange={(e) => setSrid(Number(e.target.value))} /></label>
      <label>الحالة<select value={status} onChange={(e) => setStatus(e.target.value as LayerInput['status'])}><option value="active">نشط</option><option value="draft">مسودة</option></select></label>
      <label>نمط الطبقة (JSON)<textarea dir="ltr" rows={4} value={style} onChange={(e) => setStyle(e.target.value)} /></label>
      <label>حقول نموذج المعلم (JSON)<textarea dir="ltr" rows={5} value={fields} onChange={(e) => setFields(e.target.value)} placeholder='[{"key":"status","label":"الحالة","type":"select","options":["جديد","منجز"],"required":true}]' /></label>
      {error && <p role="alert">{error}</p>}
      <ActionButton type="submit" variant="primary" disabled={busy}>{busy ? 'جارِ الحفظ…' : 'حفظ'}</ActionButton>
    </form>
  </FormDialog>
}

