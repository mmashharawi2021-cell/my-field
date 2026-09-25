import { NavLink } from 'react-router-dom'
import { navigationItems } from '../../config/navigation'
import { AppIcon } from '../ui/AppIcon'

export function MobileBottomNav() {
  return (
    <nav className="mobile-bottom-nav" aria-label="التنقل على الهاتف">
      {navigationItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          className={({ isActive }) =>
            [
              'mobile-nav-item',
              item.to === '/map' ? 'mobile-nav-item--primary' : '',
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
