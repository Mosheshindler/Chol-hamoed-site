'use client'

import {useState} from 'react'
import {useRouter} from 'next/navigation'
import {createClient} from '@/lib/supabase/browser'
import {recordFile, recordShared} from '../../../actions'

const MODES = [['file', 'Upload a file'], ['link', 'Google Doc / link'], ['text', 'Paste text']]
// Videos are usually shared as a link; scripts as a Google Doc or pasted text.
const VIDEO_KINDS = ['first_cut', 'final', 'cutdown', 'extra_format']
const LINK_HINT = {
  doc: 'Google Doc: set Share → General access to “Anyone with the link” (Viewer or Commenter) so the client can open it.',
  video: 'Google Drive, Dropbox, Vimeo or unlisted YouTube link. Make sure anyone with the link can view it.',
}

export default function FileUpload({projectId, kind: fixedKind, label, compact}) {
  const router = useRouter()
  const [msg, setMsg] = useState(null)
  const [busy, setBusy] = useState(false)
  const [mode, setMode] = useState(fixedKind ? 'link' : 'file')

  async function onSubmit(e) {
    e.preventDefault()
    const form = e.currentTarget
    const fd = new FormData(form)
    const kind = fixedKind || fd.get('kind')
    setMsg(null)
    let res
    if (mode === 'file') {
      const file = fd.get('file')
      if (!file || !file.size) return setMsg({error: 'Choose a file first.'})
      setBusy(true)
      const path = `${projectId}/${kind}/${Date.now()}-${file.name.replace(/[^\w.\-]+/g, '_').slice(-120)}`
      const name = label ? `${label}: ${file.name}` : file.name
      const {error} = await createClient().storage.from('project-files').upload(path, file, {contentType: file.type || undefined})
      if (error) {
        setBusy(false)
        return setMsg({error: 'Upload failed. Try again.'})
      }
      res = await recordFile({projectId, path, name, size: file.size, kind})
    } else {
      setBusy(true)
      res = await recordShared({projectId, kind, label, ...(mode === 'link' ? {url: fd.get('url')} : {body: fd.get('body')})})
    }
    setBusy(false)
    if (res?.error) return setMsg({error: res.error})
    form.reset()
    setMsg({ok: mode === 'file' ? 'Uploaded.' : 'Shared.'})
    router.refresh()
  }

  return (
    <form className={`upload-row${compact ? ' compact' : ''}`} onSubmit={onSubmit}>
      <div className="share-modes" role="radiogroup" aria-label="How to share">
        {MODES.map(([v, label]) => (
          <button key={v} type="button" role="radio" aria-checked={mode === v} className={`share-mode${mode === v ? ' on' : ''}`} onClick={() => { setMode(v); setMsg(null) }}>{label}</button>
        ))}
      </div>
      {!fixedKind && (
        <select id="upload-kind" name="kind" defaultValue="script" aria-label="What is it">
          <option value="script">Script</option>
          <option value="first_cut">First cut</option>
          <option value="final">Final video</option>
          <option value="cutdown">15-sec cutdown</option>
          <option value="extra_format">Extra format</option>
          <option value="other">Other (team only)</option>
        </select>
      )}
      {mode === 'file' && <input id="upload-file" type="file" name="file" aria-label="File" />}
      {mode === 'link' && <input id="share-url" name="url" type="url" inputMode="url" placeholder={VIDEO_KINDS.includes(fixedKind) ? 'https://drive.google.com/…' : 'https://docs.google.com/…'} aria-label="Link" className="share-url" />}
      {mode === 'text' && <textarea id="share-body" name="body" rows={8} placeholder="Paste the script here" aria-label="Text" className="share-body" />}
      <button className="btn btn-ghost btn-sm" disabled={busy}>{busy ? 'Saving…' : mode === 'file' ? 'Upload' : 'Share'}</button>
      {mode === 'link' && <p className="hint share-hint">{fixedKind ? LINK_HINT[VIDEO_KINDS.includes(fixedKind) ? 'video' : 'doc'] : `${LINK_HINT.doc} For videos: ${LINK_HINT.video}`}</p>}
      {msg?.error && <p className="form-error" role="alert">{msg.error}</p>}
      {msg?.ok && <p className="form-ok">{msg.ok}</p>}
    </form>
  )
}
