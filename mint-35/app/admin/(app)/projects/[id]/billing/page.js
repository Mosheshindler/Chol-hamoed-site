import {projectRef, formatMoney} from '@/lib/status'
import {formatDateTime} from '@/lib/dates'
import {AddonDecision} from '../CustomerPanel'
import {PriceForm} from '../JobForm'
import {loadOrder} from '../_lib/order'
import {billing} from '../_lib/text'

export default async function Billing({params}) {
  const {id} = await params
  const {p, jobs, multi, addons} = await loadOrder(id)
  const bills = jobs.map(j => ({j, b: billing(j, addons)}))
  const total = bills.reduce((s, x) => s + x.b.total, 0)
  const paid = bills.reduce((s, x) => s + x.b.paid, 0)

  return (
    <div className="project-grid">
      <div className="col-main">
        {bills.map(({j, b}) => (
          <section key={j.id} className="panel">
            <h2>{multi ? `${projectRef(j.number)} · ` : ''}{j.package || 'No package'}</h2>
            <table className="bill">
              <tbody>
                {b.lines.map((l, n) => (
                  <tr key={n}><th scope="row">{l.label}{l.detail && <small>{l.detail}</small>}</th><td>{l.cents != null ? formatMoney(l.cents) : '—'}</td></tr>
                ))}
                {b.adjust !== 0 && <tr><th scope="row">Price adjusted by our team</th><td>{b.adjust > 0 ? '+' : '−'}{formatMoney(Math.abs(b.adjust))}</td></tr>}
                <tr className="bill-sub"><th scope="row">Order price</th><td>{formatMoney(b.price)}</td></tr>
                {b.later.map(a => (
                  <tr key={a.id}><th scope="row">Add-on: {a.label}{a.details && <small>{a.details}</small>}</th><td>{formatMoney(a.price_cents)}</td></tr>
                ))}
                <tr><th scope="row">Sales tax<small>{b.taxInfo}</small></th><td>{b.tax ? formatMoney(b.tax) : '—'}</td></tr>
                <tr className="bill-total"><th scope="row">Total</th><td>{formatMoney(b.total)}</td></tr>
              </tbody>
            </table>

            {b.pending.length > 0 && (
              <>
                <h3 className="sub-head">Add-on requests to price</h3>
                <ul className="addon-reqs">
                  {b.pending.map(a => (
                    <li key={a.id}>
                      <div><b>{a.label}</b>{a.details && <span className="muted"> · {a.details}</span>}<small className="muted"> · {formatDateTime(a.created_at)}</small></div>
                      <AddonDecision addonId={a.id} suggested={a.price_cents != null ? a.price_cents / 100 : null} />
                    </li>
                  ))}
                </ul>
              </>
            )}

            <h3 className="sub-head">Payments</h3>
            <ul className="pay-list">
              {j.charge_id
                ? <li><span>Job charged · {formatDateTime(j.charged_at)}</span><b>{formatMoney(j.charged_cents)}</b><small className="mono muted">{j.charge_id}</small></li>
                : <li className="muted">Job not charged yet. The card is charged when you start the job.</li>}
              {b.later.filter(a => a.charge_id).map(a => (
                <li key={a.id}><span>{a.label} · {formatDateTime(a.charged_at)}</span><b>{formatMoney(a.price_cents)}</b><small className="mono muted">{a.charge_id}</small></li>
              ))}
            </ul>
            <PriceForm id={j.id} price={j.price_cents} />
          </section>
        ))}
      </div>
      <aside className="col-side">
        <section className="panel">
          <h2>{multi ? 'Order total' : 'Total'}</h2>
          <p className="tile-big">{formatMoney(total)}</p>
          <dl className="kv">
            <dt>Paid</dt><dd>{formatMoney(paid)}</dd>
            <dt>Balance</dt><dd className={total - paid > 0 ? 'warn' : undefined}>{formatMoney(total - paid)}</dd>
            <dt>Card</dt><dd>{p.card_last4 ? `${p.card_brand || 'Card'} ending ${p.card_last4}` : <span className="muted">None on file</span>}</dd>
          </dl>
          <p className="hint">Refunds are done in QuickBooks.</p>
        </section>
      </aside>
    </div>
  )
}
