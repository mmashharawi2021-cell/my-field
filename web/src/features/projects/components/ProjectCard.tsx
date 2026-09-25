import { ActionButton } from '../../../components/ui/ActionButton'
import { StatusPill } from '../../../components/ui/StatusPill'
import type { ProjectSummary } from '../../../types/project'

export function ProjectCard({ project }: { project: ProjectSummary }) {
  return (
    <article className="project-card">
      <div className="project-card-head">
        <span className="project-icon" aria-hidden="true">▣</span>
        <StatusPill tone={project.status === 'active' ? 'success' : 'neutral'}>
          {project.status}
        </StatusPill>
      </div>

      <h3>{project.name}</h3>
      <p>{project.description ?? 'بدون وصف'}</p>

      <div className="project-metrics">
        <div><b>{project.layer_count}</b><span>طبقات</span></div>
        <div><b>{project.feature_count.toLocaleString('en-US')}</b><span>Features</span></div>
      </div>

      <ActionButton variant="ghost" fullWidth>فتح المشروع</ActionButton>
    </article>
  )
}
