'use client'

import {useActionState, useState} from 'react'
import {updateClient, setTaxExempt} from '../../../actions'

// Project tab → Client: the details shown, with Edit to fix them (applies to the whole order).
export function ClientDetails({p, children}) {
  const [editing, setEditing] = useState(false)
  const [state, action, pending] = useActionState(async (prev, fd) => {
    const r = await updateClient(prev, fd)
    if (r?.ok) setEditing(false)
    return r
  }, null)
  if (!editing) {
    return (
      <>
        {children}
        <button type="button" className="btn btn-ghost btn-sm" style={{marginTop: 12}} onClick={() => setEditing(true)}>Edit client details</button>
        {state?.ok && <p className="form-ok">Saved.</p>}
      </>
    )
  }
  const [first, ...rest] = (p.name || '').split(' ')
  return (
    <form className="admin-form compact" action={action}>
      <input type="hidden" name="id" value={p.id} />
      <label>First name<input name="first_name" required defaultValue={p.first_name || first} /></label>
      <label>Last name<input name="last_name" defaultValue={p.last_name || rest.join(' ')} /></label>
      <label>Email<input name="email" type="email" required defaultValue={p.email} /></label>
      <label>Cell<input name="phone" defaultValue={p.phone || ''} /></label>
      <label>Organization <span className="hint">Shown as the job&rsquo;s name. Leave blank for a person.</span><input name="company" defaultValue={p.company || ''} /></label>
      <p className="hint">Applies to every job in this order. Emails go to the new address from now on.</p>
      {state?.error && <p className="form-error" role="alert">{state.error}</p>}
      <div className="actions-row">
        <button className="btn btn-primary btn-sm" disabled={pending}>{pending ? 'Saving…' : 'Save'}</button>
        <button type="button" className="link-btn" onClick={() => setEditing(false)}>Cancel</button>
      </div>
    </form>
  )
}

// Billing → sales tax switch for New Jersey jobs not charged yet.
export function TaxExempt({id, exempt, reasons}) {
  const [open, setOpen] = useState(false)
  const [state, action, pending] = useActionState(async (prev, fd) => {
    const r = await setTaxExempt(prev, fd)
    if (r?.ok) setOpen(false)
    return r
  }, null)
  return (
    <div className="tax-switch">
      {exempt ? (
        <form action={action} className="actions-row">
          <input type="hidden" name="id" value={id} /><input type="hidden" name="exempt" value="0" />
          <span className="muted small">No NJ sales tax will be charged on this order.</span>
          <button className="link-btn" disabled={pending}>{pending ? 'Saving…' : 'Charge NJ sales tax instead'}</button>
        </form>
      ) : !open ? (
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => setOpen(true)}>Client is tax-exempt? Remove sales tax</button>
      ) : (
        <form action={action} className="admin-form compact">
          <input type="hidden" name="id" value={id} /><input type="hidden" name="exempt" value="1" />
          <label>Why are they exempt?
            <select name="reason" required defaultValue=""><option value="" disabled>Choose one</option>{reasons.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}</select>
          </label>
          <p className="hint">Removes NJ sales tax from this order before the card is charged, including add-ons later. Keep their exemption certificate (ST-5) on file.</p>
          <div className="actions-row">
            <button className="btn btn-primary btn-sm" disabled={pending}>{pending ? 'Saving…' : 'Remove sales tax'}</button>
            <button type="button" className="link-btn" onClick={() => setOpen(false)}>Cancel</button>
          </div>
        </form>
      )}
      {state?.error && <p className="form-error" role="alert">{state.error}</p>}
      {state?.ok && state.skipped > 0 && <p className="muted small">{state.skipped} job(s) in this order were already charged and keep their tax.</p>}
    </div>
  )
}
