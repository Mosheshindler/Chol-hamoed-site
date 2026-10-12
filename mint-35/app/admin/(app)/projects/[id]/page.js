import Link from 'next/link'
import {notFound} from 'next/navigation'
import {createClient} from '@/lib/supabase/server'
import {STATUSES, TRANSITIONS, projectRef, formatMoney} from '@/lib/status'
import {formatDate, formatDateTime} from '@/lib/dates'
import StatusPill from '../../StatusPill'
import StatusActions from './StatusActions'
import JobForm from './JobForm'
import NoteForm from './NoteForm'
import FileUpload from './FileUpload'
import {CustomerLink, ReplyForm, AddonDecision} from './CustomerPanel'
import {siteOrigin, customerLink} from '@/lib/site'

const ANSWERS = [
  ['promoting', 'What they’re promoting'],
  ['audience', 'Target audience'],
  ['key_message', 'Most important thing to know'],
  ['desired_action', 'What viewers should do'],
  ['must_appear', 'Must appear'],
  ['placements', 'Where it will run'],
  ['orientation', 'Orientation'],
  ['ideal_date', 'Ideal delivery'],
  ['brand_colors', 'Brand colors'],
  ['legal_text', 'Required text / legal'],
  ['restrictions', 'Can’t do'],
  ['references_links', 'References'],
]

const KIND_LABEL = {logo: 'Logo', brand_image: 'Brand image', script: 'Script', first_cut: 'First cut', final: 'Final', other: 'Other'}

function describe(e, names) {
  const who = names[e.actor] || 'Website'
  switch (e.type) {
    case 'submitted': return 'Submitted from the website'
    case 'status': return `${who} moved it to “${STATUSES[e.data.to]?.label}”${e.data.price_cents != null ? ` at ${formatMoney(e.data.price_cents)}` : ''}${e.data.due_date ? `, due ${formatDate(e.data.due_date)}` : ''}`
    case 'price': return `${who} set the price to ${formatMoney(e.data.price_cents)}`
    case 'assigned': return e.data.to ? `${who} assigned it to ${names[e.data.to] || 'someone'}` : `${who} unassigned it`
    case 'due': return e.data.due_date ? `${who} set the due date to ${formatDate(e.data.due_date)}` : `${who} cleared the due date`
    case 'file': return `${who} uploaded ${KIND_LABEL[e.data.kind]?.toLowerCase() || 'a file'}: ${e.data.name}`
    case 'note': return null
    case 'customer': return `Customer ${e.data.decision === 'approve' ? 'approved' : 'requested changes'}, moved to “${STATUSES[e.data.to]?.label}”`
    case 'addon': return `Customer requested add-on: ${e.data.label}${e.data.details ? ` (${e.data.details})` : ''}`
    case 'addon_accepted': return `${who} confirmed add-on ${e.data.label} at ${formatMoney(e.data.price_cents)}`
    case 'addon_declined': return `${who} declined add-on ${e.data.label}`
    default: return e.type
  }
}

export default async function ProjectPage({params}) {
  const {id} = await params
  const supabase = await createClient()
  const {data: p} = await supabase.from('projects').select('*').eq('id', id).maybeSingle()
  if (!p) notFound()

  const [{data: files}, {data: events}, {data: team}, {data: siblings}, {data: messages}, {data: addons}] = await Promise.all([
    supabase.from('project_files').select('*').eq('project_id', id).order('created_at'),
    supabase.from('project_events').select('*').eq('project_id', id).order('created_at', {ascending: false}),
    supabase.from('team_members').select('id, name').order('name'),
    p.order_id && p.order_size > 1
      ? supabase.from('projects').select('id, number, package, status, price_cents, order_item').eq('order_id', p.order_id).order('order_item')
      : Promise.resolve({data: null}),
    supabase.from('project_messages').select('id, author, member_id, body, created_at').eq('project_id', id).order('created_at'),
    supabase.from('project_addons').select('*').eq('project_id', id).order('created_at'),
  ])
  const custUrl = customerLink(await siteOrigin(), p.customer_token)
  const names = Object.fromEntries((team || []).map(t => [t.id, t.name]))
  const {data: signed} = files?.length
    ? await supabase.storage.from('project-files').createSignedUrls(files.map(f => f.path), 3600)
    : {data: []}
  const urls = Object.fromEntries((signed || []).map(s => [s.path, s.signedUrl]))

  const value = (k) => {
    const v = p[k]
    if (k === 'placements') return [...(v || []), p.placement_other].filter(Boolean).join(', ')
    if (k === 'ideal_date') return v ? formatDate(v) : ''
    return v
  }

  return (
    <>
      <Link href="/admin" className="back">← All jobs</Link>
      <div className="project-head">
        <div>
          <p className="mono muted">{projectRef(p.number)} · received {formatDateTime(p.created_at)}</p>
          <h1>{p.company || p.name}</h1>
          <p className="muted">{p.package || 'No package chosen'} · {formatMoney(p.price_cents)}{p.due_date ? ` · due ${formatDate(p.due_date)}` : ''}</p>
        </div>
        <StatusPill status={p.status} />
      </div>

      {siblings?.length > 1 && (
        <section className="order-panel" aria-label="Order">
          <span className="order-panel-label">Order · project {p.order_item} of {p.order_size}</span>
          <ul>
            {siblings.map(o => (
              <li key={o.id} className={o.id === p.id ? 'current' : undefined}>
                {o.id === p.id
                  ? <b>{projectRef(o.number)}</b>
                  : <Link href={`/admin/projects/${o.id}`}>{projectRef(o.number)}</Link>}
                <span>{o.package || 'No package'}</span>
                <span className="num">{formatMoney(o.price_cents)}</span>
                <StatusPill status={o.status} />
              </li>
            ))}
          </ul>
          <span className="order-panel-total">Order total {formatMoney(siblings.reduce((s, o) => s + (o.price_cents || 0), 0))}</span>
        </section>
      )}

      <StatusActions id={p.id} status={p.status} steps={TRANSITIONS[p.status] || []} price={p.price_cents} />

      <div className="project-grid">
        <div className="col-main">
          <section className="panel">
            <h2>Customer</h2>
            <dl className="kv">
              <dt>Name</dt><dd>{p.name}</dd>
              <dt>Email</dt><dd><a href={`mailto:${p.email}`}>{p.email}</a></dd>
              {p.company && <><dt>Company</dt><dd>{p.company}</dd></>}
              {p.website && <><dt>Website</dt><dd><a href={p.website.startsWith('http') ? p.website : `https://${p.website}`} target="_blank" rel="noopener noreferrer">{p.website}</a></dd></>}
            </dl>
          </section>

          <section className="panel">
            <h2>Questionnaire</h2>
            <dl className="answers">
              {ANSWERS.map(([k, label]) => {
                const v = value(k)
                return v ? <div key={k}><dt>{label}</dt><dd>{v}</dd></div> : null
              })}
            </dl>
          </section>

          <section className="panel">
            <h2>Customer page</h2>
            <p className="hint">The customer&rsquo;s private link for this order. It&rsquo;s in their emails; copy it if they ask.</p>
            <CustomerLink url={custUrl} />
          </section>

          <section className="panel">
            <h2>Messages with the customer</h2>
            {messages?.length ? (
              <ol className="thread">
                {messages.map(m => (
                  <li key={m.id} className={m.author === 'team' ? 'from-team' : 'from-cust'}>
                    <b>{m.author === 'team' ? (names[m.member_id] || 'Team') : p.name}</b>
                    <p>{m.body}</p>
                    <time>{formatDateTime(m.created_at)}</time>
                  </li>
                ))}
              </ol>
            ) : <p className="muted">No messages yet.</p>}
            <ReplyForm id={p.id} />
          </section>

          {addons?.length > 0 && (
            <section className="panel">
              <h2>Add-on requests</h2>
              <ul className="addon-reqs">
                {addons.map(a => (
                  <li key={a.id}>
                    <div><b>{a.label}</b>{a.details && <span className="muted"> · {a.details}</span>}<small className="muted"> · {formatDateTime(a.created_at)}</small></div>
                    {a.status === 'requested'
                      ? <AddonDecision addonId={a.id} suggested={a.price_cents != null ? a.price_cents / 100 : null} />
                      : <span className={`pill ${a.status === 'accepted' ? 'pill-go' : 'pill-off'}`}>{a.status === 'accepted' ? `Confirmed · ${formatMoney(a.price_cents)}` : 'Declined'}</span>}
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section className="panel">
            <h2>Files</h2>
            {files?.length ? (
              <ul className="files">
                {files.map(f => (
                  <li key={f.id}>
                    <span className="file-kind">{KIND_LABEL[f.kind]}</span>
                    <a href={urls[f.path]} target="_blank" rel="noopener noreferrer">{f.name}</a>
                    <small className="muted">{f.size ? (f.size < 1048576 ? `${Math.max(1, Math.round(f.size / 1024))} KB` : `${(f.size / 1048576).toFixed(1)} MB`) : ''}</small>
                  </li>
                ))}
              </ul>
            ) : <p className="muted">No files yet.</p>}
            <FileUpload projectId={p.id} />
          </section>
        </div>

        <aside className="col-side">
          <section className="panel">
            <h2>Job</h2>
            <JobForm id={p.id} price={p.price_cents} assignedTo={p.assigned_to} dueDate={p.due_date} team={team || []} />
          </section>

          <section className="panel">
            <h2>Activity</h2>
            <NoteForm id={p.id} />
            <ol className="timeline-log">
              {(events || []).map(e => (
                <li key={e.id} className={e.type === 'note' ? 'is-note' : undefined}>
                  {e.type === 'note'
                    ? <><b>{names[e.actor] || 'Someone'}</b><p>{e.data.text}</p></>
                    : <p>{describe(e, names)}</p>}
                  <time>{formatDateTime(e.created_at)}</time>
                </li>
              ))}
            </ol>
          </section>
        </aside>
      </div>
    </>
  )
}
