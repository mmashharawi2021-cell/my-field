import { FeatureDetailsPanel } from '../features/map/components/FeatureDetailsPanel'
import { LayerPanel } from '../features/map/components/LayerPanel'
import { MapCanvas } from '../features/map/components/MapCanvas'
import { MapWorkspaceProvider } from '../features/map/MapWorkspaceContext'

export default function MapPage() {
  return (
    <MapWorkspaceProvider>
      <div className="map-layout">
        <LayerPanel />
        <MapCanvas />
        <FeatureDetailsPanel />
      </div>
    </MapWorkspaceProvider>
  )
}
