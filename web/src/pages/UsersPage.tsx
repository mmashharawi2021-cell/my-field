import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Navigate } from 'react-router-dom'
import { canEditUser, canManageUsers } from '../config/permissions'
import { useAuthStore } from '../stores/authStore'
import { usersApi } from '../services/users'
import { PREVIEW_MODE } from '../services/api'
import { ActionButton } from '../components/ui/ActionButton'
import { Notice } from '../components/ui/Notice'
import { UserForm } from '../features/users/components/UserForm'
import type { UserProfile } from '../types/auth'
import type { UserInput } from '../types/user'

export default function UsersPage() {
  const actor = useAuthStore((state) => state.user)
  const allowed = canManageUsers(actor?.role)
  const cache = useQueryClient()
  const [editing, setEditing] = useState<UserProfile | null | undefined>(undefined)
  const users = useQuery({ queryKey: ['users', actor?.id], queryFn: usersApi.list, enabled: allowed })
  const roles = useQuery({ queryKey: ['roles'], queryFn: usersApi.roles, enabled: allowed })
  const save = useMutation({
    mutationFn: (input: UserInput) => editing ? usersApi.update(editing.id, { full_name: input.full_name, role: input.role }) : usersApi.create(input),
    onSuccess: async () => { setEditing(undefined); await cache.invalidateQueries({ queryKey: ['users'] }) },
  })
  const status = useMutation({
    mutationFn: (user: UserProfile) => usersApi.status(user.id, !user.is_active),
    onSuccess: async () => { await cache.invalidateQueries({ queryKey: ['users'] }) },
  })
  if (!allowed || !actor) return <Navigate to="/" replace />
  return <div className="page-stack">
    <div className="management-heading"><div><span className="eyebrow">إدارة الحسابات والصلاحيات</span><h2>المستخدمون</h2></div><ActionButton variant="primary" onClick={() => setEditing(null)}>إنشاء مستخدم</ActionButton></div>
    {PREVIEW_MODE && <Notice>بيانات تجريبية مؤقتة. لا تدخل بيانات أو كلمات مرور حقيقية في المعاينة.</Notice>}
    {(users.error || roles.error || status.error) && <Notice>{(users.error || roles.error || status.error)?.message}</Notice>}
    {users.isPending ? <p>جارِ تحميل المستخدمين…</p> : <div className="management-list">{users.data?.map((user) => <article className="management-row" key={user.id}>
      <div><strong>{user.full_name}</strong><p>{user.username} · {user.role} · {user.is_active ? 'نشط' : 'معطل'}</p></div>
      {canEditUser(actor.role, user.role) && <div className="dialog-actions">
        <ActionButton disabled={status.isPending} onClick={() => setEditing(user)}>تعديل</ActionButton>
        <ActionButton disabled={status.isPending || user.id === actor.id} onClick={() => status.mutate(user)}>{user.is_active ? 'تعطيل' : 'تفعيل'}</ActionButton>
      </div>}
    </article>)}</div>}
    {editing !== undefined && <UserForm key={editing?.id ?? 'new'} user={editing} actor={actor} roles={roles.data ?? []} busy={save.isPending} onClose={() => setEditing(undefined)} onSave={save.mutateAsync} />}
  </div>
}
