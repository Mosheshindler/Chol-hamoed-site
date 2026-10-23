'use server'

import {revalidatePath} from 'next/cache'
import {loadOrderByToken} from '@/lib/customer'
import {addBusinessDays} from '@/lib/dates'
import {upcomingClosedDays} from '@/lib/holidays'
import {addonByKey, ADDON_STATUSES} from '@/lib/addons'
import {randomBytes} from 'node:crypto'
import {projectRef, scriptWord, ADD_FILES_STATUSES} from '@/lib/status'
import {sendEmail, esc} from '@/lib/email'
import {siteOrigin} from '@/lib/site'

const clean = (v, max = 5000) => String(v ?? '').trim().slice(0, max)

async function jobFor(formData) {
  const token = String(formData.get('token') || '')
  const order = await loadOrderByToken(token, {withFiles: false})
  if (!order) return {error: 'This link isn’t valid any more.'}
  const job = order.jobs.find(j => j.id === String(formData.get('job')))
  if (!job) return {error: 'We couldn’t find that project.'}
  return {token, order, job}
}

async function tellTeam(job, subject, html) {
  const origin = await siteOrigin()
  await sendEmail({
    to: process.env.TEAM_NOTIFY_EMAIL || 'info@mintmediallc.com',
    replyTo: job.email,
    subject: `${projectRef(job.number)} · ${subject}`,
    html: `${html}<p><a href="${origin}/admin/projects/${job.id}">Open ${projectRef(job.number)} in the admin</a></p>`,
  })
}

// Approve, or ask for changes on, the script/sample or the first cut.
export async function customerDecision(formData) {
  const r = await jobFor(formData)
  if (r.error) return r
  const {token, order, job} = r
  const decision = formData.get('decision')
  const notes = clean(formData.get('notes'))

  const moves = {
    script_sent: {approve: 'in_production', changes: 'in_progress'},
    first_cut_sent: {approve: 'approved', changes: 'revising'},
  }[job.status]
  const to = moves?.[decision]
  if (!to) return {error: 'This step has already been completed. Refresh the page.'}
  if (decision === 'changes' && !notes) return {error: 'Tell us what you’d like changed.'}

  const patch = {status: to}
  if (to === 'in_production') patch.due_date = addBusinessDays(new Date(), 3, upcomingClosedDays())
  const {data: updated, error} = await order.db.from('projects').update(patch).eq('id', job.id).eq('status', job.status).select('id')
  if (error || !updated?.length) return {error: 'Something changed while you were here. Refresh the page and try again.'}

  await order.db.from('project_events').insert({project_id: job.id, type: 'customer', data: {from: job.status, to, decision, notes: notes || undefined}})
  if (notes) await order.db.from('project_messages').insert({project_id: job.id, author: 'customer', body: notes})

  const what = job.status === 'script_sent' ? `the ${scriptWord(job.package)}` : 'the first cut'
  await tellTeam(job, decision === 'approve' ? `Customer approved ${what}` : `Customer requested changes to ${what}`,
    `<p><b>${esc(job.name)}</b> ${decision === 'approve' ? 'approved' : 'requested changes to'} ${what}.</p>${notes ? `<blockquote>${esc(notes)}</blockquote>` : ''}`)

  revalidatePath(`/p/${token}`)
  return {ok: true}
}

export async function customerMessage(formData) {
  const r = await jobFor(formData)
  if (r.error) return r
  const {token, order, job} = r
  const body = clean(formData.get('body'))
  if (!body) return {error: 'Write a message first.'}

  await order.db.from('project_messages').insert({project_id: job.id, author: 'customer', body})
  await tellTeam(job, 'New message from the customer', `<p><b>${esc(job.name)}</b> wrote:</p><blockquote>${esc(body)}</blockquote>`)
  revalidatePath(`/p/${token}`)
  return {ok: true}
}

export async function requestAddon(formData) {
  const r = await jobFor(formData)
  if (r.error) return r
  const {token, order, job} = r
  const addon = addonByKey(String(formData.get('addon')))
  if (!addon) return {error: 'Choose an add-on.'}
  if (!ADDON_STATUSES.includes(job.status)) return {error: 'Extras can’t be added to this project.'}
  const details = clean(formData.get('details'), 1000) || null
  if (addon.askOrientation && !details) return {error: 'Choose the format you need.'}

  await order.db.from('project_addons').insert({
    project_id: job.id, addon: addon.key, label: addon.label, details,
    price_cents: addon.price != null ? addon.price * 100 : null,
  })
  await order.db.from('project_events').insert({project_id: job.id, type: 'addon', data: {label: addon.label, details}})
  await tellTeam(job, `Add-on requested: ${addon.label}`, `<p><b>${esc(job.name)}</b> requested <b>${esc(addon.label)}</b>${details ? ` (${esc(details)})` : ''}.</p>`)
  revalidatePath(`/p/${token}`)
  return {ok: true}
}

// Adding photos and files after ordering, until production starts. Step 1 hands out one signed upload
// URL per file, all under one batch folder (`<job>/added/<batch>/`); the browser uploads straight to
// storage; step 2 records what arrived and emails the team. Each batch is listed and downloaded on its own.
const MAX_ADD_FILES = 40
const MAX_ADD_BYTES = 250 * 1024 * 1024
const BATCH = /^\d{8}-\d{6}-[0-9a-f]{6}$/

export async function startAddFiles({token, job: jobId, files}) {
  const fd = new FormData(); fd.set('token', token); fd.set('job', jobId)
  const r = await jobFor(fd)
  if (r.error) return r
  const {order, job} = r
  if (!ADD_FILES_STATUSES.includes(job.status)) return {error: 'Production has started, so files can’t be added here any more. Send us a message instead.'}
  const list = Array.isArray(files) ? files.slice(0, MAX_ADD_FILES + 1) : []
  if (!list.length) return {error: 'Choose at least one file.'}
  if (list.length > MAX_ADD_FILES) return {error: `Please send up to ${MAX_ADD_FILES} files at a time.`}
  if (list.some(f => !(Number(f?.size) > 0))) return {error: 'One of the files is empty. Remove it and try again.'}
  if (list.some(f => Number(f.size) > MAX_ADD_BYTES)) return {error: 'Each file can be up to 250 MB. For bigger videos, send us a link in a message.'}

  const now = new Date()
  const batch = now.toISOString().replace(/\D/g, '').slice(0, 14).replace(/^(\d{8})/, '$1-') + '-' + randomBytes(3).toString('hex')
  const uploads = []
  for (const [i, f] of list.entries()) {
    const safe = String(f.name || 'file').replace(/[^\w.\-]+/g, '_').slice(-120)
    const path = `${job.id}/added/${batch}/${i}-${safe}`
    const {data, error} = await order.db.storage.from('project-files').createSignedUploadUrl(path)
    if (error) return {error: 'We couldn’t start the upload. Please try again.'}
    uploads.push({index: i, path, token: data.token})
  }
  return {batch, uploads}
}

export async function finishAddFiles({token, job: jobId, batch, names, note}) {
  const fd = new FormData(); fd.set('token', token); fd.set('job', jobId)
  const r = await jobFor(fd)
  if (r.error) return r
  const {order, job} = r
  if (!BATCH.test(String(batch || ''))) return {error: 'Something went wrong. Please try again.'}
  const folder = `${job.id}/added/${batch}`
  const {data: already} = await order.db.from('project_files').select('id').like('path', `${folder}/%`).limit(1)
  if (already?.length) return {ok: true}

  // Only files that really arrived in storage are recorded.
  const {data: listed} = await order.db.storage.from('project-files').list(folder, {limit: 100})
  const given = names && typeof names === 'object' ? names : {}
  const rows = (listed || []).map(o => {
    const path = `${folder}/${o.name}`
    return {project_id: job.id, kind: 'media', path, name: clean(given[path], 200) || o.name.replace(/^\d+-/, ''), size: o.metadata?.size ?? null}
  })
  if (!rows.length) return {error: 'None of the files arrived. Please try again.'}
  const {error} = await order.db.from('project_files').insert(rows)
  if (error) return {error: 'We couldn’t save your files. Please try again.'}

  const text = clean(note, 2000)
  await order.db.from('project_events').insert({project_id: job.id, type: 'files_added', data: {batch, count: rows.length, note: text || undefined}})
  if (text) await order.db.from('project_messages').insert({project_id: job.id, author: 'customer', body: `Sent ${rows.length} more file${rows.length > 1 ? 's' : ''}: ${text}`})
  await tellTeam(job, `Customer added ${rows.length} file${rows.length > 1 ? 's' : ''}`,
    `<p><b>${esc(job.name)}</b> added ${rows.length} file${rows.length > 1 ? 's' : ''} to ${projectRef(job.number)}.</p>
${text ? `<blockquote>${esc(text)}</blockquote>` : ''}<ul>${rows.map(f => `<li>${esc(f.name)}</li>`).join('')}</ul>
<p>They're on the Project page under &ldquo;Added after ordering&rdquo;, where this batch can be downloaded on its own.</p>`)
  revalidatePath(`/p/${token}`)
  return {ok: true, count: rows.length}
}
