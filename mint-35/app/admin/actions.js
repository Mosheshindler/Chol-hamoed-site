'use server'

import {redirect} from 'next/navigation'
import {revalidatePath} from 'next/cache'
import {createClient} from '@/lib/supabase/server'
import {createAdminClient} from '@/lib/supabase/admin'
import {TRANSITIONS, STATUSES, projectRef, formatMoney} from '@/lib/status'
import {addBusinessDays, formatDate} from '@/lib/dates'
import {upcomingClosedDays} from '@/lib/holidays'
import {sendEmail, esc} from '@/lib/email'
import {siteOrigin, customerLink} from '@/lib/site'
import {scriptWord} from '@/lib/status'

// Payment receipt added to every email that follows a charge.
function receipt({cents, brand, last4, chargeId, ref, item}) {
  const row = (k, v) => `<tr><td style="padding:3px 16px 3px 0;color:#666">${k}</td><td style="padding:3px 0"><b>${v}</b></td></tr>`
  return `<p style="margin:18px 0 6px"><b>Payment receipt</b></p><table style="border-collapse:collapse;font-size:14px">`
    + row('Merchant', 'Mint Media LLC (Mint 35)')
    + row('For', esc(item))
    + row('Reference', esc(ref))
    + row('Date', formatDate(new Date()))
    + row('Amount charged', formatMoney(cents))
    + row('Card', `${esc(brand || 'Card')} ending in ${esc(last4 || '••••')}`)
    + row('Transaction ID', esc(chargeId))
    + '</table>'
}
import {chargeCard, paymentsReady, disconnect as qbDisconnect} from '@/lib/qb'
import {currentOwner} from '@/lib/owner'

async function requireMember() {
  const supabase = await createClient()
  const {data: {user}} = await supabase.auth.getUser()
  if (!user) redirect('/admin/login')
  const {data: me} = await supabase.from('team_members').select('id, name, role').eq('id', user.id).maybeSingle()
  if (!me) redirect('/admin/login')
  return {supabase, me}
}

export async function createOwner(formData) {
  const db = createAdminClient()
  const {count} = await db.from('team_members').select('id', {count: 'exact', head: true})
  if (count > 0) redirect('/admin/login')

  const name = String(formData.get('name') || '').trim()
  const email = String(formData.get('email') || '').trim().toLowerCase()
  const password = String(formData.get('password') || '')
  if (!name || !email || password.length < 10) redirect('/admin/setup?error=' + encodeURIComponent('Fill in every field. The password needs at least 10 characters.'))

  const {data, error} = await db.auth.admin.createUser({email, password, email_confirm: true})
  if (error) redirect('/admin/setup?error=' + encodeURIComponent(error.message))
  await db.from('team_members').insert({id: data.user.id, name, email, role: 'owner'})

  const supabase = await createClient()
  await supabase.auth.signInWithPassword({email, password})
  redirect('/admin')
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/admin/login')
}

export async function moveStatus(formData) {
  const {supabase, me} = await requireMember()
  const id = String(formData.get('id'))
  const to = String(formData.get('to'))

  const {data: p} = await supabase.from('projects').select('id, number, status, name, email, price_cents, package, customer_token, qb_card_id, card_last4, card_brand').eq('id', id).single()
  const skipCharge = formData.get('skipCharge') === '1'
  const step = (TRANSITIONS[p.status] || []).find(t => t.to === to && !!t.skipCharge === skipCharge)
  if (!step) return {error: 'That step isn’t available any more. Refresh the page.'}

  const patch = {status: to}
  const event = {from: p.status, to}
  // A card saved at checkout skips "Waiting for card".
  if (to === 'quoted' && p.qb_card_id) patch.status = event.to = 'card_saved'

  if (step.needs === 'price') {
    const dollars = Number(String(formData.get('price') || '').replace(/[$,\s]/g, ''))
    if (!(dollars > 0)) return {error: 'Enter the price for this job.'}
    patch.price_cents = Math.round(dollars * 100)
    event.price_cents = patch.price_cents
  }
  if (p.status === 'card_saved' && to === 'in_progress' && !skipCharge) {
    if (!p.qb_card_id) return {error: 'There’s no card on file for this job.'}
    if (!(p.price_cents > 0)) return {error: 'Set the job’s price before charging.'}
    if (!(await paymentsReady())) return {error: 'QuickBooks isn’t connected. Connect it in Settings, or use “Start job (paid another way)”.'}
    try {
      const charge = await chargeCard({cardId: p.qb_card_id, amountCents: p.price_cents, description: `Mint 35 ${projectRef(p.number)} · ${p.package || 'project'}`})
      Object.assign(patch, {charge_id: charge.id, charge_status: charge.status, charged_cents: p.price_cents, charged_at: new Date().toISOString()})
      event.charge_id = charge.id
      event.charged_cents = p.price_cents
    } catch (e) {
      await supabase.from('project_events').insert({project_id: id, actor: me.id, type: 'charge_failed', data: {message: e.message, intuit_tid: e.intuitTid || null}})
      revalidatePath(`/admin/projects/${id}`)
      return {error: `Charge failed: ${e.message} The job was not started.`}
    }
  }
  if (to === 'in_production') {
    patch.due_date = addBusinessDays(new Date(), 3, upcomingClosedDays())
    event.due_date = patch.due_date
  }

  const {error} = await supabase.from('projects').update(patch).eq('id', id).eq('status', p.status)
  if (error) return {error: patch.charge_id ? `The card was charged (${patch.charge_id}) but the job didn’t update. Refresh and check before trying again.` : 'Couldn’t update the job. Try again.'}
  await supabase.from('project_events').insert({project_id: id, actor: me.id, type: 'status', data: event})

  const link = customerLink(await siteOrigin(), p.customer_token)
  const hi = `<p>Hi ${esc(p.name.split(' ')[0])},</p>`
  const sign = `<p><a href="${link}">Open your project page</a></p><p>— The Mint 35 team</p>`
  const w = scriptWord(p.package)
  const notices = {
    quoted: [`Your Mint 35 project is accepted (${projectRef(p.number)})`, `<p>Good news: we've accepted your project. The price is <b>${formatMoney(patch.price_cents)}</b>.</p><p>Your card on file will be charged when we start your project. We'll let you know when that happens.</p>`],
    script_sent: [`Your ${w} is ready to review (${projectRef(p.number)})`, `<p>Your ${w} is ready. Please review it on your project page and approve it or request changes.</p>`],
    first_cut_sent: [`Your first cut is ready (${projectRef(p.number)})`, `<p>Your first cut is ready. Please watch it on your project page and approve it or send your revision notes.</p>`],
    delivered: [`Your commercial is delivered (${projectRef(p.number)})`, `<p>Your final files are ready to download on your project page.</p>`],
  }
  if (patch.status === 'card_saved') notices.card_saved = [notices.quoted[0], notices.quoted[1]]
  if (patch.charge_id) notices.in_progress = [`We've started your project (${projectRef(p.number)})`, `<p>We've started work on your project. Your ${esc(p.card_brand || 'card')} ending in ${esc(p.card_last4 || '••••')} was charged <b>${formatMoney(patch.charged_cents)}</b>.</p>` + receipt({cents: patch.charged_cents, brand: p.card_brand, last4: p.card_last4, chargeId: patch.charge_id, ref: projectRef(p.number), item: `Mint 35 ${p.package || 'project'}`})]
  const notice = notices[patch.status]
  if (notice) await sendEmail({to: p.email, subject: notice[0], html: hi + notice[1] + sign})

  revalidatePath(`/admin/projects/${id}`)
  revalidatePath('/admin')
  return {ok: true, label: STATUSES[patch.status].label}
}

export async function updateJob(formData) {
  const {supabase, me} = await requireMember()
  const id = String(formData.get('id'))
  const {data: before} = await supabase.from('projects').select('price_cents, assigned_to, due_date').eq('id', id).single()

  const patch = {}
  const priceRaw = String(formData.get('price') ?? '').replace(/[$,\s]/g, '')
  if (priceRaw !== '') {
    const dollars = Number(priceRaw)
    if (!(dollars >= 0)) return {error: 'Price must be a number.'}
    patch.price_cents = Math.round(dollars * 100)
  }
  patch.assigned_to = formData.get('assigned_to') || null
  patch.due_date = formData.get('due_date') || null

  const {error} = await supabase.from('projects').update(patch).eq('id', id)
  if (error) return {error: 'Couldn’t save. Try again.'}

  const events = []
  if (patch.price_cents !== undefined && patch.price_cents !== before.price_cents) events.push({type: 'price', data: {price_cents: patch.price_cents}})
  if (patch.assigned_to !== before.assigned_to) events.push({type: 'assigned', data: {to: patch.assigned_to}})
  if (patch.due_date !== before.due_date) events.push({type: 'due', data: {due_date: patch.due_date}})
  if (events.length) await supabase.from('project_events').insert(events.map(e => ({...e, project_id: id, actor: me.id})))

  revalidatePath(`/admin/projects/${id}`)
  revalidatePath('/admin')
  return {ok: true}
}

export async function addNote(formData) {
  const {supabase, me} = await requireMember()
  const id = String(formData.get('id'))
  const text = String(formData.get('note') || '').trim().slice(0, 5000)
  if (!text) return {error: 'Write a note first.'}
  await supabase.from('project_events').insert({project_id: id, actor: me.id, type: 'note', data: {text}})
  revalidatePath(`/admin/projects/${id}`)
  return {ok: true}
}

export async function recordFile({projectId, path, name, size, kind}) {
  const {supabase, me} = await requireMember()
  if (!path.startsWith(`${projectId}/`)) return {error: 'Invalid file.'}
  const {error} = await supabase.from('project_files').insert({project_id: projectId, path, name, size, kind, uploaded_by: me.id})
  if (error) return {error: 'Couldn’t save the file record.'}
  await supabase.from('project_events').insert({project_id: projectId, actor: me.id, type: 'file', data: {name, kind}})
  revalidatePath(`/admin/projects/${projectId}`)
  return {ok: true}
}

export async function addMember(formData) {
  const {me} = await requireMember()
  if (me.role !== 'owner') return {error: 'Only the owner can add people.'}
  const name = String(formData.get('name') || '').trim()
  const email = String(formData.get('email') || '').trim().toLowerCase()
  const password = String(formData.get('password') || '')
  const role = formData.get('role') === 'owner' ? 'owner' : 'member'
  if (!name || !email || password.length < 10) return {error: 'Fill in every field. The temporary password needs at least 10 characters.'}

  const db = createAdminClient()
  const {data, error} = await db.auth.admin.createUser({email, password, email_confirm: true})
  if (error) return {error: error.message}
  const {error: insErr} = await db.from('team_members').insert({id: data.user.id, name, email, role})
  if (insErr) return {error: 'Account created but not added to the team. Try again.'}
  revalidatePath('/admin/team')
  return {ok: true, message: `${name} can now sign in with ${email} and the temporary password.`}
}

export async function removeMember(formData) {
  const {me} = await requireMember()
  if (me.role !== 'owner') return {error: 'Only the owner can remove people.'}
  const id = String(formData.get('id'))
  if (id === me.id) return {error: 'You can’t remove yourself.'}
  await createAdminClient().auth.admin.deleteUser(id)
  revalidatePath('/admin/team')
  return {ok: true}
}

export async function changePassword(formData) {
  const {supabase} = await requireMember()
  const password = String(formData.get('password') || '')
  if (password.length < 10) return {error: 'Use at least 10 characters.'}
  const {error} = await supabase.auth.updateUser({password})
  if (error) return {error: error.message}
  return {ok: true, message: 'Password updated.'}
}

export async function replyToCustomer(formData) {
  const {supabase, me} = await requireMember()
  const id = String(formData.get('id'))
  const body = String(formData.get('body') || '').trim().slice(0, 5000)
  if (!body) return {error: 'Write a reply first.'}
  const {data: p} = await supabase.from('projects').select('number, name, email, customer_token').eq('id', id).single()
  const {error} = await supabase.from('project_messages').insert({project_id: id, author: 'team', member_id: me.id, body})
  if (error) return {error: 'Couldn’t send. Try again.'}
  const link = customerLink(await siteOrigin(), p.customer_token)
  await sendEmail({
    to: p.email,
    subject: `New message about your Mint 35 project (${projectRef(p.number)})`,
    html: `<p>Hi ${esc(p.name.split(' ')[0])},</p><blockquote>${esc(body).replace(/\n/g, '<br>')}</blockquote><p><a href="${link}">Reply on your project page</a></p><p>— ${esc(me.name)}, Mint 35</p>`,
  })
  revalidatePath(`/admin/projects/${id}`)
  return {ok: true}
}

export async function decideAddon(formData) {
  const {supabase, me} = await requireMember()
  const addonId = String(formData.get('addon'))
  const decision = formData.get('decision') === 'accept' ? 'accepted' : 'declined'
  const patch = {status: decision}
  if (decision === 'accepted') {
    const dollars = Number(String(formData.get('price') || '').replace(/[$,\s]/g, ''))
    if (!(dollars >= 0) || String(formData.get('price') || '').trim() === '') return {error: 'Enter the price for this add-on.'}
    patch.price_cents = Math.round(dollars * 100)
  }
  const {data: pending} = await supabase.from('project_addons').select('project_id, label, status').eq('id', addonId).single()
  if (!pending || pending.status !== 'requested') return {error: 'That request was already handled. Refresh the page.'}
  const {data: job} = await supabase.from('projects').select('number, qb_card_id, card_last4, card_brand').eq('id', pending.project_id).single()
  let charged = false
  if (decision === 'accepted' && patch.price_cents > 0 && job.qb_card_id && (await paymentsReady())) {
    try {
      const charge = await chargeCard({cardId: job.qb_card_id, amountCents: patch.price_cents, description: `Mint 35 ${projectRef(job.number)} · add-on: ${pending.label}`})
      Object.assign(patch, {charge_id: charge.id, charged_at: new Date().toISOString()})
      charged = true
    } catch (e) {
      return {error: `Charge failed: ${e.message} The add-on is still waiting.`}
    }
  }
  const {data: a, error} = await supabase.from('project_addons').update(patch).eq('id', addonId).eq('status', 'requested').select('project_id, label, details, price_cents').single()
  if (error || !a) return {error: charged ? `The card was charged (${patch.charge_id}) but the add-on didn’t update. Refresh and check before trying again.` : 'That request was already handled. Refresh the page.'}
  await supabase.from('project_events').insert({project_id: a.project_id, actor: me.id, type: 'addon_' + decision, data: {label: a.label, price_cents: a.price_cents}})

  const {data: p} = await supabase.from('projects').select('number, name, email, customer_token').eq('id', a.project_id).single()
  const link = customerLink(await siteOrigin(), p.customer_token)
  await sendEmail({
    to: p.email,
    subject: `${a.label}: ${decision === 'accepted' ? 'confirmed' : 'update'} (${projectRef(p.number)})`,
    html: `<p>Hi ${esc(p.name.split(' ')[0])},</p>` + (decision === 'accepted'
      ? `<p>We've confirmed your request for <b>${esc(a.label)}</b>${a.details ? ` (${esc(a.details)})` : ''} at <b>${formatMoney(a.price_cents)}</b>.${charged ? ` Your ${esc(job.card_brand || 'card')} ending in ${esc(job.card_last4 || '••••')} was charged.` : ''}</p>`
      + (charged ? receipt({cents: a.price_cents, brand: job.card_brand, last4: job.card_last4, chargeId: patch.charge_id, ref: projectRef(p.number), item: `Add-on: ${a.label}`}) : '')
      : `<p>We're not able to add <b>${esc(a.label)}</b> to this project. We'll be in touch if there's another option.</p>`)
      + `<p><a href="${link}">Open your project page</a></p><p>— The Mint 35 team</p>`,
  })
  revalidatePath(`/admin/projects/${a.project_id}`)
  return {ok: true}
}

export async function disconnectQuickBooks() {
  if (!(await currentOwner())) redirect('/admin/settings')
  await qbDisconnect()
  revalidatePath('/admin/settings')
  redirect('/admin/settings')
}
