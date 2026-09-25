import { StatusPill } from '../ui/StatusPill'

export function TopBar() {
  return (
    <header className="topbar">
      <div className="topbar-title">
        <h1>My Field</h1>
        <p>منصة GIS ميدانية — Offline Ready</p>
      </div>
      <div className="top-actions">
        <StatusPill>V1 Foundation</StatusPill>
        <div className="avatar" aria-label="حساب المستخدم">م</div>
      </div>
    </header>
  )
}
