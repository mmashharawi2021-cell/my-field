export function TopBar() {
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
          <span>جاهز للعمل</span>
        </div>
        <div className="avatar" aria-label="حساب المستخدم">م</div>
      </div>
    </header>
  )
}
