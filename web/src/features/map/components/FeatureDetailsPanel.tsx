const rows = [
  ['UUID', '—'],
  ['Version', '—'],
  ['Sync', '—'],
]

export function FeatureDetailsPanel() {
  return (
    <aside className="details-panel">
      <span className="eyebrow">التفاصيل</span>
      <h3>لا يوجد تحديد</h3>
      <p>اختر Feature من الخريطة لعرض الخصائص والنموذج والسجل التاريخي.</p>

      {rows.map(([label, value]) => (
        <div className="detail-placeholder" key={label}>
          <span>{label}</span>
          <b>{value}</b>
        </div>
      ))}
    </aside>
  )
}
