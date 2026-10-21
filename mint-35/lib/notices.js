import 'server-only'
import {projectRef, formatMoney, scriptWord} from '@/lib/status'
import {formatDate} from '@/lib/dates'
import {esc} from '@/lib/email'

// Payment receipt added to every email that follows a charge.
export function receipt({cents, brand, last4, chargeId, ref, item}) {
  const row = (k, v) => `<tr><td style="padding:3px 16px 3px 0;color:#666">${k}</td><td style="padding:3px 0"><b>${v}</b></td></tr>`
  return `<p style="margin:18px 0 6px"><b>Payment receipt</b></p><table style="border-collapse:collapse;font-size:14px">`
    + row('Merchant', 'Mint Media LLC (Mint 35)')
    + row('For', esc(item))
    + row('Reference', esc(ref))
    + row('Date', formatDate(new Date()))
    + row('Amount charged', formatMoney(cents))
    + row('Card', `${esc(brand || 'Card')} ending in ${esc(last4 || '••••')}`)
    + row('Transaction ID', esc(chargeId))
    + '</table>'
}

// The email the customer gets when a job moves to `status`, or null if that step sends none.
// `p` is the job; `charge` is {cents, id} when a card was just charged; `note` is an optional personal line from the team.
// The admin Progress page shows this same email as a preview before the step is taken.
export function customerNotice({status, p, link, priceCents, charge, note}) {
  const ref = projectRef(p.number)
  const w = scriptWord(p.package)
  let subject, body
  switch (status) {
    case 'quoted':
    case 'card_saved':
      subject = `Your Mint 35 project is accepted (${ref})`
      body = `<p>Good news: we've accepted your project. The price is <b>${formatMoney(priceCents ?? p.price_cents)}</b>.</p>`
        + (status === 'card_saved' ? `<p>Your card will be charged in full when we start your project.</p>` : `<p>We'll be in touch about payment before we start.</p>`)
      break
    case 'in_progress':
      if (!charge) return null
      subject = `We've started your project (${ref})`
      body = `<p>We've started work on your project. Your ${esc(p.card_brand || 'card')} ending in ${esc(p.card_last4 || '••••')} was charged <b>${formatMoney(charge.cents)}</b>.</p>`
        + receipt({cents: charge.cents, brand: p.card_brand, last4: p.card_last4, chargeId: charge.id, ref, item: `Mint 35 ${p.package || 'project'}`})
      break
    case 'script_sent':
      subject = `Your ${w} is ready to review (${ref})`
      body = `<p>Your ${w} is ready. Please review it on your project page and approve it or request changes.</p>`
      break
    case 'first_cut_sent':
      subject = `Your first cut is ready (${ref})`
      body = `<p>Your first cut is ready. Please watch it on your project page and approve it or send your revision notes.</p>`
      break
    case 'delivered':
      subject = `Your final video is ready (${ref})`
      body = `<p>Your final files are ready to download on your project page.</p>`
      break
    default:
      return null
  }
  const personal = note ? `<p>${esc(note).replace(/\n/g, '<br>')}</p>` : ''
  const html = `<p>Hi ${esc((p.name || '').split(' ')[0])},</p>` + body + personal
    + `<p><a href="${link}">Open your project page</a></p><p>— The Mint 35 team</p>`
  return {subject, html}
}
