import { ActionButton } from '../../../components/ui/ActionButton'
import { AppIcon } from '../../../components/ui/AppIcon'
import { useAuthStore } from '../../../stores/authStore'
import { canManageLayers } from '../../../config/permissions'

export function ProjectsHeader({ onCreate }: { onCreate: () => void }) {
  const canManage = canManageLayers(useAuthStore((state) => state.user?.role))
  return (
    <div className="page-heading projects-heading">
      <div>
        <span className="eyebrow">المشاريع الميدانية</span>
        <h2>مساحات العمل</h2>
        <p>افتح مشروعًا قائمًا أو أنشئ مساحة جديدة لإدارة الطبقات والمهام والفرق.</p>
      </div>
      {canManage && <ActionButton variant="primary" onClick={onCreate}>
        <AppIcon name="plus" size={17} />
        مشروع جديد
      </ActionButton>}
    </div>
  )
}
