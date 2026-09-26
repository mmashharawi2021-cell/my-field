import type { PropsWithChildren } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useEffect } from 'react'
import { useAuthStore } from '../stores/authStore'
import { startSyncEngine } from '../services/syncEngine'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 15_000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})

export function AppProviders({ children }: PropsWithChildren) {
  useEffect(() => startSyncEngine(), [])
  useEffect(() => {
    const refresh = () => void queryClient.invalidateQueries({ queryKey: ['features'] })
    window.addEventListener('myfield:sync-change', refresh)
    return () => window.removeEventListener('myfield:sync-change', refresh)
  }, [])
  useEffect(() => useAuthStore.subscribe((state, previous) => {
    if (state.user?.id !== previous.user?.id || state.user?.role !== previous.user?.role || state.isAuthenticated !== previous.isAuthenticated) {
      queryClient.clear()
    }
  }), [])
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}

