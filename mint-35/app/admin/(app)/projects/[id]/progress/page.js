import {STATUSES, TRANSITIONS, projectRef, forPackage, scriptWord} from '@/lib/status'
import {formatDate, formatDateTime} from '@/lib/dates'
import {customerNotice} from '@/lib/notices'
import {withTax} from '@/lib/tax'
import StatusPill from '../../../StatusPill'
import StatusActions from '../StatusActions'
import ResendEmail from '../ResendEmail'
import {NOTE_SLOT} from '@/lib/emailParts'
import UpdateForm from '../UpdateForm'
import FileUpload from '../FileUpload'
import {DueForm} from '../JobForm'
import {loadOrder} from '../_lib/order'
import {describe, DELIVERY_KINDS, DELIVERS, deliverables, neededBy, countdown} from '../_lib/text'

const STAGE_OF = {submitted: 0, quoted: 1, card_saved: 1, in_progress: 2, script_sent: 3, in_production: 4, first_cut_sent: 5, approved: 5, revising: 5, delivered: 6}

export default async function Progress({params}) {
  const {id} = await params
  const {jobs, multi, files, events, names, custUrl, addons} = await loadOrder(id)

  return (
    <div className="stack">
      {jobs.map(j => {
        const w = scriptWord(j.package)
        const stages = ['Received', 'Accepted', 'Started', w === 'script' ? 'Script' : 'Sample video', 'Production', 'First cut', 'Final']
        const at = STAGE_OF[j.status] ?? -1
        const shared = Object.fromEntries(DELIVERY_KINDS.map(k => [k, files.filter(f => f.project_id === j.id && f.kind === k)]))
        const mine = files.filter(f => f.project_id === j.id)
        const extras = deliverables(j, addons, files)
        const rows = [
          {key: 'script', label: w === 'script' ? 'Script' : 'Sample video', kind: 'script', shared: mine.filter(f => f.kind === 'script')},
          {key: 'first_cut', label: 'First cut', kind: 'first_cut', shared: mine.filter(f => f.kind === 'first_cut')},
          ...extras,
        ]
        const teamOnly = mine.filter(f => f.kind === 'other')
        const finalBy = neededBy(j)
        const dates = [
          {label: 'First cut by', date: j.due_date, empty: 'Set when production starts (3 business days)', live: at <= 4},
          {label: j.brief?.launch_at ? 'Final by (launch)' : 'Final by', date: finalBy, empty: 'Not set', live: at < 6},
        ]
        const sendLabels = {quoted: 'Accept & email client', script_sent: `Send ${w} to client`, first_cut_sent: 'Send first cut to client', delivered: 'Send final to client'}
        const steps = (TRANSITIONS[j.status] || []).map(s => {
          const charging = j.status === 'card_saved' && s.to === 'in_progress' && !s.skipCharge
          const to = s.to === 'quoted' && j.qb_card_id ? 'card_saved' : s.to
          const preview = customerNotice({status: to, p: j, link: custUrl, priceCents: j.price_cents, charge: charging ? {cents: withTax(j, j.price_cents), id: '(shown after charging)'} : null, note: NOTE_SLOT})
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
            </p>

            <div className="key-dates">
              {dates.map(d => {
                const c = d.live && d.date ? countdown(d.date) : null
                return (
                  <div key={d.label} className="key-date">
                    <span className="muted">{d.label}</span>
                    <b>{d.date ? formatDate(d.date) : <span className="muted small">{d.empty}</span>}</b>
                    {c && <span className={`countdown cd-${c.tone}`}>{c.text}</span>}
                  </div>
                )
              })}
            </div>

            <StatusActions id={j.id} status={j.status} steps={steps} price={j.price_cents} chargeTotal={withTax(j, j.price_cents)}
              card={j.card_last4 ? `${j.card_brand || 'card'} ending ${j.card_last4}` : null} shared={shared} scriptWord={w}
              alsoDue={extras.filter(r => r.kind && r.kind !== 'final').map(r => ({label: r.label, done: r.shared.length > 0}))} />
            {['quoted', 'card_saved', 'script_sent', 'first_cut_sent', 'delivered'].includes(j.status) && (() => {
              const e = log.find(x => x.type === 'email')
              return <ResendEmail id={j.id} preview={customerNotice({status: j.status, p: j, link: custUrl, priceCents: j.price_cents, note: NOTE_SLOT})} last={e ? {ok: e.data.ok, subject: e.data.subject, to: e.data.to, when: formatDateTime(e.created_at)} : null} />
            })()}

            <div className="two-col">
              <div>
                <h3 className="sub-head">Deliverables</h3>
                <ul className="deliverables">
                  {rows.map(r => (
                    <li key={r.key} className={r.note ? 'is-note' : r.shared.length ? 'is-done' : undefined}>
                      <span className="dl-check" aria-hidden="true">{r.note ? '•' : r.shared.length ? '✓' : ''}</span>
                      <div className="dl-body">
                        <b>{r.label}</b>
                        {r.note && <span className="muted small">{r.note}</span>}
                        {r.shared?.map(f => (
                          <span key={f.id} className="dl-file">
                            {f.body
                              ? <details className="shared-text"><summary>Pasted text · {formatDate(f.created_at)}</summary><div className="shared-body">{f.body}</div></details>
                              : <><a href={f.href} target="_blank" rel="noopener noreferrer">{f.url ? `${f.name} →` : f.name}</a> <small className="muted">{formatDate(f.created_at)}</small></>}
                          </span>
                        ))}
                        {r.kind && (
                          <details className="dl-share">
                            <summary>{r.shared.length ? 'Share another' : 'Share'}</summary>
                            <FileUpload projectId={j.id} kind={r.kind} label={r.fileLabel} compact />
                          </details>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
                <p className="hint">Shared items show on the client&rsquo;s project page right away. The client is emailed when you take the matching step above.</p>
                {teamOnly.length > 0 && (
                  <>
                    <h3 className="sub-head">Team-only files</h3>
                    <ul className="files">{teamOnly.map(f => <li key={f.id}><a href={f.href} target="_blank" rel="noopener noreferrer">{f.name}</a></li>)}</ul>
                  </>
                )}
              </div>
              <div>
                <h3 className="sub-head">First cut due date</h3>
                <DueForm id={j.id} dueDate={j.due_date} />
                <p className="hint">Set automatically when production starts. Change it here if needed.</p>
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
