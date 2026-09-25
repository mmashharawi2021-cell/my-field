import { dashboardStats } from '../data/dashboardData'
import { StatCard } from './StatCard'

export function StatsGrid() {
  return (
    <section className="stats-grid">
      {dashboardStats.map((item) => <StatCard key={item.label} item={item} />)}
    </section>
  )
}
