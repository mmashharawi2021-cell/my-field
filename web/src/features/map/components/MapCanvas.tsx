import { useEffect, useRef } from 'react'
import { Map, NavigationControl } from 'maplibre-gl'
import { MapToolbar } from './MapToolbar'

export function MapCanvas() {
  const container = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<Map | null>(null)

  useEffect(() => {
    if (!container.current || mapRef.current) return

    const map = new Map({
      container: container.current,
      style: 'https://demotiles.maplibre.org/style.json',
      center: [34.466, 31.51],
      zoom: 10.2,
      attributionControl: true,
    })

    map.addControl(new NavigationControl({ showCompass: true }), 'top-left')
    mapRef.current = map

    return () => {
      map.remove()
      mapRef.current = null
    }
  }, [])

  return (
    <div className="map-canvas-wrap">
      <MapToolbar />
      <div ref={container} className="map-canvas" aria-label="خريطة My Field" />
      <div className="map-status-badge">
        <span className="map-status-dot" />
        خريطة الأساس متصلة
      </div>
    </div>
  )
}
