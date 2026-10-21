import {STATUSES, formatMoney, forPackage} from '@/lib/status'
import {addonByKey} from '@/lib/addons'
import {packageByName, EXTRA_FORMAT_PRICE, CHECKOUT_EXTRAS} from '@/lib/packages'
import {formatDate} from '@/lib/dates'
import {STYLES, STORY, VOICES, TONES, MUSIC, labelOf} from '@/lib/intake'

export const KIND_LABEL = {logo: 'Logo', brand_image: 'Brand image', brand_material: 'Brand material', design_file: 'Design file', media: 'Photo / video to use', reference: 'Character reference', script: 'Script', first_cut: 'First cut', final: 'Final', other: 'Other'}
// Files the customer sent with the order, and the ones we deliver.
export const INTAKE_KINDS = ['logo', 'brand_image', 'brand_material', 'design_file', 'media', 'reference']
export const DELIVERY_KINDS = ['script', 'first_cut', 'final', 'other']
// The step that sends each deliverable, and what that deliverable is.
export const DELIVERS = {script_sent: 'script', first_cut_sent: 'first_cut', delivered: 'final'}

const launchTime = v => {
  const [d, t] = (v || '').split('T')
  if (!d) return ''
  const [h, m] = (t || '').split(':').map(Number)
  return t ? `${formatDate(d)}, ${((h + 11) % 12) + 1}:${String(m).padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'} ET` : formatDate(d)
}

// The customer's answers, in the order the form asks them. Older jobs only have some of these.
export function answers(p) {
  const b = p.brief || {}
  const momentum = b.kind === 'momentum'
  const date = d => (d ? formatDate(d) : '')
  return [
    [momentum ? 'Raising money for' : 'What they’re promoting', p.promoting],
    ['Website for it', b.item_website],
    ['Campaign page', b.campaign_link],
    ['Goal', b.goal],
    ['Matching', b.match],
    ['Launch', launchTime(b.launch_at)],
    ['Target audience', p.audience],
    ['One thing to remember', p.key_message],
    ['Call to action', p.desired_action],
    ['Tagline / hashtag', b.tagline],
    ['The 3 videos', b.stories && (b.stories === 'ideas' ? 'Customer gave ideas (below); plan any left blank' : 'General direction only: we plan each video')],
    ...(b.video_ideas || []).map((v, n) => [`Video ${n + 1} idea`, v]),
    [momentum ? 'Names / sponsors' : 'Must appear', p.must_appear],
    ['Changes per video', b.per_video],
    ['Video format', p.orientation],
    ['Extra formats (paid at checkout)', b.extra_formats?.join(', ')],
    ['Extras chosen at checkout', b.extras?.map(k => addonByKey(k)?.label + (addonByKey(k)?.price == null ? ' (needs a quote)' : '')).join(', ')],
    ['Style', b.style && labelOf(STYLES, b.style)],
    ['Story told with', b.story && labelOf(STORY, b.story)],
    ['Voice', b.voice && labelOf(VOICES, b.voice)],
    ['Voice tone', b.tone && labelOf(TONES, b.tone)],
    ['Music mood', b.music && labelOf(MUSIC, b.music)],
    ['References', p.references_links],
    ['Required text / legal', p.legal_text],
    ['Can’t do', p.restrictions],
    ['Ideal delivery', date(p.ideal_date)],
    ['Latest in hand', date(p.latest_date)],
    ['Where it will run', [...(p.placements || []), p.placement_other].filter(Boolean).join(', ')],
    ['Brand colors', p.brand_colors],
    ['Logo', b.logo_override ? 'Customer only has a logo for what they’re promoting (see their files)' : ''],
    ['Design files link', b.design_link],
    ['Designer', b.designer],
  ].filter(([, v]) => v)
}

// The date the customer needs it: launch for Momentum, otherwise the latest in-hand date.
export const neededBy = j => j.brief?.launch_at?.slice(0, 10) || j.latest_date || null

// Extras chosen at checkout, by label (quoted ones marked).
export const checkoutExtras = j => [
  ...(j.brief?.extra_formats || []).map(f => `Extra format: ${f}`),
  ...(j.brief?.extras || []).map(k => addonByKey(k)?.label + (addonByKey(k)?.price == null ? ' (quote)' : '')),
]

// Price breakdown for one job: what the order form charged for, plus add-ons confirmed later.
export function billing(j, addons) {
  const pkg = packageByName(j.package)
  const videos = pkg?.videos || 1
  const lines = []
  if (pkg) lines.push({label: `${pkg.name} package`, cents: pkg.price * 100})
  for (const f of j.brief?.extra_formats || []) lines.push({label: `Extra format: ${f}`, detail: videos > 1 ? `${formatMoney(EXTRA_FORMAT_PRICE * 100)} × ${videos} videos` : null, cents: EXTRA_FORMAT_PRICE * videos * 100})
  for (const k of j.brief?.extras || []) {
    const a = CHECKOUT_EXTRAS.find(x => x.key === k)
    if (!a) continue
    lines.push(a.price != null
      ? {label: a.label, detail: videos > 1 ? `${formatMoney(a.price * 100)} × ${videos} videos` : null, cents: a.price * videos * 100}
      : {label: a.label, detail: 'Quoted separately', cents: null})
  }
  const listed = lines.reduce((s, l) => s + (l.cents || 0), 0)
  const price = j.price_cents ?? (listed || null)
  const adjust = j.price_cents != null && pkg && j.price_cents !== listed ? j.price_cents - listed : 0
  const later = addons.filter(a => a.project_id === j.id && a.status === 'accepted')
  const pending = addons.filter(a => a.project_id === j.id && a.status === 'requested')
  const total = (price || 0) + later.reduce((s, a) => s + (a.price_cents || 0), 0)
  const paid = (j.charged_cents || 0) + later.filter(a => a.charge_id).reduce((s, a) => s + (a.price_cents || 0), 0)
  return {lines, listed, price, adjust, later, pending, total, paid}
}

export function describe(e, names, pkg) {
  const who = names[e.actor] || 'Website'
  switch (e.type) {
    case 'submitted': return 'Submitted from the website'
    case 'disclaimer_accepted': return `Customer accepted the AI Production Disclaimer (version ${e.data.version})${e.data.points ? `, ticking each key point: ${e.data.points.join(' / ')}` : ''}`
    case 'status': return `${who} moved it to “${forPackage(STATUSES[e.data.to]?.label, pkg)}”${e.data.price_cents != null ? ` at ${formatMoney(e.data.price_cents)}` : ''}${e.data.charged_cents ? ` and charged ${formatMoney(e.data.charged_cents)}` : ''}${e.data.due_date ? `, due ${formatDate(e.data.due_date)}` : ''}`
    case 'price': return `${who} set the price to ${formatMoney(e.data.price_cents)}`
    case 'assigned': return e.data.to ? `${who} assigned it to ${names[e.data.to] || 'someone'}` : `${who} unassigned it`
    case 'due': return e.data.due_date ? `${who} set the due date to ${formatDate(e.data.due_date)}` : `${who} cleared the due date`
    case 'file': return `${who} shared ${KIND_LABEL[e.data.kind]?.toLowerCase() || 'a file'}: ${e.data.name}`
    case 'note': return null
    case 'charge_failed': return `Charge failed: ${e.data.message}`
    case 'customer': return `Customer ${e.data.decision === 'approve' ? 'approved' : 'requested changes'}, moved to “${forPackage(STATUSES[e.data.to]?.label, pkg)}”`
    case 'addon': return `Customer requested add-on: ${e.data.label}${e.data.details ? ` (${e.data.details})` : ''}`
    case 'addon_accepted': return `${who} confirmed add-on ${e.data.label} at ${formatMoney(e.data.price_cents)}`
    case 'addon_declined': return `${who} declined add-on ${e.data.label}`
    default: return e.type
  }
}
