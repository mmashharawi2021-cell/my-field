import { ActionButton } from '../../../components/ui/ActionButton'

const tools = [
  { id: 'search', label: 'بحث', icon: '⌕' },
  { id: 'locate', label: 'الموقع', icon: '⌖' },
  { id: 'select', label: 'تحديد', icon: '△' },
  { id: 'measure', label: 'قياس', icon: '↔' },
]

export function MapToolbar() {
  return (
    <div className="map-toolbar" aria-label="أدوات الخريطة">
      {tools.map((tool) => (
        <ActionButton key={tool.id} variant="icon" title={tool.label} aria-label={tool.label}>
          {tool.icon}
        </ActionButton>
      ))}
    </div>
  )
}
