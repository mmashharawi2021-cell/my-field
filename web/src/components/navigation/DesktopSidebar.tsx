import { NavLink } from 'react-router-dom'
import { navigationItems } from '../../config/navigation'
import { AppIcon } from '../ui/AppIcon'
import { canManageUsers } from '../../config/permissions'
import { useAuthStore } from '../../stores/authStore'

export function DesktopSidebar() {
  const role = useAuthStore((state) => state.user?.role)
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark">MF</div>
        <div className="brand-copy">
          <strong>My Field</strong>
          <span>Field GIS Workspace</span>
        </div>
      </div>

      <div className="nav-section-label">مساحة العمل</div>
      <nav className="nav-list" aria-label="التنقل الرئيسي">
        {navigationItems.filter((item) => !item.adminOnly || canManageUsers(role)).map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) => ['nav-item', isActive ? 'active' : ''].filter(Boolean).join(' ')}
          >
            <span className="nav-icon"><AppIcon name={item.icon} size={19} /></span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="server-dot" />
        <div>
          <strong>My Field Server</strong>
          <span>جاهز للاتصال المحلي</span>
        </div>
      </div>
    </aside>
  )
}
