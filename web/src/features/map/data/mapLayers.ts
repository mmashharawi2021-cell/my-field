export type PreviewLayer = {
  id: string
  name: string
  geometryType: 'Point' | 'Line' | 'Polygon'
  featureCount: number
  visible: boolean
}

export const previewLayers: PreviewLayer[] = [
  { id: 'buildings', name: 'المباني', geometryType: 'Polygon', featureCount: 8204, visible: true },
  { id: 'facilities', name: 'المرافق', geometryType: 'Point', featureCount: 1842, visible: true },
  { id: 'roads', name: 'الطرق', geometryType: 'Line', featureCount: 640, visible: false },
]
