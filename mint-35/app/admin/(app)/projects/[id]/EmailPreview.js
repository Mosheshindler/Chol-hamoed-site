'use client'

import {fillNote, FOOTER_HTML} from '@/lib/emailParts'

// The exact email the client will get, with the team's own text filled in as they type.
export default function EmailPreview({mail, note}) {
  if (!mail) return null
  return (
    <div className="email-preview">
      <p className="email-preview-label">Preview</p>
      <p className="email-subject"><span className="muted">Subject:</span> {mail.subject}</p>
      <div dangerouslySetInnerHTML={{__html: fillNote(mail.html, note) + FOOTER_HTML}} />
    </div>
  )
}
