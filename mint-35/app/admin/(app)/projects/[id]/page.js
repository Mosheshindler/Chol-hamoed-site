import Link from 'next/link'
import {STATUSES, TRANSITIONS, projectRef, formatMoney, forPackage} from '@/lib/status'
import {formatDate, formatDateTime} from '@/lib/dates'
import StatusPill from '../../StatusPill'
import {loadOrder} from './_lib/order'
import {billing, checkoutExtras, neededBy} from './_lib/text'

function Tile({href, title, more, children}) {
  return (
    <Link href={href} className="tile">
      <span className="tile-head"><h2>{title}</h2><span className="tile-more">{more} →</span></span>
      {children}
    </Link>
  )
}

export default async function JobOverview({params}) {
  const {id} = await params
  const {p, jobs, multi, addons, messages, names, lastMessage, waitingOn, base} = await loadOrder(id)
  const bills = jobs.map(j => billing(j, addons))
  const total = bills.reduce((s, b) => s + b.total, 0)
  const paid = bills.reduce((s, b) => s + b.paid, 0)
  const openRequests = addons.filter(a => a.status === 'requested').length
  const assigned = [...new Set(jobs.map(j => j.assigned_to).filter(Boolean))].map(t => names[t] || 'Someone')
  const author = m => (m.author === 'team' ? names[m.member_id] || 'Team' : p.name)

  return (
    <div className="tiles">
      <Tile href={`${base}/project`} title="Project overview" more="Full brief">
        <dl className="kv tight">
          <dt>Client</dt><dd>{p.name}{p.company ? ` · ${p.company}` : ''}</dd>
          <dt>Contact</dt><dd>{p.email}{p.phone ? ` · ${p.phone}` : ''}</dd>
        </dl>
        <ul className="tile-list">
          {jobs.map(j => (
            <li key={j.id}>
              <b>{multi && <span className="mono muted">{projectRef(j.number)} </span>}{j.package || 'No package'}</b>
              <span className="muted">{[j.orientation, ...checkoutExtras(j)].filter(Boolean).join(' · ') || 'No format chosen'}</span>
              {neededBy(j) && <span className="muted">Needed by {formatDate(neededBy(j))}</span>}
            </li>
          ))}
        </ul>
      </Tile>

      <Tile href={`${base}/billing`} title="Billing & payment" more="Breakdown">
        <p className="tile-big">{formatMoney(total)}</p>
        <dl className="kv tight">
          <dt>Paid</dt><dd>{formatMoney(paid)}</dd>
          <dt>Balance</dt><dd className={total - paid > 0 ? 'warn' : undefined}>{formatMoney(total - paid)}</dd>
          <dt>Card</dt><dd>{p.card_last4 ? `${p.card_brand || 'Card'} ending ${p.card_last4}` : <span className="muted">None on file</span>}</dd>
        </dl>
        {openRequests > 0 && <p className="tile-flag">{openRequests} add-on request{openRequests > 1 ? 's' : ''} to price</p>}
      </Tile>

      <Tile href={`${base}/progress`} title="Progress" more="Steps & updates">
        <ul className="tile-list">
          {jobs.map(j => {
            const next = (TRANSITIONS[j.status] || []).find(t => t.primary)
            return (
              <li key={j.id}>
                <span className="tile-row"><b>{multi ? `${projectRef(j.number)} · ${j.package}` : j.package || 'This video'}</b><StatusPill status={j.status} pkg={j.package} /></span>
                <span className="muted">
                  {STATUSES[j.status]?.waitingOn === 'customer' ? 'Waiting on the client' : next ? `Next: ${forPackage(next.label, j.package)}` : 'Nothing left to do'}
                  {j.due_date ? ` · due ${formatDate(j.due_date)}` : ''}
                </span>
              </li>
            )
          })}
        </ul>
      </Tile>

      <Tile href={`${base}/communications`} title="Communications" more="Full history">
        <dl className="kv tight">
          <dt>Assigned</dt><dd>{assigned.length ? assigned.join(', ') : <span className="warn">Nobody yet</span>}</dd>
          <dt>Waiting on</dt><dd>{waitingOn === 'team' ? 'Us' : waitingOn === 'customer' ? 'The client' : '—'}</dd>
        </dl>
        {lastMessage
          ? <blockquote className="tile-quote"><span className="muted">{author(lastMessage)} · {formatDateTime(lastMessage.created_at)}</span>{lastMessage.body.length > 160 ? lastMessage.body.slice(0, 160) + '…' : lastMessage.body}</blockquote>
          : <p className="muted">No messages yet.</p>}
        {messages.length > 1 && <p className="muted small">{messages.length} messages in total</p>}
      </Tile>
    </div>
  )
}
