import { NavLink } from 'react-router-dom'
import { navigationItems } from '../../config/navigation'

export function MobileBottomNav() {
  return (
    <nav className="mobile-bottom-nav" aria-label="التنقل على الهاتف">
      {navigationItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          className={({ isActive }) => ['mobile-nav-item', isActive ? 'active' : ''].filter(Boolean).join(' ')}
        >
          <span aria-hidden="true">{item.icon}</span>
          <small>{item.label}</small>
        </NavLink>
      ))}
    </nav>
  )
}
