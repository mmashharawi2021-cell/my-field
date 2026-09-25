import { ActionButton } from '../../../components/ui/ActionButton'
import { previewLayers } from '../data/mapLayers'

export function LayerPanel() {
  return (
    <aside className="map-panel">
      <span className="eyebrow">Layer Manager</span>
      <h3>الطبقات</h3>

      {previewLayers.map((layer) => (
        <label className="layer-row" key={layer.id}>
          <input type="checkbox" defaultChecked={layer.visible} />
          <span>
            <strong>{layer.name}</strong>
            <small>{layer.geometryType}</small>
          </span>
          <b>{layer.featureCount.toLocaleString('en-US')}</b>
        </label>
      ))}

      <div className="map-panel-divider" />
      <ActionButton variant="primary" fullWidth>+ إضافة طبقة</ActionButton>
    </aside>
  )
}
