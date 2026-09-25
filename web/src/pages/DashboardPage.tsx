import { useQuery } from '@tanstack/react-query'
import { api, PREVIEW_MODE } from '../services/api'

const stats = [
  ['المشاريع النشطة', '03', '+1 هذا الشهر'],
  ['الطبقات', '18', '12 قابلة للتحرير'],
  ['العناصر المكانية', '12,486', '+327 هذا الأسبوع'],
  ['بانتظار المراجعة', '24', 'تحتاج متابعة'],
]

export default function DashboardPage() {
  const health = useQuery({ queryKey: ['health'], queryFn: api.health, refetchInterval: 30_000 })

  return (
    <div className="page-stack">
      <section className="hero-panel">
        <div>
          <span className="eyebrow">لوحة التحكم</span>
          <h2>مرحبًا بك في My Field</h2>
          <p>النواة الأولى للمنصة جاهزة لتصبح مركز إدارة المشاريع والطبقات والعمل الميداني والمزامنة.</p>
        </div>
        <div className={`health-card ${health.isError ? 'danger' : ''}`}>
          <span>حالة النظام</span>
          <strong>{PREVIEW_MODE ? 'وضع المعاينة' : health.isLoading ? 'جارِ الفحص…' : health.isError ? 'غير متصل' : 'سليم'}</strong>
          <small>{health.data ? `${health.data.service} · ${health.data.version}` : 'API Health Check'}</small>
        </div>
      </section>

      <section className="stats-grid">
        {stats.map(([label, value, note]) => (
          <article className="stat-card" key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
            <small>{note}</small>
          </article>
        ))}
      </section>

      <section className="split-grid">
        <article className="panel">
          <div className="panel-head"><div><span className="eyebrow">العمل الحالي</span><h3>تقدم المشروع</h3></div><button>فتح المشاريع</button></div>
          <div className="progress-row"><div><strong>حصر الأضرار التجريبي</strong><span>68%</span></div><div className="progress-track"><i style={{ width: '68%' }} /></div></div>
          <div className="progress-row"><div><strong>شبكة المياه</strong><span>42%</span></div><div className="progress-track"><i style={{ width: '42%' }} /></div></div>
          <div className="progress-row"><div><strong>بيانات المرافق</strong><span>84%</span></div><div className="progress-track"><i style={{ width: '84%' }} /></div></div>
        </article>

        <article className="panel">
          <div className="panel-head"><div><span className="eyebrow">المزامنة</span><h3>حالة البيانات</h3></div></div>
          <div className="sync-list">
            <div><span className="sync-dot ok" /><strong>متزامن</strong><b>12,438</b></div>
            <div><span className="sync-dot wait" /><strong>معلق</strong><b>37</b></div>
            <div><span className="sync-dot fail" /><strong>فشل</strong><b>8</b></div>
            <div><span className="sync-dot conflict" /><strong>تعارض</strong><b>3</b></div>
          </div>
        </article>
      </section>
    </div>
  )
}
