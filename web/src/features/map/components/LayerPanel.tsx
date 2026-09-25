import { ActionButton } from '../../../components/ui/ActionButton'
import { AppIcon } from '../../../components/ui/AppIcon'
import { previewLayers } from '../data/mapLayers'

export function LayerPanel() {
  return (
    <aside className="map-panel">
      <div className="map-panel-heading">
        <div>
          <span className="eyebrow">المحتوى المكاني</span>
          <h3>الطبقات</h3>
        </div>
        <span className="layer-count-badge">{previewLayers.length}</span>
      </div>

      <div className="layer-list">
        {previewLayers.map((layer) => (
          <label className="layer-row layer-row--new" key={layer.id}>
            <input type="checkbox" defaultChecked={layer.visible} />
            <span className="layer-symbol"><AppIcon name="layers" size={16} /></span>
            <span className="layer-copy">
              <strong>{layer.name}</strong>
              <small>{layer.geometryType}</small>
            </span>
            <b>{layer.featureCount.toLocaleString('en-US')}</b>
          </label>
        ))}
      </div>

      <div className="map-panel-divider" />
      <ActionButton variant="primary" fullWidth>
        <AppIcon name="plus" size={16} />
        إضافة طبقة
      </ActionButton>
    </aside>
  )
}
