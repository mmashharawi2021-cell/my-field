export type LayerInput = {
  name: string
  geometry_type: 'Point' | 'LineString' | 'Polygon'
  srid: number
  status: 'active' | 'draft'
  style_json: Record<string, unknown>
}
export type Layer = Omit<LayerInput, 'status'> & {
  id: string; project_id: string; status: 'active' | 'draft' | 'archived'; created_at: string
}
