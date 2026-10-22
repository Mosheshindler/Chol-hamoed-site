import {createClient} from '@/lib/supabase/server'
import {formatDate} from '@/lib/dates'
import {formatMoney} from '@/lib/status'
import {PACKAGES} from '@/lib/packages'
import {describeDiscount} from '@/lib/discounts'
import {CreateDiscount, ToggleDiscount} from './DiscountForms'

export default async function DiscountsPage() {
  const supabase = await createClient()
  const {data: {user}} = await supabase.auth.getUser()
  const [{data: me}, {data: codes, error}, {data: used}] = await Promise.all([
    supabase.from('team_members').select('role').eq('id', user.id).maybeSingle(),
    supabase.from('discount_codes').select('*').order('created_at', {ascending: false}),
    supabase.from('projects').select('brief').not('brief->discount', 'is', null),
  ])
  const isOwner = me?.role === 'owner'
  const today = new Date().toLocaleDateString('en-CA', {timeZone: 'America/New_York'})
  // Total taken off per code, from the orders that used it.
  const given = {}
  for (const p of used || []) { const d = p.brief?.discount; if (d?.code) given[d.code] = (given[d.code] || 0) + (d.cents || 0) }
  const state = c => !c.active ? 'Off' : c.expires_on && c.expires_on < today ? 'Expired' : c.max_uses != null && c.uses >= c.max_uses ? 'Used up' : 'Active'

  return (
    <>
      <div className="page-head"><h1>Discounts</h1></div>
      <div className="project-grid">
        <div className="col-main">
          <section className="panel">
            <h2>Codes</h2>
            {error ? <p className="form-error">Discounts aren&rsquo;t set up yet. Run the discounts database update in Supabase.</p>
              : codes?.length ? (
                <ul className="codes">
                  {codes.map(c => (
                    <li key={c.id}>
                      <div>
                        <b className="mono">{c.code}</b> <span className={`pill ${state(c) === 'Active' ? 'pill-go' : 'pill-off'}`}>{state(c)}</span>
                        <p className="muted small">{describeDiscount(c)}{c.packages?.length ? '' : ', any package'} · used {c.uses}{c.max_uses != null ? ` of ${c.max_uses}` : ''}{c.expires_on ? ` · until ${formatDate(c.expires_on)}` : ''}{given[c.code] ? ` · ${formatMoney(given[c.code])} given` : ''}</p>
                        {c.note && <p className="muted small">{c.note}</p>}
                      </div>
                      {isOwner && <ToggleDiscount id={c.id} active={c.active} />}
                    </li>
                  ))}
                </ul>
              ) : <p className="muted">No codes yet.</p>}
          </section>
        </div>
        <aside className="col-side">
          {isOwner
            ? <section className="panel"><h2>New code</h2><CreateDiscount packages={PACKAGES.map(p => p.name)} /></section>
            : <section className="panel"><p className="muted">Only the owner can create codes.</p></section>}
          <section className="panel">
            <h2>How codes work</h2>
            <ul className="hint-list">
              <li>Clients enter the code on the last step of checkout and see the new total before they pay.</li>
              <li>The discount comes off the package and any extras picked at checkout. Add-ons requested later are full price.</li>
              <li>A dollar amount comes off the whole order once, shared across the videos it applies to.</li>
              <li>Turn a code off anytime. Orders that already used it keep their price.</li>
            </ul>
          </section>
        </aside>
      </div>
    </>
  )
}
