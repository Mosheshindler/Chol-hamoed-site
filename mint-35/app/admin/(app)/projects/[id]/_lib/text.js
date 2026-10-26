import {STATUSES, formatMoney, forPackage} from '@/lib/status'
import {addonByKey} from '@/lib/addons'
import {packageByName, EXTRA_FORMAT_PRICE, CHECKOUT_EXTRAS} from '@/lib/packages'
import {formatDate, businessDaysUntil} from '@/lib/dates'
import {upcomingClosedDays} from '@/lib/holidays'
import {jobTaxRate, taxCents, exemptLabel, SALES_TAX_LABEL} from '@/lib/tax'
import {STYLES, STORY, VOICES, TONES, MUSIC, labelOf} from '@/lib/intake'

export const KIND_LABEL = {logo: 'Logo', brand_image: 'Brand image', brand_material: 'Brand material', design_file: 'Design file', media: 'Photo / video to use', reference: 'Character reference', tax_exempt: 'Tax-exempt certificate', script: 'Script', first_cut: 'First cut', final: 'Final', cutdown: '15-sec cutdown', extra_format: 'Extra format', other: 'Other'}
// Files the customer sent with the order, and the ones we deliver.
export const INTAKE_KINDS = ['logo', 'brand_image', 'brand_material', 'design_file', 'media', 'reference', 'tax_exempt']
export const DELIVERY_KINDS = ['script', 'first_cut', 'final', 'cutdown', 'extra_format', 'other']
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
    ['Footage links (too big to upload)', b.media_links],
    ['Too big to upload, no link given', b.skipped_files?.join(', ')],
    ['References', p.references_links],
    ['Required text / legal', p.legal_text],
    ['Can’t do', p.restrictions],
    ['Ideal delivery', date(p.ideal_date)],
    ['Latest in hand', date(p.latest_date)],
    ['Where it will run', [...(p.placements || []), p.placement_other].filter(Boolean).join(', ')],
    ['Brand colors', p.brand_colors],
    ['Logo', b.logo_override ? 'Customer only has a logo for what they’re promoting (see their files)' : ''],
    ['Brand materials links', b.brand_links],
    ['Design files link', b.design_link],
    ['Designer', b.designer],
  ].filter(([, v]) => v)
}

// The date the customer needs it: launch for Momentum, otherwise the latest in-hand date.
export const neededBy = j => j.brief?.launch_at?.slice(0, 10) || j.latest_date || null

// What each extra means for the team: a separate file to deliver, or a change to the video itself.
const EXTRA_NOTE = {orientation: 'separate file', cutdown: 'separate file', captions: 'on the video', revision: 'extra round', rush: 'faster schedule'}
// Extras chosen at checkout, labeled so it's clear what each one adds.
export const checkoutExtras = j => [
  ...(j.brief?.extra_formats || []).map(f => `Extra: ${f} version (separate file)`),
  ...(j.brief?.extras || []).map(k => `Extra: ${addonByKey(k)?.label} (${addonByKey(k)?.price == null ? 'quote' : EXTRA_NOTE[k]})`),
]

// Everything we hand over for one job, from the order and from add-ons confirmed later.
// `kind` + `label` say where each one is shared; `note` covers extras that change the video itself.
export function deliverables(j, addons, files) {
  const pkg = packageByName(j.package)
  const videos = pkg?.videos || 1
  const x = videos > 1 ? ` × ${videos}` : ''
  const mine = files.filter(f => f.project_id === j.id)
  const has = (kind, label) => mine.filter(f => f.kind === kind && (!label || (f.name || '').startsWith(label)))
  const later = addons.filter(a => a.project_id === j.id && a.status === 'accepted')
  const formats = [...(j.brief?.extra_formats || []), ...later.filter(a => a.addon === 'orientation').map(a => a.details).filter(Boolean)]
  const cutdown = (j.brief?.extras || []).includes('cutdown') || later.some(a => a.addon === 'cutdown')
  const subtitles = (j.brief?.extras || []).includes('captions') || later.some(a => a.addon === 'captions')
  const list = [{key: 'final', label: `Final video${j.orientation ? `, ${j.orientation}` : ''}${x}`, kind: 'final', shared: has('final')}]
  for (const f of [...new Set(formats)]) list.push({key: 'xf-' + f, label: `Extra format: ${f}${x}`, kind: 'extra_format', fileLabel: f, shared: has('extra_format', f)})
  if (cutdown) list.push({key: 'cutdown', label: `15-second cutdown${x}`, kind: 'cutdown', shared: has('cutdown')})
  if (subtitles) list.push({key: 'subs', label: 'Subtitles', note: 'Burned into the final video. No separate file.'})
  return list
}

// Countdown to a date in business days, e.g. "3 business days left", "Today", "2 business days late".
export function countdown(date) {
  const n = businessDaysUntil(date, upcomingClosedDays())
  if (n == null) return null
  if (n === 0) return {text: 'Today', tone: 'soon'}
  if (n < 0) return {text: `${-n} business day${n === -1 ? '' : 's'} late`, tone: 'late'}
  return {text: `${n} business day${n === 1 ? '' : 's'} left`, tone: n <= 2 ? 'soon' : 'ok'}
}

// Price breakdown for one job: what the order form charged for, plus add-ons confirmed later.
export function billing(j, addons) {
  const pkg = packageByName(j.package)
  const videos = pkg?.videos || 1
  const lines = []
  if (pkg) lines.push({label: `${pkg.name} package`, cents: pkg.price * 100})
  const per = cents => (videos > 1 ? ` · ${formatMoney(cents)} × ${videos} videos` : '')
  for (const f of j.brief?.extra_formats || []) lines.push({label: `Extra: ${f} version`, detail: 'Separate file to deliver' + per(EXTRA_FORMAT_PRICE * 100), cents: EXTRA_FORMAT_PRICE * videos * 100})
  for (const k of j.brief?.extras || []) {
    const a = CHECKOUT_EXTRAS.find(x => x.key === k)
    if (!a) continue
    const what = {cutdown: 'Separate file to deliver', captions: 'Added to the video'}[a.key] || ''
    lines.push(a.price != null
      ? {label: `Extra: ${a.label}`, detail: what + per(a.price * 100), cents: a.price * videos * 100}
      : {label: `Extra: ${a.label}`, detail: 'Quoted separately', cents: null})
  }
  const d = j.brief?.discount
  if (d?.cents) lines.push({label: `Discount: ${d.code}`, detail: d.label, cents: -d.cents})
  const listed = lines.reduce((s, l) => s + (l.cents || 0), 0)
  const price = j.price_cents ?? (listed || null)
  const adjust = j.price_cents != null && pkg && j.price_cents !== listed ? j.price_cents - listed : 0
  const later = addons.filter(a => a.project_id === j.id && a.status === 'accepted')
  const pending = addons.filter(a => a.project_id === j.id && a.status === 'requested')
  // Sales tax on the job and on later add-ons (none when exempt or ordered before tax was added).
  const rate = jobTaxRate(j)
  const laterCents = later.reduce((s, a) => s + (a.price_cents || 0), 0)
  const tax = taxCents(price, rate) + later.reduce((s, a) => s + taxCents(a.price_cents, rate), 0)
  const taxInfo = j.brief?.tax?.exempt ? `Exempt: ${exemptLabel(j.brief.tax.reason)}` : rate ? SALES_TAX_LABEL : j.brief?.tax?.outside ? 'No sales tax (billed outside NJ)' : 'No sales tax (ordered before tax was added)'
  const total = (price || 0) + laterCents + tax
  const paid = (j.charged_cents || 0) + later.filter(a => a.charge_id).reduce((s, a) => s + (a.price_cents || 0) + taxCents(a.price_cents, rate), 0)
  return {lines, listed, price, adjust, later, pending, tax, taxInfo, total, paid}
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
    case 'deliverables_deleted': return `${e.data.count} delivered file${e.data.count > 1 ? 's' : ''} (script, cuts, final) deleted automatically, ${e.data.days} days after delivery`
    case 'files_deleted': return `${e.data.count} client file${e.data.count > 1 ? 's' : ''} deleted automatically, ${e.data.days} days after delivery`
    case 'files_added': return `Customer ${[e.data.count ? `added ${e.data.count} file${e.data.count > 1 ? 's' : ''}` : '', e.data.links?.length ? `shared ${e.data.links.length > 1 ? 'links' : 'a link'} to bigger files` : ''].filter(Boolean).join(' and ')} from their project page${e.data.note ? `: “${e.data.note}”` : ''}`
    case 'addon': return `Customer requested add-on: ${e.data.label}${e.data.details ? ` (${e.data.details})` : ''}`
    case 'addon_accepted': return `${who} confirmed add-on ${e.data.label} at ${formatMoney(e.data.price_cents)}`
    case 'addon_declined': return `${who} declined add-on ${e.data.label}`
    default: return e.type
  }
}
