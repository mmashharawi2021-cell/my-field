export type Position = [number, number]
export type GeoJsonGeometry =
  | { type: 'Point'; coordinates: Position }
  | { type: 'LineString'; coordinates: Position[] }
  | { type: 'Polygon'; coordinates: Position[][] }

export type MapFeature = {
  id: string
  project_id: string
  layer_id: string
  geometry: GeoJsonGeometry
  properties: Record<string, unknown>
  version: number
  created_by: string | null
  updated_by: string | null
  created_at: string
  updated_at: string
}

export type FeatureVersion = Pick<MapFeature, 'version' | 'geometry' | 'properties'> & {
  changed_by: string | null
  changed_at: string
}

export type FeatureChange = {
  id: number
  operation: 'create' | 'update' | 'delete'
  version: number
  payload: Record<string, unknown>
  changed_by: string | null
  changed_at: string
}
