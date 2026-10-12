'use client'

import {useActionState, useRef} from 'react'
import {addNote} from '../../../actions'

export default function NoteForm({id}) {
  const ref = useRef(null)
  const [state, action, pending] = useActionState(async (_, fd) => {
    const res = await addNote(fd)
    if (res?.ok) ref.current?.reset()
    return res
  }, null)
  return (
    <form ref={ref} className="admin-form compact note-form" action={action}>
      <input type="hidden" name="id" value={id} />
      <textarea id="note-text" name="note" rows={2} placeholder="Add a note for the team" required />
      {state?.error && <p className="form-error" role="alert">{state.error}</p>}
      <button className="btn btn-ghost btn-sm" disabled={pending}>{pending ? 'Adding…' : 'Add note'}</button>
    </form>
  )
}
