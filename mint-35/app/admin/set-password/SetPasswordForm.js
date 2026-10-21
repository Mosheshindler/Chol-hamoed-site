'use client'

import {useActionState} from 'react'
import {setPasswordWithToken} from '../actions'

export default function SetPasswordForm({token}) {
  const [state, action, pending] = useActionState(setPasswordWithToken, null)
  return (
    <form className="admin-form" action={action}>
      <input type="hidden" name="token" value={token} />
      <label>New password<input id="set-password" name="password" type="password" minLength={10} required autoComplete="new-password" /></label>
      <label>Type it again<input id="set-password-confirm" name="confirm" type="password" minLength={10} required autoComplete="new-password" /></label>
      <p className="hint">At least 10 characters.</p>
      {state?.error && <p className="form-error" role="alert">{state.error}{/expired/.test(state.error) && <> <a href="/admin/forgot">Get a new link</a></>}</p>}
      <button className="btn btn-primary" disabled={pending}>{pending ? 'Saving…' : 'Save and sign in'}</button>
    </form>
  )
}
