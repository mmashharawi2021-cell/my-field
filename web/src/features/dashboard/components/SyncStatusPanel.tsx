import { syncItems } from '../data/dashboardData'

export function SyncStatusPanel() {
  return (
    <article className="panel">
      <div className="panel-head">
        <div>
          <span className="eyebrow">المزامنة</span>
          <h3>حالة البيانات</h3>
        </div>
      </div>

      <div className="sync-list">
        {syncItems.map((item) => (
          <div key={item.label}>
            <span className={'sync-dot ' + item.tone} />
            <strong>{item.label}</strong>
            <b>{item.value}</b>
          </div>
        ))}
      </div>
    </article>
  )
}
