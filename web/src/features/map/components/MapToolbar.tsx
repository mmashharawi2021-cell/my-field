import { ActionButton } from '../../../components/ui/ActionButton'
import { AppIcon, type IconName } from '../../../components/ui/AppIcon'

const tools: Array<{ id: string; label: string; icon: IconName }> = [
  { id: 'search', label: 'بحث', icon: 'search' },
  { id: 'locate', label: 'الموقع', icon: 'locate' },
  { id: 'select', label: 'تحديد', icon: 'select' },
  { id: 'measure', label: 'قياس', icon: 'measure' },
]

export function MapToolbar() {
  return (
    <div className="map-toolbar" aria-label="أدوات الخريطة">
      {tools.map((tool) => (
        <ActionButton key={tool.id} variant="icon" title={tool.label} aria-label={tool.label}>
          <AppIcon name={tool.icon} size={18} />
        </ActionButton>
      ))}
    </div>
  )
}
