'use client'

import {useActionState, useEffect, useState} from 'react'
import {updateJob} from '../../../actions'

// Controlled fields: React resets uncontrolled inputs after a form action, which would
// flash the old values back until the page refreshes.
export default function JobForm({id, price, assignedTo, dueDate, team}) {
  const [values, setValues] = useState({
    price: price != null ? String(price / 100) : '',
    assigned_to: assignedTo || '',
    due_date: dueDate || '',
  })
  // Pick up changes made elsewhere on the page, like a due date set by a status move.
  useEffect(() => {
    setValues({price: price != null ? String(price / 100) : '', assigned_to: assignedTo || '', due_date: dueDate || ''})
  }, [price, assignedTo, dueDate])
  const [state, action, pending] = useActionState(async (_, fd) => updateJob(fd), null)
  const set = k => e => setValues(v => ({...v, [k]: e.target.value}))

  return (
    <form className="admin-form compact" action={action}>
      <input type="hidden" name="id" value={id} />
      <label>Price
        <span className="money-input"><span>$</span><input id="job-price" name="price" inputMode="decimal" value={values.price} onChange={set('price')} placeholder="Not set" /></span>
      </label>
      <label>Assigned to
        <select id="job-assignee" name="assigned_to" value={values.assigned_to} onChange={set('assigned_to')}>
          <option value="">Unassigned</option>
          {team.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
      </label>
      <label>Due date<input id="job-due" type="date" name="due_date" value={values.due_date} onChange={set('due_date')} /></label>
      {state?.error && <p className="form-error" role="alert">{state.error}</p>}
      {state?.ok && !pending && <p className="form-ok">Saved.</p>}
      <button className="btn btn-ghost btn-sm" disabled={pending}>{pending ? 'Saving…' : 'Save'}</button>
    </form>
  )
}
