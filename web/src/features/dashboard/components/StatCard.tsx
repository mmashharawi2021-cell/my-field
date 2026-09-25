import type { StatItem } from '../data/dashboardData'

export function StatCard({ item }: { item: StatItem }) {
  return (
    <article className="stat-card stat-card--new">
      <div className="stat-card-top">
        <span>{item.label}</span>
        <span className="stat-spark" aria-hidden="true" />
      </div>
      <strong>{item.value}</strong>
      <small>{item.note}</small>
    </article>
  )
}
