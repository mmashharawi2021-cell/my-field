import { useCallback, useEffect, useRef, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Map, NavigationControl, type GeoJSONSource, type MapMouseEvent } from 'maplibre-gl'
import { MapToolbar } from './MapToolbar'
import { Notice } from '../../../components/ui/Notice'
import { featuresApi } from '../../../services/features'
import { useMapWorkspace } from '../MapWorkspaceContext'
import type { GeoJsonGeometry, MapFeature, Position } from '../../../types/feature'
import { SyncIndicator } from '../../sync/SyncIndicator'

const emptyCollection = { type: 'FeatureCollection' as const, features: [] }

export function MapCanvas() {
  const container = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<Map | null>(null)
  const workspace = useMapWorkspace()
  const stateRef = useRef(workspace)
  stateRef.current = workspace
  const cache = useQueryClient()
  const [mapReady, setMapReady] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const features = useQuery({ queryKey: ['features', workspace.activeLayer?.id], queryFn: () => featuresApi.list(workspace.activeLayer!.id), enabled: !!workspace.activeLayer })
  const featuresRef = useRef<MapFeature[]>([])
  featuresRef.current = features.data ?? []

  const save = useMutation({
    mutationFn: ({ geometry, target }: { geometry: GeoJsonGeometry; target: MapFeature | null }) => target ? featuresApi.update(target, { geometry }) : featuresApi.create(stateRef.current.activeLayer!.id, geometry),
    onSuccess: async (feature) => {
      workspace.setDrawing(false); workspace.setRedrawFeature(null); workspace.setVertices([]); workspace.setSelectedFeature(feature); setError(null)
      await Promise.all([cache.invalidateQueries({ queryKey: ['features', feature.layer_id] }), cache.invalidateQueries({ queryKey: ['projects'] })])
    },
    onError: (reason) => setError(reason instanceof Error ? reason.message : 'تعذر حفظ المعلم'),
  })
  const saveRef = useRef(save.mutate)
  saveRef.current = save.mutate

  const finish = useCallback((positions = stateRef.current.vertices) => {
    const { activeLayer, redrawFeature } = stateRef.current
    if (!activeLayer || !positions[0]) return
    let geometry: GeoJsonGeometry
    if (activeLayer.geometry_type === 'Point') geometry = { type: 'Point', coordinates: positions[0] }
    else if (activeLayer.geometry_type === 'LineString') {
      if (positions.length < 2) return
      geometry = { type: 'LineString', coordinates: positions }
    } else {
      if (positions.length < 3) return
      geometry = { type: 'Polygon', coordinates: [[...positions, positions[0]]] }
    }
    saveRef.current({ geometry, target: redrawFeature })
  }, [])

  useEffect(() => { if (workspace.finishSignal) finish() }, [workspace.finishSignal, finish])

  useEffect(() => {
    if (!container.current || mapRef.current) return
    const map = new Map({
      container: container.current,
      style: { version: 8, sources: { osm: { type: 'raster', tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'], tileSize: 256, maxzoom: 19, attribution: '© OpenStreetMap contributors' } }, layers: [{ id: 'osm-base', type: 'raster', source: 'osm' }] },
      center: [34.466, 31.51], zoom: 11, attributionControl: { compact: true },
    })
    map.addControl(new NavigationControl({ showCompass: true }), 'top-left')
    map.on('load', () => {
      map.addSource('workspace-features', { type: 'geojson', data: emptyCollection })
      map.addSource('drawing-preview', { type: 'geojson', data: emptyCollection })
      map.addLayer({ id: 'feature-fill', type: 'fill', source: 'workspace-features', filter: ['==', '$type', 'Polygon'], paint: { 'fill-color': ['coalesce', ['get', '__color'], '#0b8a7d'], 'fill-opacity': .28, 'fill-outline-color': '#075f57' } })
      map.addLayer({ id: 'feature-line', type: 'line', source: 'workspace-features', filter: ['==', '$type', 'LineString'], paint: { 'line-color': ['coalesce', ['get', '__color'], '#0b8a7d'], 'line-width': 4 } })
      map.addLayer({ id: 'feature-point', type: 'circle', source: 'workspace-features', filter: ['==', '$type', 'Point'], paint: { 'circle-radius': 7, 'circle-color': ['coalesce', ['get', '__color'], '#0b8a7d'], 'circle-stroke-width': 2, 'circle-stroke-color': '#fff' } })
      map.addLayer({ id: 'drawing-line', type: 'line', source: 'drawing-preview', paint: { 'line-color': '#f59e0b', 'line-width': 3, 'line-dasharray': [2, 1] } })
      map.addLayer({ id: 'drawing-points', type: 'circle', source: 'drawing-preview', paint: { 'circle-radius': 5, 'circle-color': '#f59e0b', 'circle-stroke-color': '#fff', 'circle-stroke-width': 2 } })
      setMapReady(true)
    })
    map.on('click', (event: MapMouseEvent) => {
      const current = stateRef.current
      if (current.drawing && current.activeLayer) {
        const next = [...current.vertices, [event.lngLat.lng, event.lngLat.lat] as Position]
        current.setVertices(next)
        if (current.activeLayer.geometry_type === 'Point') finish(next)
        return
      }
      const hit = map.queryRenderedFeatures(event.point, { layers: ['feature-point', 'feature-line', 'feature-fill'] })[0]
      current.setSelectedFeature(featuresRef.current.find((feature) => feature.id === hit?.properties?.__id) ?? null)
    })
    mapRef.current = map
    return () => { map.remove(); mapRef.current = null }
  }, [finish])

  useEffect(() => {
    const map = mapRef.current
    if (!mapReady || !map) return
    const color = typeof workspace.activeLayer?.style_json.color === 'string' ? workspace.activeLayer.style_json.color : '#0b8a7d'
    ;(map.getSource('workspace-features') as GeoJSONSource).setData({ type: 'FeatureCollection', features: (features.data ?? []).map((feature) => ({ type: 'Feature', id: feature.id, geometry: feature.geometry, properties: { ...feature.properties, __id: feature.id, __color: color } })) })
  }, [features.data, workspace.activeLayer, mapReady])

  useEffect(() => {
    const map = mapRef.current
    if (!mapReady || !map) return
    const points = workspace.vertices
    const preview = points.length === 0 ? emptyCollection : { type: 'FeatureCollection' as const, features: [
      ...(points.length > 1 ? [{ type: 'Feature' as const, properties: {}, geometry: { type: 'LineString' as const, coordinates: points } }] : []),
      ...points.map((point, index) => ({ type: 'Feature' as const, properties: { index }, geometry: { type: 'Point' as const, coordinates: point } })),
    ] }
    ;(map.getSource('drawing-preview') as GeoJSONSource).setData(preview)
    map.getCanvas().style.cursor = workspace.drawing ? 'crosshair' : ''
  }, [workspace.vertices, workspace.drawing, mapReady])

  return <div className="map-canvas-wrap">
    <MapToolbar />
    <SyncIndicator />
    {(error || features.error) && <div className="map-notice"><Notice>{error ?? features.error?.message}</Notice></div>}
    <div ref={container} className="map-canvas" aria-label="خريطة My Field" />
    <div className="map-status-badge"><span className="map-status-dot" />{features.isFetching ? 'جارِ تحميل المعالم…' : `${features.data?.length ?? 0} معلم · ${navigator.onLine ? 'OpenStreetMap' : 'نسخة محلية'}`}</div>
  </div>
}

