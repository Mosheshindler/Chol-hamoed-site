'use client'

import {useActionState, useRef, useState} from 'react'
import {useRouter} from 'next/navigation'
import {createClient} from '@/lib/supabase/browser'
import {customerDecision, customerMessage, requestAddon, startAddFiles, finishAddFiles, shareFileLinks} from './actions'
import {MAX_UPLOAD_MB, MAX_UPLOAD_BYTES, formatSize} from '@/lib/intake'
import TooBigDialog from '@/components/TooBigDialog'
import {formats} from '@/components/formats'

export function Decision({token, job, what}) {
  const [mode, setMode] = useState(null) // null | 'approve' | 'changes'
  const [state, action, pending] = useActionState(async (_, fd) => customerDecision(fd), null)

  return (
    <div className="cp-decision">
      <p className="cp-decision-q">Happy with the {what}?</p>
      {!mode && (
        <div className="cp-row">
          <button type="button" className="btn btn-primary btn-sm" onClick={() => setMode('approve')}>Approve {what}</button>
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => setMode('changes')}>Request changes</button>
        </div>
      )}
      {mode && (
        <form action={action} className="cp-form">
          <input type="hidden" name="token" value={token} />
          <input type="hidden" name="job" value={job} />
          <input type="hidden" name="decision" value={mode} />
          {mode === 'changes' ? (
            <label>What would you like changed?
              <span className="hint">Put all your notes in one message. Your package includes one round of changes.</span>
              <textarea name="notes" rows={4} required autoFocus />
            </label>
          ) : (
            <>
              <p className="muted">Once you approve, we move on to the next step.</p>
              <label>Anything else we should know? <span className="optional">— optional</span><textarea name="notes" rows={2} /></label>
            </>
          )}
          {state?.error && <p className="form-error" role="alert">{state.error}</p>}
          <div className="cp-row">
            <button className="btn btn-primary btn-sm" disabled={pending}>{pending ? 'Sending…' : mode === 'approve' ? 'Yes, approve' : 'Send changes'}</button>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setMode(null)}>Back</button>
          </div>
        </form>
      )}
    </div>
  )
}

export function MessageForm({token, job}) {
  const ref = useRef(null)
  const [state, action, pending] = useActionState(async (_, fd) => {
    const res = await customerMessage(fd)
    if (res?.ok) ref.current?.reset()
    return res
  }, null)
  return (
    <form ref={ref} action={action} className="cp-form cp-message-form">
      <input type="hidden" name="token" value={token} />
      <input type="hidden" name="job" value={job} />
      <label className="sr-only" htmlFor={`msg-${job}`}>Message</label>
      <textarea id={`msg-${job}`} name="body" rows={2} placeholder="Write a message to our team" required />
      {state?.error && <p className="form-error" role="alert">{state.error}</p>}
      {state?.ok && !pending && <p className="form-ok">Sent. We&rsquo;ll reply by email.</p>}
      <button className="btn btn-ghost btn-sm" disabled={pending}>{pending ? 'Sending…' : 'Send message'}</button>
    </form>
  )
}

export function AddonForm({token, job, addons, orientation}) {
  const [pick, setPick] = useState(null)
  const [state, action, pending] = useActionState(async (_, fd) => {
    const res = await requestAddon(fd)
    if (res?.ok) setPick(null)
    return res
  }, null)
  const chosen = addons.find(a => a.key === pick)
  const otherShapes = formats.map(f => `${f.ratio} ${f.name}`).filter(f => f !== orientation)

  return (
    <div className="cp-addon-wrap">
      <div className="cp-addon-grid">
        {addons.map(a => (
          <button key={a.key} type="button" className={`cp-addon${pick === a.key ? ' picked' : ''}`} onClick={() => setPick(a.key)} aria-pressed={pick === a.key}>
            <b>{a.label}</b>
            <span>{a.desc}</span>
            <em>{a.price || 'Custom quote'}</em>
          </button>
        ))}
      </div>
      {chosen && (
        <form action={action} className="cp-form">
          <input type="hidden" name="token" value={token} />
          <input type="hidden" name="job" value={job} />
          <input type="hidden" name="addon" value={chosen.key} />
          {chosen.askOrientation ? (
            <label>Which format?
              <select name="details" required defaultValue="">
                <option value="" disabled>Choose one</option>
                {otherShapes.map(o => <option key={o}>{o}</option>)}
              </select>
            </label>
          ) : (
            <label>Notes <span className="optional">— optional</span><input name="details" /></label>
          )}
          {state?.error && <p className="form-error" role="alert">{state.error}</p>}
          <div className="cp-row">
            <button className="btn btn-primary btn-sm" disabled={pending}>{pending ? 'Sending…' : `Request ${chosen.label.toLowerCase()}`}</button>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setPick(null)}>Cancel</button>
          </div>
        </form>
      )}
      {state?.ok && !chosen && <p className="form-ok">Requested. We&rsquo;ll confirm it with you by email.</p>}
    </div>
  )
}

// Add more photos, videos and files after ordering. Picking again adds to the list. Files over the
// upload limit are left out and a pop-up suggests a Google Drive or Dropbox link, which can be sent here too.
export function AddFiles({token, job}) {
  const router = useRouter()
  const ref = useRef(null)
  const linksRef = useRef(null)
  const [files, setFiles] = useState([])
  const [tooBig, setTooBig] = useState(null)
  const [showLinks, setShowLinks] = useState(false)
  const [hasLinks, setHasLinks] = useState(false)
  const [state, setState] = useState({phase: 'idle'}) // idle | uploading {done,total} | done {count, links} | error {error}
  const key = f => `${f.name}|${f.size}|${f.lastModified}`

  function pick(e) {
    const chosen = [...e.currentTarget.files]
    const big = chosen.filter(f => f.size > MAX_UPLOAD_BYTES)
    const seen = new Set(files.map(key))
    setFiles([...files, ...chosen.filter(f => f.size <= MAX_UPLOAD_BYTES && !seen.has(key(f)))])
    e.currentTarget.value = ''
    setState({phase: 'idle'})
    if (big.length) setTooBig(big.map(f => ({name: f.name, size: f.size})))
  }

  function addLink(url) {
    setShowLinks(true)
    requestAnimationFrame(() => {
      const el = linksRef.current
      if (!el) return
      el.value = el.value.trim() ? `${el.value.trim()}\n${url}` : url
      setHasLinks(true)
    })
  }

  async function send(e) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const note = fd.get('note')
    const links = String(fd.get('links') || '').trim()
    if (!files.length && !links) return setState({phase: 'error', error: 'Choose a file or add a link first.'})
    let count = 0, missed = 0
    if (files.length) {
      setState({phase: 'uploading', done: 0, total: files.length})
      const start = await startAddFiles({token, job, files: files.map(f => ({name: f.name, size: f.size}))})
      if (start?.error) return setState({phase: 'error', error: start.error})
      const supabase = createClient()
      const names = {}
      let done = 0
      for (const u of start.uploads) {
        const f = files[u.index]
        const {error} = await supabase.storage.from('project-files').uploadToSignedUrl(u.path, u.token, f, {contentType: f.type || undefined})
        if (!error) names[u.path] = f.name
        setState({phase: 'uploading', done: ++done, total: files.length})
      }
      const res = await finishAddFiles({token, job, batch: start.batch, names, note, links})
      if (res?.error) return setState({phase: 'error', error: res.error})
      count = res.count
      missed = files.length - Object.keys(names).length
    } else {
      setState({phase: 'uploading', done: 0, total: 0})
      const res = await shareFileLinks({token, job, links, note})
      if (res?.error) return setState({phase: 'error', error: res.error})
    }
    setFiles([])
    ref.current?.reset()
    setHasLinks(false)
    setShowLinks(false)
    setState({phase: 'done', count, links: !!links, missed})
    router.refresh()
  }

  const busy = state.phase === 'uploading'
  const ready = files.length > 0 || hasLinks
  const sent = state.phase === 'done' && [state.count ? `${state.count} file${state.count > 1 ? 's' : ''}` : '', state.links ? 'your link' : ''].filter(Boolean).join(' and ')
  return (
    <form ref={ref} className="cp-form cp-add-files" onSubmit={send}>
      <div className="cp-add-pick">
        <label className="btn btn-ghost btn-sm cp-file-btn">
          {files.length ? 'Add more' : 'Choose files'}
          <input type="file" multiple accept="image/*,video/*,.pdf,.ai,.eps,.psd,.svg" onChange={pick} disabled={busy} />
        </label>
        <span className="muted small">Photos, videos, logos or graphics · up to {MAX_UPLOAD_MB} MB each</span>
      </div>
      {files.length > 0 && (
        <ul className="upload-list">
          {files.map((f, i) => (
            <li key={key(f)}><span>✓ {f.name} <span className="upload-size">{formatSize(f.size)}</span></span>{!busy && <button type="button" className="link-btn upload-remove" aria-label={`Remove ${f.name}`} onClick={() => setFiles(files.filter((_, n) => n !== i))}>Remove</button>}</li>
          ))}
          {files.length > 1 && <li className="upload-count">{files.length} files · {formatSize(files.reduce((s, f) => s + f.size, 0))}</li>}
        </ul>
      )}
      {!showLinks && <button type="button" className="reveal-link" onClick={() => setShowLinks(true)}>Bigger files? Share a Google Drive or Dropbox link</button>}
      <label hidden={!showLinks}>Links to your files <span className="optional">(Google Drive, Dropbox)</span>
        <textarea ref={linksRef} name="links" rows={2} placeholder="https://drive.google.com/…" disabled={busy} onInput={e => setHasLinks(!!e.currentTarget.value.trim())} />
        <span className="hint">Set sharing to &ldquo;Anyone with the link&rdquo; so we can open it.</span>
      </label>
      {ready && <label>What are these for? <span className="optional">— optional</span><input name="note" placeholder="e.g. Use the second photo at the end" disabled={busy} /></label>}
      {state.phase === 'error' && <p className="form-error" role="alert">{state.error}</p>}
      {state.phase === 'done' && <p className="form-ok">Sent {sent}. Thanks, our team has been notified.{state.missed > 0 && ` ${state.missed} file${state.missed > 1 ? 's' : ''} didn’t upload; please try again or share a link.`}</p>}
      {ready && (
        <button className="btn btn-primary btn-sm" disabled={busy}>
          {busy ? (state.total ? `Uploading ${Math.min(state.done + 1, state.total)} of ${state.total}…` : 'Sending…')
            : files.length ? `Send ${files.length} file${files.length > 1 ? 's' : ''}${hasLinks ? ' + link' : ''}` : 'Send link'}
        </button>
      )}
      {tooBig && <TooBigDialog files={tooBig} onLink={addLink} onClose={() => setTooBig(null)} />}
    </form>
  )
}
