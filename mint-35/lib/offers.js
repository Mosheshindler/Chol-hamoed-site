// Custom offers (Admin → Offers): one client, one package with its own name, contents and price,
// ordered once through /start?offer=<token>. The job's `package` is the offer's title and brief.offer
// keeps the terms, so billing and bookkeeping can price it (offerPackage / jobPackage).
import {packageByName} from './packages.js'

export const OFFER_DAYS = 30 // default life of a link
export const OFFER_ITEM = 'Custom package' // the QuickBooks product/service a custom package is booked under

// The offer as a package the order form and price helpers understand.
export const offerPackage = o => ({
  slug: `offer-${o.id}`, name: o.title, price: o.price_cents / 100, videos: o.videos || 1,
  items: o.items || [], blurb: o.message || '', custom: true,
})

// A job's package terms: a listed package, or the custom offer it was ordered from.
export const jobPackage = j => packageByName(j?.package) || (j?.brief?.offer ? offerPackage(j.brief.offer) : null)

export function offerState(o, today = new Date().toLocaleDateString('en-CA', {timeZone: 'America/New_York'})) {
  if (o.status === 'ordered') return 'Ordered'
  if (o.status === 'withdrawn') return 'Withdrawn'
  if (o.expires_on && o.expires_on < today) return 'Expired'
  return 'Open'
}
