'use server'

import {redirect} from 'next/navigation'
import {revalidatePath} from 'next/cache'
import {createClient} from '@/lib/supabase/server'
import {createAdminClient} from '@/lib/supabase/admin'
import {TRANSITIONS, STATUSES, projectRef, formatMoney} from '@/lib/status'
import {addBusinessDays} from '@/lib/dates'
import {upcomingClosedDays} from '@/lib/holidays'
import {sendEmail, esc} from '@/lib/email'
import {siteOrigin, customerLink} from '@/lib/site'
import {chargeCard, paymentsReady, disconnect as qbDisconnect} from '@/lib/qb'
import {currentOwner} from '@/lib/owner'
import {customerNotice, receipt} from '@/lib/notices'
import {withTax, jobTaxRate, taxCents} from '@/lib/tax'
import {sendPasswordLink} from '@/lib/passwordLink'
import {normalizeCode} from '@/lib/discounts'
import {PACKAGES} from '@/lib/packages'

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

  const {data: p} = await supabase.from('projects').select('id, number, status, name, email, price_cents, package, customer_token, qb_card_id, card_last4, card_brand, brief').eq('id', id).single()
  if (!p) return {error: 'Job not found. Refresh the page.'}
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
      // The job price plus sales tax (none when the client is exempt or ordered before tax was added).
      const amount = withTax(p, p.price_cents)
      const charge = await chargeCard({cardId: p.qb_card_id, amountCents: amount, description: `Mint 35 ${projectRef(p.number)} · ${p.package || 'project'}`})
      Object.assign(patch, {charge_id: charge.id, charge_status: charge.status, charged_cents: amount, charged_at: new Date().toISOString()})
      event.charge_id = charge.id
      event.charged_cents = amount
    } catch (e) {
      await supabase.from('project_events').insert({project_id: id, actor: me.id, type: 'charge_failed', data: {message: e.message, intuit_tid: e.intuitTid || null}})
      revalidatePath('/admin/projects/[id]', 'layout')
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
  // An optional personal line from the team goes in the email and on the customer's message thread.
  const note = String(formData.get('note') || '').trim().slice(0, 2000)
  const notice = customerNotice({status: patch.status, p, link, priceCents: patch.price_cents, charge: patch.charge_id ? {cents: patch.charged_cents, id: patch.charge_id} : null, note})
  if (notice) {
    await sendEmail({to: p.email, subject: notice.subject, html: notice.html})
    if (note) await supabase.from('project_messages').insert({project_id: id, author: 'team', member_id: me.id, body: note})
  }

  revalidatePath('/admin/projects/[id]', 'layout')
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
  // Each form sends only its own fields (Billing: price, Communications: assignee, Progress: due date).
  if (formData.has('assigned_to')) patch.assigned_to = formData.get('assigned_to') || null
  if (formData.has('due_date')) patch.due_date = formData.get('due_date') || null

  const {error} = await supabase.from('projects').update(patch).eq('id', id)
  if (error) return {error: 'Couldn’t save. Try again.'}

  const events = []
  if (patch.price_cents !== undefined && patch.price_cents !== before.price_cents) events.push({type: 'price', data: {price_cents: patch.price_cents}})
  if ('assigned_to' in patch && patch.assigned_to !== before.assigned_to) events.push({type: 'assigned', data: {to: patch.assigned_to}})
  if ('due_date' in patch && patch.due_date !== before.due_date) events.push({type: 'due', data: {due_date: patch.due_date}})
  if (events.length) await supabase.from('project_events').insert(events.map(e => ({...e, project_id: id, actor: me.id})))

  revalidatePath('/admin/projects/[id]', 'layout')
  revalidatePath('/admin')
  return {ok: true}
}

export async function addNote(formData) {
  const {supabase, me} = await requireMember()
  const id = String(formData.get('id'))
  const text = String(formData.get('note') || '').trim().slice(0, 5000)
  if (!text) return {error: 'Write a note first.'}
  await supabase.from('project_events').insert({project_id: id, actor: me.id, type: 'note', data: {text}})
  revalidatePath('/admin/projects/[id]', 'layout')
  return {ok: true}
}

export async function recordFile({projectId, path, name, size, kind}) {
  const {supabase, me} = await requireMember()
  if (!path.startsWith(`${projectId}/`)) return {error: 'Invalid file.'}
  const {error} = await supabase.from('project_files').insert({project_id: projectId, path, name, size, kind, uploaded_by: me.id})
  if (error) return {error: 'Couldn’t save the file record.'}
  await supabase.from('project_events').insert({project_id: projectId, actor: me.id, type: 'file', data: {name, kind}})
  revalidatePath('/admin/projects/[id]', 'layout')
  return {ok: true}
}

// A deliverable shared as a link (Google Doc, Drive…) or as pasted text, with no file in storage.
export async function recordShared({projectId, kind, url, body, label}) {
  const {supabase, me} = await requireMember()
  if (!['script', 'first_cut', 'final', 'cutdown', 'extra_format', 'other'].includes(kind)) return {error: 'Choose what this is.'}
  let name
  if (url != null) {
    url = String(url).trim()
    let host
    try { host = new URL(url).hostname } catch {}
    if (!host || !/^https?:/i.test(url)) return {error: 'Paste the full link, starting with https://'}
    name = host.endsWith('docs.google.com') ? 'Google Doc' : host.replace(/^www\./, '')
    body = null
  } else {
    body = String(body || '').trim()
    if (!body) return {error: 'Paste the text first.'}
    if (body.length > 20000) return {error: 'That text is too long. Use a Google Doc link instead.'}
    name = 'Text'
    url = null
  }
  // A label (e.g. the extra format's shape) leads the name, so the team and client see which version it is.
  if (label) name = String(label).slice(0, 80)
  const path = `${projectId}/${kind}/shared-${Date.now()}`
  const {error} = await supabase.from('project_files').insert({project_id: projectId, path, name, kind, url, body, uploaded_by: me.id})
  if (error) return {error: 'Couldn’t save it. Has the latest database update been run?'}
  await supabase.from('project_events').insert({project_id: projectId, actor: me.id, type: 'file', data: {name, kind}})
  revalidatePath('/admin/projects/[id]', 'layout')
  return {ok: true}
}

export async function addMember(formData) {
  const {me} = await requireMember()
  if (me.role !== 'owner') return {error: 'Only the owner can add people.'}
  const name = String(formData.get('name') || '').trim()
  const email = String(formData.get('email') || '').trim().toLowerCase()
  const role = formData.get('role') === 'owner' ? 'owner' : 'member'
  if (!name || !email) return {error: 'Fill in their name and email.'}

  const db = createAdminClient()
  const {data, error} = await db.auth.admin.createUser({email, email_confirm: true})
  if (error) return {error: error.message}
  const {error: insErr} = await db.from('team_members').insert({id: data.user.id, name, email, role})
  if (insErr) return {error: 'Account created but not added to the team. Try again.'}
  revalidatePath('/admin/team')
  const sent = await sendPasswordLink({email, name, invite: true})
  if (sent.error) return {error: `${name} was added, but the invite email didn’t send. Use “Send link” next to their name.`}
  return {ok: true, message: `Invite sent. ${name} will get an email to set their password.`}
}

// Owner re-sends the set-password email (expired invite, or someone who was added with a temporary password).
export async function resendInvite(formData) {
  const {me} = await requireMember()
  if (me.role !== 'owner') return {error: 'Only the owner can do that.'}
  const {data: m} = await createAdminClient().from('team_members').select('name, email').eq('id', String(formData.get('id'))).maybeSingle()
  if (!m) return {error: 'That person isn’t on the team.'}
  const sent = await sendPasswordLink({email: m.email, name: m.name, invite: true})
  return sent.error ? sent : {ok: true}
}

// "Forgot password?" on the sign-in page. Same answer whether or not the email is on the team.
export async function requestPasswordReset(_, formData) {
  const email = String(formData.get('email') || '').trim().toLowerCase()
  if (!email) return {error: 'Enter your email.'}
  const {data: m} = await createAdminClient().from('team_members').select('name, email').eq('email', email).maybeSingle()
  if (m) await sendPasswordLink({email: m.email, name: m.name})
  return {ok: true, message: 'If that email is on the Mint 35 team, a link to choose a new password is on its way.'}
}

// The set-password page: the one-time token signs them in, then their new password is saved.
export async function setPasswordWithToken(_, formData) {
  const token = String(formData.get('token') || '')
  const password = String(formData.get('password') || '')
  if (password.length < 10) return {error: 'Use at least 10 characters.'}
  if (password !== String(formData.get('confirm') || '')) return {error: 'The two passwords don’t match.'}
  const supabase = await createClient()
  const {data, error} = await supabase.auth.verifyOtp({token_hash: token, type: 'recovery'})
  if (error || !data?.user) return {error: 'This link has expired or was already used. Use “Forgot password?” on the sign-in page to get a new one.'}
  const {data: m} = await createAdminClient().from('team_members').select('id').eq('id', data.user.id).maybeSingle()
  if (!m) { await supabase.auth.signOut(); return {error: 'This account isn’t on the Mint 35 team.'} }
  const {error: upErr} = await supabase.auth.updateUser({password})
  if (upErr) return {error: upErr.message}
  redirect('/admin')
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
  revalidatePath('/admin/projects/[id]', 'layout')
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
  const {data: job} = await supabase.from('projects').select('number, qb_card_id, card_last4, card_brand, brief').eq('id', pending.project_id).single()
  let charged = false
  // Add-ons carry the job's sales tax too (none for exempt clients).
  const tax = decision === 'accepted' ? taxCents(patch.price_cents, jobTaxRate(job)) : 0
  if (decision === 'accepted' && patch.price_cents > 0 && job.qb_card_id && (await paymentsReady())) {
    try {
      const charge = await chargeCard({cardId: job.qb_card_id, amountCents: patch.price_cents + tax, description: `Mint 35 ${projectRef(job.number)} · add-on: ${pending.label}`})
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
      ? `<p>We've confirmed your request for <b>${esc(a.label)}</b>${a.details ? ` (${esc(a.details)})` : ''} at <b>${formatMoney(a.price_cents)}</b>${tax ? ` plus ${formatMoney(tax)} sales tax` : ''}.${charged ? ` Your ${esc(job.card_brand || 'card')} ending in ${esc(job.card_last4 || '••••')} was charged.` : ''}</p>`
      + (charged ? receipt({cents: a.price_cents + tax, taxCents: tax, brand: job.card_brand, last4: job.card_last4, chargeId: patch.charge_id, ref: projectRef(p.number), item: `Add-on: ${a.label}`}) : '')
      : `<p>We're not able to add <b>${esc(a.label)}</b> to this project. We'll be in touch if there's another option.</p>`)
      + `<p><a href="${link}">Open your project page</a></p><p>— The Mint 35 team</p>`,
  })
  revalidatePath('/admin/projects/[id]', 'layout')
  return {ok: true}
}

export async function disconnectQuickBooks() {
  if (!(await currentOwner())) redirect('/admin/settings')
  await qbDisconnect()
  revalidatePath('/admin/settings')
  redirect('/admin/settings')
}

// Discount codes (Admin → Discounts). Only the owner creates, edits or switches them.
// The terms of a code from the New code / Edit form; {error} when something is off.
function discountTerms(formData) {
  const kind = formData.get('kind') === 'amount' ? 'amount' : 'percent'
  const value = Number(String(formData.get('value') || '').replace(/[$,%\s]/g, ''))
  if (!(value > 0)) return {error: 'Enter how much it takes off.'}
  if (kind === 'percent' && value > 100) return {error: 'A percentage can’t be more than 100.'}
  const names = PACKAGES.map(p => p.name)
  const packages = formData.getAll('packages').filter(n => names.includes(n))
  if (!packages.length) return {error: 'Pick at least one package it works on.'}
  const maxRaw = String(formData.get('max_uses') || '').trim()
  const max_uses = maxRaw ? Math.floor(Number(maxRaw)) : null
  if (maxRaw && !(max_uses > 0)) return {error: 'Uses must be a whole number, or leave it blank for unlimited.'}
  const expires_on = formData.get('expires_on') || null
  const note = String(formData.get('note') || '').trim().slice(0, 300) || null
  return {terms: {kind, value, packages: packages.length === names.length ? [] : packages, max_uses, expires_on, note}}
}

export async function createDiscount(_, formData) {
  const {supabase, me} = await requireMember()
  if (me.role !== 'owner') return {error: 'Only the owner can create codes.'}
  const code = normalizeCode(formData.get('code'))
  if (!/^[A-Z0-9_-]{3,40}$/.test(code)) return {error: 'Use 3–40 letters or numbers for the code (no spaces).'}
  const {terms, error: bad} = discountTerms(formData)
  if (bad) return {error: bad}
  const {error} = await supabase.from('discount_codes').insert({code, ...terms, created_by: me.id})
  if (error) return {error: /duplicate|unique/i.test(error.message) ? 'That code already exists.' : 'Couldn’t save the code. Has the discounts database update been run?'}
  revalidatePath('/admin/discounts')
  return {ok: true, message: `${code} is ready to use.`}
}

// The code itself stays the same, so past orders still match it; everything else can change.
// Orders that already used it keep their price.
export async function updateDiscount(_, formData) {
  const {supabase, me} = await requireMember()
  if (me.role !== 'owner') return {error: 'Only the owner can change codes.'}
  const {terms, error: bad} = discountTerms(formData)
  if (bad) return {error: bad}
  const {error} = await supabase.from('discount_codes').update(terms).eq('id', String(formData.get('id')))
  if (error) return {error: 'Couldn’t save the changes. Try again.'}
  revalidatePath('/admin/discounts')
  return {ok: true, message: 'Saved.'}
}

export async function setDiscountActive(formData) {
  const {supabase, me} = await requireMember()
  if (me.role !== 'owner') return {error: 'Only the owner can change codes.'}
  await supabase.from('discount_codes').update({active: formData.get('active') === 'true'}).eq('id', String(formData.get('id')))
  revalidatePath('/admin/discounts')
  return {ok: true}
}
