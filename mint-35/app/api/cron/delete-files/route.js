import {NextResponse} from 'next/server'
import {createAdminClient} from '@/lib/supabase/admin'
import {CLIENT_FILE_DAYS, CLIENT_FILE_KINDS} from '@/lib/retention'

// Daily (vercel.json cron): deletes the files clients sent once their job has been Delivered for
// CLIENT_FILE_DAYS. Order-wide files (logo, brand materials) are shared by every job in the order, so a
// file is only removed when every job using it is past the cutoff. Vercel sends CRON_SECRET as a bearer token.
export const dynamic = 'force-dynamic'

export async function GET(request) {
  const secret = process.env.CRON_SECRET
  if (!secret || request.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({error: 'Unauthorized'}, {status: 401})
  }
  const db = createAdminClient()
  const cutoff = new Date(Date.now() - CLIENT_FILE_DAYS * 864e5).toISOString()

  const {data: delivered} = await db.from('projects').select('id').eq('status', 'delivered')
  if (!delivered?.length) return NextResponse.json({ok: true, deleted: 0})
  // When each job was delivered: its latest move to "delivered".
  const {data: moves} = await db.from('project_events').select('project_id, created_at, data')
    .in('project_id', delivered.map(p => p.id)).eq('type', 'status').order('created_at', {ascending: false})
  const deliveredAt = {}
  for (const e of moves || []) if (e.data?.to === 'delivered' && !deliveredAt[e.project_id]) deliveredAt[e.project_id] = e.created_at
  const due = new Set(Object.entries(deliveredAt).filter(([, at]) => at <= cutoff).map(([id]) => id))
  if (!due.size) return NextResponse.json({ok: true, deleted: 0})

  const {data: files} = await db.from('project_files').select('id, project_id, path, name, kind, url, body')
    .in('project_id', [...due]).in('kind', CLIENT_FILE_KINDS)
  const stored = (files || []).filter(f => !f.url && !f.body)
  if (!stored.length) return NextResponse.json({ok: true, deleted: 0})

  // Skip a shared file while any other job using it isn't due yet.
  const {data: sharing} = await db.from('project_files').select('project_id, path').in('path', [...new Set(stored.map(f => f.path))])
  const blocked = new Set((sharing || []).filter(r => !due.has(r.project_id)).map(r => r.path))
  const go = stored.filter(f => !blocked.has(f.path))
  const paths = [...new Set(go.map(f => f.path))]

  for (let i = 0; i < paths.length; i += 100) {
    const {error} = await db.storage.from('project-files').remove(paths.slice(i, i + 100))
    if (error) {
      console.error('File cleanup failed', error)
      return NextResponse.json({error: 'Storage delete failed'}, {status: 500})
    }
  }
  await db.from('project_files').delete().in('id', go.map(f => f.id))
  const byJob = Object.groupBy(go, f => f.project_id)
  await db.from('project_events').insert(Object.entries(byJob).map(([project_id, list]) => ({
    project_id, type: 'files_deleted', data: {count: list.length, names: list.map(f => f.name).slice(0, 50), days: CLIENT_FILE_DAYS},
  })))
  return NextResponse.json({ok: true, deleted: paths.length, jobs: Object.keys(byJob).length})
}
