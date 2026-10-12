import {NextResponse} from 'next/server'
import {randomUUID} from 'node:crypto'
import {createAdminClient} from '@/lib/supabase/admin'
import {PACKAGE_NAMES, ORG_ONLY_NAMES, packageByName} from '@/lib/packages'
import {projectRef} from '@/lib/status'

const PLACEMENTS = ['Social', 'Paid Advertising', 'YouTube', 'Website', 'Digital Signage', 'Streaming', 'Other']
const ORIENTATIONS = ['9:16 Vertical', '1:1 Square', '16:9 Horizontal', 'Not sure - recommend one']
const MAX_ITEMS = 10
const MAX_FILES = 12
const MAX_FILE_BYTES = 250 * 1024 * 1024

const str = (v, max = 4000) => (typeof v === 'string' ? v.trim().slice(0, max) : '') || null

// Step 1 of a submission: save the order (one job per package, sharing an order_id) and hand
// back one signed upload URL per file, so large files go straight to storage.
// Accepts {items: [...]} for orders; a single flat project (older form) is treated as one item.
export async function POST(request) {
  let body
  try { body = await request.json() } catch { return NextResponse.json({error: 'Invalid request.'}, {status: 400}) }

  if (body._honey) return NextResponse.json({ok: true}) // bot filled the hidden field

  const shared = {
    name: str(body.name, 200),
    email: str(body.email, 320),
    company: str(body.company, 200),
    website: str(body.website, 500),
    brand_colors: str(body.brand_colors, 500),
    legal_text: str(body.legal_text),
    restrictions: str(body.restrictions),
  }
  if (!shared.name || !shared.email) return NextResponse.json({error: 'Please enter your name and email.'}, {status: 400})
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(shared.email)) return NextResponse.json({error: 'Please enter a valid email address.'}, {status: 400})

  const rawItems = Array.isArray(body.items) ? body.items : [body]
  if (!rawItems.length || rawItems.length > MAX_ITEMS) return NextResponse.json({error: `An order can have 1 to ${MAX_ITEMS} projects.`}, {status: 400})

  const items = rawItems.map(it => ({
    package: PACKAGE_NAMES.includes(it?.package) ? it.package : null,
    promoting: str(it?.promoting),
    audience: str(it?.audience),
    key_message: str(it?.key_message),
    desired_action: str(it?.desired_action),
    must_appear: str(it?.must_appear),
    placements: Array.isArray(it?.placements) ? it.placements.filter(p => PLACEMENTS.includes(p)) : [],
    placement_other: str(it?.placement_other, 500),
    orientation: ORIENTATIONS.includes(it?.orientation) ? it.orientation : null,
    ideal_date: /^\d{4}-\d{2}-\d{2}$/.test(it?.ideal_date || '') ? it.ideal_date : null,
    references_links: str(it?.references_links),
  }))

  const incomplete = items.findIndex(it => !it.promoting || !it.audience || !it.key_message || !it.desired_action || !it.orientation)
  if (incomplete !== -1) {
    return NextResponse.json({error: items.length > 1 ? `Please fill in every required field for project ${incomplete + 1}.` : 'Please fill in every required field.'}, {status: 400})
  }
  if (items.some(it => ORG_ONLY_NAMES.includes(it.package)) && !shared.company) {
    return NextResponse.json({error: 'Online Campaign is for organizations. Please enter your organization’s name.', missing: ['company']}, {status: 400})
  }

  const files = (Array.isArray(body.files) ? body.files : []).slice(0, MAX_FILES)
  if (files.some(f => !f || typeof f.name !== 'string' || !(f.size > 0) || f.size > MAX_FILE_BYTES)) {
    return NextResponse.json({error: 'Each file must be under 250 MB.'}, {status: 400})
  }

  const orderId = randomUUID()
  const rows = items.map((it, i) => {
    const listed = packageByName(it.package)
    return {
      ...shared, ...it,
      order_id: orderId, order_item: i + 1, order_size: items.length,
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

  // Brand files are uploaded once, under the first job; /complete links them to every job.
  const first = created[0]
  const uploads = []
  for (const [i, f] of files.entries()) {
    const safe = f.name.replace(/[^\w.\-]+/g, '_').slice(-120)
    const path = `${first.id}/intake/${i}-${safe}`
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
