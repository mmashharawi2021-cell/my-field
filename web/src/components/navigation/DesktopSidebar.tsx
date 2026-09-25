import { NavLink } from 'react-router-dom'
import { navigationItems } from '../../config/navigation'

export function DesktopSidebar() {
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark">MF</div>
        <div className="brand-copy">
          <strong>My Field</strong>
          <span>Field GIS Platform</span>
        </div>
      </div>

      <nav className="nav-list" aria-label="التنقل الرئيسي">
        {navigationItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) => ['nav-item', isActive ? 'active' : ''].filter(Boolean).join(' ')}
          >
            <span className="nav-icon" aria-hidden="true">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="server-dot" />
        <div>
          <strong>الخادم المحلي</strong>
          <span>جاهز للاتصال</span>
        </div>
      </div>
    </aside>
  )
}
