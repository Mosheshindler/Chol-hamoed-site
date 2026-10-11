import Link from 'next/link'
import {createClient} from '@/lib/supabase/server'
import {STATUSES, ACTIVE, projectRef, formatMoney} from '@/lib/status'
import {formatDate} from '@/lib/dates'
import StatusPill from './StatusPill'

const VIEWS = {
  us: {label: 'Needs us', match: s => STATUSES[s].waitingOn === 'team'},
  customer: {label: 'Waiting on customer', match: s => STATUSES[s].waitingOn === 'customer'},
  active: {label: 'All active', match: s => ACTIVE.includes(s)},
  done: {label: 'Done', match: s => !ACTIVE.includes(s)},
}

export default async function JobsPage({searchParams}) {
  const {view: v} = await searchParams
  const view = VIEWS[v] ? v : 'us'
  const supabase = await createClient()
  const [{data: projects}, {data: team}] = await Promise.all([
    supabase.from('projects').select('id, number, status, name, company, package, price_cents, assigned_to, due_date, created_at').order('created_at', {ascending: false}).limit(500),
    supabase.from('team_members').select('id, name'),
  ])
  const names = Object.fromEntries((team || []).map(t => [t.id, t.name]))
  const all = projects || []
  const rows = all.filter(p => VIEWS[view].match(p.status))
  const counts = Object.fromEntries(Object.entries(VIEWS).map(([k, x]) => [k, all.filter(p => x.match(p.status)).length]))
  const today = new Date().toISOString().slice(0, 10)

  const stats = [
    {label: 'New requests', value: all.filter(p => p.status === 'submitted').length},
    {label: 'In production', value: all.filter(p => p.status === 'in_production').length},
    {label: 'Overdue', value: all.filter(p => ACTIVE.includes(p.status) && p.due_date && p.due_date < today).length, alert: true},
    {label: 'Active value', value: formatMoney(all.filter(p => ACTIVE.includes(p.status)).reduce((s, p) => s + (p.price_cents || 0), 0))},
  ]

  return (
    <>
      <div className="page-head">
        <h1>Jobs</h1>
      </div>

      <div className="stats">
        {stats.map(s => (
          <div key={s.label} className={`stat${s.alert && s.value > 0 ? ' stat-alert' : ''}`}>
            <span>{s.label}</span><b>{s.value}</b>
          </div>
        ))}
      </div>

      <nav className="tabs" aria-label="Filter jobs">
        {Object.entries(VIEWS).map(([k, x]) => (
          <Link key={k} href={`/admin?view=${k}`} className={k === view ? 'active' : undefined}>{x.label} <span className="count">{counts[k]}</span></Link>
        ))}
      </nav>

      {rows.length === 0 ? (
        <div className="empty">
          <p><b>Nothing here.</b></p>
          <p className="muted">{view === 'us' ? 'No jobs are waiting on your team. New requests from the website land here.' : 'No jobs in this list yet.'}</p>
        </div>
      ) : (
        <div className="job-table" role="table">
          <div className="job-row job-head" role="row">
            <span role="columnheader">Job</span><span role="columnheader">Customer</span><span role="columnheader">Status</span>
            <span role="columnheader">Package</span><span role="columnheader">Price</span><span role="columnheader">Assigned</span><span role="columnheader">Due</span>
          </div>
          {rows.map(p => {
            const overdue = ACTIVE.includes(p.status) && p.due_date && p.due_date < today
            return (
              <Link key={p.id} href={`/admin/projects/${p.id}`} className="job-row" role="row">
                <span className="mono" role="cell">{projectRef(p.number)}</span>
                <span role="cell"><b>{p.company || p.name}</b>{p.company && <small>{p.name}</small>}</span>
                <span role="cell"><StatusPill status={p.status} /></span>
                <span role="cell" data-label="Package">{p.package || '—'}</span>
                <span role="cell" className="num" data-label="Price">{formatMoney(p.price_cents)}</span>
                <span role="cell" data-label="Assigned">{names[p.assigned_to] || <i className="muted">Unassigned</i>}</span>
                <span role="cell" data-label="Due" className={overdue ? 'overdue' : undefined}>{p.due_date ? formatDate(p.due_date) : `Received ${formatDate(p.created_at)}`}</span>
              </Link>
            )
          })}
        </div>
      )}
    </>
  )
}
