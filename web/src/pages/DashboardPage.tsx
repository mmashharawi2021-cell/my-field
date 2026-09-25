import { DashboardHero } from '../features/dashboard/components/DashboardHero'
import { ProjectProgressPanel } from '../features/dashboard/components/ProjectProgressPanel'
import { StatsGrid } from '../features/dashboard/components/StatsGrid'
import { SyncStatusPanel } from '../features/dashboard/components/SyncStatusPanel'

export default function DashboardPage() {
  return (
    <div className="page-stack">
      <DashboardHero />
      <StatsGrid />
      <section className="split-grid">
        <ProjectProgressPanel />
        <SyncStatusPanel />
      </section>
    </div>
  )
}
