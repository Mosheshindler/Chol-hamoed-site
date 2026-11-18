import '../admin.css'
import {redirect} from 'next/navigation'
import {createAdminClient} from '@/lib/supabase/admin'
import {createOwner} from '../actions'

export const metadata = {title: 'Set up · Mint 35 Admin', robots: {index: false}}
export const dynamic = 'force-dynamic'

// One-time setup: creates the first (owner) account. Disappears once anyone exists.
export default async function SetupPage({searchParams}) {
  const {count} = await createAdminClient().from('team_members').select('id', {count: 'exact', head: true})
  if (count > 0) redirect('/admin/login')
  const {error} = await searchParams

  return (
    <main className="auth-page">
      <div className="auth-card">
        <p className="eyebrow">First-time setup</p>
        <h1>Create the owner account</h1>
        <p className="muted">This page only works once. After this, add your team from the Team page.</p>
        <form className="admin-form" action={createOwner}>
          <label>Your name<input id="setup-name" name="name" required /></label>
          <label>Email<input id="setup-email" name="email" type="email" required /></label>
          <label>Password <span className="hint">At least 10 characters.</span><input id="setup-password" name="password" type="password" minLength={10} required /></label>
          {error && <p className="form-error" role="alert">{error}</p>}
          <button className="btn btn-primary">Create account</button>
        </form>
      </div>
    </main>
  )
}
