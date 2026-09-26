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
}

const Context = createContext<Workspace | null>(null)

export function MapWorkspaceProvider({ children }: PropsWithChildren) {
  const [activeLayer, setActiveLayer] = useState<Layer | null>(null)
  const [selectedFeature, setSelectedFeature] = useState<MapFeature | null>(null)
  const [drawing, setDrawing] = useState(false)
  const [redrawFeature, setRedrawFeature] = useState<MapFeature | null>(null)
  const [vertices, setVertices] = useState<Position[]>([])
  const [finishSignal, setFinishSignal] = useState(0)
  const value = useMemo(() => ({ activeLayer, setActiveLayer, selectedFeature, setSelectedFeature, drawing, setDrawing, redrawFeature, setRedrawFeature, vertices, setVertices, finishSignal, requestFinish: () => setFinishSignal((value) => value + 1) }), [activeLayer, selectedFeature, drawing, redrawFeature, vertices, finishSignal])
  return <Context.Provider value={value}>{children}</Context.Provider>
}

export function useMapWorkspace() {
  const value = useContext(Context)
  if (!value) throw new Error('Map workspace is unavailable')
  return value
}
