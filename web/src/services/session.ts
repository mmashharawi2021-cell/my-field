import type { UserProfile } from '../types/auth'

const ACCESS_KEY = 'myfield.access'
const REFRESH_KEY = 'myfield.refresh'
const USER_KEY = 'myfield.user'

function storage() {
  return typeof window === 'undefined' ? null : window.sessionStorage
}

export const session = {
  getAccessToken(): string | null {
    return storage()?.getItem(ACCESS_KEY) ?? null
  },

  getRefreshToken(): string | null {
    return storage()?.getItem(REFRESH_KEY) ?? null
  },

  getUser(): UserProfile | null {
    const raw = storage()?.getItem(USER_KEY)
    if (!raw) return null
    try {
      return JSON.parse(raw) as UserProfile
    } catch {
      return null
    }
  },

  setTokens(accessToken: string, refreshToken: string) {
    storage()?.setItem(ACCESS_KEY, accessToken)
    storage()?.setItem(REFRESH_KEY, refreshToken)
  },

  setUser(user: UserProfile) {
    storage()?.setItem(USER_KEY, JSON.stringify(user))
  },

  clear() {
    storage()?.removeItem(ACCESS_KEY)
    storage()?.removeItem(REFRESH_KEY)
    storage()?.removeItem(USER_KEY)
  },
}
