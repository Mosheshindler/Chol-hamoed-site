import 'server-only'

// Sends mail through Resend's HTTP API (mint35.com is verified there). Without RESEND_API_KEY (local dev)
// messages are logged instead of sent. mint35.com has no mailbox, so replies go to EMAIL_REPLY_TO
// (default info@mintmediallc.com) unless a message sets its own replyTo.
export async function sendEmail({to, subject, html, replyTo}) {
  const key = process.env.RESEND_API_KEY
  const from = process.env.EMAIL_FROM || 'Mint 35 <hello@mint35.com>'
  if (!key) {
    console.log(`[email not sent: no RESEND_API_KEY] to=${to} subject=${subject}`)
    return {ok: false, skipped: true, error: 'Email isn’t set up (no RESEND_API_KEY).'}
  }
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {Authorization: `Bearer ${key}`, 'Content-Type': 'application/json'},
    body: JSON.stringify({from, to, subject, html, reply_to: replyTo || process.env.EMAIL_REPLY_TO || 'info@mintmediallc.com'}),
  })
  if (res.ok) return {ok: true}
  const detail = (await res.text()).slice(0, 300)
  console.error('Email failed', res.status, detail)
  return {ok: false, error: `${res.status} ${detail}`}
}

export const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]))
