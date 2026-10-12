'use client'

import {useState} from 'react'
import {useRouter} from 'next/navigation'
import {createClient} from '@/lib/supabase/browser'
import {recordFile} from '../../../actions'

export default function FileUpload({projectId}) {
  const router = useRouter()
  const [msg, setMsg] = useState(null)
  const [busy, setBusy] = useState(false)

  async function onSubmit(e) {
    e.preventDefault()
    const form = e.currentTarget
    const fd = new FormData(form)
    const file = fd.get('file')
    if (!file || !file.size) return setMsg({error: 'Choose a file first.'})
    setBusy(true)
    setMsg(null)
    const kind = fd.get('kind')
    const path = `${projectId}/${kind}/${Date.now()}-${file.name.replace(/[^\w.\-]+/g, '_').slice(-120)}`
    const {error} = await createClient().storage.from('project-files').upload(path, file, {contentType: file.type || undefined})
    if (error) {
      setBusy(false)
      return setMsg({error: 'Upload failed. Try again.'})
    }
    const res = await recordFile({projectId, path, name: file.name, size: file.size, kind})
    setBusy(false)
    if (res?.error) return setMsg({error: res.error})
    form.reset()
    setMsg({ok: 'Uploaded.'})
    router.refresh()
  }

  return (
    <form className="upload-row" onSubmit={onSubmit}>
      <select id="upload-kind" name="kind" defaultValue="script" aria-label="File type">
        <option value="script">Script</option>
        <option value="first_cut">First cut</option>
        <option value="final">Final</option>
        <option value="other">Other</option>
      </select>
      <input id="upload-file" type="file" name="file" aria-label="File" />
      <button className="btn btn-ghost btn-sm" disabled={busy}>{busy ? 'Uploading…' : 'Upload'}</button>
      {msg?.error && <p className="form-error" role="alert">{msg.error}</p>}
      {msg?.ok && <p className="form-ok">{msg.ok}</p>}
    </form>
  )
}
