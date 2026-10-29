'use client'

import {useRef, useState, useTransition} from 'react'
import {resendNotice} from '../../../actions'
import EmailPreview from './EmailPreview'

// "Email the client again" for the job's current step, with when it last went out.
export default function ResendEmail({id, last, preview}) {
  const [pending, start] = useTransition()
  const [msg, setMsg] = useState(null)
  const [open, setOpen] = useState(false)
  const note = useRef(null)
  const [text, setText] = useState('')
  return (
    <div className="resend">
      <span className="muted small">
        {last ? <>{last.ok ? 'Last email' : 'Last email failed'}: &ldquo;{last.subject}&rdquo; to {last.to}, {last.when}</> : 'Client emails for this step are logged here once sent.'}
      </span>
      {!open
        ? <button type="button" className="btn btn-ghost btn-sm" onClick={() => { setOpen(true); setMsg(null) }}>Email the client again</button>
        : (
          <div className="resend-form">
            <textarea ref={note} rows={2} placeholder="Add your own text to the email (optional), e.g. Resending in case the first one went to spam." aria-label="Your text for the email" onInput={e => setText(e.currentTarget.value)} />
            <EmailPreview mail={preview} note={text} />
            <div className="actions-row">
              <button type="button" className="btn btn-primary btn-sm" disabled={pending} onClick={() => start(async () => {
                const fd = new FormData(); fd.set('id', id); fd.set('note', note.current?.value || '')
                const res = await resendNotice(fd)
                setMsg(res?.error ? {error: res.error} : {ok: 'Sent.'})
                if (!res?.error) { setOpen(false); setText('') }
              })}>{pending ? 'Sending…' : 'Send email'}</button>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setOpen(false)}>Cancel</button>
            </div>
          </div>
        )}
      {msg?.error && <p className="form-error" role="alert">{msg.error}</p>}
      {msg?.ok && <p className="form-ok">{msg.ok}</p>}
    </div>
  )
}
