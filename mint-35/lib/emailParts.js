// Email pieces shared by the server (sending) and the admin pages (previewing before sending), so the
// preview the team sees is exactly what the client gets. No server-only imports here.
import {formatMoney} from './status'

export const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]))

// Every email carries who it's from and why the reader got it. Spam filters treat HTML-only mail with a
// bare link and no sender details as phishing (a client's first-cut email was flagged, Oct 26).
export const FOOTER_HTML = `<hr style="border:0;border-top:1px solid #ddd;margin:24px 0 12px"><p style="color:#777;font-size:12px;line-height:1.5;margin:0">Mint 35 by Mint Media LLC · (732) 813-4222 · <a href="mailto:info@mintmediallc.com" style="color:#777">info@mintmediallc.com</a> · <a href="https://www.mint35.com" style="color:#777">www.mint35.com</a><br>You are receiving this email about your order or project with Mint 35.</p>`
export const FOOTER_TEXT = '\n\n--\nMint 35 by Mint Media LLC · (732) 813-4222 · info@mintmediallc.com · https://www.mint35.com\nYou are receiving this email about your order or project with Mint 35.'

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

// The editable part of a client email: greeting + message. The team sees it as plain text, prefilled with the
// standard wording, and can rewrite it before sending; the receipt, project page link, sign-off and footer stay fixed.
// Previews are built with MESSAGE_SLOT where it goes, then filled as they type.
export const MESSAGE_SLOT = '<!--team-message-->'
export const textToHtml = text => String(text || '').trim().split(/\n\s*\n/).filter(Boolean)
  .map(para => `<p>${esc(para.trim()).replace(/\n/g, '<br>')}</p>`).join('')
export const fillMessage = (html, text) => String(html || '').replace(MESSAGE_SLOT, textToHtml(text))
// The message part of an email: the standard wording, the team's edited text, or the preview slot.
export function messagePart(standardHtml, message) {
  if (message === MESSAGE_SLOT) return MESSAGE_SLOT
  const edited = String(message ?? '').trim()
  return edited && edited !== toText(standardHtml).trim() ? textToHtml(edited) : standardHtml
}

// The email a client gets when the team confirms or declines an add-on. `receiptHtml` is added after a charge;
// `message` is the team's edited text (or MESSAGE_SLOT for previews). Returns the standard message as `text` too.
export function addonEmail({firstName, label, details, accepted, priceCents, taxCents = 0, charged, cardBrand, last4, message, link, ref, receiptHtml = ''}) {
  const subject = `${label}: ${accepted ? 'confirmed' : 'update'} (${ref})`
  const standard = `<p>Hi ${esc(firstName)},</p>` + (accepted
    ? `<p>We've confirmed your request for <b>${esc(label)}</b>${details ? ` (${esc(details)})` : ''} at <b>${formatMoney(priceCents)}</b>${taxCents ? ` plus ${formatMoney(taxCents)} sales tax` : ''}.${charged ? ` Your ${esc(cardBrand || 'card')} ending in ${esc(last4 || '••••')} was charged.` : ''}</p>`
    : `<p>We're not able to add <b>${esc(label)}</b> to this project. We'll be in touch if there's another option.</p>`)
  const html = messagePart(standard, message) + receiptHtml
    + `<p><a href="${link}">Open your project page</a></p><p>— The Mint 35 team</p>`
  return {subject, html, text: toText(standard)}
}
