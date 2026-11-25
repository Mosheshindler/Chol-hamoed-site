'use client'

import {useState, useTransition} from 'react'
import {markCompleted} from '../../../actions'

// For jobs finished outside the system: moves the job to Delivered with no email, no charge and no final file needed.
export default function MarkCompleted({id, uncharged}) {
  const [open, setOpen] = useState(false)
  const [error, setError] = useState('')
  const [pending, start] = useTransition()
  if (!open) {
    return (
      <p className="muted small mark-done">
        Finished outside the system?{' '}
        <button type="button" className="link-btn" onClick={() => setOpen(true)}>Mark completed</button>
      </p>
    )
  }
  return (
    <form className="actions-panel mark-done-panel" action={fd => {
      fd.set('id', id)
      setError('')
      start(async () => { const r = await markCompleted(fd); if (r?.error) setError(r.error); else setOpen(false) })
    }}>
      <p><b>Mark this job completed?</b> It moves to Delivered. The client isn&rsquo;t emailed and nothing needs to be uploaded.</p>
      {uncharged && <p className="warn small">The card on file hasn&rsquo;t been charged for this job, and marking it completed doesn&rsquo;t charge it. Collect payment another way if needed.</p>}
      <p className="muted small">As with any delivered job, files the client sent are deleted automatically 7 days from now.</p>
      <label>Note for the team <span className="hint">Optional, e.g. &ldquo;Final sent by email on Nov 20&rdquo;</span><input name="note" maxLength={1000} /></label>
      {error && <p className="form-error" role="alert">{error}</p>}
      <div className="actions-row">
        <button className="btn btn-primary btn-sm" disabled={pending}>{pending ? 'Saving…' : 'Mark completed'}</button>
        <button type="button" className="link-btn" onClick={() => setOpen(false)}>Cancel</button>
      </div>
    </form>
  )
}
