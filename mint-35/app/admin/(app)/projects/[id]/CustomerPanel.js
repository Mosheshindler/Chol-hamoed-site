'use client'

import {useActionState, useRef, useState} from 'react'
import {replyToCustomer, decideAddon} from '../../../actions'
import EmailPreview from './EmailPreview'
import {addonEmail, NOTE_SLOT} from '@/lib/emailParts'
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
  const [note, setNote] = useState('')
  const [show, setShow] = useState(null) // null | 'accept' | 'decline'
  const cents = Math.round((Number(String(price).replace(/[$,\s]/g, '')) || 0) * 100)
  const preview = show && mail ? addonEmail({...mail, accepted: show === 'accept', priceCents: cents, taxCents: taxCents(cents, mail.taxRate),
    charged: show === 'accept' && mail.willCharge && cents > 0, note: NOTE_SLOT}) : null
  return (
    <form action={action} className="addon-decide">
      <input type="hidden" name="addon" value={addonId} />
      <span className="money-input"><span>$</span><input name="price" inputMode="decimal" value={price} onChange={e => setPrice(e.target.value)} placeholder="Price" aria-label="Add-on price" /></span>
      <textarea name="note" rows={2} className="addon-note" placeholder="Add your own text to the email (optional)" aria-label="Your text for the email" onInput={e => setNote(e.currentTarget.value)} />
      {mail && (
        <span className="addon-preview-toggle">
          Preview email:{' '}
          <button type="button" className={`link-btn${show === 'accept' ? ' on' : ''}`} onClick={() => setShow(show === 'accept' ? null : 'accept')}>if confirmed</button>{' · '}
          <button type="button" className={`link-btn${show === 'decline' ? ' on' : ''}`} onClick={() => setShow(show === 'decline' ? null : 'decline')}>if declined</button>
        </span>
      )}
      {preview && <div className="addon-preview"><EmailPreview mail={preview} note={note} />{show === 'accept' && mail.willCharge && cents > 0 && <p className="muted small">A payment receipt is added above the link once the card is charged.</p>}</div>}
      <button name="decision" value="accept" className="btn btn-primary btn-sm" disabled={pending}>Confirm</button>
      <button name="decision" value="decline" className="btn btn-danger btn-sm" disabled={pending}>Decline</button>
      {state?.error && <p className="form-error" role="alert">{state.error}</p>}
    </form>
  )
}
