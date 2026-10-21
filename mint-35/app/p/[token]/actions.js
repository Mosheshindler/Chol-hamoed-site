'use server'

import {revalidatePath} from 'next/cache'
import {loadOrderByToken} from '@/lib/customer'
import {addBusinessDays} from '@/lib/dates'
import {upcomingClosedDays} from '@/lib/holidays'
import {addonByKey, ADDON_STATUSES} from '@/lib/addons'
import {projectRef, scriptWord} from '@/lib/status'
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
