import { HashRouter } from 'react-router-dom'
import { AppProviders } from './AppProviders'
import { AppRoutes } from './AppRoutes'
import { AppShell } from '../components/layout/AppShell'

export default function App() {
  return (
    <AppProviders>
      <HashRouter>
        <AppShell>
          <AppRoutes />
        </AppShell>
      </HashRouter>
    </AppProviders>
  )
}
