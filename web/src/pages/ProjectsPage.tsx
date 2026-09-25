import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { Notice } from '../components/ui/Notice'
import { ProjectCard } from '../features/projects/components/ProjectCard'
import { ProjectFormDialog } from '../features/projects/components/ProjectFormDialog'
import { ProjectsHeader } from '../features/projects/components/ProjectsHeader'
import { api, PREVIEW_MODE } from '../services/api'
import type { ProjectCreateInput, ProjectSummary, ProjectUpdateInput } from '../types/project'

export default function ProjectsPage() {
  const queryClient = useQueryClient()
  const [formOpen, setFormOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<ProjectSummary | null>(null)
  const [archiveProject, setArchiveProject] = useState<ProjectSummary | null>(null)

  const query = useQuery({
    queryKey: ['projects'],
    queryFn: api.projects.list,
  })

  const createMutation = useMutation({
    mutationFn: (payload: ProjectCreateInput) => api.projects.create(payload),
    onSuccess: async () => {
      setFormOpen(false)
      await queryClient.invalidateQueries({ queryKey: ['projects'] })
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: ProjectUpdateInput }) =>
      api.projects.update(id, payload),
    onSuccess: async () => {
      setEditingProject(null)
      setFormOpen(false)
      await queryClient.invalidateQueries({ queryKey: ['projects'] })
    },
  })

  const archiveMutation = useMutation({
    mutationFn: (id: string) => api.projects.archive(id),
    onSuccess: async () => {
      setArchiveProject(null)
      await queryClient.invalidateQueries({ queryKey: ['projects'] })
    },
  })

  function openCreate() {
    setEditingProject(null)
    setFormOpen(true)
  }

  function openEdit(project: ProjectSummary) {
    setEditingProject(project)
    setFormOpen(true)
  }

  async function submitForm(payload: ProjectCreateInput | ProjectUpdateInput) {
    if (editingProject) {
      await updateMutation.mutateAsync({ id: editingProject.id, payload })
      return
    }

    await createMutation.mutateAsync(payload as ProjectCreateInput)
  }

  const projects = query.data ?? []
  const formError = createMutation.error ?? updateMutation.error
  const archiveError = archiveMutation.error
  const archiveMessage = 'سيتم إخفاء "' + (archiveProject?.name ?? '') + '" من قائمة المشاريع النشطة دون حذف بياناته نهائيًا.'

  return (
    <div className="page-stack">
      <ProjectsHeader onCreate={openCreate} />

      {PREVIEW_MODE && (
        <Notice>
          وضع المعاينة يعمل ببيانات مؤقتة داخل المتصفح. عند تشغيل My Field محليًا ستُحفظ المشاريع في PostgreSQL/PostGIS.
        </Notice>
      )}

      {query.isError && (
        <Notice>
          تعذر تحميل المشاريع من الخادم. تحقق من تشغيل My Field Server ثم أعد المحاولة.
        </Notice>
      )}

      {(formError || archiveError) && (
        <Notice>
          {formError instanceof Error
            ? formError.message
            : archiveError instanceof Error
              ? archiveError.message
              : 'تعذر تنفيذ العملية'}
        </Notice>
      )}

      {query.isLoading ? (
        <div className="projects-loading">جارِ تحميل المشاريع…</div>
      ) : projects.length === 0 ? (
        <div className="projects-empty">
          <strong>لا توجد مشاريع بعد</strong>
          <span>أنشئ أول مساحة عمل لبدء إدارة البيانات الميدانية.</span>
        </div>
      ) : (
        <div className="project-grid">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onEdit={openEdit}
              onArchive={setArchiveProject}
            />
          ))}
        </div>
      )}

      <ProjectFormDialog
        open={formOpen}
        project={editingProject}
        submitting={createMutation.isPending || updateMutation.isPending}
        onClose={() => {
          if (createMutation.isPending || updateMutation.isPending) return
          setFormOpen(false)
          setEditingProject(null)
        }}
        onSubmit={submitForm}
      />

      <ConfirmDialog
        open={Boolean(archiveProject)}
        title="أرشفة المشروع"
        message={archiveMessage}
        confirmLabel="أرشفة"
        confirming={archiveMutation.isPending}
        onCancel={() => setArchiveProject(null)}
        onConfirm={async () => {
          if (archiveProject) await archiveMutation.mutateAsync(archiveProject.id)
        }}
      />
    </div>
  )
}
