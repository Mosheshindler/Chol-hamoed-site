'use client'

import {useState, useTransition} from 'react'
import {moveStatus} from '../../../actions'

export default function StatusActions({id, status, steps, price}) {
  const [open, setOpen] = useState(null) // step awaiting extra input
  const [error, setError] = useState('')
  const [pending, start] = useTransition()

  if (!steps.length) return null

  const run = (step, fd = new FormData()) => {
    fd.set('id', id)
    fd.set('to', step.to)
    setError('')
    start(async () => {
      const res = await moveStatus(fd)
      if (res?.error) setError(res.error)
      else setOpen(null)
    })
  }

  return (
    <div className="actions">
      <div className="actions-row">
        <span className="actions-label">Next step</span>
        {steps.map(step => (
          <button key={step.to} type="button" disabled={pending}
            className={`btn btn-sm ${step.primary ? 'btn-primary' : step.danger ? 'btn-danger' : 'btn-ghost'}`}
            onClick={() => (step.needs ? setOpen(step) : run(step))}>
            {step.label}
          </button>
        ))}
      </div>

      {open?.needs === 'price' && (
        <form className="actions-panel" action={fd => run(open, fd)}>
          <label>Price for this job
            <span className="money-input"><span>$</span><input id="accept-price" name="price" inputMode="decimal" defaultValue={price ? price / 100 : ''} placeholder="0.00" required autoFocus /></span>
          </label>
          <p className="hint">The customer gets an email with this price. Nothing is charged yet.</p>
          <div className="actions-row">
            <button className="btn btn-primary btn-sm" disabled={pending}>{pending ? 'Saving…' : 'Accept & email customer'}</button>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setOpen(null)}>Cancel</button>
          </div>
        </form>
      )}

      {open?.needs === 'confirm' && (
        <div className="actions-panel">
          <p>{status === 'quoted'
            ? 'Start this job without a card on file? Use this only if the customer paid another way, like a QuickBooks invoice.'
            : 'Start this job? The card on file will be charged.'}</p>
          <div className="actions-row">
            <button className="btn btn-primary btn-sm" disabled={pending} onClick={() => run(open)}>{pending ? 'Starting…' : 'Yes, start job'}</button>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setOpen(null)}>Cancel</button>
          </div>
        </div>
      )}

      {error && <p className="form-error" role="alert">{error}</p>}
    </div>
  )
}
