import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { api, PREVIEW_MODE } from '../../../services/api'
import { AppIcon } from '../../../components/ui/AppIcon'

export function DashboardHero() {
  const health = useQuery({
    queryKey: ['health'],
    queryFn: api.health,
    refetchInterval: 30_000,
  })

  const stateLabel = PREVIEW_MODE
    ? 'معاينة مباشرة'
    : health.isLoading
      ? 'جارِ الفحص…'
      : health.isError
        ? 'الخادم غير متاح'
        : 'متصل بالخادم'

  return (
    <section className="hero-panel hero-panel--new">
      <div className="hero-copy">
        <div className="hero-kicker">
          <span className="hero-live-dot" />
          مساحة العمل الميداني
        </div>
        <h2>كل بيانات الميدان<br /><span>في مكان واحد.</span></h2>
        <p>أدر المشاريع والطبقات والمهام والمزامنة من لوحة GIS واحدة مصممة للعمل المكتبي والميداني.</p>

        <div className="hero-actions">
          <Link to="/map" className="hero-action hero-action--primary">
            <AppIcon name="map" size={18} />
            فتح الخريطة
          </Link>
          <Link to="/projects" className="hero-action">
            <AppIcon name="projects" size={18} />
            عرض المشاريع
          </Link>
        </div>
      </div>

      <div className="hero-status-card">
        <div className="hero-status-top">
          <span>حالة المنصة</span>
          <b>{stateLabel}</b>
        </div>
        <div className="hero-status-map">
          <span className="pulse-ring" />
          <span className="pulse-core" />
          <div className="hero-grid-lines" />
        </div>
        <div className="hero-status-bottom">
          <span>{health.data?.service ?? 'My Field Preview'}</span>
          <strong>Offline Ready</strong>
        </div>
      </div>
    </section>
  )
}
