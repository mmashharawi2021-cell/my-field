import type { StatItem } from '../data/dashboardData'

export function StatCard({ item }: { item: StatItem }) {
  return (
    <article className="stat-card">
      <span>{item.label}</span>
      <strong>{item.value}</strong>
      <small>{item.note}</small>
    </article>
  )
}
