'use client'

import {useActionState} from 'react'
import {requestPasswordReset} from '../actions'

export default function ForgotForm() {
  const [state, action, pending] = useActionState(requestPasswordReset, null)
  if (state?.ok) return <p className="form-ok">{state.message}</p>
  return (
    <form className="admin-form" action={action}>
      <label>Email<input id="forgot-email" name="email" type="email" required autoComplete="email" /></label>
      {state?.error && <p className="form-error" role="alert">{state.error}</p>}
      <button className="btn btn-primary" disabled={pending}>{pending ? 'Sending…' : 'Send link'}</button>
    </form>
  )
}
