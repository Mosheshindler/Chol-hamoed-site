import '../admin.css'
import Logo from '@/components/Logo'
import SetPasswordForm from './SetPasswordForm'

export const metadata = {title: 'Set your password · Mint 35 Admin', robots: {index: false}}

export default async function SetPasswordPage({searchParams}) {
  const {token} = await searchParams
  return (
    <main className="auth-page">
      <div className="auth-card">
        <p className="logo-row"><Logo /> <span className="auth-tag">Admin</span></p>
        <h1>Choose your password</h1>
        {token
          ? <SetPasswordForm token={token} />
          : <p className="form-error">This link is missing its code. Open the link from your email again, or use <a href="/admin/forgot">Forgot password?</a></p>}
      </div>
    </main>
  )
}
