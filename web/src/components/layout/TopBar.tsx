import { useNavigate } from 'react-router-dom'
import { PREVIEW_MODE } from '../../services/api'
import { useAuthStore } from '../../stores/authStore'

export function TopBar() {
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)

  const initial = user?.full_name?.trim().charAt(0) || user?.username?.charAt(0) || 'م'

  function signOut() {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <header className="topbar">
      <div className="topbar-title">
        <div className="mobile-brand-mark">MF</div>
        <div>
          <h1>My Field</h1>
          <p>مركز إدارة العمل الميداني والبيانات المكانية</p>
        </div>
      </div>

      <div className="top-actions">
        <div className="connection-chip">
          <span className="connection-dot" />
          <span>{PREVIEW_MODE ? 'وضع المعاينة' : 'متصل بالخادم'}</span>
        </div>

        <div className="user-chip">
          <div className="avatar" aria-hidden="true">{initial}</div>
          <div className="user-chip-copy">
            <strong>{user?.full_name ?? 'My Field User'}</strong>
            <span>{user?.role ?? 'viewer'}</span>
          </div>
          <button type="button" className="logout-button" onClick={signOut}>خروج</button>
        </div>
      </div>
    </header>
  )
}
