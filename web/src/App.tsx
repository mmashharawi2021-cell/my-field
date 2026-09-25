import { NavLink, Navigate, Route, Routes } from 'react-router-dom'
import DashboardPage from './pages/DashboardPage'
import MapPage from './pages/MapPage'
import ProjectsPage from './pages/ProjectsPage'

const nav = [
  ['/', 'لوحة التحكم', '▦'],
  ['/map', 'الخريطة', '⌖'],
  ['/projects', 'المشاريع', '▣'],
] as const

export default function App() {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">MF</div>
          <div>
            <strong>My Field</strong>
            <span>Field GIS Platform</span>
          </div>
        </div>
        <nav className="nav-list" aria-label="التنقل الرئيسي">
          {nav.map(([to, label, icon]) => (
            <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <span className="nav-icon">{icon}</span>
              <span>{label}</span>
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

      <main className="main-area">
        <header className="topbar">
          <div>
            <h1>My Field</h1>
            <p>منصة GIS ميدانية — Offline Ready</p>
          </div>
          <div className="top-actions">
            <span className="status-pill">V1 Foundation</span>
            <div className="avatar">م</div>
          </div>
        </header>

        <section className="content-area">
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/map" element={<MapPage />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </section>
      </main>
    </div>
  )
}
