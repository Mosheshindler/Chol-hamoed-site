import 'server-only'
import {createAdminClient} from './supabase/admin'

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const JOB_FIELDS = 'id, number, status, package, price_cents, due_date, name, email, company, promoting, orientation, order_id, order_item, order_size, customer_token, created_at, brief'
export const CUSTOMER_FILE_KINDS = ['script', 'first_cut', 'final', 'cutdown', 'extra_format']

// Everything a customer may see for the order their private link belongs to.
// Uses the service role, so callers must only pass data from this function to that customer.
export async function loadOrderByToken(token, {withFiles = true} = {}) {
  if (!UUID.test(token || '')) return null
  const db = createAdminClient()
  const {data: job} = await db.from('projects').select(JOB_FIELDS).eq('customer_token', token).maybeSingle()
  if (!job) return null

  const {data: jobs} = job.order_id
    ? await db.from('projects').select(JOB_FIELDS).eq('order_id', job.order_id).order('order_item')
    : {data: [job]}
  const ids = jobs.map(j => j.id)

  const [{data: files}, {data: messages}, {data: addons}] = await Promise.all([
    withFiles ? db.from('project_files').select('id, project_id, kind, path, name, size, url, body, created_at').in('project_id', ids).in('kind', CUSTOMER_FILE_KINDS).order('created_at') : {data: []},
    db.from('project_messages').select('id, project_id, author, body, created_at').in('project_id', ids).order('created_at'),
    db.from('project_addons').select('id, project_id, addon, label, details, price_cents, status, created_at').in('project_id', ids).order('created_at'),
  ])

  let urls = {}
  const stored = (files || []).filter(f => !f.url && !f.body)
  if (stored.length) {
    const {data: signed} = await db.storage.from('project-files').createSignedUrls(stored.map(f => f.path), 3600, {download: true})
    urls = Object.fromEntries((signed || []).map(s => [s.path, s.signedUrl]))
  }

  return {db, jobs, files: (files || []).map(f => ({...f, url: f.url || urls[f.path], shared: !!(f.url || f.body)})), messages: messages || [], addons: addons || []}
}
