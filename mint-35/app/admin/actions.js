'use server'

import {redirect} from 'next/navigation'
import {revalidatePath} from 'next/cache'
import {createClient} from '@/lib/supabase/server'
import {createAdminClient} from '@/lib/supabase/admin'
import {TRANSITIONS, STATUSES, projectRef, formatMoney} from '@/lib/status'
import {addBusinessDays} from '@/lib/dates'
import {sendEmail, esc} from '@/lib/email'
import {siteOrigin, customerLink} from '@/lib/site'
import {scriptWord} from '@/lib/status'

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

  const {data: p} = await supabase.from('projects').select('id, number, status, name, email, price_cents, package, customer_token').eq('id', id).single()
  const step = (TRANSITIONS[p.status] || []).find(t => t.to === to)
  if (!step) return {error: 'That step isn’t available any more. Refresh the page.'}

  const patch = {status: to}
  const event = {from: p.status, to}

  if (step.needs === 'price') {
    const dollars = Number(String(formData.get('price') || '').replace(/[$,\s]/g, ''))
    if (!(dollars > 0)) return {error: 'Enter the price for this job.'}
    patch.price_cents = Math.round(dollars * 100)
    event.price_cents = patch.price_cents
  }
  if (to === 'in_production') {
    patch.due_date = addBusinessDays(new Date(), 3)
    event.due_date = patch.due_date
  }

  const {error} = await supabase.from('projects').update(patch).eq('id', id).eq('status', p.status)
  if (error) return {error: 'Couldn’t update the job. Try again.'}
  await supabase.from('project_events').insert({project_id: id, actor: me.id, type: 'status', data: event})

  const link = customerLink(await siteOrigin(), p.customer_token)
  const hi = `<p>Hi ${esc(p.name.split(' ')[0])},</p>`
  const sign = `<p><a href="${link}">Open your project page</a></p><p>— The Mint 35 team</p>`
  const w = scriptWord(p.package)
  const notices = {
    quoted: [`Your Mint 35 project is accepted (${projectRef(p.number)})`, `<p>Good news: we've accepted your project. The price is <b>${formatMoney(patch.price_cents)}</b>.</p><p>Your card on file will be charged when your order enters our production queue. We'll let you know when that happens.</p>`],
    script_sent: [`Your ${w} is ready to review (${projectRef(p.number)})`, `<p>Your ${w} is ready. Please review it on your project page and approve it or request changes.</p>`],
    first_cut_sent: [`Your first cut is ready (${projectRef(p.number)})`, `<p>Your first cut is ready. Please watch it on your project page and approve it or send your revision notes.</p>`],
    delivered: [`Your commercial is delivered (${projectRef(p.number)})`, `<p>Your final files are ready to download on your project page.</p>`],
  }
  if (notices[to]) await sendEmail({to: p.email, subject: notices[to][0], html: hi + notices[to][1] + sign})

  revalidatePath(`/admin/projects/${id}`)
  revalidatePath('/admin')
  return {ok: true, label: STATUSES[to].label}
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
  const {data: a, error} = await supabase.from('project_addons').update(patch).eq('id', addonId).eq('status', 'requested').select('project_id, label, details, price_cents').single()
  if (error || !a) return {error: 'That request was already handled. Refresh the page.'}
  await supabase.from('project_events').insert({project_id: a.project_id, actor: me.id, type: 'addon_' + decision, data: {label: a.label, price_cents: a.price_cents}})

  const {data: p} = await supabase.from('projects').select('number, name, email, customer_token').eq('id', a.project_id).single()
  const link = customerLink(await siteOrigin(), p.customer_token)
  await sendEmail({
    to: p.email,
    subject: `${a.label}: ${decision === 'accepted' ? 'confirmed' : 'update'} (${projectRef(p.number)})`,
    html: `<p>Hi ${esc(p.name.split(' ')[0])},</p>` + (decision === 'accepted'
      ? `<p>We've confirmed your request for <b>${esc(a.label)}</b>${a.details ? ` (${esc(a.details)})` : ''} at <b>${formatMoney(a.price_cents)}</b>. It will be charged to your card on file.</p>`
      : `<p>We're not able to add <b>${esc(a.label)}</b> to this project. We'll be in touch if there's another option.</p>`)
      + `<p><a href="${link}">Open your project page</a></p><p>— The Mint 35 team</p>`,
  })
  revalidatePath(`/admin/projects/${a.project_id}`)
  return {ok: true}
}
