'use client'

import {useState} from 'react'
import {useRouter} from 'next/navigation'
import {createClient} from '@/lib/supabase/browser'

export default function LoginForm() {
  const router = useRouter()
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function onSubmit(e) {
    e.preventDefault()
    setBusy(true)
    setError('')
    const fd = new FormData(e.currentTarget)
    const {error} = await createClient().auth.signInWithPassword({email: fd.get('email'), password: fd.get('password')})
    if (error) {
      setError('That email and password don’t match. Check them and try again.')
      setBusy(false)
      return
    }
    router.replace('/admin')
    router.refresh()
  }

  return (
    <form className="admin-form" onSubmit={onSubmit}>
      <label>Email<input id="login-email" name="email" type="email" required autoComplete="email" /></label>
      <label>Password<input id="login-password" name="password" type="password" required autoComplete="current-password" /></label>
      {error && <p className="form-error" role="alert">{error}</p>}
      <button className="btn btn-primary" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
    </form>
  )
}
