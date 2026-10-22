'use client'

import {useActionState, useRef, useState, useTransition} from 'react'
import {createDiscount, updateDiscount, setDiscountActive} from '../../actions'

// The terms shared by the New code and Edit forms. `c` is the code being edited, if any.
function Terms({packages, c}) {
  const [kind, setKind] = useState(c?.kind || 'percent')
  const on = n => !c || !c.packages?.length || c.packages.includes(n)
  return (
    <>
      <div className="share-modes" role="radiogroup" aria-label="Type">
        {[['percent', '% off'], ['amount', '$ off']].map(([v, l]) => (
          <button key={v} type="button" role="radio" aria-checked={kind === v} className={`share-mode${kind === v ? ' on' : ''}`} onClick={() => setKind(v)}>{l}</button>
        ))}
      </div>
      <input type="hidden" name="kind" value={kind} />
      <label>{kind === 'percent' ? 'Percent off' : 'Dollars off the order'}
        <span className="money-input"><span>{kind === 'percent' ? '%' : '$'}</span><input name="value" inputMode="decimal" required placeholder={kind === 'percent' ? '20' : '500'} defaultValue={c ? Number(c.value) : undefined} /></span>
      </label>
      <fieldset className="check-group">
        <legend>Works on</legend>
        {packages.map(n => <label key={n} className="mini-check"><input type="checkbox" name="packages" value={n} defaultChecked={on(n)} />{n}</label>)}
      </fieldset>
      <label>Limit uses <span className="hint">Blank = unlimited</span><input name="max_uses" inputMode="numeric" placeholder="e.g. 10" defaultValue={c?.max_uses ?? ''} /></label>
      <label>Last day it works <span className="hint">Optional</span><input name="expires_on" type="date" defaultValue={c?.expires_on || ''} /></label>
      <label>Note for the team <span className="hint">Optional, e.g. who it&rsquo;s for</span><input name="note" defaultValue={c?.note || ''} /></label>
    </>
  )
}

export function CreateDiscount({packages}) {
  const ref = useRef(null)
  const [round, setRound] = useState(0) // remounts the fields after a save so they go back to defaults
  const [state, action, pending] = useActionState(async (prev, fd) => {
    const res = await createDiscount(prev, fd)
    if (res?.ok) { ref.current?.reset(); setRound(r => r + 1) }
    return res
  }, null)
  return (
    <form ref={ref} className="admin-form compact" action={action}>
      <label>Code<input name="code" required placeholder="e.g. TRYMINT35" autoCapitalize="characters" style={{textTransform: 'uppercase'}} /></label>
      <Terms key={round} packages={packages} />
      {state?.error && <p className="form-error" role="alert">{state.error}</p>}
      {state?.ok && <p className="form-ok">{state.message}</p>}
      <button className="btn btn-primary btn-sm" disabled={pending}>{pending ? 'Saving…' : 'Create code'}</button>
    </form>
  )
}

// One code in the list: its summary, plus Edit and Turn off/on for the owner.
export function CodeItem({c, packages, isOwner, children}) {
  const [editing, setEditing] = useState(false)
  const [pending, start] = useTransition()
  const [state, action, saving] = useActionState(async (prev, fd) => {
    const res = await updateDiscount(prev, fd)
    if (res?.ok) setEditing(false)
    return res
  }, null)
  return (
    <li className={editing ? 'editing' : undefined}>
      <div className="code-row">
        {children}
        {isOwner && !editing && (
          <span className="code-actions">
            <button type="button" className="link-btn" onClick={() => setEditing(true)}>Edit</button>
            <button type="button" className="link-btn" disabled={pending} onClick={() => start(async () => {
              const fd = new FormData(); fd.set('id', c.id); fd.set('active', String(!c.active)); await setDiscountActive(fd)
            })}>{pending ? '…' : c.active ? 'Turn off' : 'Turn on'}</button>
          </span>
        )}
      </div>
      {editing && (
        <form className="admin-form compact code-edit" action={action}>
          <input type="hidden" name="id" value={c.id} />
          <Terms packages={packages} c={c} />
          <p className="hint">The code itself stays {c.code}. Orders that already used it keep their price.</p>
          {state?.error && <p className="form-error" role="alert">{state.error}</p>}
          <div className="code-edit-actions">
            <button className="btn btn-primary btn-sm" disabled={saving}>{saving ? 'Saving…' : 'Save changes'}</button>
            <button type="button" className="link-btn" onClick={() => setEditing(false)}>Cancel</button>
          </div>
        </form>
      )}
    </li>
  )
}
