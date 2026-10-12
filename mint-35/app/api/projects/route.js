import {NextResponse} from 'next/server'
import {createAdminClient} from '@/lib/supabase/admin'
import {PACKAGES} from '@/lib/status'

const PLACEMENTS = ['Social', 'Paid Advertising', 'YouTube', 'Website', 'Digital Signage', 'Streaming', 'Other']
const ORIENTATIONS = ['9:16 Vertical', '1:1 Square', '16:9 Horizontal', 'Not sure - recommend one']
const MAX_FILES = 12
const MAX_FILE_BYTES = 250 * 1024 * 1024

const str = (v, max = 4000) => (typeof v === 'string' ? v.trim().slice(0, max) : '') || null

// Step 1 of a public submission: save the questionnaire and hand back one signed upload
// URL per file, so large files go straight to storage instead of through this function.
export async function POST(request) {
  let body
  try { body = await request.json() } catch { return NextResponse.json({error: 'Invalid request.'}, {status: 400}) }

  if (body._honey) return NextResponse.json({ok: true}) // bot filled the hidden field

  const project = {
    name: str(body.name, 200),
    email: str(body.email, 320),
    company: str(body.company, 200),
    website: str(body.website, 500),
    promoting: str(body.promoting),
    audience: str(body.audience),
    key_message: str(body.key_message),
    desired_action: str(body.desired_action),
    must_appear: str(body.must_appear),
    placements: Array.isArray(body.placements) ? body.placements.filter(p => PLACEMENTS.includes(p)) : [],
    placement_other: str(body.placement_other, 500),
    orientation: ORIENTATIONS.includes(body.orientation) ? body.orientation : null,
    ideal_date: /^\d{4}-\d{2}-\d{2}$/.test(body.ideal_date || '') ? body.ideal_date : null,
    brand_colors: str(body.brand_colors, 500),
    legal_text: str(body.legal_text),
    restrictions: str(body.restrictions),
    references_links: str(body.references_links),
    package: PACKAGES.includes(body.package) ? body.package : null,
  }

  const missing = ['name', 'email', 'promoting', 'audience', 'key_message', 'desired_action'].filter(k => !project[k])
  if (!project.orientation) missing.push('orientation')
  if (missing.length) return NextResponse.json({error: 'Please fill in every required field.', missing}, {status: 400})
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(project.email)) return NextResponse.json({error: 'Please enter a valid email address.'}, {status: 400})

  const files = (Array.isArray(body.files) ? body.files : []).slice(0, MAX_FILES)
  if (files.some(f => !f || typeof f.name !== 'string' || !(f.size > 0) || f.size > MAX_FILE_BYTES)) {
    return NextResponse.json({error: 'Each file must be under 250 MB.'}, {status: 400})
  }

  const db = createAdminClient()
  const {data: created, error} = await db.from('projects').insert(project).select('id, number, intake_token').single()
  if (error) {
    console.error('Project insert failed', error)
    return NextResponse.json({error: 'We couldn’t save your project. Please try again.'}, {status: 500})
  }

  await db.from('project_events').insert({project_id: created.id, type: 'submitted', data: {}})

  const uploads = []
  for (const [i, f] of files.entries()) {
    const kind = f.kind === 'logo' ? 'logo' : 'brand_image'
    const safe = f.name.replace(/[^\w.\-]+/g, '_').slice(-120)
    const path = `${created.id}/intake/${i}-${safe}`
    const {data, error: upErr} = await db.storage.from('project-files').createSignedUploadUrl(path)
    if (upErr) {
      console.error('Signed upload URL failed', upErr)
      continue
    }
    uploads.push({index: i, path, token: data.token})
  }

  return NextResponse.json({id: created.id, number: created.number, intakeToken: created.intake_token, uploads})
}
