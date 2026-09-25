import { ActionButton } from '../../../components/ui/ActionButton'

export function ProjectsHeader() {
  return (
    <div className="page-heading">
      <div>
        <span className="eyebrow">الإدارة</span>
        <h2>المشاريع</h2>
        <p>إدارة المشاريع والطبقات والمستخدمين وبيانات العمل الميداني.</p>
      </div>
      <ActionButton variant="primary">+ مشروع جديد</ActionButton>
    </div>
  )
}
