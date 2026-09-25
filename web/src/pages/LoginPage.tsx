import { LoginForm } from '../features/auth/components/LoginForm'

export default function LoginPage() {
  return (
    <main className="login-page">
      <section className="login-visual">
        <div className="login-map-grid" />
        <div className="login-orbit login-orbit--one" />
        <div className="login-orbit login-orbit--two" />
        <div className="login-visual-copy">
          <span>LOCAL-FIRST GIS</span>
          <h2>اعمل في الميدان.<br />زامن عندما يتوفر الاتصال.</h2>
          <p>واجهة واحدة للمشاريع والخرائط والبيانات الميدانية مع قاعدة PostGIS محلية.</p>
        </div>
      </section>
      <section className="login-form-side">
        <LoginForm />
      </section>
    </main>
  )
}
