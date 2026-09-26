import { FeatureDetailsPanel } from '../features/map/components/FeatureDetailsPanel'
import { LayerPanel } from '../features/map/components/LayerPanel'
import { MapCanvas } from '../features/map/components/MapCanvas'
import { PREVIEW_MODE } from '../services/api'

export default function MapPage() {
  return (
    <div className="map-layout">
      <LayerPanel />
      <MapCanvas />
      {PREVIEW_MODE && <FeatureDetailsPanel />}
    </div>
  )
}
