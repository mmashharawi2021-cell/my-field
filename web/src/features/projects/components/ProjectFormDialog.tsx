import { useEffect, useState, type FormEvent } from 'react'
import { ActionButton } from '../../../components/ui/ActionButton'
import type { ProjectCreateInput, ProjectSummary, ProjectUpdateInput } from '../../../types/project'

type ProjectFormDialogProps = {
  open: boolean
  project?: ProjectSummary | null
  submitting?: boolean
  onClose: () => void
  onSubmit: (payload: ProjectCreateInput | ProjectUpdateInput) => Promise<void>
}

export function ProjectFormDialog({
  open,
  project,
  submitting = false,
  onClose,
  onSubmit,
}: ProjectFormDialogProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState<'draft' | 'active'>('draft')

  useEffect(() => {
    if (!open) return
    setName(project?.name ?? '')
    setDescription(project?.description ?? '')
    setStatus(project?.status === 'active' ? 'active' : 'draft')
  }, [open, project])

  if (!open) return null

  async function submit(event: FormEvent) {
    event.preventDefault()
    await onSubmit({
      name: name.trim(),
      description: description.trim() || null,
      status,
    })
  }

  return (
    <div className="dialog-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        className="dialog-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="project-dialog-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="dialog-heading">
          <div>
            <span className="eyebrow">{project ? 'تعديل المشروع' : 'مشروع جديد'}</span>
            <h3 id="project-dialog-title">{project ? project.name : 'إنشاء مساحة عمل جديدة'}</h3>
          </div>
          <button className="dialog-close" type="button" onClick={onClose} aria-label="إغلاق">×</button>
        </div>

        <form className="project-form" onSubmit={submit}>
          <label>
            <span>اسم المشروع</span>
            <input value={name} onChange={(event) => setName(event.target.value)} minLength={2} required />
          </label>

          <label>
            <span>الوصف</span>
            <textarea value={description} onChange={(event) => setDescription(event.target.value)} rows={4} />
          </label>

          <label>
            <span>الحالة</span>
            <select value={status} onChange={(event) => setStatus(event.target.value as 'draft' | 'active')}>
              <option value="draft">مسودة</option>
              <option value="active">نشط</option>
            </select>
          </label>

          <div className="dialog-actions">
            <ActionButton type="button" variant="ghost" onClick={onClose}>إلغاء</ActionButton>
            <ActionButton type="submit" variant="primary" disabled={submitting}>
              {submitting ? 'جارِ الحفظ…' : project ? 'حفظ التعديلات' : 'إنشاء المشروع'}
            </ActionButton>
          </div>
        </form>
      </section>
    </div>
  )
}
