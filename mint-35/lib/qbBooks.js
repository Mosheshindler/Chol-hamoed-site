import 'server-only'
import {createAdminClient} from './supabase/admin'
import {qbAccounting, getConnection} from './qb'
import {packageByName, EXTRA_FORMAT_PRICE, CHECKOUT_EXTRAS} from './packages'
import {addonByKey} from './addons'
import {projectRef} from './status'
import {jobTaxRate, taxCents} from './tax'

// Bookkeeping sync (Nov 2026, set up with the bookkeeper): every card charge made from the admin also becomes a
// QuickBooks Online sales receipt, so the books match the deposit without anyone typing it in.
// - One QuickBooks customer per client (the organization, or the person when there's none). No sub-customers.
// - Lines use the bookkeeper's existing items, matched by exact name: packages (Single 35, Campaign 3,
//   Momentum Pack) and add-ons (Extra format, 15-second cutdown, Subtitles, Extra revision round, Rush delivery).
//   Discounts and team price changes go on a "Price adjustment" line.
// - Sales tax is recorded like a regular invoice: lines marked taxable, with the tax we actually charged
//   (Intuit's "override" so the receipt total equals the charge to the cent). Exempt and out-of-state: no tax.
// - The receipt carries the Payments charge id (CCTransId, TxnSource IntuitPayment), which is how QuickBooks
//   matches it to the deposit and records the processing fee by itself (Intuit's eCommerce guide).
// A failed sync never undoes or blocks the charge: it's logged on the job (Billing tab) with a "Try again" button.

const PRICE_ADJUSTMENT = 'Price adjustment'
const money = cents => Math.round(cents) / 100
const q = s => String(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'")
const nyDate = iso => new Date(iso || Date.now()).toLocaleDateString('en-CA', {timeZone: 'America/New_York'})

async function findOne(entity, where) {
  const r = await qbAccounting.query(`select * from ${entity} where ${where} maxresults 1`)
  return r?.QueryResponse?.[entity]?.[0] || null
}

async function item(name) {
  const found = await findOne('Item', `Name = '${q(name)}' and Active = true`)
  if (!found) throw new Error(`QuickBooks has no product/service named “${name}”. Add it (exact name) or rename the existing one, then try again.`)
  return {value: found.Id, name: found.Name}
}

function address(b) {
  if (!b?.line1) return undefined
  return {Line1: b.line1, ...(b.line2 ? {Line2: b.line2} : {}), City: b.city, CountrySubDivisionCode: b.state, PostalCode: b.zip, Country: 'USA'}
}

// The client's QuickBooks customer: found by display name (organization, else the person), created if new.
async function customerFor(p) {
  const display = (p.company || p.name || '').trim().slice(0, 100)
  if (!display) throw new Error('The job has no client name.')
  const existing = await findOne('Customer', `DisplayName = '${q(display)}'`)
  if (existing) return existing
  const [first, ...rest] = (p.name || '').trim().split(/\s+/)
  const body = {
    DisplayName: display,
    ...(p.company ? {CompanyName: p.company.slice(0, 100)} : {}),
    GivenName: (first || '').slice(0, 100), FamilyName: rest.join(' ').slice(0, 100),
    ...(p.email ? {PrimaryEmailAddr: {Address: p.email}} : {}),
    ...(p.phone ? {PrimaryPhone: {FreeFormNumber: p.phone}} : {}),
    ...(address(p.brief?.billing) ? {BillAddr: address(p.brief.billing)} : {}),
  }
  try {
    return (await qbAccounting.create('customer', body)).Customer
  } catch (e) {
    // Display names are shared with vendors and employees; a clash there gets a marked name instead.
    if (!/duplicate|already been used/i.test(e.message)) throw e
    const alt = `${display.slice(0, 88)} (Mint 35)`
    return (await findOne('Customer', `DisplayName = '${q(alt)}'`)) || (await qbAccounting.create('customer', {...body, DisplayName: alt})).Customer
  }
}

// Receipt lines for the job's own charge, mirroring the admin Billing tab.
async function jobLines(p) {
  const pkg = packageByName(p.package)
  if (!pkg) throw new Error(`The job’s package (“${p.package || 'none'}”) isn’t one of the QuickBooks products. Enter this receipt by hand.`)
  const videos = pkg.videos || 1
  const lines = [{item: pkg.name, qty: 1, unit: pkg.price * 100, desc: `${pkg.name} · ${projectRef(p.number)}`}]
  for (const f of p.brief?.extra_formats || []) lines.push({item: 'Extra format', qty: videos, unit: EXTRA_FORMAT_PRICE * 100, desc: `${f} version`})
  for (const k of p.brief?.extras || []) {
    const a = CHECKOUT_EXTRAS.find(x => x.key === k)
    if (a?.price != null) lines.push({item: a.label, qty: videos, unit: a.price * 100, desc: a.label})
  }
  const listed = lines.reduce((s, l) => s + l.qty * l.unit, 0)
  const diff = p.price_cents - listed
  if (diff) {
    const d = p.brief?.discount
    const desc = d?.cents && -diff === d.cents ? `Discount code ${d.code} (${d.label})` : diff < 0 ? 'Discount' : 'Price adjusted by our team'
    lines.push({item: PRICE_ADJUSTMENT, qty: 1, unit: diff, desc})
  }
  return lines
}

// Creates the sales receipt for one charge. `kind` is 'job' or 'addon'.
async function createReceipt({p, kind, addon}) {
  const chargeId = kind === 'job' ? p.charge_id : addon.charge_id
  if (!chargeId) throw new Error('There’s no card charge to record.')
  const docNumber = kind === 'job' ? projectRef(p.number) : `${projectRef(p.number)}-A${addon.id.slice(0, 4).toUpperCase()}`
  // Never two receipts for one charge (Intuit's rule): one already made, maybe by an earlier try, is reused.
  const already = await findOne('SalesReceipt', `DocNumber = '${q(docNumber)}'`)
  if (already) return already

  const raw = kind === 'job' ? await jobLines(p)
    : [{item: addonByKey(addon.addon)?.label || addon.label, qty: 1, unit: addon.price_cents, desc: `${addon.label}${addon.details ? ` · ${addon.details}` : ''} · ${projectRef(p.number)}`}]
  const net = kind === 'job' ? p.price_cents : addon.price_cents
  const rate = jobTaxRate(p)
  const tax = taxCents(net, rate)
  const charged = kind === 'job' ? p.charged_cents : net + tax
  if (net + tax !== charged) throw new Error(`The lines (${money(net + tax)}) don’t add up to the charge (${money(charged)}). Enter this receipt by hand.`)

  const refs = {}
  for (const name of new Set(raw.map(l => l.item))) refs[name] = await item(name)
  const customer = await customerFor(p)
  const t = p.brief?.tax
  const Line = raw.map(l => ({
    DetailType: 'SalesItemLineDetail',
    Amount: money(l.qty * l.unit),
    Description: l.desc.slice(0, 4000),
    SalesItemLineDetail: {ItemRef: refs[l.item], Qty: l.qty, UnitPrice: money(l.unit), TaxCodeRef: {value: tax ? 'TAX' : 'NON'}},
  }))
  const ship = address(p.brief?.billing)
  const note = [
    `Mint 35 ${projectRef(p.number)}${kind === 'addon' ? ` add-on: ${addon.label}` : ''}`,
    `QuickBooks Payments charge ${chargeId}`,
    t?.exempt ? `Tax-exempt: ${t.reason}` : t?.outside ? 'Billed outside NJ: no sales tax' : !t ? 'Ordered before sales tax was added' : null,
  ].filter(Boolean).join(' · ')

  const body = {
    DocNumber: docNumber,
    TxnDate: nyDate(kind === 'job' ? p.charged_at : addon.charged_at),
    CustomerRef: {value: customer.Id, name: customer.DisplayName},
    ...(p.email ? {BillEmail: {Address: p.email}} : {}),
    ...(ship ? {BillAddr: ship, ShipAddr: ship} : {}),
    Line,
    PrivateNote: note.slice(0, 4000),
    CreditCardPayment: {CreditChargeInfo: {ProcessPayment: true}, CreditChargeResponse: {CCTransId: chargeId}},
    TxnSource: 'IntuitPayment',
  }
  if (tax) {
    // Our tax, as charged. The tax code is the one QuickBooks keeps for the customer (automated sales tax).
    const code = customer.DefaultTaxCodeRef?.value
    body.TxnTaxDetail = {...(code ? {TxnTaxCodeRef: {value: code}} : {}), TotalTax: money(tax)}
  }
  const r = (await qbAccounting.create('salesreceipt', body)).SalesReceipt
  if (Math.round(Number(r.TotalAmt) * 100) !== charged) {
    console.error('QuickBooks receipt total differs from the charge', {doc: docNumber, total: r.TotalAmt, charged})
  }
  return r
}

// Records one charge in QuickBooks and logs the outcome on the job. Never throws.
export async function syncCharge({projectId, kind = 'job', addonId = null, actor = null}) {
  const db = createAdminClient()
  const log = data => db.from('project_events').insert({project_id: projectId, actor, type: 'qb_sync', data: {kind, addon_id: addonId, ...data}})
  try {
    if (!(await getConnection())) return {ok: false}
    const {data: p} = await db.from('projects').select('*').eq('id', projectId).single()
    const addon = addonId ? (await db.from('project_addons').select('*').eq('id', addonId).single()).data : null
    const r = await createReceipt({p, kind, addon})
    await log({ok: true, receipt_id: r.Id, doc_number: r.DocNumber, total: r.TotalAmt, charge_id: kind === 'job' ? p.charge_id : addon?.charge_id})
    return {ok: true}
  } catch (e) {
    const message = e.status === 401 || e.status === 403
      ? 'QuickBooks hasn’t allowed bookkeeping access yet. Reconnect QuickBooks in Settings, then press Try again.'
      : e.message
    console.error('QuickBooks bookkeeping sync failed', {projectId, kind, addonId, message, intuit_tid: e.intuitTid})
    await log({ok: false, message, intuit_tid: e.intuitTid || null}).catch(() => {})
    return {ok: false, error: message}
  }
}
