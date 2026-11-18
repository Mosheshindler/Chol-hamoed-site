import '../admin.css'
import LoginForm from './LoginForm'
import Logo from '@/components/Logo'

export const metadata = {title: 'Sign in · Mint 35 Admin', robots: {index: false}}

export default function LoginPage() {
  return (
    <main className="auth-page">
      <div className="auth-card">
        <p className="logo-row"><Logo /> <span className="auth-tag">Admin</span></p>
        <h1>Sign in</h1>
        <LoginForm />
        <p className="auth-foot"><a href="/admin/forgot">Forgot password?</a></p>
      </div>
    </main>
  )
}
