'use client'

import {useActionState, useRef, useState} from 'react'
import {replyToCustomer, decideAddon} from '../../../actions'
import EmailEditor from './EmailPreview'
import {addonEmail, MESSAGE_SLOT} from '@/lib/emailParts'
import {taxCents} from '@/lib/tax'

export function CustomerLink({url}) {
  const [copied, setCopied] = useState(false)
  async function copy() {
    try { await navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 2000) } catch {}
  }
  return (
    <div className="cust-link">
      <input readOnly value={url} aria-label="Customer page link" onFocus={e => e.target.select()} />
      <button type="button" className="btn btn-ghost btn-sm" onClick={copy}>{copied ? 'Copied ✓' : 'Copy'}</button>
      <a className="btn btn-ghost btn-sm" href={url} target="_blank" rel="noopener noreferrer">Open</a>
    </div>
  )
}

// `jobs` (several videos in one order) adds a picker for which video the message is about.
export function ReplyForm({id, jobs}) {
  const ref = useRef(null)
  const [state, action, pending] = useActionState(async (_, fd) => {
    const res = await replyToCustomer(fd)
    if (res?.ok) ref.current?.reset()
    return res
  }, null)
  return (
    <form ref={ref} action={action} className="admin-form compact">
      {jobs?.length > 1
        ? <label>About<select name="id" defaultValue={id}>{jobs.map(j => <option key={j.id} value={j.id}>{j.label}</option>)}</select></label>
        : <input type="hidden" name="id" value={id} />}
      <textarea name="body" rows={3} placeholder="Message the client (they get it by email and on their project page)" required />
      {state?.error && <p className="form-error" role="alert">{state.error}</p>}
      {state?.ok && !pending && <p className="form-ok">Sent.</p>}
      <button className="btn btn-primary btn-sm" disabled={pending}>{pending ? 'Sending…' : 'Send reply'}</button>
    </form>
  )
}

export function AddonDecision({addonId, suggested, mail}) {
  const [state, action, pending] = useActionState(async (_, fd) => decideAddon(fd), null)
  const [price, setPrice] = useState(suggested ?? '')
  const [show, setShow] = useState('accept') // which email the editor shows: 'accept' | 'decline'
  const cents = Math.round((Number(String(price).replace(/[$,\s]/g, '')) || 0) * 100)
  const accepted = show === 'accept'
  const preview = mail ? addonEmail({...mail, accepted, priceCents: cents, taxCents: taxCents(cents, mail.taxRate),
    charged: accepted && mail.willCharge && cents > 0, message: MESSAGE_SLOT}) : null
  return (
    <form action={action} className="addon-decide">
      <input type="hidden" name="addon" value={addonId} />
      <input type="hidden" name="decision" value={show} />
      <div className="share-modes" role="radiogroup" aria-label="Decision">
        {[['accept', 'Confirm'], ['decline', 'Decline']].map(([v, l]) => (
          <button key={v} type="button" role="radio" aria-checked={show === v} className={`share-mode${show === v ? ' on' : ''}`} onClick={() => setShow(v)}>{l}</button>
        ))}
      </div>
      {accepted && <span className="money-input"><span>$</span><input name="price" inputMode="decimal" value={price} onChange={e => setPrice(e.target.value)} placeholder="Price" aria-label="Add-on price" /></span>}
      {preview && <div className="addon-preview"><EmailEditor key={show} mail={preview} />{accepted && mail.willCharge && cents > 0 && <p className="muted small">The card is charged when you send, and a payment receipt is added above the link.</p>}</div>}
      <button className={`btn btn-sm ${accepted ? 'btn-primary' : 'btn-danger'}`} disabled={pending}>{pending ? 'Working…' : accepted ? 'Confirm & email client' : 'Decline & email client'}</button>
      {state?.error && <p className="form-error" role="alert">{state.error}</p>}
    </form>
  )
}
