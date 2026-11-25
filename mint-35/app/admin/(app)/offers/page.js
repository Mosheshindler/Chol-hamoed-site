import Link from 'next/link'
import {createClient} from '@/lib/supabase/server'
import {formatDate} from '@/lib/dates'
import {formatMoney} from '@/lib/status'
import {siteOrigin} from '@/lib/site'
import {offerState, OFFER_DAYS} from '@/lib/offers'
import {CreateOffer, OfferActions} from './OfferForms'

export const metadata = {title: 'Offers · Mint 35 admin'}

export default async function OffersPage() {
  const supabase = await createClient()
  const {data: offers, error} = await supabase.from('custom_offers').select('*').order('created_at', {ascending: false})
  const origin = await siteOrigin()
  // Jobs ordered from an offer, to link to them.
  const orderIds = (offers || []).map(o => o.order_id).filter(Boolean)
  const {data: jobs} = orderIds.length
    ? await supabase.from('projects').select('id, number, order_id').in('order_id', orderIds)
    : {data: []}
  const jobFor = o => (jobs || []).find(j => j.order_id === o.order_id)
  const defaultExpires = new Date(Date.now() + OFFER_DAYS * 864e5).toLocaleDateString('en-CA', {timeZone: 'America/New_York'})
  const pill = {Open: 'pill-go', Ordered: 'pill-go'}

  return (
    <>
      <div className="page-head"><h1>Custom offers</h1></div>
      <div className="project-grid">
        <div className="col-main">
          <section className="panel">
            <h2>Offers</h2>
            {error ? <p className="form-error">Offers aren&rsquo;t set up yet. Run the custom offers database update in Supabase.</p>
              : offers?.length ? (
                <ul className="codes offers">
                  {offers.map(o => {
                    const state = offerState(o)
                    const job = jobFor(o)
                    return (
                      <li key={o.id}>
                        <div className="code-row">
                          <div>
                            <b>{o.title}</b> <span className={`pill ${pill[state] || 'pill-off'}`}>{state}</span>
                            <p className="muted small">
                              {o.company ? `${o.company} · ` : ''}{o.client_name} ({o.email}) · {o.videos} video{o.videos > 1 ? 's' : ''} · <b>{formatMoney(o.price_cents)}</b>
                              {o.expires_on && state !== 'Ordered' ? ` · until ${formatDate(o.expires_on)}` : ''}
                              {o.emailed_at ? ` · emailed ${formatDate(o.emailed_at)}` : ' · not emailed'}
                            </p>
                            {o.items?.length > 0 && <p className="muted small">{o.items.join(' · ')}</p>}
                            {job && <p className="small">Ordered {formatDate(o.ordered_at)}: <Link href={`/admin/projects/${job.id}`}>M35-{job.number}</Link></p>}
                          </div>
                        </div>
                        <OfferActions o={o} link={`${origin}/start?offer=${o.token}`} state={state} />
                      </li>
                    )
                  })}
                </ul>
              ) : <p className="muted">No offers yet.</p>}
          </section>
        </div>
        <aside className="col-side">
          <section className="panel"><h2>New custom package</h2><CreateOffer defaultExpires={defaultExpires} /></section>
          <section className="panel">
            <h2>How offers work</h2>
            <ul className="hint-list">
              <li>The client gets a private link to the order form with just this package at your price.</li>
              <li>They fill in the usual project details and save a card. It&rsquo;s charged when you start the job, like any order.</li>
              <li>Each link works for one order. Withdraw it anytime before then.</li>
              <li>The job shows the package name and price on Billing. QuickBooks books it under the &ldquo;Custom package&rdquo; product/service.</li>
            </ul>
          </section>
        </aside>
      </div>
    </>
  )
}
