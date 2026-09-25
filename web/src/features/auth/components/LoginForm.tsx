import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { ActionButton } from '../../../components/ui/ActionButton'
import { PREVIEW_MODE } from '../../../services/api'
import { useAuthStore } from '../../../stores/authStore'

export function LoginForm() {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  const login = useAuthStore((state) => state.login)
  const loginPreview = useAuthStore((state) => state.loginPreview)
  const isLoggingIn = useAuthStore((state) => state.isLoggingIn)
  const error = useAuthStore((state) => state.error)

  async function submit(event: FormEvent) {
    event.preventDefault()
    try {
      await login(username.trim(), password)
      navigate('/', { replace: true })
    } catch {
      // The store exposes the user-facing error.
    }
  }

  async function openPreview() {
    await loginPreview()
    navigate('/', { replace: true })
  }

  return (
    <div className="login-card">
      <div className="login-brand">
        <div className="login-brand-mark">MF</div>
        <div>
          <strong>My Field</strong>
          <span>Secure Field GIS Workspace</span>
        </div>
      </div>

      <div className="login-heading">
        <span className="eyebrow">تسجيل الدخول</span>
        <h1>الدخول إلى مساحة العمل</h1>
        <p>استخدم البريد الإلكتروني أو اسم المستخدم المعرّف على My Field Server.</p>
      </div>

      <form className="login-form" onSubmit={submit}>
        <label>
          <span>البريد / اسم المستخدم</span>
          <input
            type="text"
            autoComplete="username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            placeholder="name@example.com"
            required
          />
        </label>

        <label>
          <span>كلمة المرور</span>
          <input
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="••••••••"
            minLength={8}
            required
          />
        </label>

        {error && <div className="login-error">{error}</div>}

        <ActionButton variant="primary" fullWidth disabled={isLoggingIn}>
          {isLoggingIn ? 'جارِ التحقق…' : 'تسجيل الدخول'}
        </ActionButton>
      </form>

      {PREVIEW_MODE && (
        <div className="preview-login">
          <span>GitHub Pages لا يتصل بقاعدة بياناتك المحلية.</span>
          <ActionButton variant="ghost" fullWidth onClick={openPreview} disabled={isLoggingIn}>
            فتح وضع المعاينة
          </ActionButton>
        </div>
      )}

      <div className="login-security">
        <span className="connection-dot" />
        قاعدة البيانات تبقى على My Field Server المحلي
      </div>
    </div>
  )
}
