import { PageTransition } from './PageTransition'
import { AppShell } from '../components/layout/AppShell'

export function ProtectedLayout() {
  return (
    <AppShell>
      <PageTransition />
    </AppShell>
  )
}
