'use client'

import {useActionState, useRef, useState} from 'react'
import {addNote, replyToCustomer} from '../../../actions'

// Post an update from the Progress page: an internal team note, or a message the client gets by email.
export default function UpdateForm({id}) {
  const ref = useRef(null)
  const [to, setTo] = useState('team')
  const [state, action, pending] = useActionState(async (_, fd) => {
    const res = to === 'team' ? await addNote(fd) : await replyToCustomer(fd)
    if (res?.ok) ref.current?.reset()
    return res
  }, null)
  return (
    <form ref={ref} className="admin-form compact" action={action}>
      <input type="hidden" name="id" value={id} />
      <div className="share-modes" role="radiogroup" aria-label="Who sees it">
        <button type="button" role="radio" aria-checked={to === 'team'} className={`share-mode${to === 'team' ? ' on' : ''}`} onClick={() => setTo('team')}>Team note (internal)</button>
        <button type="button" role="radio" aria-checked={to === 'client'} className={`share-mode${to === 'client' ? ' on' : ''}`} onClick={() => setTo('client')}>Update to the client (emailed)</button>
      </div>
      <textarea name={to === 'team' ? 'note' : 'body'} rows={3} required placeholder={to === 'team' ? 'Only the team sees this' : 'The client gets this by email and on their project page'} />
      {state?.error && <p className="form-error" role="alert">{state.error}</p>}
      {state?.ok && !pending && <p className="form-ok">{to === 'team' ? 'Note added.' : 'Sent to the client.'}</p>}
      <button className="btn btn-ghost btn-sm" disabled={pending}>{pending ? 'Posting…' : to === 'team' ? 'Add note' : 'Send update'}</button>
    </form>
  )
}
