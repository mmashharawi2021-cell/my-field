import { ActionButton } from '../../../components/ui/ActionButton'
import { AppIcon } from '../../../components/ui/AppIcon'
import { canEditFeatures } from '../../../config/permissions'
import { useAuthStore } from '../../../stores/authStore'
import { useMapWorkspace } from '../MapWorkspaceContext'

export function MapToolbar() {
  const canEdit = canEditFeatures(useAuthStore((state) => state.user?.role))
  const { activeLayer, drawing, vertices, setDrawing, setRedrawFeature, setVertices, requestFinish } = useMapWorkspace()
  const minimum = activeLayer?.geometry_type === 'Polygon' ? 3 : 2
  const shape = !activeLayer ? 'معلم' : activeLayer.geometry_type === 'Point' ? 'نقطة' : activeLayer.geometry_type === 'LineString' ? 'خط' : 'مضلع'

  function cancel() {
    setDrawing(false); setRedrawFeature(null); setVertices([])
  }

  return <div className="map-toolbar" aria-label="أدوات الخريطة">
    {!drawing && <>
      <ActionButton variant="icon" title="تحديد معلم" aria-label="تحديد معلم"><AppIcon name="select" size={18} /></ActionButton>
      {canEdit && <ActionButton variant="primary" disabled={!activeLayer || activeLayer.status !== 'active'} onClick={() => { setVertices([]); setDrawing(true) }}>
        <AppIcon name="plus" size={18} /> رسم {shape}
      </ActionButton>}
    </>}
    {drawing && <>
      {activeLayer?.geometry_type !== 'Point' && <ActionButton variant="primary" disabled={vertices.length < minimum} onClick={requestFinish}>إنهاء الرسم</ActionButton>}
      <ActionButton variant="ghost" onClick={cancel}>إلغاء</ActionButton>
      <span className="draw-help">{activeLayer?.geometry_type === 'Point' ? 'انقر لتحديد الموقع' : `النقاط: ${vertices.length}`}</span>
    </>}
  </div>
}
