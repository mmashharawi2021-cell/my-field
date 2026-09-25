import { HashRouter } from 'react-router-dom'
import { AppProviders } from './AppProviders'
import { AppRoutes } from './AppRoutes'

export default function App() {
  return (
    <AppProviders>
      <HashRouter>
        <AppRoutes />
      </HashRouter>
    </AppProviders>
  )
}
