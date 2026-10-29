import 'server-only'
import {esc, FOOTER_HTML, FOOTER_TEXT} from './emailParts'

export {esc}

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
    body: JSON.stringify({from, to, subject, html: html + FOOTER_HTML, text: toText(html) + FOOTER_TEXT, reply_to: replyTo || process.env.EMAIL_REPLY_TO || 'info@mintmediallc.com'}),
  })
  if (res.ok) return {ok: true}
  const detail = (await res.text()).slice(0, 300)
  console.error('Email failed', res.status, detail)
  return {ok: false, error: `${res.status} ${detail}`}
}


// A readable plain-text copy of an email's HTML; links are written out as "text (address)".
export function toText(html) {
  return String(html || '')
    .replace(/<a [^>]*href="([^"]+)"[^>]*>(.*?)<\/a>/gis, (_, href, label) => {
      const t = label.replace(/<[^>]+>/g, '').trim()
      return t && t !== href && !href.startsWith('mailto:') ? `${t} (${href})` : t || href
    })
    .replace(/<\/p>|<hr[^>]*>/gi, '\n\n')
    .replace(/<(br|\/li|\/tr|\/h\d|\/div)[^>]*>/gi, '\n')
    .replace(/<li[^>]*>/gi, '- ')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'")
    .replace(/&ldquo;|&rdquo;/g, '"').replace(/&rsquo;/g, "'").replace(/&mdash;/g, '—')
    .replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim()
}
