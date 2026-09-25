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
        sources: {},
        layers: [
          {
            id: 'background',
            type: 'background',
            paint: { 'background-color': '#e8efee' },
          },
        ],
      },
      center: [34.45, 31.5],
      zoom: 9,
      attributionControl: false,
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
      <div className="map-empty-note">
        الخريطة جاهزة — سيتم ربط Basemap والطبقات من PostGIS في المرحلة التالية.
      </div>
    </div>
  )
}
