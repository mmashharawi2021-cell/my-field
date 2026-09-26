import { createContext, useContext, useMemo, useState, type PropsWithChildren } from 'react'
import type { Layer } from '../../types/layer'
import type { MapFeature, Position } from '../../types/feature'

type Workspace = {
  activeLayer: Layer | null
  setActiveLayer: (layer: Layer | null) => void
  selectedFeature: MapFeature | null
  setSelectedFeature: (feature: MapFeature | null) => void
  drawing: boolean
  setDrawing: (drawing: boolean) => void
  redrawFeature: MapFeature | null
  setRedrawFeature: (feature: MapFeature | null) => void
  vertices: Position[]
  setVertices: (vertices: Position[]) => void
  finishSignal: number
  requestFinish: () => void
  undoVertices: () => void
  redoVertices: () => void
  canUndo: boolean
  canRedo: boolean
  locationSignal: number
  requestLocation: () => void
  locationAccuracy: number | null
  setLocationAccuracy: (accuracy: number | null) => void
}

const Context = createContext<Workspace | null>(null)

export function MapWorkspaceProvider({ children }: PropsWithChildren) {
  const [activeLayer, setActiveLayer] = useState<Layer | null>(null)
  const [selectedFeature, setSelectedFeature] = useState<MapFeature | null>(null)
  const [drawing, setDrawing] = useState(false)
  const [redrawFeature, setRedrawFeature] = useState<MapFeature | null>(null)
  const [vertices, setVertices] = useState<Position[]>([])
  const [finishSignal, setFinishSignal] = useState(0)
  const [past, setPast] = useState<Position[][]>([])
  const [future, setFuture] = useState<Position[][]>([])
  const [locationSignal, setLocationSignal] = useState(0)
  const [locationAccuracy, setLocationAccuracy] = useState<number | null>(null)
  const updateVertices = (next: Position[]) => { setPast((items) => [...items.slice(-29), vertices]); setFuture([]); setVertices(next) }
  const undoVertices = () => { const previous = past.at(-1); if (!previous) return; setFuture((items) => [vertices, ...items]); setVertices(previous); setPast((items) => items.slice(0, -1)) }
  const redoVertices = () => { const next = future[0]; if (!next) return; setPast((items) => [...items, vertices]); setVertices(next); setFuture((items) => items.slice(1)) }
  const value = useMemo(() => ({ activeLayer, setActiveLayer, selectedFeature, setSelectedFeature, drawing, setDrawing, redrawFeature, setRedrawFeature, vertices, setVertices: updateVertices, finishSignal, requestFinish: () => setFinishSignal((value) => value + 1), undoVertices, redoVertices, canUndo: past.length > 0, canRedo: future.length > 0, locationSignal, requestLocation: () => setLocationSignal((value) => value + 1), locationAccuracy, setLocationAccuracy }), [activeLayer, selectedFeature, drawing, redrawFeature, vertices, finishSignal, past, future, locationSignal, locationAccuracy])
  return <Context.Provider value={value}>{children}</Context.Provider>
}

export function useMapWorkspace() {
  const value = useContext(Context)
  if (!value) throw new Error('Map workspace is unavailable')
  return value
}

