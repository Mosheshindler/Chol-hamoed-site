import {esc, textToHtml} from './emailParts.js'
import {formatMoney} from './status.js'
import {formatDate} from './dates.js'

// The email that sends a custom package (Admin → Offers) to the client: what's included, the price and the private link.
export function offerEmail({offer, link}) {
  const first = (offer.client_name || '').trim().split(/\s+/)[0] || 'there'
  const subject = `Your custom Mint 35 package: ${offer.title}`
  const items = (offer.items || []).length
    ? `<ul style="margin:6px 0 0;padding-left:20px">${offer.items.map(i => `<li>${esc(i)}</li>`).join('')}</ul>` : ''
  const html = `<p>Hi ${esc(first)},</p>`
    + (offer.message ? textToHtml(offer.message) : `<p>Here's the custom package we put together for ${esc(offer.company || 'you')}.</p>`)
    + `<div style="border:1px solid #ddd;border-radius:10px;padding:14px 16px;margin:16px 0">`
    + `<p style="margin:0"><b style="font-size:17px">${esc(offer.title)}</b></p>`
    + `<p style="margin:4px 0 0">${offer.videos > 1 ? `${offer.videos} videos · ` : ''}<b>${formatMoney(offer.price_cents)}</b> <span style="color:#666">(plus NJ sales tax for New Jersey billing addresses, unless exempt)</span></p>`
    + items + `</div>`
    + `<p><a href="${link}" style="display:inline-block;background:#88C040;color:#0a0c0a;padding:11px 18px;border-radius:8px;text-decoration:none;font-weight:700">Review and order</a></p>`
    + `<p style="color:#666;font-size:13px">Or copy this link: ${esc(link)}</p>`
    + `<p>The link opens your order form with this package. Your card is saved when you place your order and charged in full when we start your project. You can cancel free anytime before then.${offer.expires_on ? ` This offer is valid through ${formatDate(offer.expires_on)}.` : ''}</p>`
    + `<p>Questions? Just reply to this email.</p><p>— The Mint 35 team</p>`
  return {subject, html}
}
