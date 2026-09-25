import { ActionButton } from '../../../components/ui/ActionButton'
import { StatusPill } from '../../../components/ui/StatusPill'
import { AppIcon } from '../../../components/ui/AppIcon'
import type { ProjectSummary } from '../../../types/project'

type ProjectCardProps = {
  project: ProjectSummary
  onEdit: (project: ProjectSummary) => void
  onArchive: (project: ProjectSummary) => void
}

export function ProjectCard({ project, onEdit, onArchive }: ProjectCardProps) {
  const progress = project.status === 'active' ? Math.min(88, 46 + project.layer_count * 4) : 28

  return (
    <article className="project-card project-card--new">
      <div className="project-cover">
        <div className="project-cover-grid" />
        <span className="project-icon"><AppIcon name="map" size={20} /></span>
        <StatusPill tone={project.status === 'active' ? 'success' : 'neutral'}>
          {project.status === 'active' ? 'نشط' : 'مسودة'}
        </StatusPill>
      </div>

      <div className="project-card-body">
        <h3>{project.name}</h3>
        <p>{project.description ?? 'بدون وصف'}</p>

        <div className="project-progress-meta">
          <span>تقدم العمل</span>
          <b>{progress}%</b>
        </div>
        <div className="project-progress-track"><i style={{ width: progress + '%' }} /></div>

        <div className="project-metrics">
          <div><b>{project.layer_count}</b><span>طبقات</span></div>
          <div><b>{project.feature_count.toLocaleString('en-US')}</b><span>عنصر مكاني</span></div>
        </div>

        <div className="project-card-actions">
          <ActionButton variant="ghost" onClick={() => onEdit(project)}>تعديل</ActionButton>
          <ActionButton variant="ghost" onClick={() => onArchive(project)}>أرشفة</ActionButton>
          <ActionButton variant="primary">
            فتح مساحة العمل
            <AppIcon name="chevron" size={16} />
          </ActionButton>
        </div>
      </div>
    </article>
  )
}
