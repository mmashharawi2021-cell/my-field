export type UserProfile = {
  id: string
  username: string
  full_name: string
  role: string
  is_active: boolean
}

export type TokenPair = {
  access_token: string
  refresh_token: string
  token_type: string
}
