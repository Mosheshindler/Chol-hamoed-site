import {notFound} from 'next/navigation'
import Logo from '@/components/Logo'
import {loadOrderByToken} from '@/lib/customer'
import {projectRef, formatMoney, CUSTOMER_STAGES, customerStage, customerStatus, scriptWord, STATUSES} from '@/lib/status'
import {formatDate, formatDateTime} from '@/lib/dates'
import {ADDONS, ADDON_STATUSES} from '@/lib/addons'
import {formatPrice} from '@/lib/packages'
import {Decision, MessageForm, AddonForm} from './CustomerForms'

export const metadata = {title: 'Your project · Mint 35', robots: {index: false, follow: false}}
export const dynamic = 'force-dynamic'

const KIND = {script: 'Script', first_cut: 'First cut', final: 'Final'}

export default async function CustomerPage({params}) {
  const {token} = await params
  const order = await loadOrderByToken(token)
  if (!order) notFound()
  const {jobs, files, messages, addons} = order
  const first = jobs[0]
  const total = jobs.reduce((s, j) => s + (j.price_cents || 0), 0)

  return (
    <div className="cp">
      <header className="cp-bar">
        <a href="/" aria-label="Mint 35 home"><Logo /></a>
        <span className="cp-bar-label">Your project</span>
      </header>

      <main className="container cp-main">
        <section className="cp-intro">
          <p className="eyebrow">Hi {first.name.split(' ')[0]}</p>
          <h1>{jobs.length > 1 ? `Your order of ${jobs.length} projects` : `Your ${first.package || 'Mint 35'} project`}</h1>
          <p className="muted">
            {jobs.map(j => projectRef(j.number)).join(' · ')} · ordered {formatDate(first.created_at)}
            {total > 0 && <> · total {formatMoney(total)}</>}
          </p>
          <p className="cp-private">This page is private to you. Keep the link to check progress, approve your work and message our team.</p>
        </section>

        {jobs.map(job => {
          const stage = customerStage(job.status)
          const jobFiles = files.filter(f => f.project_id === job.id)
          const jobMessages = messages.filter(m => m.project_id === job.id)
          const jobAddons = addons.filter(a => a.project_id === job.id)
          const closed = !(job.status in STATUSES) || ['declined', 'cancelled'].includes(job.status)
          const w = scriptWord(job.package)
          const reviewing = job.status === 'script_sent' ? w : job.status === 'first_cut_sent' ? 'first cut' : null

          return (
            <article key={job.id} className="cp-job" id={projectRef(job.number)}>
              <div className="cp-job-head">
                <div>
                  <p className="mono muted">{projectRef(job.number)}{jobs.length > 1 && ` · project ${job.order_item} of ${job.order_size}`}</p>
                  <h2>{job.package || 'Mint 35 project'}</h2>
                  <p className="muted">{job.promoting}</p>
                </div>
                {job.price_cents ? <b className="cp-price">{formatMoney(job.price_cents)}</b> : null}
              </div>

              {!closed && (
                <ol className="cp-stages" aria-label="Progress">
                  {CUSTOMER_STAGES.map((s, i) => (
                    <li key={s} className={i < stage ? 'done' : i === stage ? 'now' : undefined}>
                      <span aria-hidden="true">{i < stage ? '✓' : i + 1}</span>{i === 2 && w !== 'script' ? 'Sample' : s}
                    </li>
                  ))}
                </ol>
              )}

              <p className={`cp-status${reviewing ? ' cp-status-action' : ''}`}>
                {customerStatus(job)}
                {job.status === 'in_production' && job.due_date && <> First cut due <b>{formatDate(job.due_date)}</b>.</>}
              </p>

              {jobFiles.length > 0 && (
                <ul className="cp-files">
                  {jobFiles.map(f => (
                    <li key={f.id}>
                      <span className="file-kind">{KIND[f.kind]}</span>
                      <a href={f.url} download>{f.name}</a>
                      <span className="muted">{formatDate(f.created_at)}</span>
                    </li>
                  ))}
                </ul>
              )}

              {reviewing && <Decision token={token} job={job.id} what={reviewing} />}

              {ADDON_STATUSES.includes(job.status) && (
                <section className="cp-addons" aria-label="Add-ons">
                  <h3>Add more to this project</h3>
                  <p className="muted">Request an extra and our team will confirm it with you before anything is charged.</p>
                  <AddonForm token={token} job={job.id} orientation={job.orientation}
                    addons={ADDONS.map(a => ({key: a.key, label: a.label, desc: a.desc, askOrientation: !!a.askOrientation, price: a.price != null ? formatPrice(a.price) + (a.perVideo ? ' per video' : '') : null}))} />
                  {jobAddons.length > 0 && (
                    <ul className="cp-addon-list">
                      {jobAddons.map(a => (
                        <li key={a.id}>
                          <span>{a.label}{a.details ? ` · ${a.details}` : ''}</span>
                          <span className={`pill pill-${a.status === 'accepted' ? 'go' : a.status === 'declined' ? 'off' : 'wait'}`}>{a.status === 'requested' ? 'Requested' : a.status === 'accepted' ? 'Confirmed' : 'Not available'}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              )}

              <section className="cp-thread" aria-label="Messages">
                <h3>Messages</h3>
                {jobMessages.length === 0
                  ? <p className="muted">No messages yet. Questions about this project? Ask here and our team will reply by email.</p>
                  : (
                    <ol className="cp-messages">
                      {jobMessages.map(m => (
                        <li key={m.id} className={m.author === 'team' ? 'from-team' : 'from-you'}>
                          <b>{m.author === 'team' ? 'Mint 35 team' : 'You'}</b>
                          <p>{m.body}</p>
                          <time>{formatDateTime(m.created_at)}</time>
                        </li>
                      ))}
                    </ol>
                  )}
                <MessageForm token={token} job={job.id} />
              </section>
            </article>
          )
        })}
      </main>

      <footer className="cp-foot container">
        Questions? Email <a href="mailto:info@mintmediallc.com">info@mintmediallc.com</a> or call (732) 813-4222.
      </footer>
    </div>
  )
}
