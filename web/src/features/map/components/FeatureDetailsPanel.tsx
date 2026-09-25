const rows = [
  ['UUID', '—'],
  ['Version', '—'],
  ['Sync', '—'],
]

export function FeatureDetailsPanel() {
  return (
    <aside className="details-panel">
      <div className="details-empty-icon">◎</div>
      <span className="eyebrow">التفاصيل</span>
      <h3>لم يتم تحديد عنصر</h3>
      <p>اختر أي عنصر من الخريطة لعرض الخصائص والنموذج وسجل التعديلات.</p>

      <div className="details-meta">
        {rows.map(([label, value]) => (
          <div className="detail-placeholder" key={label}>
            <span>{label}</span>
            <b>{value}</b>
          </div>
        ))}
      </div>
    </aside>
  )
}
