'use client'

import {useActionState, useEffect, useState} from 'react'
import {updateJob} from '../../../actions'

// One small form per field, each on its own page (price on Billing, assignee on Communications,
// due date on Progress). Controlled so values don't flash back after saving.
function FieldForm({id, name, initial, label, render, button = 'Save'}) {
  const [value, setValue] = useState(initial)
  useEffect(() => { setValue(initial) }, [initial])
  const [state, action, pending] = useActionState(async (_, fd) => updateJob(fd), null)
  return (
    <form className="admin-form compact inline-form" action={action}>
      <input type="hidden" name="id" value={id} />
      <label>{label}{render({name, value, onChange: e => setValue(e.target.value)})}</label>
      <button className="btn btn-ghost btn-sm" disabled={pending}>{pending ? 'Saving…' : button}</button>
      {state?.error && <p className="form-error" role="alert">{state.error}</p>}
      {state?.ok && !pending && <p className="form-ok">Saved.</p>}
    </form>
  )
}

export function PriceForm({id, price}) {
  return <FieldForm id={id} name="price" label="Job price" initial={price != null ? String(price / 100) : ''}
    render={f => <span className="money-input"><span>$</span><input {...f} inputMode="decimal" placeholder="Not set" /></span>} />
}

export function AssignForm({id, assignedTo, team}) {
  return <FieldForm id={id} name="assigned_to" label="Assigned to" initial={assignedTo || ''}
    render={f => <select {...f}><option value="">Unassigned</option>{team.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}</select>} />
}

export function DueForm({id, dueDate}) {
  return <FieldForm id={id} name="due_date" label="Due date" initial={dueDate || ''}
    render={f => <input {...f} type="date" />} />
}
