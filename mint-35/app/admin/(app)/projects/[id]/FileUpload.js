'use client'

import {useState} from 'react'
import {useRouter} from 'next/navigation'
import {createClient} from '@/lib/supabase/browser'
import {recordFile, recordShared} from '../../../actions'

const MODES = [['file', 'Upload a file'], ['link', 'Google Doc / link'], ['text', 'Paste text']]

export default function FileUpload({projectId}) {
  const router = useRouter()
  const [msg, setMsg] = useState(null)
  const [busy, setBusy] = useState(false)
  const [mode, setMode] = useState('file')

  async function onSubmit(e) {
    e.preventDefault()
    const form = e.currentTarget
    const fd = new FormData(form)
    const kind = fd.get('kind')
    setMsg(null)
    let res
    if (mode === 'file') {
      const file = fd.get('file')
      if (!file || !file.size) return setMsg({error: 'Choose a file first.'})
      setBusy(true)
      const path = `${projectId}/${kind}/${Date.now()}-${file.name.replace(/[^\w.\-]+/g, '_').slice(-120)}`
      const {error} = await createClient().storage.from('project-files').upload(path, file, {contentType: file.type || undefined})
      if (error) {
        setBusy(false)
        return setMsg({error: 'Upload failed. Try again.'})
      }
      res = await recordFile({projectId, path, name: file.name, size: file.size, kind})
    } else {
      setBusy(true)
      res = await recordShared({projectId, kind, ...(mode === 'link' ? {url: fd.get('url')} : {body: fd.get('body')})})
    }
    setBusy(false)
    if (res?.error) return setMsg({error: res.error})
    form.reset()
    setMsg({ok: mode === 'file' ? 'Uploaded.' : 'Shared.'})
    router.refresh()
  }

  return (
    <form className="upload-row" onSubmit={onSubmit}>
      <div className="share-modes" role="radiogroup" aria-label="How to share">
        {MODES.map(([v, label]) => (
          <button key={v} type="button" role="radio" aria-checked={mode === v} className={`share-mode${mode === v ? ' on' : ''}`} onClick={() => { setMode(v); setMsg(null) }}>{label}</button>
        ))}
      </div>
      <select id="upload-kind" name="kind" defaultValue="script" aria-label="What is it">
        <option value="script">Script</option>
        <option value="first_cut">First cut</option>
        <option value="final">Final</option>
        <option value="other">Other</option>
      </select>
      {mode === 'file' && <input id="upload-file" type="file" name="file" aria-label="File" />}
      {mode === 'link' && <input id="share-url" name="url" type="url" inputMode="url" placeholder="https://docs.google.com/…" aria-label="Link" className="share-url" />}
      {mode === 'text' && <textarea id="share-body" name="body" rows={8} placeholder="Paste the script here" aria-label="Text" className="share-body" />}
      <button className="btn btn-ghost btn-sm" disabled={busy}>{busy ? 'Saving…' : mode === 'file' ? 'Upload' : 'Share'}</button>
      {mode === 'link' && <p className="hint share-hint">Google Doc: set Share → General access to &ldquo;Anyone with the link&rdquo; (Viewer or Commenter) so the customer can open it.</p>}
      {msg?.error && <p className="form-error" role="alert">{msg.error}</p>}
      {msg?.ok && <p className="form-ok">{msg.ok}</p>}
    </form>
  )
}
