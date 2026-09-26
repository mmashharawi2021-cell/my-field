export type RoleCode = 'super_admin' | 'admin' | 'gis_manager' | 'supervisor' | 'reviewer' | 'field_worker' | 'viewer'
export type Role = { code: RoleCode; name: string; description: string | null }
export type UserInput = { username: string; full_name: string; password: string; role: RoleCode }
export type UserUpdate = Pick<UserInput, 'full_name' | 'role'>
