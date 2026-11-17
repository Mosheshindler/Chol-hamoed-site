'use client'

import {useState, useTransition} from 'react'
import {retryQbSync} from '../../../actions'

// Bookkeeping status of one card charge: its QuickBooks sales receipt, or why it didn't get there + Try again.
// `sync` is the latest qb_sync event for the charge (none for charges made before the sync existed).
export default function QbSync({id, addonId, sync}) {
  const [pending, start] = useTransition()
  const [err, setErr] = useState(null)
  if (!sync) return null
  if (sync.ok) return <small className="qb-sync ok">In QuickBooks · sales receipt {sync.doc_number}</small>
  return (
    <small className="qb-sync warn">
      Not in QuickBooks yet: {err || sync.message}{' '}
      <button type="button" className="link-btn" disabled={pending} onClick={() => start(async () => {
        const fd = new FormData(); fd.set('id', id); if (addonId) fd.set('addon', addonId)
        const r = await retryQbSync(fd)
        setErr(r?.error || null)
      })}>{pending ? 'Sending…' : 'Try again'}</button>
    </small>
  )
}
