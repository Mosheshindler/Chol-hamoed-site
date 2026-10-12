import {NextResponse} from 'next/server'
import {createAdminClient} from '@/lib/supabase/admin'
import {sendEmail, esc} from '@/lib/email'
import {projectRef, formatMoney} from '@/lib/status'
import {customerLink} from '@/lib/site'

// Step 2 of a submission: after the browser has uploaded files, link them to every job in the
// order and send one confirmation email. Guarded by the first job's intake token.
export async function POST(request, ctx) {
  const {id} = await ctx.params
  let body
  try { body = await request.json() } catch { return NextResponse.json({error: 'Invalid request.'}, {status: 400}) }

  const db = createAdminClient()
  const {data: first} = await db.from('projects')
    .select('id, order_id, intake_token, files_received')
    .eq('id', id).maybeSingle()
  if (!first || first.intake_token !== body.intakeToken) return NextResponse.json({error: 'Not found.'}, {status: 404})
  if (first.files_received) return NextResponse.json({ok: true})

  const {data: jobs} = first.order_id
    ? await db.from('projects').select('id, number, name, email, company, promoting, package, price_cents, customer_token').eq('order_id', first.order_id).order('order_item')
    : await db.from('projects').select('id, number, name, email, company, promoting, package, price_cents, customer_token').eq('id', id)

  const kinds = new Map((Array.isArray(body.files) ? body.files : []).map(f => [f.path, f]))
  const {data: listed} = await db.storage.from('project-files').list(`${id}/intake`, {limit: 100})
  const files = (listed || []).map(o => {
    const path = `${id}/intake/${o.name}`
    const meta = kinds.get(path)
    return {path, name: meta?.name || o.name.replace(/^\d+-/, ''), kind: meta?.kind === 'logo' ? 'logo' : 'brand_image', size: o.metadata?.size ?? null}
  })
  if (files.length) await db.from('project_files').insert(jobs.flatMap(j => files.map(f => ({...f, project_id: j.id}))))
  await db.from('projects').update({files_received: true}).in('id', jobs.map(j => j.id))

  const c = jobs[0]
  const site = new URL(request.url).origin
  const total = jobs.reduce((s, j) => s + (j.price_cents || 0), 0)
  const refs = jobs.map(j => projectRef(j.number))
  const lines = jobs.map(j => `<li><b>${projectRef(j.number)}</b> · ${esc(j.package || 'Package not chosen')} · ${j.price_cents ? formatMoney(j.price_cents) : 'quote'}<br>${esc(j.promoting)}</li>`).join('')
  const teamLinks = jobs.map(j => `<li><a href="${site}/admin/projects/${j.id}">Open ${projectRef(j.number)}</a></li>`).join('')

  await Promise.all([
    sendEmail({
      to: process.env.TEAM_NOTIFY_EMAIL || 'info@mintmediallc.com',
      replyTo: c.email,
      subject: `New Mint 35 ${jobs.length > 1 ? `order (${jobs.length} projects)` : 'request'} ${refs.join(', ')}: ${c.company || c.name}`,
      html: `<p><b>${esc(c.name)}</b>${c.company ? ` (${esc(c.company)})` : ''} submitted ${jobs.length > 1 ? `an order with ${jobs.length} projects` : 'a project'}.</p>
<ul>${lines}</ul><p><b>List total:</b> ${formatMoney(total)} · <b>Files:</b> ${files.length}</p><ul>${teamLinks}</ul>`,
    }),
    sendEmail({
      to: c.email,
      subject: `We got your Mint 35 order (${refs.join(', ')})`,
      html: `<p>Hi ${esc(c.name.split(' ')[0])},</p>
<p>Thanks for your order. Here's what we received:</p><ul>${lines}</ul>
<p><b>Total:</b> ${formatMoney(total)}</p>
<p>Our team will review it and email you next steps. Your card is only charged once your order enters our production queue.</p>
<p><a href="${customerLink(site, c.customer_token)}">Track your order on your project page</a></p>
<p>— The Mint 35 team</p>`,
    }),
  ])

  return NextResponse.json({ok: true, files: files.length})
}
