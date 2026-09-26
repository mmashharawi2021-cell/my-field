import { create } from 'zustand'
import { api, PREVIEW_MODE } from '../services/api'
import { session } from '../services/session'
import type { UserProfile } from '../types/auth'

type AuthState = {
  user: UserProfile | null
  isAuthenticated: boolean
  isLoggingIn: boolean
  error: string | null
  login: (username: string, password: string) => Promise<void>
  loginPreview: () => Promise<void>
  logout: () => void
}

const storedUser = session.getUser()
const hasSession = Boolean(session.getAccessToken() && storedUser)

export const useAuthStore = create<AuthState>((set) => ({
  user: storedUser,
  isAuthenticated: hasSession,
  isLoggingIn: false,
  error: null,

  login: async (username, password) => {
    set({ isLoggingIn: true, error: null })
    try {
      const tokens = await api.auth.login(username, password)
      session.setTokens(tokens.access_token, tokens.refresh_token)
      const user = await api.auth.me()
      session.setUser(user)
      set({ user, isAuthenticated: true, isLoggingIn: false })
    } catch (error) {
      session.clear()
      set({
        user: null,
        isAuthenticated: false,
        isLoggingIn: false,
        error: error instanceof Error ? error.message : 'تعذر تسجيل الدخول',
      })
      throw error
    }
  },

  loginPreview: async () => {
    if (!PREVIEW_MODE) return
    set({ isLoggingIn: true, error: null })
    try {
      const tokens = await api.auth.login('preview@myfield.local', 'preview-mode')
      session.setTokens(tokens.access_token, tokens.refresh_token)
      const user = await api.auth.me()
      session.setUser(user)
      set({ user, isAuthenticated: true, isLoggingIn: false })
    } catch {
      set({ isLoggingIn: false, error: 'تعذر فتح وضع المعاينة' })
    }
  },

  logout: () => {
    session.clear()
    set({ user: null, isAuthenticated: false, error: null })
  },
}))

if (typeof window !== 'undefined') {
  window.addEventListener('myfield:session-cleared', () => {
    useAuthStore.setState({ user: null, isAuthenticated: false })
  })
}
