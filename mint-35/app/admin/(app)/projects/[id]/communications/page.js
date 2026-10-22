import Link from 'next/link'
import {TRANSITIONS, projectRef, forPackage} from '@/lib/status'
import {formatDateTime} from '@/lib/dates'
import {customerNotice} from '@/lib/notices'
import {withTax} from '@/lib/tax'
import {ReplyForm, CustomerLink} from '../CustomerPanel'
import {AssignForm} from '../JobForm'
import {loadOrder} from '../_lib/order'

// Status moves that emailed the client, rebuilt from the job's history.
const EMAILED = ['quoted', 'card_saved', 'script_sent', 'first_cut_sent', 'delivered']

export default async function Communications({params}) {
  const {id} = await params
  const {p, jobs, multi, messages, events, team, names, waitingOn, custUrl, base} = await loadOrder(id)
  const jobOf = Object.fromEntries(jobs.map(j => [j.id, j]))
  const label = j => (multi ? `${projectRef(j.number)} · ${j.package}` : j.package || 'This video')
  const sent = events
    .filter(e => e.type === 'status' && (EMAILED.includes(e.data.to) || (e.data.to === 'in_progress' && e.data.charge_id)))
    .map(e => {
      const j = jobOf[e.project_id]
      const n = customerNotice({status: e.data.to, p: j, link: custUrl, priceCents: e.data.price_cents, charge: e.data.charge_id ? {cents: e.data.charged_cents, id: e.data.charge_id} : null})
      return n && {id: e.id, at: e.created_at, subject: n.subject, html: n.html, job: j}
    })
    .filter(Boolean)
  const upcoming = jobs.map(j => {
    const step = (TRANSITIONS[j.status] || []).find(t => t.primary)
    if (!step) return null
    const to = step.to === 'quoted' && j.qb_card_id ? 'card_saved' : step.to
    const charging = j.status === 'card_saved' && step.to === 'in_progress'
    const n = customerNotice({status: to, p: j, link: custUrl, priceCents: j.price_cents, charge: charging ? {cents: withTax(j, j.price_cents), id: '(shown after charging)'} : null})
    return n && {j, step: forPackage(step.label, j.package), ...n}
  }).filter(Boolean)

  return (
    <div className="project-grid">
      <div className="col-main">
        <section className="panel">
          <h2>Messages with the client</h2>
          {messages.length ? (
            <ol className="thread">
              {messages.map(m => (
                <li key={m.id} className={m.author === 'team' ? 'from-team' : 'from-cust'}>
                  <b>{m.author === 'team' ? (names[m.member_id] || 'Team') : p.name}{multi && jobOf[m.project_id] && <span className="muted"> · {projectRef(jobOf[m.project_id].number)}</span>}</b>
                  <p>{m.body}</p>
                  <time>{formatDateTime(m.created_at)}</time>
                </li>
              ))}
            </ol>
          ) : <p className="muted">No messages yet.</p>}
          <ReplyForm id={p.id} jobs={jobs.map(j => ({id: j.id, label: label(j)}))} />
        </section>

        {upcoming.map(u => (
          <section key={u.j.id} className="panel">
            <h2>Next email{multi ? ` · ${projectRef(u.j.number)}` : ''}</h2>
            <p className="hint">Goes out when you click &ldquo;{u.step}&rdquo;. You can share the link and add a personal line on the <Link href={`${base}/progress`}>Progress</Link> page.</p>
            <div className="email-preview">
              <p className="email-subject"><span className="muted">Subject:</span> {u.subject}</p>
              <div dangerouslySetInnerHTML={{__html: u.html}} />
            </div>
          </section>
        ))}

        <section className="panel">
          <h2>Emails sent automatically</h2>
          {sent.length ? (
            <ul className="sent-list">
              {sent.map(s => (
                <li key={s.id}>
                  <details>
                    <summary><b>{s.subject}</b><span className="muted"> · {formatDateTime(s.at)}</span></summary>
                    <div className="email-preview"><div dangerouslySetInnerHTML={{__html: s.html}} /></div>
                  </details>
                </li>
              ))}
            </ul>
          ) : <p className="muted">None yet. The client got the order confirmation when they ordered.</p>}
          <p className="hint">Rebuilt from the job&rsquo;s history, so wording may differ slightly from older emails. Personal lines show in the messages above.</p>
        </section>
      </div>
      <aside className="col-side">
        <section className="panel">
          <h2>Who&rsquo;s on it</h2>
          <p className={`wait-line ${waitingOn ? `wait-${waitingOn}` : ''}`}>{waitingOn === 'team' ? 'Waiting on us' : waitingOn === 'customer' ? 'Waiting on the client' : 'Nothing waiting'}</p>
          {jobs.map(j => (
            <div key={j.id} className="assign-row">
              {multi && <p className="muted small">{label(j)}</p>}
              <AssignForm id={j.id} assignedTo={j.assigned_to} team={team} />
            </div>
          ))}
        </section>
        <section className="panel">
          <h2>Client</h2>
          <dl className="kv">
            <dt>Name</dt><dd>{p.name}</dd>
            <dt>Email</dt><dd><a href={`mailto:${p.email}`}>{p.email}</a></dd>
            {p.phone && <><dt>Cell</dt><dd><a href={`tel:${p.phone.replace(/[^\d+]/g, '')}`}>{p.phone}</a></dd></>}
          </dl>
          <p className="hint">Their project page:</p>
          <CustomerLink url={custUrl} />
        </section>
      </aside>
    </div>
  )
}
