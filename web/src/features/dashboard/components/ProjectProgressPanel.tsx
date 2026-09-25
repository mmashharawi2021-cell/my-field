import { ActionButton } from '../../../components/ui/ActionButton'
import { projectProgress } from '../data/dashboardData'

export function ProjectProgressPanel() {
  return (
    <article className="panel">
      <div className="panel-head">
        <div>
          <span className="eyebrow">العمل الحالي</span>
          <h3>تقدم المشروع</h3>
        </div>
        <ActionButton variant="ghost">فتح المشاريع</ActionButton>
      </div>

      {projectProgress.map((item) => (
        <div className="progress-row" key={item.name}>
          <div>
            <strong>{item.name}</strong>
            <span>{item.progress}%</span>
          </div>
          <div className="progress-track">
            <i style={{ width: item.progress + '%' }} />
          </div>
        </div>
      ))}
    </article>
  )
}
