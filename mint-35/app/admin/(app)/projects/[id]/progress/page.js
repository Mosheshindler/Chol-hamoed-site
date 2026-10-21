import {STATUSES, TRANSITIONS, projectRef, forPackage, scriptWord} from '@/lib/status'
import {formatDate, formatDateTime} from '@/lib/dates'
import {customerNotice} from '@/lib/notices'
import StatusPill from '../../../StatusPill'
import StatusActions from '../StatusActions'
import UpdateForm from '../UpdateForm'
import FileUpload from '../FileUpload'
import {DueForm} from '../JobForm'
import {loadOrder} from '../_lib/order'
import {describe, KIND_LABEL, DELIVERY_KINDS, DELIVERS} from '../_lib/text'

const STAGE_OF = {submitted: 0, quoted: 1, card_saved: 1, in_progress: 2, script_sent: 3, in_production: 4, first_cut_sent: 5, approved: 5, revising: 5, delivered: 6}

export default async function Progress({params}) {
  const {id} = await params
  const {jobs, multi, files, events, names, custUrl} = await loadOrder(id)

  return (
    <div className="stack">
      {jobs.map(j => {
        const w = scriptWord(j.package)
        const stages = ['Received', 'Accepted', 'Started', w === 'script' ? 'Script' : 'Sample video', 'Production', 'First cut', 'Final']
        const at = STAGE_OF[j.status] ?? -1
        const shared = Object.fromEntries(DELIVERY_KINDS.map(k => [k, files.filter(f => f.project_id === j.id && f.kind === k)]))
        const delivered = files.filter(f => f.project_id === j.id && DELIVERY_KINDS.includes(f.kind))
        const sendLabels = {quoted: 'Accept & email client', script_sent: `Send ${w} to client`, first_cut_sent: 'Send first cut to client', delivered: 'Send final to client'}
        const steps = (TRANSITIONS[j.status] || []).map(s => {
          const charging = j.status === 'card_saved' && s.to === 'in_progress' && !s.skipCharge
          const to = s.to === 'quoted' && j.qb_card_id ? 'card_saved' : s.to
          const preview = customerNotice({status: to, p: j, link: custUrl, priceCents: j.price_cents, charge: charging ? {cents: j.price_cents, id: '(shown after charging)'} : null})
          return {...s, label: forPackage(s.label, j.package), preview, delivers: DELIVERS[s.to] || null,
            sendLabel: charging ? 'Charge card, start & email client' : sendLabels[s.to] || (preview ? `${forPackage(s.label, j.package)} & email client` : null)}
        })
        const log = events.filter(e => e.project_id === j.id)
        return (
          <section key={j.id} className="panel">
            <div className="panel-head">
              <h2>{multi ? `${projectRef(j.number)} · ` : ''}{j.package || 'This video'}</h2>
              <StatusPill status={j.status} pkg={j.package} />
            </div>
            {at >= 0 && (
              <ol className="stages" aria-label="Progress">
                {stages.map((s, n) => <li key={s} className={n < at ? 'done' : n === at ? 'now' : undefined}>{s}</li>)}
              </ol>
            )}
            <p className="muted">
              {STATUSES[j.status]?.waitingOn === 'customer' ? 'Waiting on the client.' : STATUSES[j.status]?.waitingOn === 'team' ? 'Waiting on us.' : ''}
              {j.due_date ? ` First cut due ${formatDate(j.due_date)}.` : ''}
            </p>

            <StatusActions id={j.id} status={j.status} steps={steps} price={j.price_cents}
              card={j.card_last4 ? `${j.card_brand || 'card'} ending ${j.card_last4}` : null} shared={shared} scriptWord={w} />

            <div className="two-col">
              <div>
                <h3 className="sub-head">Shared with the client</h3>
                {delivered.length ? (
                  <ul className="files">
                    {delivered.map(f => (
                      <li key={f.id}>
                        <span className="file-kind">{f.kind === 'script' ? (w === 'script' ? 'Script' : 'Sample') : KIND_LABEL[f.kind]}</span>
                        {f.body
                          ? <details className="shared-text"><summary>Pasted text</summary><div className="shared-body">{f.body}</div></details>
                          : <a href={f.href} target="_blank" rel="noopener noreferrer">{f.url ? `${f.name} →` : f.name}</a>}
                        <small className="muted">{formatDate(f.created_at)}</small>
                      </li>
                    ))}
                  </ul>
                ) : <p className="muted">Nothing shared yet.</p>}
                <FileUpload projectId={j.id} />
              </div>
              <div>
                <h3 className="sub-head">Due date</h3>
                <DueForm id={j.id} dueDate={j.due_date} />
              </div>
            </div>

            <h3 className="sub-head">Post an update</h3>
            <UpdateForm id={j.id} />

            <details className="log-details">
              <summary>History ({log.length})</summary>
              <ol className="timeline-log">
                {log.map(e => (
                  <li key={e.id} className={e.type === 'note' ? 'is-note' : undefined}>
                    {e.type === 'note'
                      ? <><b>{names[e.actor] || 'Someone'}</b><p>{e.data.text}</p></>
                      : <p>{describe(e, names, j.package)}</p>}
                    <time>{formatDateTime(e.created_at)}</time>
                  </li>
                ))}
              </ol>
            </details>
          </section>
        )
      })}
    </div>
  )
}
