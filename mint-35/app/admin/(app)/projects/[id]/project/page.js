import {projectRef} from '@/lib/status'
import {formatDate, formatDateTime} from '@/lib/dates'
import {CustomerLink} from '../CustomerPanel'
import DownloadAll from '../DownloadAll'
import {CLIENT_FILE_DAYS, CLIENT_FILE_KINDS} from '@/lib/retention'
import {loadOrder} from '../_lib/order'
import {answers, checkoutExtras, neededBy, KIND_LABEL, INTAKE_KINDS} from '../_lib/text'
import {exemptLabel, SALES_TAX_LABEL} from '@/lib/tax'

const ALERT_LABEL = {sms: 'Text', whatsapp: 'WhatsApp', email: 'Email only'}
const site = w => (w.startsWith('http') ? w : `https://${w}`)

export default async function ProjectDetails({params}) {
  const {id} = await params
  const {p, jobs, multi, files, events, custUrl} = await loadOrder(id)
  return (
    <div className="project-grid">
      <div className="col-main">
        {jobs.map(j => {
          const theirs = files.filter(f => f.project_id === j.id && INTAKE_KINDS.includes(f.kind) && !f.batch)
          // Batches added from the client's page, newest first.
          const batches = Object.entries(Object.groupBy(files.filter(f => f.project_id === j.id && f.batch), f => f.batch))
            .sort(([a], [b]) => b.localeCompare(a))
          return (
            <section key={j.id} className="panel">
              <h2>{multi ? `${projectRef(j.number)} · ` : ''}{j.package || 'No package'}</h2>
              <dl className="kv">
                <dt>Video format</dt><dd>{j.orientation || '—'}</dd>
                {checkoutExtras(j).length > 0 && <><dt>Extras</dt><dd>{checkoutExtras(j).join(', ')}</dd></>}
                {neededBy(j) && <><dt>{j.brief?.launch_at ? 'Launch' : 'Needed by'}</dt><dd>{formatDate(neededBy(j))}</dd></>}
                {j.due_date && <><dt>First cut due</dt><dd>{formatDate(j.due_date)}</dd></>}
                {j.brief?.tax && <><dt>Sales tax</dt><dd>{j.brief.tax.exempt ? `Tax-exempt: ${exemptLabel(j.brief.tax.reason)}` : j.brief.tax.outside ? 'None (billed outside NJ)' : SALES_TAX_LABEL}</dd></>}
              </dl>
              <h3 className="sub-head">Their answers</h3>
              <dl className="answers">
                {answers(j).map(([label, v]) => <div key={label}><dt>{label}</dt><dd>{v}</dd></div>)}
              </dl>
              <div className="sub-head-row">
                <h3 className="sub-head">Files they sent with the order</h3>
                {theirs.length > 0 && <DownloadAll files={theirs.map(f => ({name: f.name, url: f.download}))} />}
              </div>
              {theirs.length ? (
                <ul className="files">
                  {theirs.map(f => (
                    <li key={f.id}>
                      <span className="file-kind">{KIND_LABEL[f.kind]}</span>
                      <a href={f.href} target="_blank" rel="noopener noreferrer">{f.name}</a>
                    </li>
                  ))}
                </ul>
              ) : (() => {
                const gone = events.find(e => e.project_id === j.id && e.type === 'files_deleted')
                return <p className="muted">{gone ? `Deleted ${formatDate(gone.created_at)}, ${gone.data.days} days after delivery.` : 'No files.'}</p>
              })()}
              {j.status === 'delivered' && theirs.some(f => CLIENT_FILE_KINDS.includes(f.kind) && !f.url && !f.body) && (
                <p className="muted small">Client files are deleted automatically {CLIENT_FILE_DAYS} days after delivery. Use Download all to keep a copy.</p>
              )}
              {(() => {
                const shared = events.filter(e => e.project_id === j.id && e.type === 'files_added' && !e.data?.batch && e.data?.links?.length)
                return shared.length > 0 && <>
                  <h3 className="sub-head">Links they shared to bigger files</h3>
                  <ul className="files">
                    {shared.flatMap(e => e.data.links.map(u => <li key={e.id + u}><span className="file-kind">{formatDateTime(e.created_at)}</span><a href={u} target="_blank" rel="noopener noreferrer">{u}</a></li>))}
                  </ul>
                </>
              })()}
              {batches.length > 0 && <>
                <h3 className="sub-head">Added after ordering</h3>
                {batches.map(([batch, list]) => {
                  const ev = events.find(e => e.project_id === j.id && e.type === 'files_added' && e.data?.batch === batch)?.data || {}
                  const note = ev.note
                  return (
                    <div key={batch} className="batch">
                      <div className="batch-head">
                        <span><b>{formatDateTime(list[0].created_at)}</b> <span className="muted">· {list.length} file{list.length > 1 ? 's' : ''}</span></span>
                        <DownloadAll files={list.map(f => ({name: f.name, url: f.download}))} />
                      </div>
                      {note && <p className="batch-note">&ldquo;{note}&rdquo;</p>}
                      {ev.links?.length > 0 && <p className="batch-links">Links to bigger files: {ev.links.map(u => <a key={u} href={u} target="_blank" rel="noopener noreferrer">{u}</a>)}</p>}
                      <ul className="files">
                        {list.map(f => (
                          <li key={f.id}>
                            <span className="file-kind">{KIND_LABEL[f.kind]}</span>
                            <a href={f.href} target="_blank" rel="noopener noreferrer">{f.name}</a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )
                })}
              </>}
            </section>
          )
        })}
      </div>
      <aside className="col-side">
        <section className="panel">
          <h2>Client</h2>
          <dl className="kv">
            <dt>Name</dt><dd>{[p.title, p.name].filter(Boolean).join(' ')}</dd>
            <dt>Email</dt><dd><a href={`mailto:${p.email}`}>{p.email}</a></dd>
            {p.phone && <><dt>Cell</dt><dd><a href={`tel:${p.phone.replace(/[^\d+]/g, '')}`}>{p.phone}</a></dd></>}
            {p.company && <><dt>Company</dt><dd>{p.company}</dd></>}
            {p.website && <><dt>Website</dt><dd><a href={site(p.website)} target="_blank" rel="noopener noreferrer">{p.website}</a></dd></>}
            {p.brief?.billing && <><dt>Billing address</dt><dd>{[p.brief.billing.line1, p.brief.billing.line2].filter(Boolean).join(', ')}<br />{p.brief.billing.city}, {p.brief.billing.state} {p.brief.billing.zip}</dd></>}
            {p.alert_channel && <><dt>Alerts</dt><dd>{ALERT_LABEL[p.alert_channel]}</dd></>}
          </dl>
        </section>
        <section className="panel">
          <h2>Client&rsquo;s project page</h2>
          <p className="hint">Their private link for this order. It&rsquo;s in every email; copy it if they ask.</p>
          <CustomerLink url={custUrl} />
        </section>
      </aside>
    </div>
  )
}
