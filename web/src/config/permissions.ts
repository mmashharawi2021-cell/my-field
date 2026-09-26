export const canManageUsers = (role?: string) => ['super_admin', 'admin'].includes(role ?? '')
export const canManageLayers = (role?: string) => ['super_admin', 'admin', 'gis_manager'].includes(role ?? '')
export const canEditUser = (actorRole: string, targetRole: string) =>
  actorRole === 'super_admin' || (actorRole === 'admin' && !['super_admin', 'admin'].includes(targetRole))
