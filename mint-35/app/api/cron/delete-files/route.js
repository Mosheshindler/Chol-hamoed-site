import {NextResponse} from 'next/server'
import {createAdminClient} from '@/lib/supabase/admin'
import {CLIENT_FILE_DAYS, CLIENT_FILE_KINDS, FINAL_DELETE_DAYS, DELIVERABLE_KINDS, RETENTION_START} from '@/lib/retention'

// Daily (vercel.json cron): file retention, see lib/retention.js. Order-wide files (logo, brand materials)
// are shared by every job in the order, so one is only removed when every job using it is due.
// Vercel sends CRON_SECRET as a bearer token.
export const dynamic = 'force-dynamic'

const ago = days => new Date(Date.now() - days * 864e5).toISOString()

export async function GET(request) {
  const secret = process.env.CRON_SECRET
  if (!secret || request.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({error: 'Unauthorized'}, {status: 401})
  }
  const db = createAdminClient()

  const {data: delivered} = await db.from('projects').select('id').eq('status', 'delivered')
  if (!delivered?.length) return NextResponse.json({ok: true, deleted: 0})
  // When each job was delivered: its latest move to "delivered".
  const {data: moves} = await db.from('project_events').select('project_id, created_at, data')
    .in('project_id', delivered.map(p => p.id)).eq('type', 'status').order('created_at', {ascending: false})
  const deliveredAt = {}
  for (const e of moves || []) if (e.data?.to === 'delivered' && !deliveredAt[e.project_id]) deliveredAt[e.project_id] = e.created_at
  // Deliveries before retention went live count from RETENTION_START.
  const start = new Date(RETENTION_START).toISOString()
  for (const id in deliveredAt) if (deliveredAt[id] < start) deliveredAt[id] = start
  const dueSince = days => new Set(Object.entries(deliveredAt).filter(([, at]) => at <= ago(days)).map(([id]) => id))

  const client = await sweep(db, dueSince(CLIENT_FILE_DAYS), CLIENT_FILE_KINDS, ago(CLIENT_FILE_DAYS), 'files_deleted', CLIENT_FILE_DAYS)
  if (client.error) return NextResponse.json(client, {status: 500})
  const finals = await sweep(db, dueSince(FINAL_DELETE_DAYS), DELIVERABLE_KINDS, null, 'deliverables_deleted', FINAL_DELETE_DAYS)
  if (finals.error) return NextResponse.json(finals, {status: 500})
  return NextResponse.json({ok: true, client, finals})
}

// Deletes stored files of `kinds` on the `due` jobs (optionally only files created before `olderThan`).
async function sweep(db, due, kinds, olderThan, event, days) {
  // olderThan: only files at least that old (so something added after delivery still gets its days).
  if (!due.size) return {deleted: 0}
  const q = db.from('project_files').select('id, project_id, path, name, kind, url, body, created_at').in('project_id', [...due]).in('kind', kinds)
  const {data: files} = await q
  const stored = (files || []).filter(f => !f.url && !f.body && (!olderThan || f.created_at < olderThan))
  if (!stored.length) return {deleted: 0}

  // Skip a shared file while any other job using it isn't due yet.
  const {data: sharing} = await db.from('project_files').select('project_id, path').in('path', [...new Set(stored.map(f => f.path))])
  const blocked = new Set((sharing || []).filter(r => !due.has(r.project_id)).map(r => r.path))
  const go = stored.filter(f => !blocked.has(f.path))
  const paths = [...new Set(go.map(f => f.path))]
  if (!paths.length) return {deleted: 0}

  for (let i = 0; i < paths.length; i += 100) {
    const {error} = await db.storage.from('project-files').remove(paths.slice(i, i + 100))
    if (error) {
      console.error('File cleanup failed', error)
      return {error: 'Storage delete failed'}
    }
  }
  await db.from('project_files').delete().in('id', go.map(f => f.id))
  const byJob = Object.groupBy(go, f => f.project_id)
  await db.from('project_events').insert(Object.entries(byJob).map(([project_id, list]) => ({
    project_id, type: event, data: {count: list.length, names: list.map(f => f.name).slice(0, 50), days},
  })))
  return {deleted: paths.length, jobs: Object.keys(byJob).length}
}
