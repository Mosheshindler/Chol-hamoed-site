import {notFound} from 'next/navigation'
import Logo from '@/components/Logo'
import {loadOrderByToken} from '@/lib/customer'
import {withTax, jobTaxRate} from '@/lib/tax'
import {projectRef, formatMoney, CUSTOMER_STAGES, customerStage, customerStatus, scriptWord, STATUSES, PRE_PRODUCTION_STATUSES, canAddFiles} from '@/lib/status'
import {formatDate, formatDateTime} from '@/lib/dates'
import {ADDONS, ADDON_STATUSES} from '@/lib/addons'
import {formatPrice} from '@/lib/packages'
import {CLIENT_FILE_DAYS, FINAL_AVAILABLE_DAYS, addDays} from '@/lib/retention'
import {Decision, MessageForm, AddonForm, AddFiles} from './CustomerForms'

export const metadata = {title: 'Your project · Mint 35', robots: {index: false, follow: false}}
export const dynamic = 'force-dynamic'

const KIND = {script: 'Script', sample: 'Sample video', first_cut: 'First cut', final: 'Final', cutdown: '15-sec cutdown', extra_format: 'Extra format'}
// What a shared link opens, in plain words.
const OPEN = {first_cut: 'Watch the first cut', final: 'Open your final video', cutdown: 'Open the 15-second cutdown'}
const openLabel = (f, legacySample) => f.kind === 'sample' || (f.kind === 'script' && legacySample) ? 'Watch the sample video' : f.kind === 'script' ? (f.name === 'Google Doc' ? 'Open the Google Doc' : 'Open the script')
  : f.kind === 'extra_format' ? `Open the ${f.name} version` : OPEN[f.kind] || `Open ${f.name}`

export default async function CustomerPage({params}) {
  const {token} = await params
  const order = await loadOrderByToken(token)
  if (!order) notFound()
  const {jobs, files, messages, addons, added} = order
  const first = jobs[0]
  // Prices shown with sales tax, as charged.
  const total = jobs.reduce((s, j) => s + withTax(j, j.price_cents), 0)

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
          const jobAdded = added.filter(f => f.project_id === job.id)
          const closed = !(job.status in STATUSES) || ['declined', 'cancelled'].includes(job.status)
          const w = scriptWord(job)
          // Momentum jobs ordered before Nov 2 shared their sample video as kind 'script'.
          const legacySample = job.package === 'Momentum Pack' && !job.brief?.review_stage
          const reviewing = job.status === 'script_sent' ? w : job.status === 'first_cut_sent' ? 'first cut' : null

          // Newest first everywhere, so what just happened is on top.
          const newest = [...jobFiles].reverse()
          const reviewKinds = ['script', 'sample', 'first_cut']
          const reviewFile = reviewing ? newest.find(f => (job.status === 'first_cut_sent' ? f.kind === 'first_cut' : f.kind === 'script' || f.kind === 'sample')) : null
          const finals = newest.filter(f => !reviewKinds.includes(f.kind))
          const lastMsg = jobMessages.at(-1)
          const confirmed = jobAddons.filter(a => a.status === 'accepted')
          const taxRate = jobTaxRate(job)
          const addonsTotal = confirmed.reduce((s, a) => s + withTax(job, a.price_cents || 0), 0)
          const fileLabel = f => (f.kind === 'script' && legacySample ? 'Sample video' : KIND[f.kind])
          const fileLink = f => f.body
            ? <span className="cp-text-label">Read it below</span>
            : f.shared
              ? <a href={f.url} target="_blank" rel="noopener noreferrer">{openLabel(f, legacySample)} →</a>
              : <a href={f.url} download>{f.name}</a>
          const fileRow = f => (
            <li key={f.id} className={f.body ? 'cp-file-text' : undefined}>
              <span className="file-kind">{fileLabel(f)}</span>
              {fileLink(f)}
              <span className="muted">{formatDate(f.created_at)}</span>
              {f.body && <div className="cp-text">{f.body}</div>}
            </li>
          )

          return (
            <article key={job.id} className="cp-job" id={projectRef(job.number)}>
              <div className="cp-job-head">
                <div>
                  <p className="mono muted">{projectRef(job.number)}{jobs.length > 1 && ` · project ${job.order_item} of ${job.order_size}`}</p>
                  <h2>{job.package || 'Mint 35 project'}</h2>
                  <p className="muted">{job.promoting}</p>
                </div>
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

              {/* What's happening now: the newest thing, with what to do about it. */}
              <section className={`cp-now${reviewing ? ' cp-now-action' : job.status === 'delivered' ? ' cp-now-done' : ''}`} aria-label="Right now">
                <p className="cp-now-label">{reviewing ? 'Your turn' : job.status === 'delivered' ? 'Delivered' : 'Right now'}</p>
                <h3>{reviewing ? `Your ${reviewing} is ready for your review` : job.status === 'delivered' ? 'Your final videos are ready' : customerStatus(job)}</h3>
                {job.status === 'in_production' && job.due_date && <p className="muted">First cut due <b>{formatDate(job.due_date)}</b>.</p>}
                {reviewFile && <ul className="cp-files cp-now-files">{fileRow(reviewFile)}</ul>}
                {reviewing && <Decision token={token} job={job.id} what={reviewing} />}
                {job.status === 'delivered' && (() => {
                  // Dated from when the final was shared (the last final file on this job).
                  const finalAt = jobFiles.filter(f => f.kind === 'final').at(-1)?.created_at
                  return (
                    <>
                      {finals.length > 0 && <ul className="cp-files cp-now-files">{finals.map(fileRow)}</ul>}
                      <div className="cp-retention">
                        <p><b>Please download your final videos.</b> They&rsquo;re available here for {FINAL_AVAILABLE_DAYS} days{finalAt ? <>, until <b>{formatDate(addDays(finalAt, FINAL_AVAILABLE_DAYS))}</b></> : ''}.</p>
                        <p className="muted small">For your privacy, the files you sent us (logos, photos, videos and graphics) are deleted {CLIENT_FILE_DAYS} days after you receive all your final files{finalAt ? <>, on {formatDate(addDays(finalAt, CLIENT_FILE_DAYS))}</> : ''}.</p>
                      </div>
                    </>
                  )
                })()}
                {lastMsg?.author === 'team' && !reviewing && (
                  <p className="cp-now-msg"><span className="muted small">Latest from our team · {formatDateTime(lastMsg.created_at)}</span>{lastMsg.body.length > 220 ? lastMsg.body.slice(0, 220) + '…' : lastMsg.body}</p>
                )}
              </section>

              {/* Everything else: each tile shows the newest item and opens for the full history. */}
              <div className="cp-tiles">
                <details className="cp-tile">
                  <summary>
                    <span className="cp-tile-head"><b>Videos &amp; files</b>{jobFiles.length > 0 && <span className="cp-count">{jobFiles.length}</span>}</span>
                    <span className="cp-tile-sum">{newest[0] ? <>{fileLabel(newest[0])} · {formatDate(newest[0].created_at)}</> : `Your ${w}, cuts and final videos will appear here.`}</span>
                    <span className="cp-tile-more">{jobFiles.length ? 'See all' : 'Open'}</span>
                  </summary>
                  <div className="cp-tile-body">
                    {jobFiles.length ? <ul className="cp-files">{newest.map(fileRow)}</ul> : <p className="muted">Nothing here yet. We&rsquo;ll email you when there&rsquo;s something to see.</p>}
                  </div>
                </details>

                <details className="cp-tile">
                  <summary>
                    <span className="cp-tile-head"><b>Messages</b>{jobMessages.length > 0 && <span className="cp-count">{jobMessages.length}</span>}</span>
                    <span className="cp-tile-sum">{lastMsg ? <>{lastMsg.author === 'team' ? 'Mint 35 team' : 'You'}: {lastMsg.body.length > 70 ? lastMsg.body.slice(0, 70) + '…' : lastMsg.body}</> : 'Questions? Message our team here.'}</span>
                    <span className="cp-tile-more">{jobMessages.length ? 'Open conversation' : 'Write a message'}</span>
                  </summary>
                  <div className="cp-tile-body">
                    {jobMessages.length > 0 && (
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
                  </div>
                </details>

                {ADDON_STATUSES.includes(job.status) && (
                  <details className="cp-tile cp-tile-extras">
                    <summary>
                      <span className="cp-tile-head"><b>Extras</b>{jobAddons.length > 0 && <span className="cp-count">{jobAddons.length}</span>}</span>
                      <span className="cp-tile-sum">Get more from your video: 15-second cutdowns, extra formats and subtitles, from {formatPrice(Math.min(...ADDONS.filter(a => a.price != null).map(a => a.price)))}.</span>
                      <span className="cp-tile-more">See extras</span>
                    </summary>
                    <div className="cp-tile-body">
                      <p className="muted">Pick an extra and our team will confirm it with you before anything is charged.</p>
                      <AddonForm token={token} job={job.id} orientation={job.orientation}
                        addons={ADDONS.map(a => ({key: a.key, label: a.label, desc: a.pitch || a.desc, askOrientation: !!a.askOrientation, price: a.price != null ? formatPrice(a.price) + (a.perVideo ? ' per video' : '') : null}))} />
                      {jobAddons.length > 0 && (
                        <ul className="cp-addon-list">
                          {[...jobAddons].reverse().map(a => (
                            <li key={a.id}>
                              <span>{a.label}{a.details ? ` · ${a.details}` : ''}</span>
                              <span className={`pill pill-${a.status === 'accepted' ? 'go' : a.status === 'declined' ? 'off' : 'wait'}`}>{a.status === 'requested' ? 'Requested' : a.status === 'accepted' ? 'Confirmed' : 'Not available'}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </details>
                )}

                {canAddFiles(job.status) && (
                  <details className="cp-tile">
                    <summary>
                      <span className="cp-tile-head"><b>Your uploads</b>{jobAdded.length > 0 && <span className="cp-count">{jobAdded.length}</span>}</span>
                      <span className="cp-tile-sum">{jobAdded.length ? <>Last added: {jobAdded.at(-1).name} · {formatDate(jobAdded.at(-1).created_at)}</> : 'Forgot something? Add photos, videos or a Google Drive / Dropbox link.'}</span>
                      <span className="cp-tile-more">Add files</span>
                    </summary>
                    <div className="cp-tile-body">
                      <p className="muted">{PRE_PRODUCTION_STATUSES.includes(job.status)
                        ? 'Send more photos, videos or graphics, or share a Google Drive or Dropbox link.'
                        : 'Your video is already in production, so we can’t promise new files will be included. You can still send them, or share a Google Drive or Dropbox link.'}</p>
                      <AddFiles token={token} job={job.id} inProduction={!PRE_PRODUCTION_STATUSES.includes(job.status)} />
                      {jobAdded.length > 0 && (
                        <ul className="cp-files">
                          {[...jobAdded].reverse().map(f => <li key={f.id}><span className="file-kind">Added</span><span>{f.name}</span><span className="muted">{formatDate(f.created_at)}</span></li>)}
                        </ul>
                      )}
                    </div>
                  </details>
                )}

                {job.price_cents ? (
                  <details className="cp-tile">
                    <summary>
                      <span className="cp-tile-head"><b>Billing</b></span>
                      <span className="cp-tile-sum">
                        <b className="cp-tile-big">{formatMoney(withTax(job, job.price_cents) + addonsTotal)}</b>
                        {' '}{job.charged_cents ? `· paid ${formatDate(job.charged_at)}` : '· charged when we start your project'}
                      </span>
                      <span className="cp-tile-more">See details</span>
                    </summary>
                    <div className="cp-tile-body">
                      <table className="cp-bill">
                        <tbody>
                          <tr><th scope="row">{job.package || 'Your project'}</th><td>{formatMoney(job.price_cents)}</td></tr>
                          {confirmed.map(a => <tr key={a.id}><th scope="row">Extra: {a.label}{a.details ? ` (${a.details})` : ''}</th><td>{formatMoney(a.price_cents)}</td></tr>)}
                          {taxRate > 0 && <tr><th scope="row">Sales tax</th><td>{formatMoney(withTax(job, job.price_cents) + addonsTotal - job.price_cents - confirmed.reduce((s, a) => s + (a.price_cents || 0), 0))}</td></tr>}
                          <tr className="cp-bill-total"><th scope="row">Total</th><td>{formatMoney(withTax(job, job.price_cents) + addonsTotal)}</td></tr>
                        </tbody>
                      </table>
                      <ul className="cp-pay">
                        {job.charged_cents
                          ? <li>Paid {formatMoney(job.charged_cents)} on {formatDate(job.charged_at)}{job.card_last4 ? ` · ${job.card_brand || 'card'} ending ${job.card_last4}` : ''}</li>
                          : <li className="muted">{job.card_last4 ? `Your ${job.card_brand || 'card'} ending ${job.card_last4} is charged when we start your project.` : 'Payment is due when we start your project.'}</li>}
                        {confirmed.filter(a => a.charge_id).map(a => <li key={a.id}>Paid {formatMoney(withTax(job, a.price_cents))} for {a.label} on {formatDate(a.charged_at)}</li>)}
                      </ul>
                    </div>
                  </details>
                ) : null}
              </div>
            </article>
          )
        })}
      </main>

      <footer className="cp-foot container">
        Questions? Email <a href="mailto:hello@mint35.com">hello@mint35.com</a> or call (732) 813-4222.
      </footer>
    </div>
  )
}
