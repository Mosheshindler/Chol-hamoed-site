'use client'

import {useActionState, useRef, useState} from 'react'
import {customerDecision, customerMessage, requestAddon} from './actions'
import {formats} from '@/components/formats'

export function Decision({token, job, what}) {
  const [mode, setMode] = useState(null) // null | 'approve' | 'changes'
  const [state, action, pending] = useActionState(async (_, fd) => customerDecision(fd), null)

  return (
    <div className="cp-decision">
      <p className="cp-decision-q">Happy with the {what}?</p>
      {!mode && (
        <div className="cp-row">
          <button type="button" className="btn btn-primary btn-sm" onClick={() => setMode('approve')}>Approve {what}</button>
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => setMode('changes')}>Request changes</button>
        </div>
      )}
      {mode && (
        <form action={action} className="cp-form">
          <input type="hidden" name="token" value={token} />
          <input type="hidden" name="job" value={job} />
          <input type="hidden" name="decision" value={mode} />
          {mode === 'changes' ? (
            <label>What would you like changed?
              <span className="hint">Put all your notes in one message. Your package includes one round of changes.</span>
              <textarea name="notes" rows={4} required autoFocus />
            </label>
          ) : (
            <>
              <p className="muted">Once you approve, we move on to the next step.</p>
              <label>Anything else we should know? <span className="optional">— optional</span><textarea name="notes" rows={2} /></label>
            </>
          )}
          {state?.error && <p className="form-error" role="alert">{state.error}</p>}
          <div className="cp-row">
            <button className="btn btn-primary btn-sm" disabled={pending}>{pending ? 'Sending…' : mode === 'approve' ? 'Yes, approve' : 'Send changes'}</button>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setMode(null)}>Back</button>
          </div>
        </form>
      )}
    </div>
  )
}

export function MessageForm({token, job}) {
  const ref = useRef(null)
  const [state, action, pending] = useActionState(async (_, fd) => {
    const res = await customerMessage(fd)
    if (res?.ok) ref.current?.reset()
    return res
  }, null)
  return (
    <form ref={ref} action={action} className="cp-form cp-message-form">
      <input type="hidden" name="token" value={token} />
      <input type="hidden" name="job" value={job} />
      <label className="sr-only" htmlFor={`msg-${job}`}>Message</label>
      <textarea id={`msg-${job}`} name="body" rows={2} placeholder="Write a message to our team" required />
      {state?.error && <p className="form-error" role="alert">{state.error}</p>}
      {state?.ok && !pending && <p className="form-ok">Sent. We&rsquo;ll reply by email.</p>}
      <button className="btn btn-ghost btn-sm" disabled={pending}>{pending ? 'Sending…' : 'Send message'}</button>
    </form>
  )
}

export function AddonForm({token, job, addons, orientation}) {
  const [pick, setPick] = useState(null)
  const [state, action, pending] = useActionState(async (_, fd) => {
    const res = await requestAddon(fd)
    if (res?.ok) setPick(null)
    return res
  }, null)
  const chosen = addons.find(a => a.key === pick)
  const otherShapes = formats.map(f => `${f.ratio} ${f.name}`).filter(f => f !== orientation)

  return (
    <div className="cp-addon-wrap">
      <div className="cp-addon-grid">
        {addons.map(a => (
          <button key={a.key} type="button" className={`cp-addon${pick === a.key ? ' picked' : ''}`} onClick={() => setPick(a.key)} aria-pressed={pick === a.key}>
            <b>{a.label}</b>
            <span>{a.desc}</span>
            <em>{a.price || 'Custom quote'}</em>
          </button>
        ))}
      </div>
      {chosen && (
        <form action={action} className="cp-form">
          <input type="hidden" name="token" value={token} />
          <input type="hidden" name="job" value={job} />
          <input type="hidden" name="addon" value={chosen.key} />
          {chosen.askOrientation ? (
            <label>Which orientation?
              <select name="details" required defaultValue="">
                <option value="" disabled>Choose one</option>
                {otherShapes.map(o => <option key={o}>{o}</option>)}
              </select>
            </label>
          ) : (
            <label>Notes <span className="optional">— optional</span><input name="details" /></label>
          )}
          {state?.error && <p className="form-error" role="alert">{state.error}</p>}
          <div className="cp-row">
            <button className="btn btn-primary btn-sm" disabled={pending}>{pending ? 'Sending…' : `Request ${chosen.label.toLowerCase()}`}</button>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setPick(null)}>Cancel</button>
          </div>
        </form>
      )}
      {state?.ok && !chosen && <p className="form-ok">Requested. We&rsquo;ll confirm it with you by email.</p>}
    </div>
  )
}
