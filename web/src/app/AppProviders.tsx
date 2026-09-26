import type { PropsWithChildren } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useEffect } from 'react'
import { useAuthStore } from '../stores/authStore'

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
  useEffect(() => useAuthStore.subscribe((state, previous) => {
    if (state.user?.id !== previous.user?.id || state.user?.role !== previous.user?.role || state.isAuthenticated !== previous.isAuthenticated) {
      queryClient.clear()
    }
  }), [])
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}
