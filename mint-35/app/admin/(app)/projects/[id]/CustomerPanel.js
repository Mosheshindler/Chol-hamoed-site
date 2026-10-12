'use client'

import {useActionState, useRef, useState} from 'react'
import {replyToCustomer, decideAddon} from '../../../actions'

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

export function ReplyForm({id}) {
  const ref = useRef(null)
  const [state, action, pending] = useActionState(async (_, fd) => {
    const res = await replyToCustomer(fd)
    if (res?.ok) ref.current?.reset()
    return res
  }, null)
  return (
    <form ref={ref} action={action} className="admin-form compact">
      <input type="hidden" name="id" value={id} />
      <textarea name="body" rows={3} placeholder="Reply to the customer (they get it by email)" required />
      {state?.error && <p className="form-error" role="alert">{state.error}</p>}
      {state?.ok && !pending && <p className="form-ok">Sent.</p>}
      <button className="btn btn-primary btn-sm" disabled={pending}>{pending ? 'Sending…' : 'Send reply'}</button>
    </form>
  )
}

export function AddonDecision({addonId, suggested}) {
  const [state, action, pending] = useActionState(async (_, fd) => decideAddon(fd), null)
  return (
    <form action={action} className="addon-decide">
      <input type="hidden" name="addon" value={addonId} />
      <span className="money-input"><span>$</span><input name="price" inputMode="decimal" defaultValue={suggested ?? ''} placeholder="Price" aria-label="Add-on price" /></span>
      <button name="decision" value="accept" className="btn btn-primary btn-sm" disabled={pending}>Confirm</button>
      <button name="decision" value="decline" className="btn btn-danger btn-sm" disabled={pending}>Decline</button>
      {state?.error && <p className="form-error" role="alert">{state.error}</p>}
    </form>
  )
}
