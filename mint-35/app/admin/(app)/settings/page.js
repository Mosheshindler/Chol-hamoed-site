import {currentOwner} from '@/lib/owner'
import {getConnection, qbConfigured, QB_ENV} from '@/lib/qb'
import {formatDateTime} from '@/lib/dates'
import {disconnectQuickBooks} from '../../actions'

const NOTICES = {
  connected: ['ok', 'QuickBooks is connected. New orders will save the customer’s card.'],
  cancelled: ['warn', 'Connecting was cancelled in QuickBooks.'],
  'bad-state': ['warn', 'That connection attempt expired. Please try again.'],
  failed: ['warn', 'QuickBooks didn’t accept the connection. Check the app keys and the redirect URL, then try again.'],
  'missing-keys': ['warn', 'Add QB_CLIENT_ID and QB_CLIENT_SECRET in Vercel first.'],
}

export default async function SettingsPage({searchParams}) {
  const {qb} = await searchParams
  const owner = await currentOwner()
  const conn = await getConnection()
  const notice = NOTICES[qb]

  return (
    <>
      <div className="page-head"><h1>Settings</h1></div>
      <div className="project-grid">
        <div className="col-main">
          <section className="panel">
            <h2>QuickBooks Payments</h2>
            {notice && <p className={notice[0] === 'ok' ? 'form-ok' : 'form-error'} role="status">{notice[1]}</p>}
            <dl className="kv">
              <dt>Mode</dt><dd>{QB_ENV === 'production' ? 'Live payments' : 'Sandbox (test cards only)'}</dd>
              <dt>App keys</dt><dd>{qbConfigured() ? 'Added' : 'Missing'}</dd>
              <dt>Status</dt><dd>{conn ? <span className="pill pill-go">Connected</span> : <span className="pill pill-off">Not connected</span>}</dd>
              {conn && <><dt>Company ID</dt><dd className="mono">{conn.realm_id}</dd><dt>Last refreshed</dt><dd>{formatDateTime(conn.updated_at)}</dd></>}
            </dl>
            <p className="hint" style={{marginTop: 14}}>
              {conn
                ? 'Checkout saves each customer’s card in QuickBooks. “Start job” charges the job’s price, and confirmed add-ons are charged too.'
                : 'Until QuickBooks is connected, checkout takes orders without a card and you collect payment another way.'}
            </p>
            {owner ? (
              <div className="actions-row" style={{marginTop: 16}}>
                {qbConfigured() && <a className="btn btn-primary btn-sm" href="/api/qb/connect">{conn ? 'Reconnect QuickBooks' : 'Connect QuickBooks'}</a>}
                {conn && <form action={disconnectQuickBooks}><button className="btn btn-danger btn-sm">Disconnect</button></form>}
              </div>
            ) : <p className="hint">Only an owner can connect or disconnect QuickBooks.</p>}
          </section>
        </div>
      </div>
    </>
  )
}
