import '../admin.css'
import LoginForm from './LoginForm'

export const metadata = {title: 'Sign in · Mint 35 Admin', robots: {index: false}}

export default function LoginPage() {
  return (
    <main className="auth-page">
      <div className="auth-card">
        <p className="logo-row"><span className="logo"><span className="logo-mark">mint</span><span className="logo-num"><span className="logo-dot" />35</span></span> <span className="auth-tag">Admin</span></p>
        <h1>Sign in</h1>
        <LoginForm />
      </div>
    </main>
  )
}
