import '../admin.css'
import Logo from '@/components/Logo'
import ForgotForm from './ForgotForm'

export const metadata = {title: 'Forgot password · Mint 35 Admin', robots: {index: false}}

export default function ForgotPage() {
  return (
    <main className="auth-page">
      <div className="auth-card">
        <p className="logo-row"><Logo /> <span className="auth-tag">Admin</span></p>
        <h1>Forgot password</h1>
        <p className="muted auth-lead">Enter your work email and we&rsquo;ll send you a link to choose a new password.</p>
        <ForgotForm />
        <p className="auth-foot"><a href="/admin/login">← Back to sign in</a></p>
      </div>
    </main>
  )
}
