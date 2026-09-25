import { useQuery } from '@tanstack/react-query'
import { api, PREVIEW_MODE } from '../services/api'

const fallback = [
  { id: 'p-1', name: 'مشروع تجريبي', description: 'سيتم استبداله ببيانات PostgreSQL بعد تشغيل الخادم.', status: 'active', feature_count: 2486, layer_count: 6 },
]

export default function ProjectsPage() {
  const query = useQuery({ queryKey: ['projects'], queryFn: api.projects })
  const projects = query.data ?? fallback

  return (
    <div className="page-stack">
      <div className="page-heading">
        <div><span className="eyebrow">الإدارة</span><h2>المشاريع</h2><p>إدارة المشاريع والطبقات والمستخدمين وبيانات العمل الميداني.</p></div>
        <button className="primary-btn">+ مشروع جديد</button>
      </div>
      {(PREVIEW_MODE || query.isError) && <div className="notice">هذه معاينة للواجهة على GitHub Pages؛ قاعدة PostgreSQL/PostGIS والخادم المحلي غير متصلين بهذه النسخة.</div>}
      <div className="project-grid">
        {projects.map((project) => (
          <article className="project-card" key={project.id}>
            <div className="project-card-head"><span className="project-icon">▣</span><span className="status-pill">{project.status}</span></div>
            <h3>{project.name}</h3>
            <p>{project.description ?? 'بدون وصف'}</p>
            <div className="project-metrics"><div><b>{project.layer_count}</b><span>طبقات</span></div><div><b>{project.feature_count.toLocaleString('en-US')}</b><span>Features</span></div></div>
            <button className="ghost-btn">فتح المشروع</button>
          </article>
        ))}
      </div>
    </div>
  )
}
