'use client'

import {useState, useTransition} from 'react'
import {moveStatus} from '../../../actions'
import FileUpload from './FileUpload'

const KIND_NAME = {script: 'script', first_cut: 'first cut', final: 'final video'}

// Next-step buttons for one job. Steps that email the client open a panel showing that exact email,
// with room for a personal line; steps that deliver something also hold the box to share it.
export default function StatusActions({id, status, steps, price, chargeTotal, card, shared = {}, scriptWord = 'script', alsoDue = []}) {
  const [open, setOpen] = useState(null)
  const [error, setError] = useState('')
  const [pending, start] = useTransition()

  if (!steps.length) return null

  const run = (step, fd = new FormData()) => {
    fd.set('id', id)
    fd.set('to', step.to)
    if (step.skipCharge) fd.set('skipCharge', '1')
    setError('')
    start(async () => {
      const res = await moveStatus(fd)
      if (res?.error) setError(res.error)
      else setOpen(null)
    })
  }
  const choose = step => (step.needs || step.preview || step.danger ? setOpen(step) : run(step))
  const deliverable = open?.delivers
  const items = deliverable ? shared[deliverable] || [] : []
  const kindName = deliverable === 'script' ? scriptWord : KIND_NAME[deliverable]

  return (
    <div className="actions">
      <div className="actions-row">
        <span className="actions-label">Next step</span>
        {steps.map(step => (
          <button key={step.label} type="button" disabled={pending}
            className={`btn btn-sm ${step.primary ? 'btn-primary' : step.danger ? 'btn-danger' : 'btn-ghost'}${open === step ? ' is-open' : ''}`}
            onClick={() => choose(step)}>
            {step.label}
          </button>
        ))}
      </div>

      {open && (
        <div className="actions-panel wide">
          {deliverable && (
            <div className="deliver-box">
              <p className="deliver-title">1. Share the {kindName}</p>
              {items.length
                ? <ul className="files">{items.map(f => <li key={f.id}><span className="file-kind">Shared</span>{f.body ? <span>Pasted text</span> : <a href={f.href} target="_blank" rel="noopener noreferrer">{f.name}</a>}</li>)}</ul>
                : <p className="warn small">Nothing shared yet. {deliverable === 'script' ? 'Add a Google Doc link, paste the text or upload a file' : 'Add a link or upload the file'} so the client has something to open.</p>}
              <FileUpload projectId={id} kind={deliverable} compact />
              {deliverable === 'final' && alsoDue.length > 0 && (
                <div className="also-due">
                  <p className="deliver-title">Also due with the final</p>
                  <ul>{alsoDue.map(d => <li key={d.label} className={d.done ? 'is-done' : 'warn'}>{d.done ? '✓ ' : '○ '}{d.label}{d.done ? '' : ': not shared yet (use Deliverables below)'}</li>)}</ul>
                </div>
              )}
            </div>
          )}
          <form className="step-form" action={fd => run(open, fd)}>
            {open.needs === 'price' && (
              <label>Price for this job
                <span className="money-input"><span>$</span><input name="price" inputMode="decimal" defaultValue={price ? price / 100 : ''} placeholder="0.00" required autoFocus /></span>
              </label>
            )}
            {open.needs === 'confirm' && (
              <p>{open.skipCharge || status === 'quoted'
                ? 'Start this job without charging a card? Use this only if the client paid another way, like a QuickBooks invoice.'
                : `Start this job and charge ${price ? '$' + ((chargeTotal ?? price) / 100).toLocaleString('en-US', {minimumFractionDigits: 2}) + (chargeTotal > price ? ' (including sales tax)' : '') : 'the job price'} to ${card || 'the card on file'}?`}</p>
            )}
            {open.danger && !open.needs && <p>{open.label} this job? The client isn&rsquo;t emailed.</p>}
            {open.preview && (
              <div className="deliver-box">
                <p className="deliver-title">{deliverable ? '2. ' : ''}What the client gets</p>
                <div className="email-preview">
                  <p className="email-subject"><span className="muted">Subject:</span> {open.preview.subject}</p>
                  <div dangerouslySetInnerHTML={{__html: open.preview.html}} />
                </div>
                <label>Add a personal line <span className="hint">Optional. Goes in this email and on their project page.</span>
                  <textarea name="note" rows={2} placeholder="e.g. We went with the warmer opening you mentioned." />
                </label>
              </div>
            )}
            <div className="actions-row">
              <button className={`btn btn-sm ${open.danger ? 'btn-danger' : 'btn-primary'}`} disabled={pending}>
                {pending ? 'Working…' : open.sendLabel || `Yes, ${open.label.toLowerCase()}`}
              </button>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setOpen(null)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {error && <p className="form-error" role="alert">{error}</p>}
    </div>
  )
}
