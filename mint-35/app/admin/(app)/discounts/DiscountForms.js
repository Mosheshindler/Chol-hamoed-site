'use client'

import {useActionState, useRef, useState, useTransition} from 'react'
import {createDiscount, setDiscountActive} from '../../actions'

export function CreateDiscount({packages}) {
  const ref = useRef(null)
  const [kind, setKind] = useState('percent')
  const [state, action, pending] = useActionState(async (prev, fd) => {
    const res = await createDiscount(prev, fd)
    if (res?.ok) { ref.current?.reset(); setKind('percent') }
    return res
  }, null)
  return (
    <form ref={ref} className="admin-form compact" action={action}>
      <label>Code<input name="code" required placeholder="e.g. TRYMINT35" autoCapitalize="characters" style={{textTransform: 'uppercase'}} /></label>
      <div className="share-modes" role="radiogroup" aria-label="Type">
        {[['percent', '% off'], ['amount', '$ off']].map(([v, l]) => (
          <button key={v} type="button" role="radio" aria-checked={kind === v} className={`share-mode${kind === v ? ' on' : ''}`} onClick={() => setKind(v)}>{l}</button>
        ))}
      </div>
      <input type="hidden" name="kind" value={kind} />
      <label>{kind === 'percent' ? 'Percent off' : 'Dollars off the order'}
        <span className="money-input"><span>{kind === 'percent' ? '%' : '$'}</span><input name="value" inputMode="decimal" required placeholder={kind === 'percent' ? '20' : '500'} /></span>
      </label>
      <fieldset className="check-group">
        <legend>Works on</legend>
        {packages.map(n => <label key={n} className="mini-check"><input type="checkbox" name="packages" value={n} defaultChecked />{n}</label>)}
      </fieldset>
      <label>Limit uses <span className="hint">Blank = unlimited</span><input name="max_uses" inputMode="numeric" placeholder="e.g. 10" /></label>
      <label>Last day it works <span className="hint">Optional</span><input name="expires_on" type="date" /></label>
      <label>Note for the team <span className="hint">Optional, e.g. who it&rsquo;s for</span><input name="note" /></label>
      {state?.error && <p className="form-error" role="alert">{state.error}</p>}
      {state?.ok && <p className="form-ok">{state.message}</p>}
      <button className="btn btn-primary btn-sm" disabled={pending}>{pending ? 'Saving…' : 'Create code'}</button>
    </form>
  )
}

export function ToggleDiscount({id, active}) {
  const [pending, start] = useTransition()
  return (
    <button type="button" className="link-btn" disabled={pending} onClick={() => start(async () => {
      const fd = new FormData(); fd.set('id', id); fd.set('active', String(!active)); await setDiscountActive(fd)
    })}>{pending ? '…' : active ? 'Turn off' : 'Turn on'}</button>
  )
}
