import { useQuery } from '@tanstack/react-query'
import { api, PREVIEW_MODE } from '../../../services/api'

export function DashboardHero() {
  const health = useQuery({
    queryKey: ['health'],
    queryFn: api.health,
    refetchInterval: 30_000,
  })

  const stateLabel = PREVIEW_MODE
    ? 'وضع المعاينة'
    : health.isLoading
      ? 'جارِ الفحص…'
      : health.isError
        ? 'غير متصل'
        : 'سليم'

  return (
    <section className="hero-panel">
      <div className="hero-copy">
        <span className="eyebrow">لوحة التحكم</span>
        <h2>مرحبًا بك في My Field</h2>
        <p>النواة الأولى للمنصة جاهزة لتصبح مركز إدارة المشاريع والطبقات والعمل الميداني والمزامنة.</p>
      </div>

      <div className={['health-card', health.isError ? 'danger' : ''].filter(Boolean).join(' ')}>
        <span>حالة النظام</span>
        <strong>{stateLabel}</strong>
        <small>{health.data ? health.data.service + ' · ' + health.data.version : 'API Health Check'}</small>
      </div>
    </section>
  )
}
