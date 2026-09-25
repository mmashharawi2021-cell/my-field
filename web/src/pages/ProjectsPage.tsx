import { useQuery } from '@tanstack/react-query'
import { Notice } from '../components/ui/Notice'
import { ProjectCard } from '../features/projects/components/ProjectCard'
import { ProjectsHeader } from '../features/projects/components/ProjectsHeader'
import { api, PREVIEW_MODE } from '../services/api'
import type { ProjectSummary } from '../types/project'

const fallback: ProjectSummary[] = [
  {
    id: 'p-1',
    name: 'مشروع تجريبي',
    description: 'سيتم استبداله ببيانات PostgreSQL بعد تشغيل الخادم.',
    status: 'active',
    feature_count: 2486,
    layer_count: 6,
  },
]

export default function ProjectsPage() {
  const query = useQuery({ queryKey: ['projects'], queryFn: api.projects })
  const projects = query.data ?? fallback

  return (
    <div className="page-stack">
      <ProjectsHeader />

      {(PREVIEW_MODE || query.isError) && (
        <Notice>
          هذه معاينة للواجهة على GitHub Pages؛ قاعدة PostgreSQL/PostGIS والخادم المحلي غير متصلين بهذه النسخة.
        </Notice>
      )}

      <div className="project-grid">
        {projects.map((project) => <ProjectCard key={project.id} project={project} />)}
      </div>
    </div>
  )
}
