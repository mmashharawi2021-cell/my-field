import { useEffect, useRef } from 'react'
import { Map, NavigationControl } from 'maplibre-gl'

export default function MapPage() {
  const container = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<Map | null>(null)

  useEffect(() => {
    if (!container.current || mapRef.current) return
    const map = new Map({
      container: container.current,
      style: {
        version: 8,
        sources: {},
        layers: [{ id: 'background', type: 'background', paint: { 'background-color': '#e8efee' } }],
      },
      center: [34.45, 31.5],
      zoom: 9,
      attributionControl: false,
    })
    map.addControl(new NavigationControl({ showCompass: true }), 'top-left')
    mapRef.current = map
    return () => { map.remove(); mapRef.current = null }
  }, [])

  return (
    <div className="map-layout">
      <aside className="map-panel">
        <span className="eyebrow">Layer Manager</span>
        <h3>الطبقات</h3>
        <label className="layer-row"><input type="checkbox" defaultChecked /><span><strong>المباني</strong><small>Polygon</small></span><b>8,204</b></label>
        <label className="layer-row"><input type="checkbox" defaultChecked /><span><strong>المرافق</strong><small>Point</small></span><b>1,842</b></label>
        <label className="layer-row"><input type="checkbox" /><span><strong>الطرق</strong><small>Line</small></span><b>640</b></label>
        <div className="map-panel-divider" />
        <button className="primary-btn full">+ إضافة طبقة</button>
      </aside>
      <div className="map-canvas-wrap">
        <div className="map-toolbar"><button>⌕</button><button>⌖</button><button>△</button><button>↔</button></div>
        <div ref={container} className="map-canvas" aria-label="خريطة My Field" />
        <div className="map-empty-note">الخريطة جاهزة — سيتم ربط Basemap والطبقات من PostGIS في المرحلة التالية.</div>
      </div>
      <aside className="details-panel">
        <span className="eyebrow">التفاصيل</span>
        <h3>لا يوجد تحديد</h3>
        <p>اختر Feature من الخريطة لعرض الخصائص والنموذج والسجل التاريخي.</p>
        <div className="detail-placeholder"><span>UUID</span><b>—</b></div>
        <div className="detail-placeholder"><span>Version</span><b>—</b></div>
        <div className="detail-placeholder"><span>Sync</span><b>—</b></div>
      </aside>
    </div>
  )
}
