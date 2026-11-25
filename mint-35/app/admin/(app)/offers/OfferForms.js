'use client'

import {useActionState, useRef, useState, useTransition} from 'react'
import {createOffer, resendOffer, setOfferOpen} from '../../actions'

function CopyLink({link}) {
  const [copied, setCopied] = useState(false)
  return (
    <span className="offer-link">
      <input readOnly value={link} onFocus={e => e.target.select()} aria-label="Offer link" />
      <button type="button" className="btn btn-ghost btn-sm" onClick={async () => {
        try { await navigator.clipboard.writeText(link); setCopied(true); setTimeout(() => setCopied(false), 2000) } catch {}
      }}>{copied ? 'Copied' : 'Copy link'}</button>
    </span>
  )
}

export function CreateOffer({defaultExpires}) {
  const ref = useRef(null)
  const [round, setRound] = useState(0)
  const [state, action, pending] = useActionState(async (prev, fd) => {
    const res = await createOffer(prev, fd)
    if (res?.ok) { ref.current?.reset(); setRound(r => r + 1) }
    return res
  }, null)
  return (
    <form ref={ref} className="admin-form compact" action={action} key={round}>
      <label>Client name<input name="client_name" required autoComplete="off" /></label>
      <label>Client email<input name="email" type="email" required autoComplete="off" /></label>
      <label>Organization <span className="hint">Optional</span><input name="company" autoComplete="off" /></label>
      <label>Package name<input name="title" required maxLength={80} placeholder="e.g. Annual Dinner Bundle" /></label>
      <label>What&rsquo;s included <span className="hint">One per line</span>
        <textarea name="items" rows={4} placeholder={'5 videos, 30–60 sec each\nScript approval for each video\n1 revision round each'} />
      </label>
      <div className="offer-pair">
        <label>Videos<input name="videos" inputMode="numeric" required defaultValue="1" /></label>
        <label>Price<span className="money-input"><span>$</span><input name="price" inputMode="decimal" required placeholder="4,500" /></span></label>
      </div>
      <label>Note to the client <span className="hint">Optional. Shown in the email and on their order page</span><textarea name="message" rows={3} /></label>
      <label>Last day the link works <span className="hint">Optional</span><input name="expires_on" type="date" defaultValue={defaultExpires} /></label>
      <label className="mini-check"><input type="checkbox" name="send" defaultChecked /> Email it to the client now</label>
      {state?.error && <p className="form-error" role="alert">{state.error}</p>}
      {state?.ok && <><p className="form-ok">{state.message}</p><CopyLink link={state.link} /></>}
      <button className="btn btn-primary btn-sm" disabled={pending}>{pending ? 'Saving…' : 'Create offer'}</button>
      <p className="hint">Sales tax is added at checkout the usual way (NJ billing addresses, unless exempt). Extras can be added at checkout; discount codes don&rsquo;t apply.</p>
    </form>
  )
}

// Actions for one offer in the list: copy its link, email it again, withdraw or reopen.
export function OfferActions({o, link, state, isOwner}) {
  const [pending, start] = useTransition()
  const [msg, setMsg] = useState(null)
  const run = (fn, fields) => start(async () => {
    const fd = new FormData(); for (const [k, v] of Object.entries(fields)) fd.set(k, v)
    const r = await fn(fd); setMsg(r?.error || (fn === resendOffer ? 'Sent.' : null))
  })
  return (
    <div className="offer-actions">
      {state === 'Open' && <CopyLink link={link} />}
      {isOwner && (
        <span className="code-actions">
          {state === 'Open' && <button type="button" className="link-btn" disabled={pending} onClick={() => run(resendOffer, {id: o.id})}>Email again</button>}
          {state === 'Open' && <button type="button" className="link-btn" disabled={pending} onClick={() => { if (confirm('Withdraw this offer? The link stops working.')) run(setOfferOpen, {id: o.id, open: 'false'}) }}>Withdraw</button>}
          {(state === 'Withdrawn' || state === 'Expired') && <button type="button" className="link-btn" disabled={pending} onClick={() => run(setOfferOpen, {id: o.id, open: 'true'})}>Reopen</button>}
        </span>
      )}
      {msg && <small className="muted">{msg}</small>}
    </div>
  )
}
