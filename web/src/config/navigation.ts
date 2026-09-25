export type NavigationItem = {
  to: string
  label: string
  icon: string
  end?: boolean
}

export const navigationItems: NavigationItem[] = [
  { to: '/', label: 'لوحة التحكم', icon: '▦', end: true },
  { to: '/map', label: 'الخريطة', icon: '⌖' },
  { to: '/projects', label: 'المشاريع', icon: '▣' },
]
