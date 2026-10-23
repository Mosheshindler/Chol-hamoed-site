import 'server-only'
import {cache} from 'react'
import {notFound} from 'next/navigation'
import {createClient} from '@/lib/supabase/server'
import {siteOrigin, customerLink} from '@/lib/site'
import {STATUSES} from '@/lib/status'

// Files a client added from their project page after ordering: `<job>/added/<batch>/<file>`.
export const isAdded = path => /^[^/]+\/added\/[^/]+\//.test(path || '')

// Everything the job pages need, for the whole order this job belongs to. Cached per request,
// so the layout and the page share one load.
export const loadOrder = cache(async id => {
  const supabase = await createClient()
  const {data: p} = await supabase.from('projects').select('*').eq('id', id).maybeSingle()
  if (!p) notFound()
  const {data: jobRows} = p.order_id
    ? await supabase.from('projects').select('*').eq('order_id', p.order_id).order('order_item')
    : {data: [p]}
  const jobs = jobRows?.length ? jobRows : [p]
  const ids = jobs.map(j => j.id)

  const [{data: files}, {data: events}, {data: team}, {data: messages}, {data: addons}] = await Promise.all([
    supabase.from('project_files').select('*').in('project_id', ids).order('created_at'),
    supabase.from('project_events').select('*').in('project_id', ids).order('created_at', {ascending: false}),
    supabase.from('team_members').select('id, name').order('name'),
    supabase.from('project_messages').select('id, project_id, author, member_id, body, created_at').in('project_id', ids).order('created_at'),
    supabase.from('project_addons').select('*').in('project_id', ids).order('created_at'),
  ])
  const stored = (files || []).filter(f => !f.url && !f.body)
  const {data: signed} = stored.length
    ? await supabase.storage.from('project-files').createSignedUrls(stored.map(f => f.path), 3600)
    : {data: []}
  const urls = Object.fromEntries((signed || []).map(s => [s.path, s.signedUrl]))
  // Files the client added after ordering also get download links, for "Download all" per batch.
  const added = stored.filter(f => isAdded(f.path))
  const {data: dlSigned} = added.length
    ? await supabase.storage.from('project-files').createSignedUrls(added.map(f => f.path), 3600, {download: true})
    : {data: []}
  const dl = Object.fromEntries((dlSigned || []).map(s => [s.path, s.signedUrl]))

  const lastMessage = (messages || []).at(-1) || null
  // Who has the next move: the customer if any video waits on them, otherwise us while anything is open.
  const waits = jobs.map(j => STATUSES[j.status]?.waitingOn).filter(Boolean)
  const waitingOn = lastMessage?.author === 'customer' || (addons || []).some(a => a.status === 'requested')
    ? 'team' : waits.includes('customer') ? 'customer' : waits.includes('team') ? 'team' : null

  return {
    p, jobs, multi: jobs.length > 1,
    files: (files || []).map(f => ({...f, href: f.url || urls[f.path] || null, download: dl[f.path] || null, batch: isAdded(f.path) ? f.path.split('/')[2] : null})),
    events: events || [], team: team || [], messages: messages || [], addons: addons || [],
    names: Object.fromEntries((team || []).map(t => [t.id, t.name])),
    custUrl: customerLink(await siteOrigin(), p.customer_token),
    lastMessage, waitingOn,
    base: `/admin/projects/${id}`,
  }
})
