import {NextResponse} from 'next/server'
import {randomUUID} from 'node:crypto'
import {createAdminClient} from '@/lib/supabase/admin'
import {PACKAGE_NAMES, ORG_ONLY_NAMES, packageByName} from '@/lib/packages'
import {projectRef} from '@/lib/status'
import {paymentsReady, saveCardFromToken} from '@/lib/qb'
import {DISCLAIMER_VERSION} from '@/lib/disclaimer'
import {earliestDelivery, isClosedDay} from '@/lib/dates'
import {upcomingClosedDays} from '@/lib/holidays'
import {TITLES, ALERTS, STYLES, STORY, VOICES, TONES, MUSIC, UPLOAD_KINDS, DISCLAIMER_POINTS} from '@/lib/intake'

const ORIENTATIONS = ['9:16 Vertical', '1:1 Square', '16:9 Horizontal', 'Not sure - recommend one']
const MAX_ITEMS = 10
const MAX_FILES = 40
const MAX_FILE_BYTES = 250 * 1024 * 1024

const str = (v, max = 4000) => (typeof v === 'string' ? v.trim().slice(0, max) : '') || null
const pick = (list, v) => (list.some(o => o.value === v) ? v : 'pick')
const isDate = v => /^\d{4}-\d{2}-\d{2}$/.test(v || '')
const bad = (error, status = 400) => NextResponse.json({error}, {status})

// Step 1 of a submission: save the order (one job per package, sharing an order_id) and hand
// back one signed upload URL per file, so large files go straight to storage.
export async function POST(request) {
  let body
  try { body = await request.json() } catch { return bad('Invalid request.') }

  if (body._honey) return NextResponse.json({ok: true}) // bot filled the hidden field
  if (body.acceptedDisclaimer !== DISCLAIMER_VERSION || body.acceptedPoints !== DISCLAIMER_POINTS.length) {
    return bad('Please read and accept the AI Production Disclaimer.')
  }

  // Step 1: one point of contact.
  const c = body.contact || {}
  const contact = {
    title: TITLES.includes(c.title) ? c.title : null,
    first_name: str(c.first_name, 100),
    last_name: str(c.last_name, 100),
    email: str(c.email, 320),
    phone: str(c.phone, 40),
    company: str(c.company, 200),
    website: str(c.website, 500),
    alert_channel: ALERTS.some(a => a.value === c.alert_channel) ? c.alert_channel : null,
  }
  if (!contact.first_name || !contact.last_name) return bad('Please enter your first and last name.')
  if (!contact.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email)) return bad('Please enter a valid email address.')
  if (!contact.phone || contact.phone.replace(/\D/g, '').length < 10) return bad('Please enter your cell phone number.')
  if (!contact.company) return bad('Please enter your company or organization name.', 400)
  if (!contact.alert_channel) return bad('Please choose how we should alert you.')
  const name = [contact.first_name, contact.last_name].join(' ')

  // Step 2: brand details shared by every video in the order.
  const b = body.brand || {}
  const brand = {logo_override: !!b.logo_override, design_link: str(b.design_link, 1000), designer: str(b.designer, 300)}

  // Step 3: one brief per video.
  const rawItems = Array.isArray(body.items) ? body.items : []
  if (!rawItems.length || rawItems.length > MAX_ITEMS) return bad(`An order can have 1 to ${MAX_ITEMS} videos.`)

  const closed = upcomingClosedDays()
  const earliest = earliestDelivery(new Date(Date.now() - 3600000), closed)
  const items = []
  for (const [i, it] of rawItems.entries()) {
    const which = rawItems.length > 1 ? ` for video ${i + 1}` : ''
    const pkg = PACKAGE_NAMES.includes(it?.package) ? it.package : null
    const momentum = ORG_ONLY_NAMES.includes(pkg)
    const brief = {
      kind: momentum ? 'momentum' : 'classic',
      style: pick(STYLES, it?.style), story: pick(STORY, it?.story),
      voice: pick(VOICES, it?.voice), tone: pick(TONES, it?.tone), music: pick(MUSIC, it?.music),
      ...brand,
    }
    if (brief.story === 'text') { delete brief.voice; delete brief.tone }
    const row = {
      package: pkg,
      promoting: str(it?.promoting),
      desired_action: str(it?.desired_action),
      must_appear: str(it?.must_appear),
      orientation: ORIENTATIONS.includes(it?.orientation) ? it.orientation : null,
      references_links: str(it?.references_links),
      legal_text: str(it?.legal_text),
      restrictions: str(it?.restrictions),
    }
    if (!row.promoting || !row.desired_action || !row.orientation) return bad(`Please fill in every required question${which}.`)

    if (momentum) {
      Object.assign(brief, {
        campaign_link: str(it?.campaign_link, 1000), goal: str(it?.goal, 100), match: str(it?.match, 300),
        launch_at: str(it?.launch_at, 40), tagline: str(it?.tagline, 300),
      })
      if (!brief.campaign_link || !brief.goal || !brief.launch_at) return bad(`Please fill in every required question${which}.`)
      const launch = brief.launch_at.slice(0, 10)
      if (!isDate(launch) || launch < earliest) return bad(`The launch date${which} needs to be at least 3 business days out, so all 5 videos are ready in time.`)
      row.latest_date = launch
    } else {
      Object.assign(row, {
        audience: str(it?.audience), key_message: str(it?.key_message),
        ideal_date: isDate(it?.ideal_date) ? it.ideal_date : null,
        latest_date: isDate(it?.latest_date) ? it.latest_date : null,
      })
      brief.item_website = str(it?.item_website, 500)
      if (!row.audience || !row.key_message) return bad(`Please fill in every required question${which}.`)
      if (!row.latest_date) return bad(`Please add the latest date you need the video in hand${which}.`)
      for (const d of [row.ideal_date, row.latest_date].filter(Boolean)) {
        if (d < earliest) return bad(`Please pick dates at least 3 business days from today${which}.`)
        if (isClosedDay(d, closed)) return bad(`Please pick dates on business days (not weekends or holidays)${which}.`)
      }
      if (row.ideal_date && row.ideal_date > row.latest_date) return bad(`The ideal date can’t be after the latest date${which}.`)
    }
    items.push({...row, brief})
  }
  if (items.some(it => ORG_ONLY_NAMES.includes(it.package)) && !contact.company) {
    return bad(`${ORG_ONLY_NAMES.join(' / ')} is for organizations. Please enter your organization’s name.`)
  }

  const files = (Array.isArray(body.files) ? body.files : []).slice(0, MAX_FILES)
  if (files.some(f => !f || typeof f.name !== 'string' || !(f.size > 0) || f.size > MAX_FILE_BYTES || !UPLOAD_KINDS[f.kind])) {
    return bad('Each file must be under 250 MB.')
  }
  if (!brand.logo_override && !files.some(f => f.kind === 'logo')) return bad('Please upload your main logo.')
  if (brand.logo_override) {
    const missing = items.findIndex((_, i) => !files.some(f => f.kind === 'media' && f.item === i))
    if (missing !== -1) return bad(`Please upload the logo or graphics for what you’re promoting${items.length > 1 ? ` (video ${missing + 1})` : ''}.`)
  }

  const orderId = randomUUID()

  // With QuickBooks connected, a card is required and is saved before the order is created.
  let card = null
  if (await paymentsReady()) {
    const cardToken = typeof body.cardToken === 'string' ? body.cardToken.slice(0, 500) : ''
    if (!cardToken) return NextResponse.json({error: 'Please add a card to place your order.'}, {status: 400})
    try {
      card = await saveCardFromToken(orderId, cardToken)
    } catch (e) {
      console.error('Card save failed', e.message)
      return NextResponse.json({error: `We couldn’t save that card: ${e.message} Please check it or try another card.`}, {status: 402})
    }
  }
  const rows = items.map((it, i) => {
    const listed = packageByName(it.package)
    return {
      ...contact, name, ...it,
      order_id: orderId, order_item: i + 1, order_size: items.length,
      ...(card && {qb_customer_id: orderId, qb_card_id: card.id, card_last4: card.last4, card_brand: card.brand}),
      price_cents: listed ? listed.price * 100 : null, // list price; the team can change it when accepting
    }
  })

  const db = createAdminClient()
  const {data: created, error} = await db.from('projects').insert(rows).select('id, number, intake_token, order_item').order('order_item')
  if (error) {
    console.error('Order insert failed', error)
    return NextResponse.json({error: 'We couldn’t save your order. Please try again.'}, {status: 500})
  }

  await db.from('project_events').insert(created.map(p => ({project_id: p.id, type: 'submitted', data: {order_size: items.length}})))
  await db.from('project_events').insert(created.map(p => ({project_id: p.id, type: 'disclaimer_accepted', data: {version: DISCLAIMER_VERSION, points: DISCLAIMER_POINTS}})))

  // Order-wide files (logo, brand materials) go under the first job and are linked to every job by
  // /complete; a video's own files go under that video's job.
  const first = created[0]
  const uploads = []
  for (const [i, f] of files.entries()) {
    const shared = UPLOAD_KINDS[f.kind].shared
    const job = shared ? first : created[Number.isInteger(f.item) ? f.item : 0] || first
    const safe = f.name.replace(/[^\w.\-]+/g, '_').slice(-120)
    const path = `${job.id}/intake/${shared ? 'shared' : 'video'}-${f.kind}-${i}-${safe}`
    const {data, error: upErr} = await db.storage.from('project-files').createSignedUploadUrl(path)
    if (upErr) {
      console.error('Signed upload URL failed', upErr)
      continue
    }
    uploads.push({index: i, path, token: data.token})
  }

  return NextResponse.json({
    id: first.id,
    intakeToken: first.intake_token,
    number: first.number,
    refs: created.map(p => projectRef(p.number)),
    uploads,
  })
}
