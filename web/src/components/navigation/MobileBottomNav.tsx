import { NavLink } from 'react-router-dom'
import { navigationItems } from '../../config/navigation'
import { AppIcon } from '../ui/AppIcon'
import { canManageUsers } from '../../config/permissions'
import { useAuthStore } from '../../stores/authStore'

export function MobileBottomNav() {
  const role = useAuthStore((state) => state.user?.role)
  return (
    <nav className="mobile-bottom-nav" aria-label="التنقل على الهاتف">
      {navigationItems.filter((item) => !item.adminOnly || canManageUsers(role)).map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          className={({ isActive }) =>
            [
              'mobile-nav-item',
              isActive ? 'mobile-nav-item--primary' : '',
              isActive ? 'active' : '',
            ].filter(Boolean).join(' ')
          }
        >
          <span className="mobile-nav-icon"><AppIcon name={item.icon} size={21} /></span>
          <small>{item.label}</small>
        </NavLink>
      ))}
    </nav>
  )
}
