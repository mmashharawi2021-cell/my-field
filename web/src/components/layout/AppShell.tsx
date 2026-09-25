import type { PropsWithChildren } from 'react'
import { DesktopSidebar } from '../navigation/DesktopSidebar'
import { MobileBottomNav } from '../navigation/MobileBottomNav'
import { TopBar } from './TopBar'

export function AppShell({ children }: PropsWithChildren) {
  return (
    <div className="app-shell">
      <DesktopSidebar />
      <main className="main-area">
        <TopBar />
        <section className="content-area">{children}</section>
      </main>
      <MobileBottomNav />
    </div>
  )
}
