import { useState, type FormEvent } from 'react'
import { FormDialog } from '../../../components/ui/FormDialog'
import { ActionButton } from '../../../components/ui/ActionButton'
import type { UserProfile } from '../../../types/auth'
import type { Role, RoleCode, UserInput } from '../../../types/user'

export function UserForm({ user, roles, actor, busy, onClose, onSave }: {
  user: UserProfile | null; roles: Role[]; actor: UserProfile; busy: boolean
  onClose: () => void; onSave: (input: UserInput) => Promise<unknown>
}) {
  const [username, setUsername] = useState(user?.username ?? '')
  const [name, setName] = useState(user?.full_name ?? '')
  const [role, setRole] = useState<RoleCode>((user?.role as RoleCode) ?? 'viewer')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  async function submit(event: FormEvent) {
    event.preventDefault(); setError('')
    try { await onSave({ username, full_name: name.trim(), role, password }) }
    catch (err) { setError(err instanceof Error ? err.message : 'تعذر الحفظ') }
  }
  return <FormDialog title={user ? 'تعديل المستخدم' : 'إنشاء مستخدم'} onClose={onClose} busy={busy}>
    <form className="project-form" onSubmit={submit}>
      <label>اسم المستخدم<input required minLength={3} maxLength={80} autoComplete="off" disabled={!!user} value={username} onChange={(e) => setUsername(e.target.value)} /></label>
      <label>الاسم الكامل<input required minLength={2} maxLength={180} value={name} onChange={(e) => setName(e.target.value)} /></label>
      {!user && <label>كلمة المرور (12 حرفًا على الأقل)<input required minLength={12} maxLength={256} type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} /></label>}
      <label>الدور<select value={role} disabled={user?.id === actor.id} onChange={(e) => setRole(e.target.value as RoleCode)}>
        {roles.filter((item) => actor.role === 'super_admin' || !['admin', 'super_admin'].includes(item.code)).map((item) => <option key={item.code} value={item.code}>{item.name}</option>)}
      </select></label>
      {error && <p role="alert">{error}</p>}
      <ActionButton type="submit" variant="primary" disabled={busy || !roles.length}>{busy ? 'جارِ الحفظ…' : 'حفظ'}</ActionButton>
    </form>
  </FormDialog>
}
