import {projectRef} from '@/lib/status'
import {formatDate} from '@/lib/dates'
import {CustomerLink} from '../CustomerPanel'
import {loadOrder} from '../_lib/order'
import {answers, checkoutExtras, neededBy, KIND_LABEL, INTAKE_KINDS} from '../_lib/text'

const ALERT_LABEL = {sms: 'Text', whatsapp: 'WhatsApp', email: 'Email only'}
const site = w => (w.startsWith('http') ? w : `https://${w}`)

export default async function ProjectDetails({params}) {
  const {id} = await params
  const {p, jobs, multi, files, custUrl} = await loadOrder(id)
  return (
    <div className="project-grid">
      <div className="col-main">
        {jobs.map(j => {
          const theirs = files.filter(f => f.project_id === j.id && INTAKE_KINDS.includes(f.kind))
          return (
            <section key={j.id} className="panel">
              <h2>{multi ? `${projectRef(j.number)} · ` : ''}{j.package || 'No package'}</h2>
              <dl className="kv">
                <dt>Video format</dt><dd>{j.orientation || '—'}</dd>
                {checkoutExtras(j).length > 0 && <><dt>Extras</dt><dd>{checkoutExtras(j).join(', ')}</dd></>}
                {neededBy(j) && <><dt>{j.brief?.launch_at ? 'Launch' : 'Needed by'}</dt><dd>{formatDate(neededBy(j))}</dd></>}
                {j.due_date && <><dt>First cut due</dt><dd>{formatDate(j.due_date)}</dd></>}
              </dl>
              <h3 className="sub-head">Their answers</h3>
              <dl className="answers">
                {answers(j).map(([label, v]) => <div key={label}><dt>{label}</dt><dd>{v}</dd></div>)}
              </dl>
              <h3 className="sub-head">Files they sent</h3>
              {theirs.length ? (
                <ul className="files">
                  {theirs.map(f => (
                    <li key={f.id}>
                      <span className="file-kind">{KIND_LABEL[f.kind]}</span>
                      <a href={f.href} target="_blank" rel="noopener noreferrer">{f.name}</a>
                    </li>
                  ))}
                </ul>
              ) : <p className="muted">No files.</p>}
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
