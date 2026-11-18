import Link from 'next/link'
import {projectRef} from '@/lib/status'
import {formatDateTime} from '@/lib/dates'
import {loadOrder} from './_lib/order'
import JobTabs from './JobTabs'

export default async function JobLayout({children, params}) {
  const {id} = await params
  const {p, jobs, multi, waitingOn, base} = await loadOrder(id)
  return (
    <>
      <Link href="/admin" className="back">← All jobs</Link>
      <div className="project-head">
        <div>
          <p className="mono muted">{jobs.map(j => projectRef(j.number)).join(' · ')} · received {formatDateTime(p.created_at)}</p>
          <h1>{p.company || p.name}</h1>
          <p className="muted">{multi ? `${jobs.length} packages: ${jobs.map(j => j.package || 'No package').join(', ')}` : p.package || 'No package chosen'}</p>
        </div>
        {waitingOn && <span className={`wait-chip wait-${waitingOn}`}>{waitingOn === 'team' ? 'Waiting on us' : 'Waiting on the client'}</span>}
      </div>
      <JobTabs base={base} />
      {children}
    </>
  )
}
