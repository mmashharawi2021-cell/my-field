import { ActionButton } from '../../../components/ui/ActionButton'
import { AppIcon } from '../../../components/ui/AppIcon'

export function ProjectsHeader() {
  return (
    <div className="page-heading projects-heading">
      <div>
        <span className="eyebrow">المشاريع الميدانية</span>
        <h2>مساحات العمل</h2>
        <p>افتح مشروعًا قائمًا أو أنشئ مساحة جديدة لإدارة الطبقات والمهام والفرق.</p>
      </div>
      <ActionButton variant="primary">
        <AppIcon name="plus" size={17} />
        مشروع جديد
      </ActionButton>
    </div>
  )
}
