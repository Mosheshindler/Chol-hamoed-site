'use client'

import {useEffect, useRef} from 'react'
import {MAX_UPLOAD_MB, formatSize} from '@/lib/intake'

// Pop-up when picked files are over the upload limit: suggests sharing them from the client's own
// Google Drive or Dropbox, and (with onLink) takes the link right here.
export default function TooBigDialog({files, onLink, onClose}) {
  const ref = useRef(null)
  const link = useRef(null)
  useEffect(() => { ref.current?.showModal() }, [])
  function add() {
    const v = link.current?.value.trim()
    if (v) onLink(v)
    onClose()
  }
  const one = files.length === 1
  return (
    <dialog ref={ref} className="modal too-big" onClose={onClose} aria-labelledby="too-big-title">
      <div className="modal-body">
        <button type="button" className="modal-close" onClick={onClose} aria-label="Close">✕</button>
        <h2 id="too-big-title">{one ? 'That file is too big to upload' : 'These files are too big to upload'}</h2>
        <ul className="too-big-files">
          {files.map(f => <li key={f.name + f.size}><b>{f.name}</b> <span className="muted">{formatSize(f.size)}</span></li>)}
        </ul>
        <p className="modal-lead">Files can be up to {MAX_UPLOAD_MB} MB each. Please share {one ? 'this one' : 'these'} from your own Google Drive or Dropbox instead:</p>
        <ol className="too-big-steps">
          <li>Upload {one ? 'the file' : 'the files'} to <b>Google Drive</b> or <b>Dropbox</b> (a folder works too).</li>
          <li>Set sharing to <b>&ldquo;Anyone with the link&rdquo;</b> can view.</li>
          <li>Copy the link and {onLink ? 'paste it below' : 'send it to us'}.</li>
        </ol>
        {onLink ? (
          <div className="too-big-link">
            <input ref={link} type="url" inputMode="url" placeholder="https://drive.google.com/… or https://www.dropbox.com/…" aria-label="Link to your files" autoFocus />
            <div className="too-big-actions">
              <button type="button" className="btn btn-primary btn-sm" onClick={add}>Add link</button>
              <button type="button" className="btn btn-ghost btn-sm" onClick={onClose}>I&rsquo;ll do it later</button>
            </div>
          </div>
        ) : (
          <button type="button" className="btn btn-primary btn-sm" onClick={onClose}>OK</button>
        )}
      </div>
    </dialog>
  )
}
