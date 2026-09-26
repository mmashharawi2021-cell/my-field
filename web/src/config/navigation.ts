import type { IconName } from '../components/ui/AppIcon'

export type NavigationItem = {
  to: string
  label: string
  icon: IconName
  end?: boolean
  adminOnly?: boolean
}

export const navigationItems: NavigationItem[] = [
  { to: '/', label: 'الرئيسية', icon: 'home', end: true },
  { to: '/map', label: 'الخريطة', icon: 'map' },
  { to: '/projects', label: 'المشاريع', icon: 'projects' },
  { to: '/users', label: 'المستخدمون', icon: 'users', adminOnly: true },
]
