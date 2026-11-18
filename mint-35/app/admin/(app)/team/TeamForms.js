'use client'

import {useActionState, useRef, useState, useTransition} from 'react'
import {addMember, changePassword, removeMember, resendInvite} from '../../actions'

export default function TeamForms({isOwner}) {
  const addRef = useRef(null)
  const [added, addAction, adding] = useActionState(async (_, fd) => {
    const res = await addMember(fd)
    if (res?.ok) addRef.current?.reset()
    return res
  }, null)
  const [pw, pwAction, saving] = useActionState(async (_, fd) => changePassword(fd), null)

  return (
    <>
      {isOwner && (
        <section className="panel">
          <h2>Add a teammate</h2>
          <form ref={addRef} className="admin-form compact" action={addAction}>
            <label>Name<input id="member-name" name="name" required /></label>
            <label>Email<input id="member-email" name="email" type="email" required /></label>
            <label>Role
              <select id="member-role" name="role" defaultValue="member">
                <option value="member">Team (handles jobs)</option>
                <option value="owner">Owner (also manages the team)</option>
              </select>
            </label>
            {added?.error && <p className="form-error" role="alert">{added.error}</p>}
            {added?.ok && <p className="form-ok">{added.message}</p>}
            <p className="hint">They&rsquo;ll get an email with a link to choose their own password.</p>
            <button className="btn btn-primary btn-sm" disabled={adding}>{adding ? 'Adding…' : 'Add and send invite'}</button>
          </form>
        </section>
      )}
      <section className="panel">
        <h2>Your password</h2>
        <form className="admin-form compact" action={pwAction}>
          <label>New password<input id="new-password" name="password" type="password" minLength={10} required autoComplete="new-password" /></label>
          {pw?.error && <p className="form-error" role="alert">{pw.error}</p>}
          {pw?.ok && <p className="form-ok">{pw.message}</p>}
          <button className="btn btn-ghost btn-sm" disabled={saving}>{saving ? 'Saving…' : 'Change password'}</button>
        </form>
      </section>
    </>
  )
}

export function ResendButton({id}) {
  const [state, setState] = useState(null)
  const [pending, start] = useTransition()
  if (state?.ok) return <small className="form-ok">Link sent</small>
  return (
    <>
      <button type="button" className="link-btn" disabled={pending} onClick={() => start(async () => {
        const fd = new FormData(); fd.set('id', id); setState(await resendInvite(fd))
      })}>{pending ? 'Sending…' : 'Send set-password link'}</button>
      {state?.error && <small className="form-error">{state.error}</small>}
    </>
  )
}

export function RemoveButton({id, name}) {
  const [confirming, setConfirming] = useState(false)
  const [pending, start] = useTransition()
  if (!confirming) return <button type="button" className="link-btn danger" onClick={() => setConfirming(true)}>Remove</button>
  return (
    <span className="confirm-inline">
      Remove {name}?
      <button type="button" className="link-btn danger" disabled={pending} onClick={() => start(async () => {
        const fd = new FormData(); fd.set('id', id); await removeMember(fd)
      })}>{pending ? 'Removing…' : 'Yes, remove'}</button>
      <button type="button" className="link-btn" onClick={() => setConfirming(false)}>Keep</button>
    </span>
  )
}
