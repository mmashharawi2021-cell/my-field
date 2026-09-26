import { authorizedRequest, PREVIEW_MODE } from './api'
import { managementPreview } from './managementPreview'
import type { UserProfile } from '../types/auth'
import type { Role, UserInput, UserUpdate } from '../types/user'

export const usersApi = {
  roles: () => PREVIEW_MODE ? managementPreview.roles() : authorizedRequest<Role[]>('/roles'),
  list: () => PREVIEW_MODE ? managementPreview.users() : authorizedRequest<UserProfile[]>('/users'),
  create: (input: UserInput) => PREVIEW_MODE ? managementPreview.createUser(input) : authorizedRequest<UserProfile>('/users', { method: 'POST', body: JSON.stringify(input) }),
  update: (id: string, input: UserUpdate) => PREVIEW_MODE ? managementPreview.updateUser(id, input) : authorizedRequest<UserProfile>('/users/' + id, { method: 'PATCH', body: JSON.stringify(input) }),
  status: (id: string, is_active: boolean) => PREVIEW_MODE ? managementPreview.updateUser(id, { is_active }) : authorizedRequest<UserProfile>('/users/' + id + '/status', { method: 'PATCH', body: JSON.stringify({ is_active }) }),
}
