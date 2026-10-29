// Email pieces shared by the server (sending) and the admin pages (previewing before sending), so the
// preview the team sees is exactly what the client gets. No server-only imports here.
import {formatMoney} from './status'

export const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]))

// Every email carries who it's from and why the reader got it. Spam filters treat HTML-only mail with a
// bare link and no sender details as phishing (a client's first-cut email was flagged, Oct 26).
export const FOOTER_HTML = `<hr style="border:0;border-top:1px solid #ddd;margin:24px 0 12px"><p style="color:#777;font-size:12px;line-height:1.5;margin:0">Mint 35 by Mint Media LLC · (732) 813-4222 · <a href="mailto:info@mintmediallc.com" style="color:#777">info@mintmediallc.com</a> · <a href="https://www.mint35.com" style="color:#777">www.mint35.com</a><br>You are receiving this email about your order or project with Mint 35.</p>`
export const FOOTER_TEXT = '\n\n--\nMint 35 by Mint Media LLC · (732) 813-4222 · info@mintmediallc.com · https://www.mint35.com\nYou are receiving this email about your order or project with Mint 35.'

// The team's own text in an email. Previews are built with NOTE_SLOT where it goes, then filled as they type.
export const NOTE_SLOT = '<!--team-note-->'
export const noteHtml = note => (String(note || '').trim() ? `<p>${esc(String(note).trim()).replace(/\n/g, '<br>')}</p>` : '')
export const fillNote = (html, note) => String(html || '').replace(NOTE_SLOT, noteHtml(note))

// The email a client gets when the team confirms or declines an add-on (the server adds a payment receipt
// after a charge). `note` may be NOTE_SLOT for previews.
export function addonEmail({firstName, label, details, accepted, priceCents, taxCents = 0, charged, cardBrand, last4, note, link, ref}) {
  const subject = `${label}: ${accepted ? 'confirmed' : 'update'} (${ref})`
  const html = `<p>Hi ${esc(firstName)},</p>` + (accepted
    ? `<p>We've confirmed your request for <b>${esc(label)}</b>${details ? ` (${esc(details)})` : ''} at <b>${formatMoney(priceCents)}</b>${taxCents ? ` plus ${formatMoney(taxCents)} sales tax` : ''}.${charged ? ` Your ${esc(cardBrand || 'card')} ending in ${esc(last4 || '••••')} was charged.` : ''}</p>`
    : `<p>We're not able to add <b>${esc(label)}</b> to this project. We'll be in touch if there's another option.</p>`)
    + (note === NOTE_SLOT ? NOTE_SLOT : noteHtml(note))
    + `<p><a href="${link}">Open your project page</a></p><p>— The Mint 35 team</p>`
  return {subject, html}
}
