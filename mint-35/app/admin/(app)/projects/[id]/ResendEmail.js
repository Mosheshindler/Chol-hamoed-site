'use client'

import {useState, useTransition} from 'react'
import {resendNotice} from '../../../actions'

// "Email the client again" for the job's current step, with when it last went out.
export default function ResendEmail({id, last}) {
  const [pending, start] = useTransition()
  const [msg, setMsg] = useState(null)
  return (
    <div className="resend">
      <span className="muted small">
        {last ? <>{last.ok ? 'Last email' : 'Last email failed'}: &ldquo;{last.subject}&rdquo; to {last.to}, {last.when}</> : 'Client emails for this step are logged here once sent.'}
      </span>
      <button type="button" className="btn btn-ghost btn-sm" disabled={pending} onClick={() => start(async () => {
        const fd = new FormData(); fd.set('id', id)
        const res = await resendNotice(fd)
        setMsg(res?.error ? {error: res.error} : {ok: 'Sent.'})
      })}>{pending ? 'Sending…' : 'Email the client again'}</button>
      {msg?.error && <p className="form-error" role="alert">{msg.error}</p>}
      {msg?.ok && <p className="form-ok">{msg.ok}</p>}
    </div>
  )
}
