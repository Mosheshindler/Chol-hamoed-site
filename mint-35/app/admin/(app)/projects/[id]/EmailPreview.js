'use client'

import {useEffect, useState} from 'react'
import {fillMessage, FOOTER_HTML} from '@/lib/emailParts'

// An editable client email: subject + message (greeting and body, as plain text) start as the standard wording,
// with a live preview of exactly what will be sent. The inputs are named `subject` and `message`, so the
// surrounding form sends them. `mail` is {subject, html (with MESSAGE_SLOT), text}; if it changes (e.g. a new
// add-on price) before the team edits anything, the draft follows it.
export default function EmailEditor({mail}) {
  const [subject, setSubject] = useState(mail?.subject || '')
  const [message, setMessage] = useState(mail?.text || '')
  const [edited, setEdited] = useState(false)
  useEffect(() => {
    if (!edited && mail) { setSubject(mail.subject); setMessage(mail.text) }
  }, [mail?.subject, mail?.text, edited]) // eslint-disable-line react-hooks/exhaustive-deps
  if (!mail) return null
  const reset = () => { setSubject(mail.subject); setMessage(mail.text); setEdited(false) }
  return (
    <div className="email-editor">
      <label>Subject
        <input name="subject" value={subject} onChange={e => { setSubject(e.target.value); setEdited(true) }} maxLength={200} />
      </label>
      <label>Message <span className="hint">Edit as you like. Leave a blank line between paragraphs.</span>
        <textarea name="message" value={message} onChange={e => { setMessage(e.target.value); setEdited(true) }} rows={Math.min(14, Math.max(5, message.split('\n').length + 2))} />
      </label>
      {edited && <button type="button" className="link-btn email-reset" onClick={reset}>Reset to the standard wording</button>}
      <div className="email-preview">
        <p className="email-preview-label">Preview</p>
        <p className="email-subject"><span className="muted">Subject:</span> {subject || mail.subject}</p>
        <div dangerouslySetInnerHTML={{__html: fillMessage(mail.html, message.trim() ? message : mail.text) + FOOTER_HTML}} />
      </div>
    </div>
  )
}
