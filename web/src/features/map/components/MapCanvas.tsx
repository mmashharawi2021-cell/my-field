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
      style: {
        version: 8,
        sources: {
          osm: {
            type: 'raster',
            tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
            tileSize: 256,
            maxzoom: 19,
            attribution: '© OpenStreetMap contributors',
          },
        },
        layers: [
          {
            id: 'osm-base',
            type: 'raster',
            source: 'osm',
            minzoom: 0,
            maxzoom: 19,
          },
        ],
      },
      center: [34.466, 31.51],
      zoom: 11,
      attributionControl: { compact: true },
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
        OpenStreetMap · MapLibre
      </div>
    </div>
  )
}
