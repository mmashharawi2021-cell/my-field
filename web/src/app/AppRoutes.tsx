import { Navigate, Route, Routes } from 'react-router-dom'
import DashboardPage from '../pages/DashboardPage'
import MapPage from '../pages/MapPage'
import ProjectsPage from '../pages/ProjectsPage'

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<DashboardPage />} />
      <Route path="/map" element={<MapPage />} />
      <Route path="/projects" element={<ProjectsPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
